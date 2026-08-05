import { createFileRoute } from "@tanstack/react-router";

import { LegalLayout, LegalSection } from "@/components/LegalLayout";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      { title: "Refund Policy — Unified QR" },
      {
        name: "description",
        content: "Returns, refunds and cancellations for Unified QR Enterprise purchases.",
      },
      { property: "og:title", content: "Refund Policy — Unified QR" },
      {
        property: "og:description",
        content: "Returns, refunds and cancellations for Unified QR Enterprise purchases.",
      },
    ],
  }),
  component: RefundsPage,
});

function RefundsPage() {
  return (
    <LegalLayout title="Refund Policy" updated="August 5, 2026">
      <LegalSection title="1. Digital services are non-returnable">
        <p>
          Enterprise access is a digital service, not a physical product, so there is no "return" in
          the usual sense. Because access is granted immediately on payment, most purchases are
          non-refundable once Enterprise features have been used.
        </p>
      </LegalSection>

      <LegalSection title="2. 7-day money-back guarantee">
        <p>
          If you buy Enterprise and haven't used any Enterprise feature — no dynamic code created
          and no bulk CSV export — we'll refund the full amount. Email us within 7 days of purchase
          at{" "}
          <a
            href="mailto:support@nxtgensec.org"
            className="text-foreground underline underline-offset-4"
          >
            support@nxtgensec.org
          </a>{" "}
          with the email on your account, and we'll process it.
        </p>
      </LegalSection>

      <LegalSection title="3. Cancellation">
        <p>
          You can stop using Enterprise at any time — just don't renew, or email us to cancel.
          Cancelling never deactivates your codes: static codes and dynamic links keep working, and
          your account simply returns to Professional limits when the paid period ends. There are no
          partial refunds for unused days of a current period, except where required by law.
        </p>
      </LegalSection>

      <LegalSection title="4. Failed or duplicate charges">
        <p>
          If a payment succeeds but Enterprise access isn't granted within 24 hours, or you're
          charged twice for the same period, we'll refund the affected charge in full — just email
          us.
        </p>
      </LegalSection>

      <LegalSection title="5. How refunds are paid">
        <p>
          Refunds go back to the original payment method through Razorpay within 7–10 business days
          of approval. You'll get a confirmation email once the refund is issued.
        </p>
      </LegalSection>

      <LegalSection title="6. Contact">
        <p>
          All refund and cancellation requests:{" "}
          <a
            href="mailto:support@nxtgensec.org"
            className="text-foreground underline underline-offset-4"
          >
            support@nxtgensec.org
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
