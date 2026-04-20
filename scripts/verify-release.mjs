import fs from "fs";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const manifest = readJson("manifest.json");
const pkg = readJson("package.json");
const versions = readJson("versions.json");
const expectedTag = process.env.RELEASE_TAG || "";

if (manifest.version !== pkg.version) {
  throw new Error(`manifest.json 和 package.json 版本不一致：${manifest.version} !== ${pkg.version}`);
}

if (versions[manifest.version] !== manifest.minAppVersion) {
  throw new Error(
    `versions.json 没有为 ${manifest.version} 记录正确的最低 Obsidian 版本：${manifest.minAppVersion}`
  );
}

for (const asset of ["manifest.json", "styles.css", "versions.json"]) {
  if (!fs.existsSync(asset)) {
    throw new Error(`缺少 release 资产：${asset}`);
  }
}

if (expectedTag && expectedTag !== manifest.version) {
  throw new Error(`发布 tag 必须和版本号一致：${expectedTag} !== ${manifest.version}`);
}

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `version=${manifest.version}\n`, "utf8");
}

console.log(`release version verified: ${manifest.version}`);
