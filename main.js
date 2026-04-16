var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => main_default
});
module.exports = __toCommonJS(main_exports);

// src/plugin.ts
var import_obsidian5 = require("obsidian");

// src/core/cards.ts
var import_promises2 = __toESM(require("fs/promises"));
var import_path2 = __toESM(require("path"));

// src/core/files.ts
var import_fs = __toESM(require("fs"));
var import_promises = __toESM(require("fs/promises"));
var import_path = __toESM(require("path"));

// src/core/text.ts
var MONTH_MAP = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12"
};
function sanitizeList(values, maxItems) {
  if (!Array.isArray(values)) return [];
  const seen = /* @__PURE__ */ new Set();
  const output = [];
  for (const value of values) {
    const normalized = String(value || "").trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    output.push(normalized);
    if (output.length >= maxItems) break;
  }
  return output;
}
function normalizeSummaryText(value) {
  const html = String(value || "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'");
  return html.split(/\r?\n/).map((line) => line.trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
function normalizeDateValue(value) {
  const normalized = String(value || "").trim();
  if (!normalized || normalized === "*") return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;
  return "";
}
function extractYear(value) {
  const match = String(value || "").match(/\b(\d{4})\b/);
  return match ? match[1] : "";
}
function safeYear(value) {
  return extractYear(value);
}
function sanitizeFileName(value) {
  return String(value || "").replace(/[\\/:*?"<>|]/g, " ").replace(/\s+/g, " ").trim();
}
function ensureTrailingNewline(text) {
  return text.endsWith("\n") ? text : `${text}
`;
}
function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function decodeHtmlEntities(value) {
  return String(value || "").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/&#x27;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code))).replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}
function stripHtml(value) {
  return decodeHtmlEntities(String(value || "").replace(/<[^>]+>/g, " "));
}
function normalizeDateText(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const match = text.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (!match) return text;
  const month = MONTH_MAP[match[1].toLowerCase()];
  if (!month) return text;
  const day = match[2].padStart(2, "0");
  return `${match[3]}-${month}-${day}`;
}

// src/core/files.ts
async function ensureTextFile(filePath, content) {
  try {
    await import_promises.default.access(filePath, import_fs.default.constants.F_OK);
    return;
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
  await import_promises.default.mkdir(import_path.default.dirname(filePath), { recursive: true });
  await import_promises.default.writeFile(filePath, ensureTrailingNewline(content), "utf8");
}
async function ensureJsonFile(filePath, data) {
  try {
    await import_promises.default.access(filePath, import_fs.default.constants.F_OK);
    return;
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
  await import_promises.default.mkdir(import_path.default.dirname(filePath), { recursive: true });
  await import_promises.default.writeFile(filePath, `${JSON.stringify(data, null, 2)}
`, "utf8");
}
async function ensureFolderExists(vault, targetFolder) {
  const normalized = String(targetFolder || "").trim().replace(/^\/+|\/+$/g, "");
  if (!normalized) return;
  const segments = normalized.split("/");
  let current = "";
  for (const segment of segments) {
    current = current ? `${current}/${segment}` : segment;
    if (!await vault.adapter.exists(current)) {
      await vault.createFolder(current);
    }
  }
}
async function chooseAvailableCardPath(folder, primaryBase, collisionBase, exists) {
  const cleanFolder = String(folder || "").trim().replace(/^\/+|\/+$/g, "");
  const prefix = cleanFolder ? `${cleanFolder}/` : "";
  let candidate = `${prefix}${primaryBase}.md`;
  if (!await exists(candidate)) {
    return candidate;
  }
  candidate = `${prefix}${collisionBase}.md`;
  if (!await exists(candidate)) {
    return candidate;
  }
  let index = 2;
  while (true) {
    candidate = `${prefix}${collisionBase} ${index}.md`;
    if (!await exists(candidate)) {
      return candidate;
    }
    index += 1;
  }
}

// src/core/template.ts
function renderYamlScalar(value, indentLevel) {
  if (value === null || typeof value === "undefined") return '""';
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  const text = String(value);
  if (text.includes("\n")) {
    const indent = "  ".repeat(indentLevel + 1);
    return `|-
${text.split("\n").map((line) => `${indent}${line}`).join("\n")}`;
  }
  return JSON.stringify(text);
}
function renderYamlValue(value, indentLevel) {
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const indent = "  ".repeat(indentLevel + 1);
    return `
${value.map((item) => `${indent}- ${renderYamlScalar(item, indentLevel + 1)}`).join("\n")}`;
  }
  return renderYamlScalar(value, indentLevel);
}
function getValueByPath(target, sourcePath) {
  return String(sourcePath || "").split(".").filter(Boolean).reduce((current, key) => {
    if (current === null || typeof current === "undefined") return void 0;
    return current[key];
  }, target);
}
function renderTemplate(template, context) {
  return String(template || "").replace(/\{\{\s*([a-zA-Z0-9_\.]+)\s*\}\}/g, (_, key) => {
    const value = getValueByPath(context, key);
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (value === null || typeof value === "undefined") {
      return "";
    }
    return String(value);
  });
}
function buildYamlTemplateContext(values) {
  return Object.entries(values).reduce((result, [key, value]) => {
    result[key] = renderYamlValue(value, 0);
    return result;
  }, {});
}
function buildTemplateContext(sourceKey, subject) {
  const context = {
    ...subject,
    categories: "\u65B0\u4F5C\u54C1\u5361\u7247",
    source: sourceKey,
    poster: String(subject.cover_remote || "").trim(),
    rating: "",
    status: "\u8FDB\u884C\u4E2D",
    finished_at: "",
    rewatch_count: 1
  };
  return {
    ...context,
    yaml: buildYamlTemplateContext(context),
    cover_markdown: context.poster ? `![cover|300](${context.poster})` : ""
  };
}

// src/core/cards.ts
async function buildCard(app, vaultInfo, sourceKey, item, config) {
  const templatePath = import_path2.default.join(vaultInfo.path, config.templatePath);
  const template = await import_promises2.default.readFile(templatePath, "utf8");
  const renderContext = buildTemplateContext(sourceKey, item);
  const content = renderTemplate(template, renderContext).trim();
  const filePath = await resolveCardPath(app, config, item, sourceKey);
  return {
    folderPath: config.targetFolder,
    filePath,
    content: ensureTrailingNewline(content)
  };
}
async function resolveCardPath(app, config, item, sourceKey) {
  const idKeyMap = {
    bangumi: "bangumi_id",
    mobygames: "mobygames_id",
    bilibili_show: "bilibili_show_id"
  };
  const idKey = idKeyMap[sourceKey];
  const primaryName = sanitizeFileName(renderTemplate(config.filename.template, item));
  const collisionName = sanitizeFileName(
    renderTemplate(config.filename.collisionTemplate, item)
  );
  const itemId = String(item[idKey] || "").trim();
  const primaryBase = primaryName || `${sourceKey} ${itemId}`.trim();
  const collisionBase = collisionName || `${primaryBase} ${itemId}`.trim();
  return chooseAvailableCardPath(
    config.targetFolder,
    primaryBase,
    collisionBase,
    async (candidate) => app.vault.adapter.exists(candidate)
  );
}

// src/core/errors.ts
function normalizeError(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return String(error || "\u672A\u77E5\u9519\u8BEF");
}

// src/config/storage.ts
var import_fs2 = __toESM(require("fs"));
var import_promises3 = __toESM(require("fs/promises"));
var import_path3 = __toESM(require("path"));

// src/config/defaults.ts
var PLUGIN_ID = "MZ-media-fetcher";
var PLUGIN_NAME = "MZ Media Fetcher";
var PLUGIN_VERSION = "0.2.0";
var HTTP_USER_AGENT = `${PLUGIN_NAME}/${PLUGIN_VERSION} (Obsidian)`;
var BANGUMI_API_BASE = "https://api.bgm.tv/v0";
var TEMPLATE_CONTENTS = {
  bangumi: `---
categories: \u65B0\u4F5C\u54C1\u5361\u7247
\u540D\u79F0: {{yaml.title}}
\u539F\u540D: {{yaml.title_original}}
aliases: {{yaml.aliases}}
\u5A92\u4F53\u7C7B\u578B: {{yaml.media_type}}
\u53D1\u5E03\u65E5\u671F: {{yaml.release_date}}
\u8BC4\u5206:
\u72B6\u6001: \u8FDB\u884C\u4E2D
\u5B8C\u6210\u65F6\u95F4: ""
\u4F53\u9A8C\u6B21\u6570: 1
\u6D77\u62A5: {{poster}}
\u6765\u6E90\u94FE\u63A5: {{bangumi_url}}
\u7F51\u7EDC\u6D77\u62A5: true
---

{{cover_markdown}}

## \u7B80\u4ECB

{{summary}}

## \u7B80\u8BB0
`,
  mobygames: `---
categories: \u65B0\u4F5C\u54C1\u5361\u7247
\u540D\u79F0: {{yaml.title}}
\u539F\u540D: {{yaml.title_original}}
aliases: {{yaml.aliases}}
\u5A92\u4F53\u7C7B\u578B: {{yaml.media_type}}
\u53D1\u5E03\u65E5\u671F: {{yaml.release_date}}
\u8BC4\u5206:
\u72B6\u6001: \u8FDB\u884C\u4E2D
\u5B8C\u6210\u65F6\u95F4: ""
\u4F53\u9A8C\u6B21\u6570: 1
\u6D77\u62A5: {{poster}}
\u6765\u6E90\u94FE\u63A5: {{mobygames_url}}
\u7F51\u7EDC\u6D77\u62A5: true
---

{{cover_markdown}}

## \u7B80\u4ECB

{{summary}}

## \u5E73\u53F0

{{platforms_text}}

## \u7B80\u8BB0
`,
  bilibili_show: `---
categories: \u65B0\u4F5C\u54C1\u5361\u7247
\u540D\u79F0: {{yaml.title}}
\u539F\u540D:
aliases:
\u5A92\u4F53\u7C7B\u578B:
\u53D1\u5E03\u65E5\u671F: {{yaml.release_date}}
\u8BC4\u5206:
\u72B6\u6001:
\u5B8C\u6210\u65F6\u95F4:
\u4F53\u9A8C\u6B21\u6570:
\u6D77\u62A5: {{poster}}
\u6765\u6E90\u94FE\u63A5: {{bilibili_show_url}}
\u7F51\u7EDC\u6D77\u62A5: true
---

![cover|300]({{poster}})

## \u7B80\u4ECB

{{summary}}

## \u7B80\u8BB0
`
};
function getDefaultSourceConfigs(configDir = ".obsidian") {
  const pluginRoot = `${configDir}/plugins/${PLUGIN_ID}`;
  return {
    bangumi: {
      targetFolder: "00-Inbox",
      templatePath: `${pluginRoot}/templates/bangumi.md`,
      searchLimit: 8,
      filename: {
        template: "{{title}}",
        collisionTemplate: "{{title}} {{release_year}} {{bangumi_id}}"
      }
    },
    mobygames: {
      targetFolder: "00-Inbox",
      templatePath: `${pluginRoot}/templates/mobygames.md`,
      searchLimit: 8,
      filename: {
        template: "{{title}}",
        collisionTemplate: "{{title}} {{release_year}} {{mobygames_id}}"
      }
    },
    bilibili_show: {
      targetFolder: "00-Inbox",
      templatePath: `${pluginRoot}/templates/bilibili-show.md`,
      searchLimit: 8,
      filename: {
        template: "{{title}}",
        collisionTemplate: "{{title}} {{release_year}} {{bilibili_show_id}}"
      }
    }
  };
}
var DEFAULT_SOURCE_CONFIGS = getDefaultSourceConfigs();

// src/types.ts
var SOURCE_IDS = ["bangumi", "mobygames", "bilibili_show"];

// src/config/storage.ts
function normalizePlainRelativePath(value) {
  return String(value || "").replace(/\\/g, "/").trim().replace(/^\/+|\/+$/g, "");
}
function normalizeVaultRelativePath(value) {
  const normalized = normalizePlainRelativePath(value);
  if (!normalized) {
    throw new Error("\u6A21\u677F\u8DEF\u5F84\u4E0D\u80FD\u4E3A\u7A7A\u3002");
  }
  return normalized;
}
function normalizeSearchLimit(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 1) {
    return Math.max(1, Number(fallback) || 1);
  }
  return Math.max(1, Math.round(numeric));
}
function buildTemplateModeSourceConfig(raw, defaults) {
  const source = raw && typeof raw === "object" ? raw : {};
  const filename = source.filename && typeof source.filename === "object" ? source.filename : {};
  return {
    targetFolder: normalizePlainRelativePath(source.targetFolder || defaults.targetFolder),
    templatePath: normalizeVaultRelativePath(source.templatePath || defaults.templatePath),
    searchLimit: normalizeSearchLimit(source.searchLimit, defaults.searchLimit),
    filename: {
      template: String(filename.template || defaults.filename.template).trim(),
      collisionTemplate: String(
        filename.collisionTemplate || defaults.filename.collisionTemplate
      ).trim()
    }
  };
}
function normalizeSourceConfig(raw, sourceKey, defaults) {
  return buildTemplateModeSourceConfig(raw, defaults[sourceKey]);
}
function normalizeSourceConfigs(raw, defaults) {
  if (!raw || typeof raw !== "object") {
    throw new Error("\u4F5C\u54C1\u6293\u53D6\u914D\u7F6E\u683C\u5F0F\u4E0D\u5BF9\u3002");
  }
  return SOURCE_IDS.reduce((result, sourceKey) => {
    result[sourceKey] = normalizeSourceConfig(raw[sourceKey], sourceKey, defaults);
    return result;
  }, {});
}
function buildConfigRootFromUnknown(raw, defaults) {
  return SOURCE_IDS.reduce((result, sourceKey) => {
    result[sourceKey] = buildTemplateModeSourceConfig(raw?.[sourceKey], defaults[sourceKey]);
    return result;
  }, {});
}
function normalizeTemplateEditorValues(sourceKey, state) {
  const defaults = DEFAULT_SOURCE_CONFIGS[sourceKey];
  const targetFolder = normalizePlainRelativePath(state.targetFolder || defaults.targetFolder);
  const templatePath = normalizeVaultRelativePath(state.templatePath || defaults.templatePath);
  const searchLimit = normalizeSearchLimit(state.searchLimit, defaults.searchLimit);
  const filenameTemplate = String(state.filenameTemplate || defaults.filename.template).trim();
  const filenameCollisionTemplate = String(
    state.filenameCollisionTemplate || defaults.filename.collisionTemplate
  ).trim();
  if (!filenameTemplate) {
    throw new Error("\u6587\u4EF6\u540D\u6A21\u677F\u4E0D\u80FD\u4E3A\u7A7A\u3002");
  }
  if (!filenameCollisionTemplate) {
    throw new Error("\u91CD\u540D\u6587\u4EF6\u540D\u6A21\u677F\u4E0D\u80FD\u4E3A\u7A7A\u3002");
  }
  return {
    targetFolder,
    templatePath,
    searchLimit,
    filename: {
      template: filenameTemplate,
      collisionTemplate: filenameCollisionTemplate
    }
  };
}
var ConfigStore = class {
  constructor(app) {
    this.app = app;
  }
  getVaultInfo() {
    const adapter = this.app.vault.adapter;
    if (!adapter || typeof adapter.getBasePath !== "function") {
      return null;
    }
    return {
      name: this.app.vault.getName(),
      path: adapter.getBasePath()
    };
  }
  getPluginFilePath(fileName) {
    const vaultInfo = this.getVaultInfo();
    if (!vaultInfo) {
      throw new Error("\u5F53\u524D vault \u4E0D\u652F\u6301\u63D2\u4EF6\u914D\u7F6E\u8DEF\u5F84\u3002");
    }
    const configDir = this.app.vault?.configDir || ".obsidian";
    return import_path3.default.join(vaultInfo.path, configDir, "plugins", PLUGIN_ID, fileName);
  }
  getDefaultSourceConfigs() {
    const configDir = this.app.vault?.configDir || ".obsidian";
    return getDefaultSourceConfigs(configDir);
  }
  async ensureDefaultFiles(vaultBasePath) {
    const defaults = this.getDefaultSourceConfigs();
    const configPath = this.getPluginFilePath("media-fetcher-rules.json");
    try {
      await import_promises3.default.access(configPath, import_fs2.default.constants.F_OK);
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
      const initialConfig = await this.buildInitialConfig(vaultBasePath);
      await ensureJsonFile(configPath, initialConfig);
    }
    for (const sourceKey of SOURCE_IDS) {
      await this.ensureTemplateExists(
        vaultBasePath,
        defaults[sourceKey].templatePath,
        TEMPLATE_CONTENTS[sourceKey]
      );
    }
  }
  async ensureTemplateExists(vaultBasePath, relativePath, content) {
    const absolutePath = import_path3.default.join(vaultBasePath, relativePath);
    await ensureTextFile(absolutePath, content);
  }
  async buildInitialConfig(vaultBasePath) {
    const defaults = this.getDefaultSourceConfigs();
    const configDir = this.app.vault?.configDir || ".obsidian";
    const legacyPath = import_path3.default.join(
      vaultBasePath,
      configDir,
      "plugins",
      "MZ-organizer",
      "bangumi-card-rules.json"
    );
    let bangumi = defaults.bangumi;
    try {
      const raw = await import_promises3.default.readFile(legacyPath, "utf8");
      bangumi = buildTemplateModeSourceConfig(JSON.parse(raw), defaults.bangumi);
    } catch (_error) {
      bangumi = defaults.bangumi;
    }
    return {
      bangumi,
      mobygames: defaults.mobygames,
      bilibili_show: defaults.bilibili_show
    };
  }
  async loadRawSourceConfigRoot(vaultBasePath) {
    await this.ensureDefaultFiles(vaultBasePath);
    const filePath = this.getPluginFilePath("media-fetcher-rules.json");
    let raw = "";
    try {
      raw = await import_promises3.default.readFile(filePath, "utf8");
    } catch (_error) {
      throw new Error("\u8BFB\u53D6\u4F5C\u54C1\u6293\u53D6\u914D\u7F6E\u5931\u8D25\uFF1Amedia-fetcher-rules.json");
    }
    try {
      return JSON.parse(raw);
    } catch (_error) {
      throw new Error("\u4F5C\u54C1\u6293\u53D6\u914D\u7F6E\u4E0D\u662F\u5408\u6CD5 JSON\uFF1Amedia-fetcher-rules.json");
    }
  }
  async writeSourceConfigRoot(raw) {
    const configPath = this.getPluginFilePath("media-fetcher-rules.json");
    await import_promises3.default.mkdir(import_path3.default.dirname(configPath), { recursive: true });
    await import_promises3.default.writeFile(configPath, `${JSON.stringify(raw, null, 2)}
`, "utf8");
  }
  async loadSourceConfigs(vaultBasePath) {
    const raw = await this.loadRawSourceConfigRoot(vaultBasePath);
    const defaults = this.getDefaultSourceConfigs();
    const migrated = buildConfigRootFromUnknown(raw, defaults);
    const normalized = normalizeSourceConfigs(migrated, defaults);
    if (JSON.stringify(raw, null, 2) !== JSON.stringify(migrated, null, 2)) {
      await this.writeSourceConfigRoot(migrated);
    }
    for (const sourceKey of SOURCE_IDS) {
      await this.ensureTemplateExists(
        vaultBasePath,
        normalized[sourceKey].templatePath,
        TEMPLATE_CONTENTS[sourceKey]
      );
    }
    return normalized;
  }
  async saveTemplateSourceConfig(sourceKey, values) {
    const vaultInfo = this.getVaultInfo();
    if (!vaultInfo) {
      throw new Error("\u5F53\u524D vault \u4E0D\u652F\u6301\u672C\u5730\u63D2\u4EF6\u914D\u7F6E\u8DEF\u5F84\u3002");
    }
    const rawRoot = await this.loadRawSourceConfigRoot(vaultInfo.path);
    const nextRoot = buildConfigRootFromUnknown(rawRoot, this.getDefaultSourceConfigs());
    nextRoot[sourceKey] = values;
    await this.writeSourceConfigRoot(nextRoot);
  }
};

// src/core/http.ts
var import_obsidian = require("obsidian");
async function request(url, accept, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  let response = null;
  try {
    response = await (0, import_obsidian.requestUrl)({
      url,
      method,
      headers: {
        Accept: accept,
        "User-Agent": HTTP_USER_AGENT,
        ...options.headers || {}
      },
      body: options.body
    });
  } catch (error) {
    const message = error?.response?.text || error?.response?.status || error?.message || String(error);
    throw new Error(`\u8BF7\u6C42\u5931\u8D25\uFF1A${String(message).trim()}`);
  }
  if (!response || response.status >= 400) {
    throw new Error(`\u8BF7\u6C42\u5931\u8D25\uFF1AHTTP ${response?.status || "unknown"}`);
  }
  return response;
}
async function requestJson(url, options = {}) {
  const response = await request(url, "application/json", options);
  const text = String(response.text || "").trim();
  if (!text) {
    throw new Error("\u63A5\u53E3\u6CA1\u6709\u8FD4\u56DE\u5185\u5BB9\u3002");
  }
  try {
    return JSON.parse(text);
  } catch (_error) {
    throw new Error("\u63A5\u53E3\u8FD4\u56DE\u4E86\u65E0\u6CD5\u89E3\u6790\u7684\u5185\u5BB9\u3002");
  }
}
async function requestText(url, options = {}) {
  const response = await request(url, "text/html,application/xhtml+xml", options);
  const text = String(response.text || "");
  if (!text.trim()) {
    throw new Error("\u9875\u9762\u6CA1\u6709\u8FD4\u56DE\u5185\u5BB9\u3002");
  }
  return text;
}

// src/sources/bangumi.ts
function mapBangumiSubjectType(type) {
  const mapping = {
    1: "\u4E66\u7C4D",
    2: "\u52A8\u753B",
    3: "\u97F3\u4E50",
    4: "\u6E38\u620F",
    6: "\u4E09\u6B21\u5143"
  };
  return mapping[Number(type)] || "\u6761\u76EE";
}
function extractInfoboxValues(value) {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => extractInfoboxValues(entry));
  }
  if (value && typeof value === "object") {
    if (typeof value.v !== "undefined") {
      return extractInfoboxValues(value.v);
    }
    return [];
  }
  const normalized = String(value || "").trim();
  return normalized ? [normalized] : [];
}
function collectBangumiAliases(subject, preferredTitle, originalTitle) {
  const aliases = [];
  const seen = /* @__PURE__ */ new Set();
  const pushAlias = (value) => {
    const normalized = String(value || "").trim();
    if (!normalized) return;
    if (normalized === preferredTitle || normalized === originalTitle) return;
    if (seen.has(normalized)) return;
    seen.add(normalized);
    aliases.push(normalized);
  };
  if (Array.isArray(subject.infobox)) {
    for (const item of subject.infobox) {
      if (String(item?.key || "").trim() !== "\u522B\u540D") continue;
      extractInfoboxValues(item?.value).forEach(pushAlias);
    }
  }
  return sanitizeList(aliases, 20);
}
function pickBangumiCover(images) {
  if (!images || typeof images !== "object") return "";
  const imageMap = images;
  return String(imageMap.large || "").trim() || String(imageMap.common || "").trim() || String(imageMap.medium || "").trim() || String(imageMap.grid || "").trim() || String(imageMap.small || "").trim();
}
function parseBangumiSubjectId(input) {
  const match = String(input || "").match(/(?:bgm\.tv|bangumi\.tv|chii\.in)\/subject\/(\d+)/i);
  if (match) return Number(match[1]);
  const numeric = String(input || "").trim();
  if (/^\d+$/.test(numeric)) {
    return Number(numeric);
  }
  return null;
}
function normalizeBangumiSearchItem(item) {
  const title = String(item?.name_cn || "").trim() || String(item?.name || "").trim() || `Bangumi ${item?.id || ""}`;
  const originalTitle = String(item?.name || "").trim();
  const subtitle = [
    originalTitle && originalTitle !== title ? originalTitle : "",
    safeYear(item?.date),
    mapBangumiSubjectType(item?.type),
    item?.id ? `ID ${item.id}` : ""
  ].filter(Boolean).join(" \xB7 ");
  return {
    item,
    title,
    subtitle,
    searchText: [title, originalTitle].filter(Boolean).join(" ")
  };
}
function normalizeBangumiSubject(subject) {
  const preferredTitle = String(subject?.name_cn || "").trim() || String(subject?.name || "").trim();
  const originalTitle = String(subject?.name || "").trim();
  const titleOriginal = originalTitle && originalTitle !== preferredTitle ? originalTitle : "";
  const releaseDate = normalizeDateValue(subject?.date);
  const releaseYear = extractYear(subject?.date);
  const aliases = collectBangumiAliases(subject, preferredTitle, originalTitle);
  return {
    bangumi_id: Number(subject?.id),
    bangumi_url: `https://bgm.tv/subject/${subject?.id}`,
    title: preferredTitle || `Bangumi ${subject?.id}`,
    title_original: titleOriginal,
    aliases,
    media_type: mapBangumiSubjectType(subject?.type),
    release_date: releaseDate,
    release_year: releaseYear,
    cover_remote: pickBangumiCover(subject?.images),
    summary: normalizeSummaryText(subject?.summary),
    platforms: [],
    platforms_text: ""
  };
}

// src/sources/bangumi-source.ts
async function searchBangumiSubjects(query, limit) {
  const response = await requestJson(
    `${BANGUMI_API_BASE}/search/subjects?limit=${limit}`,
    {
      method: "POST",
      body: JSON.stringify({ keyword: query }),
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
  if (!Array.isArray(response?.data)) {
    throw new Error("Bangumi \u641C\u7D22\u7ED3\u679C\u683C\u5F0F\u4E0D\u5BF9\u3002");
  }
  return response.data;
}
async function fetchBangumiSubject(subjectId) {
  const response = await requestJson(`${BANGUMI_API_BASE}/subjects/${subjectId}`);
  if (!response || Number(response.id) !== Number(subjectId)) {
    throw new Error(`Bangumi \u6761\u76EE\u8BFB\u53D6\u5931\u8D25\uFF1A${subjectId}`);
  }
  return response;
}
var bangumiSource = {
  id: "bangumi",
  label: "Bangumi",
  commandId: "create-bangumi-card",
  commandName: "\u4ECE Bangumi \u65B0\u5EFA\u4F5C\u54C1\u5361\u7247",
  inputTitle: "\u4ECE Bangumi \u65B0\u5EFA\u4F5C\u54C1\u5361\u7247",
  inputHint: "\u8F93\u5165\u4F5C\u54C1\u540D\uFF0C\u6216\u76F4\u63A5\u8D34 Bangumi \u6761\u76EE\u94FE\u63A5\u3002",
  inputPlaceholder: "\u4F8B\u5982\uFF1A\u5B64\u72EC\u6447\u6EDA / https://bgm.tv/subject/328609",
  parseDirectInput: parseBangumiSubjectId,
  search: (query, config) => searchBangumiSubjects(query, config.searchLimit),
  toSuggestItem: normalizeBangumiSearchItem,
  fetchByDirectInput: (directInput) => fetchBangumiSubject(directInput),
  fetchBySearchItem: (item) => fetchBangumiSubject(item.id),
  normalize: normalizeBangumiSubject
};

// src/sources/bilibili-show.ts
function ensureHttpsUrl(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return "";
  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (normalized.startsWith("//")) return `https:${normalized}`;
  return normalized;
}
function formatUnixTimestamp(timestamp) {
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "";
  }
  const date = new Date(seconds * 1e3);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}
function parseBilibiliShowProjectId(input) {
  const text = String(input || "").trim();
  if (!text) {
    throw new Error("\u8BF7\u5148\u8D34\u4E0A bilibili \u4F1A\u5458\u8D2D\u8BE6\u60C5\u9875\u94FE\u63A5\u3002");
  }
  let url;
  try {
    url = new URL(text);
  } catch (_error) {
    throw new Error("bilibili\u4F1A\u5458\u8D2D\u76EE\u524D\u53EA\u652F\u6301\u76F4\u63A5\u8D34\u8BE6\u60C5\u9875\u94FE\u63A5\u3002");
  }
  if (!/show\.bilibili\.com$/i.test(url.hostname)) {
    throw new Error("\u8FD9\u4E0D\u662F bilibili \u4F1A\u5458\u8D2D\u8BE6\u60C5\u9875\u94FE\u63A5\u3002");
  }
  if (url.pathname !== "/platform/detail.html") {
    throw new Error("\u8BF7\u8D34 bilibili \u4F1A\u5458\u8D2D\u5177\u4F53\u8BE6\u60C5\u9875\u94FE\u63A5\uFF0C\u4E0D\u662F\u5217\u8868\u9875\u6216\u5176\u4ED6\u9875\u9762\u3002");
  }
  const projectId = Number(url.searchParams.get("id"));
  if (!Number.isInteger(projectId) || projectId <= 0) {
    throw new Error("\u8FD9\u4E2A bilibili \u4F1A\u5458\u8D2D\u94FE\u63A5\u91CC\u6CA1\u6709\u6709\u6548\u7684\u9879\u76EE id\u3002");
  }
  return projectId;
}
function normalizeBilibiliShowProjectUrl(projectId) {
  return `https://show.bilibili.com/platform/detail.html?id=${projectId}`;
}
function unwrapBilibiliShowProjectResponse(payload, projectId) {
  if (Number(payload?.errno) !== 0 || !payload?.data) {
    throw new Error(payload?.msg || `bilibili\u4F1A\u5458\u8D2D\u9879\u76EE\u8BFB\u53D6\u5931\u8D25\uFF1A${projectId}`);
  }
  if (Number(payload.data.id) !== Number(projectId)) {
    throw new Error(`bilibili\u4F1A\u5458\u8D2D\u9879\u76EE\u8BFB\u53D6\u5931\u8D25\uFF1A${projectId}`);
  }
  return payload.data;
}
function normalizeBilibiliShowProject(detail) {
  const projectId = Number(detail?.id);
  const releaseDate = formatUnixTimestamp(detail?.start_time);
  const coverRemote = ensureHttpsUrl(detail?.cover) || ensureHttpsUrl(detail?.banner);
  return {
    bilibili_show_id: projectId,
    bilibili_show_url: normalizeBilibiliShowProjectUrl(projectId),
    title: String(detail?.name || "").trim() || `bilibili\u4F1A\u5458\u8D2D ${projectId}`,
    title_original: "",
    aliases: [],
    media_type: "",
    release_date: releaseDate,
    release_year: extractYear(releaseDate),
    cover_remote: coverRemote,
    summary: normalizeSummaryText(detail?.description || ""),
    platforms: [],
    platforms_text: ""
  };
}

// src/sources/bilibili-show-source.ts
async function fetchBilibiliShowProject(projectId) {
  const response = await requestJson(
    `https://show.bilibili.com/api/ticket/project/get?id=${projectId}`
  );
  return unwrapBilibiliShowProjectResponse(response, projectId);
}
var bilibiliShowSource = {
  id: "bilibili_show",
  label: "bilibili\u4F1A\u5458\u8D2D",
  commandId: "create-bilibili-show-card",
  commandName: "\u4ECE bilibili\u4F1A\u5458\u8D2D\u65B0\u5EFA\u4F5C\u54C1\u5361\u7247",
  inputTitle: "\u4ECE bilibili\u4F1A\u5458\u8D2D\u65B0\u5EFA\u4F5C\u54C1\u5361\u7247",
  inputHint: "\u8D34 bilibili \u4F1A\u5458\u8D2D\u8BE6\u60C5\u9875\u94FE\u63A5\uFF0C\u63D2\u4EF6\u4F1A\u76F4\u63A5\u8BFB\u53D6\u9879\u76EE\u8BE6\u60C5\u3002",
  inputPlaceholder: "\u4F8B\u5982\uFF1Ahttps://show.bilibili.com/platform/detail.html?id=107593",
  parseDirectInput: parseBilibiliShowProjectId,
  fetchByDirectInput: (projectId) => fetchBilibiliShowProject(projectId),
  normalize: normalizeBilibiliShowProject
};

// src/sources/mobygames.ts
function normalizeMobyGamesGameUrl(input) {
  const text = String(input || "").trim();
  if (!text) {
    throw new Error("\u8BF7\u5148\u8D34\u4E0A MobyGames \u6E38\u620F\u94FE\u63A5\u3002");
  }
  let url;
  try {
    url = new URL(text);
  } catch (_error) {
    throw new Error("MobyGames \u76EE\u524D\u53EA\u652F\u6301\u76F4\u63A5\u8D34\u6E38\u620F\u9875\u9762\u94FE\u63A5\u3002");
  }
  if (!/mobygames\.com$/i.test(url.hostname) && !/\.mobygames\.com$/i.test(url.hostname)) {
    throw new Error("\u8FD9\u4E0D\u662F MobyGames \u7684\u94FE\u63A5\u3002");
  }
  if (!/^\/game\/\d+(?:\/[^/?#]+)?\/?$/i.test(url.pathname)) {
    throw new Error("\u8BF7\u8D34 MobyGames \u5177\u4F53\u6E38\u620F\u9875\u9762\u94FE\u63A5\uFF0C\u4E0D\u662F\u641C\u7D22\u9875\u6216\u5176\u4ED6\u9875\u9762\u3002");
  }
  url.search = "";
  url.hash = "";
  return url.toString();
}
function parseMobyGamesIdFromUrl(url) {
  const match = String(url || "").match(/mobygames\.com\/game\/(\d+)/i);
  return match ? Number(match[1]) : null;
}
function extractMetaContent(html, attrName, attrValue) {
  const pattern = new RegExp(
    `<meta[^>]+${attrName}=["']${escapeRegex(attrValue)}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i"
  );
  const reversePattern = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+${attrName}=["']${escapeRegex(attrValue)}["'][^>]*>`,
    "i"
  );
  const match = html.match(pattern) || html.match(reversePattern);
  return match ? decodeHtmlEntities(match[1].trim()) : "";
}
function extractLinkHref(html, relValue) {
  const pattern = new RegExp(
    `<link[^>]+rel=["'][^"']*${escapeRegex(relValue)}[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>`,
    "i"
  );
  const reversePattern = new RegExp(
    `<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*${escapeRegex(relValue)}[^"']*["'][^>]*>`,
    "i"
  );
  const match = html.match(pattern) || html.match(reversePattern);
  return match ? decodeHtmlEntities(match[1].trim()) : "";
}
function extractFirstTagText(html, tagName) {
  const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  if (!match) return "";
  return stripHtml(match[1]).trim();
}
function extractTagTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? stripHtml(match[1]).trim() : "";
}
function cleanDocumentTitle(title) {
  return String(title || "").replace(/\s*-\s*MobyGames\s*$/i, "").replace(/\s*\(\d{4}\)\s*$/i, "").trim();
}
function parseAliasesFromText(text, title) {
  const match = text.match(/\baka:\s*([^\n]+)/i);
  if (!match) return [];
  return sanitizeList(
    match[1].split(/\s*,\s*/).map((item) => item.trim()).filter((item) => item && item !== title),
    20
  );
}
function parseMobyReleaseInfo(text) {
  const releaseMatch = text.match(/Released\s+([^\n]+?)\s+on\s+([^\n]+)/i);
  const firstReleaseRaw = releaseMatch ? releaseMatch[1].trim() : "";
  const firstPlatform = releaseMatch ? releaseMatch[2].trim() : "";
  const releaseBlockMatch = text.match(
    /Releases by Date(?:\s*\(by platform\))?\s+([\s\S]*?)(?:\n##\s+\w|\nPublishers\b|\nDevelopers\b|\nMoby Score\b|\nCritics\b|\nPlayers\b|\nCollected By\b|\nGenre\b|$)/i
  );
  const releaseLines = releaseBlockMatch ? releaseBlockMatch[1].split("\n").map((line) => line.replace(/^[-*]\s*/, "").trim()).filter(Boolean) : [];
  const platforms = [];
  if (firstPlatform) {
    platforms.push(firstPlatform);
  }
  let releaseDate = normalizeDateValue(normalizeDateText(firstReleaseRaw));
  let releaseYear = extractYear(firstReleaseRaw);
  for (const line of releaseLines) {
    const platformMatch = line.match(/\(([^)]+)\)/);
    if (platformMatch) {
      platforms.push(platformMatch[1].trim());
    }
    if (!releaseDate) {
      const dateMatch = line.match(/^([A-Za-z]+\s+\d{1,2},\s+\d{4}|\d{4})/);
      if (dateMatch) {
        releaseDate = normalizeDateValue(normalizeDateText(dateMatch[1]));
        releaseYear = releaseYear || extractYear(dateMatch[1]);
      }
    }
  }
  return {
    release_date: releaseDate,
    release_year: releaseYear,
    platforms: sanitizeList(platforms, 20)
  };
}
function parseMobyDescription(text) {
  const match = text.match(
    /##\s*Description(?:\s+official descriptions)?\s+([\s\S]*?)(?:\n##\s+\w|\nGroups\b|\nCredits\b|\nReviews\b|\nRelated Games\b|\nIdentifiers\b|\nContributors to this Entry\b|$)/i
  );
  return match ? match[1].trim() : "";
}
function parseMobyLabeledValues(text, labels) {
  const output = [];
  for (const label of labels) {
    const regex = new RegExp(
      `${escapeRegex(label)}\\s+([^\\n]+(?:\\n(?![A-Z][A-Za-z ]+\\b)[^\\n]+)*)`,
      "i"
    );
    const match = text.match(regex);
    if (!match) continue;
    const values = match[1].split("\n").map((line) => line.replace(/^[-*]\s*/, "").trim()).flatMap((line) => line.split(/\s*,\s*/)).filter(Boolean);
    output.push(...values);
  }
  return sanitizeList(output, 20);
}
function htmlToReadableText(html) {
  return stripHtml(
    String(html || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<(h1|h2|h3|h4|h5|h6)[^>]*>([\s\S]*?)<\/\1>/gi, (_match, _level, content) => {
      const heading = stripHtml(content).trim();
      return heading ? `
## ${heading}
` : "\n";
    }).replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_match, content) => {
      const line = stripHtml(content).trim();
      return line ? `
- ${line}
` : "\n";
    }).replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|section|article|main|header|footer|aside|ul|ol|table|tr)>/gi, "\n")
  ).replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
function parseMobyGamesGamePage(html, fallbackUrl) {
  const canonicalUrl = extractMetaContent(html, "property", "og:url") || extractLinkHref(html, "canonical") || fallbackUrl;
  const title = decodeHtmlEntities(extractFirstTagText(html, "h1")) || cleanDocumentTitle(extractTagTitle(html)) || "";
  const text = htmlToReadableText(html);
  const mobyIdMatch = text.match(/Moby ID:\s*(\d+)/i);
  const mobygamesId = mobyIdMatch ? Number(mobyIdMatch[1]) : parseMobyGamesIdFromUrl(canonicalUrl);
  if (!title || !mobygamesId) {
    throw new Error("MobyGames \u9875\u9762\u7ED3\u6784\u548C\u9884\u671F\u4E0D\u4E00\u81F4\uFF0C\u6682\u65F6\u6CA1\u6CD5\u8BFB\u51FA\u6E38\u620F\u4FE1\u606F\u3002");
  }
  const aliases = parseAliasesFromText(text, title);
  const releaseInfo = parseMobyReleaseInfo(text);
  const description = parseMobyDescription(text);
  const genres = parseMobyLabeledValues(text, ["Genre"]);
  const coverRemote = extractMetaContent(html, "property", "og:image") || extractMetaContent(html, "name", "twitter:image") || "";
  return {
    mobygames_id: mobygamesId,
    mobygames_url: canonicalUrl,
    title,
    title_original: "",
    aliases,
    release_date: releaseInfo.release_date,
    release_year: releaseInfo.release_year,
    cover_remote: coverRemote,
    summary: description,
    platforms: releaseInfo.platforms,
    genres
  };
}
function normalizeMobyGame(detail) {
  const mobygamesId = Number(detail?.mobygames_id);
  const platforms = sanitizeList(detail?.platforms || [], 20);
  const aliases = sanitizeList(detail?.aliases || [], 20);
  return {
    mobygames_id: mobygamesId,
    mobygames_url: String(detail?.mobygames_url || "").trim(),
    title: String(detail?.title || "").trim() || `MobyGames ${mobygamesId}`,
    title_original: String(detail?.title_original || "").trim(),
    aliases,
    media_type: "\u6E38\u620F",
    release_date: normalizeDateValue(detail?.release_date),
    release_year: String(detail?.release_year || extractYear(detail?.release_date)).trim(),
    cover_remote: String(detail?.cover_remote || "").trim(),
    summary: normalizeSummaryText(detail?.summary || ""),
    platforms,
    platforms_text: platforms.join("\n"),
    genres: sanitizeList(detail?.genres || [], 20)
  };
}

// src/sources/mobygames-source.ts
async function fetchMobyGame(url) {
  const response = await requestText(url);
  return parseMobyGamesGamePage(response, url);
}
var mobygamesSource = {
  id: "mobygames",
  label: "MobyGames",
  commandId: "create-mobygames-card",
  commandName: "\u4ECE MobyGames \u65B0\u5EFA\u4F5C\u54C1\u5361\u7247",
  inputTitle: "\u4ECE MobyGames \u65B0\u5EFA\u4F5C\u54C1\u5361\u7247",
  inputHint: "\u8D34 MobyGames \u6E38\u620F\u9875\u9762\u94FE\u63A5\uFF0C\u63D2\u4EF6\u4F1A\u76F4\u63A5\u6293\u516C\u5F00\u9875\u9762\u5185\u5BB9\u3002",
  inputPlaceholder: "\u4F8B\u5982\uFF1Ahttps://www.mobygames.com/game/217980/balatro/",
  parseDirectInput: normalizeMobyGamesGameUrl,
  fetchByDirectInput: (directInput) => fetchMobyGame(directInput),
  normalize: normalizeMobyGame
};

// src/sources/index.ts
var MEDIA_SOURCES = [bangumiSource, mobygamesSource, bilibiliShowSource];
var MEDIA_SOURCE_MAP = {
  bangumi: bangumiSource,
  mobygames: mobygamesSource,
  bilibili_show: bilibiliShowSource
};

// src/ui/modals.ts
var import_obsidian2 = require("obsidian");
var QueryInputModal = class extends import_obsidian2.Modal {
  constructor(app, options) {
    super(app);
    this.options = options;
    this.value = "";
    this.result = null;
    this.resolved = false;
    this.setTitle(options.title);
  }
  openAndWait() {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.open();
    });
  }
  onOpen() {
    const { contentEl } = this;
    let textComponent = null;
    contentEl.empty();
    contentEl.createEl("p", { text: this.options.hint });
    new import_obsidian2.Setting(contentEl).setName("\u4F5C\u54C1\u540D\u3001\u94FE\u63A5\u6216 ID").addText((text) => {
      textComponent = text;
      text.setPlaceholder(this.options.placeholder).setValue(this.value).onChange((value) => {
        this.value = value;
      });
      text.inputEl.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          this.closeWith(this.value.trim());
        }
      });
    });
    const footer = new import_obsidian2.Setting(contentEl);
    footer.addButton((button) => {
      button.setButtonText("\u53D6\u6D88");
      button.onClick(() => this.closeWith(null));
    });
    footer.addButton((button) => {
      button.setButtonText("\u7EE7\u7EED");
      button.setCta();
      button.onClick(() => this.closeWith(this.value.trim()));
    });
    window.setTimeout(() => {
      if (textComponent?.inputEl) {
        textComponent.inputEl.focus();
        textComponent.inputEl.select();
      }
    }, 0);
  }
  onClose() {
    this.contentEl.empty();
    if (!this.resolved && this.resolvePromise) {
      this.resolvePromise(this.result);
      this.resolved = true;
    }
  }
  closeWith(result) {
    this.result = result || null;
    if (!this.resolved && this.resolvePromise) {
      this.resolvePromise(this.result);
      this.resolved = true;
    }
    this.close();
  }
};
var SourceSuggestModal = class extends import_obsidian2.FuzzySuggestModal {
  constructor(app, options) {
    super(app);
    this.options = options;
    this.result = null;
    this.resolved = false;
    this.setPlaceholder(options.title);
    this.setInstructions([
      { command: "Enter", purpose: "\u786E\u8BA4\u6761\u76EE" },
      { command: "Esc", purpose: "\u53D6\u6D88" }
    ]);
  }
  openAndWait() {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.open();
    });
  }
  getItems() {
    return this.options.items;
  }
  getItemText(item) {
    return [item.title || "", item.subtitle || "", item.searchText || ""].filter(Boolean).join(" ");
  }
  renderSuggestion(match, el) {
    const wrapped = match?.item ?? match;
    el.createEl("div", { text: wrapped?.title || "\u672A\u547D\u540D\u6761\u76EE" });
    if (wrapped?.subtitle) {
      const meta = el.createEl("small", { text: wrapped.subtitle });
      meta.style.opacity = "0.75";
    }
  }
  onChooseItem(item) {
    this.result = item.item;
    if (!this.resolved && this.resolvePromise) {
      this.resolvePromise(item.item);
      this.resolved = true;
    }
  }
  onClose() {
    super.onClose();
    window.setTimeout(() => {
      if (!this.resolved && this.resolvePromise) {
        this.resolvePromise(this.result);
        this.resolved = true;
      }
    }, 0);
  }
};

