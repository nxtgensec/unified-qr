import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PLANS, type PlanId } from "./plans";

export const listCodes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("qr_codes")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        name: z.string().min(1).max(120),
        kind: z.string().min(1).max(30),
        content: z.record(z.string()).default({}),
        style: z
          .object({
            fg: z.string().regex(/^#[0-9a-fA-F]{3,6}$/, "Invalid foreground color"),
            bg: z.string().regex(/^#[0-9a-fA-F]{3,6}$/, "Invalid background color"),
            dotStyle: z.enum(["square", "rounded", "dots"]),
            cornerStyle: z.enum(["square", "rounded", "circle"]),
            ecc: z.enum(["L", "M", "Q", "H"]),
            margin: z.number().min(0).max(8),
            logo: z
              .string()
              .refine((v) => v === "" || v.startsWith("data:image/"), "Invalid logo")
              .nullable()
              .optional(),
            logoScale: z.number().min(0.1).max(0.34),
          })
          .passthrough()
          .optional(),
        isDynamic: z.boolean(),
        slug: z
          .string()
          .regex(/^[a-z0-9]{4,24}$/i)
          .nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const target = data.isDynamic ? (data.content["destination"] ?? "").trim() : null;
    if (data.isDynamic && !/^https?:\/\//i.test(target ?? "")) {
      throw new Error("Dynamic codes need a destination starting with http:// or https://");
    }

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
        targetUrl: z.string().url().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const patch: { name?: string; target_url?: string } = {};
    if (data.name) patch.name = data.name;
    if (data.targetUrl) patch.target_url = data.targetUrl;
    if (Object.keys(patch).length === 0) return { ok: true };

    const { error } = await context.supabase
      .from("qr_codes")
      .update(patch)
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
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
    .select("plan_tier")
    .eq("id", context.userId)
    .single();
  if (error) throw new Error(error.message);
  return data?.plan_tier === "enterprise" ? "enterprise" : "professional";
}
