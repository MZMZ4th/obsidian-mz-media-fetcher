var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
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

// src/template-fields.ts
function getSourceTemplateVariables(sourceId) {
  return [...COMMON_TEMPLATE_VARIABLES, ...SOURCE_SPECIFIC_TEMPLATE_VARIABLES[sourceId]];
}
function buildTemplatePreviewSection(sourceId) {
  const variables = getSourceTemplateVariables(sourceId);
  const lines = ["## \u6293\u53D6\u5B57\u6BB5\u9884\u89C8", ""];
  for (const variable of variables) {
    if (!PREVIEW_INLINE_VARIABLES.has(variable.key)) {
      continue;
    }
    lines.push(`- ${variable.key}: {{${variable.key}}}`);
  }
  for (const variableKey of PREVIEW_BLOCK_VARIABLES) {
    const variable = variables.find((item) => item.key === variableKey);
    if (!variable) {
      continue;
    }
    lines.push("");
    lines.push(`### ${variable.key}`);
    lines.push("");
    lines.push(`{{${variable.key}}}`);
  }
  return `${lines.join("\n")}
`;
}
var COMMON_TEMPLATE_VARIABLES, SOURCE_SPECIFIC_TEMPLATE_VARIABLES, PREVIEW_INLINE_VARIABLES, PREVIEW_BLOCK_VARIABLES, BANGUMI_REFRESH_MANAGED_VARIABLES, BANGUMI_REFRESH_MANAGED_VARIABLE_SET, SOURCE_TEMPLATE_VARIABLES_MAP;
var init_template_fields = __esm({
  "src/template-fields.ts"() {
    COMMON_TEMPLATE_VARIABLES = [
      { key: "title", description: "\u5F53\u524D\u5361\u7247\u6807\u9898\u3002" },
      { key: "title_original", description: "\u539F\u540D\u3002" },
      { key: "aliases", description: "\u522B\u540D\u5217\u8868\uFF1B\u76F4\u63A5\u4F7F\u7528\u65F6\u4F1A\u62FC\u6210\u9017\u53F7\u5206\u9694\u6587\u672C\u3002" },
      { key: "media_type", description: "\u5A92\u4F53\u7C7B\u578B\u3002" },
      { key: "release_date", description: "\u53D1\u5E03\u65E5\u671F\uFF0C\u683C\u5F0F\u4E3A YYYY-MM-DD\u3002" },
      { key: "release_year", description: "\u53D1\u884C\u5E74\u4EFD\u3002" },
      { key: "cover_remote", description: "\u6765\u6E90\u7AD9\u70B9\u8FD4\u56DE\u7684\u8FDC\u7A0B\u6D77\u62A5\u94FE\u63A5\u3002" },
      { key: "summary", description: "\u7B80\u4ECB\u6B63\u6587\u3002" },
      { key: "platforms", description: "\u5E73\u53F0\u5217\u8868\uFF1B\u76F4\u63A5\u4F7F\u7528\u65F6\u4F1A\u62FC\u6210\u9017\u53F7\u5206\u9694\u6587\u672C\u3002" },
      { key: "platforms_text", description: "\u5E73\u53F0\u5217\u8868\u7684\u6362\u884C\u6587\u672C\u3002" },
      { key: "poster_path", description: "\u6700\u7EC8\u6D77\u62A5\u8DEF\u5F84\uFF1B\u4E0B\u8F7D\u672C\u5730\u540E\u4F1A\u53D8\u6210\u672C\u5730\u8DEF\u5F84\u3002" },
      { key: "poster", description: "\u6A21\u677F\u91CC\u63A8\u8350\u76F4\u63A5\u4F7F\u7528\u7684\u6D77\u62A5\u5B57\u6BB5\u3002" },
      { key: "network_poster", description: "\u5F53\u524D\u6D77\u62A5\u662F\u5426\u4ECD\u662F\u7F51\u7EDC\u94FE\u63A5\u3002" },
      { key: "categories", description: "\u9ED8\u8BA4\u5206\u7C7B\u3002" },
      { key: "source", description: "\u6765\u6E90 id\u3002" },
      { key: "rating", description: "\u9884\u7559\u8BC4\u5206\u9ED8\u8BA4\u503C\u3002" },
      { key: "status", description: "\u9884\u7559\u72B6\u6001\u9ED8\u8BA4\u503C\u3002" },
      { key: "finished_at", description: "\u9884\u7559\u5B8C\u6210\u65F6\u95F4\u9ED8\u8BA4\u503C\u3002" },
      { key: "rewatch_count", description: "\u9884\u7559\u4F53\u9A8C\u6B21\u6570\u9ED8\u8BA4\u503C\u3002" },
      { key: "cover_markdown", description: "\u73B0\u6210\u5C01\u9762 Markdown\u3002", yamlSafe: false }
    ];
    SOURCE_SPECIFIC_TEMPLATE_VARIABLES = {
      bangumi: [
        { key: "bangumi_id", description: "Bangumi \u6761\u76EE ID\u3002" },
        { key: "bangumi_url", description: "Bangumi \u6761\u76EE\u94FE\u63A5\u3002" },
        { key: "authors", description: "\u4F5C\u8005\u5217\u8868\uFF1B\u76F4\u63A5\u4F7F\u7528\u65F6\u4F1A\u62FC\u6210\u9017\u53F7\u5206\u9694\u6587\u672C\u3002" },
        { key: "publishers", description: "\u51FA\u7248\u793E\u5217\u8868\uFF1B\u76F4\u63A5\u4F7F\u7528\u65F6\u4F1A\u62FC\u6210\u9017\u53F7\u5206\u9694\u6587\u672C\u3002" },
        { key: "serial_magazines", description: "\u8FDE\u8F7D\u6742\u5FD7\u5217\u8868\uFF1B\u76F4\u63A5\u4F7F\u7528\u65F6\u4F1A\u62FC\u6210\u9017\u53F7\u5206\u9694\u6587\u672C\u3002" }
      ],
      mobygames: [
        { key: "mobygames_id", description: "MobyGames \u6E38\u620F ID\u3002" },
        { key: "mobygames_url", description: "MobyGames \u6E38\u620F\u94FE\u63A5\u3002" }
      ],
      bilibili_show: [
        { key: "bilibili_show_id", description: "\u4F1A\u5458\u8D2D\u9879\u76EE ID\u3002" },
        { key: "bilibili_show_url", description: "\u4F1A\u5458\u8D2D\u8BE6\u60C5\u9875\u94FE\u63A5\u3002" },
        { key: "venue_name", description: "\u6F14\u51FA\u573A\u6240\u540D\u79F0\u3002" },
        { key: "venue_address", description: "\u6F14\u51FA\u573A\u6240\u5730\u5740\u3002" },
        { key: "venue_text", description: "\u6F14\u51FA\u573A\u6240\u7684\u4E00\u884C\u6587\u672C\uFF0C\u4F18\u5148\u62FC\u63A5\u540D\u79F0\u548C\u5730\u5740\u3002" }
      ],
      showstart: [
        { key: "showstart_activity_id", description: "\u79C0\u52A8\u6D3B\u52A8 ID\u3002" },
        { key: "showstart_url", description: "\u79C0\u52A8\u6D3B\u52A8\u8BE6\u60C5\u9875\u94FE\u63A5\u3002" },
        { key: "venue_name", description: "\u6F14\u51FA\u573A\u6240\u540D\u79F0\u3002" },
        { key: "venue_address", description: "\u6F14\u51FA\u573A\u6240\u5730\u5740\u3002" },
        { key: "venue_text", description: "\u6F14\u51FA\u573A\u6240\u7684\u4E00\u884C\u6587\u672C\uFF0C\u4F18\u5148\u62FC\u63A5\u540D\u79F0\u548C\u5730\u5740\u3002" }
      ]
    };
    PREVIEW_INLINE_VARIABLES = /* @__PURE__ */ new Set([
      "title",
      "title_original",
      "aliases",
      "media_type",
      "release_date",
      "release_year",
      "cover_remote",
      "platforms",
      "poster_path",
      "poster",
      "network_poster",
      "categories",
      "source",
      "rating",
      "status",
      "finished_at",
      "rewatch_count",
      "bangumi_id",
      "bangumi_url",
      "authors",
      "publishers",
      "serial_magazines",
      "mobygames_id",
      "mobygames_url",
      "bilibili_show_id",
      "bilibili_show_url",
      "showstart_activity_id",
      "showstart_url",
      "venue_name",
      "venue_address",
      "venue_text"
    ]);
    PREVIEW_BLOCK_VARIABLES = ["summary", "platforms_text", "cover_markdown"];
    BANGUMI_REFRESH_MANAGED_VARIABLES = [
      "title",
      "title_original",
      "aliases",
      "media_type",
      "release_date",
      "bangumi_id",
      "bangumi_url",
      "authors",
      "publishers",
      "serial_magazines",
      "poster",
      "network_poster"
    ];
    BANGUMI_REFRESH_MANAGED_VARIABLE_SET = new Set(
      BANGUMI_REFRESH_MANAGED_VARIABLES
    );
    SOURCE_TEMPLATE_VARIABLES_MAP = {
      bangumi: getSourceTemplateVariables("bangumi"),
      mobygames: getSourceTemplateVariables("mobygames"),
      bilibili_show: getSourceTemplateVariables("bilibili_show"),
      showstart: getSourceTemplateVariables("showstart")
    };
  }
});

// src/core/paths.ts
function fallbackNormalizePath(value) {
  return String(value || "").replace(/\\/g, "/").replace(/\/{2,}/g, "/").trim();
}
function getRuntimeNormalizePath() {
  const maybeRequire = globalThis.require;
  if (typeof maybeRequire === "function") {
    try {
      const obsidian = maybeRequire("obsidian");
      if (typeof obsidian?.normalizePath === "function") {
        return obsidian.normalizePath;
      }
    } catch (_error) {
    }
  }
  return fallbackNormalizePath;
}
function normalizeVaultPath(value) {
  const normalized = getRuntimeNormalizePath()(String(value ?? ""));
  return normalized.replace(/^\/+|\/+$/g, "");
}
function joinVaultPath(...segments) {
  return normalizeVaultPath(
    segments.map((segment) => String(segment ?? "").trim()).filter(Boolean).join("/")
  );
}
var init_paths = __esm({
  "src/core/paths.ts"() {
  }
});

