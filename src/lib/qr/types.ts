export type QrKind =
  | "url"
  | "text"
  | "wifi"
  | "vcard"
  | "email"
  | "sms"
  | "phone"
  | "whatsapp"
  | "event"
  | "geo"
  | "upi"
  | "social"
  | "app"
  | "bitcoin"
  | "googlereview"
  | "coupon"
  | "youtube"
  | "linkedin"
  | "telegram";

export type DotStyle = "square" | "rounded" | "dots" | "diamond";
export type CornerStyle = "square" | "rounded" | "circle" | "diamond";
export type Ecc = "L" | "M" | "Q" | "H";
export type GradientType = "none" | "linear" | "radial";
export type FrameKind = "none" | "scan-me" | "visit-us" | "pay-here" | "call-us" | "download-app";

export interface QrStyle {
  fg: string;
  bg: string;
  dotStyle: DotStyle;
  cornerStyle: CornerStyle;
  ecc: Ecc;
  margin: number;
  logo?: string | null;
  logoScale: number;
  gradientType: GradientType;
  gradientEnd: string;
  gradientAngle: number;
  frame: FrameKind;
  frameText: string;
  eyeStyle: CornerStyle;
  ballStyle: DotStyle;
}

export const defaultStyle: QrStyle = {
  fg: "#000000",
  bg: "#ffffff",
  dotStyle: "rounded",
  cornerStyle: "rounded",
  ecc: "M",
  margin: 2,
  logo: null,
  logoScale: 0.22,
  gradientType: "none",
  gradientEnd: "#1d4ed8",
  gradientAngle: 135,
  frame: "none",
  frameText: "",
  eyeStyle: "rounded",
  ballStyle: "rounded",
};

export interface QrPreset {
  name: string;
  label: string;
  style: Partial<QrStyle>;
}

export const PRESETS: QrPreset[] = [
  {
    name: "minimal",
    label: "Minimal",
    style: { fg: "#000000", bg: "#ffffff", dotStyle: "square", cornerStyle: "square" },
  },
  {
    name: "corporate",
    label: "Corporate",
    style: { fg: "#1e40af", bg: "#ffffff", dotStyle: "rounded", cornerStyle: "rounded" },
  },
  {
    name: "vibrant",
    label: "Vibrant",
    style: {
      fg: "#7c3aed",
      bg: "#ffffff",
      dotStyle: "dots",
      cornerStyle: "circle",
      gradientType: "linear",
      gradientEnd: "#ec4899",
      gradientAngle: 135,
    },
  },
  {
    name: "monochrome",
    label: "Monochrome",
    style: { fg: "#374151", bg: "#f9fafb", dotStyle: "rounded", cornerStyle: "rounded" },
  },
  {
    name: "neon",
    label: "Neon",
    style: {
      fg: "#22d3ee",
      bg: "#0f172a",
      dotStyle: "dots",
      cornerStyle: "circle",
      gradientType: "linear",
      gradientEnd: "#a855f7",
      gradientAngle: 180,
    },
  },
  {
    name: "retro",
    label: "Retro",
    style: {
      fg: "#92400e",
      bg: "#fef3c7",
      dotStyle: "square",
      cornerStyle: "square",
      gradientType: "linear",
      gradientEnd: "#dc2626",
      gradientAngle: 45,
    },
  },
  {
    name: "elegant",
    label: "Elegant",
    style: {
      fg: "#1c1917",
      bg: "#ffffff",
      dotStyle: "rounded",
      cornerStyle: "circle",
      gradientType: "linear",
      gradientEnd: "#78716c",
      gradientAngle: 135,
    },
  },
  {
    name: "playful",
    label: "Playful",
    style: {
      fg: "#f97316",
      bg: "#ffffff",
      dotStyle: "dots",
      cornerStyle: "rounded",
      gradientType: "linear",
      gradientEnd: "#06b6d4",
      gradientAngle: 90,
    },
  },
  {
    name: "ocean",
    label: "Ocean",
    style: {
      fg: "#0369a1",
      bg: "#f0f9ff",
      dotStyle: "rounded",
      cornerStyle: "rounded",
      gradientType: "linear",
      gradientEnd: "#0891b2",
      gradientAngle: 180,
    },
  },
  {
    name: "sunset",
    label: "Sunset",
    style: {
      fg: "#ea580c",
      bg: "#ffffff",
      dotStyle: "dots",
      cornerStyle: "circle",
      gradientType: "linear",
      gradientEnd: "#db2777",
      gradientAngle: 135,
    },
  },
  {
    name: "forest",
    label: "Forest",
    style: {
      fg: "#166534",
      bg: "#f0fdf4",
      dotStyle: "rounded",
      cornerStyle: "rounded",
      gradientType: "linear",
      gradientEnd: "#15803d",
      gradientAngle: 135,
    },
  },
  {
    name: "dark-mode",
    label: "Dark Mode",
    style: {
      fg: "#f8fafc",
      bg: "#0f172a",
      dotStyle: "rounded",
      cornerStyle: "rounded",
      gradientType: "linear",
      gradientEnd: "#94a3b8",
      gradientAngle: 135,
    },
  },
];

