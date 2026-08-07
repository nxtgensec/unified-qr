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
      { name: "description", content: "Pending and paid Pro upgrade requests." },
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
      toast.success("Upgrade marked paid and Pro granted");
      void queryClient.invalidateQueries({ queryKey: ["admin-upgrades"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not update request"),
  });

  return (
    <AdminShell title="Upgrade requests" description="Pending and paid Pro upgrade requests.">
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
            <table className="w-full min-w-[760px] text-left text-small">
              <thead>
                <tr className="border-b border-border text-caption uppercase tracking-wider text-muted-foreground">
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
          <div className="space-y-3 md:hidden">
            {(data ?? []).length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-6 text-center text-small text-muted-foreground">
                No upgrade requests yet.
              </div>
            ) : (
              (data ?? []).map((r) => (
                <MobileCard
                  key={r.id}
                  request={r}
                  busy={mutation.isPending}
                  onMarkPaid={(term) => mutation.mutate({ upgradeId: r.id, term })}
                />
              ))
            )}
          </div>
        </>
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
  const pending = request.status === "pending";

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 text-small text-muted-foreground">
        {new Date(request.createdAt).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "2-digit",
        })}
      </td>
      <td className="px-4 py-3">
        <p className="font-medium">{request.email || "unknown"}</p>
        <p className="text-small text-muted-foreground">{request.orderId ?? "no order"}</p>
      </td>
      <td className="px-4 py-3 capitalize">{request.term ?? "—"}</td>
      <td className="px-4 py-3">
        {request.amount > 0 ? `${formatPaise(request.amount)} ${request.currency}` : "—"}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={request.status} />
      </td>
      <td className="px-4 py-3">
        {pending ? (
          <MarkPaid busy={busy} onMarkPaid={onMarkPaid} />
        ) : (
          <span className="text-small text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  );
}

function MobileCard({
  request,
  busy,
  onMarkPaid,
}: {
  request: AdminUpgradeRequest;
  busy: boolean;
  onMarkPaid: (term: BillingTerm) => void;
}) {
  const pending = request.status === "pending";

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-small font-medium">{request.email || "unknown"}</p>
          <p className="truncate text-small text-muted-foreground">
            {request.orderId ?? "no order"}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-small">
        <div>
          <dt className="text-muted-foreground">Created</dt>
          <dd className="mt-0.5">
            {new Date(request.createdAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "numeric",
              minute: "2-digit",
            })}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Term</dt>
          <dd className="mt-0.5 capitalize">{request.term ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Amount</dt>
          <dd className="mt-0.5">
            {request.amount > 0 ? `${formatPaise(request.amount)} ${request.currency}` : "—"}
          </dd>
        </div>
      </dl>
      {pending && (
        <div className="mt-3 border-t border-border pt-3">
          <MarkPaid busy={busy} onMarkPaid={onMarkPaid} />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const pending = status === "pending";
  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-small capitalize ${
        pending
          ? "border-warning/40 bg-warning/10 text-warning"
          : "border-success/40 bg-success/10 text-success"
      }`}
    >
      {status}
    </span>
  );
}

function MarkPaid({
  busy,
  onMarkPaid,
}: {
  busy: boolean;
  onMarkPaid: (term: BillingTerm) => void;
}) {
  const [term, setTerm] = useState<BillingTerm>("monthly");
  return (
    <div className="flex items-center gap-2">
      <select
        value={term}
        onChange={(e) => setTerm(e.target.value as BillingTerm)}
        className="h-btn rounded-btn border border-border bg-background px-4 text-body capitalize"
      >
        {TERMS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <Button variant="secondary" disabled={busy} onClick={() => onMarkPaid(term)}>
        Mark paid
      </Button>
    </div>
  );
}
