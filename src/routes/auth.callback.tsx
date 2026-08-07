import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const code = new URLSearchParams(window.location.search).get("code");
      if (!code) {
        await navigate({ to: "/auth", replace: true });
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("[Supabase] Auth callback failed:", error);
        await navigate({ to: "/auth", replace: true });
        return;
      }

      await navigate({ to: "/dashboard", replace: true });
    };

    void handleCallback();
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-gutter">
      <div className="grid-noise pointer-events-none absolute inset-0 opacity-30" aria-hidden />
      <div className="relative flex flex-col items-center gap-4 text-center">
        <Logo className="size-8" />
        <Loader2 className="size-icon-md animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Completing sign-in…</p>
      </div>
    </div>
  );
}
