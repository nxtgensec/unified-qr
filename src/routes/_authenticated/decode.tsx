import { createFileRoute } from "@tanstack/react-router";
import jsQR from "jsqr";
import { ScanLine } from "lucide-react";
import { useRef, useState } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/decode")({
  head: () => ({
    meta: [
      { title: "Decode a QR image — Unified QR" },
      { name: "description", content: "Upload a QR code image and read the data inside it." },
      { property: "og:title", content: "Decode a QR image — Unified QR" },
      {
        property: "og:description",
        content: "Upload a QR code image and read the data inside it.",
      },
    ],
  }),
  component: DecodePage,
});

function DecodePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setResult(null);
    setError(null);
    const img = new Image();
    img.onload = () => {
      const max = 1500;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) return setError("Could not read that image.");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(data.data, data.width, data.height);
      if (code?.data) setResult(code.data);
      else setError("No QR code found in that image.");
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => setError("Could not read that image.");
    img.src = URL.createObjectURL(file);
  };

  return (
    <DashboardShell title="Decode" description="Read the contents of an existing QR image.">
      <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
        <ScanLine className="mx-auto size-icon-md text-muted-foreground" />
        <p className="mt-4 text-sm">Upload a PNG or JPG containing a QR code</p>
        <Button className="mt-6" size="sm" onClick={() => inputRef.current?.click()}>
          Choose image
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {error && <p className="mt-6 text-sm text-destructive">{error}</p>}
      {result && (
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Decoded content</p>
          <p className="mt-3 break-all font-mono text-sm">{result}</p>
          <Button
            className="mt-4"
            size="sm"
            variant="secondary"
            onClick={() => void navigator.clipboard.writeText(result)}
          >
            Copy
          </Button>
        </div>
      )}
    </DashboardShell>
  );
}
