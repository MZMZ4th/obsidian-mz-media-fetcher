import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const defaultVault = path.join(process.env.HOME || process.env.USERPROFILE || "", "Obsidian", "CodexBase-OS");
const vaultPath = path.resolve(process.argv[2] || process.env.OBSIDIAN_DEV_VAULT || defaultVault);
const obsidianDir = path.join(vaultPath, ".obsidian");
const pluginsDir = path.join(obsidianDir, "plugins");
const pluginDir = path.join(pluginsDir, "mz-media-fetcher");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function ensureJsonArrayFile(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]\n", "utf8");
    return [];
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

if (!fs.existsSync(vaultPath)) {
  throw new Error(`开发 Vault 不存在：${vaultPath}`);
}

execFileSync(npmCommand, ["run", "build"], {
  cwd: repoRoot,
  stdio: "inherit",
});

fs.mkdirSync(pluginsDir, { recursive: true });

if (fs.existsSync(pluginDir)) {
  const stat = fs.lstatSync(pluginDir);
  if (stat.isSymbolicLink()) {
    fs.unlinkSync(pluginDir);
  } else {
    throw new Error(`开发 Vault 里已存在真实插件目录，请先处理后再安装：${pluginDir}`);
  }
}

const symlinkType = process.platform === "win32" ? "junction" : "dir";
fs.symlinkSync(repoRoot, pluginDir, symlinkType);

const communityPluginsPath = path.join(obsidianDir, "community-plugins.json");
const communityPlugins = ensureJsonArrayFile(communityPluginsPath);
if (!communityPlugins.includes("mz-media-fetcher")) {
  communityPlugins.push("mz-media-fetcher");
  writeJson(communityPluginsPath, communityPlugins);
}

console.log(`mz-media-fetcher 已安装到开发 Vault：${pluginDir}`);
