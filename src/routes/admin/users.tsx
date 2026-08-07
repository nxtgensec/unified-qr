import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { listAdminUsers, type AdminUser } from "@/lib/admin.functions";

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
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by email, name or id…"
        className="mb-4 w-full max-w-sm"
      />
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
            <table className="w-full min-w-[720px] text-left text-small">
              <thead>
                <tr className="border-b border-border text-caption uppercase tracking-wider text-muted-foreground">
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
                        <p className="text-small text-muted-foreground">{u.email || "no email"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-border px-2 py-0.5 text-small capitalize">
                          {u.plan}
                        </span>
                        {u.planUntil && (
                          <p className="mt-1 text-small text-muted-foreground">
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
                          <span className="text-success">{u.paidUpgrades} paid</span>
                        ) : null}
                        {u.pendingUpgrades > 0 ? (
                          <span className="ml-1 text-warning">{u.pendingUpgrades} pending</span>
                        ) : null}
                        {u.paidUpgrades === 0 && u.pendingUpgrades === 0 ? (
                          <span className="text-muted-foreground">none</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-small text-muted-foreground">
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
          <div className="space-y-3 md:hidden">
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-6 text-center text-small text-muted-foreground">
                No users found.
              </div>
            ) : (
              filtered.map((u) => <UserCard key={u.id} user={u} />)
            )}
          </div>
        </>
      )}
    </AdminShell>
  );
}

function UserCard({ user }: { user: AdminUser }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-small font-medium">{user.fullName || "—"}</p>
          <p className="truncate text-small text-muted-foreground">{user.email || "no email"}</p>
        </div>
        <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-small capitalize">
          {user.plan}
        </span>
      </div>
      {user.planUntil && (
        <p className="mt-1 text-small text-muted-foreground">
          Pro until{" "}
          {new Date(user.planUntil).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      )}
      <dl className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2 text-small">
        <div>
          <dt className="text-muted-foreground">Codes</dt>
          <dd className="mt-0.5">{user.codes}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Dynamic</dt>
          <dd className="mt-0.5">{user.dynamic}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Scans</dt>
          <dd className="mt-0.5">{user.scans}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Upgrades</dt>
          <dd className="mt-0.5">
            {user.paidUpgrades > 0 ? (
              <span className="text-success">{user.paidUpgrades} paid</span>
            ) : null}
            {user.pendingUpgrades > 0 ? (
              <span className="ml-1 text-warning">{user.pendingUpgrades} pending</span>
            ) : null}
            {user.paidUpgrades === 0 && user.pendingUpgrades === 0 ? (
              <span className="text-muted-foreground">none</span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Joined</dt>
          <dd className="mt-0.5">
            {new Date(user.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </dd>
        </div>
      </dl>
    </div>
  );
}
