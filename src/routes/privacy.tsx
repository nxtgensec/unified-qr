import { createFileRoute } from "@tanstack/react-router";

import { LegalLayout, LegalSection } from "@/components/layout/LegalLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Unified QR" },
      {
        name: "description",
        content: "How Unified QR collects, uses and protects your data.",
      },
      { property: "og:title", content: "Privacy Policy — Unified QR" },
      {
        property: "og:description",
        content: "How Unified QR collects, uses and protects your data.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="August 5, 2026">
      <LegalSection title="1. What we collect">
        <p>
          <strong className="text-foreground">Account information.</strong> When you sign in with
          Google, we receive only your name, email and avatar picture. We never receive or store
          your Google password.
        </p>
        <p>
          <strong className="text-foreground">QR codes you create.</strong> The content, design and
          settings of every QR code you save are stored in your account. They are only visible to
          you.
        </p>
        <p>
          <strong className="text-foreground">Scan analytics.</strong> For dynamic codes we record
          each scan's device type, country, referrer and timestamp.
        </p>
        <p>
          <strong className="text-foreground">Site visits.</strong> When someone visits the Unified
          QR website, we count a visit using a non-identifying visitor cookie, along with the page,
          device type, country and referrer.
        </p>
        <p>
          <strong className="text-foreground">Payments.</strong> Card and payment details are
          processed entirely by Cashfree. We never see or store your card number. We keep the order
          and payment identifiers needed to confirm your purchase.
        </p>
      </LegalSection>

      <LegalSection title="2. How we use your data">
        <p>
          We use your data to run the service: save and display your codes, serve dynamic links,
          show you your own analytics, count site visitors, secure your account and process plan
          upgrades. We do not sell your data, show you targeted ads or share it with marketers.
        </p>
      </LegalSection>

      <LegalSection title="3. Cookies and tracking">
        <p>
          Unified QR sets one cookie — <code className="text-foreground">visitor_id</code> — so we
          can count unique visitors per day. It contains a random identifier, is HttpOnly, expires
          after one year and cannot be used to identify you personally. We use no advertising
          cookies and no third-party trackers.
        </p>
      </LegalSection>

      <LegalSection title="4. Where your data lives">
        <p>
          Data is stored in Postgres on Supabase, with each account's records isolated by row-level
          security. The site is hosted on Vercel. Payments are processed by Cashfree, a regulated
          Indian payment provider.
        </p>
      </LegalSection>

      <LegalSection title="5. Data sharing">
        <p>
          We share data only with the processors needed to operate the service — Supabase
          (database), Vercel (hosting) and Cashfree (payments) — and only to the extent they need
          it. We never sell or rent your data.
        </p>
      </LegalSection>

      <LegalSection title="6. Data retention and deletion">
        <p>
          Your codes, scans and profile are kept while your account is active. The Community plan's
          analytics view shows the last 30 days; Pro shows full history. To delete your account and
          all associated data, email us at{" "}
          <a
            href="mailto:support@nxtgensec.org"
            className="text-foreground underline underline-offset-4"
          >
            support@nxtgensec.org
          </a>{" "}
          and we'll remove everything within 30 days.
        </p>
      </LegalSection>

      <LegalSection title="7. Security">
        <p>
          We use Google authentication, HTTPS everywhere, row-level security and server-side
          authorization checks on every user-scoped query. Your codes and analytics are never
          readable by other users.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes to this policy">
        <p>
          If we change this policy, we'll update the "Last updated" date above and note material
          changes here. Continued use after changes means you accept the updated policy.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>
          Questions about privacy? Email{" "}
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
