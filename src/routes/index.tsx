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
  GraduationCap,
  HelpCircle,
  House,
  IndianRupee,
  Infinity as InfinityIcon,
  Instagram,
  Layers,
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
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Tag,
  Terminal,
  Ticket,
  Truck,
  Twitter,
  UserRound,
  Utensils,
  Wifi,
  X,
  XCircle,
  Youtube,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { GoogleIcon } from "@/components/brand/GoogleIcon";
import { Logo } from "@/components/brand/Logo";
import { HeroStudio } from "@/components/marketing/HeroStudio";
import { QrPreview } from "@/components/qr/QrPreview";
import { Button } from "@/components/ui/button";
import { useSignedIn } from "@/hooks/use-signed-in";
import { ENTERPRISE_TERMS, formatPaise } from "@/lib/plans";
import { KINDS, buildPayload, defaultStyle } from "@/lib/qr/types";
import type { QrContent, QrKind } from "@/lib/qr/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Unified QR — The open platform for everything QR" },
      {
        name: "description",
        content:
          "Create, manage and scale QR codes free forever. 32 code types, real design control, dynamic codes, password & expiry controls and scan analytics — open source on GitHub, no watermarks, no expiry.",
      },
      {
        property: "og:title",
        content: "Unified QR — The open platform for everything QR",
      },
      {
        property: "og:description",
        content:
          "Create, manage, track and extend QR codes on one platform. Free forever, open source, built by NxtGenSec.",
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
  { label: "Open Source", href: "#developers" },
  { label: "Pricing", href: "#pricing" },
] as const;

const MOBILE_NAV = [
  { href: "#top", label: "Home", icon: House },
  { href: "#types", label: "Types", icon: QrCode },
  { href: "#ecosystem", label: "Features", icon: Layers },
  { href: "#pricing", label: "Pricing", icon: Tag },
  { href: "#developers", label: "Open Source", icon: Star },
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
    body: "Professional is a real free plan — no credit card, no timer, and nothing locks after day 14.",
  },
  {
    icon: Lock,
    title: "No watermarks, no expiry",
    body: "Every code you download is clean, and every code you print stays live forever.",
  },
  {
    icon: Link2,
    title: "Change codes after printing",
    body: "Dynamic codes let you swap the destination any time — the printed code keeps working.",
  },
  {
    icon: FolderOpen,
    title: "No lock-in",
    body: "Export your codes as SVG or PNG, keep your short links, and leave whenever you like.",
  },
] as const;

