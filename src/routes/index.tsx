import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Check,
  Layers,
  Palette,
  QrCode,
  RefreshCw,
  ScanLine,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { BetaBadge } from "@/components/BetaBadge";
import { Logo } from "@/components/Logo";
import { QrStudio } from "@/components/qr/QrStudio";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Unified QR — Every QR code job in one place" },
      {
        name: "description",
        content:
          "Generate, style, track and manage every kind of QR code from one dark, minimal workspace. Free without an account, everything free with Google sign-in.",
      },
      { property: "og:title", content: "Unified QR — Every QR code job in one place" },
      {
        property: "og:description",
        content:
          "Dynamic codes, scan analytics, logos and SVG export — all free. No watermarks, no expiry.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: QrCode,
    title: "11 code types",
    body: "Links, Wi-Fi, contacts, events, payments and more — none of them paywalled.",
    beta: false,
  },
  {
    icon: Palette,
    title: "Real design control",
    body: "Module and corner shapes, custom colors, your logo in the middle.",
    beta: false,
  },
  {
    icon: RefreshCw,
    title: "Dynamic codes",
    body: "Print once, change the destination whenever you like.",
    beta: false,
  },
  {
    icon: BarChart3,
    title: "Scan analytics",
    body: "Scans over time, device split and country — free forever.",
    beta: true,
  },
  {
    icon: Layers,
    title: "Bulk from CSV",
    body: "Paste a list, get a whole batch of codes in one pass.",
    beta: true,
  },
  {
    icon: ScanLine,
    title: "Decode an image",
    body: "Drop in a QR picture and read what is inside it.",
    beta: true,
  },
];

const COMPARISON = [
  { label: "Dynamic, editable codes", them: "Paid plan", us: "Free" },
  { label: "Scan analytics", them: "Paid plan", us: "Free" },
  { label: "SVG / vector export", them: "Paid or limited", us: "Free" },
  { label: "Watermark-free downloads", them: "Sometimes", us: "Always" },
  { label: "Codes expire on free tier", them: "Often", us: "Never" },
  { label: "Try before signing up", them: "Rarely", us: "Yes" },
  { label: "Bulk generation", them: "Enterprise", us: "Free (Beta)" },
];

function Landing() {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(Boolean(session)),
    );
    return () => data.subscription.unsubscribe();
  }, []);

  const goAuth = () => void navigate({ to: signedIn ? "/dashboard" : "/auth" });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Logo className="size-5" />
            Unified QR
          </Link>
          <nav className="flex items-center gap-2">
            <a
              href="#features"
              className="hidden px-3 text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Features
            </a>
            <a
              href="#compare"
              className="hidden px-3 text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Compare
            </a>
            <Button size="sm" onClick={goAuth}>
              {signedIn ? "Dashboard" : "Sign in"}
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="grid-noise pointer-events-none absolute inset-0 opacity-40" aria-hidden />
          <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" /> Everything free. Login only unlocks more.
              </span>
              <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
                Every QR code job, in one place
              </h1>
              <p className="mt-5 text-pretty text-base text-muted-foreground sm:text-lg">
                Generate, design, track and manage QR codes without hitting a paywall three clicks
                in. Start below — no account needed.
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-4xl rounded-2xl border border-border bg-card p-5 sm:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-medium">Instant generator</h2>
                  <p className="text-xs text-muted-foreground">
                    Links and text, free without login. Sign in for the other nine types.
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={goAuth}>
                  Unlock everything <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <QrStudio mode="free" onLocked={goAuth} />
            </div>
          </div>
        </section>

        <section id="features" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              One workspace instead of five tabs
            </h2>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">
              The features other platforms split across pricing tiers, gathered into a single
              dashboard.
            </p>
            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-card p-6">
                  <f.icon className="h-5 w-5 text-muted-foreground" />
                  <div className="mt-4 flex items-center gap-2">
                    <h3 className="text-sm font-medium">{f.title}</h3>
                    {f.beta && <BetaBadge />}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="compare" className="border-b border-border">
          <div className="mx-auto max-w-4xl px-5 py-16 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              What the big three charge for
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Based on the free tiers of the most-used QR platforms.
            </p>
            <div className="mt-10 overflow-hidden rounded-2xl border border-border">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-border bg-elevated px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                <span>Capability</span>
                <span className="w-28 text-right">Typical tool</span>
                <span className="w-24 text-right">Unified QR</span>
              </div>
              {COMPARISON.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-border px-5 py-3 text-sm last:border-b-0"
                >
                  <span>{row.label}</span>
                  <span className="flex w-28 items-center justify-end gap-1.5 text-muted-foreground">
                    <X className="h-3.5 w-3.5" />
                    {row.them}
                  </span>
                  <span className="flex w-24 items-center justify-end gap-1.5 font-medium">
                    <Check className="h-3.5 w-3.5" />
                    {row.us}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-3xl px-5 py-20 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Sign in once with Google
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              No passwords, no credit card, no trial timer. Your codes and their scan history stay
              in your account.
            </p>
            <Button className="mt-8" size="lg" onClick={goAuth}>
              {signedIn ? "Open dashboard" : "Sign in with Google"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-xs text-muted-foreground sm:flex-row">
        <span className="flex items-center gap-2">
          <Logo className="size-4" /> Unified QR
        </span>
        <span className="text-center sm:text-right">
          Made by NxtGenSec Interns, for Everyone on the Internet.
        </span>
      </footer>
    </div>
  );
}
