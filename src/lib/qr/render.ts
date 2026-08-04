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

function buildDefs(style: QrStyle): string {
  const defs: string[] = [];
  if (style.gradientType === "linear" || style.gradientType === "radial") {
    const fg = safeColor(style.fg, "#000000");
    const end = safeColor(style.gradientEnd, "#1d4ed8");
    const angle = style.gradientAngle ?? 135;
    if (style.gradientType === "linear") {
      const rad = (angle * Math.PI) / 180;
      const x1 = 50 - 50 * Math.cos(rad);
      const y1 = 50 - 50 * Math.sin(rad);
      const x2 = 50 + 50 * Math.cos(rad);
      const y2 = 50 + 50 * Math.sin(rad);
      defs.push(
        `<linearGradient id="qr-grad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">` +
          `<stop offset="0%" stop-color="${fg}"/>` +
          `<stop offset="100%" stop-color="${end}"/>` +
          `</linearGradient>`,
      );
    } else {
      defs.push(
        `<radialGradient id="qr-grad" cx="50%" cy="50%" r="60%">` +
          `<stop offset="0%" stop-color="${fg}"/>` +
          `<stop offset="100%" stop-color="${end}"/>` +
          `</radialGradient>`,
      );
    }
  }
  return defs.length > 0 ? `<defs>${defs.join("")}</defs>` : "";
}

function buildFrame(
  n: number,
  margin: number,
  frame: string,
  frameText: string,
  total: number,
  fg: string,
): {
  extraTop: number;
  extraBottom: number;
  extraLeft: number;
  extraRight: number;
  frameSvg: string;
} {
  if (frame === "none" || !frame)
    return { extraTop: 0, extraBottom: 0, extraLeft: 0, extraRight: 0, frameSvg: "" };

  const labels: Record<string, string> = {
    "scan-me": "SCAN ME",
    "visit-us": "VISIT US",
    "pay-here": "PAY HERE",
    "call-us": "CALL US",
    "download-app": "DOWNLOAD APP",
  };
  const text = frameText || labels[frame] || "SCAN ME";

  const padding = 2;
  const textHeight = 2.5;
  const bannerHeight = textHeight + padding * 2;

  const top = frame === "scan-me" || frame === "download-app" ? bannerHeight : 0;
  const bottom =
    frame === "visit-us" || frame === "pay-here" || frame === "call-us" ? bannerHeight : 0;

  const bannerWidth = total;
  const bannerY = frame === "scan-me" || frame === "download-app" ? -bannerHeight : total;
  const textY = bannerY + bannerHeight / 2 + 0.1;

  const bannerSvg =
    `<rect x="0" y="${bannerY}" width="${bannerWidth}" height="${bannerHeight}" fill="${fg}" rx="0.8"/>` +
    `<text x="${bannerWidth / 2}" y="${textY}" text-anchor="middle" dominant-baseline="central" ` +
    `font-family="sans-serif" font-weight="700" font-size="${textHeight * 0.6}" fill="white" letter-spacing="0.15">${escSvg(text)}</text>`;

  return { extraTop: top, extraBottom: bottom, extraLeft: 0, extraRight: 0, frameSvg: bannerSvg };
}

