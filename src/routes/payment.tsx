import { createFileRoute } from "@tanstack/react-router";

import { LegalLayout, LegalSection } from "@/components/layout/LegalLayout";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Payment Policy — Unified QR" },
      {
        name: "description",
        content: "How payments work on Unified QR — plans, prices, billing and renewal.",
      },
      { property: "og:title", content: "Payment Policy — Unified QR" },
      {
        property: "og:description",
        content: "How payments work on Unified QR — plans, prices, billing and renewal.",
      },
    ],
  }),
  component: PaymentPage,
});

function PaymentPage() {
  return (
    <LegalLayout title="Payment Policy" updated="August 5, 2026">
      <LegalSection title="1. Plans and prices">
        <p>
          <strong className="text-foreground">Professional</strong> is free forever — no card, no
          trial timer.
        </p>
        <p>
          <strong className="text-foreground">Enterprise</strong> is paid in Indian Rupees (INR) and
          costs:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>₹9 per day</li>
          <li>₹49 per week</li>
          <li>₹99 per month</li>
          <li>₹999 per year</li>
        </ul>
        <p>Shown prices are inclusive of applicable taxes.</p>
      </LegalSection>

      <LegalSection title="2. How you pay">
        <p>
          Payments are processed by Cashfree, which supports UPI, credit and debit cards, netbanking
          and wallets. Your card details go straight to Cashfree and are never handled or stored by
          us. You'll receive a receipt by email.
        </p>
      </LegalSection>

      <LegalSection title="3. What you get">
        <p>
          An Enterprise purchase grants access for the period you selected — one day, one week, one
          month or one year — starting the moment payment is verified. During that period you get
          unlimited dynamic codes, full scan history and bulk CSV export.
        </p>
      </LegalSection>

      <LegalSection title="4. Renewal">
        <p>
          Enterprise access does not auto-renew. When your paid period ends, your account returns to
          the free Professional limits automatically. To continue, buy Enterprise again for a new
          period — your codes, links and scans are never reset or removed.
        </p>
      </LegalSection>

      <LegalSection title="5. Changing your mind">
        <p>
          Cancellation and refund rules are in our{" "}
          <a href="/refunds" className="text-foreground underline underline-offset-4">
            Refund Policy
          </a>
          . Contact{" "}
          <a
            href="mailto:support@nxtgensec.org"
            className="text-foreground underline underline-offset-4"
          >
            support@nxtgensec.org
          </a>{" "}
          for any billing question.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
