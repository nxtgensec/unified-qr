import QRCode from "qrcode";

import type { QrStyle } from "./types";

const HEX_COLOR = /^#[0-9a-fA-F]{3,6}$/;

function safeColor(value: string | undefined, fallback: string): string {
  return value && HEX_COLOR.test(value) ? value.toLowerCase() : fallback;
}

function safeLogo(value: string | undefined | null): string | null {
  if (!value) return null;
  return value.startsWith("data:image/") ? value : null;
}

/**
 * Builds a standalone SVG string for a QR payload with custom module and
 * finder-pattern styling. Pure string work, so it is safe during SSR.
 * All style values are sanitised before being interpolated into the SVG.
 */
export function buildQrSvg(payload: string, style: QrStyle, size = 512): string {
  const safePayload = payload && payload.length > 0 ? payload : " ";
  const qr = QRCode.create(safePayload, { errorCorrectionLevel: style.ecc });
  const fg = safeColor(style.fg, "#000000");
  const bg = safeColor(style.bg, "#ffffff");
  const logo = safeLogo(style.logo);
  const n = qr.modules.size;
  const data = qr.modules.data;
  const margin = Math.max(0, Math.min(8, style.margin));
  const total = n + margin * 2;

  const isFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);

  const dotRadius = style.dotStyle === "dots" ? 0.5 : style.dotStyle === "rounded" ? 0.28 : 0;

  let cells = "";
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!data[y * n + x]) continue;
      if (isFinder(x, y)) continue;
      const cx = x + margin;
      const cy = y + margin;
      if (style.dotStyle === "dots") {
        cells += `<circle cx="${cx + 0.5}" cy="${cy + 0.5}" r="0.5"/>`;
      } else {
        cells += `<rect x="${cx}" y="${cy}" width="1" height="1" rx="${dotRadius}"/>`;
      }
    }
  }

  const cornerR = style.cornerStyle === "circle" ? 3.5 : style.cornerStyle === "rounded" ? 2 : 0;
  const innerR = style.cornerStyle === "circle" ? 1.5 : style.cornerStyle === "rounded" ? 0.8 : 0;

  const finder = (ox: number, oy: number) => {
    const x = ox + margin;
    const y = oy + margin;
    return (
      `<rect x="${x}" y="${y}" width="7" height="7" rx="${cornerR}" fill="${fg}"/>` +
      `<rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="${Math.max(0, cornerR - 1)}" fill="${bg}"/>` +
      `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="${innerR}" fill="${fg}"/>`
    );
  };

  const finders = finder(0, 0) + finder(n - 7, 0) + finder(0, n - 7);

  let logoTag = "";
  if (logo) {
    const w = Math.max(0.1, Math.min(0.34, style.logoScale)) * n;
    const pos = (total - w) / 2;
    const pad = w * 0.12;
    logoTag =
      `<rect x="${pos - pad}" y="${pos - pad}" width="${w + pad * 2}" height="${w + pad * 2}" rx="${w * 0.18}" fill="${bg}"/>` +
      `<image href="${logo}" x="${pos}" y="${pos}" width="${w}" height="${w}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${total} ${total}" shape-rendering="geometricPrecision">` +
    `<rect width="${total}" height="${total}" fill="${bg}"/>` +
    `<g fill="${fg}">${cells}</g>` +
    finders +
    logoTag +
    `</svg>`
  );
}

export function svgToDataUrl(svg: string) {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export function downloadSvg(svg: string, filename: string) {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  triggerDownload(URL.createObjectURL(blob), `${filename}.svg`, true);
}

export async function renderPngBlob(svg: string, size = 1024): Promise<Blob> {
  const url = svgToDataUrl(svg);
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Could not rasterise the QR code"));
    img.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable");
  ctx.drawImage(img, 0, 0, size, size);
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not create PNG"))), "image/png");
  });
}

export async function downloadPng(svg: string, filename: string, size = 1024) {
  const blob = await renderPngBlob(svg, size);
  triggerDownload(URL.createObjectURL(blob), `${filename}.png`, true);
}

function triggerDownload(href: string, name: string, revoke: boolean) {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (revoke) setTimeout(() => URL.revokeObjectURL(href), 1000);
}

export function slugify() {
  const alphabet = "abcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  const bytes = new Uint8Array(7);
  crypto.getRandomValues(bytes);
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}
