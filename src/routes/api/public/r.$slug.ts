import { createFileRoute } from "@tanstack/react-router";

import { parseCookies, pickTargetUrl, verifyPassword } from "@/lib/dynamic";

const BRAND = "Unified QR";

function pageShell(body: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${BRAND}</title><style>
  *{box-sizing:border-box}body{margin:0;background:#0a0a0b;color:#fafafa;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
  .card{background:#18181b;border:1px solid #27272a;border-radius:16px;padding:32px;width:100%;max-width:380px;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.5)}
  h1{font-size:18px;margin:0 0 8px;letter-spacing:-.01em}p{font-size:13px;color:#a1a1aa;margin:0 0 20px;line-height:1.5}
  input{width:100%;padding:10px 12px;border-radius:10px;border:1px solid #3f3f46;background:#18181b;color:#fafafa;font-size:14px;margin-bottom:12px;outline:none}input:focus{border-color:#60a5fa}
  button{width:100%;padding:10px 12px;border-radius:10px;border:0;background:#fafafa;color:#0a0a0b;font-size:14px;font-weight:600;cursor:pointer}button:hover{opacity:.9}
  .err{background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.35);color:#fca5a5;font-size:12px;border-radius:10px;padding:8px 10px;margin-bottom:12px}
  .brand{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#71717a;margin-bottom:20px}
  </style></head><body><div class="card">${body}</div></body></html>`;
}

function expiredPage() {
  return new Response(
    pageShell(
      `<div class="brand">${BRAND}</div><h1>This QR code has expired.</h1><p>The destination was set to stop working after its end date. Ask the owner for an updated code.</p>`,
    ),
    {
      status: 410,
      headers: { "content-type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    },
  );
}

function gatePage(slug: string, error: boolean) {
  const body = `<div class="brand">${BRAND}</div><h1>Protected QR code</h1><p>This code is locked. Enter the password to continue.</p>${
    error ? '<div class="err">Incorrect password. Try again.</div>' : ""
  }<form method="post" action="/api/public/r/${slug}"><input type="password" name="password" placeholder="Password" autofocus autocomplete="current-password"><button type="submit">Continue</button></form>`;
  return new Response(pageShell(body), {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function lookupCode(slug: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("qr_codes")
    .select("id,target_url,scan_count,expires_at,password_hash,redirect_rules")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

function parseTarget(raw: string): URL {
  const target = new URL(raw);
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    throw new Error("Not an http(s) URL.");
  }
  return target;
}

function cookieHeaders(slug: string, secure: boolean): string {
  return `qr_${slug}=1; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`;
}

function isExpired(code: { expires_at?: string | null }): boolean {
  return Boolean(code.expires_at) && new Date(code.expires_at as string).getTime() < Date.now();
}

async function recordScan(
  codeId: string,
  scanCount: number | null,
  request: Request,
): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const COOLDOWN_MS = 30_000;
  const { data: recent } = await supabaseAdmin
    .from("qr_scans")
    .select("scanned_at")
    .eq("code_id", codeId)
    .order("scanned_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastScan = recent ? new Date(recent.scanned_at).getTime() : 0;
  if (Date.now() - lastScan < COOLDOWN_MS) return;

  const ua = request.headers.get("user-agent") ?? "";
  const device = /iphone|ipad|android|mobile/i.test(ua) ? "Mobile" : "Desktop";
  const country =
    request.headers.get("cf-ipcountry") ?? request.headers.get("x-vercel-ip-country") ?? null;

  await supabaseAdmin.from("qr_scans").insert({
    code_id: codeId,
    device,
    country,
    referrer: request.headers.get("referer"),
  });
  await supabaseAdmin
    .from("qr_codes")
    .update({ scan_count: (scanCount ?? 0) + 1 })
    .eq("id", codeId);
}

export const Route = createFileRoute("/api/public/r/$slug")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const code = await lookupCode(params.slug);
        if (!code?.target_url) {
          return new Response("This code is not linked to a destination.", { status: 404 });
        }
        if (isExpired(code)) return expiredPage();

        if (code.password_hash) {
          const cookies = parseCookies(request.headers.get("cookie"));
          if (cookies[`qr_${params.slug}`] !== "1") {
            return gatePage(params.slug, false);
          }
        }

        let target: URL;
        try {
          target = parseTarget(pickTargetUrl(code, request.headers.get("accept-language")));
        } catch {
          return new Response("This code is not linked to a valid destination.", { status: 404 });
        }

        await recordScan(code.id, code.scan_count, request);

        return new Response(null, {
          status: 302,
          headers: {
            Location: target.toString(),
            "Cache-Control": "no-store",
          },
        });
      },

      POST: async ({ params, request }) => {
        const code = await lookupCode(params.slug);
        if (!code?.target_url) {
          return new Response("This code is not linked to a destination.", { status: 404 });
        }
        if (isExpired(code)) return expiredPage();

        const secure = new URL(request.url).protocol === "https:";
        if (!code.password_hash) {
          let target: URL;
          try {
            target = parseTarget(pickTargetUrl(code, null));
          } catch {
            return new Response("This code is not linked to a valid destination.", {
              status: 404,
            });
          }
          return new Response(null, {
            status: 302,
            headers: {
              Location: target.toString(),
              "Set-Cookie": cookieHeaders(params.slug, secure),
            },
          });
        }

        let password = "";
        try {
          const form = await request.formData();
          password = String(form.get("password") ?? "");
        } catch {
          return gatePage(params.slug, true);
        }

        const valid = await verifyPassword(password, code.password_hash);
        if (!valid) return gatePage(params.slug, true);

        let target: URL;
        try {
          target = parseTarget(pickTargetUrl(code, request.headers.get("accept-language")));
        } catch {
          return new Response("This code is not linked to a valid destination.", { status: 404 });
        }

        await recordScan(code.id, code.scan_count, request);

        return new Response(null, {
          status: 302,
          headers: {
            Location: target.toString(),
            "Set-Cookie": cookieHeaders(params.slug, secure),
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
