import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Check,
  Download,
  Layers,
  MousePointerClick,
  Palette,
  QrCode,
  RefreshCw,
  ScanLine,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { BetaBadge } from "@/components/BetaBadge";
import { GoogleIcon } from "@/components/GoogleIcon";
import { Logo } from "@/components/Logo";
import { QrPreview } from "@/components/qr/QrPreview";
import { QrStudio } from "@/components/qr/QrStudio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { ENTERPRISE_TERMS, formatPaise } from "@/lib/plans";
import { defaultStyle } from "@/lib/qr/types";
import type { QrStyle } from "@/lib/qr/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Unified QR — Every QR code job in one place" },
      {
        name: "description",
        content:
          "Generate, style, track and manage every kind of QR code from one dark, minimal workspace. Professional is free forever; Enterprise adds unlimited dynamic codes.",
      },
      { property: "og:title", content: "Unified QR — Every QR code job in one place" },
      {
        property: "og:description",
        content:
          "Dynamic codes, scan analytics, logos and SVG export. Professional is free forever — no watermarks, no expiry, no trial traps.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: QrCode,
    title: "19 code types",
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
    body: "Print once, change the destination whenever you like — up to 3 free.",
    beta: false,
  },
  {
    icon: BarChart3,
    title: "Scan analytics",
    body: "Scans over time, device split and country — free on the 30-day window.",
    beta: true,
  },
  {
    icon: Layers,
    title: "Bulk from CSV",
    body: "Paste a list, get a whole batch of codes in one pass — Enterprise.",
    beta: true,
  },
  {
    icon: ScanLine,
    title: "Decode an image",
    body: "Drop in a QR picture and read what is inside it.",
    beta: true,
  },
];

const STEPS = [
  {
    icon: MousePointerClick,
    title: "Choose a code",
    body: "Pick one of 19 types — a link, Wi-Fi, a contact card, an event and more.",
  },
  {
    icon: Palette,
    title: "Make it yours",
    body: "Shape, color and logo it. The preview updates the instant you type.",
  },
  {
    icon: Download,
    title: "Share it anywhere",
    body: "Export PNG or SVG, or go dynamic and swap the destination later.",
  },
];

const COMPARISON = [
  { label: "Dynamic, editable codes", them: "Paid plan", us: "Free (3)" },
  { label: "Scan analytics", them: "Paid plan", us: "Free (30 days)" },
  { label: "SVG / vector export", them: "Paid or limited", us: "Free" },
  { label: "Watermark-free downloads", them: "Sometimes", us: "Always" },
  { label: "Codes expire on free tier", them: "Often", us: "Never" },
  { label: "Try before signing up", them: "Rarely", us: "Yes" },
  { label: "Bulk generation", them: "Enterprise", us: "Enterprise" },
];

