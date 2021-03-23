import externalPackages from "./external-packages.config";
import { defineConfig } from "vite"
import path from "path";

const PACKAGE_ROOT = path.resolve(__dirname, "..");

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  root: PACKAGE_ROOT,
  resolve: {
    alias: {
      "scrypt": "js-scrypt"
    },
  },
  build: {
    sourcemap: "inline",
    target: "node12",
    outDir: "dist",
    assetsDir: ".",
    minify: process.env.MODE === "development" ? false : undefined, // undefined must set default value
    lib: {
      entry: "src/main/index.js",
      formats: ["cjs"],
    },
    rollupOptions: {
      external: externalPackages,
      output: {
        entryFileNames: "[name].cjs",
      },
    },
    emptyOutDir: true,
  },
})
