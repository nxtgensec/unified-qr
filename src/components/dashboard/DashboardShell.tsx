import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  BarChart3,
  LayoutGrid,
  Layers,
  LogOut,
  Menu,
  Plus,
  QrCode,
  ScanLine,
  Settings,
  Shield,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";
import { PlanBadge } from "@/components/plan/PlanBadge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getAdminStatus } from "@/lib/admin.functions";
import { getMyPlan } from "@/lib/plans.functions";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutGrid },
  { to: "/create", label: "Create", icon: Plus },
  { to: "/codes", label: "My codes", icon: QrCode },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/bulk", label: "Bulk CSV", icon: Layers },
  { to: "/decode", label: "Decode", icon: ScanLine },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function DashboardShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string>("");

  const fetchAdminStatus = useServerFn(getAdminStatus);
  const { data: adminStatus } = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => fetchAdminStatus(),
    staleTime: 120_000,
  });

  const fetchPlan = useServerFn(getMyPlan);
  const { data: plan } = useQuery({
    queryKey: ["plan"],
    queryFn: () => fetchPlan(),
    staleTime: 60_000,
  });
  const isPro = plan?.plan === "enterprise";

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? ""));
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  };

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="flex-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2 font-semibold tracking-tight">
          <Logo className="size-5" />
          Unified QR
        </Link>
        {nav}
        <div className="mt-auto space-y-2 border-t border-sidebar-border pt-4">
          {adminStatus?.isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
            >
              <Shield className="h-4 w-4" />
              Admin panel
            </Link>
          )}
          <PlanBadge className="w-full justify-center" />
          <p className="truncate px-3 text-xs text-muted-foreground">
            {email}
            {isPro && (
              <span className="ml-1 align-super text-[10px] font-bold uppercase leading-none text-brand">
                Pro
              </span>
            )}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => void signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/80" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-sidebar-border bg-sidebar p-4">
            <div className="mb-8 flex items-center justify-between px-2">
              <span className="flex items-center gap-2 font-semibold">
                <Logo className="size-5" /> Unified QR
              </span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-4 w-4" />
              </button>
            </div>
            {nav}
            <div className="mt-auto space-y-2 border-t border-sidebar-border pt-4">
              {adminStatus?.isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
                >
                  <Shield className="h-4 w-4" />
                  Admin panel
                </Link>
              )}
              <PlanBadge className="w-full justify-center" />
              <p className="truncate px-3 text-xs text-muted-foreground">
                {email}
                {isPro && (
                  <span className="ml-1 align-super text-[10px] font-bold uppercase leading-none text-brand">
                    Pro
                  </span>
                )}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => void signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 px-5 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center gap-3">
            <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
              </div>
              {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
            </div>
            {actions}
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
      </div>
    </div>
  );
}
