import externalPackages from "./external-packages.config";
import { defineConfig } from "vite"
import path from "path";

const PACKAGE_ROOT = path.resolve(__dirname, "..", "src", "main");

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  root: PACKAGE_ROOT,
  resolve: {
    alias: {
      "scrypt": "js-scrypt",
      "@static": path.resolve(__dirname, "..", "static")
    },
  },
  build: {
    sourcemap: "inline",
    target: "node12",
    outDir: "dist",
    assetsDir: ".",
    minify: process.env.MODE === "development" ? false : undefined, // undefined must set default value
    lib: {
      entry: "index.js",
      formats: ["cjs"],
    },
    rollupOptions: {
      external: externalPackages,
      output: {
        entryFileNames: "[name].cjs",
      },
    },
    commonjsOptions: {
      dynamicRequireTargets: [
        "node_modules/sshpk/**/*.js"
      ],
      ignore: [
        "pg-native" ,
        "./native",
        "fsevents"
      ]
    },
    emptyOutDir: true,
  },
});
