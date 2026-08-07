import QRCode from "qrcode";

import type { QrStyle } from "./types";

const HEX_COLOR = /^#[0-9a-fA-F]{3,6}$/;

function safeColor(value: string | undefined, fallback: string): string {
  return value && HEX_COLOR.test(value) ? value.toLowerCase() : fallback;
}

const RASTER_LOGO = /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i;

function safeLogo(value: string | undefined | null): string | null {
  if (!value) return null;
  if (value.length > 750_000) return null;
  return RASTER_LOGO.test(value) ? value : null;
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
    `<svg xmlns="http://www.w3.org/2000/svg" class="block h-auto w-full" width="${size}" height="${size}" viewBox="0 0 ${finalW} ${finalH}" shape-rendering="geometricPrecision">` +
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

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  const num = parseInt(full, 16);
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

const FRAME_LABELS: Record<string, string> = {
  "scan-me": "SCAN ME",
  "visit-us": "VISIT US",
  "pay-here": "PAY HERE",
  "call-us": "CALL US",
  "download-app": "DOWNLOAD APP",
};

function escEps(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function buildQrEps(payload: string, style: QrStyle): string {
  const safePayload = payload && payload.length > 0 ? payload : " ";
  const qr = QRCode.create(safePayload, { errorCorrectionLevel: style.ecc });
  const fg = safeColor(style.fg, "#000000");
  const bg = safeColor(style.bg, "#ffffff");
  const n = qr.modules.size;
  const data = qr.modules.data;
  const margin = Math.max(0, Math.min(8, style.margin));
  const total = n + margin * 2;

  const frame = buildFrame(n, margin, style.frame, style.frameText, total, fg);
  const finalW = total + frame.extraLeft + frame.extraRight;
  const finalH = total + frame.extraTop + frame.extraBottom;
  const offsetX = frame.extraLeft;
  const offsetY = frame.extraTop;

  const [fr, fgc, fb] = hexToRgb(fg);
  const [br, bgc, bb] = hexToRgb(bg);
  const f = (v: number) => v.toFixed(3);
  const flipY = (y: number, h = 0) => finalH - y - h;
  const setFg = `${fr} ${fgc} ${fb} setrgbcolor`;
  const setBg = `${br} ${bgc} ${bb} setrgbcolor`;

  const eps: string[] = [];
  eps.push("%!PS-Adobe-3.0 EPSF-3.0");
  eps.push(`%%BoundingBox: 0 0 ${f(finalW)} ${f(finalH)}`);
  eps.push("%%Pages: 1");
  eps.push("%%EndComments");
  eps.push("gsave");

  eps.push(setBg);
  eps.push(`0 0 ${f(finalW)} ${f(finalH)} rectfill`);
  eps.push(setFg);

  const isFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!data[y * n + x]) continue;
      if (isFinder(x, y)) continue;
      const cx = x + margin + offsetX;
      const cy = y + margin + offsetY;
      if (style.dotStyle === "dots") {
        eps.push(`newpath ${f(cx + 0.5)} ${f(flipY(cy, 1) + 0.5)} 0.5 0 360 arc fill`);
      } else if (style.dotStyle === "diamond") {
        const s = 0.72;
        const px = cx + 0.5;
        const py = cy + 0.5;
        eps.push(
          `${f(px)} ${f(flipY(py - s))} moveto ${f(px + s)} ${f(flipY(py))} lineto ${f(px)} ${f(flipY(py + s))} lineto ${f(px - s)} ${f(flipY(py))} lineto closepath fill`,
        );
      } else {
        eps.push(`${f(cx)} ${f(flipY(cy, 1))} 1 1 rectfill`);
      }
    }
  }

  const finder = (ox: number, oy: number) => {
    const x = ox + margin + offsetX;
    const y = oy + margin + offsetY;
    if (style.eyeStyle === "diamond") {
      const s = 3.5;
      eps.push(
        `${f(x + 3.5)} ${f(flipY(y))} moveto ${f(x + 7)} ${f(flipY(y + 3.5))} lineto ${f(x + 3.5)} ${f(flipY(y + 7))} lineto ${f(x)} ${f(flipY(y + 3.5))} lineto closepath fill`,
      );
    } else if (style.eyeStyle === "circle") {
      eps.push(`newpath ${f(x + 3.5)} ${f(flipY(y, 7) + 3.5)} 3.5 0 360 arc fill`);
    } else {
      eps.push(`${f(x)} ${f(flipY(y, 7))} 7 7 rectfill`);
    }
    if (style.eyeStyle === "diamond") {
      eps.push(setBg);
      const s = 2.5;
      eps.push(
        `${f(x + 3.5)} ${f(flipY(y + 1))} moveto ${f(x + 6)} ${f(flipY(y + 3.5))} lineto ${f(x + 3.5)} ${f(flipY(y + 6))} lineto ${f(x + 1)} ${f(flipY(y + 3.5))} lineto closepath fill`,
      );
    } else {
      eps.push(setBg);
      eps.push(`${f(x + 1)} ${f(flipY(y + 1, 5))} 5 5 rectfill`);
    }
    eps.push(setFg);
    if (style.ballStyle === "diamond") {
      const s = 1.08;
      eps.push(
        `${f(x + 3.5)} ${f(flipY(y + 3.5 - s))} moveto ${f(x + 3.5 + s)} ${f(flipY(y + 3.5))} lineto ${f(x + 3.5)} ${f(flipY(y + 3.5 + s))} lineto ${f(x + 3.5 - s)} ${f(flipY(y + 3.5))} lineto closepath fill`,
      );
    } else if (style.ballStyle === "circle") {
      eps.push(`newpath ${f(x + 3.5)} ${f(flipY(y + 3.5, 3)) + 1.5} 1.5 0 360 arc fill`);
    } else {
      eps.push(`${f(x + 2)} ${f(flipY(y + 2, 3))} 3 3 rectfill`);
    }
  };
  finder(0, 0);
  finder(n - 7, 0);
  finder(0, n - 7);

  const bannerHeight = 6.5;
  if (frame.extraTop > 0) {
    eps.push(`${f(0)} ${f(finalH - bannerHeight)} ${f(total)} ${f(bannerHeight)} rectfill`);
    const text = frameTextFor(style.frame, style.frameText);
    const fs = 1.5;
    eps.push(`1 1 1 setrgbcolor /Helvetica-Bold findfont ${f(fs)} scalefont setfont`);
    eps.push(
      `(${escEps(text)}) dup stringwidth pop ${f(total)} exch sub 2 div ${f(finalH - bannerHeight / 2 - fs * 0.35)} moveto show`,
    );
    eps.push(setFg);
  }
  if (frame.extraBottom > 0) {
    eps.push(`${f(0)} ${f(0)} ${f(total)} ${f(bannerHeight)} rectfill`);
    const text = frameTextFor(style.frame, style.frameText);
    const fs = 1.5;
    eps.push(`1 1 1 setrgbcolor /Helvetica-Bold findfont ${f(fs)} scalefont setfont`);
    eps.push(
      `(${escEps(text)}) dup stringwidth pop ${f(total)} exch sub 2 div ${f(bannerHeight / 2 - fs * 0.35)} moveto show`,
    );
    eps.push(setFg);
  }

  eps.push("grestore");
  eps.push("showpage");
  eps.push("%%EOF");
  return eps.join("\n");
}

