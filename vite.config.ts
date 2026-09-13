import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tanstackStart({
      prerender: { enabled: false },
      spa: { enabled: false },
      server: { entry: "server" },
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    // The website's shared entry is intentionally above Vite's default because
    // it contains the full design system and route manifest.
    chunkSizeWarningLimit: 550,
  },
  server: {
    proxy: {
      "/erp": { target: "http://localhost:5174", changeOrigin: true, ws: true },
    },
  },
});
