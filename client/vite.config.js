import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ["ie>=11"],
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
    }),
  ],
  publicDir: "src/assets",
  base: "./",

  build: {
    outDir: "build",
    sourcemap: false,
    emptyOutDir: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString();
          }
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additonalData: `
        @import "./components/Modal/index.scss";`,
      },
    },
  },
});
