-- Add approval and entry audit data to the existing visitors table.
-- Existing visitor rows and the existing table are preserved.

DO $$
BEGIN
  ALTER TYPE public.visitor_status ADD VALUE IF NOT EXISTS 'pending';
  ALTER TYPE public.visitor_status ADD VALUE IF NOT EXISTS 'approved';
  ALTER TYPE public.visitor_status ADD VALUE IF NOT EXISTS 'rejected';
  ALTER TYPE public.visitor_status ADD VALUE IF NOT EXISTS 'entered';
END $$;

ALTER TABLE public.visitors
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

CREATE INDEX IF NOT EXISTS idx_visitors_status ON public.visitors(branch_id, status)
  WHERE deleted_at IS NULL;

DROP POLICY IF EXISTS visitors_manage ON public.visitors;
CREATE POLICY visitors_manage ON public.visitors
  FOR ALL TO authenticated
  USING (public.can_manage_gate(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_gate(auth.uid(), branch_id));

NOTIFY pgrst, 'reload schema';