// src/config/defaults.ts
function buildTemplateContent(sourceId, frontmatter, options) {
  const sections = [
    `---
${frontmatter.join("\n")}
---`,
    options.cover,
    buildTemplatePreviewSection(sourceId).trimEnd(),
    "## \u7B80\u4ECB",
    "{{summary}}",
    ...options.details || [],
    "## \u7B80\u8BB0"
  ];
  return `${sections.join("\n\n")}
`;
}
function buildDefaultBangumiTypeTemplatePaths(pluginRoot) {
  return {
    game: joinVaultPath(pluginRoot, "templates", BANGUMI_TYPE_TEMPLATE_FILENAMES.game),
    anime: joinVaultPath(pluginRoot, "templates", BANGUMI_TYPE_TEMPLATE_FILENAMES.anime),
    book: joinVaultPath(pluginRoot, "templates", BANGUMI_TYPE_TEMPLATE_FILENAMES.book),
    liveAction: joinVaultPath(pluginRoot, "templates", BANGUMI_TYPE_TEMPLATE_FILENAMES.liveAction)
  };
}
function buildSourceConfigs(pluginId, configDir = ".obsidian", posterFolder = FALLBACK_POSTER_FOLDER) {
  const pluginRoot = joinVaultPath(configDir, "plugins", pluginId);
  return {
    bangumi: {
      targetFolder: "00-Inbox",
      templatePath: joinVaultPath(pluginRoot, "templates", "bangumi.md"),
      searchLimit: 8,
      typeTemplatePaths: buildDefaultBangumiTypeTemplatePaths(pluginRoot),
      poster: {
        saveLocal: false,
        folder: posterFolder
      },
      filename: {
        template: "{{title}}",
        collisionTemplate: "{{title}} {{release_year}} {{bangumi_id}}"
      }
    },
    mobygames: {
      targetFolder: "00-Inbox",
      templatePath: joinVaultPath(pluginRoot, "templates", "mobygames.md"),
      searchLimit: 8,
      poster: {
        saveLocal: false,
        folder: posterFolder
      },
      filename: {
        template: "{{title}}",
        collisionTemplate: "{{title}} {{release_year}} {{mobygames_id}}"
      }
    },
    bilibili_show: {
      targetFolder: "00-Inbox",
      templatePath: joinVaultPath(pluginRoot, "templates", "bilibili-show.md"),
      searchLimit: 8,
      poster: {
        saveLocal: false,
        folder: posterFolder
      },
      filename: {
        template: "{{title}}",
        collisionTemplate: "{{title}} {{release_year}} {{bilibili_show_id}}"
      }
    },
    showstart: {
      targetFolder: "00-Inbox",
      templatePath: joinVaultPath(pluginRoot, "templates", "showstart.md"),
      searchLimit: 8,
      poster: {
        saveLocal: false,
        folder: posterFolder
      },
      filename: {
        template: "{{title}}",
        collisionTemplate: "{{title}} {{release_year}} {{showstart_activity_id}}"
      }
    }
  };
}
function getDefaultSourceConfigs(configDir = ".obsidian", posterFolder = FALLBACK_POSTER_FOLDER) {
  return buildSourceConfigs(PLUGIN_ID, configDir, posterFolder);
}
function getLegacyDefaultSourceConfigs(configDir = ".obsidian", posterFolder = FALLBACK_POSTER_FOLDER) {
  return buildSourceConfigs(LEGACY_PLUGIN_ID, configDir, posterFolder);
}
var PLUGIN_ID, LEGACY_PLUGIN_ID, PLUGIN_NAME, PLUGIN_VERSION, HTTP_USER_AGENT, BANGUMI_API_BASE, FALLBACK_POSTER_FOLDER, BANGUMI_TEMPLATE_FRONTMATTER, BANGUMI_TEMPLATE_CONTENT, BILIBILI_SHOW_TEMPLATE_CONTENT, SHOWSTART_TEMPLATE_CONTENT, TEMPLATE_CONTENTS, BANGUMI_TYPE_TEMPLATE_FILENAMES, BANGUMI_TYPE_TEMPLATE_CONTENTS, DEFAULT_SOURCE_CONFIGS;
var init_defaults = __esm({
  "src/config/defaults.ts"() {
    init_paths();
    init_template_fields();
    PLUGIN_ID = "mz-media-fetcher";
    LEGACY_PLUGIN_ID = "MZ-media-fetcher";
    PLUGIN_NAME = "MZ Media Fetcher";
    PLUGIN_VERSION = "0.3.3";
    HTTP_USER_AGENT = `${PLUGIN_NAME}/${PLUGIN_VERSION} (Obsidian)`;
    BANGUMI_API_BASE = "https://api.bgm.tv/v0";
    FALLBACK_POSTER_FOLDER = "00-Inbox/\u9644\u4EF6/\u4F5C\u54C1\u6D77\u62A5";
    BANGUMI_TEMPLATE_FRONTMATTER = [
      "categories: \u65B0\u4F5C\u54C1\u5361\u7247",
      "\u540D\u79F0: {{yaml.title}}",
      "\u539F\u540D: {{yaml.title_original}}",
      "aliases: {{yaml.aliases}}",
      "\u5A92\u4F53\u7C7B\u578B: {{yaml.media_type}}",
      "\u53D1\u5E03\u65E5\u671F: {{yaml.release_date}}",
      "Bangumi ID: {{yaml.bangumi_id}}",
      "\u4F5C\u8005: {{yaml.authors}}",
      "\u51FA\u7248\u793E: {{yaml.publishers}}",
      "\u8FDE\u8F7D\u6742\u5FD7: {{yaml.serial_magazines}}",
      "\u8BC4\u5206:",
      "\u72B6\u6001: \u8FDB\u884C\u4E2D",
      '\u5B8C\u6210\u65F6\u95F4: ""',
      "\u4F53\u9A8C\u6B21\u6570: 1",
      "\u6D77\u62A5: {{poster}}",
      "\u6765\u6E90\u94FE\u63A5: {{bangumi_url}}",
      "\u7F51\u7EDC\u6D77\u62A5: {{yaml.network_poster}}"
    ];
    BANGUMI_TEMPLATE_CONTENT = buildTemplateContent("bangumi", BANGUMI_TEMPLATE_FRONTMATTER, {
      cover: "{{cover_markdown}}"
    });
    BILIBILI_SHOW_TEMPLATE_CONTENT = buildTemplateContent(
      "bilibili_show",
      [
        "categories: \u65B0\u4F5C\u54C1\u5361\u7247",
        "\u540D\u79F0: {{yaml.title}}",
        "\u539F\u540D:",
        "aliases:",
        "\u5A92\u4F53\u7C7B\u578B:",
        "\u53D1\u5E03\u65E5\u671F: {{yaml.release_date}}",
        "\u6F14\u51FA\u573A\u6240: {{yaml.venue_text}}",
        "\u8BC4\u5206:",
        "\u72B6\u6001:",
        "\u5B8C\u6210\u65F6\u95F4:",
        "\u4F53\u9A8C\u6B21\u6570:",
        "\u6D77\u62A5: {{poster}}",
        "\u6765\u6E90\u94FE\u63A5: {{bilibili_show_url}}",
        "\u7F51\u7EDC\u6D77\u62A5: {{yaml.network_poster}}"
      ],
      {
        cover: "![cover|300]({{poster}})"
      }
    );
    SHOWSTART_TEMPLATE_CONTENT = buildTemplateContent(
      "showstart",
      [
        "categories: \u65B0\u4F5C\u54C1\u5361\u7247",
        "\u540D\u79F0: {{yaml.title}}",
        "\u539F\u540D:",
        "aliases:",
        "\u5A92\u4F53\u7C7B\u578B:",
        "\u53D1\u5E03\u65E5\u671F: {{yaml.release_date}}",
        "\u6F14\u51FA\u573A\u6240: {{yaml.venue_text}}",
        "\u8BC4\u5206:",
        "\u72B6\u6001: \u5DF2\u5B8C\u6210",
        "\u5B8C\u6210\u65F6\u95F4: {{yaml.release_date}}",
        "\u4F53\u9A8C\u6B21\u6570: 1",
        "\u6D77\u62A5: {{poster}}",
        "\u6765\u6E90\u94FE\u63A5: {{showstart_url}}",
        "\u7F51\u7EDC\u6D77\u62A5: {{yaml.network_poster}}"
      ],
      {
        cover: "![cover|300]({{poster}})"
      }
    );
    TEMPLATE_CONTENTS = {
      bangumi: BANGUMI_TEMPLATE_CONTENT,
      mobygames: buildTemplateContent(
        "mobygames",
        [
          "categories: \u65B0\u4F5C\u54C1\u5361\u7247",
          "\u540D\u79F0: {{yaml.title}}",
          "\u539F\u540D: {{yaml.title_original}}",
          "aliases: {{yaml.aliases}}",
          "\u5A92\u4F53\u7C7B\u578B: {{yaml.media_type}}",
          "\u53D1\u5E03\u65E5\u671F: {{yaml.release_date}}",
          "\u8BC4\u5206:",
          "\u72B6\u6001: \u8FDB\u884C\u4E2D",
          '\u5B8C\u6210\u65F6\u95F4: ""',
          "\u4F53\u9A8C\u6B21\u6570: 1",
          "\u6D77\u62A5: {{poster}}",
          "\u6765\u6E90\u94FE\u63A5: {{mobygames_url}}",
          "\u7F51\u7EDC\u6D77\u62A5: {{yaml.network_poster}}"
        ],
        {
          cover: "{{cover_markdown}}",
          details: ["## \u5E73\u53F0", "{{platforms_text}}"]
        }
      ),
      bilibili_show: BILIBILI_SHOW_TEMPLATE_CONTENT,
      showstart: SHOWSTART_TEMPLATE_CONTENT
    };
    BANGUMI_TYPE_TEMPLATE_FILENAMES = {
      game: "bangumi-game.md",
      anime: "bangumi-anime.md",
      book: "bangumi-book.md",
      liveAction: "bangumi-live-action.md"
    };
    BANGUMI_TYPE_TEMPLATE_CONTENTS = {
      game: BANGUMI_TEMPLATE_CONTENT,
      anime: BANGUMI_TEMPLATE_CONTENT,
      book: BANGUMI_TEMPLATE_CONTENT,
      liveAction: BANGUMI_TEMPLATE_CONTENT
    };
    DEFAULT_SOURCE_CONFIGS = getDefaultSourceConfigs();
  }
});

