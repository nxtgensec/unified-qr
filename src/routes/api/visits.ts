import { createFileRoute } from "@tanstack/react-router";

function getCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export const Route = createFileRoute("/api/visits")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const cookieHeader = request.headers.get("cookie");
        let visitorId = getCookie(cookieHeader, "visitor_id");
        let setCookie = false;
        if (!visitorId) {
          visitorId = crypto.randomUUID();
          setCookie = true;
        }

        let page = "/";
        try {
          const body = (await request.json()) as { page?: string };
          if (typeof body.page === "string" && body.page) page = body.page;
        } catch {
          // body is optional
        }
        const ua = request.headers.get("user-agent") ?? "";
        const device = /iphone|ipad|android|mobile/i.test(ua) ? "Mobile" : "Desktop";
        const country =
          request.headers.get("cf-ipcountry") ?? request.headers.get("x-vercel-ip-country") ?? null;

        const today = new Date().toISOString().slice(0, 10);

        await supabaseAdmin.from("visits").upsert(
          {
            visitor_id: visitorId,
            page,
            device,
            country,
            referrer: request.headers.get("referer"),
            visit_date: today,
          },
          { onConflict: "visitor_id,visit_date", ignoreDuplicates: true },
        );

        const [todayRes, totalRes] = await Promise.all([
          supabaseAdmin
            .from("visits")
            .select("id", { count: "exact", head: true })
            .eq("visit_date", today),
          supabaseAdmin.from("visits").select("id", { count: "exact", head: true }),
        ]);

        const headers = new Headers({
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        });
        if (setCookie) {
          headers.append(
            "Set-Cookie",
            `visitor_id=${visitorId}; Path=/; Max-Age=${60 * 60 * 24 * 365}; HttpOnly; SameSite=Lax; Secure`,
          );
        }

        return new Response(
          JSON.stringify({ today: todayRes.count ?? 0, total: totalRes.count ?? 0 }),
          { headers },
        );
      },
    },
  },
});
