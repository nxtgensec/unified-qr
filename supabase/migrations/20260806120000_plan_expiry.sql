ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_until timestamptz;

ALTER TABLE public.upgrade_requests
  ADD COLUMN IF NOT EXISTS term text;
