import {
  Check,
  ChevronDown,
  Copy,
  Download,
  ImageIcon,
  Loader2,
  Lock,
  RefreshCw,
  Save,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DynamicOptions, type RedirectRulesInput } from "@/components/qr/DynamicOptions";
import { QrPreview } from "@/components/qr/QrPreview";
import {
  buildQrEps,
  buildQrSvg,
  analyzeQr,
  downloadEps,
  downloadPdf,
  downloadPng,
  downloadSvg,
  renderPngBlob,
  slugify,
} from "@/lib/qr/render";
import { KINDS, PRESETS, buildPayload, defaultStyle } from "@/lib/qr/types";
import type {
  CornerStyle,
  DotStyle,
  Ecc,
  FrameKind,
  GradientType,
  LogoPlate,
  QrContent,
  QrKind,
  QrStyle,
} from "@/lib/qr/types";
import { cn } from "@/lib/utils";

export interface StudioValue {
  name: string;
  kind: QrKind;
  content: QrContent;
  style: QrStyle;
  isDynamic: boolean;
  slug: string | null;
  password?: string;
  expiresAt?: string | null;
  redirectRules?: RedirectRulesInput | null;
}

interface QrStudioProps {
  mode: "free" | "full";
  initial?: Partial<StudioValue>;
  saving?: boolean;
  onSave?: (value: StudioValue) => void;
  onLocked?: () => void;
}

interface SavedDesign {
  id: string;
  name: string;
  style: QrStyle;
  updatedAt: number;
}

const DESIGNS_KEY = "unified-qr:my-designs";

function loadDesigns(): SavedDesign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DESIGNS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedDesign[];
    return Array.isArray(parsed) ? parsed.slice(0, 12) : [];
  } catch {
    return [];
  }
}

function opaque(s: QrStyle): QrStyle {
  return s.transparentBg ? { ...s, transparentBg: false } : s;
}