const PILLARS = [
  {
    icon: PenLine,
    title: "Create",
    items: [
      `${KINDS.length} code types`,
      "Real design control",
      "Logo, colors & shapes",
      "Watermark-free PNG, SVG, PDF & EPS",
    ],
  },
  {
    icon: FolderOpen,
    title: "Manage",
    items: [
      "Saved code library",
      "Dynamic codes",
      "Password & expiry on dynamic codes",
      "Backup & restore your library",
    ],
  },
  {
    icon: BarChart3,
    title: "Analyze",
    items: ["Scan timeline", "By device", "By country", "30 days free, forever on Enterprise"],
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
    body: "Dynamic codes resolve through our domain — every scan is tracked and you can swap the destination any time without reprinting.",
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

const USE_CASES = [
  {
    icon: Utensils,
    title: "Restaurants",
    body: "Menus and table-side ordering that scan instantly.",
  },
  { icon: ShoppingBag, title: "Retail", body: "Offers, product info and easy returns." },
  { icon: CalendarDays, title: "Events", body: "Tickets, check-ins and post-event feedback." },
  { icon: GraduationCap, title: "Education", body: "Handouts, lab links and campus signage." },
  {
    icon: UserRound,
    title: "Personal branding",
    body: "Business cards and portfolios that update themselves.",
  },
  { icon: Truck, title: "Logistics", body: "Parcel tracking and asset check-ins." },
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
      a: "Links and text work without one. Sign in with Google to save your codes on the free Professional plan — no password, no credit card.",
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
      a: `Professional is free forever after a Google sign-in: all ${KINDS.length} code types, 3 dynamic links, 30 days of analytics and vector downloads. No card, no trial timer.`,
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
      a: "Dynamic codes report scans over time, by device and by country. Professional keeps 30 days of history; Enterprise keeps it forever.",
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

const URL_HOW = [
  { title: "Enter the URL", body: "Paste the link you want people to reach." },
  {
    title: "Generate the QR code",
    body: "The code renders instantly from your link — nothing to upload.",
  },
  {
    title: "Download & share",
    body: "Print it, embed it in a document, or share it digitally. No watermark, ever.",
  },
] as const;

const TRAPS = [
  {
    trap: "Trial timers in disguise",
    them: "Free plans that quietly expire — then your codes stop scanning until you pay.",
    us: "Professional is free forever. No timer, no card, no countdown.",
  },
  {
    trap: "Scan caps",
    them: "Free dynamic codes capped at 500 scans — after that they die on QR TIGER and others.",
    us: "No scan caps, on any plan, ever.",
  },
  {
    trap: "Ads injected into your scans",
    them: "Bitly shows ads on free scans. ME-QR even injects them on paid plans up to $9/mo.",
    us: "No ads. The redirect lands where you told it to land.",
  },
  {
    trap: "Codes that die when you cancel",
    them: "The industry's dirtiest secret: cancel a subscription and your printed QR codes go dead.",
    us: "Your codes keep scanning no matter what. No reprints, no hostage situations.",
  },
  {
    trap: "Analytics paywalled",
    them: "Where and when people scan — gated behind $16–$199/month tiers.",
    us: "30 days of scan analytics, free, on the free plan.",
  },
  {
    trap: "Hostage export",
    them: "Print-ready vectors, logo placement and clean downloads held back for paid plans.",
    us: "Watermark-free PNG and SVG on every plan, including free.",
  },
] as const;

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
    us: "Enterprise",
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
    q: "Is Professional really free forever?",
    a: "Yes. Sign in with Google and it stays free — no card, no trial timer, no feature that quietly expires. You keep your codes, your analytics window and every export.",
  },
  {
    q: "What does Enterprise actually add?",
    a: "Unlimited dynamic codes, the full scan history instead of 30 days, and bulk generation from a CSV. If you print QR codes for a living, that's the plan — nothing else is paywalled.",
  },
  {
    q: "Can I cancel or downgrade without losing my codes?",
    a: "Yes. Your printed codes keep scanning on any plan. You lose the Enterprise extras, never the codes themselves — no reprints, no hostage situations.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Enterprise is billed in INR through Cashfree, with daily, weekly, monthly and yearly options. See the Payment policy for details.",
  },
];

function PricingCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="mx-auto size-icon-sm text-foreground" />;
  if (value === false) return <Minus className="mx-auto size-icon-sm text-muted-foreground" />;
  return <span className="text-sm">{value}</span>;
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
      {highlight && <Check className="size-icon-xs text-foreground" />}
      {bad && <X className="size-icon-xs text-muted-foreground" />}
      {value}
    </span>
  );
}

