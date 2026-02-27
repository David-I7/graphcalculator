import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "index.html"),
        resetPassword: path.resolve(__dirname, "resetPassword.html"),
        notFound: path.resolve(__dirname, "notFound.html"),
        deleteResponse: path.resolve(__dirname, "deleteResponse.html"),
        privacyPolicy: path.resolve(__dirname, "privacyPolicy.html"),
      },
    },
  },
  server: {
    port: 3000,
    open: "index.html",
    proxy: {
      "/favicon.ico": "http://localhost:8080/public",
    },
  },
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
  resolve: {
    preserveSymlinks: true,
  },
});