// src/ui/settings.ts
var import_obsidian4 = require("obsidian");

// src/ui/suggest.ts
var import_obsidian3 = require("obsidian");
var TemplatePathSuggest = class extends import_obsidian3.AbstractInputSuggest {
  getSuggestions(inputStr) {
    const query = String(inputStr || "").trim().toLowerCase();
    return this.app.vault.getAllLoadedFiles().filter((file) => file instanceof import_obsidian3.TFile && file.extension === "md").filter((file) => !query || file.path.toLowerCase().includes(query)).slice(0, 100);
  }
  renderSuggestion(file, el) {
    el.setText(file.path);
  }
  selectSuggestion(file) {
    this.textInputEl.value = file.path;
    this.textInputEl.trigger("input");
    this.close();
  }
};
var FolderPathSuggest = class extends import_obsidian3.AbstractInputSuggest {
  getSuggestions(inputStr) {
    const query = String(inputStr || "").trim().toLowerCase();
    return this.app.vault.getAllFolders().filter((folder) => folder.path).filter((folder) => !query || folder.path.toLowerCase().includes(query)).slice(0, 100);
  }
  renderSuggestion(folder, el) {
    el.setText(folder.path);
  }
  selectSuggestion(folder) {
    this.textInputEl.value = folder.path;
    this.textInputEl.trigger("input");
    this.close();
  }
};

