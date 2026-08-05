import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminVisits } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/visits")({
  head: () => ({
    meta: [
      { title: "Site visits — Unified QR" },
      { name: "description", content: "Visitor counts by day, page, device and country." },
    ],
  }),
  component: AdminVisits,
});

function AdminVisits() {
  const fetch = useServerFn(getAdminVisits);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-visits"],
    queryFn: () => fetch(),
    staleTime: 30_000,
  });

  const max = useMemo(() => Math.max(1, ...(data?.last14Days ?? []).map((d) => d.count)), [data]);

  return (
    <AdminShell title="Site visits" description="Visitor counts by day, page, device and country.">
      {isLoading ? (
        <Skeleton className="h-72" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label="Visits today" value={data?.today} />
            <Stat label="Total visits" value={data?.total} />
          </div>

          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Visits — last 14 days
            </p>
            <div className="mt-6 flex h-40 items-end gap-[3px]">
              {(data?.last14Days ?? []).map((d) => (
                <div
                  key={d.date}
                  title={`${d.date}: ${d.count}`}
                  className="flex-1 rounded-sm bg-primary/70 transition-colors hover:bg-primary"
                  style={{ height: `${Math.max(2, (d.count / max) * 100)}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>{data?.last14Days[0]?.date}</span>
              <span>{data?.last14Days[data.last14Days.length - 1]?.date}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Breakdown title="By page" items={data?.byPage ?? []} />
            <Breakdown title="By device" items={data?.byDevice ?? []} />
            <Breakdown title="By country" items={data?.byCountry ?? []} />
          </div>
        </>
      )}
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: number | null | undefined }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">
        {value === undefined || value === null ? "—" : value.toLocaleString("en-US")}
      </p>
    </div>
  );
}

function Breakdown({ title, items }: { title: string; items: [string, number][] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <ul className="mt-4 space-y-2 text-sm">
          {items.map(([name, count]) => (
            <li key={name} className="flex justify-between gap-3">
              <span className="truncate">{name}</span>
              <span className="text-muted-foreground">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
