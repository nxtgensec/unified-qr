import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Github } from "lucide-react";
import { type ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useSignedIn } from "@/hooks/use-signed-in";
import { cn } from "@/lib/utils";

const PUBLIC_LINKS = [
  { href: "/#types", label: "Code types" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#compare", label: "Compare" },
  { href: "/#why", label: "Why us" },
] as const;

export function PublicLayout({
  kicker,
  title,
  description,
  children,
}: {
  kicker?: string;
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hash = useRouterState({ select: (s) => s.location.hash });
  const navigate = useNavigate();
  const signedIn = useSignedIn();

  const goAuth = () => void navigate({ to: signedIn ? "/dashboard" : "/auth" });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-header max-w-main items-center justify-between gap-4 px-gutter">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 text-body font-semibold tracking-tight"
          >
            <Logo className="size-icon-sm" />
            <span className="hidden sm:inline">Unified QR</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {PUBLIC_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "flex min-h-11 items-center rounded-nav px-3 text-small transition-colors",
                  pathname === link.href.split("#")[0] && hash === `#${link.href.split("#")[1]}`
                    ? "bg-brand/10 text-foreground ring-1 ring-brand/30"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/nxtgensec/unified-qr"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="flex size-12 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Github className="size-icon-lg" strokeWidth={2} />
            </a>
            <Button size="sm" onClick={goAuth}>
              {signedIn ? "Dashboard" : "Sign in"}
            </Button>
          </div>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-main px-gutter py-14 sm:py-16">
          {kicker && (
            <p className="font-mono text-caption uppercase tracking-widest text-muted-foreground">
              {kicker}
            </p>
          )}
          {title && (
            <h1 className="mt-4 text-balance text-h1 font-semibold tracking-tight sm:text-hero">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-4 max-w-2xl text-pretty text-body text-muted-foreground sm:text-h2">
              {description}
            </p>
          )}
          {children}
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-main px-gutter py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-2.5 text-small font-semibold tracking-tight">
                <Logo />
                Unified QR
              </span>
              <span className="max-w-xs text-small text-muted-foreground">
                Every QR code job, in one place. Community is free forever — no watermarks, no
                expiry, no trial traps.
              </span>
            </div>
            <nav className="flex max-w-md flex-wrap gap-x-6 gap-y-2 text-small text-muted-foreground">
              {PUBLIC_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              <Link to="/privacy" className="transition-colors hover:text-foreground">
                Privacy
              </Link>
              <Link to="/terms" className="transition-colors hover:text-foreground">
                Terms
              </Link>
              <Link to="/payment" className="transition-colors hover:text-foreground">
                Payment
              </Link>
              <Link to="/refunds" className="transition-colors hover:text-foreground">
                Refunds
              </Link>
              <Link to="/contact" className="transition-colors hover:text-foreground">
                Contact
              </Link>
            </nav>
          </div>
          <p className="mt-6 text-small text-muted-foreground">
            © {new Date().getFullYear()} Unified QR · Built by NxtGenSec.
          </p>
        </div>
      </footer>
    </div>
  );
}
