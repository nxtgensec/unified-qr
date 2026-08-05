import { createMiddleware } from "@tanstack/react-start";

import { requireSupabaseAuth } from "./auth-middleware";

export const requireSupabaseAdmin = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile, error } = await context.supabase
      .from("profiles")
      .select("email")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);

    const email = profile?.email?.trim().toLowerCase() ?? "";
    if (!email) throw new Error("Forbidden");

    const { data: admin } = await supabaseAdmin
      .from("admins")
      .select("email")
      .eq("email", email)
      .maybeSingle();
    if (!admin) throw new Error("Forbidden: not an administrator.");

    return next({ context: { ...context, adminEmail: email } });
  });
