import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({  }) => ({
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'https://delivery-tracker.up.railway.app',
        changeOrigin: true
      }
    }
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
