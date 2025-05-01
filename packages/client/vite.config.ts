import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "index.html"),
        test: path.resolve(__dirname, "test.html"),
        resetPassword: path.resolve(__dirname, "resetPassword.html"),
        notFound: path.resolve(__dirname, "notFound.html"),
        deleteResponse: path.resolve(__dirname, "deleteResponse.html"),
      },
    },
  },
  server: {
    port: 3000,
    open: "index.html",
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
