import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const shouldGenerateSourcemap =
  process.env.SOURCEMAP === "true" || process.env.VITE_SOURCEMAP === "true";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      manifestFilename: "manifest.json",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,txt,woff2,map}"],
        navigateFallback: "index.html"
      },
      manifest: {
        name: "HOOTNER - Enterprise Video Platform",
        short_name: "HOOTNER",
        description: "AI-powered video streaming platform",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#0a0a0f",
        theme_color: "#00ffff",
        orientation: "any",
        categories: ["entertainment", "video", "business"],
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        shortcuts: [
          {
            name: "Video Player",
            url: "/cinema-player.html",
            icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }]
          },
          {
            name: "Login",
            url: "/login.html",
            icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }]
          },
          {
            name: "Dashboard",
            url: "/",
            icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }]
          }
        ],
        prefer_related_applications: false
      }
    })
  ],
  resolve: {
    alias: {
      "@ui": path.resolve(__dirname, "../../hexarchy/4-interface/ui/src"),
      "@ui-components": path.resolve(
        __dirname,
        "../../hexarchy/4-interface/ui/src/components"
      )
    }
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    sourcemap: shouldGenerateSourcemap
  }
});
