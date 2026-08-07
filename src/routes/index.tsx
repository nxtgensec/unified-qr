import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bitcoin,
  Bone,
  CalendarCheck,
  CalendarDays,
  Check,
  Coins,
  Contact,
  CreditCard,
  EyeOff,
  Facebook,
  FileText,
  FolderOpen,
  Gem,
  Github,
  Globe,
  IndianRupee,
  Infinity as InfinityIcon,
  Instagram,
  Linkedin,
  Link2,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Minus,
  Music2,
  PenLine,
  Phone,
  QrCode,
  Send,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Terminal,
  Ticket,
  Twitter,
  Utensils,
  Wifi,
  X,
  XCircle,
  Youtube,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { GoogleIcon } from "@/components/brand/GoogleIcon";
import { Logo } from "@/components/brand/Logo";
import { HeroStudio } from "@/components/marketing/HeroStudio";
import { QrPreview } from "@/components/qr/QrPreview";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { useSignedIn } from "@/hooks/use-signed-in";
import { ENTERPRISE_TERMS, PLANS, formatPaise } from "@/lib/plans";
import { KINDS, buildPayload, defaultStyle } from "@/lib/qr/types";
import type { QrContent, QrKind } from "@/lib/qr/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Unified QR — Create QR codes, free forever" },
      {
        name: "description",
        content:
          "Create and download QR codes free, without an account. 32 code types, design control, dynamic codes and scan analytics — open source, no watermark, no expiry.",
      },
      { property: "og:title", content: "Unified QR — Create QR codes, free forever" },
      {
        property: "og:description",
        content:
          "Create, download and manage QR codes on one platform. Free forever, open source, built by NxtGenSec.",
      },
    ],
  }),
  component: Landing,
});

const GITHUB = "https://github.com/nxtgensec/unified-qr";

const NAV = [
  { label: "Generate", to: "/create" },
  { label: "Code types", href: "#types" },
  { label: "Features", href: "#ecosystem" },
  { label: "Security", href: "#security" },
  { label: "Pricing", href: "#pricing" },
] as const;

const TRUST = [
  { icon: Globe, label: "Open Source" },
  { icon: Lock, label: "Privacy first" },
  { icon: Zap, label: "Instant generation" },
  { icon: InfinityIcon, label: "Unlimited static QR" },
  { icon: XCircle, label: "No watermarks" },
] as const;

const STATS = [
  { icon: QrCode, value: String(KINDS.length), label: "QR code types" },
  { icon: Zap, value: "3", label: "Dynamic codes free" },
  { icon: BarChart3, value: "30-day", label: "Scan analytics" },
  { icon: Github, value: "Public", label: "Open-source repo" },
] as const;

const WHY = [
  {
    icon: BadgeCheck,
    title: "Free forever, not a trial",
    body: "The free plan has no credit card, no timer and no features that quietly expire.",
  },
  {
    icon: Lock,
    title: "No watermarks, no expiry",
    body: "Every download is clean, and every code you print stays live forever.",
  },
  {
    icon: Link2,
    title: "Change codes after printing",
    body: "Dynamic codes let you swap the destination any time — the printed code keeps working.",
  },
  {
    icon: FolderOpen,
    title: "No lock-in",
    body: "Export as SVG or PNG, keep your links, and move on whenever you like.",
  },
] as const;

const PILLARS = [
  {
    icon: PenLine,
    title: "Create",
    items: [
      `${KINDS.length} code types`,
      "Design control: colors, shapes, logo",
      "Watermark-free PNG, SVG, PDF & EPS",
    ],
  },
  {
    icon: FolderOpen,
    title: "Manage",
    items: [
      "Saved code library",
      "Dynamic, editable codes",
      "Password & expiry on dynamic codes",
      "Backup & restore your library",
    ],
  },
  {
    icon: BarChart3,
    title: "Analyze",
    items: ["Scan timeline", "By device and country", "30 days free, full history on Pro"],
  },
  {
    icon: Terminal,
    title: "Develop",
    items: [
      "Redirect endpoint",
      "Public repo on GitHub",
      "Bulk generation from CSV",
      "Decode any QR image",
    ],
  },
] as const;

const SECURITY = [
  {
    title: "Google OAuth sign-in",
    body: "No passwords stored on our side — auth runs through Google.",
  },
  {
    title: "Row-level security",
    body: "Every table is locked down so your codes and scans stay private to your account.",
  },
  {
    title: "Safe redirects",
    body: "Dynamic codes resolve through our domain, and you can swap the destination any time without reprinting.",
  },
  { title: "No ads, no resale", body: "Your data is not sold, scanned, or shown ads against." },
] as const;

