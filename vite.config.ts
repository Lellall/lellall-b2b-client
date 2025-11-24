import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslintPlugin from "vite-plugin-eslint";
import svgr from "vite-plugin-svgr";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    eslintPlugin(),
    svgr({
      include: "**/*.svg?react",
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "assets/**/*.{png,jpg,jpeg,svg,ico}",
      ],
      manifest: {
        name: "Lellall-eProc",
        short_name: "eProc",
        description: "Manage procurement and restaurants easily",
        theme_color: "#F59E0B",
        background_color: "#F9FAFB",
        start_url: "/",
        display: "standalone",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,jpeg,svg,webmanifest}"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MiB to accommodate larger JS bundles
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api"),
            handler: "NetworkFirst", // Changed to NetworkFirst for fresher API responses
            options: {
              cacheName: "api-cache",
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxAgeSeconds: 60 * 60, // Cache API responses for 1 hour
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: "0.0.0.0", // Allows access via subdomains
    port: 5173,
    cors: true, // Enable CORS for Vite dev server
    strictPort: true,
    hmr: {
      host: "yax.localhost", // Explicitly set for HMR WebSocket connections
      port: 5173,
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});