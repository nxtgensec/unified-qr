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
import { createRazorpayOrder, requestUpgrade, verifyRazorpayPayment } from "@/lib/plans.functions";
import { cn } from "@/lib/utils";

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  theme: { color: string };
  handler: (res: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: (res: Record<string, unknown>) => void) => void;
    };
  }
}

function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
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
  const queryClient = useQueryClient();
  const createOrder = useServerFn(createRazorpayOrder);
  const verify = useServerFn(verifyRazorpayPayment);
  const request = useServerFn(requestUpgrade);
  const [term, setTerm] = useState<BillingTerm>("yearly");
  const [paying, setPaying] = useState(false);

  const selected = ENTERPRISE_TERMS.find((t) => t.id === term) ?? ENTERPRISE_TERMS[2];
  const price = termPaise(term);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["plan"] });
    void queryClient.invalidateQueries({ queryKey: ["codes"] });
    void queryClient.invalidateQueries({ queryKey: ["analytics"] });
  };

  const pay = async () => {
    setPaying(true);
    try {
      const order = await createOrder({ data: { term } });
      if (!order.available) {
        await request();
        toast.success("Upgrade request received — we'll email you to complete payment.");
        onOpenChange(false);
        return;
      }

      await loadRazorpay();
      if (!window.Razorpay) throw new Error("Payment gateway unavailable.");

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Unified QR",
        description: "Enterprise plan",
        order_id: order.orderId,
        theme: { color: "#0d9488" },
        handler: async (res) => {
          try {
            await verify({
              data: {
                term,
                razorpayOrderId: res.razorpay_order_id,
                razorpayPaymentId: res.razorpay_payment_id,
                razorpaySignature: res.razorpay_signature,
              },
            });
            toast.success("Welcome to Enterprise!");
            refresh();
            onOpenChange(false);
          } catch {
            toast.error("Payment could not be verified. Contact support@nxtgensec.org.");
          }
        },
      });
      rzp.on("payment.failed", () => toast.error("Payment failed — you were not charged."));
      rzp.open();
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
          <DialogTitle>Upgrade to Enterprise</DialogTitle>
          <DialogDescription>
            Unlimited dynamic codes, full scan history and bulk CSV export. Your existing codes stay
            exactly as they are — nothing gets recreated or reprinted.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          {ENTERPRISE_TERMS.map((option) => {
            const active = term === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTerm(option.id)}
                className={cn(
                  "relative rounded-xl border px-3 py-3 text-left transition-colors",
                  active
                    ? "border-brand bg-brand/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-ring",
                )}
              >
                {option.id === "yearly" && (
                  <span className="absolute -top-2 right-2 rounded-full border border-brand/40 bg-background px-2 py-0.5 text-[10px] font-medium text-brand">
                    Best value
                  </span>
                )}
                <span className="block text-sm font-medium">{option.label}</span>
                <span className="mt-0.5 block text-sm">
                  {formatPaise(option.paise)}
                  <span className="text-xs text-muted-foreground"> / {option.per}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Enterprise</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {formatPaise(selected.paise)}
            <span className="ml-1 text-sm font-normal text-muted-foreground">/ {selected.per}</span>
          </p>
          <ul className="mt-4 space-y-2">
            {ENTERPRISE.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <Button size="lg" className="w-full" disabled={paying} onClick={() => void pay()}>
          {paying ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="mr-2 h-4 w-4" />
          )}
          {paying ? "Opening payment…" : `Pay ${formatPaise(price)} with Razorpay`}
        </Button>
        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          Secured by Razorpay. Access lasts for the period you choose and doesn't auto-renew. By
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
