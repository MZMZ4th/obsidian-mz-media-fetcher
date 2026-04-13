import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import type { App } from "obsidian";
import {
  DEFAULT_SOURCE_CONFIGS,
  PLUGIN_ID,
  TEMPLATE_CONTENTS,
  getDefaultSourceConfigs,
} from "./defaults.ts";
import { ensureJsonFile, ensureTextFile } from "../core/files.ts";
import type { SourceConfig, SourceConfigRoot, SourceId, VaultInfo } from "../types.ts";

function normalizePlainRelativePath(value: unknown): string {
  return String(value || "")
    .replace(/\\/g, "/")
    .trim()
    .replace(/^\/+|\/+$/g, "");
}

function normalizeVaultRelativePath(value: unknown): string {
  const normalized = normalizePlainRelativePath(value);
  if (!normalized) {
    throw new Error("模板路径不能为空。");
  }
  return normalized;
}

function normalizeSearchLimit(value: unknown, fallback: number): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 1) {
    return Math.max(1, Number(fallback) || 1);
  }
  return Math.max(1, Math.round(numeric));
}

function buildTemplateModeSourceConfig(raw: any, defaults: SourceConfig): SourceConfig {
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
      ).trim(),
    },
  };
}

function normalizeSourceConfig(raw: any, sourceKey: SourceId, defaults: SourceConfigRoot): SourceConfig {
  return buildTemplateModeSourceConfig(raw, defaults[sourceKey]);
}

function normalizeSourceConfigs(raw: any, defaults: SourceConfigRoot): SourceConfigRoot {
  if (!raw || typeof raw !== "object") {
    throw new Error("作品抓取配置格式不对。");
  }

  return {
    bangumi: normalizeSourceConfig(raw.bangumi, "bangumi", defaults),
    mobygames: normalizeSourceConfig(raw.mobygames, "mobygames", defaults),
  };
}

function buildConfigRootFromUnknown(raw: any, defaults: SourceConfigRoot): SourceConfigRoot {
  return {
    bangumi: buildTemplateModeSourceConfig(raw?.bangumi, defaults.bangumi),
    mobygames: buildTemplateModeSourceConfig(raw?.mobygames, defaults.mobygames),
  };
}

export function normalizeTemplateEditorValues(
  sourceKey: SourceId,
  state: {
    targetFolder: string;
    templatePath: string;
    searchLimit: string;
    filenameTemplate: string;
    filenameCollisionTemplate: string;
  }
): SourceConfig {
  const defaults = DEFAULT_SOURCE_CONFIGS[sourceKey];
  const targetFolder = normalizePlainRelativePath(state.targetFolder || defaults.targetFolder);
  const templatePath = normalizeVaultRelativePath(state.templatePath || defaults.templatePath);
  const searchLimit = normalizeSearchLimit(state.searchLimit, defaults.searchLimit);
  const filenameTemplate = String(state.filenameTemplate || defaults.filename.template).trim();
  const filenameCollisionTemplate = String(
    state.filenameCollisionTemplate || defaults.filename.collisionTemplate
  ).trim();

  if (!filenameTemplate) {
    throw new Error("文件名模板不能为空。");
  }

  if (!filenameCollisionTemplate) {
    throw new Error("重名文件名模板不能为空。");
  }

  return {
    targetFolder,
    templatePath,
    searchLimit,
    filename: {
      template: filenameTemplate,
      collisionTemplate: filenameCollisionTemplate,
    },
  };
}

export class ConfigStore {
  app: App;

  constructor(app: App) {
    this.app = app;
  }

  getVaultInfo(): VaultInfo | null {
    const adapter = this.app.vault.adapter as any;
    if (!adapter || typeof adapter.getBasePath !== "function") {
      return null;
    }

    return {
      name: this.app.vault.getName(),
      path: adapter.getBasePath(),
    };
  }

  getPluginFilePath(fileName: string): string {
    const vaultInfo = this.getVaultInfo();
    if (!vaultInfo) {
      throw new Error("当前 vault 不支持插件配置路径。");
    }

    const configDir = (this.app.vault as any)?.configDir || ".obsidian";
    return path.join(vaultInfo.path, configDir, "plugins", PLUGIN_ID, fileName);
  }