// src/ui/settings.ts
var MZMediaFetcherSettingTab = class extends import_obsidian4.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    void this.render();
  }
  async render() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "MZ Media Fetcher" });
    containerEl.createEl("p", {
      text: "\u5728\u8FD9\u91CC\u6539\u6A21\u677F\u8DEF\u5F84\u548C\u57FA\u7840\u914D\u7F6E\u3002\u6A21\u677F\u6B63\u6587\u7EE7\u7EED\u76F4\u63A5\u6539\u5BF9\u5E94\u6A21\u677F\u6587\u4EF6\uFF0C\u65E7 rules \u914D\u7F6E\u4F1A\u5728\u4FDD\u5B58\u65F6\u81EA\u52A8\u6536\u655B\u6210\u6A21\u677F\u6A21\u5F0F\u3002"
    });
    const vaultInfo = this.plugin.configStore.getVaultInfo();
    if (!vaultInfo) {
      containerEl.createEl("p", { text: "\u5F53\u524D vault \u4E0D\u652F\u6301\u672C\u5730\u63D2\u4EF6\u914D\u7F6E\u8DEF\u5F84\u3002" });
      return;
    }
    let normalizedConfigs;
    try {
      normalizedConfigs = await this.plugin.configStore.loadSourceConfigs(vaultInfo.path);
    } catch (error) {
      containerEl.createEl("p", {
        text: `\u8BFB\u53D6\u914D\u7F6E\u5931\u8D25\uFF1A${this.plugin.normalizeError(error)}`
      });
      return;
    }
    for (const source of MEDIA_SOURCES) {
      const normalizedConfig = normalizedConfigs[source.id];
      const state = {
        targetFolder: normalizedConfig.targetFolder,
        templatePath: normalizedConfig.templatePath,
        searchLimit: String(normalizedConfig.searchLimit),
        filenameTemplate: normalizedConfig.filename.template,
        filenameCollisionTemplate: normalizedConfig.filename.collisionTemplate
      };
      await this.renderSourceSection(containerEl, source.id, source.label, state);
    }
  }
  async renderSourceSection(containerEl, sourceKey, label, state) {
    const sectionEl = containerEl.createDiv();
    sectionEl.createEl("h3", { text: label });
    new import_obsidian4.Setting(sectionEl).setName("\u76EE\u6807\u76EE\u5F55").setDesc("\u65B0\u5EFA\u5361\u7247\u65F6\u5199\u5165\u7684\u7B14\u8BB0\u76EE\u5F55\u3002").addText((text) => {
      new FolderPathSuggest(this.app, text.inputEl);
      text.setPlaceholder("\u4F8B\u5982\uFF1A00-Inbox");
      text.setValue(state.targetFolder);
      text.onChange((value) => {
        state.targetFolder = value;
      });
    });
    new import_obsidian4.Setting(sectionEl).setName("\u6A21\u677F\u8DEF\u5F84").setDesc("\u6A21\u677F\u6587\u4EF6\u5728 vault \u5185\u7684\u76F8\u5BF9\u8DEF\u5F84\u3002").addText((text) => {
      new TemplatePathSuggest(this.app, text.inputEl);
      text.setPlaceholder(state.templatePath);
      text.setValue(state.templatePath);
      text.onChange((value) => {
        state.templatePath = value;
      });
    });
    new import_obsidian4.Setting(sectionEl).setName("\u641C\u7D22\u6761\u76EE\u6570").setDesc("\u641C\u7D22\u65F6\u6700\u591A\u5C55\u793A\u591A\u5C11\u4E2A\u5019\u9009\u6761\u76EE\u3002").addText((text) => {
      text.setPlaceholder("8");
      text.setValue(state.searchLimit);
      text.onChange((value) => {
        state.searchLimit = value;
      });
    });
    new import_obsidian4.Setting(sectionEl).setName("\u6587\u4EF6\u540D\u6A21\u677F").setDesc("\u7B2C\u4E00\u6B21\u5C1D\u8BD5\u521B\u5EFA\u7B14\u8BB0\u65F6\u4F7F\u7528\u7684\u6587\u4EF6\u540D\u6A21\u677F\u3002").addText((text) => {
      text.setPlaceholder("{{title}}");
      text.setValue(state.filenameTemplate);
      text.onChange((value) => {
        state.filenameTemplate = value;
      });
    });
    new import_obsidian4.Setting(sectionEl).setName("\u91CD\u540D\u6587\u4EF6\u540D\u6A21\u677F").setDesc("\u9047\u5230\u540C\u540D\u6587\u4EF6\u65F6\u4F7F\u7528\u7684\u5907\u7528\u6A21\u677F\u3002").addText((text) => {
      text.setPlaceholder(state.filenameCollisionTemplate);
      text.setValue(state.filenameCollisionTemplate);
      text.onChange((value) => {
        state.filenameCollisionTemplate = value;
      });
    });
    const actions = new import_obsidian4.Setting(sectionEl).setName("\u4FDD\u5B58");
    actions.addButton((button) => {
      button.setButtonText("\u4FDD\u5B58\u914D\u7F6E");
      button.setCta();
      button.onClick(async () => {
        try {
          const result = normalizeTemplateEditorValues(sourceKey, state);
          await this.plugin.configStore.saveTemplateSourceConfig(sourceKey, result);
          new import_obsidian4.Notice(`${label} \u914D\u7F6E\u5DF2\u4FDD\u5B58\u3002`, 5e3);
          await this.render();
        } catch (error) {
          new import_obsidian4.Notice(`\u4FDD\u5B58\u5931\u8D25\uFF1A${this.plugin.normalizeError(error)}`, 12e3);
        }
      });
    });
  }
};

