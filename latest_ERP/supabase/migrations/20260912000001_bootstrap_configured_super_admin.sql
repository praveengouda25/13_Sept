-- Keep the configured ERP owner as Super Admin when the account is created.
-- The email comparison is case-insensitive and does not expose credentials.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, is_active)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NULL), NEW.email, TRUE)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    is_active = TRUE,
    updated_at = now();

  IF lower(COALESCE(NEW.email, '')) = 'praveengoudru25@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role, branch_id) DO NOTHING;
  ELSIF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_handle_new_user ON auth.users;
CREATE TRIGGER trg_handle_new_user
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

DO $$
DECLARE
  configured_user_id uuid;
BEGIN
  SELECT id INTO configured_user_id
  FROM auth.users
  WHERE lower(email) = 'praveengoudru25@gmail.com'
  LIMIT 1;

  IF configured_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (configured_user_id, 'super_admin')
    ON CONFLICT (user_id, role, branch_id) DO NOTHING;

    UPDATE public.profiles
    SET email = 'praveengoudru25@gmail.com', is_active = TRUE, updated_at = now()
    WHERE id = configured_user_id;
  END IF;
END $$;