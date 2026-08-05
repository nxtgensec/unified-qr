import { useEffect, useState } from "react";

interface VisitStats {
  today: number;
  total: number;
}

export function VisitCounter() {
  const [stats, setStats] = useState<VisitStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: window.location.pathname }),
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
    <div className="pointer-events-none fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span className="font-mono">
        {stats
          ? `${stats.today.toLocaleString()} today · ${stats.total.toLocaleString()} total`
          : "…"}
      </span>
    </div>
  );
}
