import { Check, Copy, Download, Lock, RefreshCw, Search, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { QrPreview } from "@/components/qr/QrPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buildQrSvg, downloadPng, renderPngBlob } from "@/lib/qr/render";
import { KINDS, buildPayload, defaultStyle } from "@/lib/qr/types";
import type { QrContent, QrKind } from "@/lib/qr/types";
import { cn } from "@/lib/utils";

interface HeroStudioProps {
  onLocked: () => void;
}

const HERO_GROUPS: { title: string; kinds: QrKind[] }[] = [
  { title: "Popular", kinds: ["url", "text", "wifi", "vcard"] },
  { title: "Business", kinds: ["googlereview", "trustpilot", "yelp", "booking", "coupon"] },
  {
    title: "Social & messaging",
    kinds: ["whatsapp", "telegram", "instagram", "tiktok", "facebook", "x", "social", "sms"],
  },
  { title: "Payments", kinds: ["upi", "paypal", "bitcoin", "ethereum", "solana", "litecoin"] },
  { title: "Productivity", kinds: ["email", "event", "geo", "phone"] },
  { title: "More", kinds: ["app", "youtube", "linkedin", "dogecoin", "monero"] },
];

const CUSTOMIZE = ["Color", "Logo", "Shape", "Gradient", "Eyes", "Frame", "Tracking"] as const;

const STATUS = ["No watermark", "Never expires", "Privacy first", "Instant generation"] as const;

const DEMO_STYLE = defaultStyle;

function luminance(hex: string) {
  const value = hex.replace("#", "");
  const rgb = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  const linear = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * linear(rgb[0]!) + 0.7152 * linear(rgb[1]!) + 0.0722 * linear(rgb[2]!);
}

function contrastRatio(a: string, b: string) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function HeroStudio({ onLocked }: HeroStudioProps) {
  const [kind, setKind] = useState<QrKind>("url");
  const [content, setContent] = useState<QrContent>({ url: "" });
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const meta = useMemo(() => KINDS.find((k) => k.kind === kind) ?? KINDS[0]!, [kind]);

  const payload = buildPayload(kind, content);
  const trimmed = payload.trim();

  const quality = useMemo(() => {
    let score = 100;
    if (DEMO_STYLE.ecc === "L") score -= 10;
    else if (DEMO_STYLE.ecc === "M") score -= 2;
    else if (DEMO_STYLE.ecc === "Q") score -= 1;
    const contrast = contrastRatio(DEMO_STYLE.fg, DEMO_STYLE.bg);
    if (contrast < 3) score -= 25;
    else if (contrast < 4.5) score -= 8;
    if (DEMO_STYLE.margin < 2) score -= 12;
    return score;
  }, []);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HERO_GROUPS;
    const kinds = HERO_GROUPS.flatMap((g) => g.kinds).filter((k) =>
      (KINDS.find((m) => m.kind === k)?.label ?? "").toLowerCase().includes(q),
    );
    return [{ title: "Results", kinds }];
  }, [query]);

  const select = (next: QrKind) => {
    const nextMeta = KINDS.find((k) => k.kind === next);
    if (nextMeta?.proOnly) return onLocked();
    setKind(next);
    setContent({});
  };

  const onPng = async () => {
    if (!trimmed) {
      toast.error("Add some content first");
      return;
    }
    const fileSlug = meta.label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    try {
      await downloadPng(buildQrSvg(trimmed, DEMO_STYLE, 1024), fileSlug);
      toast.success("Downloaded PNG");
    } catch {
      toast.error("Could not export this code");
    }
  };

  const onCopy = async () => {
    if (!trimmed) {
      toast.error("Add some content first");
      return;
    }
    try {
      const blob = await renderPngBlob(buildQrSvg(trimmed, DEMO_STYLE, 512), 512);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      toast.success("Image copied — paste it anywhere");
    } catch {
      try {
        await navigator.clipboard.writeText(trimmed);
        setCopied(true);
        toast.success("Content copied");
      } catch {
        toast.error("Could not copy");
      }
    }
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="relative rounded-3xl border border-border bg-elevated p-4 shadow-2xl shadow-black/50 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-3">
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          Live generator
        </span>
        <span className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="hidden items-center gap-1 sm:inline-flex">
            <Zap className="h-3 w-3" /> 0ms generation
          </span>
          <span className="inline-flex items-center gap-1">
            <RefreshCw className="h-3 w-3" /> Updates instantly
          </span>
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search QR type…"
              className="h-9 bg-background pl-8 text-xs"
            />
          </div>
          <div className="max-h-[430px] space-y-3 overflow-y-auto pr-1">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="px-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </p>
                <div className="mt-1 space-y-0.5">
                  {group.kinds.map((k) => {
                    const kMeta = KINDS.find((m) => m.kind === k)!;
                    const active = k === kind;
                    const locked = Boolean(kMeta.proOnly);
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => select(k)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-all duration-200",
                          active
                            ? "border-primary bg-primary text-primary-foreground shadow-[0_2px_16px_rgba(0,0,0,0.4)]"
                            : "border-transparent text-muted-foreground hover:border-border hover:bg-card hover:text-foreground",
                          locked && "opacity-60",
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 shrink-0 rounded-full",
                              active ? "bg-primary-foreground" : "bg-border",
                            )}
                          />
                          <span className="truncate">{kMeta.label}</span>
                        </span>
                        {locked && <Lock className="h-3 w-3 shrink-0 opacity-70" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 space-y-3">
          <div className="space-y-2">
            {meta.fields.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{field.label}</Label>
                {field.type === "textarea" ? (
                  <Textarea
                    value={content[field.name] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) => setContent((c) => ({ ...c, [field.name]: e.target.value }))}
                    rows={3}
                    className="bg-background"
                  />
                ) : (
                  <Input
                    value={content[field.name] ?? ""}
                    type={field.type ?? "text"}
                    placeholder={field.placeholder}
                    onChange={(e) => setContent((c) => ({ ...c, [field.name]: e.target.value }))}
                    className="bg-background"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-white p-3 shadow-xl shadow-black/40">
            <QrPreview
              payload={trimmed || " "}
              style={DEMO_STYLE}
              size={512}
              className="rounded-xl border-0"
            />
            <div className="mt-2.5 flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1 font-medium text-neutral-700">
                <Check className="h-3 w-3" /> Print ready
              </span>
              <span className="font-semibold text-neutral-800">{quality}/100 quality</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button type="button" size="sm" onClick={() => void onPng()}>
              <Download className="h-3.5 w-3.5" /> PNG
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={onLocked}>
              <Lock className="h-3.5 w-3.5" /> SVG
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => void onCopy()}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Customize
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {CUSTOMIZE.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={onLocked}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                >
                  <Lock className="h-3 w-3" /> {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-3">
        {STATUS.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground"
          >
            <Check className="h-3 w-3 text-foreground" /> {item}
          </span>
        ))}
      </div>
    </div>
  );
}
