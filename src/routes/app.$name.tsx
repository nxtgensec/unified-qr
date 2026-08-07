import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/$name")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const ios = url.searchParams.get("ios");
        const android = url.searchParams.get("android");
        const ua = request.headers.get("user-agent") ?? "";
        const isApple = /iphone|ipad|ipod/i.test(ua);
        const candidate = (isApple ? ios : android) ?? ios ?? android;
        if (!candidate) {
          return new Response("Missing app store link.", { status: 400 });
        }
        let destination: URL;
        try {
          destination = new URL(candidate);
        } catch {
          return new Response("Invalid app store link.", { status: 400 });
        }
        if (destination.protocol !== "https:") {
          return new Response("Invalid app store link.", { status: 400 });
        }
        return new Response(null, {
          status: 302,
          headers: { Location: destination.toString(), "Cache-Control": "no-store" },
        });
      },
    },
  },
});
