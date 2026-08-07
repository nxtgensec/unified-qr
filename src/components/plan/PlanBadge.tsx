import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { fetchMyPlan } from "@/lib/client-queries";
import { cn } from "@/lib/utils";

export function PlanBadge({ className }: { className?: string }) {
  const { data } = useQuery({
    queryKey: ["plan"],
    queryFn: fetchMyPlan,
    staleTime: 60_000,
  });

  const enterprise = data === "enterprise";

  return (
    <Link
      to="/settings"
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors hover:border-ring",
        enterprise
          ? "border-brand/40 bg-brand/10 text-brand"
          : "border-border bg-background text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {enterprise && <Sparkles className="h-3 w-3" />}
      {enterprise ? "Enterprise" : "Professional · Free"}
    </Link>
  );
}
