import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: {
        index: path.resolve(import.meta.dirname, "src/index.ts"),
        server: path.resolve(import.meta.dirname, "src/server.ts"),
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: "style",
    },
    sourcemap: true,
    rollupOptions: {
      external: (id) => {
        // React completo (y subpaths) SIEMPRE externo: el consumidor aporta su copia.
        if (id === "react" || id.startsWith("react/")) return true;
        if (id === "react-dom" || id.startsWith("react-dom/")) return true;
        // use-sync-external-store (CJS) hace require("react"); se externaliza para
        // que el bundler del consumidor interopee el require sin el shim de rolldown.
        if (
          id === "use-sync-external-store" ||
          id.startsWith("use-sync-external-store/")
        ) {
          return true;
        }
        return false;
      },
    },
  },
})