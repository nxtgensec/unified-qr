import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Loader2, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { GoogleIcon } from "@/components/GoogleIcon";
import { Logo } from "@/components/Logo";
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
          "Sign in with Google to get Professional free forever — or upgrade to Enterprise for unlimited dynamic codes.",
      },
      { property: "og:title", content: "Sign in — Unified QR" },
      {
        property: "og:description",
        content:
          "Professional is free forever. Enterprise adds unlimited dynamic codes and bulk export.",
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
    <div className="relative flex min-h-screen items-center justify-center bg-background px-5">
      <div className="grid-noise pointer-events-none absolute inset-0 opacity-30" aria-hidden />
      <div className="relative w-full max-w-md">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to generator
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background">
            <Logo className="size-6" />
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Welcome to Unified QR</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with Google to start on Professional — free forever, no card and no trial timer.
            Upgrade to Enterprise anytime for unlimited dynamic codes.
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
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="h-4 w-4" />
            )}
            {loading ? "Connecting to Google…" : "Continue with Google"}
          </Button>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Professional — free forever
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <ul className="space-y-3">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
          By continuing you agree to Google's Terms of Service. Unified QR only receives your name,
          email and avatar — nothing else. No password, no credit card, no trial timer. Need more
          than 3 dynamic codes?{" "}
          <a
            href="/#pricing"
            className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
          >
            See Enterprise pricing
          </a>
          .
        </p>
      </div>
    </div>
  );
}
