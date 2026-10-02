import { defineConfig } from "@lovable.dev/vite-tanstack-config";

/** Served from the domain root on Vercel. */
const PRODUCTION_BASE = "/";

export default defineConfig({
  nitro: { preset: "vercel" },
  vite: {
    base: PRODUCTION_BASE,
    server: {
      allowedHosts: ["demo.sourapps.com", "localhost", "127.0.0.1"],
    },
    preview: {
      allowedHosts: ["demo.sourapps.com", "localhost", "127.0.0.1"],
    },
  },
});