const PRICING = [
  {
    id: "professional",
    name: "Professional",
    tagline: "For a QR code that just works — free, forever.",
    price: "Free",
    per: "forever",
    terms: false,
    featured: false,
    cta: "Sign in with Google",
    features: [
      "All 19 code types, none paywalled",
      "3 dynamic codes",
      "Unlimited static codes",
      "30-day scan analytics",
      "Watermark-free PNG + SVG export",
      "No expiry, no scan caps, no ads",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For teams printing at volume and tracking everything.",
    terms: true,
    featured: true,
    cta: "Upgrade",
    features: [
      "Unlimited dynamic codes",
      "Full scan history, never truncated",
      "Bulk generation from CSV",
      "Everything in Professional",
      "Priority support",
    ],
  },
];

const GUARANTEES = [
  {
    title: "No expiry",
    body: "Static and dynamic codes stay live forever, on every plan.",
  },
  {
    title: "No scan caps",
    body: "Any number of people can scan your codes — always.",
  },
  {
    title: "No deactivation",
    body: "Cancel or downgrade and your printed codes keep working.",
  },
  {
    title: "No reprints on upgrade",
    body: "Moving to Enterprise keeps every code and its slug. No recreating, no reprinting.",
  },
  {
    title: "No ads or watermarks",
    body: "The free plan stays clean — even on downloads.",
  },
  {
    title: "No card-required trials",
    body: "Professional is free without a card and without a timer.",
  },
];

const STATS = [
  { value: "19", label: "code types" },
  { value: "0", label: "paywalls or watermarks" },
  { value: "∞", label: "never expires" },
];

const MARQUEE = [
  "19 code types",
  "Real design control",
  "Dynamic codes",
  "Scan analytics",
  "Bulk from CSV",
  "Decode an image",
  "SVG export",
  "No watermark",
  "Never expires",
];

const TYPE_CHIPS = ["Link", "Wi-Fi", "Contact", "Email", "Event", "UPI", "SMS", "WhatsApp"];

const FAQ = [
  {
    q: "Do my codes expire?",
    a: "No. Every static code and dynamic link stays live forever — nothing expires, on any plan.",
  },
  {
    q: "Is there a scan limit?",
    a: "None. We track scans on dynamic codes, but there are no caps on how many people can scan.",
  },
  {
    q: "Can I change a code after it's printed?",
    a: "Yes, if it's dynamic. Print it once, then edit the destination any time from your dashboard — the printed code keeps working.",
  },
  {
    q: "Is it really free?",
    a: "Professional is free forever after a Google sign-in: all 19 code types, 3 dynamic links, 30 days of analytics and vector downloads. No card, no trial timer. Enterprise adds unlimited dynamic codes and bulk export at a flat price.",
  },
  {
    q: "What happens to my codes if I upgrade or cancel?",
    a: "Nothing changes. Upgrading keeps every code, slug and scan — you never recreate or reprint. And unlike some big QR platforms, cancelling never deactivates the codes you've already printed.",
  },
  {
    q: "What formats can I download?",
    a: "PNG for print and web, and SVG vectors that scale to any size — both watermark-free.",
  },
  {
    q: "Do I need an account?",
    a: "Links and text work without one. Sign in with Google to save your codes on the free Professional plan.",
  },
];

const DEMO_STYLE: QrStyle = {
  ...defaultStyle,
  fg: "#0f172a",
  bg: "#ffffff",
  gradientType: "linear",
  gradientEnd: "#0d9488",
  gradientAngle: 135,
};

function HeroScanner() {
  const [value, setValue] = useState("https://qr.nxtgensec.org");
  const [visitors, setVisitors] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: "/" }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { today?: number } | null) => {
        if (!cancelled && data && typeof data.today === "number") setVisitors(data.today);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative">
      <div className="absolute -inset-10 rounded-full bg-brand/15 blur-3xl" aria-hidden />
      <div className="relative rounded-3xl border border-border bg-elevated p-5 shadow-2xl shadow-black/40 sm:p-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Live encoder
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
            Scanning
          </span>
        </div>

        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type a link or text…"
          className="mt-5 font-mono"
        />

        <div className="relative mt-5 overflow-hidden rounded-xl">
          <QrPreview
            payload={value.trim() || " "}
            style={DEMO_STYLE}
            size={420}
            className="border-0"
          />
          <span className="scan-beam" aria-hidden />
          <span className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 border-l-2 border-t-2 border-brand" />
          <span className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 border-r-2 border-t-2 border-brand" />
          <span className="pointer-events-none absolute bottom-2.5 left-2.5 h-4 w-4 border-b-2 border-l-2 border-brand" />
          <span className="pointer-events-none absolute bottom-2.5 right-2.5 h-4 w-4 border-b-2 border-r-2 border-brand" />
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {TYPE_CHIPS.map((chip, i) => (
            <span
              key={chip}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
            >
              <span
                className={
                  i === 0 ? "h-1 w-1 rounded-full bg-brand" : "h-1 w-1 rounded-full bg-border"
                }
              />
              {chip}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs">
          <span className="text-muted-foreground">Renders as you type</span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {visitors === null ? (
              <span>Tracking real visitors</span>
            ) : (
              <span className="tabular-nums">
                {visitors.toLocaleString("en-US")} visitors today
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

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
  const goUpgrade = () => void navigate({ to: signedIn ? "/settings" : "/auth" });

  return (
    <div className="min-h-screen scroll-smooth bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <Logo className="size-7" />
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
              href="#how"
              className="hidden px-3 text-sm text-muted-foreground transition-colors hover:text-foreground md:block"
            >
              How it works
            </a>
            <a
              href="#pricing"
              className="hidden px-3 text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Pricing
            </a>
            <a
              href="#compare"
              className="hidden px-3 text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Compare
            </a>
            <a
              href="#faq"
              className="hidden px-3 text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              FAQ
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
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                Professional is free forever — no card, no trial timer.
              </span>
              <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
                Every QR code job, in <span className="text-brand">one place.</span>
              </h1>
              <p className="mt-5 max-w-md text-pretty text-base text-muted-foreground sm:text-lg">
                Generate, design, track and manage QR codes without hitting a paywall three clicks
                in. Type something in the encoder — it becomes a code instantly.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={goAuth}>
                  {signedIn ? "Open dashboard" : "Sign in with Google"}
                  <GoogleIcon className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <a href="#generator">
                    Full generator <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {["No watermark", "Never expires", "No card required"].map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-brand" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <HeroScanner />
          </div>
        </section>

        <section className="overflow-hidden border-b border-border py-4" aria-hidden>
          <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap">
            {[...MARQUEE, ...MARQUEE].map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-3 text-sm text-muted-foreground"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                {item}
              </span>
            ))}
          </div>
        </section>

        <section id="generator" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <div className="mx-auto max-w-4xl">
              <span className="font-mono text-xs uppercase tracking-widest text-brand">
                01 — Try it now
              </span>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Make one right now
                  </h2>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Links and text, free without login. Sign in for the other seventeen types.
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={goAuth}>
                  Sign in — it's free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-8">
                <QrStudio mode="free" onLocked={goAuth} />
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-5 py-12">
            <dl className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border">
              {STATS.map((s) => (
                <div key={s.label} className="text-center sm:px-6">
                  <dd className="text-3xl font-semibold tracking-tight sm:text-4xl">{s.value}</dd>
                  <dt className="mt-2 text-sm text-muted-foreground">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="features" className="border-b border-border">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:py-20 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <span className="font-mono text-xs uppercase tracking-widest text-brand">
                02 — The workspace
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                One workspace instead of five tabs
              </h2>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                Free tools first, with transparent limits only where they matter — and nothing that
                ever breaks a printed code.
              </p>
              <Button className="mt-6" variant="secondary" asChild>
                <a href="#generator">
                  Make a code <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
            <div className="divide-y divide-border">
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className="group grid gap-2 py-6 sm:grid-cols-[56px_minmax(0,1fr)] sm:gap-6"
                >
                  <span className="font-mono text-xs text-muted-foreground transition-colors group-hover:text-brand">
                    0{i + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <f.icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-brand" />
                      <h3 className="text-sm font-medium">{f.title}</h3>
                      {f.beta && <BetaBadge />}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <span className="font-mono text-xs uppercase tracking-widest text-brand">
              03 — Honest pricing
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              Two plans. Zero bait-and-switch.
            </h2>
            <p className="mt-3 max-w-lg text-sm text-muted-foreground">
              The free tier is a real plan, not a 7-day trial in disguise. The paid tier exists for
              one reason: people who print QR codes for a living.
            </p>
            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {PRICING.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "relative rounded-2xl border bg-card p-7",
                    plan.featured && "border-brand/60",
                  )}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-7 rounded-full border border-brand/40 bg-background px-3 py-1 text-[11px] font-medium text-brand">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-base font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
                  {plan.terms ? (
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      {ENTERPRISE_TERMS.map((term) => (
                        <div
                          key={term.id}
                          className={cn(
                            "rounded-lg border px-3 py-2",
                            term.id === "yearly" ? "border-brand/50 bg-brand/5" : "border-border",
                          )}
                        >
                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            {term.label}
                            {term.id === "yearly" && (
                              <span className="ml-1.5 rounded-full border border-brand/40 px-1.5 py-px text-[10px] font-medium normal-case tracking-normal text-brand">
                                Best value
                              </span>
                            )}
                          </p>
                          <p className="mt-0.5 text-lg font-semibold tracking-tight">
                            {formatPaise(term.paise)}
                            <span className="text-xs font-normal text-muted-foreground">
                              {" "}
                              / {term.per}
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-5 text-4xl font-semibold tracking-tight">
                      {plan.price}
                      <span className="ml-1 text-sm font-normal text-muted-foreground">
                        {plan.per}
                      </span>
                    </p>
                  )}
                  <ul className="mt-6 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-8 w-full"
                    size="lg"
                    variant={plan.featured ? "default" : "secondary"}
                    onClick={plan.featured ? goUpgrade : goAuth}
                  >
                    {plan.cta}
                    {!plan.featured && <GoogleIcon className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-2xl border border-border bg-elevated p-6 sm:p-8">
              <h3 className="text-sm font-medium">The anti-trap guarantee</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Named after the industry's most-complained-about behaviors — the QR companies that
                hold your codes hostage.
              </p>
              <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                {GUARANTEES.map((g) => (
                  <div key={g.title}>
                    <p className="flex items-center gap-1.5 text-sm font-medium">
                      <Check className="h-3.5 w-3.5 shrink-0 text-brand" /> {g.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{g.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <span className="font-mono text-xs uppercase tracking-widest text-brand">
              04 — The workflow
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              Three steps to a working code
            </h2>
            <div className="relative mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
              <span
                className="absolute left-[16%] right-[16%] top-5 hidden border-t border-dashed border-border sm:block"
                aria-hidden
              />
              {STEPS.map((step, i) => (
                <div key={step.title} className="relative text-center sm:px-2">
                  <div className="relative z-10 mx-auto flex size-10 items-center justify-center rounded-full border border-border bg-card">
                    <step.icon className="h-4 w-4" />
                  </div>
                  <span className="mt-3 block font-mono text-xs text-muted-foreground">
                    0{i + 1}
                  </span>
                  <h3 className="mt-1 text-sm font-medium">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="compare" className="border-b border-border">
          <div className="mx-auto max-w-4xl px-5 py-16 sm:py-20">
            <span className="font-mono text-xs uppercase tracking-widest text-brand">
              05 — The difference
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              What the big three charge for
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Checked against the free tiers of QRCode Monkey, Bitly and Uniqode — the three
              most-used QR platforms in 2026.
            </p>
            <div className="mt-10 overflow-hidden rounded-2xl border border-border">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-border bg-elevated px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                <span>Capability</span>
                <span className="w-28 text-right">Typical tool</span>
                <span className="flex w-24 items-center justify-end gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-brand" />
                  Unified QR
                </span>
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
                    <Check className="h-3.5 w-3.5 text-brand" />
                    {row.us}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free-tier terms as published by each platform. QRCode Monkey is free but static-only —
              no editing or tracking. Bitly and Uniqode put dynamic codes, analytics and design
              behind paid plans, and some deactivate your codes entirely when you cancel.
            </p>
          </div>
        </section>

        <section id="faq" className="border-b border-border">
          <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
            <span className="font-mono text-xs uppercase tracking-widest text-brand">
              06 — Good to know
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              Questions, answered
            </h2>
            <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card">
              {FAQ.map((item) => (
                <details key={item.q} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-b border-border">
          <div className="grid-noise pointer-events-none absolute inset-0 opacity-30" aria-hidden />
          <div className="relative mx-auto max-w-3xl px-5 py-20 text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-brand">
              07 — No trial timer
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              Sign in once with Google
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              No passwords, no credit card, no trial timer. Professional stays free forever — your
              codes and their scan history live in your account.
            </p>
            <Button className="mt-8" size="lg" onClick={goAuth}>
              {signedIn ? "Open dashboard" : "Sign in with Google"}
              <GoogleIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col gap-6 border-b border-border py-10 sm:flex-row sm:items-start sm:justify-between">
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
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <a href="#generator" className="transition-colors hover:text-foreground">
              Generator
            </a>
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </a>
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#compare" className="transition-colors hover:text-foreground">
              Compare
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </a>
          </nav>
        </div>
        <div className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>Made by NxtGenSec Interns, for Everyone on the Internet.</span>
          <span>© {new Date().getFullYear()} Unified QR</span>
        </div>
      </footer>
    </div>
  );
}
