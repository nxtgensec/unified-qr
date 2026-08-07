import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";
import { assertSafeHttpUrl, hashPassword, validateRedirectRules } from "./dynamic";
import { KINDS, defaultStyle } from "./qr/types";
import { PLANS, effectivePlan, type PlanId } from "./plans";

export const MAX_BULK_CODES = 100;

export const listCodes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("qr_codes")
      .select("*")
      .eq("user_id", context.userId)
      .order("favorite", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const styleSchema = z
  .object({
    fg: z.string().regex(/^#[0-9a-fA-F]{3,6}$/, "Invalid foreground color"),
    bg: z.string().regex(/^#[0-9a-fA-F]{3,6}$/, "Invalid background color"),
    dotStyle: z.enum(["square", "rounded", "dots", "diamond", "circle"]),
    cornerStyle: z.enum(["square", "rounded", "circle", "diamond"]),
    ecc: z.enum(["L", "M", "Q", "H"]),
    margin: z.number().min(0).max(8),
    logo: z
      .string()
      .refine(
        (v) => v === "" || /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(v),
        "Logo must be a PNG, JPG, WebP or GIF image",
      )
      .refine((v) => v.length <= 750_000, "Logo is too large")
      .nullable()
      .optional(),
    logoScale: z.number().min(0.1).max(0.34),
    logoPlate: z.enum(["none", "rounded", "circle"]).optional(),
    transparentBg: z.boolean().optional(),
  })
  .passthrough();

const redirectRulesInput = z
  .object({
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
  })
  .nullable()
  .optional();

const codeSchema = z.object({
  name: z.string().min(1).max(120),
  kind: z.string().min(1).max(30),
  content: z.record(z.string()).default({}),
  style: styleSchema.optional(),
  isDynamic: z.boolean(),
  slug: z
    .string()
    .regex(/^[a-z0-9]{4,24}$/i)
    .nullable(),
  password: z.string().max(100).optional(),
  expiresAt: z.string().max(40).nullable().optional(),
  redirectRules: redirectRulesInput,
});

export const saveCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => codeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const target = data.isDynamic ? assertSafeHttpUrl(data.content["destination"] ?? "") : null;

    if (data.isDynamic && (await planOf(context)) === "professional") {
      const { count, error: countError } = await context.supabase
        .from("qr_codes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", context.userId)
        .eq("is_dynamic", true);
      if (countError) throw new Error(countError.message);
      if ((count ?? 0) >= PLANS.professional.dynamicCodes) {
        throw new Error(
          `Professional includes ${PLANS.professional.dynamicCodes} dynamic codes. Upgrade to Enterprise for unlimited dynamic QR codes.`,
        );
      }
    }

    let passwordHash: string | null = null;
    if (data.isDynamic && data.password && data.password.length > 0) {
      if (data.password.length < 4) {
        throw new Error("Password must be at least 4 characters.");
      }
      passwordHash = await hashPassword(data.password);
    }

    let expiresAt: string | null = null;
    if (data.isDynamic && data.expiresAt) {
      const time = Date.parse(data.expiresAt);
      if (Number.isNaN(time)) throw new Error("Expiry date is invalid.");
      if (time <= Date.now()) throw new Error("Expiry date must be in the future.");
      expiresAt = new Date(time).toISOString();
    }

    let redirectRules: Json | null = null;
    if (data.isDynamic && data.redirectRules) {
      redirectRules = validateRedirectRules(data.redirectRules) as unknown as Json;
    }

    const style = data.style ?? {};

    const base = {
      user_id: context.userId,
      name: data.name,
      kind: data.kind,
      content: data.content,
      style,
      is_dynamic: data.isDynamic,
      slug: data.isDynamic ? data.slug : null,
      target_url: target,
      password_hash: data.isDynamic ? passwordHash : null,
      expires_at: data.isDynamic ? expiresAt : null,
      redirect_rules: data.isDynamic ? redirectRules : null,
    };

    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: row, error } = await context.supabase
        .from("qr_codes")
        .insert({
          ...base,
          slug: data.isDynamic ? (attempt === 0 ? data.slug : generateSlug()) : null,
        })
        .select()
        .single();
      if (error) {
        if (error.code === "23505" && data.isDynamic) continue;
        throw new Error(error.message);
      }
      return row;
    }
    throw new Error("Could not reserve a unique link. Please try again.");
  });

