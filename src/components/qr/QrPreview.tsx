import { useMemo } from "react";

import { buildQrSvg } from "@/lib/qr/render";
import type { QrStyle } from "@/lib/qr/types";
import { cn } from "@/lib/utils";

interface QrPreviewProps {
  payload: string;
  style: QrStyle;
  className?: string;
  size?: number;
}

export function QrPreview({ payload, style, className, size = 320 }: QrPreviewProps) {
  const svg = useMemo(() => {
    try {
      return buildQrSvg(payload, style, size);
    } catch {
      return null;
    }
  }, [payload, style, size]);

  if (!svg) {
    return (
      <div
        className={cn(
          "flex aspect-square w-full items-center justify-center rounded-xl border border-border bg-muted text-xs text-muted-foreground",
          className,
        )}
      >
        Content is too long for a QR code
      </div>
    );
  }

  return (
    <div
      className={cn(
        "aspect-square w-full overflow-hidden rounded-xl border border-border",
        className,
      )}
      // Generated from our own sanitised inputs (hex colors + data URLs).
      dangerouslySetInnerHTML={{ __html: svg }}
      role="img"
      aria-label="QR code preview"
    />
  );
}