const DEV_READY = [
  { title: "Open repository", body: "Read every line of the platform on GitHub." },
  {
    title: "Redirect endpoint",
    body: "Dynamic codes resolve through a stable short-link endpoint.",
  },
  {
    title: "Batch from CSV",
    body: "Generate thousands of codes programmatically from a spreadsheet.",
  },
  { title: "Decode tool", body: "Inspect the data inside any QR image." },
] as const;

const FAQ_TABS = [
  { id: "general", label: "Getting started" },
  { id: "free", label: "Free & pricing" },
  { id: "dynamic", label: "Dynamic & analytics" },
] as const;

type FaqTabId = (typeof FAQ_TABS)[number]["id"];

const FAQS: Record<FaqTabId, { q: string; a: string }[]> = {
  general: [
    {
      q: "Do I need an account?",
      a: "No. Website and text codes download instantly without one. Sign in with Google to save codes to your library on the free Community plan — no password, no credit card.",
    },
    {
      q: "Which code types are available?",
      a: `All ${KINDS.length}: websites, text, Wi-Fi, contacts, email, SMS, calls, WhatsApp, events, locations, UPI and PayPal payments, crypto wallets (Bitcoin, Ethereum, Solana, Litecoin, Dogecoin, Monero), social profiles, app downloads, reviews (Google, Trustpilot, Yelp, Booking), coupons, YouTube, LinkedIn, Telegram, Instagram, TikTok, Facebook and X.`,
    },
    {
      q: "Is Unified QR really open source?",
      a: "Yes — the platform source is public on GitHub. You can read the code, open issues, and follow along as we build in public.",
    },
  ],
  free: [
    {
      q: "Is it really free?",
      a: `Community is free forever after a Google sign-in: all ${KINDS.length} code types, 3 dynamic links, 30 days of analytics and vector downloads. No card, no trial timer.`,
    },
    {
      q: "What does the free tier not include?",
      a: "Only the volume features are paid: unlimited dynamic codes, lifetime scan history, bulk CSV generation and priority support.",
    },
    {
      q: "What happens if I cancel or upgrade?",
      a: "Nothing breaks. Upgrading keeps every code and slug, and cancelling never deactivates codes you've already printed.",
    },
  ],
  dynamic: [
    {
      q: "Do my codes expire?",
      a: "No. Every static code and dynamic link stays live forever, on any plan.",
    },
    {
      q: "Can I change a code after it's printed?",
      a: "Yes, if it's dynamic. Print it once, then edit the destination any time — the printed code keeps working.",
    },
    {
      q: "How do scan analytics work?",
      a: "Dynamic codes report scans over time, by device and by country. Community keeps 30 days of history; Pro keeps it forever.",
    },
  ],
};

const ICONS: Record<QrKind, LucideIcon> = {
  url: Link2,
  text: FileText,
  wifi: Wifi,
  vcard: Contact,
  email: Mail,
  sms: MessageSquare,
  phone: Phone,
  whatsapp: MessageCircle,
  event: CalendarDays,
  geo: MapPin,
  upi: IndianRupee,
  social: Share2,
  app: Smartphone,
  bitcoin: Bitcoin,
  ethereum: Gem,
  solana: Sparkles,
  litecoin: Coins,
  dogecoin: Bone,
  monero: EyeOff,
  paypal: CreditCard,
  googlereview: Star,
  trustpilot: BadgeCheck,
  yelp: Utensils,
  booking: CalendarCheck,
  coupon: Ticket,
  youtube: Youtube,
  linkedin: Linkedin,
  telegram: Send,
  instagram: Instagram,
  tiktok: Music2,
  facebook: Facebook,
  x: Twitter,
};

