DROP POLICY IF EXISTS "profiles_own_all" ON public.profiles;
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM authenticated;
GRANT SELECT ON public.profiles TO authenticated;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "upgrade_requests_own_all" ON public.upgrade_requests;
REVOKE ALL ON public.upgrade_requests FROM authenticated;
