import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  adminMarkUpgradePaid,
  listAdminUpgradeRequests,
  type AdminUpgradeRequest,
} from "@/lib/admin.functions";
import { formatPaise } from "@/lib/plans";
import type { BillingTerm } from "@/lib/plans";

export const Route = createFileRoute("/admin/upgrades")({
  head: () => ({
    meta: [
      { title: "Upgrade requests — Unified QR" },
      { name: "description", content: "Pending and paid Enterprise upgrade requests." },
    ],
  }),
  component: AdminUpgrades,
});

const TERMS: BillingTerm[] = ["daily", "weekly", "monthly", "yearly"];

function AdminUpgrades() {
  const fetch = useServerFn(listAdminUpgradeRequests);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-upgrades"],
    queryFn: () => fetch(),
    staleTime: 30_000,
  });

  const markPaid = useServerFn(adminMarkUpgradePaid);
  const mutation = useMutation({
    mutationFn: (input: { upgradeId: string; term: BillingTerm }) => markPaid({ data: input }),
    onSuccess: () => {
      toast.success("Upgrade marked paid and Enterprise granted");
      void queryClient.invalidateQueries({ queryKey: ["admin-upgrades"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not update request"),
  });

  return (
    <AdminShell
      title="Upgrade requests"
      description="Pending and paid Enterprise upgrade requests."
    >
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Term</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No upgrade requests yet.
                  </td>
                </tr>
              ) : (
                (data ?? []).map((r) => (
                  <Row
                    key={r.id}
                    request={r}
                    busy={mutation.isPending}
                    onMarkPaid={(term) => mutation.mutate({ upgradeId: r.id, term })}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

function Row({
  request,
  busy,
  onMarkPaid,
}: {
  request: AdminUpgradeRequest;
  busy: boolean;
  onMarkPaid: (term: BillingTerm) => void;
}) {
  const [term, setTerm] = useState<BillingTerm>((request.term as BillingTerm | null) ?? "monthly");
  const pending = request.status === "pending";

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {new Date(request.createdAt).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "2-digit",
        })}
      </td>
      <td className="px-4 py-3">
        <p className="font-medium">{request.email || "unknown"}</p>
        <p className="text-[11px] text-muted-foreground">{request.orderId ?? "no order"}</p>
      </td>
      <td className="px-4 py-3 capitalize">{request.term ?? "—"}</td>
      <td className="px-4 py-3">
        {request.amount > 0 ? `${formatPaise(request.amount)} ${request.currency}` : "—"}
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full border px-2 py-0.5 text-[11px] capitalize ${
            pending
              ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {request.status}
        </span>
      </td>
      <td className="px-4 py-3">
        {pending ? (
          <div className="flex items-center gap-2">
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value as BillingTerm)}
              className="rounded-lg border border-input bg-background px-2 py-1.5 text-xs capitalize focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {TERMS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => onMarkPaid(term)}>
              Mark paid
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  );
}
