export type PlanId = "professional" | "enterprise";

export interface PlanDefinition {
  id: PlanId;
  name: string;
  tagline: string;
  dynamicCodes: number;
  analyticsDays: number;
  bulk: boolean;
  features: string[];
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  professional: {
    id: "professional",
    name: "Professional",
    tagline: "Free forever",
    dynamicCodes: 3,
    analyticsDays: 30,
    bulk: false,
    features: [
      "All 19 QR code types",
      "3 dynamic QR codes",
      "Unlimited static QR codes",
      "30-day scan analytics",
      "PNG + SVG export, watermark-free",
      "No expiry, no scan caps, no ads",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Unlimited everything",
    dynamicCodes: Number.POSITIVE_INFINITY,
    analyticsDays: Number.POSITIVE_INFINITY,
    bulk: true,
    features: [
      "Unlimited dynamic QR codes",
      "Full scan history, never truncated",
      "Bulk generation from CSV",
      "Everything in Professional",
      "Priority support",
    ],
  },
};

export const ENTERPRISE_CURRENCY = "INR" as const;

export const ENTERPRISE_TERMS = [
  { id: "daily", label: "Daily", per: "day", paise: 900 },
  { id: "weekly", label: "Weekly", per: "week", paise: 4900 },
  { id: "monthly", label: "Monthly", per: "month", paise: 9900 },
  { id: "yearly", label: "Yearly", per: "year", paise: 99900 },
] as const;

export type BillingTerm = (typeof ENTERPRISE_TERMS)[number]["id"];

export function termPaise(term: BillingTerm): number {
  return ENTERPRISE_TERMS.find((t) => t.id === term)?.paise ?? 0;
}

const TERM_DAYS: Record<BillingTerm, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  yearly: 365,
};

export function planUntilForTerm(term: BillingTerm, from: Date = new Date()): Date {
  return new Date(from.getTime() + TERM_DAYS[term] * 86400000);
}

export function effectivePlan(planTier: string | null, planUntil: string | null): PlanId {
  if (planTier === "enterprise") {
    if (planUntil == null) return "enterprise";
    return new Date(planUntil).getTime() > Date.now() ? "enterprise" : "professional";
  }
  return "professional";
}

export function formatPaise(paise: number): string {
  if (paise === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: ENTERPRISE_CURRENCY,
    maximumFractionDigits: 0,
  }).format(paise / 100);
}
