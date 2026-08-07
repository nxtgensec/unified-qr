import { createFileRoute } from "@tanstack/react-router";

import { LegalLayout, LegalSection } from "@/components/layout/LegalLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Unified QR" },
      {
        name: "description",
        content: "The terms that govern your use of Unified QR.",
      },
      { property: "og:title", content: "Terms of Service — Unified QR" },
      { property: "og:description", content: "The terms that govern your use of Unified QR." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="August 5, 2026">
      <LegalSection title="1. Acceptance of terms">
        <p>
          By using Unified QR (the "Service"), you agree to these Terms of Service. If you don't
          agree, please don't use the Service. The Service is operated by NxtGenSec Interns ("we",
          "us").
        </p>
      </LegalSection>

      <LegalSection title="2. Your account">
        <p>
          Signing in with Google creates an account. You're responsible for keeping your Google
          login secure and for everything that happens under your account. One account's codes and
          analytics are never visible to another account.
        </p>
      </LegalSection>

      <LegalSection title="3. Your content and acceptable use">
        <p>
          You own the content you put into QR codes. You grant us a limited license to host and
          serve that content so we can provide the Service to you.
        </p>
        <p>You agree not to use the Service to:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>create codes that are illegal, malicious, deceptive or harmful;</li>
          <li>phish, scam, distribute malware or violate anyone's rights;</li>
          <li>generate bulk traffic or abuse the Service's rate limits.</li>
        </ul>
        <p>
          We may remove content or suspend accounts that violate these rules. If you need to use QR
          codes for regulated or high-risk activity, check with your own counsel first.
        </p>
      </LegalSection>

      <LegalSection title="4. Dynamic links and availability">
        <p>
          Static QR codes encode their content directly and always work, no matter what. Dynamic
          codes depend on our servers to redirect. We work to keep the Service reliable but don't
          guarantee uninterrupted availability; you should keep a static fallback for anything
          critical.
        </p>
      </LegalSection>

      <LegalSection title="5. Plans and payments">
        <p>
          The Professional plan is free forever. The Enterprise plan is paid and grants access for
          the period you purchase. Payment terms, prices and renewal rules are described in our{" "}
          <a href="/payment" className="text-foreground underline underline-offset-4">
            Payment Policy
          </a>
          , and refunds in our{" "}
          <a href="/refunds" className="text-foreground underline underline-offset-4">
            Refund Policy
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="6. Cancellation and your codes">
        <p>
          You can stop using the Service at any time. Your codes are never deactivated because you
          stop paying — dynamic links and static codes keep working, and an expired Enterprise plan
          simply returns you to the free Professional limits.
        </p>
      </LegalSection>

      <LegalSection title="7. Intellectual property">
        <p>
          The Service, its branding, interface and software belong to us. Your QR content and
          generated images are yours, and you may use them commercially.
        </p>
      </LegalSection>

      <LegalSection title="8. Disclaimer and limitation of liability">
        <p>
          The Service is provided "as is" and "as available", without warranties of any kind, to the
          fullest extent permitted by law. We are not liable for indirect, incidental or
          consequential damages, including lost profits, arising from use of the Service. You use QR
          codes at your own discretion.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to these terms">
        <p>
          We may update these terms from time to time. Material changes will be reflected by the
          "Last updated" date. Continued use of the Service after changes means you accept them.
        </p>
      </LegalSection>

      <LegalSection title="10. Governing law and contact">
        <p>
          These terms are governed by the laws of India. Questions about these terms can be sent to{" "}
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
