import { defineConfig } from "vite"
import path from "path";
import reactRefresh from "@vitejs/plugin-react-refresh";
import reactSvgPlugin from "vite-plugin-react-svg";

const PACKAGE_ROOT = path.resolve(__dirname, "..", "src", "renderer");

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  root: PACKAGE_ROOT,
  mode: "development",
  resolve: {
    alias: {
      "@static": path.resolve(__dirname, '../static')
    },
    symlinks: false
  },
  plugins: [
    reactRefresh(),
    reactSvgPlugin({
      svgoConfig: {
        removeViewBox: false
      }
    })
  ],
  base: "",
  build: {
    sourcemap: "inline",
    target: "chrome89",
    polyfillDynamicImport: false,
    outDir: "dist",
    minify: process.env.MODE === "development" ? false : undefined, // undefined must set default value
    rollupOptions: {
      // this is necessary because of the hackery in
      // @ganache/filecoin-options/index.ts that tries to load `./src`
      // for dev and fallsback to the minified built version
      external: ["./src"]
    },
    emptyOutDir: true,
  },
})
