-- Gate-pass audit fields, strict transition metadata, and admin-only deletion.
-- This migration is additive and preserves all existing rows.

ALTER TABLE public.student_gate_passes
  ADD COLUMN IF NOT EXISTS emergency_contact text,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS rejected_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS marked_exit_by uuid REFERENCES public.profiles(id);

ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_gate_passes_rejected_by
  ON public.student_gate_passes(rejected_by) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_gate_passes_marked_exit_by
  ON public.student_gate_passes(marked_exit_by) WHERE deleted_at IS NULL;

-- Existing reads and state changes remain branch-scoped. Destructive actions are
-- separate and restricted to branch/trust administrators.
DROP POLICY IF EXISTS gate_passes_write ON public.student_gate_passes;
DROP POLICY IF EXISTS gate_passes_insert ON public.student_gate_passes;
DROP POLICY IF EXISTS gate_passes_update ON public.student_gate_passes;
DROP POLICY IF EXISTS gate_passes_delete ON public.student_gate_passes;

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

CREATE INDEX IF NOT EXISTS idx_attendance_active ON public.attendance(branch_id, attendance_date)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leave_requests_active ON public.leave_requests(branch_id, from_date)
  WHERE deleted_at IS NULL;

NOTIFY pgrst, 'reload schema';