const SAMPLES: Record<QrKind, QrContent> = {
  url: { url: "https://example.com" },
  text: { text: "Hello from Unified QR" },
  wifi: { ssid: "Cafe-WiFi", password: "visit-again", encryption: "WPA" },
  vcard: {
    name: "Ada Lovelace",
    org: "Unified QR",
    title: "Engineer",
    phone: "+15550100",
    phone2: "+15550199",
    email: "ada@example.com",
    website: "https://example.com",
    address: "1 Example Street",
    city: "London",
    country: "United Kingdom",
  },
  email: { to: "hello@example.com", subject: "Hello", body: "Hi from Unified QR" },
  sms: { phone: "+15550100", message: "Hello from Unified QR" },
  phone: { phone: "+15550100" },
  whatsapp: { phone: "15550100", message: "Hello from Unified QR" },
  event: {
    title: "Product launch",
    location: "Berlin",
    start: "2026-08-20T10:00",
    end: "2026-08-20T12:00",
  },
  geo: { lat: "52.5200", lng: "13.4050" },
  upi: { vpa: "name@bank", name: "Ada Lovelace", amount: "250", note: "Invoice 24" },
  social: { platform: "facebook", url: "https://facebook.com/yourpage" },
  app: {
    name: "My App",
    ios: "https://apps.apple.com/app/id123",
    android: "https://play.google.com/store/apps/details?id=com.example",
  },
  bitcoin: {
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    amount: "0.001",
    label: "Invoice 42",
  },
  ethereum: {
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    amount: "0.1",
    label: "Invoice 42",
  },
  solana: { address: "7EcES...sollet", amount: "1", label: "Invoice 42" },
  litecoin: { address: "LcCb1J6TLLKpQYH", amount: "0.5" },
  dogecoin: { address: "D8m4V8eW4Z", amount: "500" },
  monero: { address: "4AdUndXHHZ", amount: "0.02", label: "Invoice 42" },
  paypal: { username: "yourname", amount: "25" },
  googlereview: { placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4", url: "" },
  trustpilot: { url: "https://trustpilot.com/review/example.com" },
  yelp: { url: "https://yelp.com/biz/your-business" },
  booking: { url: "https://www.booking.com/hotel/example" },
  coupon: { code: "SAVE20", discount: "20% off", description: "Valid until Dec 31" },
  youtube: { url: "https://youtube.com/@channel" },
  linkedin: { url: "https://linkedin.com/in/username" },
  telegram: { username: "username" },
  instagram: { username: "username" },
  tiktok: { username: "username" },
  facebook: { username: "yourpage" },
  x: { username: "username" },
};

const TOP_TYPES: QrKind[] = [
  "url",
  "text",
  "wifi",
  "vcard",
  "email",
  "whatsapp",
  "phone",
  "sms",
  "event",
  "geo",
  "upi",
  "paypal",
];

const COMPETITORS = [
  {
    name: "QR TIGER",
    url: "https://www.qrcode-tiger.com/",
    entry: "$7/mo",
    entryNote: "12 dynamic codes",
    free: "3 dynamic codes",
    freeNote: "500 scans each, + branding",
    catch: "Analytics, bulk and design gate behind $16–$37 tiers.",
  },
  {
    name: "Bitly",
    url: "https://bitly.com/",
    entry: "$10/mo",
    entryNote: "5 QR codes / month",
    free: "2 dynamic codes / month",
    freeNote: "ads shown on free scans",
    catch: "Monthly quotas; real analytics need Premium ($199).",
  },
  {
    name: "Uniqode",
    url: "https://www.uniqode.com/",
    entry: "$5/mo",
    entryNote: "3 dynamic codes",
    free: "14-day trial",
    freeNote: "annual billing after",
    catch: "Analytics retention drops to 30 days on entry tiers.",
  },
  {
    name: "Flowcode",
    url: "https://flowcode.com/",
    entry: "$60/mo",
    entryNote: "50 dynamic codes",
    free: "2 dynamic codes",
    freeNote: "500 scan records kept",
    catch: "A giant jump from free straight to $60 — no mid-tier.",
  },
  {
    name: "QRCode Monkey",
    url: "https://www.qrcode-monkey.com/",
    entry: "$9.99/mo",
    entryNote: "or $149 lifetime",
    free: "Static codes only",
    freeNote: "no analytics, no editing",
    catch: "Dynamic codes require paid; they expire if you cancel.",
  },
] as const;

const COMPARE_MATRIX = [
  {
    feature: "Dynamic, editable codes",
    us: "Free (3)",
    cells: ["$7/mo (12)", "$10/mo (5/mo)", "$5/mo (3)", "Free (2)", "$9.99/mo"],
  },
  {
    feature: "Scan analytics",
    us: "Free · 30 days",
    cells: ["Paid tiers", "Paid tiers", "Paid tiers", "500 records", "None"],
  },
  {
    feature: "Full design control + logo",
    us: "Free",
    cells: ["Paid", "Paid", "Paid", "Pro ($60)", "Free (static)"],
  },
  {
    feature: "Watermark-free PNG + SVG",
    us: "Free",
    cells: ["Paid", "Paid", "Paid", "—", "Free (static)"],
  },
  {
    feature: "Bulk generation (CSV)",
    us: "Pro",
    cells: ["Advanced ($16)", "Growth ($29)", "Lite ($15)", "Growth ($250)", "No"],
  },
  {
    feature: "Ads injected on scans",
    us: "Never",
    cells: ["Free tier", "Free tier", "No", "No", "No"],
  },
  {
    feature: "Codes survive cancellation",
    us: "Always",
    cells: ["No", "No", "Varies", "No", "No"],
  },
  {
    feature: "Free tier = real plan, not a trial",
    us: "Yes",
    cells: ["Limited", "No", "No", "Limited", "Static only"],
  },
] as const;

const PLAN_MATRIX = [
  { feature: "All 32 code types", free: true, pro: true },
  { feature: "Unlimited static codes", free: true, pro: true },
  { feature: "Dynamic, editable codes", free: "3", pro: "Unlimited" },
  { feature: "Scan analytics", free: "30 days", pro: "Full history" },
  { feature: "PNG export", free: true, pro: true },
  { feature: "SVG vector export", free: true, pro: true },
  { feature: "Bulk generation (CSV)", free: false, pro: true },
  { feature: "Priority support", free: false, pro: true },
  { feature: "No ads, no watermark, no expiry", free: true, pro: true },
] as const;

const PRICING_FAQ = [
  {
    q: "Is Community really free forever?",
    a: "Yes. Sign in with Google and it stays free — no card, no trial timer, no feature that quietly expires. You keep your codes, your analytics window and every export.",
  },
  {
    q: "What does Pro actually add?",
    a: "Unlimited dynamic codes, the full scan history instead of 30 days, and bulk generation from a CSV. If you print QR codes for a living, that's the plan — nothing else is paywalled.",
  },
  {
    q: "Can I cancel or downgrade without losing my codes?",
    a: "Yes. Your printed codes keep scanning on any plan. You lose the Pro extras, never the codes themselves — no reprints.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Pro is billed in INR through Cashfree, with daily, weekly, monthly and yearly options. See the Payment policy for details.",
  },
];

function PricingCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="mx-auto size-icon-sm text-brand" />;
  if (value === false) return <Minus className="mx-auto size-icon-sm text-muted-foreground" />;
  return <span className="text-small">{value}</span>;
}

