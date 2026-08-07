import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminOverview } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin overview — Unified QR" },
      { name: "description", content: "Platform-wide usage, revenue and pending requests." },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  const fetch = useServerFn(getAdminOverview);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetch(),
    staleTime: 30_000,
  });

  const max = useMemo(
    () => Math.max(1, ...(data?.last7DayScans ?? []).map((d) => d.count)),
    [data],
  );

  return (
    <AdminShell title="Overview" description="Platform-wide usage, revenue and pending requests.">
      {isLoading ? (
        <Skeleton className="h-72" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Users" value={data?.totals.users} />
            <Stat label="New users today" value={data?.totals.usersToday} />
            <Stat label="QR codes" value={data?.totals.codes} />
            <Stat label="Dynamic codes" value={data?.totals.dynamicCodes} />
            <Stat label="Total scans" value={data?.totals.scans} />
            <Stat label="Pro users" value={data?.totals.enterpriseUsers} />
            <Stat label="Visits today" value={data?.totals.visitsToday} />
            <Stat label="Total visits" value={data?.totals.visitsTotal} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-caption uppercase tracking-wider text-muted-foreground">
                Paid revenue
              </p>
              <p className="mt-2 text-h1 font-semibold tracking-tight">
                {data
                  ? new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format((data.totals.paidRevenuePaise ?? 0) / 100)
                  : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-caption uppercase tracking-wider text-muted-foreground">
                Pending upgrade requests
              </p>
              <p className="mt-2 text-h1 font-semibold tracking-tight">
                {data?.totals.pendingUpgrades ?? "—"}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <p className="text-caption uppercase tracking-wider text-muted-foreground">
              Scans — last 7 days
            </p>
            <div className="mt-6 flex h-40 items-end gap-[3px]">
              {(data?.last7DayScans ?? []).map((d) => (
                <div
                  key={d.date}
                  title={`${d.date}: ${d.count}`}
                  className="flex-1 rounded-sm bg-brand/70 transition-colors hover:bg-brand"
                  style={{ height: `${Math.max(2, (d.count / max) * 100)}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-small text-muted-foreground">
              <span>{data?.last7DayScans[0]?.date}</span>
              <span>{data?.last7DayScans[data.last7DayScans.length - 1]?.date}</span>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: number | null | undefined }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-caption uppercase tracking-wider text-muted-foreground">{label}</p>
      {value === undefined || value === null ? (
        <Skeleton className="mt-3 h-8 w-16" />
      ) : (
        <p className="mt-2 text-h1 font-semibold tracking-tight">{value.toLocaleString("en-US")}</p>
      )}
    </div>
  );
}
