import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Unified QR" },
      { name: "description", content: "Your Unified QR account details and session." },
      { property: "og:title", content: "Settings — Unified QR" },
      { property: "og:description", content: "Your Unified QR account details and session." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? ""));
  }, []);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  };

  return (
    <DashboardShell title="Settings" description="Account and session.">
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Signed in as</p>
        <p className="mt-2 text-sm">{email || "—"}</p>
        <p className="mt-1 text-xs text-muted-foreground">Google account</p>
      </div>
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-medium">Plan</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Everything is free — dynamic codes, analytics, exports and bulk generation. No limits, no
          expiry.
        </p>
      </div>
      <Button className="mt-6" variant="secondary" size="sm" onClick={() => void signOut()}>
        <LogOut className="mr-2 h-4 w-4" /> Sign out
      </Button>
    </DashboardShell>
  );
}
