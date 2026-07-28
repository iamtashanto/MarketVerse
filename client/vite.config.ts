import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { visualizer } from "rollup-plugin-visualizer";

/**
 * Vendor chunk splitting groups code by how often it changes, so a deploy
 * that only touches app code doesn't invalidate the browser cache for large,
 * stable vendor bundles. See docs/FRONTEND_ARCHITECTURE.md §12.
 */
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    mode === "analyze" &&
      visualizer({ filename: "dist/stats.html", gzipSize: true, brotliSize: true }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (/react-dom|\breact\b|react-router/.test(id)) return "vendor-react";
            if (id.includes("@tanstack")) return "vendor-query";
            if (id.includes("pixi.js")) return "vendor-game";
          }
          return undefined;
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
}));
