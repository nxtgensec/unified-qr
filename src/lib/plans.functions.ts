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
    const { error: profileError } = await context.supabase
      .from("profiles")
      .select("id")
      .eq("id", context.userId)
      .single();
    if (profileError) throw new Error("Unauthorized");
    const { data: existing } = await supabaseAdmin
      .from("upgrade_requests")
      .select("id")
      .eq("user_id", context.userId)
      .eq("status", "pending")
      .maybeSingle();
    if (existing) return { ok: true, id: existing.id, alreadyPending: true };
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
  | { available: false; alreadyPaid: true; planUntil: string }
  | {
      available: true;
      orderId: string;
      paymentSessionId: string;
      amount: number;
      currency: string;
      mode: "production" | "sandbox";
    };

async function activateEnterprise(userId: string, term: BillingTerm): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("plan_until")
    .eq("id", userId)
    .maybeSingle();
  const base =
    profile?.plan_until && new Date(profile.plan_until).getTime() > Date.now()
      ? new Date(profile.plan_until)
      : new Date();
  const planUntil = planUntilForTerm(term, base).toISOString();
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ plan_tier: "enterprise", plan_until: planUntil })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  return planUntil;
}

export const createCashfreeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({ term: z.enum(["daily", "weekly", "monthly", "yearly"]) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<CashfreeOrderResult> => {
    const config = cashfreeConfig();
    if (!config) return { available: false };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: pendingReqs, error: pendingError } = await supabaseAdmin
      .from("upgrade_requests")
      .select("id, term, payment_order_id")
      .eq("user_id", context.userId)
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(10);
    if (pendingError) throw new Error(pendingError.message);

    if (pendingReqs && pendingReqs.length > 0) {
      for (const pending of pendingReqs) {
        if (!pending.payment_order_id) continue;
        const statusRes = await fetch(
          `${config.baseUrl}/orders/${encodeURIComponent(pending.payment_order_id)}`,
          { method: "GET", headers: cashfreeHeaders(config.clientId, config.secretKey) },
        );
        if (!statusRes.ok) continue;
        const status = (await statusRes.json()) as { order_status?: string };
        if (status.order_status === "PAID") {
          const planUntil = await activateEnterprise(
            context.userId,
            (pending.term as BillingTerm | null) ?? data.term,
          );
          await supabaseAdmin
            .from("upgrade_requests")
            .update({ status: "paid" })
            .eq("id", pending.id);
          return { available: false, alreadyPaid: true, planUntil };
        }
      }
    }

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
          return_url: `${origin}/settings?order_id={order_id}`,
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

    const reuse = pendingReqs?.[0];
    if (reuse) {
      const { error: updateError } = await supabaseAdmin
        .from("upgrade_requests")
        .update({
          plan_tier: "enterprise",
          status: "pending",
          amount: amountPaise,
          currency: order.order_currency,
          term: data.term,
          payment_order_id: order.order_id,
        })
        .eq("id", reuse.id);
      if (updateError) throw new Error(updateError.message);
    } else {
      await supabaseAdmin.from("upgrade_requests").insert({
        user_id: context.userId,
        plan_tier: "enterprise",
        status: "pending",
        amount: amountPaise,
        currency: order.order_currency,
        term: data.term,
        payment_order_id: order.order_id,
      });
    }

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

    const { error: profileError } = await context.supabase
      .from("profiles")
      .select("id")
      .eq("id", context.userId)
      .single();
    if (profileError) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: request } = await supabaseAdmin
      .from("upgrade_requests")
      .select("id, term, status, amount")
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
    const order = (await res.json()) as {
      order_status: string;
      order_amount?: number;
      order_currency?: string;
    };
    if (order.order_status !== "PAID") throw new Error("Payment has not been completed.");
    if (order.order_currency && order.order_currency !== ENTERPRISE_CURRENCY) {
      throw new Error("Payment currency mismatch.");
    }
    if (
      request.amount &&
      request.amount > 0 &&
      order.order_amount != null &&
      Math.round(Number(order.order_amount) * 100) !== request.amount
    ) {
      throw new Error("Payment amount mismatch.");
    }

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
    await activateEnterprise(context.userId, request.term as BillingTerm);

    await supabaseAdmin
      .from("upgrade_requests")
      .update({
        status: "paid",
        payment_id: paymentId,
      })
      .eq("id", request.id);

    return { ok: true };
  });
