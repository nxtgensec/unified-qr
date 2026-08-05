export type PlanId = "professional" | "enterprise";

export interface PlanDefinition {
  id: PlanId;
  name: string;
  tagline: string;
  currency: "INR";
  priceMonthlyPaise: number;
  priceYearlyPaise: number;
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
    currency: "INR",
    priceMonthlyPaise: 0,
    priceYearlyPaise: 0,
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
    currency: "INR",
    priceMonthlyPaise: 29900,
    priceYearlyPaise: 299900,
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

export const ENTERPRISE_PRICE = {
  monthlyPaise: PLANS.enterprise.priceMonthlyPaise,
  yearlyPaise: PLANS.enterprise.priceYearlyPaise,
  currency: PLANS.enterprise.currency,
} as const;

export function formatPaise(paise: number): string {
  if (paise === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}
