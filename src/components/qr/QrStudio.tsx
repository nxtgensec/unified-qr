import { Download, ImageIcon, Loader2, Lock, RefreshCw, Save, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { QrPreview } from "@/components/qr/QrPreview";
import { buildQrSvg, downloadPng, downloadSvg, slugify } from "@/lib/qr/render";
import { KINDS, PRESETS, buildPayload, defaultStyle } from "@/lib/qr/types";
import type {
  DotStyle,
  Ecc,
  FrameKind,
  GradientType,
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
}

interface QrStudioProps {
  mode: "free" | "full";
  initial?: Partial<StudioValue>;
  saving?: boolean;
  onSave?: (value: StudioValue) => void;
  onLocked?: () => void;
}

const SHAPES: DotStyle[] = ["square", "rounded", "dots", "diamond"];
const EYE_SHAPES: DotStyle[] = ["square", "rounded", "circle", "diamond"];
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
  const fileRef = useRef<HTMLInputElement>(null);

  const meta = useMemo(() => KINDS.find((k) => k.kind === kind) ?? KINDS[0]!, [kind]);

  const shortUrl =
    typeof window === "undefined" ? "" : `${window.location.origin}/api/public/r/${slug}`;
  const dynamicOn = full && isDynamic && kind === "url";
  const payload = dynamicOn ? shortUrl : buildPayload(kind, content);

  const filename = (name || meta.label || "unified-qr").toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const download = async (format: "png" | "svg") => {
    if (!payload.trim()) {
      toast.error("Add some content first");
      return;
    }
    try {
      const svg = buildQrSvg(payload, style, 1024);
      if (format === "svg") {
        if (!full) return onLocked?.();
        downloadSvg(svg, filename);
      } else {
        await downloadPng(svg, filename);
      }
      toast.success(`Downloaded ${format.toUpperCase()}`);
    } catch {
      toast.error("Could not export this code");
    }
  };

  const pickLogo = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 512 * 1024) {
      toast.error("Please use a logo under 500 KB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setStyle((s) => ({ ...s, logo: String(reader.result) }));
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
                  {locked && <Lock className="h-3 w-3" />}
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
                <ImageIcon className="mr-2 h-4 w-4" />
                {style.logo ? "Replace logo" : "Add logo"}
              </Button>
              {style.logo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStyle((s) => ({ ...s, logo: null }))}
                >
                  <X className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStyle({ ...defaultStyle })}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
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
            <Lock className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <QrPreview payload={payload} style={style} />
        {full && (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name this code"
            className="bg-card"
          />
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" onClick={() => void download("png")}>
            <Download className="mr-2 h-4 w-4" /> PNG
          </Button>
          <Button type="button" variant="secondary" onClick={() => void download("svg")}>
            {full ? <Download className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />} SVG
          </Button>
        </div>
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
              })
            }
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
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
      <span className="w-32 shrink-0 text-xs text-muted-foreground">{label}</span>
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
