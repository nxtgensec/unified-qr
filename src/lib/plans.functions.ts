import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  ENTERPRISE_CURRENCY,
  PLANS,
  formatPaise,
  termPaise,
  type BillingTerm,
  type PlanId,
} from "./plans";

export type PlanStatus = {
  plan: PlanId;
  planName: string;
  tagline: string;
  dynamicUsed: number;
  dynamicLimit: number | null;
  analyticsDays: number | null;
  bulk: boolean;
  priceMonthly: string;
  priceYearly: string;
};

export const getMyPlan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PlanStatus> => {
    const { data: profile, error } = await context.supabase
      .from("profiles")
      .select("plan_tier")
      .eq("id", context.userId)
      .single();
    if (error) throw new Error(error.message);

    const { count, error: countError } = await context.supabase
      .from("qr_codes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .eq("is_dynamic", true);
    if (countError) throw new Error(countError.message);

    const plan: PlanId = profile?.plan_tier === "enterprise" ? "enterprise" : "professional";
    const def = PLANS[plan];
    const unlimited = def.dynamicCodes === Number.POSITIVE_INFINITY;
    return {
      plan,
      planName: def.name,
      tagline: def.tagline,
      dynamicUsed: count ?? 0,
      dynamicLimit: unlimited ? null : def.dynamicCodes,
      analyticsDays: unlimited ? null : def.analyticsDays,
      bulk: def.bulk,
      priceMonthly: formatPaise(termPaise("monthly")),
      priceYearly: formatPaise(termPaise("yearly")),
    };
  });

export const requestUpgrade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("upgrade_requests")
      .insert({ user_id: context.userId, plan_tier: "enterprise", status: "pending" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: data.id };
  });

export type RazorpayOrderResult =
  | { available: false }
  | { available: true; orderId: string; amount: number; currency: string; keyId: string };

export const createRazorpayOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({ term: z.enum(["daily", "weekly", "monthly", "yearly"]) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<RazorpayOrderResult> => {
    const keyId = process.env["RAZORPAY_KEY_ID"];
    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keyId || !keySecret) return { available: false };

    const amount = termPaise(data.term);

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount,
        currency: ENTERPRISE_CURRENCY,
        receipt: `ent-${context.userId.slice(0, 8)}-${data.term}`,
        notes: { userId: context.userId, term: data.term },
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Razorpay order failed (${res.status}): ${body}`);
    }

    const order = (await res.json()) as { id: string; amount: number; currency: string };

    await context.supabase.from("upgrade_requests").insert({
      user_id: context.userId,
      plan_tier: "enterprise",
      status: "pending",
      amount: order.amount,
      currency: order.currency,
      razorpay_order_id: order.id,
    });

    return {
      available: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    };
  });

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        razorpayOrderId: z.string().min(1),
        razorpayPaymentId: z.string().min(1),
        razorpaySignature: z.string().min(1),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keySecret) throw new Error("Payments are not configured yet.");

    const { createHmac } = await import("node:crypto");
    const expected = createHmac("sha256", keySecret)
      .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
      .digest("hex");
    if (expected !== data.razorpaySignature) {
      throw new Error("Payment verification failed.");
    }

    const { error: updateError } = await context.supabase
      .from("profiles")
      .update({ plan_tier: "enterprise" })
      .eq("id", context.userId);
    if (updateError) throw new Error(updateError.message);

    await context.supabase
      .from("upgrade_requests")
      .update({
        status: "paid",
        razorpay_payment_id: data.razorpayPaymentId,
        razorpay_signature: data.razorpaySignature,
      })
      .eq("razorpay_order_id", data.razorpayOrderId)
      .eq("user_id", context.userId);

    return { ok: true };
  });
