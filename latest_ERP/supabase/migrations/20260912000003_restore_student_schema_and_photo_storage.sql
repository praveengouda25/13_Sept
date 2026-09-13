-- Restore the Student module schema and its private photo storage on the
-- currently configured Supabase project. This is additive and preserves data.

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS father_name text,
  ADD COLUMN IF NOT EXISTS father_mobile text,
  ADD COLUMN IF NOT EXISTS father_occupation text,
  ADD COLUMN IF NOT EXISTS father_aadhaar text,
  ADD COLUMN IF NOT EXISTS father_pan text,
  ADD COLUMN IF NOT EXISTS mother_name text,
  ADD COLUMN IF NOT EXISTS mother_mobile text,
  ADD COLUMN IF NOT EXISTS mother_occupation text,
  ADD COLUMN IF NOT EXISTS guardian_name text,
  ADD COLUMN IF NOT EXISTS guardian_mobile text,
  ADD COLUMN IF NOT EXISTS guardian_relationship text,
  ADD COLUMN IF NOT EXISTS school_name text,
  ADD COLUMN IF NOT EXISTS religion text,
  ADD COLUMN IF NOT EXISTS caste text,
  ADD COLUMN IF NOT EXISTS nationality text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS aadhaar_number text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS taluk text,
  ADD COLUMN IF NOT EXISTS village text,
  ADD COLUMN IF NOT EXISTS custom_village text,
  ADD COLUMN IF NOT EXISTS pincode text;

-- Ensure PostgREST sees the newly added columns immediately after deployment.
NOTIFY pgrst, 'reload schema';

-- Keep the bucket private. The frontend stores paths and resolves them with
-- signed URLs, so no public bucket or public write policy is required.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-photos',
  'student-photos',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Students can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Students can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Students can update photos" ON storage.objects;
DROP POLICY IF EXISTS "Staff can delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Staff can view student photos" ON storage.objects;
DROP POLICY IF EXISTS "Staff can upload student photos" ON storage.objects;
DROP POLICY IF EXISTS "Staff can update student photos" ON storage.objects;
DROP POLICY IF EXISTS "Staff can delete student photos" ON storage.objects;
DROP POLICY IF EXISTS student_photos_select ON storage.objects;
DROP POLICY IF EXISTS student_photos_insert ON storage.objects;
DROP POLICY IF EXISTS student_photos_update ON storage.objects;
DROP POLICY IF EXISTS student_photos_delete ON storage.objects;

CREATE POLICY student_photos_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'student-photos' AND public.is_staff(auth.uid()));

CREATE POLICY student_photos_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'student-photos' AND public.is_staff(auth.uid()));

CREATE POLICY student_photos_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'student-photos' AND public.is_staff(auth.uid()))
  WITH CHECK (bucket_id = 'student-photos' AND public.is_staff(auth.uid()));

CREATE POLICY student_photos_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'student-photos' AND public.is_staff(auth.uid()));
