import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/r/$slug")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const slug = params.slug;

        const { data: code } = await supabaseAdmin
          .from("qr_codes")
          .select("id,target_url,scan_count")
          .eq("slug", slug)
          .maybeSingle();

        if (!code?.target_url) {
          return new Response("This code is not linked to a destination.", { status: 404 });
        }

        const COOLDOWN_MS = 30_000;

        const { data: recent } = await supabaseAdmin
          .from("qr_scans")
          .select("scanned_at")
          .eq("code_id", code.id)
          .order("scanned_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const lastScan = recent ? new Date(recent.scanned_at).getTime() : 0;
        const withinCooldown = Date.now() - lastScan < COOLDOWN_MS;

        if (!withinCooldown) {
          const ua = request.headers.get("user-agent") ?? "";
          const device = /iphone|ipad|android|mobile/i.test(ua) ? "Mobile" : "Desktop";
          const country =
            request.headers.get("cf-ipcountry") ??
            request.headers.get("x-vercel-ip-country") ??
            null;

          await supabaseAdmin.from("qr_scans").insert({
            code_id: code.id,
            device,
            country,
            referrer: request.headers.get("referer"),
          });
          await supabaseAdmin
            .from("qr_codes")
            .update({ scan_count: (code.scan_count ?? 0) + 1 })
            .eq("id", code.id);
        }

        return new Response(null, {
          status: 302,
          headers: { Location: code.target_url, "Cache-Control": "no-store" },
        });
      },
    },
  },
});