function MobileNav() {
  const [active, setActive] = useState("#top");

  useEffect(() => {
    const sections = MOBILE_NAV.map((n) => document.getElementById(n.href.slice(1))).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const top = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!top) return;
        setActive(`#${top.target.id}`);
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="mx-auto grid h-tabbar max-w-nav grid-cols-5">
        {MOBILE_NAV.map((item) => {
          const isActive = active === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className="relative flex flex-col items-center justify-center gap-1.5"
            >
              {isActive && (
                <span className="absolute top-1.5 h-0.5 w-8 rounded-full bg-foreground" />
              )}
              <item.icon
                size={24}
                strokeWidth={2}
                className={cn(
                  "transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium leading-none transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
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
    <div className="min-h-screen scroll-smooth bg-background pb-tabbar lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-header max-w-main items-center justify-between px-gutter">
          <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <Logo className="size-7" />
            <span>Unified QR</span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) =>
              "to" in item ? (
                <Link
                  key={item.label}
                  to={item.to}
                  className="px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
              className="flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Github className="size-icon-sm" />
            </a>
            <Button onClick={goAuth}>{signedIn ? "Dashboard" : "Sign in"}</Button>
          </div>
        </div>
      </header>

      <main>
        <section id="top" className="relative scroll-mt-header border-b border-border">
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
                  <button
                    key={chip}
                    type="button"
                    onClick={() => selectHeroKind(chip)}
                    className={cn(
                      "inline-flex h-chip items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-icon-sm" />
                    {chipMeta.label}
                    {chipLocked && <Lock className="size-3 opacity-60" />}
                  </button>
                );
              })}
              <Link
                to="/create"
                className="inline-flex h-chip items-center gap-1.5 rounded-full border border-dashed border-border px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
              >
                All {KINDS.length} types <ArrowRight className="size-icon-sm" />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto grid max-w-main gap-14 px-gutter pb-20 pt-8 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16">
            <div>
              <span className="hero-enter inline-flex h-chip items-center gap-1.5 rounded-full border border-border bg-card/50 px-3.5 text-sm text-muted-foreground">
                <Globe className="size-icon-sm" />
                Built by NxtGenSec
              </span>
              <h1 className="hero-enter hero-delay-1 mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
                The open platform for{" "}
                <span className="bg-gradient-to-b from-foreground to-foreground/55 bg-clip-text text-transparent">
                  everything QR.
                </span>
              </h1>
              <p className="hero-enter hero-delay-2 mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                Create, customize, manage and track QR codes with enterprise-grade tools —
                completely free for individuals, open source, privacy-first and built for
                developers.
              </p>
              <div className="hero-enter hero-delay-3 mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={goGenerate}>
                  <QrCode className="size-icon-sm" /> Generate QR free
                </Button>
                <Button size="lg" variant="secondary" onClick={goAuth}>
                  Continue with Google <GoogleIcon className="ml-1 size-icon-sm" />
                </Button>
              </div>
              <ul className="hero-enter hero-delay-4 mt-8 flex flex-wrap gap-2">
                {TRUST.map((item) => (
                  <li
                    key={item.label}
                    className="inline-flex h-chip items-center gap-1.5 rounded-full border border-border bg-card/50 px-3.5 text-sm text-muted-foreground"
                  >
                    <item.icon className="size-icon-sm" /> {item.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="hero-enter hero-delay-5 relative">
              <div
                className="pointer-events-none absolute -inset-10 rounded-[3rem]"
                style={{
                  background:
                    "radial-gradient(ellipse 55% 55% at 50% 40%, rgba(59,130,246,0.10), transparent 62%), radial-gradient(ellipse 45% 45% at 35% 65%, rgba(168,85,247,0.08), transparent 62%), radial-gradient(ellipse 45% 45% at 65% 55%, rgba(34,211,238,0.07), transparent 62%)",
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
                    <p className="text-lg font-semibold tracking-tight">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Growing with the community — every star, issue and pull request shapes the roadmap.
            </p>
          </div>
        </section>

        <section id="types" className="scroll-mt-header border-b border-border">
          <div className="mx-auto max-w-main px-gutter py-section sm:py-section-lg">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Every code you'll ever need, none paywalled
              </h2>
              <p className="mt-4 text-pretty text-sm text-muted-foreground sm:text-base">
                All {KINDS.length} types — free on Professional, forever.
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
                            <h3 className="text-sm font-semibold">{kind.label}</h3>
                            <p className="text-xs text-muted-foreground">{kind.hint}</p>
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
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                >
                  +{KINDS.length - 8} more
                  <ArrowRight className="size-icon-sm" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="url-qr-code" className="scroll-mt-header border-b border-border">
          <div className="mx-auto max-w-main px-gutter py-section sm:py-section-lg">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium text-muted-foreground">URL to QR code</p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                How to make a URL QR code
              </h2>
              <p className="mt-4 text-pretty text-sm text-muted-foreground sm:text-base">
                Turn any link into a scannable QR code in about a minute — everything below is on
                the free Professional plan, no credit card, no trial timer.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {URL_HOW.map((step, i) => (
                <div key={step.title} className="rounded-2xl border border-border bg-card p-6">
                  <span className="flex size-8 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="why" className="scroll-mt-header border-b border-border">
          <div className="mx-auto max-w-main px-gutter py-section sm:py-section-lg">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium text-muted-foreground">Why Unified QR</p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Not another QR generator. A platform you can trust.
              </h2>
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
                  <h3 className="mt-4 text-sm font-semibold">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-2xl border border-foreground/40 bg-card p-6 sm:p-7">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <ShieldCheck className="size-icon-sm" /> How the trap works
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    You print a QR code on your menu, your packaging, your trade-show banner. Six
                    months later you stop paying — and every piece of printed material goes dead.
                    That's not a QR code. That's a subscription with a barcode.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    A QR code is just pixels. Once it's printed, nobody should be able to take it
                    away from you. We built the platform around that idea.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {TRAPS.map((trap) => (
                  <div
                    key={trap.trap}
                    className="rounded-2xl border border-border bg-card p-5 sm:p-6"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 items-center justify-center rounded-full border border-border">
                        <X className="size-icon-xs text-muted-foreground" />
                      </span>
                      <h3 className="text-sm font-semibold">{trap.trap}</h3>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{trap.them}</p>
                    <p className="mt-3 flex items-start gap-2 text-sm font-medium">
                      <Check className="mt-0.5 size-icon-sm shrink-0 text-foreground" /> {trap.us}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="ecosystem" className="scroll-mt-header border-b border-border">
          <div className="mx-auto max-w-main px-gutter py-section sm:py-section-lg">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium text-muted-foreground">Feature ecosystem</p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Create · Manage · Analyze · Develop
              </h2>
              <p className="mt-4 text-pretty text-sm text-muted-foreground sm:text-base">
                One platform that covers the whole lifecycle of a QR code — not a single-button
                generator.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PILLARS.map((pillar) => (
                <div key={pillar.title} className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-foreground/[0.04]">
                      <pillar.icon className="size-icon-md" />
                    </span>
                    <h3 className="text-sm font-semibold">{pillar.title}</h3>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {pillar.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="mt-0.5 size-icon-sm shrink-0 text-foreground" />
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
              <p className="text-sm font-medium text-muted-foreground">The difference</p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Every competitor charges for what we give away free.
              </h2>
              <p className="mt-4 text-pretty text-sm text-muted-foreground sm:text-base">
                Dynamic codes, scan analytics, full design control, vector export — the big QR
                platforms all put these behind $5–$250/month plans. Professional gives you all of
                them free forever. Here's the receipt.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-foreground/40 bg-card p-6 sm:p-7">
              <p className="flex items-center gap-2 text-sm font-medium">
                <BadgeCheck className="size-icon-sm" /> The short version
              </p>
              <ul className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                <li>Free dynamic codes — theirs start at $5–$60/mo.</li>
                <li>No scan caps — theirs cap free codes at 500 scans.</li>
                <li>No ads, ever — Bitly puts ads on free scans.</li>
                <li>Your codes keep working if you cancel — theirs often don't.</li>
              </ul>
            </div>

            <h3 className="mt-16 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
              Feature by feature
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground">
              Each cell is what the cheapest tier that includes the feature costs — or what you get
              free.
            </p>

            <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-elevated text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Feature</th>
                    <th className="bg-foreground px-4 py-3 font-medium text-background">
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
                      <td className="bg-foreground/5 px-4 py-3.5">
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

            <p className="mt-4 text-xs text-muted-foreground">
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
                <p className="text-sm font-medium text-muted-foreground">Security & privacy</p>
                <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                  Built by NxtGenSec. Security isn't a feature, it's the baseline.
                </h2>
                <p className="mt-4 text-pretty text-sm text-muted-foreground sm:text-base">
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
                    <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="developers" className="scroll-mt-header border-b border-border">
          <div className="mx-auto max-w-main px-gutter py-section sm:py-section-lg">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium text-muted-foreground">Developer platform</p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Build on Unified QR
              </h2>
            </div>
            <div className="mt-12 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-foreground/[0.04]">
                  <Zap className="size-icon-md" />
                </span>
                <h3 className="text-sm font-semibold">Available today</h3>
              </div>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {DEV_READY.map((item) => (
                  <li key={item.title} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-icon-sm shrink-0 text-foreground" />
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
                <p className="text-xs text-muted-foreground">
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

        <section id="use-cases" className="scroll-mt-header border-b border-border">
          <div className="mx-auto max-w-main px-gutter py-section sm:py-section-lg">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium text-muted-foreground">Built for your world</p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                QR codes, where you work
              </h2>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {USE_CASES.map((item) => (
                <div key={item.title} className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-foreground/[0.04]">
                    <item.icon className="size-icon-md" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="enterprise" className="scroll-mt-header border-b border-border">
          <div className="mx-auto max-w-main px-gutter py-section sm:py-section-lg">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enterprise</p>
                <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                  For teams printing at volume
                </h2>
                <p className="mt-4 text-pretty text-sm text-muted-foreground sm:text-base">
                  When QR codes carry your brand into the world, you need volume, history and
                  support behind them.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button size="lg" asChild>
                    <a href="#pricing">See Enterprise pricing</a>
                  </Button>
                  <Button size="lg" variant="secondary" asChild>
                    <a href="#compare">
                      Compare with alternatives <ArrowRight className="ml-2 size-icon-sm" />
                    </a>
                  </Button>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <ul className="space-y-4">
                  {[
                    "Unlimited dynamic codes",
                    "Full scan history, never truncated",
                    "Bulk generation from CSV",
                    "Own-domain short links",
                    "Priority support",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-icon-sm shrink-0 text-foreground" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-header border-b border-border">
          <div className="mx-auto max-w-main px-gutter py-section sm:py-section-lg">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium text-muted-foreground">Honest pricing</p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Two plans. Zero bait-and-switch.
              </h2>
              <p className="mt-4 text-pretty text-sm text-muted-foreground sm:text-base">
                The free tier is a real plan, not a 7-day trial in disguise. The paid tier exists
                for one reason: people who print QR codes for a living.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-4xl gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-7">
                <h3 className="text-base font-semibold">Professional</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  For a QR code that just works — free, forever.
                </p>
                <p className="mt-5 text-4xl font-semibold tracking-tight">
                  Free
                  <span className="ml-1 text-sm font-normal text-muted-foreground">forever</span>
                </p>
                <ul className="mt-6 space-y-2.5">
                  {[
                    `All ${KINDS.length} code types, none paywalled`,
                    "3 dynamic codes",
                    "Unlimited static codes",
                    "30-day scan analytics",
                    "Watermark-free PNG + SVG export",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-icon-sm shrink-0 text-foreground" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 w-full" size="lg" variant="secondary" onClick={goAuth}>
                  Sign in with Google <GoogleIcon className="ml-2 size-icon-sm" />
                </Button>
              </div>

              <div className="relative rounded-2xl border border-foreground/40 bg-card p-7">
                <span className="absolute -top-3 left-7 rounded-full border border-foreground/30 bg-background px-3 py-1 text-[11px] font-medium text-foreground">
                  Most popular
                </span>
                <h3 className="text-base font-semibold">Enterprise</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  For teams printing at volume and tracking everything.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {ENTERPRISE_TERMS.map((term) => (
                    <div
                      key={term.id}
                      className={cn(
                        "rounded-lg border px-3 py-2",
                        term.id === "yearly"
                          ? "border-foreground/40 bg-foreground/5"
                          : "border-border",
                      )}
                    >
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {term.label}
                        {term.id === "yearly" && (
                          <span className="ml-1.5 rounded-full border border-foreground/40 px-1.5 py-px text-[10px] font-medium normal-case tracking-normal text-foreground">
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
                <ul className="mt-6 space-y-2.5">
                  {[
                    "Unlimited dynamic codes",
                    "Full scan history, never truncated",
                    "Bulk generation from CSV",
                    "Priority support",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-icon-sm shrink-0 text-foreground" />
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
                <div className="grid grid-cols-[minmax(0,1fr)_88px_88px] gap-3 border-b border-border px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground sm:px-7">
                  <span>Feature</span>
                  <span className="text-center">Professional</span>
                  <span className="text-center">Enterprise</span>
                </div>
                {PLAN_MATRIX.map((row) => (
                  <div
                    key={row.feature}
                    className="grid grid-cols-[minmax(0,1fr)_88px_88px] items-center gap-3 border-b border-border px-5 py-3.5 text-sm last:border-b-0 sm:px-7"
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
              <h3 className="text-sm font-medium">The anti-trap guarantee</h3>
              <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["No expiry", "Codes stay live forever, on every plan."],
                  ["No scan caps", "Any number of people can scan — always."],
                  ["No deactivation", "Cancel or downgrade and printed codes keep working."],
                  ["No reprints on upgrade", "Moving to Enterprise keeps every code and slug."],
                  ["No ads or watermarks", "The free plan stays clean — even on downloads."],
                  ["No card-required trials", "Professional is free without a card or a timer."],
                ].map(([title, body]) => (
                  <div key={title}>
                    <p className="flex items-center gap-1.5 text-sm font-medium">
                      <Check className="size-icon-sm shrink-0 text-foreground" /> {title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="mt-16 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
              Questions, answered
            </h3>
            <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
              {PRICING_FAQ.map((item) => (
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

            <div className="mt-12 grid gap-6 rounded-2xl border border-border bg-card p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Still not sure?</h3>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Compare us side by side against QR TIGER, Bitly, Uniqode, Flowcode and QRCode
                  Monkey — the full receipt is public.
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
          <div className="mx-auto max-w-2xl px-5 py-20 sm:py-24">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Good to know</p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Questions, answered
              </h2>
            </div>
            <div className="mt-8 flex justify-center gap-1 rounded-full border border-border bg-card p-1">
              {FAQ_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFaqTab(tab.id)}
                  className={cn(
                    "flex-1 rounded-full px-4 py-1.5 text-xs font-medium transition-colors sm:flex-none sm:px-5",
                    faqTab === tab.id
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
              {FAQS[faqTab].map((item) => (
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

        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute -bottom-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-foreground/[0.06] blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:py-24">
            <Sparkles className="mx-auto size-icon-md text-muted-foreground" />
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Start creating — it's free forever
            </h2>
            <p className="mx-auto mt-4 max-w-md text-pretty text-sm text-muted-foreground sm:text-base">
              Sign in with Google. No passwords, no credit card, no trial timer. Your codes and scan
              history live in your account.
            </p>
            <Button className="mt-8" size="lg" onClick={goAuth}>
              {signedIn ? "Open dashboard" : "Sign in with Google"}
              <GoogleIcon className="ml-2 size-icon-sm" />
            </Button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Github className="size-icon-xs" /> Open source on GitHub — star, fork, or contribute.
            </p>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-main px-gutter">
        <div className="flex flex-col gap-10 border-t border-border py-12 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex max-w-xs flex-col gap-3">
            <span className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
              <Logo className="size-7" />
              Unified QR
            </span>
            <span className="text-xs text-muted-foreground">
              The open platform for everything QR. Free forever, built in public by NxtGenSec.
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
          <div className="grid flex-1 grid-cols-2 gap-8 text-xs sm:grid-cols-3 lg:grid-cols-5">
            <nav className="flex flex-col gap-2">
              <span className="font-medium text-muted-foreground">Product</span>
              <Link to="/create" className="transition-colors hover:text-foreground">
                Generator
              </Link>
              <a href="/#url-qr-code" className="transition-colors hover:text-foreground">
                URL QR code
              </a>
              <a href="/#types" className="transition-colors hover:text-foreground">
                Code types
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
        <div className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Unified QR</span>
          <span className="flex items-center gap-1.5">
            <Globe className="size-icon-xs" /> Built by NxtGenSec, with contributions from the
            community.
          </span>
        </div>
      </footer>

      <MobileNav />
    </div>
  );
}
