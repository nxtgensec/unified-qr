CREATE TABLE IF NOT EXISTS public.visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  page text NOT NULL DEFAULT '/',
  device text,
  country text,
  referrer text,
  visit_date date NOT NULL DEFAULT CURRENT_DATE,
  visited_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (visitor_id, visit_date)
);
CREATE INDEX IF NOT EXISTS visits_visited_at_idx ON public.visits (visited_at DESC);
GRANT ALL ON public.visits TO service_role;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
