import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BarChart3 } from "lucide-react";
import { useMemo } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Skeleton } from "@/components/ui/skeleton";
import { getAnalytics } from "@/lib/codes.functions";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Unified QR" },
      {
        name: "description",
        content: "Scan counts, devices and countries for your dynamic codes.",
      },
      { property: "og:title", content: "Analytics — Unified QR" },
      {
        property: "og:description",
        content: "Scan counts, devices and countries for your dynamic codes.",
      },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const fetch = useServerFn(getAnalytics);
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => fetch(),
    staleTime: 60_000,
  });

  const days = useMemo(() => {
    const windowDays = data?.analyticsDays ?? 30;
    const buckets = new Map<string, number>();
    const scanDates = (data?.scans ?? []).map((s) => new Date(s.scanned_at));

    if (Number.isFinite(windowDays)) {
      for (let i = windowDays - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        buckets.set(localDateKey(d), 0);
      }
    } else if (scanDates.length > 0) {
      const min = scanDates.reduce((a, b) => (a < b ? a : b));
      const max = scanDates.reduce((a, b) => (a > b ? a : b));
      const end = new Date(max);
      end.setHours(0, 0, 0, 0);
      const start = new Date(min);
      start.setHours(0, 0, 0, 0);
      const span = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
      const capped = Math.min(span, 180);
      const startCap = new Date(end.getTime() - (capped - 1) * 86400000);
      startCap.setHours(0, 0, 0, 0);
      for (let d = new Date(startCap); d <= end; d.setDate(d.getDate() + 1)) {
        buckets.set(localDateKey(d), 0);
      }
    }

    for (const s of scanDates) {
      const key = localDateKey(s);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return [...buckets.entries()].map(([date, count]) => ({ date, count }));
  }, [data]);

  const devices = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of data?.scans ?? []) {
      const key = s.device ?? "unknown";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [data]);

  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((s, d) => s + d.count, 0);
  const windowLabel =
    data?.analyticsDays != null && Number.isFinite(data.analyticsDays)
      ? `Last ${data.analyticsDays} days across all your dynamic codes.`
      : "Full scan history across all your dynamic codes.";

  return (
    <DashboardShell title="Analytics" beta description={windowLabel}>
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Scans</p>
              <p className="text-2xl font-semibold tracking-tight">{total}</p>
            </div>
            <div className="mt-6 flex h-40 items-end gap-[3px]">
              {days.map((d) => (
                <div
                  key={d.date}
                  title={`${d.date}: ${d.count}`}
                  className="flex-1 rounded-sm bg-primary/70 transition-colors hover:bg-primary"
                  style={{ height: `${Math.max(2, (d.count / max) * 100)}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>{days[0]?.date}</span>
              <span>{days[days.length - 1]?.date}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">By device</p>
              {devices.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">No scans recorded yet.</p>
              ) : (
                <ul className="mt-4 space-y-2 text-sm">
                  {devices.map(([name, count]) => (
                    <li key={name} className="flex justify-between capitalize">
                      <span>{name}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Top codes</p>
              {(data?.codes ?? []).length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  <BarChart3 className="mb-2 h-4 w-4" />
                  Create a dynamic code to start collecting scans.
                </p>
              ) : (
                <ul className="mt-4 space-y-2 text-sm">
                  {(data?.codes ?? []).slice(0, 6).map((c) => (
                    <li key={c.id} className="flex justify-between gap-3">
                      <span className="truncate">{c.name}</span>
                      <span className="text-muted-foreground">{c.scan_count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