const SHAPES: DotStyle[] = ["square", "rounded", "dots", "diamond", "circle"];
const EYE_SHAPES: CornerStyle[] = ["square", "rounded", "circle", "diamond"];
const LOGO_PLATES: LogoPlate[] = ["none", "rounded", "circle"];
const EXPORT_SIZES = [512, 1024, 2048] as const;

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const ECCS: Ecc[] = ["L", "M", "Q", "H"];
const GRADIENTS: GradientType[] = ["none", "linear", "radial"];
const FRAMES: FrameKind[] = ["none", "scan-me", "visit-us", "pay-here", "call-us", "download-app"];
const SWATCHES = ["#000000", "#111827", "#1d4ed8", "#047857", "#b91c1c", "#7c3aed"];
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function QrStudio({ mode, initial, saving, onSave, onLocked }: QrStudioProps) {
  const full = mode === "full";
  const [kind, setKind] = useState<QrKind>(initial?.kind ?? "url");
  const [content, setContent] = useState<QrContent>(initial?.content ?? { url: "" });
  const [style, setStyle] = useState<QrStyle>({ ...defaultStyle, ...(initial?.style ?? {}) });
  const [name, setName] = useState(initial?.name ?? "");
  const [isDynamic, setIsDynamic] = useState(initial?.isDynamic ?? false);
  const [slug] = useState<string>(initial?.slug ?? slugify());
  const [password, setPassword] = useState(initial?.password ?? "");
  const [expiresAt, setExpiresAt] = useState(
    initial?.expiresAt ? toLocalInput(initial.expiresAt) : "",
  );
  const [rules, setRules] = useState<RedirectRulesInput | null>(initial?.redirectRules ?? null);
  const [exportSize, setExportSize] = useState<number>(1024);
  const [designs, setDesigns] = useState<SavedDesign[]>(loadDesigns);
  const fileRef = useRef<HTMLInputElement>(null);

  const meta = useMemo(() => KINDS.find((k) => k.kind === kind) ?? KINDS[0]!, [kind]);

  const shortUrl =
    typeof window === "undefined" ? "" : `${window.location.origin}/api/public/r/${slug}`;
  const dynamicOn = full && isDynamic && kind === "url";
  const payload = dynamicOn ? shortUrl : buildPayload(kind, content);

  const filename = (name || meta.label || "unified-qr").toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const download = async (format: "png" | "svg" | "pdf" | "eps") => {
    if (!payload.trim()) {
      toast.error("Add some content first");
      return;
    }
    try {
      const svg = buildQrSvg(payload, style, exportSize);
      if (format === "png") {
        await downloadPng(svg, filename, exportSize);
      } else {
        if (!full) return onLocked?.();
        if (format === "svg") downloadSvg(svg, filename);
        else if (format === "pdf")
          await downloadPdf(buildQrSvg(payload, opaque(style), exportSize), filename, exportSize);
        else downloadEps(buildQrEps(payload, opaque(style)), filename);
      }
      toast.success(`Downloaded ${format.toUpperCase()}`);
    } catch {
      toast.error("Could not export this code");
    }
  };

  const saveDesign = () => {
    const design: SavedDesign = {
      id: slugify(),
      name: name || meta.label,
      style: { ...defaultStyle, ...style },
      updatedAt: Date.now(),
    };
    const next = [design, ...designs].slice(0, 12);
    try {
      window.localStorage.setItem(DESIGNS_KEY, JSON.stringify(next));
    } catch {
      toast.error("Could not save design");
      return;
    }
    setDesigns(next);
    toast.success("Design saved");
  };

  const applyDesign = (saved: QrStyle) => setStyle((s) => ({ ...s, ...saved }));

  const deleteDesign = (id: string) => {
    const next = designs.filter((d) => d.id !== id);
    try {
      window.localStorage.setItem(DESIGNS_KEY, JSON.stringify(next));
    } catch {
      return;
    }
    setDesigns(next);
  };

  const copyImage = async () => {
    if (!payload.trim()) {
      toast.error("Add some content first");
      return;
    }
    try {
      const blob = await renderPngBlob(buildQrSvg(payload, style, 512), 512);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast.success("Image copied — paste it anywhere");
    } catch {
      try {
        await navigator.clipboard.writeText(payload.trim());
        toast.success("Content copied");
      } catch {
        toast.error("Could not copy");
      }
    }
  };

  const pickLogo = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 512 * 1024) {
      toast.error("Please use a logo under 500 KB");
      return;
    }
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) {
      toast.error("Please choose a PNG, JPG, WebP or GIF image");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setStyle((s) => ({ ...s, logo: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const pickPhoto = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 128;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setContent((c) => ({ ...c, photo: canvas.toDataURL("image/jpeg", 0.6) }));
        toast.success("Photo added — the code is denser but still scannable");
      };
      img.onerror = () => toast.error("Could not read that image");
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const selectKind = (next: QrKind, locked: boolean) => {
    if (locked) return onLocked?.();
    setKind(next);
    setContent({});
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            What should it do
          </Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {KINDS.map((k) => {
              const locked = !full && Boolean(k.proOnly);
              const active = k.kind === kind;
              return (
                <button
                  key={k.kind}
                  type="button"
                  onClick={() => selectKind(k.kind, locked)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-ring hover:text-foreground",
                    locked && "opacity-60",
                  )}
                >
                  {locked && <Lock className="size-icon-2xs" />}
                  {k.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">{meta.hint}</p>
          {dynamicOn ? (
            <Field
              label="Destination URL"
              value={content["destination"] ?? ""}
              placeholder="https://example.com/landing"
              onChange={(v) => setContent((c) => ({ ...c, destination: v }))}
            />
          ) : (
            meta.fields.map((f) => {
              if (f.type?.startsWith("select:")) {
                const options = f.type.slice(7).split(",");
                return (
                  <SelectField
                    key={f.name}
                    label={f.label}
                    value={content[f.name] ?? ""}
                    options={options}
                    onChange={(v) => setContent((c) => ({ ...c, [f.name]: v }))}
                  />
                );
              }
              if (f.type === "file") {
                return (
                  <div key={f.name} className="space-y-2">
                    <Label className="text-xs text-muted-foreground">{f.label}</Label>
                    <div className="flex items-center gap-3">
                      {content[f.name] ? (
                        <img
                          src={content[f.name]}
                          alt="Contact photo"
                          className="h-12 w-12 rounded-lg border border-border object-cover"
                        />
                      ) : null}
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileRef.current?.click()}
                      >
                        {content[f.name] ? "Replace photo" : "Add photo"}
                      </Button>
                      {content[f.name] && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setContent((c) => ({ ...c, photo: "" }))}
                        >
                          <X className="mr-2 size-icon-xs" /> Remove
                        </Button>
                      )}
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => pickPhoto(e.target.files?.[0])}
                      />
                    </div>
                  </div>
                );
              }
              return (
                <Field
                  key={f.name}
                  label={f.label}
                  value={content[f.name] ?? ""}
                  placeholder={f.placeholder}
                  type={f.type}
                  onChange={(v) => setContent((c) => ({ ...c, [f.name]: v }))}
                />
              );
            })
          )}

          {full && kind === "url" && (
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-background p-4">
              <div>
                <p className="text-sm font-medium">Dynamic code</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Keep the printed code and change where it points later. Enables scan tracking.
                </p>
                {dynamicOn && (
                  <p className="mt-2 break-all font-mono text-[11px] text-muted-foreground">
                    {shortUrl}
                  </p>
                )}
              </div>
              <Switch checked={isDynamic} onCheckedChange={setIsDynamic} />
            </div>
          )}

          {dynamicOn && (
            <DynamicOptions
              password={password}
              onPassword={setPassword}
              expiresAt={expiresAt}
              onExpiresAt={setExpiresAt}
              rules={rules}
              onRules={setRules}
            />
          )}
        </div>

        {full ? (
          <div className="space-y-5 rounded-xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Design</p>

            <OptionRow label="Presets">
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <Chip
                    key={p.name}
                    active={false}
                    onClick={() => setStyle((s) => ({ ...s, ...p.style }))}
                  >
                    {p.label}
                  </Chip>
                ))}
              </div>
            </OptionRow>

            <OptionRow label="My designs">
              <Button type="button" variant="secondary" size="sm" onClick={saveDesign}>
                <Save className="mr-1.5 size-icon-xs" />
                Save current
              </Button>
            </OptionRow>
            {designs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pl-0 sm:pl-32">
                {designs.map((d) => (
                  <span
                    key={d.id}
                    className="group inline-flex items-center gap-1 rounded-md border border-border py-1 pl-2.5 pr-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <button
                      type="button"
                      onClick={() => applyDesign(d.style)}
                      className="max-w-32 truncate"
                      title={d.name}
                    >
                      {d.name}
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete design ${d.name}`}
                      onClick={() => deleteDesign(d.id)}
                      className="rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
                    >
                      <X className="size-icon-2xs" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <OptionRow label="Module shape">
              {SHAPES.map((d) => (
                <Chip
                  key={d}
                  active={style.dotStyle === d}
                  onClick={() => setStyle((s) => ({ ...s, dotStyle: d }))}
                >
                  {d}
                </Chip>
              ))}
            </OptionRow>

            <OptionRow label="Eye shape">
              {EYE_SHAPES.map((e) => (
                <Chip
                  key={e}
                  active={style.eyeStyle === e}
                  onClick={() => setStyle((s) => ({ ...s, eyeStyle: e }))}
                >
                  {e}
                </Chip>
              ))}
            </OptionRow>

            <OptionRow label="Ball shape">
              {SHAPES.map((b) => (
                <Chip
                  key={b}
                  active={style.ballStyle === b}
                  onClick={() => setStyle((s) => ({ ...s, ballStyle: b }))}
                >
                  {b}
                </Chip>
              ))}
            </OptionRow>

            <OptionRow label="Error correction">
              {ECCS.map((e) => (
                <Chip
                  key={e}
                  active={style.ecc === e}
                  onClick={() => setStyle((s) => ({ ...s, ecc: e }))}
                >
                  {e}
                </Chip>
              ))}
            </OptionRow>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Quiet zone · margin ({style.margin} modules)
              </Label>
              <input
                type="range"
                min={0}
                max={8}
                step={1}
                value={style.margin}
                onChange={(e) => setStyle((s) => ({ ...s, margin: Number(e.target.value) }))}
                className="w-full"
              />
            </div>

            <OptionRow label="Frame">
              {FRAMES.map((f) => (
                <Chip
                  key={f}
                  active={style.frame === f}
                  onClick={() => setStyle((s) => ({ ...s, frame: f }))}
                >
                  {f === "none" ? "none" : f.replace(/-/g, " ")}
                </Chip>
              ))}
            </OptionRow>

            {style.frame !== "none" && (
              <Field
                label="Frame text"
                value={style.frameText}
                placeholder="SCAN ME"
                onChange={(v) => setStyle((s) => ({ ...s, frameText: v }))}
              />
            )}

            <OptionRow label="Gradient">
              {GRADIENTS.map((g) => (
                <Chip
                  key={g}
                  active={style.gradientType === g}
                  onClick={() => setStyle((s) => ({ ...s, gradientType: g }))}
                >
                  {g}
                </Chip>
              ))}
            </OptionRow>

            {style.gradientType !== "none" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <ColorField
                  label="Gradient end"
                  value={style.gradientEnd}
                  onChange={(v) => setStyle((s) => ({ ...s, gradientEnd: v }))}
                />
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Angle ({style.gradientAngle}deg)
                  </Label>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={15}
                    value={style.gradientAngle}
                    onChange={(e) =>
                      setStyle((s) => ({ ...s, gradientAngle: Number(e.target.value) }))
                    }
                    className="w-full"
                  />
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                label="Foreground"
                value={style.fg}
                onChange={(v) => setStyle((s) => ({ ...s, fg: v }))}
              />
              <ColorField
                label="Background"
                value={style.bg}
                onChange={(v) => setStyle((s) => ({ ...s, bg: v }))}
              />
            </div>

            <OptionRow label="Quick palette">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Use ${c}`}
                  onClick={() => setStyle((s) => ({ ...s, fg: c }))}
                  className="h-6 w-6 rounded-full border border-border"
                  style={{ backgroundColor: c }}
                />
              ))}
            </OptionRow>

            <OptionRow label="Transparent bg">
              <Switch
                checked={Boolean(style.transparentBg)}
                onCheckedChange={(v) => setStyle((s) => ({ ...s, transparentBg: v }))}
              />
              <span className="text-xs text-muted-foreground">
                PNG / SVG only — ideal for print or brand assets
              </span>
            </OptionRow>

            {style.logo && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Logo size ({Math.round(style.logoScale * 100)}%)
                  </Label>
                  <input
                    type="range"
                    min={10}
                    max={30}
                    step={1}
                    value={Math.round(style.logoScale * 100)}
                    onChange={(e) =>
                      setStyle((s) => ({ ...s, logoScale: Number(e.target.value) / 100 }))
                    }
                    className="w-full"
                  />
                </div>
                <OptionRow label="Logo plate">
                  {LOGO_PLATES.map((p) => (
                    <Chip
                      key={p}
                      active={(style.logoPlate ?? "rounded") === p}
                      onClick={() => setStyle((s) => ({ ...s, logoPlate: p }))}
                    >
                      {p === "rounded" ? "rounded" : p === "circle" ? "circle" : "none"}
                    </Chip>
                  ))}
                </OptionRow>
              </>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickLogo(e.target.files?.[0])}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                <ImageIcon className="mr-2 size-icon-sm" />
                {style.logo ? "Replace logo" : "Add logo"}
              </Button>
              {style.logo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStyle((s) => ({ ...s, logo: null }))}
                >
                  <X className="mr-2 size-icon-sm" />
                  Remove
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStyle({ ...defaultStyle })}
              >
                <RefreshCw className="mr-2 size-icon-sm" />
                Reset design
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onLocked}
            className="flex w-full items-center justify-between rounded-xl border border-dashed border-border bg-card p-5 text-left transition-colors hover:border-ring"
          >
            <div>
              <p className="text-sm font-medium">Colors, logo, shapes, SVG export, tracking</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Free forever — just sign in with Google to unlock.
              </p>
            </div>
            <Lock className="size-icon-sm text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <QrPreview payload={payload} style={style} />
        {full && <ScanMeter payload={payload} style={style} />}
        {full && (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name this code"
            className="bg-card"
          />
        )}
        {full && (
          <div className="space-y-2 rounded-xl border border-border bg-card p-4">
            <Label className="text-xs text-muted-foreground">Export size</Label>
            <div className="flex gap-2">
              {EXPORT_SIZES.map((s) => (
                <Chip key={s} active={exportSize === s} onClick={() => setExportSize(s)}>
                  {s}px
                </Chip>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" onClick={() => void download("png")}>
            <Download className="mr-2 size-icon-sm" /> PNG
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="secondary">
                {full ? (
                  <Download className="mr-2 size-icon-sm" />
                ) : (
                  <Lock className="mr-2 size-icon-sm" />
                )}
                Export
                <ChevronDown className="ml-1 size-icon-2xs" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => void download("svg")}>SVG vector</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void download("pdf")}>
                PDF (print-ready)
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void download("eps")}>EPS vector</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => void copyImage()}
        >
          <Copy className="mr-2 size-icon-sm" /> Copy image
        </Button>
        {full && onSave && (
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={saving}
            onClick={() =>
              onSave({
                name: name || meta.label,
                kind,
                content,
                style,
                isDynamic: dynamicOn,
                slug: dynamicOn ? slug : null,
                ...(dynamicOn ? { password } : {}),
                expiresAt: dynamicOn && expiresAt ? new Date(expiresAt).toISOString() : null,
                redirectRules:
                  dynamicOn && rules
                    ? (() => {
                        const filled = rules.rules.filter((r) => r.url.trim());
                        return filled.length > 0 ? { type: rules.type, rules: filled } : null;
                      })()
                    : null,
              })
            }
          >
            {saving ? (
              <Loader2 className="mr-2 size-icon-sm animate-spin" />
            ) : (
              <Save className="mr-2 size-icon-sm" />
            )}
            Save to my library
          </Button>
        )}
        <p className="text-center text-xs text-muted-foreground">
          No watermark. Codes never expire.
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  type,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string | undefined;
  type?: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {type === "textarea" ? (
        <Textarea
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="bg-background"
        />
      ) : (
        <Input
          value={value}
          type={type ?? "text"}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="bg-background"
        />
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm capitalize text-foreground"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function OptionRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-full shrink-0 text-xs text-muted-foreground sm:w-32">{label}</span>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1 text-xs capitalize transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={HEX_COLOR.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-10 cursor-pointer rounded-md border border-border bg-background"
          aria-label={label}
        />
        <Input
          value={value}
          onChange={(e) => {
            const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
          }}
          className="bg-background font-mono text-xs"
        />
      </div>
    </div>
  );
}

function ScanMeter({ payload, style }: { payload: string; style: QrStyle }) {
  const analysis = useMemo(() => analyzeQr(payload, style), [payload, style]);
  const tone =
    analysis.label === "Excellent"
      ? "text-emerald-400"
      : analysis.label === "Good"
        ? "text-lime-400"
        : analysis.label === "At risk"
          ? "text-amber-400"
          : "text-red-400";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Scannability</span>
        <span className={`text-sm font-semibold ${tone}`}>{analysis.score}/100</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400"
          style={{ width: `${analysis.score}%` }}
        />
      </div>
      <p className={`mt-2 text-xs font-medium ${tone}`}>{analysis.label}</p>
      {analysis.issues.length > 0 && (
        <ul className="mt-2 space-y-1">
          {analysis.issues.map((issue) => (
            <li key={issue} className="flex gap-1.5 text-xs text-muted-foreground">
              <span className="text-amber-400">•</span>
              {issue}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
