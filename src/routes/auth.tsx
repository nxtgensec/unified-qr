import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Unified QR" },
      {
        name: "description",
        content: "Sign in with Google to unlock every Unified QR feature, free.",
      },
      { property: "og:title", content: "Sign in — Unified QR" },
      { property: "og:description", content: "One Google sign-in unlocks the full QR toolset." },
    ],
  }),
  component: AuthPage,
});

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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
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
      <div className="relative w-full max-w-sm">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to generator
        </Link>
        <div className="rounded-2xl border border-border bg-card p-8">
          <QrCode className="h-6 w-6" />
          <h1 className="mt-6 text-xl font-semibold tracking-tight">Sign in to Unified QR</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything stays free. Signing in saves your codes and unlocks dynamic links, analytics
            and every code type.
          </p>
          <Button
            className="mt-8 w-full"
            size="lg"
            disabled={loading}
            onClick={() => void signIn()}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Continue with Google
          </Button>
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Google is the only sign-in method — no passwords to remember.
          </p>
        </div>
      </div>
    </div>
  );
}
