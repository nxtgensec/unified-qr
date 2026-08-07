import { z } from "zod";

const PBKDF2_ITERATIONS = 100_000;

export interface RedirectRule {
  lang?: string;
  weight?: number;
  url: string;
}

export interface RedirectRules {
  type: "language" | "split";
  rules: RedirectRule[];
}

export const redirectRulesSchema = z.object({
  type: z.enum(["language", "split"]),
  rules: z
    .array(
      z.object({
        lang: z.string().max(10).optional(),
        weight: z.number().min(1).max(100).optional(),
        url: z.string().max(2048),
      }),
    )
    .min(1)
    .max(10),
});

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function deriveBits(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  return new Uint8Array(bits);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveBits(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2_sha256$${PBKDF2_ITERATIONS}$${toHex(salt)}$${toHex(key)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2_sha256") return false;
  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations < 1000) return false;
  try {
    const salt = fromHex(parts[2]!);
    const expected = fromHex(parts[3]!);
    const actual = await deriveBits(password, salt, iterations);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function assertSafeHttpUrl(value: string): string {
  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error("Dynamic codes need a destination starting with http:// or https://");
  }
  if (Array.from(trimmed).some((ch) => ch.charCodeAt(0) < 32 || ch.charCodeAt(0) === 127)) {
    throw new Error("Destination contains invalid characters.");
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("Destination is not a valid URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Destination must be an http(s) URL.");
  }
  return trimmed;
}

export function validateRedirectRules(input: unknown): RedirectRules {
  const parsed = redirectRulesSchema.parse(input);
  if (parsed.type === "language") {
    for (const rule of parsed.rules) {
      if (!rule.lang?.trim()) throw new Error("Every language rule needs a language tag.");
      assertSafeHttpUrl(rule.url);
    }
  } else {
    for (const rule of parsed.rules) {
      if (!rule.weight) throw new Error("Every split rule needs a weight.");
      assertSafeHttpUrl(rule.url);
    }
  }
  return {
    type: parsed.type,
    rules: parsed.rules.map((r) => ({
      ...(r.lang ? { lang: r.lang.trim().toLowerCase() } : {}),
      ...(r.weight ? { weight: r.weight } : {}),
      url: r.url.trim(),
    })),
  };
}

export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = value;
  }
  return out;
}

export function firstLanguageTag(acceptLanguage: string | null): string {
  const tag = acceptLanguage?.split(",")[0]?.split(";")[0]?.trim().toLowerCase();
  if (!tag) return "";
  const dash = tag.indexOf("-");
  return dash > 0 ? tag.slice(0, dash) : tag;
}

export function pickTargetUrl(
  code: { target_url?: string | null; redirect_rules?: unknown },
  acceptLanguage: string | null,
): string {
  const rules = code.redirect_rules as RedirectRules | null | undefined;
  if (rules?.type === "language" && Array.isArray(rules.rules) && rules.rules.length > 0) {
    const lang = firstLanguageTag(acceptLanguage);
    if (lang) {
      const match = rules.rules.find((r) => r.lang === lang);
      if (match?.url) return match.url;
    }
  }
  if (rules?.type === "split" && Array.isArray(rules.rules) && rules.rules.length > 0) {
    const total = rules.rules.reduce((sum, r) => sum + (r.weight ?? 0), 0);
    if (total > 0) {
      const roll = Math.floor(Math.random() * total) + 1;
      let acc = 0;
      for (const r of rules.rules) {
        acc += r.weight ?? 0;
        if (roll <= acc) return r.url;
      }
    }
  }
  return code.target_url ?? "";
}
