import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { LogOut, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { getMyPlan } from "@/lib/plans.functions";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Unified QR" },
      { name: "description", content: "Your Unified QR account, plan and session." },
      { property: "og:title", content: "Settings — Unified QR" },
      { property: "og:description", content: "Your Unified QR account, plan and session." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [email, setEmail] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchPlan = useServerFn(getMyPlan);
  const { data: plan, isLoading } = useQuery({
    queryKey: ["plan"],
    queryFn: () => fetchPlan(),
    staleTime: 60_000,
  });

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? ""));
  }, []);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  };

  const enterprise = plan?.plan === "enterprise";

  return (
    <DashboardShell title="Settings" description="Account, plan and session.">
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Signed in as</p>
        <p className="mt-2 text-sm">{email || "—"}</p>
        <p className="mt-1 text-xs text-muted-foreground">Google account</p>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Plan</p>
            {isLoading ? (
              <Skeleton className="mt-3 h-5 w-40" />
            ) : (
              <p className="mt-1 text-sm">
                {plan?.planName}
                <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                  {enterprise ? "Unlimited" : plan?.tagline}
                </span>
              </p>
            )}
          </div>
          {!enterprise && (
            <Button size="sm" onClick={() => setUpgradeOpen(true)}>
              <Sparkles className="mr-2 h-4 w-4" /> Upgrade to Enterprise
            </Button>
          )}
        </div>

        {!isLoading && (
          <dl className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Dynamic codes
              </dt>
              <dd className="mt-1 text-sm">
                {plan?.dynamicLimit == null
                  ? "Unlimited"
                  : `${plan?.dynamicUsed ?? 0} / ${plan?.dynamicLimit}`}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Scan history
              </dt>
              <dd className="mt-1 text-sm">
                {plan?.analyticsDays == null ? "Full history" : `Last ${plan?.analyticsDays} days`}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Bulk CSV export
              </dt>
              <dd className="mt-1 text-sm">{plan?.bulk ? "Included" : "Enterprise only"}</dd>
            </div>
          </dl>
        )}

        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          Codes never expire and scans are never capped on any plan. Upgrading or cancelling never
          recreates a code or breaks a printed one.
        </p>
        {enterprise && plan?.planUntil && (
          <p className="mt-3 text-xs text-muted-foreground">
            Enterprise access lasts until{" "}
            <span className="font-medium text-foreground">
              {new Date(plan.planUntil).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            . It doesn't auto-renew — purchase again to continue.
          </p>
        )}
      </div>

      <Button className="mt-6" variant="secondary" size="sm" onClick={() => void signOut()}>
        <LogOut className="mr-2 h-4 w-4" /> Sign out
      </Button>

      <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
        <a href="/privacy" className="transition-colors hover:text-foreground">
          Privacy
        </a>
        <span className="h-3 w-px bg-border" aria-hidden />
        <a href="/terms" className="transition-colors hover:text-foreground">
          Terms
        </a>
        <span className="h-3 w-px bg-border" aria-hidden />
        <a href="/payment" className="transition-colors hover:text-foreground">
          Payment
        </a>
        <span className="h-3 w-px bg-border" aria-hidden />
        <a href="/refunds" className="transition-colors hover:text-foreground">
          Refunds
        </a>
      </div>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </DashboardShell>
  );
}
