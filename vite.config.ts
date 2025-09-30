import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Performance optimizations
  build: {
    // Enable source maps for better debugging
    sourcemap: true,

    // Optimize chunk splitting
    rollupOptions: {
      output: {
        // Better cache busting with content-based hashing
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",

        // Split vendor chunks for better caching
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
          utils: ["lucide-react"],
        },
      },
    },

    // Enable minification
    minify: "terser",
  },

  // Development server configuration
  server: {
    headers: {
      // Security headers for development
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  },

  // CSS optimization
  css: {
    devSourcemap: true,
  },
});
