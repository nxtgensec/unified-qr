import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";

const LEGAL_LINKS = [
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
  { to: "/payment", label: "Payment" },
  { to: "/refunds", label: "Refunds" },
  { to: "/contact", label: "Contact" },
] as const;

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-header max-w-6xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <Logo className="size-7" />
            Unified QR
          </Link>
          <nav className="flex items-center gap-2">
            <a
              href="/#pricing"
              className="hidden px-3 text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Pricing
            </a>
            <Link
              to="/"
              className="px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Back to generator
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-14 sm:py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">Legal</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 text-xs text-muted-foreground">Last updated: {updated}</p>
        <div className="mt-10 space-y-10">{children}</div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Logo className="size-6" />
              Unified QR
            </span>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Unified QR · Made by NxtGenSec Interns, for Everyone on the
            Internet.
          </p>
        </div>
      </footer>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
