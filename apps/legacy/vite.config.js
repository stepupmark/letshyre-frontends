import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import { visualizer } from "rollup-plugin-visualizer";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { env } from "node:process";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    // Bundle treemap, off by default: run `ANALYZE=1 pnpm build`, open build/stats.html.
    // Written outside build/client — emitting it into the bundle publishes the
    // dependency map at /stats.html.
    env.ANALYZE && visualizer({ filename: "build/stats.html" }),
  ],
  resolve: {
    alias: { "@": path.resolve("app") },
  },
  // Catalogs are only read whole; per-key exports just pad every chunk.
  json: { namedExports: false },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        // One chunk per catalog plus one file map per locale, named so the
        // post-build scripts can find them: i18n-<locale>-<namespace|index>.
        // The preload helper gets claimed first: every file map imports it, and
        // otherwise it lands in the first one, dragging that locale onto every page.
        codeSplitting: {
          groups: [
            { name: "preload-helper", test: /preload-helper/, priority: 1 },
            {
              name(id) {
                const m = id.match(/i18n\/messages\/([^/]+)\/([^/]+)\.(?:json|js)$/);
                return m ? `i18n-${m[1]}-${m[2]}` : null;
              },
            },
          ],
        },
      },
    },
  },
});
