import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Loader2, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { GoogleIcon } from "@/components/brand/GoogleIcon";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Unified QR" },
      {
        name: "description",
        content:
          "Sign in with Google to get the free Community plan forever — or upgrade to Pro for unlimited dynamic codes.",
      },
      { property: "og:title", content: "Sign in — Unified QR" },
      {
        property: "og:description",
        content: "Community is free forever. Pro adds unlimited dynamic codes and bulk export.",
      },
    ],
  }),
  component: AuthPage,
});

const BENEFITS = [
  "Save and edit your QR codes",
  "3 dynamic links you can redirect anytime",
  "30 days of scan analytics",
  "Unlimited static codes, no watermark",
];

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const signIn = async () => {
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) {
        toast.error(error.message || "Could not sign in. Please try again.");
        setLoading(false);
        return;
      }
    } catch {
      toast.error("Could not sign in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-gutter py-10">
      <div className="grid-noise pointer-events-none absolute inset-0 opacity-30" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border" aria-hidden />
      <div className="relative w-full max-w-md">
        <Link
          to="/"
          className="mb-8 inline-flex h-11 items-center gap-2 rounded-full px-3 text-small text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-icon-xs" /> Back to generator
        </Link>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-10">
          <div className="scan-beam pointer-events-none hidden opacity-40 sm:block" aria-hidden />
          <div className="flex size-11 items-center justify-center rounded-xl bg-background ring-1 ring-brand/40">
            <Logo className="size-6" />
          </div>

          <h1 className="mt-6 text-h1 font-semibold tracking-tight">Welcome to Unified QR</h1>
          <p className="mt-2 text-body text-muted-foreground">
            Sign in with Google to start free — no card, no trial timer and no lock-in. Upgrade to
            Pro anytime for unlimited dynamic codes.
          </p>

          <Button
            type="button"
            variant="google"
            size="lg"
            className="mt-8 w-full"
            disabled={loading}
            onClick={() => void signIn()}
          >
            {loading ? (
              <Loader2 className="size-icon-sm animate-spin" />
            ) : (
              <GoogleIcon className="size-icon-sm" />
            )}
            {loading ? "Connecting to Google…" : "Continue with Google"}
          </Button>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-caption uppercase tracking-wider text-muted-foreground">
              Free — forever
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <ul className="space-y-3">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5 text-small">
                <Check className="mt-0.5 size-icon-sm shrink-0 text-brand" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-small leading-relaxed text-muted-foreground">
          By continuing you agree to Google's Terms of Service. Unified QR only receives your name,
          email and avatar — nothing else. No password, no credit card, no trial timer. Need more
          than 3 dynamic codes?{" "}
          <Link
            to="/"
            hash="pricing"
            className="font-medium text-brand underline-offset-4 transition-colors hover:underline"
          >
            See Pro pricing
          </Link>
          .
        </p>
        <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-small text-muted-foreground">
          <Link
            to="/privacy"
            className="rounded px-1 py-1.5 transition-colors hover:text-foreground"
          >
            Privacy
          </Link>
          <span className="h-3 w-px bg-border" aria-hidden />
          <Link to="/terms" className="rounded px-1 py-1.5 transition-colors hover:text-foreground">
            Terms
          </Link>
          <span className="h-3 w-px bg-border" aria-hidden />
          <Link
            to="/payment"
            className="rounded px-1 py-1.5 transition-colors hover:text-foreground"
          >
            Payment
          </Link>
          <span className="h-3 w-px bg-border" aria-hidden />
          <Link
            to="/refunds"
            className="rounded px-1 py-1.5 transition-colors hover:text-foreground"
          >
            Refunds
          </Link>
          <span className="h-3 w-px bg-border" aria-hidden />
          <Link
            to="/contact"
            className="rounded px-1 py-1.5 transition-colors hover:text-foreground"
          >
            Contact
          </Link>
        </nav>
      </div>
    </div>
  );
}
