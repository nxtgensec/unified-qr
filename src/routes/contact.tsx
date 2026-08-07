import { createFileRoute } from "@tanstack/react-router";

import { LegalLayout, LegalSection } from "@/components/layout/LegalLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Unified QR" },
      {
        name: "description",
        content:
          "Get in touch with the Unified QR team — questions about QR codes, accounts, billing, refunds or feedback. We're here to help.",
      },
      { property: "og:title", content: "Contact Us — Unified QR" },
      {
        property: "og:description",
        content:
          "Questions, feedback or billing help — reach the Unified QR team at support@nxtgensec.org.",
      },
    ],
  }),
  component: ContactPage,
});

const GITHUB = "https://github.com/nxtgensec/unified-qr";

function ContactPage() {
  return (
    <LegalLayout title="Contact Us" updated="August 5, 2026">
      <LegalSection title="How to reach us">
        <p>
          We're here to help with anything — questions about QR codes, your account, billing,
          refunds or feedback about the product. Email us at{" "}
          <a
            href="mailto:support@nxtgensec.org"
            className="text-foreground underline underline-offset-4"
          >
            support@nxtgensec.org
          </a>{" "}
          and we'll get back to you as soon as we can.
        </p>
      </LegalSection>

      <LegalSection title="Response times">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>General questions and support: usually within 1–2 business days.</li>
          <li>Billing, refund and cancellation requests: within 3 business days.</li>
          <li>Abuse or security reports: as quickly as possible.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Open source and community">
        <p>
          Unified QR is built in public. For bug reports and feature requests, open an issue on{" "}
          <a
            href={GITHUB}
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline underline-offset-4"
          >
            GitHub
          </a>
          , and for questions and ideas join the{" "}
          <a
            href={`${GITHUB}/discussions`}
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline underline-offset-4"
          >
            discussions
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Business details">
        <p>
          The Service is operated by NxtGenSec Interns. For official correspondence, email{" "}
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
