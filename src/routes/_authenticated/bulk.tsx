import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import JSZip from "jszip";
import { Layers, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { QrPreview } from "@/components/qr/QrPreview";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getMyPlan } from "@/lib/plans.functions";
import { buildQrSvg, renderPngBlob } from "@/lib/qr/render";
import { defaultStyle } from "@/lib/qr/types";

export const Route = createFileRoute("/_authenticated/bulk")({
  head: () => ({
    meta: [
      { title: "Bulk generator — Unified QR" },
      { name: "description", content: "Paste a list of links and generate a batch of QR codes." },
      { property: "og:title", content: "Bulk generator — Unified QR" },
      {
        property: "og:description",
        content: "Paste a list of links and generate a batch of QR codes.",
      },
    ],
  }),
  component: BulkPage,
});

function BulkPage() {
  const [raw, setRaw] = useState("");
  const [rows, setRows] = useState<{ name: string; value: string }[]>([]);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const fetchPlan = useServerFn(getMyPlan);
  const { data: plan, isLoading } = useQuery({
    queryKey: ["plan"],
    queryFn: () => fetchPlan(),
    staleTime: 60_000,
  });

  const generate = () => {
    const parsed = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [a, b] = line.split(",").map((p) => p.trim());
        return b ? { name: a ?? "", value: b } : { name: a ?? "", value: a ?? "" };
      });
    setRows(parsed);
  };

  return (
    <DashboardShell
      title="Bulk CSV"
      beta
      description="One row per code: name,value — or just a value."
    >
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : plan?.bulk ? (
        <>
          <Textarea
            rows={7}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={"Homepage,https://example.com\nMenu,https://example.com/menu"}
          />
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={generate} disabled={!raw.trim()}>
              Generate {raw.trim() ? `(${raw.trim().split("\n").length})` : ""}
            </Button>
            {rows.length > 0 && (
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  try {
                    toast.info("Preparing ZIP...");
                    const zip = new JSZip();
                    await Promise.all(
                      rows.map(async (r, i) => {
                        const svg = buildQrSvg(r.value, defaultStyle, 1024);
                        const blob = await renderPngBlob(svg, 1024);
                        const safe = (r.name || `qr-${i + 1}`).replace(/[\\/:*?"<>|]/g, "-").trim();
                        zip.file(`${safe || `qr-${i + 1}`}.png`, blob);
                      }),
                    );
                    const zipBlob = await zip.generateAsync({ type: "blob" });
                    const url = URL.createObjectURL(zipBlob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "qr-codes.zip";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                    toast.success("ZIP downloaded");
                  } catch {
                    toast.error("Could not create ZIP");
                  }
                }}
              >
                Download ZIP
              </Button>
            )}
          </div>

          {rows.length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {rows.map((r, i) => (
                <div
                  key={`${r.value}-${i}`}
                  className="rounded-xl border border-border bg-card p-3"
                >
                  <QrPreview payload={r.value} style={defaultStyle} size={220} />
                  <p className="mt-3 truncate text-xs">{r.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{r.value}</p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <Layers className="mx-auto h-6 w-6 text-muted-foreground" />
          <h2 className="mt-4 text-base font-medium">Bulk CSV is an Enterprise feature</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Generate a whole batch of codes in one pass with the Enterprise plan — from ₹9/day.
          </p>
          <Button className="mt-6" size="sm" onClick={() => setUpgradeOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" /> Upgrade to Enterprise
          </Button>
        </div>
      )}
      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </DashboardShell>
  );
}
