import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath, URL } from "node:url"

/*
 * `base` matters because the QR code on the printed stand has to open the
 * deployed page from any host:
 *
 *   /            Cloudflare Pages, Netlify, Vercel, a custom domain
 *   /repo-name/  GitHub Pages project sites
 *
 * Set it with BASE_PATH at build time; the GitHub Actions workflow in
 * .github/workflows/deploy-pages.yml does that automatically.
 */
export default defineConfig(({ isSsrBuild }) => ({
  base: process.env.BASE_PATH || "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  /*
   * Hosts the dev server and `vite preview` accept. Vite refuses unknown Host
   * headers by default (a DNS-rebinding safeguard), which also blocks hosted
   * preview environments — the `.e2b.app` entry below is the sandbox this
   * project was built in. Add your own host here if a preview proxy refuses to
   * load; a normal deploy on a real host does not need any of this.
   */
  server: { host: "0.0.0.0", allowedHosts: [".e2b.app", "localhost", "127.0.0.1"] },
  preview: { host: "0.0.0.0", allowedHosts: [".e2b.app", "localhost", "127.0.0.1"] },
  build: {
    target: "es2022",
    cssMinify: "lightningcss",
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        /*
         * One chunk per vendor package: React stays cacheable on its own, and
         * material-color-utilities — which only a dynamic M3 scheme needs —
         * never reaches a visitor who just reads this page. Skipped for the SSR
         * build (used by the markup checks), where vendor packages are
         * external.
         */
        manualChunks: isSsrBuild
          ? undefined
          : (id) => {
              if (!id.includes("node_modules")) return undefined
              const match = /node_modules\/((?:\.pnpm\/)?(?:@[^/]+\/)?[^/]+)/.exec(id)
              return match ? match[1].replace("/", "_") : "vendor"
            },
      },
    },
  },
}))
