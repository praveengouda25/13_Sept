-- Additive Leave / Gate Pass repair for the live Hostel_Management schema.
-- Does not recreate tables or delete existing rows.
-- Several local migrations were never applied remotely, so this file is
-- idempotent and brings only these two modules in line with the ERP.

-- ---------------------------------------------------------------------------
-- Leave: soft-delete column expected by deleteRecord
-- ---------------------------------------------------------------------------
ALTER TABLE public.leave_requests
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_leave_requests_active
  ON public.leave_requests(branch_id, from_date)
  WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- Gate pass: columns the form and workflow already use
-- ---------------------------------------------------------------------------
ALTER TABLE public.student_gate_passes
  ADD COLUMN IF NOT EXISTS actual_exit_time timestamptz,
  ADD COLUMN IF NOT EXISTS parent_contact text,
  ADD COLUMN IF NOT EXISTS emergency_contact text,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS rejected_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS marked_exit_by uuid REFERENCES public.profiles(id);

CREATE INDEX IF NOT EXISTS idx_gate_passes_rejected_by
  ON public.student_gate_passes(rejected_by) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_gate_passes_marked_exit_by
  ON public.student_gate_passes(marked_exit_by) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- Helpers used by gate-pass RLS (missing on the live database)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_security(_user_id uuid, _branch_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role::text = 'security_guard'
      AND (
        ur.branch_id = _branch_id
        OR (
          ur.trust_id IS NOT NULL
          AND ur.trust_id = (SELECT trust_id FROM public.branches WHERE id = _branch_id)
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_gate(_user_id uuid, _branch_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.can_manage_branch_ops(_user_id, _branch_id)
      OR public.is_security(_user_id, _branch_id);
$$;

REVOKE ALL ON FUNCTION public.is_security(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_manage_gate(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_security(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_gate(uuid, uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- Gate pass RLS: keep reads branch-scoped; writes for ops + security;
-- deletes only for branch/trust admins.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS gate_passes_write ON public.student_gate_passes;
DROP POLICY IF EXISTS gate_passes_insert ON public.student_gate_passes;
DROP POLICY IF EXISTS gate_passes_update ON public.student_gate_passes;
DROP POLICY IF EXISTS gate_passes_delete ON public.student_gate_passes;
DROP POLICY IF EXISTS gate_passes_select ON public.student_gate_passes;

CREATE POLICY gate_passes_select ON public.student_gate_passes
  FOR SELECT TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY gate_passes_insert ON public.student_gate_passes
  FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_gate(auth.uid(), branch_id));

CREATE POLICY gate_passes_update ON public.student_gate_passes
  FOR UPDATE TO authenticated
  USING (public.can_manage_gate(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_gate(auth.uid(), branch_id));

CREATE POLICY gate_passes_delete ON public.student_gate_passes
  FOR DELETE TO authenticated
  USING (public.can_admin_branch(auth.uid(), branch_id));

-- ---------------------------------------------------------------------------
-- Database-level status transitions (not only hidden UI buttons)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_gate_pass_workflow()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  is_security boolean;
  is_approver boolean;
BEGIN
  SELECT EXISTS (
           SELECT 1 FROM public.user_roles
           WHERE user_id = auth.uid() AND role::text = 'security_guard'
         ),
         EXISTS (
           SELECT 1 FROM public.user_roles
           WHERE user_id = auth.uid()
             AND role IN ('super_admin', 'trust_admin', 'branch_admin', 'warden')
         )
    INTO is_security, is_approver;

  IF TG_OP = 'INSERT' THEN
    IF NEW.status IS DISTINCT FROM 'pending' THEN
      RAISE EXCEPTION 'New gate passes must start as pending';
    END IF;
    IF NOT is_approver THEN
      RAISE EXCEPTION 'Only authorized hostel staff can create gate passes';
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.status = 'out' AND NEW.actual_exit_time IS DISTINCT FROM OLD.actual_exit_time THEN
    RAISE EXCEPTION 'Exit has already been marked for this gate pass';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT (
         (OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected'))
      OR (OLD.status = 'approved' AND NEW.status = 'out')
      OR (OLD.status IN ('out', 'late_return') AND NEW.status IN ('returned', 'late_return'))
      OR (OLD.status = 'returned' AND NEW.status = 'closed')
    ) THEN
      RAISE EXCEPTION 'Invalid gate pass status transition from % to %', OLD.status, NEW.status;
    END IF;

    IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') AND NOT is_approver THEN
      RAISE EXCEPTION 'Only an authorized warden or administrator can approve or reject a gate pass';
    ELSIF OLD.status = 'approved' AND NEW.status = 'out' AND NOT (is_security OR is_approver) THEN
      RAISE EXCEPTION 'Only security staff can verify exit';
    ELSIF OLD.status IN ('out', 'late_return') AND NEW.status = 'returned' AND NOT (is_security OR is_approver) THEN
      RAISE EXCEPTION 'Only security staff can verify return';
    ELSIF OLD.status = 'returned' AND NEW.status = 'closed' AND NOT is_approver THEN
      RAISE EXCEPTION 'Only authorized hostel staff can close a gate pass';
    ELSIF is_security AND NOT is_approver AND NEW.status NOT IN ('out', 'returned', 'late_return') THEN
      RAISE EXCEPTION 'Security staff may only verify exit and return';
    END IF;
  ELSIF is_security AND NOT is_approver AND (
    (to_jsonb(NEW) - ARRAY['status', 'actual_exit_time', 'actual_return_time', 'security_id', 'marked_exit_by', 'updated_at'])
      IS DISTINCT FROM
    (to_jsonb(OLD) - ARRAY['status', 'actual_exit_time', 'actual_return_time', 'security_id', 'marked_exit_by', 'updated_at'])
  ) THEN
    RAISE EXCEPTION 'Security staff may only update a gate pass by changing its status';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS gate_pass_workflow_guard ON public.student_gate_passes;
CREATE TRIGGER gate_pass_workflow_guard
  BEFORE INSERT OR UPDATE ON public.student_gate_passes
  FOR EACH ROW EXECUTE FUNCTION public.enforce_gate_pass_workflow();

NOTIFY pgrst, 'reload schema';
