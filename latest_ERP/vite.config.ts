import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/erp/",
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
    // PDF/chart libraries are intentionally shared by several ERP routes.
    chunkSizeWarningLimit: 650,
  },
  server: {
    port: 5174,
    strictPort: true,
  },
});
