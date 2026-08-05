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
        const destination = (isApple ? ios : android) ?? ios ?? android;
        if (!destination) {
          return new Response("Missing app store link.", { status: 400 });
        }
        return new Response(null, {
          status: 302,
          headers: { Location: destination, "Cache-Control": "no-store" },
        });
      },
    },
  },
});