function frameTextFor(frame: string, frameText: string): string {
  if (frame === "none" || !frame) return "";
  return frameText || FRAME_LABELS[frame] || "SCAN ME";
}

export function downloadEps(eps: string, filename: string) {
  const blob = new Blob([eps], { type: "application/postscript" });
  triggerDownload(URL.createObjectURL(blob), `${filename}.eps`, true);
}

export async function renderJpegBlob(svg: string, size = 1024): Promise<Blob> {
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
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not create JPEG"))),
      "image/jpeg",
      0.92,
    );
  });
}

export function buildPdf(
  jpeg: Uint8Array,
  width: number,
  height: number,
  sizePt = 360,
): Uint8Array {
  const pageW = 595.28;
  const pageH = 841.89;
  const imgW = sizePt;
  const imgH = sizePt * (height / width);
  const x = (pageW - imgW) / 2;
  const y = (pageH - imgH) / 2;
  const content = `q\n${imgW} 0 0 ${imgH} ${x} ${y} cm\n/Im0 Do\nQ`;

  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let offset = 0;
  const push = (bytes: Uint8Array) => {
    chunks.push(bytes);
    offset += bytes.length;
  };

  push(enc.encode("%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n"));

  offsets.push(offset);
  push(
    enc.encode(
      `1 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
    ),
  );
  push(jpeg);
  push(enc.encode("\nendstream\nendobj\n"));

  offsets.push(offset);
  push(
    enc.encode(`2 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`),
  );

  offsets.push(offset);
  push(
    enc.encode(
      `3 0 obj\n<< /Type /Page /Parent 5 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 1 0 R >> >> /Contents 2 0 R >>\nendobj\n`,
    ),
  );

  offsets.push(offset);
  push(enc.encode("4 0 obj\n<< /Type /Catalog /Pages 5 0 R >>\nendobj\n"));

  offsets.push(offset);
  push(enc.encode("5 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"));

  offsets.push(offset);
  push(
    enc.encode(
      `6 0 obj\n<< /Producer (Unified QR) /CreationDate (${new Date().toISOString()}) >>\nendobj\n`,
    ),
  );

  const xrefStart = offset;
  let xref = "xref\n0 7\n0000000000 65535 f \n";
  for (const o of offsets) xref += `${String(o).padStart(10, "0")} 00000 n \n`;
  push(enc.encode(xref));
  push(
    enc.encode(`trailer\n<< /Size 7 /Root 4 0 R /Info 6 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`),
  );

  const total = chunks.reduce((s, c) => s + c.length, 0);
  const out = new Uint8Array(total);
  let i = 0;
  for (const c of chunks) {
    out.set(c, i);
    i += c.length;
  }
  return out;
}

export async function downloadPdf(svg: string, filename: string, size = 1024) {
  const jpeg = await renderJpegBlob(svg, size);
  const bytes = new Uint8Array(await jpeg.arrayBuffer());
  const pdf = buildPdf(bytes, size, size);
  triggerDownload(
    URL.createObjectURL(new Blob([pdf.buffer as ArrayBuffer], { type: "application/pdf" })),
    `${filename}.pdf`,
    true,
  );
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
