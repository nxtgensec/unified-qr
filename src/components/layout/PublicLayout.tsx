import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { House, QrCode, Scale, ShieldCheck, Tag } from "lucide-react";
import { type ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useSignedIn } from "@/hooks/use-signed-in";
import { cn } from "@/lib/utils";

const BOTTOM_NAV = [
  { href: "/", label: "Home", icon: House },
  { href: "/#types", label: "Code types", icon: QrCode },
  { href: "/#compare", label: "Compare", icon: Scale },
  { href: "/#pricing", label: "Pricing", icon: Tag },
  { href: "/#why", label: "Why us", icon: ShieldCheck },
] as const;

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
  const activeHref = hash ? `/#${hash.replace(/^#/, "")}` : pathname;

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link to="/" className="flex shrink-0 items-center gap-2.5 font-semibold tracking-tight">
            <Logo className="size-7" />
            <span className="hidden sm:inline">Unified QR</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {PUBLIC_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors",
                  pathname === link.href.split("#")[0] && hash === `#${link.href.split("#")[1]}`
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <Button size="sm" onClick={goAuth}>
            {signedIn ? "Dashboard" : "Sign in"}
          </Button>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-6xl px-5 py-14 sm:py-16">
          {kicker && (
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {kicker}
            </p>
          )}
          {title && (
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              {description}
            </p>
          )}
          {children}
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
                <Logo className="size-7" />
                Unified QR
              </span>
              <span className="max-w-xs text-xs text-muted-foreground">
                Every QR code job, in one place. Professional is free forever — no watermarks, no
                expiry, no trial traps.
              </span>
            </div>
            <nav className="flex max-w-md flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
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
          <p className="mt-6 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Unified QR · Built by NxtGenSec.
          </p>
        </div>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {BOTTOM_NAV.map((item) => {
            const isActive = item.href === activeHref;
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-[10px] font-medium tracking-wide transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                    isActive && "bg-foreground text-background",
                  )}
                >
                  <item.icon className="size-4" />
                </span>
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