export type QrContent = Record<string, string>;

export interface KindMeta {
  kind: QrKind;
  label: string;
  hint: string;
  icon?: string;
  fields: { name: string; label: string; placeholder?: string; type?: string }[];
  proOnly?: boolean;
}

export const KINDS: KindMeta[] = [
  {
    kind: "url",
    label: "Website",
    hint: "Open any link",
    fields: [{ name: "url", label: "URL", placeholder: "https://example.com" }],
  },
  {
    kind: "text",
    label: "Text",
    hint: "Plain text note",
    fields: [{ name: "text", label: "Text", placeholder: "Anything you like", type: "textarea" }],
  },
  {
    kind: "wifi",
    label: "Wi-Fi",
    hint: "Join a network",
    proOnly: true,
    fields: [
      { name: "ssid", label: "Network name", placeholder: "MyNetwork" },
      { name: "password", label: "Password", placeholder: "••••••••" },
      { name: "encryption", label: "Security (WPA / WEP / nopass)", placeholder: "WPA" },
    ],
  },
  {
    kind: "vcard",
    label: "Contact",
    hint: "Digital business card",
    proOnly: true,
    fields: [
      { name: "name", label: "Full name", placeholder: "Ada Lovelace" },
      { name: "org", label: "Company", placeholder: "Unified QR" },
      { name: "title", label: "Job title", placeholder: "Engineer" },
      { name: "phone", label: "Phone", placeholder: "+1 555 0100" },
      { name: "email", label: "Email", placeholder: "ada@example.com" },
      { name: "website", label: "Website", placeholder: "https://example.com" },
    ],
  },
  {
    kind: "email",
    label: "Email",
    hint: "Pre-filled message",
    proOnly: true,
    fields: [
      { name: "to", label: "To", placeholder: "hello@example.com" },
      { name: "subject", label: "Subject", placeholder: "Hello" },
      { name: "body", label: "Message", type: "textarea" },
    ],
  },
  {
    kind: "sms",
    label: "SMS",
    hint: "Pre-filled text message",
    proOnly: true,
    fields: [
      { name: "phone", label: "Phone", placeholder: "+1 555 0100" },
      { name: "message", label: "Message", type: "textarea" },
    ],
  },
  {
    kind: "phone",
    label: "Call",
    hint: "Dial a number",
    proOnly: true,
    fields: [{ name: "phone", label: "Phone", placeholder: "+1 555 0100" }],
  },
  {
    kind: "whatsapp",
    label: "WhatsApp",
    hint: "Start a chat",
    proOnly: true,
    fields: [
      { name: "phone", label: "Number (with country code)", placeholder: "15550100" },
      { name: "message", label: "Message", type: "textarea" },
    ],
  },
  {
    kind: "event",
    label: "Event",
    hint: "Add to calendar",
    proOnly: true,
    fields: [
      { name: "title", label: "Event title", placeholder: "Product launch" },
      { name: "location", label: "Location", placeholder: "Berlin" },
      { name: "start", label: "Starts", type: "datetime-local" },
      { name: "end", label: "Ends", type: "datetime-local" },
    ],
  },
  {
    kind: "geo",
    label: "Location",
    hint: "Drop a pin",
    proOnly: true,
    fields: [
      { name: "lat", label: "Latitude", placeholder: "52.5200" },
      { name: "lng", label: "Longitude", placeholder: "13.4050" },
    ],
  },
  {
    kind: "upi",
    label: "Payment (UPI)",
    hint: "Collect a payment",
    proOnly: true,
    fields: [
      { name: "vpa", label: "UPI ID", placeholder: "name@bank" },
      { name: "name", label: "Payee name", placeholder: "Ada Lovelace" },
      { name: "amount", label: "Amount", placeholder: "250" },
      { name: "note", label: "Note", placeholder: "Invoice 24" },
    ],
  },
  {
    kind: "social",
    label: "Social Media",
    hint: "Link to any social profile",
    proOnly: true,
    fields: [
      {
        name: "platform",
        label: "Platform",
        placeholder: "facebook",
        type: "select:facebook,instagram,linkedin,tiktok,youtube,twitter,snapchat,discord,threads",
      },
      { name: "url", label: "Profile URL", placeholder: "https://facebook.com/yourpage" },
    ],
  },
  {
    kind: "app",
    label: "App Download",
    hint: "Direct to App Store or Play Store",
    proOnly: true,
    fields: [
      { name: "name", label: "App name", placeholder: "My App" },
      { name: "ios", label: "iOS App Store URL", placeholder: "https://apps.apple.com/app/id..." },
      {
        name: "android",
        label: "Play Store URL",
        placeholder: "https://play.google.com/store/apps/details?id=...",
      },
    ],
  },
  {
    kind: "bitcoin",
    label: "Bitcoin",
    hint: "Bitcoin payment address",
    proOnly: true,
    fields: [
      {
        name: "address",
        label: "Bitcoin address",
        placeholder: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      },
      { name: "amount", label: "Amount (BTC)", placeholder: "0.001" },
      { name: "label", label: "Label", placeholder: "Invoice 42" },
    ],
  },
  {
    kind: "googlereview",
    label: "Google Review",
    hint: "Get more reviews",
    proOnly: true,
    fields: [
      { name: "placeId", label: "Google Place ID", placeholder: "ChIJN1t_tDeuEmsRUsoyG83frY4" },
      { name: "url", label: "Or direct review URL", placeholder: "https://g.page/r/..." },
    ],
  },
  {
    kind: "coupon",
    label: "Coupon",
    hint: "Discount code or offer",
    proOnly: true,
    fields: [
      { name: "code", label: "Coupon code", placeholder: "SAVE20" },
      { name: "discount", label: "Discount", placeholder: "20% off" },
      { name: "description", label: "Description", placeholder: "Valid until Dec 31" },
    ],
  },
  {
    kind: "youtube",
    label: "YouTube",
    hint: "Channel or video link",
    proOnly: true,
    fields: [{ name: "url", label: "YouTube URL", placeholder: "https://youtube.com/@channel" }],
  },
  {
    kind: "linkedin",
    label: "LinkedIn",
    hint: "Profile or company page",
    proOnly: true,
    fields: [
      { name: "url", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/username" },
    ],
  },
  {
    kind: "telegram",
    label: "Telegram",
    hint: "Start a Telegram chat",
    proOnly: true,
    fields: [
      { name: "username", label: "Telegram username", placeholder: "username" },
      { name: "message", label: "Pre-filled message", type: "textarea" },
    ],
  },
];

export const KIND_LABEL: Record<QrKind, string> = KINDS.reduce(
  (acc, k) => ({ ...acc, [k.kind]: k.label }),
  {} as Record<QrKind, string>,
);

function esc(value: string) {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

function stamp(value: string) {
  if (!value) return "";
  return value.replace(/[-:]/g, "").replace(/\.\d+/, "") + "00";
}

export function buildPayload(kind: QrKind, c: QrContent): string {
  const g = (key: string) => c[key] ?? "";
  switch (kind) {
    case "url":
      return g("url").trim();
    case "text":
      return g("text");
    case "wifi":
      return `WIFI:T:${(g("encryption") || "WPA").toUpperCase()};S:${esc(g("ssid"))};P:${esc(g("password"))};;`;
    case "vcard":
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${g("name")}`,
        g("org") ? `ORG:${g("org")}` : "",
        g("title") ? `TITLE:${g("title")}` : "",
        g("phone") ? `TEL;TYPE=CELL:${g("phone")}` : "",
        g("email") ? `EMAIL:${g("email")}` : "",
        g("website") ? `URL:${g("website")}` : "",
        "END:VCARD",
      ]
        .filter(Boolean)
        .join("\n");
    case "email":
      return `mailto:${g("to")}?subject=${encodeURIComponent(g("subject"))}&body=${encodeURIComponent(g("body"))}`;
    case "sms":
      return `SMSTO:${g("phone")}:${g("message")}`;
    case "phone":
      return `tel:${g("phone")}`;
    case "whatsapp":
      return `https://wa.me/${g("phone").replace(/\D/g, "")}${g("message") ? `?text=${encodeURIComponent(g("message"))}` : ""}`;
    case "event":
      return [
        "BEGIN:VEVENT",
        `SUMMARY:${g("title")}`,
        g("location") ? `LOCATION:${g("location")}` : "",
        g("start") ? `DTSTART:${stamp(g("start"))}` : "",
        g("end") ? `DTEND:${stamp(g("end"))}` : "",
        "END:VEVENT",
      ]
        .filter(Boolean)
        .join("\n");
    case "geo":
      return `geo:${g("lat") || "0"},${g("lng") || "0"}`;
    case "upi":
      return `upi://pay?pa=${encodeURIComponent(g("vpa"))}&pn=${encodeURIComponent(g("name"))}${g("amount") ? `&am=${encodeURIComponent(g("amount"))}` : ""}${g("note") ? `&tn=${encodeURIComponent(g("note"))}` : ""}&cu=INR`;
    case "social":
      return g("url").trim();
    case "app": {
      const ios = g("ios").trim();
      const android = g("android").trim();
      if (ios && android)
        return `https://unifiedqr.app/app/${encodeURIComponent(g("name"))}?ios=${encodeURIComponent(ios)}&android=${encodeURIComponent(android)}`;
      return ios || android || "";
    }
    case "bitcoin": {
      const addr = g("address").trim();
      const amt = g("amount").trim();
      const label = g("label").trim();
      return `bitcoin:${addr}${amt ? `?amount=${amt}` : ""}${label ? `${amt ? "&" : "?"}label=${encodeURIComponent(label)}` : ""}`;
    }
    case "googlereview": {
      const direct = g("url").trim();
      if (direct) return direct;
      const pid = g("placeId").trim();
      return pid
        ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(pid)}`
        : "";
    }
    case "coupon":
      return g("code")
        ? `COUPON:${g("code")}\n${g("discount")}\n${g("description")}`
        : g("discount") || "";
    case "youtube":
      return g("url").trim();
    case "linkedin":
      return g("url").trim();
    case "telegram":
      return `https://t.me/${g("username").replace(/^@/, "")}${g("message") ? `?text=${encodeURIComponent(g("message"))}` : ""}`;
    default:
      return "";
  }
}
