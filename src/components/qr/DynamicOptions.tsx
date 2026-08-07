import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export interface RedirectRuleInput {
  lang?: string;
  weight?: number;
  url: string;
}

export interface RedirectRulesInput {
  type: "language" | "split";
  rules: RedirectRuleInput[];
}

interface DynamicOptionsProps {
  password: string;
  onPassword: (v: string) => void;
  expiresAt: string;
  onExpiresAt: (v: string) => void;
  rules: RedirectRulesInput | null;
  onRules: (r: RedirectRulesInput | null) => void;
}

const LANGUAGE_OPTIONS = [
  "en",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "nl",
  "ru",
  "ar",
  "hi",
  "ja",
  "ko",
  "zh",
];

export function DynamicOptions({
  password,
  onPassword,
  expiresAt,
  onExpiresAt,
  rules,
  onRules,
}: DynamicOptionsProps) {
  const multi = rules !== null;

  const setMode = (type: "language" | "split") => {
    if (!rules) return;
    onRules({
      type,
      rules: rules.rules.map((r) =>
        type === "language"
          ? { lang: r.lang ?? "en", url: r.url }
          : { weight: r.weight ?? 50, url: r.url },
      ),
    });
  };

  const setRule = (index: number, patch: Partial<RedirectRuleInput>) => {
    if (!rules) return;
    const next = rules.rules.map((r, i) => (i === index ? { ...r, ...patch } : r));
    onRules({ ...rules, rules: next });
  };

  const addRule = () => {
    if (!rules) return;
    const blank: RedirectRuleInput =
      rules.type === "language" ? { lang: "en", url: "" } : { weight: 50, url: "" };
    onRules({ ...rules, rules: [...rules.rules, blank] });
  };

  const removeRule = (index: number) => {
    if (!rules) return;
    const next = rules.rules.filter((_, i) => i !== index);
    onRules(next.length > 0 ? { ...rules, rules: next } : null);
  };

  return (
    <div className="space-y-5 border-t border-border pt-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-small text-muted-foreground">Password (optional)</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => onPassword(e.target.value)}
            placeholder="Lock this link"
            className="bg-background"
          />
          <p className="text-small text-muted-foreground">
            Scanners enter this password before being redirected.
          </p>
        </div>
        <div className="space-y-2">
          <Label className="text-small text-muted-foreground">Expires (optional)</Label>
          <Input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => onExpiresAt(e.target.value)}
            className="bg-background"
          />
          <p className="text-small text-muted-foreground">
            After this moment the code shows an expired message.
          </p>
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-background p-4">
        <div>
          <p className="text-small font-medium">Multi-URL routing</p>
          <p className="mt-0.5 text-small text-muted-foreground">
            Send scanners to different links by language or an A/B split.
          </p>
        </div>
        <Switch
          checked={multi}
          onCheckedChange={(v) =>
            v ? onRules({ type: "language", rules: [{ lang: "en", url: "" }] }) : onRules(null)
          }
        />
      </div>

      {multi && rules && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(["language", "split"] as const).map((t) => (
              <Chip
                key={t}
                active={rules.type === t}
                onClick={() => setMode(t)}
                className="flex-1 justify-center"
              >
                {t === "language" ? "By language" : "A/B split"}
              </Chip>
            ))}
          </div>

          {rules.rules.map((rule, index) => (
            <div key={index} className="flex items-end gap-2">
              {rules.type === "language" ? (
                <div className="w-28 shrink-0 space-y-1">
                  <Label className="text-small text-muted-foreground">Language</Label>
                  <Input
                    list="qr-langs"
                    value={rule.lang ?? ""}
                    placeholder="en"
                    onChange={(e) => setRule(index, { lang: e.target.value })}
                    className="bg-background"
                  />
                </div>
              ) : (
                <div className="w-28 shrink-0 space-y-1">
                  <Label className="text-small text-muted-foreground">Weight</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={rule.weight ?? 50}
                    onChange={(e) =>
                      setRule(index, { weight: Math.max(1, Number(e.target.value)) })
                    }
                    className="bg-background"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <Label className="text-small text-muted-foreground">URL</Label>
                <Input
                  value={rule.url}
                  placeholder="https://…"
                  onChange={(e) => setRule(index, { url: e.target.value })}
                  className="bg-background"
                />
              </div>
              <button
                type="button"
                onClick={() => removeRule(index)}
                aria-label="Remove rule"
                className="flex size-11 shrink-0 items-center justify-center rounded-btn border border-border text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="size-icon-sm" />
              </button>
            </div>
          ))}

          <Button type="button" variant="ghost" className="h-11 px-3 text-small" onClick={addRule}>
            <Plus className="size-icon-xs" /> Add{" "}
            {rules.type === "language" ? "language" : "variant"}
          </Button>

          <datalist id="qr-langs">
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang} value={lang} />
            ))}
          </datalist>

          <p className="text-small leading-relaxed text-muted-foreground">
            {rules.type === "language"
              ? "Scanners whose language isn't listed go to the main destination."
              : "Weights are relative — traffic is split proportionally. The main destination is the fallback."}
          </p>
        </div>
      )}
    </div>
  );
}