function CompareCell({ value, highlight }: { value: string; highlight?: boolean }) {
  const good = value === "Free" || value === "Never" || value === "Always" || value === "Yes";
  const bad = value === "No";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap",
        highlight
          ? "font-medium text-foreground"
          : good
            ? "text-foreground"
            : "text-muted-foreground",
      )}
    >
      {highlight && <Check className="size-icon-xs text-brand" />}
      {bad && <X className="size-icon-xs text-muted-foreground" />}
      {value}
    </span>
  );
}

function Landing() {
  const navigate = useNavigate();
  const signedIn = useSignedIn();
  const [faqTab, setFaqTab] = useState<FaqTabId>("general");
  const [heroKind, setHeroKind] = useState<QrKind>("url");

  const goAuth = () => void navigate({ to: signedIn ? "/dashboard" : "/auth" });
  const goUpgrade = () => void navigate({ to: signedIn ? "/settings" : "/auth" });
  const goGenerate = () => void navigate({ to: "/create" });
  const onLocked = () => void navigate({ to: signedIn ? "/create" : "/auth" });
  const selectHeroKind = (kind: QrKind) => setHeroKind(kind);

  return (
    <div className="min-h-screen scroll-smooth bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-header max-w-main items-center justify-between gap-4 px-gutter">
          <Link to="/" className="flex items-center gap-2 text-body font-semibold tracking-tight">
            <Logo className="size-icon-sm" />
            <span>Unified QR</span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) =>
              "to" in item ? (
                <Link
                  key={item.label}
                  to={item.to}
                  className="flex min-h-11 items-center rounded-nav px-3 text-small text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex min-h-11 items-center rounded-nav px-3 text-small text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={GITHUB}
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
        <section
          id="top"
          className="relative scroll-mt-header overflow-hidden border-b border-border"
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-foreground/[0.07] blur-3xl" />
          </div>

          <div className="hero-enter relative mx-auto max-w-main px-gutter pt-10 sm:pt-14">
            <div className="flex flex-wrap items-center gap-2">
              {TOP_TYPES.map((chip) => {
                const chipMeta = KINDS.find((k) => k.kind === chip)!;
                const Icon = ICONS[chip];
                const active = heroKind === chip;
                const chipLocked = Boolean(chipMeta.proOnly);
                return (
                  <Chip
                    key={chip}
                    type="button"
                    variant={active ? "active" : "default"}
                    onClick={() => selectHeroKind(chip)}
                  >
                    <Icon />
                    {chipMeta.label}
                    {chipLocked && <Lock className="opacity-60" />}
                  </Chip>
                );
              })}
              <Chip asChild variant="ghost">
                <Link to="/create">
                  All {KINDS.length} types <ArrowRight />
                </Link>
              </Chip>
            </div>
          </div>

          <div className="relative mx-auto grid max-w-main gap-12 px-gutter pb-16 pt-8 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16">
            <div>
              <span className="hero-enter inline-flex items-center gap-2">
                <Chip asChild>
                  <span>
                    <Globe className="size-icon-xs" />
                    Built by NxtGenSec
                  </span>
                </Chip>
              </span>
              <h1 className="hero-enter hero-delay-1 mt-6 text-balance text-hero font-bold tracking-tight">
                Create beautiful QR codes. Free, forever.
              </h1>
              <p className="hero-enter hero-delay-2 mt-6 max-w-xl text-pretty text-body leading-relaxed text-muted-foreground sm:text-h2">
                Generate, customize and download QR codes in seconds — no account needed. All{" "}
                {KINDS.length} types, dynamic links, scan analytics and watermark-free export, open
                source and built by NxtGenSec.
              </p>
              <div className="hero-enter hero-delay-3 mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={goGenerate}>
                  <QrCode /> Create a QR code
                </Button>
                <Button size="lg" variant="secondary" onClick={goAuth}>
                  Continue with Google <GoogleIcon />
                </Button>
              </div>
              <ul className="hero-enter hero-delay-4 mt-8 flex flex-wrap gap-2">
                {TRUST.map((item) => (
                  <li key={item.label}>
                    <Chip>
                      <item.icon /> {item.label}
                    </Chip>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hero-enter hero-delay-5 relative overflow-hidden">
              <div
                className="pointer-events-none absolute -inset-10 rounded-[3rem]"
                style={{
                  background:
                    "radial-gradient(ellipse 55% 55% at 50% 40%, rgba(255,255,255,0.12), transparent 62%), radial-gradient(ellipse 45% 45% at 35% 65%, rgba(255,255,255,0.07), transparent 62%), radial-gradient(ellipse 45% 45% at 65% 55%, rgba(255,255,255,0.06), transparent 62%)",
                  filter: "blur(70px)",
                }}
                aria-hidden
              />
              <div className="relative">
                <HeroStudio kind={heroKind} onLocked={onLocked} />
              </div>
            </div>
          </div>

          <div className="relative mx-auto max-w-main px-gutter pb-16">
            <div className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2 lg:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-foreground/[0.04]">
                    <stat.icon className="size-icon-md" />
                  </span>
                  <div>
                    <p className="text-h2 font-semibold tracking-tight">{stat.value}</p>
                    <p className="text-small text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-small text-muted-foreground">
              Growing with the community — every star, issue and pull request shapes the roadmap.
            </p>
          </div>
        </section>

        <section id="types" className="scroll-mt-header border-b border-border">
          <div className="mx-auto max-w-main px-gutter py-section sm:py-section-lg">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-h1 font-semibold tracking-tight">
                Every code you'll ever need
              </h2>
              <p className="mt-4 text-pretty text-small text-muted-foreground sm:text-base">
                Website and text codes work instantly — no account required. All {KINDS.length}{" "}
                types are free on the Community plan.
              </p>
            </div>
            <div className="mt-12">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {KINDS.slice(0, 8).map((kind, index) => {
                  const Icon = ICONS[kind.kind];
                  const payload = buildPayload(kind.kind, SAMPLES[kind.kind]);
                  return (
                    <Link
                      key={kind.kind}
                      to="/create"
                      className={cn(
                        "group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/40",
                        index >= 4 && "hidden lg:block",
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-background">
                            <Icon className="size-icon-sm text-muted-foreground transition-colors group-hover:text-foreground" />
                          </span>
                          <div>
                            <h3 className="text-small font-semibold">{kind.label}</h3>
                            <p className="text-small text-muted-foreground">{kind.hint}</p>
                          </div>
                        </div>
                        <QrPreview
                          payload={payload}
                          style={defaultStyle}
                          size={112}
                          className="w-14 rounded-lg"
                        />
                      </div>
                    </Link>
                  );
                })}
                <Link
                  to="/create"
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border p-5 text-small text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                >
                  +{KINDS.length - 8} more
                  <ArrowRight className="size-icon-sm" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="why" className="scroll-mt-header border-b border-border">
          <div className="mx-auto max-w-main px-gutter py-section sm:py-section-lg">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-small font-medium text-muted-foreground">Why Unified QR</p>
              <h2 className="mt-3 text-balance text-h1 font-semibold tracking-tight">
                Your codes stay yours
              </h2>
              <p className="mt-4 text-pretty text-small text-muted-foreground sm:text-base">
                A QR code is just pixels. Once it's printed, no subscription should be able to take
                it away from you.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {WHY.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-foreground/30"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-foreground/[0.04]">
                    <item.icon className="size-icon-md" />
                  </div>
                  <h3 className="mt-4 text-small font-semibold">{item.title}</h3>
                  <p className="mt-1.5 text-small text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="ecosystem" className="scroll-mt-header border-b border-border">
          <div className="mx-auto max-w-main px-gutter py-section sm:py-section-lg">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-small font-medium text-muted-foreground">Feature ecosystem</p>
              <h2 className="mt-3 text-balance text-h1 font-semibold tracking-tight">
                Create · Manage · Analyze · Develop
              </h2>
              <p className="mt-4 text-pretty text-small text-muted-foreground sm:text-base">
                One platform that covers the whole lifecycle of a QR code.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PILLARS.map((pillar) => (
                <div key={pillar.title} className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-foreground/[0.04]">
                      <pillar.icon className="size-icon-md" />
                    </span>
                    <h3 className="text-small font-semibold">{pillar.title}</h3>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {pillar.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-small text-muted-foreground"
                      >
                        <Check className="mt-0.5 size-icon-xs shrink-0 text-brand" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="compare" className="scroll-mt-header border-b border-border">
          <div className="mx-auto max-w-main px-gutter py-section sm:py-section-lg">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-small font-medium text-muted-foreground">The difference</p>
              <h2 className="mt-3 text-balance text-h1 font-semibold tracking-tight">
                What others charge for, we include free
              </h2>
              <p className="mt-4 text-pretty text-small text-muted-foreground sm:text-base">
                Dynamic codes, scan analytics, design control and vector export are usually paid
                extras. On Unified QR they're included in the free plan — here's how the tiers
                compare.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-foreground/40 bg-card p-6 sm:p-7">
              <p className="flex items-center gap-2 text-small font-medium">
                <BadgeCheck className="size-icon-sm" /> The short version
              </p>
              <ul className="mt-4 grid gap-3 text-small text-muted-foreground sm:grid-cols-2">
                <li>Free dynamic codes — paid tools start around $5–$60/mo.</li>
                <li>No scan caps and no ads, on any plan.</li>
                <li>Watermark-free PNG + SVG on the free plan.</li>
                <li>Printed codes keep working if you ever cancel.</li>
              </ul>
            </div>

            <h3 className="text-center text-h2 font-semibold tracking-tight">Feature by feature</h3>
            <p className="mx-auto mt-3 max-w-2xl text-center text-small text-muted-foreground">
              Each cell is what the cheapest tier that includes the feature costs — or what you get
              free.
            </p>

            <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
              <table className="w-full min-w-[760px] border-collapse text-small">
                <thead>
                  <tr className="border-b border-border bg-elevated text-left text-caption uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Feature</th>
                    <th className="bg-brand px-4 py-3 font-medium text-brand-foreground">
                      Unified QR
                    </th>
                    {COMPETITORS.map((c) => (
                      <th key={c.name} className="px-4 py-3 font-medium">
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_MATRIX.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={cn(
                        "border-b border-border last:border-b-0",
                        i % 2 === 1 && "bg-muted/40",
                      )}
                    >
                      <td className="px-5 py-3.5 font-medium">{row.feature}</td>
                      <td className="bg-brand/10 px-4 py-3.5">
                        <CompareCell value={row.us} highlight />
                      </td>
                      {row.cells.map((c, j) => (
                        <td key={j} className="px-4 py-3.5">
                          <CompareCell value={c} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-small text-muted-foreground">
              Prices and limits are taken from public pricing pages, verified July 2026, and change
              frequently — always check the vendor before buying. "Codes survive cancellation"
              reflects each platform's published policy that dynamic codes can be deactivated when a
              subscription ends.
            </p>
          </div>
        </section>

        <section id="security" className="scroll-mt-header border-b border-border">
          <div className="mx-auto max-w-main px-gutter py-section sm:py-section-lg">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-small font-medium text-muted-foreground">Security & privacy</p>
                <h2 className="mt-3 text-balance text-h1 font-semibold tracking-tight">
                  Built by NxtGenSec. Security is the baseline.
                </h2>
                <p className="mt-4 text-pretty text-small text-muted-foreground sm:text-base">
                  A QR platform handles links your customers scan — that deserves the same
                  engineering standards as the security tools we build.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {SECURITY.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-foreground/[0.04]">
                      <ShieldCheck className="size-icon-sm" />
                    </div>
                    <h3 className="mt-3 text-small font-semibold">{item.title}</h3>
                    <p className="mt-1 text-small text-muted-foreground">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="developers" className="scroll-mt-header border-b border-border">
          <div className="mx-auto max-w-main px-gutter py-section sm:py-section-lg">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-small font-medium text-muted-foreground">Developer platform</p>
              <h2 className="mt-3 text-balance text-h1 font-semibold tracking-tight">
                Build on Unified QR
              </h2>
            </div>
            <div className="mt-12 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-foreground/[0.04]">
                  <Zap className="size-icon-md" />
                </span>
                <h3 className="text-small font-semibold">Available today</h3>
              </div>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {DEV_READY.map((item) => (
                  <li key={item.title} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-icon-xs shrink-0 text-brand" />
                    <div>
                      <p className="text-small font-medium">{item.title}</p>
                      <p className="text-small text-muted-foreground">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
                <p className="text-small text-muted-foreground">
                  Every line of the platform is public — extend it, self-host it, or build on top of
                  it.
                </p>
                <Button variant="ghost" size="sm" className="ml-auto" asChild>
                  <a href={GITHUB} target="_blank" rel="noreferrer">
                    <Github className="size-icon-sm" /> Explore on GitHub
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-header border-b border-border">
          <div className="mx-auto max-w-main px-gutter py-section sm:py-section-lg">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-small font-medium text-muted-foreground">Honest pricing</p>
              <h2 className="mt-3 text-balance text-h1 font-semibold tracking-tight">
                Two plans. No bait-and-switch.
              </h2>
              <p className="mt-4 text-pretty text-small text-muted-foreground sm:text-base">
                The free tier is a real plan, not a trial in disguise. The paid tier exists for
                people who print QR codes for a living.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-4xl gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-7">
                <h3 className="text-base font-semibold">{PLANS.professional.name}</h3>
                <p className="mt-1 text-small text-muted-foreground">
                  For a QR code that just works — free, forever.
                </p>
                <p className="mt-5 text-h1 font-semibold tracking-tight">
                  Free
                  <span className="ml-1 text-small font-normal text-muted-foreground">forever</span>
                </p>
                <ul className="mt-6 space-y-2.5">
                  {[
                    `All ${KINDS.length} code types, none paywalled`,
                    "3 dynamic codes",
                    "Unlimited static codes",
                    "30-day scan analytics",
                    "Watermark-free PNG + SVG export",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-small">
                      <Check className="mt-0.5 size-icon-xs shrink-0 text-brand" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 w-full" size="lg" variant="secondary" onClick={goAuth}>
                  Sign in with Google <GoogleIcon className="ml-2 size-icon-sm" />
                </Button>
              </div>

              <div className="relative rounded-2xl border border-brand/60 bg-card p-7">
                <span className="absolute -top-3 left-7 rounded-full border border-brand/60 bg-brand px-3 py-1 text-small font-medium text-brand-foreground">
                  Most popular
                </span>
                <h3 className="text-base font-semibold">{PLANS.enterprise.name}</h3>
                <p className="mt-1 text-small text-muted-foreground">
                  For teams printing at volume and tracking everything.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {ENTERPRISE_TERMS.map((term) => (
                    <div
                      key={term.id}
                      className={cn(
                        "rounded-lg border px-3 py-2",
                        term.id === "yearly" ? "border-brand/50 bg-brand/10" : "border-border",
                      )}
                    >
                      <p className="text-caption uppercase tracking-wider text-muted-foreground">
                        {term.label}
                        {term.id === "yearly" && (
                          <span className="ml-1.5 rounded-full border border-brand/50 bg-brand/10 px-1.5 py-px text-small font-medium normal-case tracking-normal text-brand">
                            Best value
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-h2 font-semibold tracking-tight">
                        {formatPaise(term.paise)}
                        <span className="text-small font-normal text-muted-foreground">
                          {" "}
                          / {term.per}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
                <ul className="mt-6 space-y-2.5">
                  {[
                    "Unlimited dynamic codes",
                    "Full scan history, never truncated",
                    "Bulk generation from CSV",
                    "Priority support",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-small">
                      <Check className="mt-0.5 size-icon-xs shrink-0 text-brand" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 w-full" size="lg" onClick={goUpgrade}>
                  Upgrade <ArrowRight className="ml-2 size-icon-sm" />
                </Button>
              </div>
            </div>

            <div className="mt-14 overflow-x-auto rounded-2xl border border-border bg-card">
              <div className="min-w-[420px]">
                <div className="grid grid-cols-[minmax(0,1fr)_88px_88px] gap-3 border-b border-border px-5 py-3 text-caption uppercase tracking-wider text-muted-foreground sm:px-7">
                  <span>Feature</span>
                  <span className="text-center">Community</span>
                  <span className="text-center">Pro</span>
                </div>
                {PLAN_MATRIX.map((row) => (
                  <div
                    key={row.feature}
                    className="grid grid-cols-[minmax(0,1fr)_88px_88px] items-center gap-3 border-b border-border px-5 py-3.5 text-small last:border-b-0 sm:px-7"
                  >
                    <span className="font-medium">{row.feature}</span>
                    <span className="flex justify-center">
                      <PricingCell value={row.free} />
                    </span>
                    <span className="flex justify-center">
                      <PricingCell value={row.pro} />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-border bg-elevated p-6 sm:p-8">
              <h3 className="text-small font-medium">The anti-trap guarantee</h3>
              <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["No expiry", "Codes stay live forever, on every plan."],
                  ["No scan caps", "Any number of people can scan — always."],
                  ["No deactivation", "Cancel or downgrade and printed codes keep working."],
                  ["No reprints on upgrade", "Moving to Pro keeps every code and slug."],
                  ["No ads or watermarks", "The free plan stays clean — even on downloads."],
                  ["No card-required trials", "Community is free without a card or a timer."],
                ].map(([title, body]) => (
                  <div key={title}>
                    <p className="flex items-center gap-1.5 text-small font-medium">
                      <Check className="size-icon-xs shrink-0 text-brand" /> {title}
                    </p>
                    <p className="mt-1 text-small text-muted-foreground">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="text-center text-h2 font-semibold tracking-tight">
              Questions, answered
            </h3>
            <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
              {PRICING_FAQ.map((item) => (
                <details key={item.q} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-small font-medium [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-small text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>

            <div className="mt-12 grid gap-6 rounded-2xl border border-border bg-card p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
              <div>
                <h3 className="text-h2 font-semibold tracking-tight">Still not sure?</h3>
                <p className="mt-2 max-w-xl text-small text-muted-foreground">
                  See how we stack up against QR TIGER, Bitly, Uniqode, Flowcode and QRCode Monkey —
                  the full comparison is public.
                </p>
              </div>
              <Button size="lg" variant="secondary" asChild>
                <a href="#compare">
                  See the comparison <ArrowRight className="ml-2 size-icon-sm" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-header border-b border-border">
          <div className="mx-auto max-w-2xl px-gutter py-section sm:py-section-lg">
            <div className="text-center">
              <p className="text-small font-medium text-muted-foreground">Good to know</p>
              <h2 className="mt-3 text-balance text-h1 font-semibold tracking-tight">
                Questions, answered
              </h2>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {FAQ_TABS.map((tab) => (
                <Chip
                  key={tab.id}
                  type="button"
                  variant={faqTab === tab.id ? "active" : "default"}
                  onClick={() => setFaqTab(tab.id)}
                >
                  {tab.label}
                </Chip>
              ))}
            </div>
            <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
              {FAQS[faqTab].map((item) => (
                <details key={item.q} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-small font-medium [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-small text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute -bottom-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-foreground/[0.06] blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-3xl px-gutter py-section text-center sm:py-section-lg">
            <Sparkles className="mx-auto size-icon-md text-brand" />
            <h2 className="mt-4 text-balance text-h1 font-semibold tracking-tight">
              Start creating — it's free forever
            </h2>
            <p className="mx-auto mt-4 max-w-md text-pretty text-small text-muted-foreground sm:text-base">
              No account needed for simple codes. Sign in with Google for your library, design tools
              and all {KINDS.length} types.
            </p>
            <Button className="mt-8" size="lg" onClick={goAuth}>
              {signedIn ? "Open dashboard" : "Continue with Google"}
              <GoogleIcon className="ml-2 size-icon-sm" />
            </Button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-small text-muted-foreground">
              <Github className="size-icon-xs" /> Open source on GitHub — star, fork, or contribute.
            </p>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-main px-gutter">
        <div className="flex flex-col gap-10 border-t border-border py-12 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex max-w-xs flex-col gap-3">
            <span className="flex items-center gap-2.5 text-small font-semibold tracking-tight">
              <Logo />
              Unified QR
            </span>
            <span className="text-small text-muted-foreground">
              The open platform for everything QR. Community is free forever, built in public by
              NxtGenSec.
            </span>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" asChild>
                <a href={GITHUB} target="_blank" rel="noreferrer" aria-label="GitHub">
                  <Github className="size-icon-sm" />
                </a>
              </Button>
              <Button size="icon" variant="outline" asChild>
                <a href={`${GITHUB}/issues`} target="_blank" rel="noreferrer" aria-label="Issues">
                  <Star className="size-icon-sm" />
                </a>
              </Button>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-8 text-small sm:grid-cols-3 lg:grid-cols-5">
            <nav className="flex flex-col gap-2">
              <span className="font-medium text-muted-foreground">Product</span>
              <Link to="/create" className="transition-colors hover:text-foreground">
                Generator
              </Link>
              <a href="/#types" className="transition-colors hover:text-foreground">
                Code types
              </a>
              <a href="/#ecosystem" className="transition-colors hover:text-foreground">
                Features
              </a>
              <a href="/#compare" className="transition-colors hover:text-foreground">
                Compare
              </a>
            </nav>
            <nav className="flex flex-col gap-2">
              <span className="font-medium text-muted-foreground">Developers</span>
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                GitHub
              </a>
              <a
                href={`${GITHUB}/issues`}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                Roadmap & issues
              </a>
              <a href="/#why" className="transition-colors hover:text-foreground">
                Why us
              </a>
              <a href="/#pricing" className="transition-colors hover:text-foreground">
                Pricing
              </a>
            </nav>
            <nav className="flex flex-col gap-2">
              <span className="font-medium text-muted-foreground">Community</span>
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                Discussions
              </a>
              <a
                href={`${GITHUB}/issues`}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                Feature requests
              </a>
              <a
                href={`${GITHUB}/issues`}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                Become a contributor
              </a>
            </nav>
            <nav className="flex flex-col gap-2">
              <span className="font-medium text-muted-foreground">Legal</span>
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
        </div>
        <div className="flex flex-col items-center justify-between gap-2 py-6 text-small text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Unified QR</span>
          <span className="flex items-center gap-1.5">
            <Globe className="size-icon-xs" /> Built by NxtGenSec, with contributions from the
            community.
          </span>
        </div>
      </footer>
    </div>
  );
}