function generateSlug(): string {
  const alphabet = "abcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  const bytes = new Uint8Array(7);
  crypto.getRandomValues(bytes);
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

export const updateCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().min(1).max(120).optional(),
        targetUrl: z.string().optional(),
        password: z.string().max(100).nullable().optional(),
        expiresAt: z.string().max(40).nullable().optional(),
        redirectRules: redirectRulesInput,
        favorite: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const patch: {
      name?: string;
      target_url?: string;
      password_hash?: string | null;
      expires_at?: string | null;
      redirect_rules?: Json | null;
      favorite?: boolean;
    } = {};

    if (data.name !== undefined) patch.name = data.name;
    if (data.favorite !== undefined) patch.favorite = data.favorite;
    if (data.targetUrl !== undefined) {
      patch.target_url = assertSafeHttpUrl(data.targetUrl);
    }
    if (data.password !== undefined) {
      patch.password_hash =
        data.password && data.password.length > 0 ? await hashPassword(data.password) : null;
    }
    if (data.expiresAt !== undefined) {
      if (data.expiresAt) {
        const time = Date.parse(data.expiresAt);
        if (Number.isNaN(time)) throw new Error("Expiry date is invalid.");
        if (time <= Date.now()) throw new Error("Expiry date must be in the future.");
        patch.expires_at = new Date(time).toISOString();
      } else {
        patch.expires_at = null;
      }
    }
    if (data.redirectRules !== undefined) {
      patch.redirect_rules = data.redirectRules
        ? (validateRedirectRules(data.redirectRules) as unknown as Json)
        : null;
    }

    if (Object.keys(patch).length === 0) return { ok: true };

    const { error } = await context.supabase
      .from("qr_codes")
      .update(patch)
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const importCodes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        codes: z
          .array(
            z.object({
              name: z.string().min(1).max(120),
              kind: z.string().min(1).max(30),
              content: z.record(z.string()).default({}),
              style: z.record(z.unknown()).default({}),
              is_dynamic: z.boolean().default(false),
              slug: z
                .string()
                .regex(/^[a-z0-9]{4,24}$/i)
                .nullable()
                .optional(),
              target_url: z.string().nullable().optional(),
            }),
          )
          .min(1)
          .max(500),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const knownKinds = new Set(KINDS.map((k) => k.kind));
    let imported = 0;
    let failed = 0;

    for (const code of data.codes) {
      if (!knownKinds.has(code.kind as never)) {
        failed++;
        continue;
      }
      const dynamic = code.is_dynamic;
      let targetUrl: string | null = null;
      if (dynamic) {
        if (!code.target_url) {
          failed++;
          continue;
        }
        try {
          targetUrl = assertSafeHttpUrl(code.target_url);
        } catch {
          failed++;
          continue;
        }
      }
      const row = {
        user_id: context.userId,
        name: code.name,
        kind: code.kind,
        content: code.content as Json,
        style: code.style as unknown as Json,
        is_dynamic: dynamic,
        slug: dynamic ? (code.slug ?? null) : null,
        target_url: targetUrl,
      };

      let ok = false;
      for (let attempt = 0; attempt < 5 && !ok; attempt++) {
        const { error } = await context.supabase.from("qr_codes").insert({
          ...row,
          slug: dynamic ? (attempt === 0 ? (code.slug ?? null) : generateSlug()) : null,
        });
        if (!error) {
          ok = true;
          imported++;
        } else if (error.code !== "23505" || !dynamic) {
          failed++;
          break;
        }
      }
      if (!ok) failed++;
    }

    return { imported, failed };
  });

export const saveBulkCodes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        codes: z
          .array(
            z.object({
              name: z.string().min(1).max(120),
              value: z.string().min(1).max(4096),
            }),
          )
          .min(1)
          .max(MAX_BULK_CODES),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const rows = data.codes.map((code) => ({
      user_id: context.userId,
      name: code.name,
      kind: "url",
      content: { url: code.value } as Json,
      style: defaultStyle as unknown as Json,
      is_dynamic: false,
      slug: null,
      target_url: null,
    }));

    const { data: inserted, error } = await context.supabase
      .from("qr_codes")
      .insert(rows)
      .select("id");
    if (error) throw new Error(error.message);
    return { saved: inserted?.length ?? 0 };
  });

export const deleteCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("qr_codes")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: codes, error: codesError } = await context.supabase
      .from("qr_codes")
      .select("id,name,kind,scan_count,is_dynamic,created_at")
      .eq("user_id", context.userId)
      .order("scan_count", { ascending: false });
    if (codesError) throw new Error(codesError.message);

    const plan = await planOf(context);
    const unlimited = PLANS[plan].analyticsDays === Number.POSITIVE_INFINITY;
    const analyticsDays = unlimited ? null : PLANS[plan].analyticsDays;

    let scansQuery = context.supabase
      .from("qr_scans")
      .select("code_id,scanned_at,device,country")
      .order("scanned_at", { ascending: true })
      .limit(unlimited ? 20000 : 5000);
    if (!unlimited) {
      scansQuery = scansQuery.gte(
        "scanned_at",
        new Date(Date.now() - (analyticsDays ?? 30) * 86400000).toISOString(),
      );
    }
    const { data: scans, error: scansError } = await scansQuery;
    if (scansError) throw new Error(scansError.message);

    return { codes: codes ?? [], scans: scans ?? [], plan, analyticsDays };
  });

async function planOf(context: {
  supabase: import("@supabase/supabase-js").SupabaseClient<
    import("@/integrations/supabase/types").Database
  >;
  userId: string;
}): Promise<PlanId> {
  const { data, error } = await context.supabase
    .from("profiles")
    .select("plan_tier, plan_until")
    .eq("id", context.userId)
    .single();
  if (error) throw new Error(error.message);
  return effectivePlan(data?.plan_tier ?? null, data?.plan_until ?? null);
}
