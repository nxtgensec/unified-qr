DROP POLICY IF EXISTS "profiles_own_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM authenticated;
GRANT SELECT ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "upgrade_requests_own_all" ON public.upgrade_requests;
REVOKE ALL ON public.upgrade_requests FROM anon;
REVOKE ALL ON public.upgrade_requests FROM authenticated;

REVOKE ALL ON public.qr_codes FROM anon;
REVOKE ALL ON public.qr_codes FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.qr_codes TO authenticated;

REVOKE ALL ON public.qr_scans FROM anon;
REVOKE ALL ON public.qr_scans FROM authenticated;
GRANT SELECT ON public.qr_scans TO authenticated;

REVOKE ALL ON public.visits FROM anon;
REVOKE ALL ON public.visits FROM authenticated;

REVOKE ALL ON public.admins FROM anon;
REVOKE ALL ON public.admins FROM authenticated;
