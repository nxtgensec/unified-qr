CREATE TABLE IF NOT EXISTS public.admins (
  email text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.admins TO service_role;

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

INSERT INTO public.admins (email) VALUES ('kiransavireddy@gmail.com')
ON CONFLICT (email) DO NOTHING;
