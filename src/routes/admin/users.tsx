import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { Skeleton } from "@/components/ui/skeleton";
import { listAdminUsers } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Users — Unified QR" },
      { name: "description", content: "Every account, plan and usage on the platform." },
    ],
  }),
  component: AdminUsers,
});

function AdminUsers() {
  const fetch = useServerFn(listAdminUsers);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetch(),
    staleTime: 30_000,
  });
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();
  const filtered = (data ?? []).filter(
    (u) =>
      !query ||
      (u.email ?? "").toLowerCase().includes(query) ||
      (u.fullName ?? "").toLowerCase().includes(query) ||
      u.id.toLowerCase().includes(query),
  );

  return (
    <AdminShell title="Users" description="Every account, plan and usage on the platform.">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by email, name or id…"
        className="mb-4 w-full max-w-sm rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Codes</th>
                <th className="px-4 py-3 font-medium">Dynamic</th>
                <th className="px-4 py-3 font-medium">Scans</th>
                <th className="px-4 py-3 font-medium">Upgrades</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{u.fullName || "—"}</p>
                      <p className="text-xs text-muted-foreground">{u.email || "no email"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-border px-2 py-0.5 text-[11px] capitalize">
                        {u.plan}
                      </span>
                      {u.planUntil && (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          until{" "}
                          {new Date(u.planUntil).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">{u.codes}</td>
                    <td className="px-4 py-3">{u.dynamic}</td>
                    <td className="px-4 py-3">{u.scans}</td>
                    <td className="px-4 py-3">
                      {u.paidUpgrades > 0 ? (
                        <span className="text-emerald-400">{u.paidUpgrades} paid</span>
                      ) : null}
                      {u.pendingUpgrades > 0 ? (
                        <span className="ml-1 text-amber-400">{u.pendingUpgrades} pending</span>
                      ) : null}
                      {u.paidUpgrades === 0 && u.pendingUpgrades === 0 ? (
                        <span className="text-muted-foreground">none</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
