import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download, Loader2, LogOut, Sparkles, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { UpgradeDialog } from "@/components/plan/UpgradeDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { exportBackup, toBackupCode } from "@/lib/backup";
import type { BackupCode } from "@/lib/backup";
import { importCodes, listCodes } from "@/lib/codes.functions";
import { getMyPlan, verifyCashfreePayment } from "@/lib/plans.functions";
import { toast } from "sonner";

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
  const [backupBusy, setBackupBusy] = useState<"json" | "csv" | "zip" | null>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchPlan = useServerFn(getMyPlan);
  const fetchCodes = useServerFn(listCodes);
  const verifyPayment = useServerFn(verifyCashfreePayment);
  const { data: plan, isLoading } = useQuery({
    queryKey: ["plan"],
    queryFn: () => fetchPlan(),
    staleTime: 60_000,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id");
    if (!orderId) return;
    void (async () => {
      try {
        await verifyPayment({ data: { orderId } });
        toast.success("Welcome to Enterprise!");
        void queryClient.invalidateQueries({ queryKey: ["plan"] });
        void queryClient.invalidateQueries({ queryKey: ["codes"] });
        void queryClient.invalidateQueries({ queryKey: ["analytics"] });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Payment could not be verified.");
      } finally {
        const url = new URL(window.location.href);
        url.searchParams.delete("order_id");
        url.searchParams.delete("order_status");
        window.history.replaceState({}, "", url.toString());
      }
    })();
  }, [verifyPayment, queryClient]);

  const importMutation = useMutation({
    mutationFn: (codes: unknown) => importCodes({ data: { codes } }),
    onSuccess: (res) => {
      toast.success(
        res.failed > 0
          ? `Imported ${res.imported} code(s), skipped ${res.failed}`
          : `Imported ${res.imported} code(s)`,
      );
      void queryClient.invalidateQueries({ queryKey: ["codes"] });
    },
    onError: (error) => toast.error(error.message || "Import failed"),
  });

  const onExport = async (format: "json" | "csv" | "zip") => {
    setBackupBusy(format);
    try {
      const rows = await fetchCodes();
      const codes: BackupCode[] = rows.map((row) => toBackupCode(row as never));
      const res = await exportBackup(codes, format);
      toast.success(`Exported ${res.count} code(s) as ${res.name}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setBackupBusy(null);
    }
  };

  const onImportFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as unknown;
        const codes = Array.isArray(parsed) ? parsed : (parsed as { codes?: unknown }).codes;
        if (!Array.isArray(codes) || codes.length === 0) {
          toast.error("No codes found in that file");
          return;
        }
        importMutation.mutate(codes);
      } catch {
        toast.error("Could not read that backup file");
      }
    };
    reader.readAsText(file);
  };

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
              <Sparkles className="mr-2 size-icon-sm" /> Upgrade to Enterprise
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
              {new Date(plan.planUntil).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
            . It doesn't auto-renew — purchase again to continue.
          </p>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-medium">Backup &amp; restore</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Export your whole library as JSON, CSV, or a ZIP that also includes every QR image — or
          re-import a JSON backup any time.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={backupBusy != null}
            onClick={() => void onExport("json")}
          >
            {backupBusy === "json" ? (
              <Loader2 className="mr-2 size-icon-sm animate-spin" />
            ) : (
              <Download className="mr-2 size-icon-sm" />
            )}
            JSON
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={backupBusy != null}
            onClick={() => void onExport("csv")}
          >
            {backupBusy === "csv" ? (
              <Loader2 className="mr-2 size-icon-sm animate-spin" />
            ) : (
              <Download className="mr-2 size-icon-sm" />
            )}
            CSV
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={backupBusy != null}
            onClick={() => void onExport("zip")}
          >
            {backupBusy === "zip" ? (
              <Loader2 className="mr-2 size-icon-sm animate-spin" />
            ) : (
              <Download className="mr-2 size-icon-sm" />
            )}
            ZIP + images
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={importMutation.isPending}
            onClick={() => importRef.current?.click()}
          >
            {importMutation.isPending ? (
              <Loader2 className="mr-2 size-icon-sm animate-spin" />
            ) : (
              <Upload className="mr-2 size-icon-sm" />
            )}
            Restore from JSON
          </Button>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              onImportFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <Button className="mt-6" variant="secondary" size="sm" onClick={() => void signOut()}>
        <LogOut className="mr-2 size-icon-sm" /> Sign out
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