// src/plugin.ts
var MZMediaFetcherPlugin = class extends import_obsidian5.Plugin {
  async onload() {
    this.configStore = new ConfigStore(this.app);
    this.isRunning = false;
    for (const source of MEDIA_SOURCES) {
      this.addCommand({
        id: source.commandId,
        name: source.commandName,
        callback: () => this.createCardForSource(source.id)
      });
    }
    this.addSettingTab(new MZMediaFetcherSettingTab(this.app, this));
  }
  normalizeError(error) {
    return normalizeError(error);
  }
  async createCardForSource(sourceId) {
    const source = MEDIA_SOURCE_MAP[sourceId];
    if (!source) {
      new import_obsidian5.Notice(`\u4E0D\u652F\u6301\u7684\u6765\u6E90\uFF1A${sourceId}`, 8e3);
      return;
    }
    await this.runCreateFlow(source);
  }
  async runCreateFlow(source) {
    if (this.isRunning) {
      new import_obsidian5.Notice(`${source.commandName}\u5DF2\u5728\u8FDB\u884C\u4E2D\u3002`, 5e3);
      return;
    }
    const vaultInfo = this.configStore.getVaultInfo();
    if (!vaultInfo) {
      new import_obsidian5.Notice("\u5F53\u524D vault \u4E0D\u652F\u6301\u672C\u5730\u63D2\u4EF6\u914D\u7F6E\u8DEF\u5F84\u3002", 8e3);
      return;
    }
    this.isRunning = true;
    try {
      const query = await new QueryInputModal(this.app, {
        title: source.inputTitle,
        hint: source.inputHint,
        placeholder: source.inputPlaceholder
      }).openAndWait();
      if (!query) {
        new import_obsidian5.Notice("\u5DF2\u53D6\u6D88\uFF0C\u672A\u65B0\u5EFA\u4EFB\u4F55\u4F5C\u54C1\u5361\u7247\u3002", 4e3);
        return;
      }
      const sourceConfigs = await this.configStore.loadSourceConfigs(vaultInfo.path);
      const sourceConfig = sourceConfigs[source.id];
      const directInput = source.parseDirectInput(query);
      let detail;
      if (directInput !== null && typeof directInput !== "undefined") {
        detail = await source.fetchByDirectInput(directInput, sourceConfig);
      } else if (source.search && source.fetchBySearchItem && source.toSuggestItem) {
        const normalizedQuery = String(query || "").trim();
        if (!normalizedQuery) {
          throw new Error("\u8BF7\u8F93\u5165\u8981\u641C\u7D22\u7684\u4F5C\u54C1\u540D\u3002");
        }
        const searchItems = await source.search(normalizedQuery, sourceConfig);
        if (!Array.isArray(searchItems) || searchItems.length === 0) {
          throw new Error(`${source.label} \u6CA1\u6709\u641C\u5230\u201C${normalizedQuery}\u201D\u76F8\u5173\u6761\u76EE\u3002`);
        }
        const chosen = await new SourceSuggestModal(this.app, {
          title: `\u9009\u62E9\u8981\u65B0\u5EFA\u7684 ${source.label} \u6761\u76EE`,
          items: searchItems.map(source.toSuggestItem)
        }).openAndWait();
        if (!chosen) {
          new import_obsidian5.Notice("\u5DF2\u53D6\u6D88\uFF0C\u672A\u65B0\u5EFA\u4EFB\u4F55\u4F5C\u54C1\u5361\u7247\u3002", 4e3);
          return;
        }
        detail = await source.fetchBySearchItem(chosen, sourceConfig);
      } else {
        throw new Error(`${source.label} \u76EE\u524D\u53EA\u652F\u6301\u76F4\u63A5\u8F93\u5165\u6307\u5B9A\u94FE\u63A5\u6216 ID\u3002`);
      }
      const normalizedItem = source.normalize(detail);
      const card = await buildCard(this.app, vaultInfo, source.id, normalizedItem, sourceConfig);
      await ensureFolderExists(this.app.vault, card.folderPath);
      const file = await this.app.vault.create(card.filePath, card.content);
      await this.app.workspace.getLeaf(true).openFile(file);
      new import_obsidian5.Notice(`\u4F5C\u54C1\u5361\u7247\u5DF2\u521B\u5EFA\uFF1A${normalizedItem.title}`, 8e3);
    } catch (error) {
      console.error("[MZ-media-fetcher]", error);
      new import_obsidian5.Notice(`\u65B0\u5EFA\u4F5C\u54C1\u5361\u7247\u5931\u8D25\uFF1A${normalizeError(error)}`, 12e3);
    } finally {
      this.isRunning = false;
    }
  }
};

// src/main.ts
var main_default = MZMediaFetcherPlugin;
