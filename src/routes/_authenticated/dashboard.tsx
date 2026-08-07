import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  BarChart3,
  Check,
  Copy,
  Download,
  Layers,
  Plus,
  QrCode,
  ScanLine,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { UpgradeDialog } from "@/components/plan/UpgradeDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMyCodes } from "@/lib/client-queries";
import { getMyPlan } from "@/lib/plans.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Unified QR" },
      { name: "description", content: "Your QR codes, scans and tools in one overview." },
      { property: "og:title", content: "Dashboard — Unified QR" },
      { property: "og:description", content: "Your QR codes, scans and tools in one overview." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [copied, setCopied] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const fetchPlan = useServerFn(getMyPlan);
  const { data: plan, isLoading: planLoading } = useQuery({
    queryKey: ["plan"],
    queryFn: () => fetchPlan(),
    staleTime: 60_000,
  });
  const { data, isLoading } = useQuery({
    queryKey: ["codes"],
    queryFn: fetchMyCodes,
    staleTime: 30_000,
  });

  const codes = data ?? [];
  const scans = codes.reduce((sum, c) => sum + (c.scan_count ?? 0), 0);
  const dynamic = codes.filter((c) => c.is_dynamic).length;

  return (
    <DashboardShell
      title="Overview"
      description="Your codes, scans and tools at a glance — nothing ever expires."
      actions={
        <Button size="sm" asChild>
          <Link to="/create">
            <Plus /> New code
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Saved codes" value={isLoading ? null : codes.length} />
        <Stat label="Total scans" value={isLoading ? null : scans} />
        <Stat label="Dynamic codes" value={isLoading ? null : dynamic} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5">
        <div>
          <p className="text-caption uppercase tracking-wider text-muted-foreground">Your plan</p>
          {planLoading ? (
            <Skeleton className="mt-3 h-5 w-44" />
          ) : (
            <p className="mt-1 text-small font-medium">
              {plan?.planName}
              {plan?.plan === "enterprise" && plan.planUntil && (
                <span className="ml-2 text-small font-normal text-muted-foreground">
                  active until{" "}
                  {new Date(plan.planUntil).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </p>
          )}
        </div>
        {!planLoading && plan?.plan !== "enterprise" && (
          <Button size="sm" onClick={() => setUpgradeOpen(true)}>
            <Sparkles /> Upgrade to Pro
          </Button>
        )}
      </div>

      <div className="mt-10">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-small font-medium">Recent codes</h2>
          <Link
            to="/codes"
            className="flex min-h-11 items-center rounded-nav px-3 text-small text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            View all
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-card">
          {isLoading ? (
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ) : codes.length === 0 ? (
            <div className="p-10 text-center">
              <QrCode className="mx-auto size-icon-md text-muted-foreground" />
              <p className="mt-4 text-small">No codes yet</p>
              <p className="mt-1 text-small text-muted-foreground">
                Create your first one — it takes about ten seconds.
              </p>
              <Button className="mt-6" size="sm" asChild>
                <Link to="/create">
                  Create a code <ArrowRight />
                </Link>
              </Button>
            </div>
          ) : (
            codes.slice(0, 5).map((c) => {
              const shareUrl =
                c.is_dynamic && c.slug
                  ? `${typeof window === "undefined" ? "" : window.location.origin}/api/public/r/${c.slug}`
                  : null;
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 border-b border-border px-5 py-3 text-small last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.name}</p>
                    <p className="text-small capitalize text-muted-foreground">
                      {c.kind}
                      {c.is_dynamic ? " · dynamic" : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {shareUrl && (
                      <button
                        type="button"
                        className="flex min-h-11 items-center gap-1.5 rounded-nav px-2.5 text-small text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        onClick={() => {
                          void navigator.clipboard.writeText(shareUrl);
                          setCopied(c.id);
                          toast.success("Share link copied");
                          setTimeout(() => setCopied(null), 1500);
                        }}
                      >
                        {copied === c.id ? (
                          <Check className="size-icon-xs" />
                        ) : (
                          <Copy className="size-icon-xs" />
                        )}
                        Share
                      </button>
                    )}
                    <span className="px-2 text-small text-muted-foreground">
                      {c.scan_count} scans
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ToolCard
          to="/analytics"
          icon={BarChart3}
          title="Analytics"
          body="Scans over time and by device."
        />
        <ToolCard
          to="/bulk"
          icon={Layers}
          title="Bulk CSV"
          body="Generate a whole batch at once."
        />
        <ToolCard
          to="/settings"
          icon={Download}
          title="Backup"
          body="Export your library or restore a backup."
        />
        <ToolCard to="/decode" icon={ScanLine} title="Decode" body="Read an existing QR image." />
      </div>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </DashboardShell>
  );
}

function Stat({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-caption uppercase tracking-wider text-muted-foreground">{label}</p>
      {value === null ? (
        <Skeleton className="mt-3 h-8 w-16" />
      ) : (
        <p className="mt-2 text-h1 font-semibold tracking-tight">{value}</p>
      )}
    </div>
  );
}

function ToolCard({
  to,
  icon: Icon,
  title,
  body,
}: {
  to: "/analytics" | "/bulk" | "/decode" | "/settings";
  icon: typeof BarChart3;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-ring"
    >
      <Icon className="size-icon-md text-muted-foreground" />
      <div className="mt-4 flex items-center gap-2">
        <p className="text-small font-medium">{title}</p>
      </div>
      <p className="mt-1 text-small text-muted-foreground">{body}</p>
    </Link>
  );
}
