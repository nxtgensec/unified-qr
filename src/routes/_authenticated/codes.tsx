import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, Download, Pencil, Plus, QrCode, Search, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { QrPreview } from "@/components/qr/QrPreview";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
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
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "dynamic" | "static">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["codes"],
    queryFn: () => fetchCodes(),
    staleTime: 30_000,
  });

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

  const favoriteMutation = useMutation({
    mutationFn: (input: { id: string; favorite: boolean }) => update({ data: input }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["codes"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const codes = (data ?? []).filter((code) => {
    if (filter === "dynamic" && !code.is_dynamic) return false;
    if (filter === "static" && code.is_dynamic) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const matches =
        code.name.toLowerCase().includes(q) ||
        code.kind.toLowerCase().includes(q) ||
        (code.slug ?? "").toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });

  return (
    <DashboardShell
      title="My codes"
      description="Dynamic destinations can be changed any time."
      actions={
        <Button size="sm" asChild>
          <Link to="/create">
            <Plus /> New
          </Link>
        </Button>
      }
    >
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : (data?.length ?? 0) === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <QrCode className="mx-auto size-icon-md text-muted-foreground" />
          <p className="mt-4 text-small">Your library is empty</p>
          <Button className="mt-6" size="sm" asChild>
            <Link to="/create">Create your first code</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-icon-sm -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search codes…"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "dynamic", "static"] as const).map((f) => (
                <Chip
                  key={f}
                  type="button"
                  variant={filter === f ? "active" : "default"}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </Chip>
              ))}
            </div>
          </div>

          {codes.length === 0 ? (
            <div className="mt-4 rounded-xl border border-border bg-card p-10 text-center text-small text-muted-foreground">
              No codes match your search.
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-small font-medium">{code.name}</p>
                          <button
                            type="button"
                            aria-label={code.favorite ? "Unfavorite" : "Favorite"}
                            onClick={() =>
                              favoriteMutation.mutate({
                                id: code.id,
                                favorite: !code.favorite,
                              })
                            }
                            className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <Star
                              className={`size-icon-sm ${
                                code.favorite ? "fill-brand text-brand" : ""
                              }`}
                            />
                          </button>
                        </div>
                        <p className="text-small capitalize text-muted-foreground">
                          {code.kind}
                          {code.is_dynamic ? " · dynamic" : " · static"} · {code.scan_count} scans
                          {code.expires_at && (
                            <>
                              {" "}
                              · expires{" "}
                              {new Date(code.expires_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </>
                          )}
                        </p>
                        {shortUrl && (
                          <button
                            className="mt-1 flex min-h-11 max-w-full items-center gap-1.5 rounded-nav px-2 text-small text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            onClick={() => {
                              void navigator.clipboard.writeText(shortUrl);
                              setCopied(code.id);
                              setTimeout(() => setCopied(null), 1500);
                            }}
                          >
                            {copied === code.id ? (
                              <Check className="size-icon-xs shrink-0" />
                            ) : (
                              <Copy className="size-icon-xs shrink-0" />
                            )}
                            <span className="truncate">/api/public/r/{code.slug}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {editing === code.id ? (
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <Input
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          placeholder="https://new-destination.com"
                          className="sm:flex-1"
                        />
                        <div className="flex gap-2">
                          <Button
                            disabled={updateMutation.isPending}
                            onClick={() => updateMutation.mutate({ id: code.id, targetUrl: draft })}
                          >
                            Save
                          </Button>
                          <Button variant="ghost" onClick={() => setEditing(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => downloadPng(svg, code.name || "qr-code", 1024)}
                        >
                          <Download /> PNG
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
                            <Pencil /> Edit target
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeMutation.mutate(code.id)}
                        >
                          <Trash2 /> Delete
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}