// src/core/http.ts
var http_exports = {};
__export(http_exports, {
  requestBinary: () => requestBinary,
  requestJson: () => requestJson,
  requestText: () => requestText
});
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
async function requestBinary(url, options = {}) {
  const response = await request(url, "*/*", options);
  const buffer = response?.arrayBuffer;
  if (!(buffer instanceof ArrayBuffer)) {
    throw new Error("\u4E8C\u8FDB\u5236\u8D44\u6E90\u8FD4\u56DE\u683C\u5F0F\u4E0D\u5BF9\u3002");
  }
  return buffer;
}
var import_obsidian;
var init_http = __esm({
  "src/core/http.ts"() {
    import_obsidian = require("obsidian");
    init_defaults();
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => main_default
});
module.exports = __toCommonJS(main_exports);

// src/plugin.ts
var import_promises4 = __toESM(require("fs/promises"));
var import_path4 = __toESM(require("path"));
var import_obsidian5 = require("obsidian");

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
var FILE_NAME_CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
var FILE_NAME_ILLEGAL_CHARS = /[\\/:*?"<>|]/g;
var WINDOWS_RESERVED_FILE_NAME = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i;
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
  const normalized = String(value || "").replace(FILE_NAME_CONTROL_CHARS, " ").replace(FILE_NAME_ILLEGAL_CHARS, " ").trim().replace(/[. ]+$/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  if (!normalized) return "";
  if (!WINDOWS_RESERVED_FILE_NAME.test(normalized)) {
    return normalized;
  }
  const extensionIndex = normalized.indexOf(".");
  if (extensionIndex === -1) {
    return `${normalized}-file`;
  }
  return `${normalized.slice(0, extensionIndex)}-file${normalized.slice(extensionIndex)}`;
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
    poster: String(subject.poster_path || subject.cover_remote || "").trim(),
    network_poster: typeof subject.network_poster === "boolean" ? subject.network_poster : true,
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

// src/bangumi-refresh.ts
init_template_fields();
var TEMPLATE_PLACEHOLDER_PATTERN = /\{\{\s*(?:yaml\.)?([a-zA-Z0-9_]+)\s*\}\}/g;
function extractFrontmatterBlock(content) {
  const normalized = String(content || "").replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  if (lines[0] !== "---") {
    return null;
  }
  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index] !== "---") {
      continue;
    }
    return {
      frontmatter: lines.slice(1, index).join("\n"),
      body: lines.slice(index + 1).join("\n")
    };
  }
  return null;
}
function listFrontmatterKeys(frontmatter) {
  const keys = [];
  for (const line of String(frontmatter || "").split("\n")) {
    const match = line.match(/^([^-\s#][^:]*):(?:\s|$)/);
    if (match) {
      keys.push(match[1].trim());
    }
  }
  return keys;
}
function parseTemplateFrontmatterBindings(template) {
  const block = extractFrontmatterBlock(template);
  if (!block) {
    return [];
  }
  const bindings = [];
  for (const line of block.frontmatter.split("\n")) {
    const match = line.match(/^([^-\s#][^:]*):\s*(.*)$/);
    if (!match) {
      continue;
    }
    const propertyKey = match[1].trim();
    const valueText = match[2] || "";
    const placeholderMatch = [...valueText.matchAll(TEMPLATE_PLACEHOLDER_PATTERN)][0];
    if (!placeholderMatch?.[1]) {
      continue;
    }
    bindings.push({
      propertyKey,
      variableKey: placeholderMatch[1]
    });
  }
  return bindings;
}
function sanitizeFrontmatterObject(frontmatter) {
  return Object.entries(frontmatter || {}).reduce((result, [key, value]) => {
    if (key === "position") {
      return result;
    }
    result[key] = value;
    return result;
  }, {});
}
function stringifyFrontmatterEntries(entries) {
  const lines = ["---"];
  for (const entry of entries) {
    const renderedValue = renderYamlValue(entry.value, 0);
    if (renderedValue.startsWith("\n")) {
      lines.push(`${entry.key}:${renderedValue}`);
    } else {
      lines.push(`${entry.key}: ${renderedValue}`);
    }
  }
  lines.push("---", "");
  return `${lines.join("\n")}`;
}
function replaceFrontmatter(content, entries) {
  const normalized = String(content || "").replace(/\r\n/g, "\n");
  const block = extractFrontmatterBlock(normalized);
  const body = block ? block.body : normalized;
  const prefix = stringifyFrontmatterEntries(entries);
  const normalizedBody = body.replace(/^\n*/, "");
  if (!normalizedBody) {
    return ensureTrailingNewline(prefix);
  }
  return ensureTrailingNewline(`${prefix}${normalizedBody}`);
}
function normalizeComparableValue(value) {
  if (Array.isArray(value)) {
    return JSON.stringify(value.map((item) => String(item || "").trim()).filter(Boolean));
  }
  if (typeof value === "boolean" || typeof value === "number") {
    return String(value);
  }
  return String(value || "").trim();
}
function hasMeaningfulValue(value) {
  if (Array.isArray(value)) {
    return value.some((item) => String(item || "").trim());
  }
  if (typeof value === "boolean" || typeof value === "number") {
    return true;
  }
  return Boolean(String(value || "").trim());
}
function shouldRefreshPoster(frontmatter, posterPropertyKey, networkPosterPropertyKey) {
  const networkPosterValue = networkPosterPropertyKey ? frontmatter[networkPosterPropertyKey] : void 0;
  if (networkPosterValue === false || String(networkPosterValue || "").trim().toLowerCase() === "false") {
    return false;
  }
  const currentPosterValue = posterPropertyKey ? frontmatter[posterPropertyKey] : void 0;
  if (!hasMeaningfulValue(currentPosterValue)) {
    return true;
  }
  return /^https?:\/\//i.test(String(currentPosterValue || "").trim());
}
function collectBangumiTemplateValueCandidates(frontmatter, bindingGroups) {
  const result = {};
  for (const literalKey of ["bangumi_id", "bangumi_url"]) {
    if (hasMeaningfulValue(frontmatter[literalKey])) {
      result[literalKey] = frontmatter[literalKey];
    }
  }
  for (const bindings of bindingGroups) {
    for (const binding of bindings) {
      if (typeof result[binding.variableKey] !== "undefined") {
        continue;
      }
      if (!hasMeaningfulValue(frontmatter[binding.propertyKey])) {
        continue;
      }
      result[binding.variableKey] = frontmatter[binding.propertyKey];
    }
  }
  return result;
}
function analyzeBangumiFrontmatterUpdate(args) {
  const managedCandidates = [];
  const conflicts = [];
  const managedPropertyKeys = /* @__PURE__ */ new Set();
  const posterBinding = args.templateBindings.find((binding) => binding.variableKey === "poster");
  const networkPosterBinding = args.templateBindings.find(
    (binding) => binding.variableKey === "network_poster"
  );
  const canRefreshPoster = shouldRefreshPoster(
    args.existingFrontmatter,
    posterBinding?.propertyKey || null,
    networkPosterBinding?.propertyKey || null
  );
  for (const binding of args.templateBindings) {
    if (!BANGUMI_REFRESH_MANAGED_VARIABLE_SET.has(binding.variableKey)) {
      continue;
    }
    const variableKey = binding.variableKey;
    const currentValue = args.existingFrontmatter[binding.propertyKey];
    let fetchedValue = args.fetchedValues[variableKey];
    if (variableKey === "poster" && !canRefreshPoster && hasMeaningfulValue(currentValue)) {
      fetchedValue = currentValue;
    }
    if (variableKey === "network_poster" && !canRefreshPoster && typeof currentValue !== "undefined") {
      fetchedValue = currentValue;
    }
    const candidate = {
      propertyKey: binding.propertyKey,
      variableKey,
      currentValue,
      fetchedValue
    };
    managedCandidates.push(candidate);
    managedPropertyKeys.add(binding.propertyKey);
    if (hasMeaningfulValue(currentValue) && hasMeaningfulValue(fetchedValue) && normalizeComparableValue(currentValue) !== normalizeComparableValue(fetchedValue)) {
      conflicts.push(candidate);
    }
  }
  const otherEntries = args.existingKeyOrder.filter((key) => !managedPropertyKeys.has(key)).map((key) => ({
    key,
    value: args.existingFrontmatter[key]
  }));
  return {
    managedCandidates,
    conflicts,
    otherEntries
  };
}
function buildBangumiFrontmatterEntries(analysis, decisions = {}) {
  const managedEntries = analysis.managedCandidates.map((candidate) => ({
    key: candidate.propertyKey,
    value: decisions[candidate.propertyKey] === "keep" ? candidate.currentValue : candidate.fetchedValue
  }));
  return [...managedEntries, ...analysis.otherEntries];
}

// src/core/cards.ts
var import_promises2 = __toESM(require("fs/promises"));
var import_path2 = __toESM(require("path"));

// src/core/files.ts
var import_fs = __toESM(require("fs"));
var import_promises = __toESM(require("fs/promises"));
var import_path = __toESM(require("path"));
init_paths();
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
  const normalized = normalizeVaultPath(targetFolder);
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
  const cleanFolder = normalizeVaultPath(folder);
  let candidate = joinVaultPath(cleanFolder, `${primaryBase}.md`);
  if (!await exists(candidate)) {
    return candidate;
  }
  candidate = joinVaultPath(cleanFolder, `${collisionBase}.md`);
  if (!await exists(candidate)) {
    return candidate;
  }
  let index = 2;
  while (true) {
    candidate = joinVaultPath(cleanFolder, `${collisionBase}-${index}.md`);
    if (!await exists(candidate)) {
      return candidate;
    }
    index += 1;
  }
}
async function chooseAvailableAssetPath(folder, baseName, extension, exists) {
  const cleanFolder = normalizeVaultPath(folder);
  const cleanExt = String(extension || "").trim().replace(/^\./, "") || "jpg";
  let candidate = joinVaultPath(cleanFolder, `${baseName}.${cleanExt}`);
  if (!await exists(candidate)) {
    return candidate;
  }
  let index = 2;
  while (true) {
    candidate = joinVaultPath(cleanFolder, `${baseName}-${index}.${cleanExt}`);
    if (!await exists(candidate)) {
      return candidate;
    }
    index += 1;
  }
}

// src/core/cards.ts
init_paths();
var BANGUMI_MEDIA_TYPE_TEMPLATE_MAP = {
  \u6E38\u620F: "game",
  \u52A8\u753B: "anime",
  \u4E66\u7C4D: "book",
  \u4E09\u6B21\u5143: "liveAction"
};
async function defaultDownloadBinary(url) {
  const { requestBinary: requestBinary2 } = await Promise.resolve().then(() => (init_http(), http_exports));
  return requestBinary2(url);
}
async function buildCard(app, vaultInfo, sourceKey, item, config, downloadBinary = defaultDownloadBinary) {
  const filePath = await resolveCardPath(app, config, item, sourceKey);
  const resolvedItem = await resolvePosterAsset(app, config, item, filePath, downloadBinary);
  const configuredTemplatePath = resolveTemplatePathForItem(sourceKey, resolvedItem, config);
  const templatePath = import_path2.default.join(vaultInfo.path, normalizeVaultPath(configuredTemplatePath));
  const template = await import_promises2.default.readFile(templatePath, "utf8");
  const renderContext = buildTemplateContext(sourceKey, resolvedItem);
  const content = renderTemplate(template, renderContext).trim();
  return {
    folderPath: normalizeVaultPath(config.targetFolder),
    filePath,
    content: ensureTrailingNewline(content)
  };
}
function resolveTemplatePathForItem(sourceKey, item, config) {
  if (sourceKey !== "bangumi" || !config.typeTemplatePaths) {
    return config.templatePath;
  }
  const mediaType = String(item.media_type || "").trim();
  const templateType = BANGUMI_MEDIA_TYPE_TEMPLATE_MAP[mediaType];
  if (!templateType) {
    return config.templatePath;
  }
  return config.typeTemplatePaths[templateType] || config.templatePath;
}
async function resolveCardPath(app, config, item, sourceKey) {
  const idKeyMap = {
    bangumi: "bangumi_id",
    mobygames: "mobygames_id",
    bilibili_show: "bilibili_show_id",
    showstart: "showstart_activity_id"
  };
  const idKey = idKeyMap[sourceKey];
  const primaryName = sanitizeFileName(renderTemplate(config.filename.template, item));
  const collisionName = sanitizeFileName(
    renderTemplate(config.filename.collisionTemplate, item)
  );
  const itemId = String(item[idKey] || "").trim();
  const primaryBase = primaryName || [sourceKey, itemId].filter(Boolean).join("-");
  const collisionBase = collisionName || [primaryBase, itemId].filter(Boolean).join("-");
  return chooseAvailableCardPath(
    config.targetFolder,
    primaryBase,
    collisionBase,
    async (candidate) => app.vault.adapter.exists(candidate)
  );
}
function inferRemoteFileExtension(urlText) {
  try {
    const url = new URL(urlText);
    const match = url.pathname.match(/\.([a-zA-Z0-9]+)$/);
    if (match) {
      return match[1].toLowerCase();
    }
  } catch (_error) {
  }
  return "jpg";
}
async function resolvePosterAsset(app, config, item, cardFilePath, downloadBinary) {
  const remotePoster = String(item.cover_remote || "").trim();
  if (!config.poster.saveLocal || !remotePoster) {
    return {
      ...item,
      poster_path: remotePoster,
      network_poster: true
    };
  }
  const baseName = import_path2.default.parse(cardFilePath).name;
  const extension = inferRemoteFileExtension(remotePoster);
  const assetPath = await chooseAvailableAssetPath(
    config.poster.folder,
    sanitizeFileName(baseName) || "poster",
    extension,
    async (candidate) => app.vault.adapter.exists(candidate)
  );
  await ensureFolderExists(app.vault, config.poster.folder);
  const binary = await downloadBinary(remotePoster);
  await app.vault.createBinary(assetPath, binary);
  return {
    ...item,
    poster_path: assetPath,
    network_poster: false
  };
}

// src/core/errors.ts
function normalizeError(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return String(error || "\u672A\u77E5\u9519\u8BEF");
}

// src/plugin.ts
init_paths();

// src/config/storage.ts
var import_fs2 = __toESM(require("fs"));
var import_promises3 = __toESM(require("fs/promises"));
var import_path3 = __toESM(require("path"));
init_defaults();
init_paths();

// src/types.ts
var SOURCE_IDS = ["bangumi", "mobygames", "bilibili_show", "showstart"];
var BANGUMI_TEMPLATE_TYPES = ["game", "anime", "book", "liveAction"];

// src/config/storage.ts
function normalizePlainRelativePath(value) {
  return normalizeVaultPath(value);
}
function normalizeVaultRelativePath(value) {
  const normalized = normalizePlainRelativePath(value);
  if (!normalized) {
    throw new Error("\u6A21\u677F\u8DEF\u5F84\u4E0D\u80FD\u4E3A\u7A7A\u3002");
  }
  return normalized;
}
function normalizeOptionalVaultRelativePath(value) {
  if (value === null || typeof value === "undefined") {
    return "";
  }
  return normalizePlainRelativePath(value);
}
function normalizeSearchLimit(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 1) {
    return Math.max(1, Number(fallback) || 1);
  }
  return Math.max(1, Math.round(numeric));
}
function resolveAttachmentFolderPath(appConfig, fallback = FALLBACK_POSTER_FOLDER) {
  const folder = normalizePlainRelativePath(appConfig?.attachmentFolderPath);
  return folder || normalizePlainRelativePath(fallback);
}
function buildTemplateModeSourceConfig(raw, defaults, legacyDefaults) {
  const source = raw && typeof raw === "object" ? raw : {};
  const filename = source.filename && typeof source.filename === "object" ? source.filename : {};
  const poster = source.poster && typeof source.poster === "object" ? source.poster : {};
  const templatePath = normalizeVaultRelativePath(source.templatePath || defaults.templatePath);
  const legacyTemplatePath = legacyDefaults?.templatePath ? normalizeVaultRelativePath(legacyDefaults.templatePath) : "";
  const typeTemplatePaths = buildBangumiTypeTemplatePaths(
    source,
    defaults.typeTemplatePaths,
    legacyDefaults?.typeTemplatePaths
  );
  return {
    targetFolder: normalizePlainRelativePath(source.targetFolder || defaults.targetFolder),
    templatePath: legacyTemplatePath && templatePath === legacyTemplatePath ? defaults.templatePath : templatePath,
    searchLimit: normalizeSearchLimit(source.searchLimit, defaults.searchLimit),
    ...typeTemplatePaths ? { typeTemplatePaths } : {},
    poster: {
      saveLocal: Boolean(
        typeof poster.saveLocal === "boolean" ? poster.saveLocal : defaults.poster.saveLocal
      ),
      folder: normalizePlainRelativePath(poster.folder || defaults.poster.folder)
    },
    filename: {
      template: String(filename.template || defaults.filename.template).trim(),
      collisionTemplate: String(
        filename.collisionTemplate || defaults.filename.collisionTemplate
      ).trim()
    }
  };
}
function buildBangumiTypeTemplatePaths(source, defaults, legacyDefaults) {
  if (!defaults) {
    return void 0;
  }
  const raw = source.typeTemplatePaths && typeof source.typeTemplatePaths === "object" ? source.typeTemplatePaths : {};
  return BANGUMI_TEMPLATE_TYPES.reduce((result, templateType) => {
    const defaultPath = defaults[templateType];
    const legacyPath = legacyDefaults?.[templateType] ? normalizeVaultRelativePath(legacyDefaults[templateType]) : "";
    const hasExplicitValue = Object.prototype.hasOwnProperty.call(raw, templateType);
    const explicitValue = hasExplicitValue ? normalizeOptionalVaultRelativePath(raw[templateType]) : void 0;
    if (explicitValue === void 0) {
      result[templateType] = defaultPath;
    } else if (legacyPath && explicitValue === legacyPath) {
      result[templateType] = defaultPath;
    } else {
      result[templateType] = explicitValue;
    }
    return result;
  }, {});
}
function normalizeSourceConfig(raw, sourceKey, defaults, legacyDefaults) {
  return buildTemplateModeSourceConfig(raw, defaults[sourceKey], legacyDefaults[sourceKey]);
}
function normalizeSourceConfigs(raw, defaults, legacyDefaults) {
  if (!raw || typeof raw !== "object") {
    throw new Error("\u4F5C\u54C1\u6293\u53D6\u914D\u7F6E\u683C\u5F0F\u4E0D\u5BF9\u3002");
  }
  return SOURCE_IDS.reduce((result, sourceKey) => {
    result[sourceKey] = normalizeSourceConfig(raw[sourceKey], sourceKey, defaults, legacyDefaults);
    return result;
  }, {});
}
function buildConfigRootFromUnknown(raw, defaults, legacyDefaults) {
  return SOURCE_IDS.reduce((result, sourceKey) => {
    result[sourceKey] = buildTemplateModeSourceConfig(
      raw?.[sourceKey],
      defaults[sourceKey],
      legacyDefaults[sourceKey]
    );
    return result;
  }, {});
}
function normalizeTemplateEditorValues(sourceKey, state, defaultSourceConfigs = DEFAULT_SOURCE_CONFIGS) {
  const defaults = defaultSourceConfigs[sourceKey];
  const targetFolder = normalizePlainRelativePath(state.targetFolder || defaults.targetFolder);
  const templatePath = normalizeVaultRelativePath(state.templatePath || defaults.templatePath);
  const searchLimit = normalizeSearchLimit(state.searchLimit, defaults.searchLimit);
  const posterSaveLocal = Boolean(state.posterSaveLocal);
  const posterFolder = normalizePlainRelativePath(state.posterFolder || defaults.poster.folder);
  const filenameTemplate = String(state.filenameTemplate || defaults.filename.template).trim();
  const filenameCollisionTemplate = String(
    state.filenameCollisionTemplate || defaults.filename.collisionTemplate
  ).trim();
  const typeTemplatePaths = defaults.typeTemplatePaths ? BANGUMI_TEMPLATE_TYPES.reduce((result, templateType) => {
    const rawValue = state.typeTemplatePaths?.[templateType];
    result[templateType] = typeof rawValue === "string" ? normalizeOptionalVaultRelativePath(rawValue) : defaults.typeTemplatePaths?.[templateType] || "";
    return result;
  }, {}) : void 0;
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
    ...typeTemplatePaths ? { typeTemplatePaths } : {},
    poster: {
      saveLocal: posterSaveLocal,
      folder: posterFolder
    },
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
  getLegacyPluginFilePath(fileName) {
    const vaultInfo = this.getVaultInfo();
    if (!vaultInfo) {
      throw new Error("\u5F53\u524D vault \u4E0D\u652F\u6301\u63D2\u4EF6\u914D\u7F6E\u8DEF\u5F84\u3002");
    }
    const configDir = this.app.vault?.configDir || ".obsidian";
    return import_path3.default.join(vaultInfo.path, configDir, "plugins", LEGACY_PLUGIN_ID, fileName);
  }
  getDefaultSourceConfigs() {
    const configDir = this.app.vault?.configDir || ".obsidian";
    return getDefaultSourceConfigs(configDir);
  }
  getLegacyDefaultSourceConfigs(posterFolder = FALLBACK_POSTER_FOLDER) {
    const configDir = this.app.vault?.configDir || ".obsidian";
    return getLegacyDefaultSourceConfigs(configDir, posterFolder);
  }
  async readVaultAppConfig(vaultBasePath) {
    const configDir = this.app.vault?.configDir || ".obsidian";
    const appConfigPath = import_path3.default.join(vaultBasePath, configDir, "app.json");
    try {
      const raw = await import_promises3.default.readFile(appConfigPath, "utf8");
      return JSON.parse(raw);
    } catch (_error) {
      return {};
    }
  }
  async getDefaultPosterFolder(vaultBasePath) {
    const appConfig = await this.readVaultAppConfig(vaultBasePath);
    return resolveAttachmentFolderPath(appConfig, FALLBACK_POSTER_FOLDER);
  }
  async getResolvedDefaultSourceConfigs(vaultBasePath) {
    const configDir = this.app.vault?.configDir || ".obsidian";
    const posterFolder = await this.getDefaultPosterFolder(vaultBasePath);
    return getDefaultSourceConfigs(configDir, posterFolder);
  }
  async getResolvedLegacyDefaultSourceConfigs(vaultBasePath) {
    const posterFolder = await this.getDefaultPosterFolder(vaultBasePath);
    return this.getLegacyDefaultSourceConfigs(posterFolder);
  }
  async ensureDefaultFiles(vaultBasePath) {
    const defaults = await this.getResolvedDefaultSourceConfigs(vaultBasePath);
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
    await this.ensureBangumiTypeTemplates(vaultBasePath, defaults.bangumi, defaults.bangumi);
  }
  async ensureTemplateExists(vaultBasePath, relativePath, content) {
    const absolutePath = import_path3.default.join(vaultBasePath, normalizeVaultPath(relativePath));
    await ensureTextFile(absolutePath, content);
  }
  async ensureBangumiTypeTemplates(vaultBasePath, config, defaultConfig) {
    if (!config.typeTemplatePaths || !defaultConfig.typeTemplatePaths) {
      return;
    }
    for (const templateType of BANGUMI_TEMPLATE_TYPES) {
      const configuredPath = config.typeTemplatePaths[templateType];
      if (!configuredPath) {
        continue;
      }
      if (configuredPath !== defaultConfig.typeTemplatePaths[templateType]) {
        continue;
      }
      await this.ensureTemplateExists(
        vaultBasePath,
        configuredPath,
        BANGUMI_TYPE_TEMPLATE_CONTENTS[templateType]
      );
    }
  }
  async loadLegacyPluginConfigRoot(vaultBasePath) {
    const filePath = this.getLegacyPluginFilePath("media-fetcher-rules.json");
    let raw = "";
    try {
      raw = await import_promises3.default.readFile(filePath, "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") {
        return null;
      }
      throw new Error(`\u8BFB\u53D6\u65E7\u63D2\u4EF6\u914D\u7F6E\u5931\u8D25\uFF1A${LEGACY_PLUGIN_ID}/media-fetcher-rules.json`);
    }
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (_error) {
      throw new Error(`\u65E7\u63D2\u4EF6\u914D\u7F6E\u4E0D\u662F\u5408\u6CD5 JSON\uFF1A${LEGACY_PLUGIN_ID}/media-fetcher-rules.json`);
    }
    const defaults = await this.getResolvedDefaultSourceConfigs(vaultBasePath);
    const legacyDefaults = await this.getResolvedLegacyDefaultSourceConfigs(vaultBasePath);
    return buildConfigRootFromUnknown(parsed, defaults, legacyDefaults);
  }
  async buildInitialConfig(vaultBasePath) {
    const defaults = await this.getResolvedDefaultSourceConfigs(vaultBasePath);
    const legacyPluginConfig = await this.loadLegacyPluginConfigRoot(vaultBasePath);
    if (legacyPluginConfig) {
      return legacyPluginConfig;
    }
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
      bilibili_show: defaults.bilibili_show,
      showstart: defaults.showstart
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
    const defaults = await this.getResolvedDefaultSourceConfigs(vaultBasePath);
    const legacyDefaults = await this.getResolvedLegacyDefaultSourceConfigs(vaultBasePath);
    const migrated = buildConfigRootFromUnknown(raw, defaults, legacyDefaults);
    const normalized = normalizeSourceConfigs(migrated, defaults, legacyDefaults);
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
    await this.ensureBangumiTypeTemplates(vaultBasePath, normalized.bangumi, defaults.bangumi);
    return normalized;
  }
  async saveTemplateSourceConfig(sourceKey, values) {
    const vaultInfo = this.getVaultInfo();
    if (!vaultInfo) {
      throw new Error("\u5F53\u524D vault \u4E0D\u652F\u6301\u672C\u5730\u63D2\u4EF6\u914D\u7F6E\u8DEF\u5F84\u3002");
    }
    const rawRoot = await this.loadRawSourceConfigRoot(vaultInfo.path);
    const defaults = await this.getResolvedDefaultSourceConfigs(vaultInfo.path);
    const legacyDefaults = await this.getResolvedLegacyDefaultSourceConfigs(vaultInfo.path);
    const nextRoot = buildConfigRootFromUnknown(rawRoot, defaults, legacyDefaults);
    nextRoot[sourceKey] = values;
    await this.writeSourceConfigRoot(nextRoot);
  }
};

// src/plugin.ts
init_defaults();

// src/source-ui-meta.ts
init_template_fields();
var MEDIA_SOURCE_UI_META_MAP = {
  bangumi: {
    supportsSearch: true,
    inputFieldLabel: "\u4F5C\u54C1\u540D\u3001\u94FE\u63A5\u6216 ID",
    featureNotes: [
      "\u652F\u6301\u6807\u9898\u641C\u7D22\uFF0C\u5E76\u4ECE\u5019\u9009\u6761\u76EE\u91CC\u9009\u62E9\u540E\u518D\u521B\u5EFA\u5361\u7247\u3002",
      "\u652F\u6301\u76F4\u63A5\u7C98\u8D34 Bangumi \u6761\u76EE\u94FE\u63A5\u3002",
      "\u652F\u6301\u76F4\u63A5\u8F93\u5165\u6570\u5B57\u6761\u76EE ID\u3002",
      "\u652F\u6301\u6309\u6E38\u620F\u3001\u52A8\u753B\u3001\u4E66\u7C4D\u3001\u4E09\u6B21\u5143\u81EA\u52A8\u5207\u6362\u5230\u4E0D\u540C\u6A21\u677F\uFF1B\u7559\u7A7A\u65F6\u4F1A\u56DE\u9000\u901A\u7528\u6A21\u677F\u3002",
      "\u4F1A\u6309\u6A21\u677F\u65B0\u5EFA\u4F5C\u54C1\u5361\u7247\uFF0C\u5E76\u53EF\u6309\u914D\u7F6E\u51B3\u5B9A\u662F\u5426\u4E0B\u8F7D\u672C\u5730\u6D77\u62A5\u3002",
      "\u652F\u6301\u5BF9\u5F53\u524D\u6253\u5F00\u7684 Bangumi \u5361\u7247\u91CD\u65B0\u8865\u5168 frontmatter\uFF0C\u4E0D\u4F1A\u91CD\u5199\u6B63\u6587\u3002"
    ],
    templateVariables: SOURCE_TEMPLATE_VARIABLES_MAP.bangumi
  },
  mobygames: {
    supportsSearch: false,
    inputFieldLabel: "\u8BE6\u60C5\u94FE\u63A5",
    featureNotes: [
      "\u53EA\u652F\u6301\u76F4\u63A5\u7C98\u8D34 MobyGames \u5177\u4F53\u6E38\u620F\u9875\u9762\u94FE\u63A5\u3002",
      "\u4E0D\u652F\u6301\u641C\u7D22\u9875\u3001\u5217\u8868\u9875\u6216\u7AD9\u5185\u6807\u9898\u641C\u7D22\u3002",
      "\u4F1A\u6293\u53D6\u516C\u5F00\u9875\u9762\u5185\u5BB9\u5E76\u6309\u6A21\u677F\u65B0\u5EFA\u4F5C\u54C1\u5361\u7247\u3002"
    ],
    templateVariables: SOURCE_TEMPLATE_VARIABLES_MAP.mobygames
  },
  bilibili_show: {
    supportsSearch: false,
    inputFieldLabel: "\u8BE6\u60C5\u94FE\u63A5",
    featureNotes: [
      "\u53EA\u652F\u6301\u76F4\u63A5\u7C98\u8D34 bilibili \u4F1A\u5458\u8D2D\u6D3B\u52A8\u8BE6\u60C5\u9875\u94FE\u63A5\u3002",
      "\u4E0D\u652F\u6301\u7AD9\u5185\u641C\u7D22\u3002",
      "\u4F1A\u76F4\u63A5\u8BFB\u53D6\u9879\u76EE\u8BE6\u60C5\u63A5\u53E3\uFF0C\u4E0D\u89E3\u6790\u9875\u9762\u6B63\u6587\u3002"
    ],
    templateVariables: SOURCE_TEMPLATE_VARIABLES_MAP.bilibili_show
  },
  showstart: {
    supportsSearch: false,
    inputFieldLabel: "\u8BE6\u60C5\u94FE\u63A5",
    featureNotes: [
      "\u53EA\u652F\u6301\u76F4\u63A5\u7C98\u8D34\u79C0\u52A8\u6D3B\u52A8\u8BE6\u60C5\u9875\u94FE\u63A5\u3002",
      "\u4E0D\u652F\u6301\u7AD9\u5185\u641C\u7D22\u3002",
      "\u4F1A\u8BFB\u53D6\u79C0\u52A8\u6D3B\u52A8\u8BE6\u60C5\u63A5\u53E3\uFF0C\u4E0D\u89E3\u6790\u9875\u9762\u6B63\u6587\u3002"
    ],
    templateVariables: SOURCE_TEMPLATE_VARIABLES_MAP.showstart
  }
};

// src/sources/bangumi-source.ts
init_defaults();
init_http();

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
  return collectBangumiInfoboxValues(subject, ["\u522B\u540D"], [preferredTitle, originalTitle]);
}
function collectBangumiInfoboxValues(subject, keys, excludedValues = []) {
  const aliases = [];
  const seen = /* @__PURE__ */ new Set();
  const normalizedExcludedValues = new Set(
    excludedValues.map((value) => String(value || "").trim()).filter(Boolean)
  );
  const keySet = new Set(keys.map((key) => key.trim()));
  const pushAlias = (value) => {
    const normalized = String(value || "").trim();
    if (!normalized) return;
    if (normalizedExcludedValues.has(normalized)) return;
    if (seen.has(normalized)) return;
    seen.add(normalized);
    aliases.push(normalized);
  };
  if (Array.isArray(subject.infobox)) {
    for (const item of subject.infobox) {
      if (!keySet.has(String(item?.key || "").trim())) continue;
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
  const authors = collectBangumiInfoboxValues(subject, ["\u4F5C\u8005"]);
  const publishers = collectBangumiInfoboxValues(subject, ["\u51FA\u7248\u793E"]);
  const serialMagazines = collectBangumiInfoboxValues(subject, ["\u8FDE\u8F7D\u6742\u5FD7"]);
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
    platforms_text: "",
    authors,
    publishers,
    serial_magazines: serialMagazines
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

// src/sources/bilibili-show-source.ts
init_http();

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
  return `${year}-${month}-${day}`;
}
function pickString(detail, keys) {
  for (const key of keys) {
    const value = detail[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}
function pickNestedString(detail, containerKeys, valueKeys) {
  for (const containerKey of containerKeys) {
    const container = detail[containerKey];
    if (!container || typeof container !== "object" || Array.isArray(container)) {
      continue;
    }
    const picked = pickString(container, valueKeys);
    if (picked) {
      return picked;
    }
  }
  return "";
}
function buildVenueText(name, address) {
  if (!name) return address;
  if (!address) return name;
  if (address.includes(name)) return address;
  if (name.includes(address)) return name;
  return `${name} \xB7 ${address}`;
}
function pickBilibiliVenue(detail) {
  const venueName = pickString(detail, [
    "venue_name",
    "venueName",
    "venue",
    "site_name",
    "siteName",
    "place_name",
    "placeName",
    "place",
    "screen_name",
    "screenName"
  ]) || pickNestedString(detail, ["venue_info", "venueInfo", "site_info", "siteInfo"], [
    "venue_name",
    "venueName",
    "name",
    "site_name",
    "siteName",
    "place_name",
    "placeName",
    "screen_name",
    "screenName"
  ]);
  const venueAddress = pickString(detail, [
    "venue_address",
    "venueAddress",
    "address",
    "addr",
    "detail_address",
    "detailAddress",
    "place_address",
    "placeAddress",
    "city_name",
    "cityName",
    "city"
  ]) || pickNestedString(detail, ["venue_info", "venueInfo", "site_info", "siteInfo"], [
    "venue_address",
    "venueAddress",
    "address",
    "addr",
    "detail_address",
    "detailAddress",
    "place_address",
    "placeAddress",
    "city_name",
    "cityName",
    "city"
  ]);
  return {
    venueName,
    venueAddress,
    venueText: buildVenueText(venueName, venueAddress)
  };
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
  const record = detail || {};
  const { venueName, venueAddress, venueText } = pickBilibiliVenue(record);
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
    platforms_text: "",
    venue_name: venueName,
    venue_address: venueAddress,
    venue_text: venueText
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

// src/sources/mobygames-source.ts
init_http();

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

// src/sources/showstart-source.ts
init_http();

// src/sources/showstart.ts
function ensureHttpsUrl2(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return "";
  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (normalized.startsWith("//")) return `https:${normalized}`;
  return normalized;
}
function pickString2(detail, keys) {
  for (const key of keys) {
    const value = detail[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}
function pickNumber(detail, keys) {
  for (const key of keys) {
    const numeric = Number(detail[key]);
    if (Number.isInteger(numeric) && numeric > 0) {
      return numeric;
    }
  }
  return null;
}
function formatTimestamp(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "";
  }
  const milliseconds = numeric > 1e12 ? numeric : numeric * 1e3;
  const date = new Date(milliseconds);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function normalizeShowstartDate(detail) {
  const timestampDate = formatTimestamp(detail.startTime);
  if (timestampDate) return timestampDate;
  const candidates = [
    pickString2(detail, ["activityTime", "showTime", "startDate"]),
    pickString2(detail, ["activityDate", "date"])
  ].filter(Boolean);
  for (const candidate of candidates) {
    const direct = normalizeDateValue(candidate);
    if (direct) return direct;
    const dateMatch = candidate.match(/\b\d{4}-\d{2}-\d{2}\b/) || candidate.match(/\b\d{4}\/\d{1,2}\/\d{1,2}\b/) || candidate.match(/\b\d{4}\.\d{1,2}\.\d{1,2}\b/);
    if (dateMatch) {
      const normalized = dateMatch[0].replace(/[/.]/g, "-").replace(/-(\d)(?=-|$)/g, "-0$1");
      const value = normalizeDateValue(normalized);
      if (value) return value;
    }
    const readable = normalizeDateText(candidate);
    const readableValue = normalizeDateValue(readable);
    if (readableValue) return readableValue;
  }
  return "";
}
function pickShowstartCover(detail) {
  return ensureHttpsUrl2(
    pickString2(detail, [
      "avatar",
      "poster",
      "posterUrl",
      "image",
      "cover",
      "banner",
      "shareImage",
      "activityImg"
    ])
  );
}
function buildVenueText2(name, address) {
  if (!name) return address;
  if (!address) return name;
  if (address.includes(name)) return address;
  if (name.includes(address)) return name;
  return `${name} \xB7 ${address}`;
}
function pickShowstartVenueContainers(detail) {
  const containers = [{ record: detail, allowGenericName: false }];
  const seen = /* @__PURE__ */ new Set([detail]);
  for (const key of ["venueInfo", "venue_info", "siteInfo", "site_info", "site", "venue", "place"]) {
    const value = detail[key];
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      continue;
    }
    const record = value;
    if (seen.has(record)) {
      continue;
    }
    seen.add(record);
    containers.push({ record, allowGenericName: true });
  }
  return containers;
}
function pickStringFromVenueContainers(containers, keys, options = {}) {
  for (const container of containers) {
    if (options.genericNameOnly && !container.allowGenericName) {
      continue;
    }
    const picked = pickString2(container.record, keys);
    if (picked) {
      return picked;
    }
  }
  return "";
}
function appendVenuePart(parts, value) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return;
  }
  const duplicateIndex = parts.findIndex(
    (part) => part === normalized || part.includes(normalized) || normalized.includes(part)
  );
  if (duplicateIndex === -1) {
    parts.push(normalized);
    return;
  }
  if (normalized.length > parts[duplicateIndex].length) {
    parts.splice(duplicateIndex, 1, normalized);
  }
}
function buildVenueAddressFromParts(containers) {
  const parts = [];
  appendVenuePart(
    parts,
    pickStringFromVenueContainers(containers, ["provinceName", "province_name", "province"])
  );
  appendVenuePart(
    parts,
    pickStringFromVenueContainers(containers, ["cityName", "city_name", "city"])
  );
  appendVenuePart(
    parts,
    pickStringFromVenueContainers(containers, ["districtName", "district_name", "district"])
  );
  appendVenuePart(
    parts,
    pickStringFromVenueContainers(containers, [
      "detailAddress",
      "detail_address",
      "venueAddress",
      "venue_address",
      "placeAddress",
      "place_address",
      "address",
      "addr"
    ])
  );
  return parts.join("");
}
function pickShowstartVenue(detail) {
  const containers = pickShowstartVenueContainers(detail);
  const venueName = pickStringFromVenueContainers(containers, [
    "venueName",
    "venue_name",
    "siteName",
    "site_name",
    "placeName",
    "place_name",
    "shopName",
    "stadiumName"
  ]) || pickStringFromVenueContainers(
    containers,
    ["name", "venue", "place"],
    { genericNameOnly: true }
  );
  const venueAddress = pickStringFromVenueContainers(containers, [
    "venueAddress",
    "venue_address",
    "placeAddress",
    "place_address",
    "address",
    "addr"
  ]) || buildVenueAddressFromParts(containers);
  return {
    venueName,
    venueAddress,
    venueText: buildVenueText2(venueName, venueAddress)
  };
}
function parseShowstartActivityId(input) {
  const text = String(input || "").trim();
  if (!text) {
    throw new Error("\u8BF7\u5148\u8D34\u4E0A\u79C0\u52A8\u6D3B\u52A8\u8BE6\u60C5\u9875\u94FE\u63A5\u3002");
  }
  let url;
  try {
    url = new URL(text);
  } catch (_error) {
    throw new Error("\u79C0\u52A8\u76EE\u524D\u53EA\u652F\u6301\u76F4\u63A5\u8D34\u6D3B\u52A8\u8BE6\u60C5\u9875\u94FE\u63A5\u3002");
  }
  if (!/showstart\.com$/i.test(url.hostname) && !/\.showstart\.com$/i.test(url.hostname)) {
    throw new Error("\u8FD9\u4E0D\u662F\u79C0\u52A8\u7684\u94FE\u63A5\u3002");
  }
  const eventMatch = url.pathname.match(/^\/event\/(\d+)(?:\/)?$/);
  if (eventMatch) {
    return Number(eventMatch[1]);
  }
  if (url.pathname !== "/pages/activity/detail/detail") {
    throw new Error("\u8BF7\u8D34\u79C0\u52A8\u5177\u4F53\u6D3B\u52A8\u8BE6\u60C5\u9875\u94FE\u63A5\uFF0C\u4E0D\u662F\u5217\u8868\u9875\u6216\u5176\u4ED6\u9875\u9762\u3002");
  }
  const activityId = Number(url.searchParams.get("activityId") || url.searchParams.get("id"));
  if (!Number.isInteger(activityId) || activityId <= 0) {
    throw new Error("\u8FD9\u4E2A\u79C0\u52A8\u94FE\u63A5\u91CC\u6CA1\u6709\u6709\u6548\u7684 activityId\u3002");
  }
  return activityId;
}
function normalizeShowstartActivityUrl(activityId) {
  return `https://wap.showstart.com/pages/activity/detail/detail?activityId=${activityId}`;
}
function unwrapShowstartActivityResponse(payload, activityId) {
  const data = payload?.data || payload?.result;
  const responseActivityId = pickNumber(data || {}, [
    "activityId",
    "id"
  ]);
  const state = Number(payload?.state);
  const status = Number(payload?.status);
  const resultCode = Number(payload?.resultCode);
  const explicitlyFailed = Number.isFinite(state) && state !== 1 && state !== 200 || Number.isFinite(status) && status >= 400 || Number.isFinite(resultCode) && resultCode !== 0 && resultCode !== 1 && resultCode !== 200;
  if (explicitlyFailed || !data || responseActivityId !== null && responseActivityId !== Number(activityId)) {
    const message = String(payload?.msg || payload?.message || "").trim();
    throw new Error(message || `\u79C0\u52A8\u6D3B\u52A8\u8BFB\u53D6\u5931\u8D25\uFF1A${activityId}`);
  }
  return data;
}
function normalizeShowstartActivity(detail) {
  const record = detail || {};
  const activityId = pickNumber(record, ["activityId", "id"]);
  if (!activityId) {
    throw new Error("\u79C0\u52A8\u6D3B\u52A8\u6570\u636E\u91CC\u6CA1\u6709\u6709\u6548\u7684 activityId\u3002");
  }
  const title = pickString2(record, ["activityName", "title", "activityTitle"]) || `\u79C0\u52A8\u6D3B\u52A8 ${activityId}`;
  const releaseDate = normalizeShowstartDate(record);
  const summary = normalizeSummaryText(
    pickString2(record, ["document", "description", "content", "remark", "summary"])
  );
  const { venueName, venueAddress, venueText } = pickShowstartVenue(record);
  return {
    showstart_activity_id: activityId,
    showstart_url: normalizeShowstartActivityUrl(activityId),
    title,
    title_original: "",
    aliases: [],
    media_type: "",
    release_date: releaseDate,
    release_year: extractYear(releaseDate),
    cover_remote: pickShowstartCover(record),
    summary,
    platforms: [],
    platforms_text: "",
    venue_name: venueName,
    venue_address: venueAddress,
    venue_text: venueText
  };
}

// src/sources/showstart-v3.ts
var import_crypto = require("crypto");
var SHOWSTART_V3_BASE = "https://wap.showstart.com/v3";
var SHOWSTART_APP_ID = "wap";
var SHOWSTART_VERSION = "997";
var SHOWSTART_DEVICE_INFO = encodeURI(
  JSON.stringify({
    vendorName: "",
    deviceMode: "",
    deviceName: "",
    systemName: "",
    systemVersion: "",
    cpuMode: " ",
    cpuCores: "",
    cpuArch: "",
    memerySize: "",
    diskSize: "",
    network: "WIFI",
    resolution: "1920*1080",
    pixelResolution: ""
  })
);
function md5Hex(value) {
  return (0, import_crypto.createHash)("md5").update(value).digest("hex");
}
function createShowstartDeviceToken() {
  return md5Hex((0, import_crypto.randomBytes)(16).toString("hex")).toLowerCase();
}
function createShowstartTraceId() {
  const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let output = "";
  for (let index = 0; index < 32; index += 1) {
    output += charset[Math.floor(Math.random() * charset.length)];
  }
  return `${output}${Date.now()}`;
}
function normalizeHeaderValue(value) {
  return value || "nil";
}
function buildShowstartV3Request(path5, body, auth = {}) {
  const bodyString = JSON.stringify(body);
  const deviceToken = auth.deviceToken || createShowstartDeviceToken();
  const traceId = auth.traceId || createShowstartTraceId();
  const accessToken = auth.accessToken || "";
  const idToken = auth.idToken || "";
  const userId = auth.userId || "";
  const headers = {
    CUSAT: normalizeHeaderValue(accessToken),
    CUSUT: "nil",
    CUSIT: normalizeHeaderValue(idToken),
    CUSID: normalizeHeaderValue(userId),
    CUSNAME: "nil",
    CTERMINAL: SHOWSTART_APP_ID,
    CSAPPID: SHOWSTART_APP_ID,
    CDEVICENO: deviceToken,
    CUUSERREF: deviceToken,
    CVERSION: SHOWSTART_VERSION,
    CDEVICEINFO: SHOWSTART_DEVICE_INFO,
    CRTRACEID: traceId,
    CTRACKPATH: "",
    CSOURCEPATH: "",
    CRPSIGN: md5Hex(
      `${accessToken}${""}${idToken}${userId}${SHOWSTART_APP_ID}${deviceToken}${bodyString}${path5}${SHOWSTART_VERSION}${SHOWSTART_APP_ID}${traceId}`
    )
  };
  return {
    url: `${SHOWSTART_V3_BASE}${path5}`,
    body: bodyString,
    headers,
    traceId
  };
}
function extractShowstartAnonymousAuth(payload, deviceToken = "") {
  const state = Number(payload?.state);
  const result = payload?.result;
  const accessToken = String(result?.accessToken?.access_token || "").trim();
  const idToken = String(result?.idToken?.id_token || "").trim();
  const expireSeconds = Number(result?.accessToken?.expire);
  const message = String(payload?.msg || payload?.message || "").trim();
  if (state !== 1 || !accessToken) {
    throw new Error(message || "\u79C0\u52A8\u533F\u540D\u4EE4\u724C\u83B7\u53D6\u5931\u8D25\u3002");
  }
  return {
    accessToken,
    idToken,
    userId: "",
    deviceToken: deviceToken || createShowstartDeviceToken(),
    expiresAt: Number.isFinite(expireSeconds) && expireSeconds > 0 ? expireSeconds * 1e3 : 0
  };
}

// src/sources/showstart-source.ts
var SHOWSTART_GETTOKEN_PATH = "/waf/gettoken";
var SHOWSTART_ACTIVITY_DETAILS_PATH = "/wap/activity/details";
var SHOWSTART_TOKEN_REFRESH_MARGIN_MS = 60 * 1e3;
var cachedShowstartAuth = null;
async function requestShowstartV3(path5, body, auth) {
  const request2 = buildShowstartV3Request(path5, body, auth || void 0);
  return requestJson(request2.url, {
    method: "POST",
    body: request2.body,
    headers: {
      "Content-Type": "application/json",
      ...request2.headers
    }
  });
}
function hasValidShowstartAuth(auth) {
  return Boolean(
    auth && auth.accessToken && auth.expiresAt && auth.expiresAt - SHOWSTART_TOKEN_REFRESH_MARGIN_MS > Date.now()
  );
}
async function fetchShowstartGuestAuth(forceRefresh = false) {
  if (!forceRefresh && hasValidShowstartAuth(cachedShowstartAuth)) {
    return cachedShowstartAuth;
  }
  const request2 = buildShowstartV3Request(SHOWSTART_GETTOKEN_PATH, {}, cachedShowstartAuth || void 0);
  const response = await requestJson(request2.url, {
    method: "POST",
    body: request2.body,
    headers: {
      "Content-Type": "application/json",
      ...request2.headers
    }
  });
  const nextAuth = extractShowstartAnonymousAuth(response, request2.headers.CDEVICENO);
  cachedShowstartAuth = {
    ...nextAuth
  };
  return cachedShowstartAuth;
}
function shouldRefreshShowstartAuth(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return message.includes("\u767B\u5F55\u8FC7\u671F") || message.includes("token-clean") || message.includes("token-expire") || message.includes("user_not_login");
}
async function requestShowstartActivity(activityId, auth) {
  return requestShowstartV3(
    SHOWSTART_ACTIVITY_DETAILS_PATH,
    {
      activityId,
      coupon: "",
      shareId: "",
      previewPwd: "",
      terminal: "wap",
      trackPath: ""
    },
    auth
  );
}
async function fetchShowstartActivity(activityId) {
  let auth = await fetchShowstartGuestAuth();
  try {
    const response2 = await requestShowstartActivity(activityId, auth);
    return unwrapShowstartActivityResponse(response2, activityId);
  } catch (error) {
    if (!shouldRefreshShowstartAuth(error)) {
      throw error;
    }
  }
  cachedShowstartAuth = null;
  auth = await fetchShowstartGuestAuth(true);
  const response = await requestShowstartActivity(activityId, auth);
  return unwrapShowstartActivityResponse(response, activityId);
}
var showstartSource = {
  id: "showstart",
  label: "\u79C0\u52A8",
  commandId: "create-showstart-card",
  commandName: "\u4ECE\u79C0\u52A8\u65B0\u5EFA\u4F5C\u54C1\u5361\u7247",
  inputTitle: "\u4ECE\u79C0\u52A8\u65B0\u5EFA\u4F5C\u54C1\u5361\u7247",
  inputHint: "\u8D34\u79C0\u52A8\u6D3B\u52A8\u8BE6\u60C5\u9875\u94FE\u63A5\uFF0C\u63D2\u4EF6\u4F1A\u76F4\u63A5\u8BFB\u53D6\u6D3B\u52A8\u8BE6\u60C5\u3002",
  inputPlaceholder: "\u4F8B\u5982\uFF1Ahttps://wap.showstart.com/pages/activity/detail/detail?activityId=208747",
  parseDirectInput: parseShowstartActivityId,
  fetchByDirectInput: (activityId) => fetchShowstartActivity(activityId),
  normalize: normalizeShowstartActivity
};

// src/sources/index.ts
var MEDIA_SOURCES = [
  bangumiSource,
  mobygamesSource,
  bilibiliShowSource,
  showstartSource
];
var MEDIA_SOURCE_MAP = {
  bangumi: bangumiSource,
  mobygames: mobygamesSource,
  bilibili_show: bilibiliShowSource,
  showstart: showstartSource
};

// src/plugin.ts
init_template_fields();

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
    new import_obsidian2.Setting(contentEl).setName(this.options.fieldLabel || "\u4F5C\u54C1\u540D\u3001\u94FE\u63A5\u6216 ID").addText((text) => {
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
function formatConflictValue(value) {
  if (Array.isArray(value)) {
    return value.length ? value.map((item) => `- ${String(item || "")}`).join("\n") : "(\u7A7A)";
  }
  if (value === null || typeof value === "undefined") {
    return "(\u7A7A)";
  }
  const normalized = String(value).trim();
  return normalized || "(\u7A7A)";
}
var BangumiRefreshConflictModal = class extends import_obsidian2.Modal {
  constructor(app, conflict) {
    super(app);
    this.conflict = conflict;
    this.result = null;
    this.resolved = false;
    this.setTitle(`\u5B57\u6BB5\u51B2\u7A81\uFF1A${conflict.propertyKey}`);
  }
  openAndWait() {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.open();
    });
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("p", {
      text: `\u5F53\u524D\u7B14\u8BB0\u548C\u6700\u65B0 Bangumi \u6570\u636E\u5728\u201C${this.conflict.propertyKey}\u201D\u4E0A\u4E0D\u4E00\u81F4\uFF0C\u8BF7\u9009\u62E9\u4FDD\u7559\u54EA\u4E00\u8FB9\u3002`
    });
    new import_obsidian2.Setting(contentEl).setName("\u5F53\u524D\u503C");
    contentEl.createEl("pre", {
      text: formatConflictValue(this.conflict.currentValue),
      cls: "mz-media-fetcher-conflict-value"
    });
    new import_obsidian2.Setting(contentEl).setName("\u6293\u53D6\u503C");
    contentEl.createEl("pre", {
      text: formatConflictValue(this.conflict.fetchedValue),
      cls: "mz-media-fetcher-conflict-value"
    });
    const actions = new import_obsidian2.Setting(contentEl);
    actions.addButton((button) => {
      button.setButtonText("\u4FDD\u7559\u5F53\u524D\u503C");
      button.onClick(() => this.closeWith("keep"));
    });
    actions.addButton((button) => {
      button.setButtonText("\u4F7F\u7528\u6293\u53D6\u503C");
      button.setCta();
      button.onClick(() => this.closeWith("replace"));
    });
  }
  onClose() {
    this.contentEl.empty();
    if (!this.resolved && this.resolvePromise) {
      this.resolvePromise(this.result);
      this.resolved = true;
    }
  }
  closeWith(result) {
    this.result = result;
    if (!this.resolved && this.resolvePromise) {
      this.resolvePromise(this.result);
      this.resolved = true;
    }
    this.close();
  }
};

// src/ui/settings.ts
var import_obsidian4 = require("obsidian");
init_defaults();

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
var BANGUMI_TEMPLATE_TYPE_LABELS = {
  game: "\u6E38\u620F\u6A21\u677F",
  anime: "\u52A8\u753B\u6A21\u677F",
  book: "\u4E66\u7C4D\u6A21\u677F",
  liveAction: "\u4E09\u6B21\u5143\u6A21\u677F"
};
async function copyTextToClipboard(text) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    const copied = document.execCommand("copy");
    if (!copied) {
      throw new Error("\u5F53\u524D\u73AF\u5883\u4E0D\u652F\u6301\u76F4\u63A5\u5199\u5165\u526A\u8D34\u677F\u3002");
    }
  } finally {
    document.body.removeChild(textarea);
  }
}
function createTemplateEditorState(config) {
  return {
    targetFolder: config.targetFolder,
    templatePath: config.templatePath,
    searchLimit: String(config.searchLimit),
    typeTemplatePaths: config.typeTemplatePaths ? { ...config.typeTemplatePaths } : void 0,
    posterSaveLocal: config.poster.saveLocal,
    posterFolder: config.poster.folder,
    filenameTemplate: config.filename.template,
    filenameCollisionTemplate: config.filename.collisionTemplate
  };
}
var MZMediaFetcherSettingTab = class extends import_obsidian4.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.activeSourceId = MEDIA_SOURCES[0]?.id || "bangumi";
    this.sourceStates = null;
    this.defaultSourceConfigs = null;
    this.defaultPosterFolder = "";
  }
  display() {
    void this.render(true);
  }
  async render(refreshFromDisk = false) {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian4.Setting(containerEl).setName(PLUGIN_NAME).setHeading();
    containerEl.createDiv({ cls: "mz-media-fetcher-intro" }).createEl("p", {
      text: "\u6309\u6765\u6E90\u7BA1\u7406\u4F5C\u54C1\u6293\u53D6\u914D\u7F6E\u3002\u6A21\u677F\u6B63\u6587\u7EE7\u7EED\u76F4\u63A5\u6539\u6A21\u677F\u6587\u4EF6\uFF1B\u8FD9\u91CC\u8D1F\u8D23\u6765\u6E90\u80FD\u529B\u8BF4\u660E\u3001\u57FA\u7840\u8BBE\u7F6E\u548C\u9ED8\u8BA4\u6A21\u677F\u5DE5\u5177\u3002"
    });
    const vaultInfo = this.plugin.configStore.getVaultInfo();
    if (!vaultInfo) {
      containerEl.createEl("p", { text: "\u5F53\u524D vault \u4E0D\u652F\u6301\u672C\u5730\u63D2\u4EF6\u914D\u7F6E\u8DEF\u5F84\u3002" });
      return;
    }
    try {
      if (refreshFromDisk || !this.sourceStates || !this.defaultSourceConfigs) {
        await this.loadSourceStates(vaultInfo.path);
      }
    } catch (error) {
      containerEl.createEl("p", {
        text: `\u8BFB\u53D6\u914D\u7F6E\u5931\u8D25\uFF1A${this.plugin.normalizeError(error)}`
      });
      return;
    }
    if (!this.sourceStates || !this.defaultSourceConfigs) {
      containerEl.createEl("p", { text: "\u5F53\u524D\u8FD8\u6CA1\u6709\u53EF\u7528\u7684\u6765\u6E90\u914D\u7F6E\u3002" });
      return;
    }
    if (!this.sourceStates[this.activeSourceId]) {
      this.activeSourceId = MEDIA_SOURCES[0]?.id || "bangumi";
    }
    this.renderTabs(containerEl);
    const source = MEDIA_SOURCES.find((item) => item.id === this.activeSourceId) || MEDIA_SOURCES[0];
    const state = this.sourceStates[source.id];
    const defaultConfig = this.defaultSourceConfigs[source.id];
    await this.renderSourceSection(containerEl, source.id, source.label, state, defaultConfig);
  }
  async loadSourceStates(vaultBasePath) {
    const [normalizedConfigs, defaultSourceConfigs, defaultPosterFolder] = await Promise.all([
      this.plugin.configStore.loadSourceConfigs(vaultBasePath),
      this.plugin.configStore.getResolvedDefaultSourceConfigs(vaultBasePath),
      this.plugin.configStore.getDefaultPosterFolder(vaultBasePath)
    ]);
    this.sourceStates = MEDIA_SOURCES.reduce((result, source) => {
      result[source.id] = createTemplateEditorState(normalizedConfigs[source.id]);
      return result;
    }, {});
    this.defaultSourceConfigs = defaultSourceConfigs;
    this.defaultPosterFolder = defaultPosterFolder;
  }
  renderTabs(containerEl) {
    const tabsEl = containerEl.createDiv({ cls: "mz-media-fetcher-tabs" });
    for (const source of MEDIA_SOURCES) {
      const buttonEl = tabsEl.createEl("button", { text: source.label });
      const isActive = source.id === this.activeSourceId;
      buttonEl.type = "button";
      buttonEl.disabled = isActive;
      if (isActive) {
        buttonEl.classList.add("mod-cta");
      }
      buttonEl.addEventListener("click", () => {
        this.activeSourceId = source.id;
        void this.render(false);
      });
    }
  }
  async renderSourceSection(containerEl, sourceKey, label, state, defaultConfig) {
    const sectionEl = containerEl.createDiv({ cls: "mz-media-fetcher-section" });
    const sourceMeta = MEDIA_SOURCE_UI_META_MAP[sourceKey];
    new import_obsidian4.Setting(sectionEl).setName(label).setHeading();
    this.renderFeatureNotes(sectionEl, sourceMeta.featureNotes);
    new import_obsidian4.Setting(sectionEl).setName("\u76EE\u6807\u76EE\u5F55").setDesc("\u65B0\u5EFA\u5361\u7247\u65F6\u5199\u5165\u7684\u7B14\u8BB0\u76EE\u5F55\u3002").addText((text) => {
      new FolderPathSuggest(this.app, text.inputEl);
      text.setPlaceholder(defaultConfig.targetFolder || "\u4F8B\u5982\uFF1A00-Inbox");
      text.setValue(state.targetFolder);
      text.onChange((value) => {
        state.targetFolder = value;
      });
    });
    new import_obsidian4.Setting(sectionEl).setName("\u6A21\u677F\u8DEF\u5F84").setDesc("\u6A21\u677F\u6587\u4EF6\u5728 vault \u5185\u7684\u76F8\u5BF9\u8DEF\u5F84\u3002").addText((text) => {
      new TemplatePathSuggest(this.app, text.inputEl);
      text.setPlaceholder(defaultConfig.templatePath);
      text.setValue(state.templatePath);
      text.onChange((value) => {
        state.templatePath = value;
      });
    });
    if (sourceKey === "bangumi" && state.typeTemplatePaths && defaultConfig.typeTemplatePaths) {
      for (const templateType of Object.keys(state.typeTemplatePaths)) {
        new import_obsidian4.Setting(sectionEl).setName(BANGUMI_TEMPLATE_TYPE_LABELS[templateType]).setDesc(
          `Bangumi \u5A92\u4F53\u7C7B\u578B\u662F\u201C${labelForBangumiType(templateType)}\u201D\u65F6\u4F18\u5148\u4F7F\u7528\uFF1B\u7559\u7A7A\u4F1A\u56DE\u9000\u5230\u4E0A\u9762\u7684\u901A\u7528\u6A21\u677F\u8DEF\u5F84\u3002`
        ).addText((text) => {
          new TemplatePathSuggest(this.app, text.inputEl);
          text.setPlaceholder(defaultConfig.typeTemplatePaths?.[templateType] || "");
          text.setValue(state.typeTemplatePaths?.[templateType] || "");
          text.onChange((value) => {
            if (!state.typeTemplatePaths) {
              state.typeTemplatePaths = {
                ...defaultConfig.typeTemplatePaths
              };
            }
            state.typeTemplatePaths[templateType] = value;
          });
        });
      }
    }
    if (sourceMeta.supportsSearch) {
      new import_obsidian4.Setting(sectionEl).setName("\u641C\u7D22\u6761\u76EE\u6570").setDesc("\u641C\u7D22\u65F6\u6700\u591A\u5C55\u793A\u591A\u5C11\u4E2A\u5019\u9009\u6761\u76EE\u3002").addText((text) => {
        text.setPlaceholder(String(defaultConfig.searchLimit));
        text.setValue(state.searchLimit);
        text.onChange((value) => {
          state.searchLimit = value;
        });
      });
    }
    new import_obsidian4.Setting(sectionEl).setName("\u6D77\u62A5\u5B58\u672C\u5730").setDesc("\u5F00\u542F\u540E\u4F1A\u628A\u8FDC\u7A0B\u6D77\u62A5\u4E0B\u8F7D\u5230 vault \u5185\uFF0C\u5E76\u5728\u5361\u7247\u91CC\u6539\u7528\u672C\u5730\u8DEF\u5F84\u3002").addToggle((toggle) => {
      toggle.setValue(state.posterSaveLocal);
      toggle.onChange((value) => {
        state.posterSaveLocal = value;
      });
    });
    new import_obsidian4.Setting(sectionEl).setName("\u672C\u5730\u6D77\u62A5\u76EE\u5F55").setDesc(
      `\u5F00\u542F\u201C\u6D77\u62A5\u5B58\u672C\u5730\u201D\u540E\uFF0C\u6D77\u62A5\u6587\u4EF6\u5199\u5165\u7684 vault \u76F8\u5BF9\u76EE\u5F55\u3002\u7559\u7A7A\u65F6\u4F1A\u9ED8\u8BA4\u8DDF\u968F Obsidian \u9644\u4EF6\u76EE\u5F55\uFF1A${this.defaultPosterFolder || defaultConfig.poster.folder || "\u672A\u914D\u7F6E"}\u3002`
    ).addText((text) => {
      new FolderPathSuggest(this.app, text.inputEl);
      text.setPlaceholder(defaultConfig.poster.folder || "\u4F8B\u5982\uFF1A50-Others/\u9644\u4EF6");
      text.setValue(state.posterFolder);
      text.onChange((value) => {
        state.posterFolder = value;
      });
    });
    new import_obsidian4.Setting(sectionEl).setName("\u6587\u4EF6\u540D\u6A21\u677F").setDesc("\u7B2C\u4E00\u6B21\u5C1D\u8BD5\u521B\u5EFA\u7B14\u8BB0\u65F6\u4F7F\u7528\u7684\u6587\u4EF6\u540D\u6A21\u677F\uFF1B\u751F\u6210\u7ED3\u679C\u4F1A\u81EA\u52A8\u628A\u7A7A\u683C\u6539\u6210\u77ED\u6A2A\u7EBF\u3002").addText((text) => {
      text.setPlaceholder(defaultConfig.filename.template);
      text.setValue(state.filenameTemplate);
      text.onChange((value) => {
        state.filenameTemplate = value;
      });
    });
    new import_obsidian4.Setting(sectionEl).setName("\u91CD\u540D\u6587\u4EF6\u540D\u6A21\u677F").setDesc("\u9047\u5230\u540C\u540D\u6587\u4EF6\u65F6\u4F7F\u7528\u7684\u5907\u7528\u6A21\u677F\uFF1B\u91CD\u590D\u540E\u7F00\u4F1A\u81EA\u52A8\u5199\u6210 -2\u3001-3\u3002").addText((text) => {
      text.setPlaceholder(defaultConfig.filename.collisionTemplate);
      text.setValue(state.filenameCollisionTemplate);
      text.onChange((value) => {
        state.filenameCollisionTemplate = value;
      });
    });
    new import_obsidian4.Setting(sectionEl).setName("\u9ED8\u8BA4\u6A21\u677F").setDesc("\u590D\u5236\u63D2\u4EF6\u5185\u7F6E\u9ED8\u8BA4\u6A21\u677F\u539F\u6587\u5230\u526A\u8D34\u677F\uFF0C\u65B9\u4FBF\u76F4\u63A5\u6539\u6210\u81EA\u5DF1\u7684\u6A21\u677F\u3002").addButton((button) => {
      button.setButtonText("\u590D\u5236\u9ED8\u8BA4\u6A21\u677F");
      button.onClick(async () => {
        try {
          await copyTextToClipboard(TEMPLATE_CONTENTS[sourceKey]);
          new import_obsidian4.Notice(`${label} \u9ED8\u8BA4\u6A21\u677F\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F\u3002`, 5e3);
        } catch (error) {
          new import_obsidian4.Notice(`\u590D\u5236\u5931\u8D25\uFF1A${this.plugin.normalizeError(error)}`, 12e3);
        }
      });
    });
    this.renderTemplateVariables(sectionEl, sourceMeta.templateVariables);
    const actions = new import_obsidian4.Setting(sectionEl).setName("\u4FDD\u5B58");
    actions.addButton((button) => {
      button.setButtonText("\u4FDD\u5B58\u914D\u7F6E");
      button.setCta();
      button.onClick(async () => {
        try {
          const result = normalizeTemplateEditorValues(
            sourceKey,
            state,
            this.defaultSourceConfigs || void 0
          );
          await this.plugin.configStore.saveTemplateSourceConfig(sourceKey, result);
          this.sourceStates = {
            ...this.sourceStates || {},
            [sourceKey]: createTemplateEditorState(result)
          };
          new import_obsidian4.Notice(`${label} \u914D\u7F6E\u5DF2\u4FDD\u5B58\u3002`, 5e3);
          await this.render(true);
        } catch (error) {
          new import_obsidian4.Notice(`\u4FDD\u5B58\u5931\u8D25\uFF1A${this.plugin.normalizeError(error)}`, 12e3);
        }
      });
    });
  }
  renderFeatureNotes(containerEl, notes) {
    new import_obsidian4.Setting(containerEl).setName("\u652F\u6301\u7684\u529F\u80FD").setHeading();
    const listEl = containerEl.createEl("ul", { cls: "mz-media-fetcher-list" });
    for (const note of notes) {
      listEl.createEl("li", { text: note });
    }
  }
  renderTemplateVariables(containerEl, variables) {
    new import_obsidian4.Setting(containerEl).setName("\u652F\u6301\u7684\u6A21\u677F\u53C2\u6570").setHeading();
    containerEl.createEl("p", {
      text: "\u6BCF\u4E2A\u53C2\u6570\u90FD\u53EF\u4EE5\u76F4\u63A5\u5199\u8FDB\u6A21\u677F\uFF1B\u652F\u6301 yaml \u7248\u672C\u7684\uFF0C\u4F1A\u540C\u65F6\u63D0\u4F9B {{yaml.xxx}} \u8FD9\u79CD YAML \u5B89\u5168\u5199\u6CD5\u3002"
    });
    const listEl = containerEl.createEl("ul", { cls: "mz-media-fetcher-list" });
    for (const variable of variables) {
      const itemEl = listEl.createEl("li");
      itemEl.createEl("code", { text: `{{${variable.key}}}` });
      if (variable.yamlSafe !== false) {
        itemEl.appendText(" / ");
        itemEl.createEl("code", { text: `{{yaml.${variable.key}}}` });
      }
      itemEl.appendText(`\uFF1A${variable.description}`);
    }
  }
};
function labelForBangumiType(templateType) {
  const labels = {
    game: "\u6E38\u620F",
    anime: "\u52A8\u753B",
    book: "\u4E66\u7C4D",
    liveAction: "\u4E09\u6B21\u5143"
  };
  return labels[templateType];
}

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
    this.addCommand({
      id: "refresh-current-bangumi-note",
      name: "\u91CD\u65B0\u8865\u5168\u5F53\u524D\u7B14\u8BB0\u7684 Bangumi \u4FE1\u606F",
      callback: () => this.refreshCurrentBangumiNote()
    });
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
  async refreshCurrentBangumiNote() {
    if (this.isRunning) {
      new import_obsidian5.Notice("\u5F53\u524D\u5DF2\u6709\u6293\u53D6\u4EFB\u52A1\u5728\u8FDB\u884C\u4E2D\u3002", 5e3);
      return;
    }
    const vaultInfo = this.configStore.getVaultInfo();
    if (!vaultInfo) {
      new import_obsidian5.Notice("\u5F53\u524D vault \u4E0D\u652F\u6301\u672C\u5730\u63D2\u4EF6\u914D\u7F6E\u8DEF\u5F84\u3002", 8e3);
      return;
    }
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile || activeFile.extension !== "md") {
      new import_obsidian5.Notice("\u8BF7\u5148\u6253\u5F00\u4E00\u7BC7\u8981\u8865\u5168\u7684 Markdown \u7B14\u8BB0\u3002", 8e3);
      return;
    }
    this.isRunning = true;
    try {
      const sourceConfigs = await this.configStore.loadSourceConfigs(vaultInfo.path);
      const bangumiConfig = sourceConfigs.bangumi;
      const rawContent = await this.app.vault.cachedRead(activeFile);
      const frontmatterBlock = extractFrontmatterBlock(rawContent);
      if (!frontmatterBlock) {
        throw new Error("\u5F53\u524D\u7B14\u8BB0\u6CA1\u6709 frontmatter\uFF0C\u65E0\u6CD5\u91CD\u65B0\u8865\u5168 Bangumi \u4FE1\u606F\u3002");
      }
      const existingFrontmatter = sanitizeFrontmatterObject(
        this.app.metadataCache.getFileCache(activeFile)?.frontmatter || {}
      );
      const templateBindingGroups = await this.loadBangumiTemplateBindingGroups(
        vaultInfo.path,
        bangumiConfig
      );
      const candidateValues = collectBangumiTemplateValueCandidates(
        existingFrontmatter,
        templateBindingGroups
      );
      const subjectId = this.resolveCurrentBangumiSubjectId(candidateValues);
      if (!subjectId) {
        throw new Error("\u5F53\u524D\u7B14\u8BB0\u6CA1\u6709\u53EF\u8BC6\u522B\u7684 bangumi_id \u6216 bangumi_url\u3002");
      }
      const bangumiSource2 = MEDIA_SOURCE_MAP.bangumi;
      const detail = await bangumiSource2.fetchByDirectInput(subjectId, bangumiConfig);
      const normalizedItem = bangumiSource2.normalize(detail);
      const templateBindings = await this.readTemplateBindings(
        vaultInfo.path,
        bangumiConfig,
        normalizedItem
      );
      const fetchedValues = this.buildBangumiFetchedValues(normalizedItem);
      const analysis = analyzeBangumiFrontmatterUpdate({
        templateBindings,
        existingFrontmatter,
        existingKeyOrder: listFrontmatterKeys(frontmatterBlock.frontmatter),
        fetchedValues
      });
      const decisions = await this.collectBangumiConflictDecisions(analysis.conflicts);
      if (decisions === null) {
        new import_obsidian5.Notice("\u5DF2\u53D6\u6D88\uFF0C\u672A\u4FEE\u6539\u5F53\u524D\u7B14\u8BB0\u3002", 4e3);
        return;
      }
      const nextEntries = buildBangumiFrontmatterEntries(analysis, decisions);
      const nextContent = replaceFrontmatter(rawContent, nextEntries);
      const normalizedCurrentContent = rawContent.replace(/\r\n/g, "\n");
      if (nextContent === normalizedCurrentContent) {
        new import_obsidian5.Notice("\u5F53\u524D Bangumi \u4FE1\u606F\u5DF2\u7ECF\u662F\u6700\u65B0\u7684\u3002", 5e3);
        return;
      }
      await this.app.vault.modify(activeFile, nextContent);
      new import_obsidian5.Notice(`Bangumi \u4FE1\u606F\u5DF2\u8865\u5168\uFF1A${normalizedItem.title}`, 8e3);
    } catch (error) {
      console.error(`[${PLUGIN_ID}]`, error);
      new import_obsidian5.Notice(`\u8865\u5168 Bangumi \u4FE1\u606F\u5931\u8D25\uFF1A${normalizeError(error)}`, 12e3);
    } finally {
      this.isRunning = false;
    }
  }
  async runCreateFlow(source) {
    const sourceMeta = MEDIA_SOURCE_UI_META_MAP[source.id];
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
        placeholder: source.inputPlaceholder,
        fieldLabel: sourceMeta?.inputFieldLabel
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
      } else if (sourceMeta?.supportsSearch && source.search && source.fetchBySearchItem && source.toSuggestItem) {
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
        throw new Error(`${source.label} \u76EE\u524D\u53EA\u652F\u6301\u76F4\u63A5\u8F93\u5165\u6307\u5B9A\u8BE6\u60C5\u94FE\u63A5\u6216 ID\u3002`);
      }
      const normalizedItem = source.normalize(detail);
      const card = await buildCard(this.app, vaultInfo, source.id, normalizedItem, sourceConfig);
      await ensureFolderExists(this.app.vault, card.folderPath);
      const file = await this.app.vault.create(card.filePath, card.content);
      await this.app.workspace.getLeaf(true).openFile(file);
      new import_obsidian5.Notice(`\u4F5C\u54C1\u5361\u7247\u5DF2\u521B\u5EFA\uFF1A${normalizedItem.title}`, 8e3);
    } catch (error) {
      console.error(`[${PLUGIN_ID}]`, error);
      new import_obsidian5.Notice(`\u65B0\u5EFA\u4F5C\u54C1\u5361\u7247\u5931\u8D25\uFF1A${normalizeError(error)}`, 12e3);
    } finally {
      this.isRunning = false;
    }
  }
  buildBangumiFetchedValues(item) {
    const context = buildTemplateContext("bangumi", item);
    return BANGUMI_REFRESH_MANAGED_VARIABLES.reduce((result, key) => {
      result[key] = context[key];
      return result;
    }, {});
  }
  resolveCurrentBangumiSubjectId(candidateValues) {
    const literalId = Number(candidateValues.bangumi_id);
    if (Number.isInteger(literalId) && literalId > 0) {
      return literalId;
    }
    return parseBangumiSubjectId(String(candidateValues.bangumi_url || ""));
  }
  async loadBangumiTemplateBindingGroups(vaultBasePath, config) {
    const templatePaths = [config.templatePath];
    for (const templatePath of Object.values(config.typeTemplatePaths || {})) {
      if (templatePath && !templatePaths.includes(templatePath)) {
        templatePaths.push(templatePath);
      }
    }
    return Promise.all(
      templatePaths.map(async (templatePath) => {
        const absolutePath = import_path4.default.join(vaultBasePath, normalizeVaultPath(templatePath));
        const template = await import_promises4.default.readFile(absolutePath, "utf8");
        return parseTemplateFrontmatterBindings(template);
      })
    );
  }
  async readTemplateBindings(vaultBasePath, config, item) {
    const relativePath = this.resolveBangumiTemplatePath(config, item);
    const absolutePath = import_path4.default.join(vaultBasePath, normalizeVaultPath(relativePath));
    const template = await import_promises4.default.readFile(absolutePath, "utf8");
    return parseTemplateFrontmatterBindings(template);
  }
  resolveBangumiTemplatePath(config, item) {
    const mediaType = String(item.media_type || "").trim();
    if (!config.typeTemplatePaths) {
      return config.templatePath;
    }
    if (mediaType === "\u6E38\u620F") {
      return config.typeTemplatePaths.game || config.templatePath;
    }
    if (mediaType === "\u52A8\u753B") {
      return config.typeTemplatePaths.anime || config.templatePath;
    }
    if (mediaType === "\u4E66\u7C4D") {
      return config.typeTemplatePaths.book || config.templatePath;
    }
    if (mediaType === "\u4E09\u6B21\u5143") {
      return config.typeTemplatePaths.liveAction || config.templatePath;
    }
    return config.templatePath;
  }
  async collectBangumiConflictDecisions(conflicts) {
    const decisions = {};
    for (const conflict of conflicts) {
      const decision = await new BangumiRefreshConflictModal(this.app, conflict).openAndWait();
      if (!decision) {
        return null;
      }
      decisions[conflict.propertyKey] = decision;
    }
    return decisions;
  }
};

// src/main.ts
var main_default = MZMediaFetcherPlugin;
