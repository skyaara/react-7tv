import { defineConfig } from "tsup";

const shared = {
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
};

export default defineConfig([
  {
    ...shared,
    format: ["esm", "cjs"],
    external: ["react", "react/jsx-runtime"],
    entry: { index: "src/index.ts" },
    outDir: "dist/client",
    // Rollup's optional tree-shaking pass strips module directives. Esbuild's
    // normal tree-shaking keeps the React Server Components boundary intact.
    treeshake: false,
  },
  {
    ...shared,
    format: ["esm", "cjs"],
    external: ["react", "react/jsx-runtime"],
    entry: { index: "src/core.ts" },
    outDir: "dist/core",
  },
]);
