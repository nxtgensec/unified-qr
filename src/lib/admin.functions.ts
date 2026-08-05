import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAdmin } from "@/integrations/supabase/admin-middleware";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { planUntilForTerm, type BillingTerm } from "./plans";

export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ isAdmin: boolean }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("email")
      .eq("id", context.userId)
      .maybeSingle();
    if (!profile?.email) return { isAdmin: false };
    const { data: admin } = await supabaseAdmin
      .from("admins")
      .select("email")
      .eq("email", profile.email.trim().toLowerCase())
      .maybeSingle();
    return { isAdmin: !!admin };
  });

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type AdminOverview = {
  totals: {
    users: number;
    usersToday: number;
    codes: number;
    dynamicCodes: number;
    scans: number;
    enterpriseUsers: number;
    visitsToday: number;
    visitsTotal: number;
    paidRevenuePaise: number;
    pendingUpgrades: number;
  };
  last7DayScans: { date: string; count: number }[];
};

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAdmin])
  .handler(async (): Promise<AdminOverview> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const today = new Date().toISOString().slice(0, 10);

    const [
      users,
      usersToday,
      codes,
      dynamic,
      enterpriseUsers,
      visitsToday,
      visitsTotal,
      pendingUpgrades,
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfToday()),
      supabaseAdmin.from("qr_codes").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("qr_codes")
        .select("id", { count: "exact", head: true })
        .eq("is_dynamic", true),
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("plan_tier", "enterprise"),
      supabaseAdmin
        .from("visits")
        .select("id", { count: "exact", head: true })
        .eq("visit_date", today),
      supabaseAdmin.from("visits").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("upgrade_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

    const [scanRows, paidRows] = await Promise.all([
      supabaseAdmin.from("qr_codes").select("scan_count").limit(100000),
      supabaseAdmin.from("upgrade_requests").select("amount").eq("status", "paid").limit(100000),
    ]);

    const scans = (scanRows.data ?? []).reduce((s, r) => s + (r.scan_count ?? 0), 0);
    const paidRevenuePaise = (paidRows.data ?? []).reduce((s, r) => s + (r.amount ?? 0), 0);

    const buckets = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      buckets.set(dateKey(d), 0);
    }
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: scanDates } = await supabaseAdmin
      .from("qr_scans")
      .select("scanned_at")
      .gte("scanned_at", sevenDaysAgo)
      .limit(100000);
    for (const s of scanDates ?? []) {
      const key = dateKey(new Date(s.scanned_at));
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }

    return {
      totals: {
        users: users.count ?? 0,
        usersToday: usersToday.count ?? 0,
        codes: codes.count ?? 0,
        dynamicCodes: dynamic.count ?? 0,
        scans,
        enterpriseUsers: enterpriseUsers.count ?? 0,
        visitsToday: visitsToday.count ?? 0,
        visitsTotal: visitsTotal.count ?? 0,
        paidRevenuePaise,
        pendingUpgrades: pendingUpgrades.count ?? 0,
      },
      last7DayScans: [...buckets.entries()].map(([date, count]) => ({ date, count })),
    };
  });

export type AdminUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  plan: string;
  planUntil: string | null;
  createdAt: string;
  codes: number;
  dynamic: number;
  scans: number;
  pendingUpgrades: number;
  paidUpgrades: number;
};

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAdmin])
  .handler(async (): Promise<AdminUser[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: profiles }, { data: codes }, { data: upgrades }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id,email,full_name,plan_tier,plan_until,created_at")
        .order("created_at", { ascending: false })
        .limit(1000),
      supabaseAdmin.from("qr_codes").select("user_id,is_dynamic,scan_count").limit(50000),
      supabaseAdmin
        .from("upgrade_requests")
        .select("user_id,status,term,amount,created_at")
        .order("created_at", { ascending: false })
        .limit(5000),
    ]);

    const perUser = new Map<
      string,
      { codes: number; dynamic: number; scans: number; pending: number; paid: number }
    >();
    for (const c of codes ?? []) {
      const agg = perUser.get(c.user_id) ?? { codes: 0, dynamic: 0, scans: 0, pending: 0, paid: 0 };
      agg.codes += 1;
      if (c.is_dynamic) agg.dynamic += 1;
      agg.scans += c.scan_count ?? 0;
      perUser.set(c.user_id, agg);
    }
    for (const u of upgrades ?? []) {
      const agg = perUser.get(u.user_id);
      if (!agg) continue;
      if (u.status === "pending") agg.pending += 1;
      if (u.status === "paid") agg.paid += 1;
    }

    return (profiles ?? []).map((p) => {
      const agg = perUser.get(p.id) ?? { codes: 0, dynamic: 0, scans: 0, pending: 0, paid: 0 };
      return {
        id: p.id,
        email: p.email,
        fullName: p.full_name,
        plan: p.plan_tier,
        planUntil: p.plan_until,
        createdAt: p.created_at,
        codes: agg.codes,
        dynamic: agg.dynamic,
        scans: agg.scans,
        pendingUpgrades: agg.pending,
        paidUpgrades: agg.paid,
      };
    });
  });

