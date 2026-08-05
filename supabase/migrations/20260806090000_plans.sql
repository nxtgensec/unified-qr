ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_tier text NOT NULL DEFAULT 'professional';
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_tier_check CHECK (plan_tier IN ('professional', 'enterprise'));

CREATE TABLE public.upgrade_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_tier text NOT NULL DEFAULT 'enterprise',
  status text NOT NULL DEFAULT 'pending',
  amount integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX upgrade_requests_user_id_idx ON public.upgrade_requests (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.upgrade_requests TO authenticated;
GRANT ALL ON public.upgrade_requests TO service_role;
ALTER TABLE public.upgrade_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "upgrade_requests_own_all" ON public.upgrade_requests FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER upgrade_requests_updated_at BEFORE UPDATE ON public.upgrade_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
