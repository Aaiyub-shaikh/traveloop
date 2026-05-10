import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy /api to backend in dev when VITE_API_URL is not set to full URL
export default defineConfig({
  plugins: [react()],
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