export type AdminUpgradeRequest = {
  id: string;
  userId: string;
  email: string | null;
  planTier: string;
  status: string;
  term: string | null;
  amount: number;
  currency: string;
  orderId: string | null;
  paymentId: string | null;
  createdAt: string;
};

export const listAdminUpgradeRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAdmin])
  .handler(async (): Promise<AdminUpgradeRequest[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: requests }, { data: profiles }] = await Promise.all([
      supabaseAdmin
        .from("upgrade_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000),
      supabaseAdmin.from("profiles").select("id,email").limit(2000),
    ]);

    const emailByUserId = new Map((profiles ?? []).map((p) => [p.id, p.email]));

    return (requests ?? []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      email: emailByUserId.get(r.user_id) ?? null,
      planTier: r.plan_tier,
      status: r.status,
      term: r.term,
      amount: r.amount,
      currency: r.currency,
      orderId: r.razorpay_order_id,
      paymentId: r.razorpay_payment_id,
      createdAt: r.created_at,
    }));
  });

export const adminMarkUpgradePaid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAdmin])
  .validator((input: unknown) =>
    z
      .object({
        upgradeId: z.string().uuid(),
        term: z.enum(["daily", "weekly", "monthly", "yearly"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: request } = await supabaseAdmin
      .from("upgrade_requests")
      .select("id,user_id,status,term")
      .eq("id", data.upgradeId)
      .maybeSingle();
    if (!request) throw new Error("Upgrade request not found.");
    if (request.status === "paid") throw new Error("This request is already marked paid.");

    const planUntil = planUntilForTerm(data.term).toISOString();

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ plan_tier: "enterprise", plan_until: planUntil })
      .eq("id", request.user_id);
    if (profileError) throw new Error(profileError.message);

    const { error: reqError } = await supabaseAdmin
      .from("upgrade_requests")
      .update({ status: "paid", term: data.term })
      .eq("id", data.upgradeId);
    if (reqError) throw new Error(reqError.message);

    return { ok: true };
  });

export const adminRevokeEnterprise = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAdmin])
  .validator((input: unknown) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ plan_tier: "professional", plan_until: null })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);

    return { ok: true };
  });

export type AdminVisits = {
  today: number;
  total: number;
  last14Days: { date: string; count: number }[];
  byPage: { page: string; count: number }[];
  byDevice: { device: string; count: number }[];
  byCountry: { country: string; count: number }[];
};

export const getAdminVisits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAdmin])
  .handler(async (): Promise<AdminVisits> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const today = new Date().toISOString().slice(0, 10);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();

    const [{ data: rows }, todayRes, totalRes] = await Promise.all([
      supabaseAdmin
        .from("visits")
        .select("visit_date,page,device,country")
        .gte("visit_date", fourteenDaysAgo.slice(0, 10))
        .limit(100000),
      supabaseAdmin
        .from("visits")
        .select("id", { count: "exact", head: true })
        .eq("visit_date", today),
      supabaseAdmin.from("visits").select("id", { count: "exact", head: true }),
    ]);

    const byDay = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      byDay.set(dateKey(d), 0);
    }
    const byPage = new Map<string, number>();
    const byDevice = new Map<string, number>();
    const byCountry = new Map<string, number>();

    for (const v of rows ?? []) {
      const key = v.visit_date ?? dateKey(new Date());
      if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1);
      byPage.set(v.page ?? "/", (byPage.get(v.page ?? "/") ?? 0) + 1);
      byDevice.set(v.device ?? "Unknown", (byDevice.get(v.device ?? "Unknown") ?? 0) + 1);
      byCountry.set(v.country ?? "Unknown", (byCountry.get(v.country ?? "Unknown") ?? 0) + 1);
    }

    const top = (m: Map<string, number>, n: number) =>
      [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);

    return {
      today: todayRes.count ?? 0,
      total: totalRes.count ?? 0,
      last14Days: [...byDay.entries()].map(([date, count]) => ({ date, count })),
      byPage: top(byPage, 20),
      byDevice: top(byDevice, 10),
      byCountry: top(byCountry, 20),
    };
  });
