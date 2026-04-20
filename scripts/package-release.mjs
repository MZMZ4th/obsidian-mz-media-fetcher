import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const manifest = readJson(path.join(repoRoot, "manifest.json"));
const version = manifest.version;
const releaseDir = path.join(repoRoot, "release", version);

execFileSync(npmCommand, ["run", "release:check"], {
  cwd: repoRoot,
  stdio: "inherit",
});

execFileSync(npmCommand, ["run", "build"], {
  cwd: repoRoot,
  stdio: "inherit",
});

fs.rmSync(releaseDir, { recursive: true, force: true });
fs.mkdirSync(releaseDir, { recursive: true });

for (const asset of ["main.js", "manifest.json", "styles.css", "versions.json"]) {
  fs.copyFileSync(path.join(repoRoot, asset), path.join(releaseDir, asset));
}

console.log(`release assets ready: ${releaseDir}`);