function escSvg(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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

  const hasGrad = style.gradientType === "linear" || style.gradientType === "radial";
  const fill = hasGrad ? "url(#qr-grad)" : fg;

  const isFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);

  const moduleR =
    style.dotStyle === "dots"
      ? 0.5
      : style.dotStyle === "rounded"
        ? 0.28
        : style.dotStyle === "diamond"
          ? 0
          : 0;
  const eyeR =
    style.eyeStyle === "circle"
      ? 3.5
      : style.eyeStyle === "rounded"
        ? 2
        : style.eyeStyle === "diamond"
          ? 0
          : 0;
  const ballR =
    style.ballStyle === "circle"
      ? 1.5
      : style.ballStyle === "rounded"
        ? 0.8
        : style.ballStyle === "diamond"
          ? 0
          : 0;

  let cells = "";
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!data[y * n + x]) continue;
      if (isFinder(x, y)) continue;
      const cx = x + margin;
      const cy = y + margin;
      if (style.dotStyle === "dots") {
        cells += `<circle cx="${cx + 0.5}" cy="${cy + 0.5}" r="0.5"/>`;
      } else if (style.dotStyle === "diamond") {
        const s = 0.72;
        cells += `<polygon points="${cx + 0.5},${cy + 0.5 - s} ${cx + 0.5 + s},${cy + 0.5} ${cx + 0.5},${cy + 0.5 + s} ${cx + 0.5 - s},${cy + 0.5}"/>`;
      } else {
        cells += `<rect x="${cx}" y="${cy}" width="1" height="1" rx="${moduleR}"/>`;
      }
    }
  }

  const finder = (ox: number, oy: number) => {
    const x = ox + margin;
    const y = oy + margin;
    const oR = eyeR;
    const bR = ballR;

    let outer: string;
    if (style.eyeStyle === "diamond") {
      const s = 3.5;
      outer = `<polygon points="${x + 3.5},${y} ${x + 7},${y + 3.5} ${x + 3.5},${y + 7} ${x},${y + 3.5}"/>`;
    } else if (style.eyeStyle === "circle") {
      outer = `<circle cx="${x + 3.5}" cy="${y + 3.5}" r="3.5"/>`;
    } else {
      outer = `<rect x="${x}" y="${y}" width="7" height="7" rx="${oR}"/>`;
    }

    let innerBg: string;
    if (style.eyeStyle === "diamond") {
      innerBg = `<polygon points="${x + 3.5},${y + 1} ${x + 6},${y + 3.5} ${x + 3.5},${y + 6} ${x + 1},${y + 3.5}" fill="${bg}"/>`;
    } else {
      const cutR = Math.max(0, oR - 1);
      innerBg = `<rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="${cutR}" fill="${bg}"/>`;
    }

    let ball: string;
    if (style.ballStyle === "diamond") {
      const s = 1.08;
      ball = `<polygon points="${x + 3.5},${y + 3.5 - s} ${x + 3.5 + s},${y + 3.5} ${x + 3.5},${y + 3.5 + s} ${x + 3.5 - s},${y + 3.5}"/>`;
    } else if (style.ballStyle === "circle") {
      ball = `<circle cx="${x + 3.5}" cy="${y + 3.5}" r="1.5"/>`;
    } else {
      ball = `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="${bR}"/>`;
    }

    return outer + innerBg + ball;
  };

  const finders = finder(0, 0) + finder(n - 7, 0) + finder(0, n - 7);

  const frame = buildFrame(n, margin, style.frame, style.frameText, total, fg);
  const extraTop = frame.extraTop;
  const extraBottom = frame.extraBottom;
  const extraLeft = frame.extraLeft;
  const extraRight = frame.extraRight;
  const finalW = total + extraLeft + extraRight;
  const finalH = total + extraTop + extraBottom;
  const offsetX = extraLeft;
  const offsetY = extraTop;

  let logoTag = "";
  if (logo) {
    const w = Math.max(0.1, Math.min(0.34, style.logoScale)) * n;
    const posX = offsetX + (total - w) / 2;
    const posY = offsetY + (total - w) / 2;
    const pad = w * 0.12;
    logoTag =
      `<rect x="${posX - pad}" y="${posY - pad}" width="${w + pad * 2}" height="${w + pad * 2}" rx="${w * 0.18}" fill="${bg}"/>` +
      `<image href="${logo}" x="${posX}" y="${posY}" width="${w}" height="${w}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  const defs = buildDefs(style);

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${finalW} ${finalH}" shape-rendering="geometricPrecision">` +
    defs +
    `<rect width="${finalW}" height="${finalH}" fill="${bg}"/>` +
    frame.frameSvg +
    `<g transform="translate(${offsetX},${offsetY})" fill="${fill}">${cells}</g>` +
    `<g transform="translate(${offsetX},${offsetY})" fill="${fill}">${finders}</g>` +
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
