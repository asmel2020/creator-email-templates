import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        // El shim CJS de base-ui hace require("react"); lo sustituimos por un
        // stub ESM basado en los hooks nativos de React 18+. El orden importa:
        // los subpaths más largos primero (el alias reemplaza por prefijo).
        find: "use-sync-external-store/shim/with-selector",
        replacement: path.resolve(
          import.meta.dirname,
          "src/shims/use-sync-external-store.ts",
        ),
      },
      {
        find: "use-sync-external-store/shim",
        replacement: path.resolve(
          import.meta.dirname,
          "src/shims/use-sync-external-store.ts",
        ),
      },
      {
        find: "use-sync-external-store",
        replacement: path.resolve(
          import.meta.dirname,
          "src/shims/use-sync-external-store.ts",
        ),
      },
      { find: "@", replacement: path.resolve(import.meta.dirname, "./src") },
    ],
  },
  build: {
    lib: {
      entry: {
        index: path.resolve(import.meta.dirname, "src/index.ts"),
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
        return false;
      },
    },
  },
})