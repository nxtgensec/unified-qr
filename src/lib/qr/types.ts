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
  | "upi";

export type DotStyle = "square" | "rounded" | "dots";
export type CornerStyle = "square" | "rounded" | "circle";
export type Ecc = "L" | "M" | "Q" | "H";

export interface QrStyle {
  fg: string;
  bg: string;
  dotStyle: DotStyle;
  cornerStyle: CornerStyle;
  ecc: Ecc;
  margin: number;
  logo?: string | null;
  logoScale: number;
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
};

export type QrContent = Record<string, string>;

export interface KindMeta {
  kind: QrKind;
  label: string;
  hint: string;
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
    default:
      return "";
  }
}
