import JSZip from "jszip";

import { buildQrSvg, renderPngBlob } from "@/lib/qr/render";
import { buildPayload, defaultStyle } from "@/lib/qr/types";
import type { QrContent, QrKind, QrStyle } from "@/lib/qr/types";

export interface BackupCode {
  name: string;
  kind: string;
  content: QrContent;
  style: Record<string, unknown>;
  is_dynamic: boolean;
  slug: string | null;
  target_url: string | null;
  scan_count: number | null;
  created_at: string | null;
}

export interface CodeRow {
  name: string;
  kind: string;
  content: unknown;
  style: unknown;
  is_dynamic: boolean;
  slug: string | null;
  target_url: string | null;
  scan_count: number | null;
  created_at: string | null;
}

export function toBackupCode(row: CodeRow): BackupCode {
  return {
    name: row.name,
    kind: row.kind,
    content: (row.content ?? {}) as QrContent,
    style: (row.style ?? {}) as Record<string, unknown>,
    is_dynamic: Boolean(row.is_dynamic),
    slug: row.slug ?? null,
    target_url: row.target_url ?? null,
    scan_count: row.scan_count ?? 0,
    created_at: row.created_at ?? null,
  };
}

function triggerDownload(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function exportBackup(
  codes: BackupCode[],
  format: "json" | "csv" | "zip",
): Promise<{ name: string; count: number }> {
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "json") {
    const payload = {
      app: "unified-qr",
      version: 1,
      exportedAt: new Date().toISOString(),
      codes,
    };
    triggerDownload(
      new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
      `unified-qr-backup-${stamp}.json`,
    );
    return { name: "JSON", count: codes.length };
  }

  if (format === "csv") {
    const header = ["name", "kind", "type", "slug", "target_url", "scans", "created_at", "content"];
    const lines = [
      header.map(csvCell).join(","),
      ...codes.map((c) =>
        [
          c.name,
          c.kind,
          c.is_dynamic ? "dynamic" : "static",
          c.slug ?? "",
          c.target_url ?? "",
          String(c.scan_count ?? 0),
          c.created_at ?? "",
          JSON.stringify(c.content),
        ]
          .map(csvCell)
          .join(","),
      ),
    ];
    triggerDownload(
      new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" }),
      `unified-qr-backup-${stamp}.csv`,
    );
    return { name: "CSV", count: codes.length };
  }

  const zip = new JSZip();
  zip.file(
    "backup.json",
    JSON.stringify(
      { app: "unified-qr", version: 1, exportedAt: new Date().toISOString(), codes },
      null,
      2,
    ),
  );
  const folder = zip.folder("qr-images");
  let rendered = 0;
  codes.forEach((code, index) => {
    if (!folder) return;
    try {
      const payload =
        code.is_dynamic && code.slug
          ? `${window.location.origin}/api/public/r/${code.slug}`
          : buildPayload(code.kind as QrKind, code.content);
      if (!payload.trim()) return;
      const svg = buildQrSvg(payload, { ...defaultStyle, ...(code.style as Partial<QrStyle>) });
      void renderPngBlob(svg, 512).then((blob) => {
        const safe =
          code.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .slice(0, 40) || "qr-code";
        folder.file(`${safe}-${index + 1}.png`, blob);
        rendered++;
      });
    } catch {
      // Skip codes that cannot be rendered.
    }
  });
  const blob = await zip.generateAsync({ type: "blob" });
  triggerDownload(blob, `unified-qr-backup-${stamp}.zip`);
  return { name: `ZIP (${rendered} images)`, count: codes.length };
}
