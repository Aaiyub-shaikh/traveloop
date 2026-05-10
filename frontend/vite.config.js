import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy /api to backend in dev when VITE_API_URL is not set to full URL
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/recharts")) return "recharts";
          if (id.includes("node_modules/@dnd-kit")) return "dnd";
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react-router")) return "react-vendor";
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_PROXY_TARGET || "http://localhost:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: process.env.VITE_PROXY_TARGET || "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
