import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslintPlugin from "vite-plugin-eslint";
import svgr from "vite-plugin-svgr";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    eslintPlugin(),
    svgr({
      include: "**/*.svg?react",
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