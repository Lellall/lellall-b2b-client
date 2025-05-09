// vite.config.js
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
      registerType: "autoUpdate", // Automatically updates the service worker
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "assets/**/*.{png,jpg,jpeg,svg,ico}",
      ], // Cache static assets, including images in src/assets
      manifest: {
        name: "Lellall-eProc",
        short_name: "eProc",
        description: "Manage procurement and restaurants easily",
        theme_color: "#F59E0B", // Amber color from your app's theme
        background_color: "#F9FAFB", // Matches bg-gray-50 in Staff component
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
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,jpeg,svg,webmanifest}"], // Cache common file types
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api"), // Cache API responses
            handler: "CacheFirst",
            options: {
              cacheName: "api-cache",
              cacheableResponse: {
                statuses: [0, 200],
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
    cors: true,
    strictPort: true, // Ensures Vite doesn't switch ports
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
    outDir: "dist", // Explicitly set output directory
    emptyOutDir: true, // Clean the dist folder before building
  },
});