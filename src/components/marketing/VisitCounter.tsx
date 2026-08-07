import { Eye } from "lucide-react";
import { useEffect, useState } from "react";

interface VisitStats {
  today: number;
  total: number;
}

export function VisitCounter() {
  const [stats, setStats] = useState<VisitStats | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || window.location.pathname !== "/") return;
    let cancelled = false;
    fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: "/" }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: VisitStats | null) => {
        if (!cancelled && data) setStats(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-50 hidden items-center gap-2 rounded-full border border-border bg-background/80 px-3.5 text-small text-muted-foreground backdrop-blur sm:flex">
      <Eye className="size-icon-xs" />
      <span className="font-mono">{stats ? stats.total.toLocaleString() : "…"}</span>
    </div>
  );
}
