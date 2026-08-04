import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, Download, Pencil, Plus, QrCode, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { QrPreview } from "@/components/qr/QrPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteCode, listCodes, updateCode } from "@/lib/codes.functions";
import { buildQrSvg, downloadPng } from "@/lib/qr/render";
import { buildPayload, defaultStyle } from "@/lib/qr/types";
import type { QrContent, QrKind, QrStyle } from "@/lib/qr/types";

export const Route = createFileRoute("/_authenticated/codes")({
  head: () => ({
    meta: [
      { title: "My codes — Unified QR" },
      { name: "description", content: "Your saved QR codes, editable destinations and downloads." },
      { property: "og:title", content: "My codes — Unified QR" },
      {
        property: "og:description",
        content: "Your saved QR codes, editable destinations and downloads.",
      },
    ],
  }),
  component: CodesPage,
});

function CodesPage() {
  const fetchCodes = useServerFn(listCodes);
  const remove = useServerFn(deleteCode);
  const update = useServerFn(updateCode);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["codes"], queryFn: () => fetchCodes() });

  const removeMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["codes"] });
      toast.success("Code deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: string; targetUrl: string }) => update({ data: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["codes"] });
      setEditing(null);
      toast.success("Destination updated — the printed code still works");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const codes = data ?? [];

  return (
    <DashboardShell
      title="My codes"
      description="Dynamic destinations can be changed any time."
      actions={
        <Button size="sm" asChild>
          <Link to="/create">
            <Plus className="mr-2 h-4 w-4" /> New
          </Link>
        </Button>
      }
    >
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : codes.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <QrCode className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-4 text-sm">Your library is empty</p>
          <Button className="mt-6" size="sm" asChild>
            <Link to="/create">Create your first code</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {codes.map((code) => {
            const style = { ...defaultStyle, ...((code.style ?? {}) as Partial<QrStyle>) };
            const shortUrl =
              code.is_dynamic && code.slug
                ? `${typeof window === "undefined" ? "" : window.location.origin}/api/public/r/${code.slug}`
                : null;
            const payload = shortUrl
              ? shortUrl
              : buildPayload(code.kind as QrKind, (code.content ?? {}) as QrContent);
            const svg = buildQrSvg(payload || " ", style);

            return (
              <div key={code.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex gap-4">
                  <div className="h-24 w-24 shrink-0">
                    <QrPreview payload={payload || " "} style={style} size={192} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{code.name}</p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {code.kind}
                      {code.is_dynamic ? " · dynamic" : " · static"} · {code.scan_count} scans
                    </p>
                    {shortUrl && (
                      <button
                        className="mt-2 flex max-w-full items-center gap-1.5 truncate text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          void navigator.clipboard.writeText(shortUrl);
                          setCopied(code.id);
                          setTimeout(() => setCopied(null), 1500);
                        }}
                      >
                        {copied === code.id ? (
                          <Check className="h-3 w-3 shrink-0" />
                        ) : (
                          <Copy className="h-3 w-3 shrink-0" />
                        )}
                        <span className="truncate">/api/public/r/{code.slug}</span>
                      </button>
                    )}
                  </div>
                </div>

                {editing === code.id ? (
                  <div className="mt-4 flex gap-2">
                    <Input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="https://new-destination.com"
                    />
                    <Button
                      size="sm"
                      disabled={updateMutation.isPending}
                      onClick={() => updateMutation.mutate({ id: code.id, targetUrl: draft })}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => downloadPng(svg, code.name || "qr-code", 1024)}
                    >
                      <Download className="mr-2 h-3.5 w-3.5" /> PNG
                    </Button>
                    {code.is_dynamic && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditing(code.id);
                          setDraft(code.target_url ?? "");
                        }}
                      >
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Edit target
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeMutation.mutate(code.id)}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