  getDefaultSourceConfigs(): SourceConfigRoot {
    const configDir = (this.app.vault as any)?.configDir || ".obsidian";
    return getDefaultSourceConfigs(configDir);
  }

  async ensureDefaultFiles(vaultBasePath: string): Promise<void> {
    const defaults = this.getDefaultSourceConfigs();
    const configPath = this.getPluginFilePath("media-fetcher-rules.json");

    try {
      await fsp.access(configPath, fs.constants.F_OK);
    } catch (error: any) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
      const initialConfig = await this.buildInitialConfig(vaultBasePath);
      await ensureJsonFile(configPath, initialConfig);
    }

    for (const sourceKey of Object.keys(defaults) as SourceId[]) {
      await this.ensureTemplateExists(
        vaultBasePath,
        defaults[sourceKey].templatePath,
        TEMPLATE_CONTENTS[sourceKey]
      );
    }
  }

  async ensureTemplateExists(
    vaultBasePath: string,
    relativePath: string,
    content: string
  ): Promise<void> {
    const absolutePath = path.join(vaultBasePath, relativePath);
    await ensureTextFile(absolutePath, content);
  }

  async buildInitialConfig(vaultBasePath: string): Promise<SourceConfigRoot> {
    const defaults = this.getDefaultSourceConfigs();
    const configDir = (this.app.vault as any)?.configDir || ".obsidian";
    const legacyPath = path.join(
      vaultBasePath,
      configDir,
      "plugins",
      "MZ-organizer",
      "bangumi-card-rules.json"
    );

    let bangumi = defaults.bangumi;
    try {
      const raw = await fsp.readFile(legacyPath, "utf8");
      bangumi = buildTemplateModeSourceConfig(JSON.parse(raw), defaults.bangumi);
    } catch (_error) {
      bangumi = defaults.bangumi;
    }

    return {
      bangumi,
      mobygames: defaults.mobygames,
    };
  }

  async loadRawSourceConfigRoot(vaultBasePath: string): Promise<any> {
    await this.ensureDefaultFiles(vaultBasePath);
    const filePath = this.getPluginFilePath("media-fetcher-rules.json");

    let raw = "";
    try {
      raw = await fsp.readFile(filePath, "utf8");
    } catch (_error) {
      throw new Error("读取作品抓取配置失败：media-fetcher-rules.json");
    }

    try {
      return JSON.parse(raw);
    } catch (_error) {
      throw new Error("作品抓取配置不是合法 JSON：media-fetcher-rules.json");
    }
  }

  async writeSourceConfigRoot(raw: SourceConfigRoot): Promise<void> {
    const configPath = this.getPluginFilePath("media-fetcher-rules.json");
    await fsp.mkdir(path.dirname(configPath), { recursive: true });
    await fsp.writeFile(configPath, `${JSON.stringify(raw, null, 2)}\n`, "utf8");
  }

  async loadSourceConfigs(vaultBasePath: string): Promise<SourceConfigRoot> {
    const raw = await this.loadRawSourceConfigRoot(vaultBasePath);
    const defaults = this.getDefaultSourceConfigs();
    const migrated = buildConfigRootFromUnknown(raw, defaults);
    const normalized = normalizeSourceConfigs(migrated, defaults);

    if (JSON.stringify(raw, null, 2) !== JSON.stringify(migrated, null, 2)) {
      await this.writeSourceConfigRoot(migrated);
    }

    for (const sourceKey of Object.keys(normalized) as SourceId[]) {
      await this.ensureTemplateExists(
        vaultBasePath,
        normalized[sourceKey].templatePath,
        TEMPLATE_CONTENTS[sourceKey]
      );
    }

    return normalized;
  }

  async saveTemplateSourceConfig(sourceKey: SourceId, values: SourceConfig): Promise<void> {
    const vaultInfo = this.getVaultInfo();
    if (!vaultInfo) {
      throw new Error("当前 vault 不支持本地插件配置路径。");
    }

    const rawRoot = await this.loadRawSourceConfigRoot(vaultInfo.path);
    const nextRoot = buildConfigRootFromUnknown(rawRoot, this.getDefaultSourceConfigs());
    nextRoot[sourceKey] = values;
    await this.writeSourceConfigRoot(nextRoot);
  }
}
