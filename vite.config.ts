import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: {
    preset: "vercel",
  },
  tanstackStart: {
    importProtection: {
      behavior: "error",
      client: {
        files: ["**/server/**"],
        specifiers: ["server-only"],
      },
    },
  },
  vite: {
    environments: {
      ssr: {
        build: {
          rollupOptions: {
            output: {
              inlineDynamicImports: true,
            },
          },
        },
      },
    },
  },
});
