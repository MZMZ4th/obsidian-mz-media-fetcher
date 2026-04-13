import { build } from "esbuild";

await build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  outfile: "main.js",
  format: "cjs",
  platform: "node",
  target: "es2020",
  sourcemap: false,
  logLevel: "info",
  external: ["obsidian", "fs", "fs/promises", "path"],
});
