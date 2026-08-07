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
  | "ethereum"
  | "solana"
  | "litecoin"
  | "dogecoin"
  | "monero"
  | "paypal"
  | "googlereview"
  | "trustpilot"
  | "yelp"
  | "booking"
  | "coupon"
  | "youtube"
  | "linkedin"
  | "telegram"
  | "instagram"
  | "tiktok"
  | "facebook"
  | "x";

export type DotStyle = "square" | "rounded" | "dots" | "diamond" | "circle";
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
      { name: "phone", label: "Mobile", placeholder: "+1 555 0100" },
      { name: "phone2", label: "Work phone", placeholder: "+1 555 0199" },
      { name: "email", label: "Email", placeholder: "ada@example.com" },
      { name: "website", label: "Website", placeholder: "https://example.com" },
      { name: "address", label: "Street", placeholder: "1 Example Street" },
      { name: "city", label: "City", placeholder: "London" },
      { name: "state", label: "State", placeholder: "" },
      { name: "zip", label: "Postcode", placeholder: "E1 1AA" },
      { name: "country", label: "Country", placeholder: "United Kingdom" },
      { name: "birthday", label: "Birthday", type: "date" },
      { name: "note", label: "Note", type: "textarea" },
      { name: "photo", label: "Photo (makes the code denser)", type: "file" },
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
    kind: "ethereum",
    label: "Ethereum",
    hint: "ETH payment address",
    proOnly: true,
    fields: [
      {
        name: "address",
        label: "Ethereum address",
        placeholder: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      },
      { name: "amount", label: "Amount (ETH)", placeholder: "0.1" },
      { name: "label", label: "Label", placeholder: "Invoice 42" },
    ],
  },
  {
    kind: "solana",
    label: "Solana",
    hint: "SOL payment address",
    proOnly: true,
    fields: [
      { name: "address", label: "Solana address", placeholder: "7EcES...sollet" },
      { name: "amount", label: "Amount (SOL)", placeholder: "1" },
      { name: "label", label: "Label", placeholder: "Invoice 42" },
      { name: "message", label: "Message", type: "textarea" },
    ],
  },
  {
    kind: "litecoin",
    label: "Litecoin",
    hint: "LTC payment address",
    proOnly: true,
    fields: [
      { name: "address", label: "Litecoin address", placeholder: "LcCb1J6TLLK..." },
      { name: "amount", label: "Amount (LTC)", placeholder: "0.5" },
      { name: "label", label: "Label", placeholder: "Invoice 42" },
    ],
  },
  {
    kind: "dogecoin",
    label: "Dogecoin",
    hint: "DOGE payment address",
    proOnly: true,
    fields: [
      { name: "address", label: "Dogecoin address", placeholder: "D8m4V8eW4Z..." },
      { name: "amount", label: "Amount (DOGE)", placeholder: "500" },
      { name: "label", label: "Label", placeholder: "Invoice 42" },
    ],
  },
  {
    kind: "monero",
    label: "Monero",
    hint: "XMR payment address",
    proOnly: true,
    fields: [
      { name: "address", label: "Monero address", placeholder: "4AdUndXHHZ..." },
      { name: "amount", label: "Amount (XMR)", placeholder: "0.02" },
      { name: "label", label: "Description", placeholder: "Invoice 42" },
    ],
  },
  {
    kind: "paypal",
    label: "PayPal",
    hint: "PayPal.me payment link",
    proOnly: true,
    fields: [
      { name: "username", label: "PayPal username", placeholder: "yourname" },
      { name: "amount", label: "Amount (optional)", placeholder: "25" },
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
    kind: "trustpilot",
    label: "Trustpilot Review",
    hint: "Leave a Trustpilot review",
    proOnly: true,
    fields: [
      {
        name: "url",
        label: "Trustpilot review URL",
        placeholder: "https://trustpilot.com/review/example.com",
      },
    ],
  },
  {
    kind: "yelp",
    label: "Yelp Review",
    hint: "Leave a Yelp review",
    proOnly: true,
    fields: [
      {
        name: "url",
        label: "Yelp business URL",
        placeholder: "https://yelp.com/biz/your-business",
      },
    ],
  },
  {
    kind: "booking",
    label: "Booking Review",
    hint: "Booking link or review",
    proOnly: true,
    fields: [{ name: "url", label: "Booking link", placeholder: "https://www.booking.com/..." }],
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
  {
    kind: "instagram",
    label: "Instagram",
    hint: "Follow an Instagram profile",
    proOnly: true,
    fields: [{ name: "username", label: "Instagram username", placeholder: "username" }],
  },
  {
    kind: "tiktok",
    label: "TikTok",
    hint: "Follow a TikTok profile",
    proOnly: true,
    fields: [{ name: "username", label: "TikTok username", placeholder: "username" }],
  },
  {
    kind: "facebook",
    label: "Facebook",
    hint: "Page or profile link",
    proOnly: true,
    fields: [{ name: "username", label: "Page or profile name", placeholder: "yourpage" }],
  },
  {
    kind: "x",
    label: "X (Twitter)",
    hint: "Follow on X",
    proOnly: true,
    fields: [{ name: "username", label: "X username", placeholder: "username" }],
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
    case "vcard": {
      const photo = g("photo");
      const photoData = photo.startsWith("data:image/") ? photo.slice(photo.indexOf(",") + 1) : "";
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        g("name") ? `FN:${g("name")}` : "",
        g("name") ? `N:${g("name").split(" ").reverse().join(";")};;;` : "",
        g("org") ? `ORG:${g("org")}` : "",
        g("title") ? `TITLE:${g("title")}` : "",
        g("phone") ? `TEL;TYPE=CELL:${g("phone")}` : "",
        g("phone2") ? `TEL;TYPE=WORK:${g("phone2")}` : "",
        g("email") ? `EMAIL:${g("email")}` : "",
        g("website") ? `URL:${g("website")}` : "",
        g("address") || g("city")
          ? `ADR;TYPE=WORK:;;${g("address")};${g("city")};${g("state")};${g("zip")};${g("country")}`
          : "",
        g("birthday") ? `BDAY:${g("birthday")}` : "",
        g("note") ? `NOTE:${g("note")}` : "",
        photoData ? `PHOTO;ENCODING=b;TYPE=JPEG:${photoData}` : "",
        "END:VCARD",
      ]
        .filter(Boolean)
        .join("\n");
    }
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
        return `https://qr.nxtgensec.org/app/${encodeURIComponent(g("name"))}?ios=${encodeURIComponent(ios)}&android=${encodeURIComponent(android)}`;
      return ios || android || "";
    }
    case "bitcoin": {
      const addr = g("address").trim();
      const amt = g("amount").trim();
      const label = g("label").trim();
      return `bitcoin:${addr}${amt ? `?amount=${amt}` : ""}${label ? `${amt ? "&" : "?"}label=${encodeURIComponent(label)}` : ""}`;
    }
    case "ethereum": {
      const addr = g("address").trim();
      const amt = g("amount").trim();
      const label = g("label").trim();
      return `ethereum:${addr}${amt ? `?value=${amt}` : ""}${label ? `${amt ? "&" : "?"}label=${encodeURIComponent(label)}` : ""}`;
    }
    case "solana": {
      const addr = g("address").trim();
      const amt = g("amount").trim();
      const label = g("label").trim();
      const msg = g("message").trim();
      return `solana:${addr}${amt ? `?amount=${amt}` : ""}${label ? `${amt ? "&" : "?"}label=${encodeURIComponent(label)}` : ""}${(amt || label) && msg ? "&" : ""}${msg ? `message=${encodeURIComponent(msg)}` : ""}`;
    }
    case "litecoin": {
      const addr = g("address").trim();
      const amt = g("amount").trim();
      const label = g("label").trim();
      return `litecoin:${addr}${amt ? `?amount=${amt}` : ""}${label ? `${amt ? "&" : "?"}label=${encodeURIComponent(label)}` : ""}`;
    }
    case "dogecoin": {
      const addr = g("address").trim();
      const amt = g("amount").trim();
      const label = g("label").trim();
      return `dogecoin:${addr}${amt ? `?amount=${amt}` : ""}${label ? `${amt ? "&" : "?"}label=${encodeURIComponent(label)}` : ""}`;
    }
    case "monero": {
      const addr = g("address").trim();
      const amt = g("amount").trim();
      const label = g("label").trim();
      return `monero:${addr}${amt ? `?tx_amount=${amt}` : ""}${label ? `${amt ? "&" : "?"}tx_description=${encodeURIComponent(label)}` : ""}`;
    }
    case "paypal": {
      const user = g("username").trim().replace(/^@/, "");
      const amt = g("amount").trim();
      return user
        ? `https://paypal.me/${encodeURIComponent(user)}${amt ? `/${encodeURIComponent(amt)}` : ""}`
        : "";
    }
    case "googlereview": {
      const direct = g("url").trim();
      if (direct) return direct;
      const pid = g("placeId").trim();
      return pid
        ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(pid)}`
        : "";
    }
    case "trustpilot":
    case "yelp":
    case "booking":
      return g("url").trim();
    case "instagram":
      return `https://instagram.com/${g("username").replace(/^@/, "").trim()}`;
    case "tiktok":
      return `https://tiktok.com/@${g("username").replace(/^@/, "").trim()}`;
    case "facebook":
      return `https://facebook.com/${g("username").replace(/^@/, "").trim()}`;
    case "x":
      return `https://x.com/${g("username").replace(/^@/, "").trim()}`;
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
