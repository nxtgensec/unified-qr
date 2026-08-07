import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ENTERPRISE_TERMS, PLANS, formatPaise, termPaise, type BillingTerm } from "@/lib/plans";
import { createCashfreeOrder, requestUpgrade } from "@/lib/plans.functions";
import { cn } from "@/lib/utils";

type CashfreeCheckoutOptions = {
  paymentSessionId: string;
  redirectTarget: "_self" | "_top" | "_blank" | "_modal";
};

declare global {
  interface Window {
    Cashfree?: new (config: { mode: "sandbox" | "production" }) => {
      checkout: (options: CashfreeCheckoutOptions) => Promise<unknown>;
    };
  }
}

function loadCashfree(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Cashfree) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load the payment gateway."));
    document.head.appendChild(script);
  });
}

const ENTERPRISE = PLANS.enterprise;

export function UpgradeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createOrder = useServerFn(createCashfreeOrder);
  const request = useServerFn(requestUpgrade);
  const queryClient = useQueryClient();
  const [term, setTerm] = useState<BillingTerm>("yearly");
  const [paying, setPaying] = useState(false);

  const selected = ENTERPRISE_TERMS.find((t) => t.id === term) ?? ENTERPRISE_TERMS[2];
  const price = termPaise(term);

  const pay = async () => {
    setPaying(true);
    try {
      const order = await createOrder({ data: { term } });
      if (!order.available) {
        if ("alreadyPaid" in order) {
          toast.success("Your Pro access is already active — reload to see it.");
          void queryClient.invalidateQueries({ queryKey: ["plan"] });
          void queryClient.invalidateQueries({ queryKey: ["codes"] });
          void queryClient.invalidateQueries({ queryKey: ["analytics"] });
          onOpenChange(false);
          return;
        }
        await request();
        toast.success("Upgrade request received — we'll email you to complete payment.");
        onOpenChange(false);
        return;
      }

      await loadCashfree();
      if (!window.Cashfree) throw new Error("Payment gateway unavailable.");

      const cashfree = new window.Cashfree({ mode: order.mode });
      await cashfree.checkout({
        paymentSessionId: order.paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade to Pro</DialogTitle>
          <DialogDescription>
            Unlimited dynamic codes, full scan history and bulk CSV export. Your existing codes stay
            exactly as they are — nothing gets recreated or reprinted.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ENTERPRISE_TERMS.map((option) => {
            const active = term === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTerm(option.id)}
                className={cn(
                  "relative min-h-14 rounded-nav border px-3 py-3 text-left transition-colors",
                  active
                    ? "border-brand bg-brand/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-ring",
                )}
              >
                {option.id === "yearly" && (
                  <span className="absolute -top-2 right-2 rounded-full border border-brand/40 bg-background px-2 py-0.5 text-small font-medium text-brand">
                    Best value
                  </span>
                )}
                <span className="block text-small font-medium">{option.label}</span>
                <span className="mt-0.5 block text-small">
                  {formatPaise(option.paise)}
                  <span className="text-small text-muted-foreground"> / {option.per}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-caption uppercase tracking-wider text-muted-foreground">Pro</p>
          <p className="mt-2 text-h1 font-semibold tracking-tight">
            {formatPaise(selected.paise)}
            <span className="ml-1 text-small font-normal text-muted-foreground">
              / {selected.per}
            </span>
          </p>
          <ul className="mt-4 space-y-2">
            {ENTERPRISE.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-small">
                <Check className="mt-0.5 size-icon-sm shrink-0 text-brand" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <Button size="lg" className="w-full" disabled={paying} onClick={() => void pay()}>
          {paying ? (
            <Loader2 className="size-icon-sm animate-spin" />
          ) : (
            <CreditCard className="size-icon-sm" />
          )}
          {paying ? "Opening payment…" : `Pay ${formatPaise(price)} with Cashfree`}
        </Button>
        <p className="text-center text-small leading-relaxed text-muted-foreground">
          Secured by Cashfree. Access lasts for the period you choose and doesn't auto-renew. By
          paying you agree to our{" "}
          <a href="/terms" className="underline underline-offset-2 hover:text-foreground">
            Terms
          </a>
          ,{" "}
          <a href="/payment" className="underline underline-offset-2 hover:text-foreground">
            Payment
          </a>{" "}
          and{" "}
          <a href="/refunds" className="underline underline-offset-2 hover:text-foreground">
            Refund
          </a>{" "}
          policies. Your codes stay live either way.
        </p>
      </DialogContent>
    </Dialog>
  );
}
