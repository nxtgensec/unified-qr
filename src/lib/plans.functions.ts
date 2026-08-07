import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  ENTERPRISE_CURRENCY,
  PLANS,
  effectivePlan,
  formatPaise,
  planUntilForTerm,
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
  planUntil: string | null;
  priceMonthly: string;
  priceYearly: string;
};

export const getMyPlan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PlanStatus> => {
    const { data: profile, error } = await context.supabase
      .from("profiles")
      .select("plan_tier, plan_until")
      .eq("id", context.userId)
      .single();
    if (error) throw new Error(error.message);

    const { count, error: countError } = await context.supabase
      .from("qr_codes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .eq("is_dynamic", true);
    if (countError) throw new Error(countError.message);

    const plan = effectivePlan(profile?.plan_tier ?? null, profile?.plan_until ?? null);
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
      planUntil: plan === "enterprise" ? (profile?.plan_until ?? null) : null,
      priceMonthly: formatPaise(termPaise("monthly")),
      priceYearly: formatPaise(termPaise("yearly")),
    };
  });

export const requestUpgrade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("upgrade_requests")
      .insert({ user_id: context.userId, plan_tier: "enterprise", status: "pending" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: data.id };
  });

const CASHFREE_API_VERSION = "2026-01-01";

function cashfreeConfig() {
  const clientId = process.env["CASHFREE_CLIENT_ID"];
  const secretKey = process.env["CASHFREE_SECRET_KEY"];
  if (!clientId || !secretKey) return null;
  const mode: "sandbox" | "production" =
    process.env["CASHFREE_ENVIRONMENT"] === "sandbox" ? "sandbox" : "production";
  const baseUrl =
    mode === "sandbox" ? "https://sandbox.cashfree.com/pg" : "https://api.cashfree.com/pg";
  return { clientId, secretKey, mode, baseUrl };
}

function cashfreeHeaders(clientId: string, secretKey: string) {
  return {
    "x-client-id": clientId,
    "x-client-secret": secretKey,
    "x-api-version": CASHFREE_API_VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export type CashfreeOrderResult =
  | { available: false }
  | {
      available: true;
      orderId: string;
      paymentSessionId: string;
      amount: number;
      currency: string;
      mode: "production" | "sandbox";
    };

export const createCashfreeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({ term: z.enum(["daily", "weekly", "monthly", "yearly"]) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<CashfreeOrderResult> => {
    const config = cashfreeConfig();
    if (!config) return { available: false };

    const { data: profile } = await context.supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", context.userId)
      .maybeSingle();

    const amountPaise = termPaise(data.term);
    const orderId = `ent-${context.userId.slice(0, 8)}-${Date.now().toString(36)}`;
    const origin = getRequestUrl({ xForwardedHost: true, xForwardedProto: true }).origin;

    const res = await fetch(`${config.baseUrl}/orders`, {
      method: "POST",
      headers: cashfreeHeaders(config.clientId, config.secretKey),
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amountPaise / 100,
        order_currency: ENTERPRISE_CURRENCY,
        customer_details: {
          customer_id: context.userId,
          customer_name: profile?.full_name ?? "Unified QR customer",
          customer_email: profile?.email ?? "support@nxtgensec.org",
          customer_phone: "9999999999",
        },
        order_meta: {
          return_url: `${origin}/app/settings?order_id={order_id}`,
        },
        order_note: `Enterprise ${data.term} plan`,
        order_tags: { userId: context.userId, term: data.term },
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Cashfree order failed (${res.status}): ${body}`);
    }

    const order = (await res.json()) as {
      order_id: string;
      payment_session_id: string;
      order_amount: number;
      order_currency: string;
    };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("upgrade_requests").insert({
      user_id: context.userId,
      plan_tier: "enterprise",
      status: "pending",
      amount: amountPaise,
      currency: order.order_currency,
      term: data.term,
      payment_order_id: order.order_id,
    });

    return {
      available: true,
      orderId: order.order_id,
      paymentSessionId: order.payment_session_id,
      amount: order.order_amount,
      currency: order.order_currency,
      mode: config.mode,
    };
  });

export const verifyCashfreePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ orderId: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const config = cashfreeConfig();
    if (!config) throw new Error("Payments are not configured yet.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: request } = await supabaseAdmin
      .from("upgrade_requests")
      .select("id, term, status")
      .eq("payment_order_id", data.orderId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!request) throw new Error("Upgrade request not found.");
    if (request.status === "paid") return { ok: true };

    const res = await fetch(`${config.baseUrl}/orders/${encodeURIComponent(data.orderId)}`, {
      method: "GET",
      headers: cashfreeHeaders(config.clientId, config.secretKey),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Cashfree verification failed (${res.status}): ${body}`);
    }
    const order = (await res.json()) as { order_status: string };
    if (order.order_status !== "PAID") throw new Error("Payment has not been completed.");

    let paymentId: string | null = null;
    const paymentsRes = await fetch(
      `${config.baseUrl}/orders/${encodeURIComponent(data.orderId)}/payments`,
      { method: "GET", headers: cashfreeHeaders(config.clientId, config.secretKey) },
    );
    if (paymentsRes.ok) {
      const payments = (await paymentsRes.json()) as
        { data?: { cf_payment_id?: string }[] } | { cf_payment_id?: string }[];
      const list = Array.isArray(payments) ? payments : (payments.data ?? []);
      paymentId = list.find((p) => p.cf_payment_id)?.cf_payment_id ?? null;
    }

    if (!request.term) throw new Error("Upgrade request is missing its term.");
    const planUntil = planUntilForTerm(request.term as BillingTerm).toISOString();

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ plan_tier: "enterprise", plan_until: planUntil })
      .eq("id", context.userId);
    if (updateError) throw new Error(updateError.message);

    await supabaseAdmin
      .from("upgrade_requests")
      .update({
        status: "paid",
        payment_id: paymentId,
      })
      .eq("id", request.id);

    return { ok: true };
  });
