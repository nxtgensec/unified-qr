import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, BarChart3, Layers, Plus, QrCode, ScanLine } from "lucide-react";

import { BetaBadge } from "@/components/BetaBadge";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { listCodes } from "@/lib/codes.functions";

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
  const fetchCodes = useServerFn(listCodes);
  const { data, isLoading } = useQuery({ queryKey: ["codes"], queryFn: () => fetchCodes() });

  const codes = data ?? [];
  const scans = codes.reduce((sum, c) => sum + (c.scan_count ?? 0), 0);
  const dynamic = codes.filter((c) => c.is_dynamic).length;

  return (
    <DashboardShell
      title="Overview"
      description="Everything unlocked. Nothing expires."
      actions={
        <Button size="sm" asChild>
          <Link to="/create">
            <Plus className="mr-2 h-4 w-4" /> New code
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Saved codes" value={isLoading ? null : codes.length} />
        <Stat label="Total scans" value={isLoading ? null : scans} />
        <Stat label="Dynamic codes" value={isLoading ? null : dynamic} />
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium">Recent codes</h2>
          <Link to="/codes" className="text-xs text-muted-foreground hover:text-foreground">
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
              <QrCode className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-4 text-sm">No codes yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create your first one — it takes about ten seconds.
              </p>
              <Button className="mt-6" size="sm" asChild>
                <Link to="/create">
                  Create a code <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            codes.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between border-b border-border px-5 py-3 text-sm last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.name}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {c.kind}
                    {c.is_dynamic ? " · dynamic" : ""}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{c.scan_count} scans</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
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
        <ToolCard to="/decode" icon={ScanLine} title="Decode" body="Read an existing QR image." />
      </div>
    </DashboardShell>
  );
}

function Stat({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      {value === null ? (
        <Skeleton className="mt-3 h-8 w-16" />
      ) : (
        <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
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
  to: "/analytics" | "/bulk" | "/decode";
  icon: typeof BarChart3;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-ring"
    >
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div className="mt-4 flex items-center gap-2">
        <p className="text-sm font-medium">{title}</p>
        <BetaBadge />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
    </Link>
  );
}
