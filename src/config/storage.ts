import fsp from "fs/promises";
import path from "path";
import type { App, Plugin } from "obsidian";
import {
  BANGUMI_TYPE_TEMPLATE_CONTENTS,
  DEFAULT_SOURCE_CONFIGS,
  FALLBACK_POSTER_FOLDER,
  LEGACY_PLUGIN_ID,
  PLUGIN_ID,
  TEMPLATE_CONTENTS,
  getDefaultSourceConfigs,
  getLegacyDefaultSourceConfigs,
} from "./defaults.ts";
import { ensureTextFile } from "../core/files.ts";
import { normalizeVaultPath } from "../core/paths.ts";
import {
  BANGUMI_TEMPLATE_TYPES,
  SOURCE_IDS,
  type BangumiTypeTemplatePaths,
  type SourceConfig,
  type SourceConfigRoot,
  type SourceId,
  type VaultInfo,
} from "../types.ts";

type PluginDataStore = Pick<Plugin, "app" | "loadData" | "saveData">;

interface InitialConfigResult {
  config: SourceConfigRoot;
  cleanupPath?: string;
}

function normalizePlainRelativePath(value: unknown): string {
  return normalizeVaultPath(value);
}

function normalizeVaultRelativePath(value: unknown): string {
  const normalized = normalizePlainRelativePath(value);
  if (!normalized) {
    throw new Error("模板路径不能为空。");
  }
  return normalized;
}

function normalizeOptionalVaultRelativePath(value: unknown): string {
  if (value === null || typeof value === "undefined") {
    return "";
  }
  return normalizePlainRelativePath(value);
}

function normalizeSearchLimit(value: unknown, fallback: number): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 1) {
    return Math.max(1, Number(fallback) || 1);
  }
  return Math.max(1, Math.round(numeric));
}

export function resolveAttachmentFolderPath(
  appConfig: unknown,
  fallback = FALLBACK_POSTER_FOLDER
): string {
  const folder = normalizePlainRelativePath((appConfig as any)?.attachmentFolderPath);
  return folder || normalizePlainRelativePath(fallback);
}

function buildTemplateModeSourceConfig(
  raw: any,
  defaults: SourceConfig,
  legacyDefaults?: SourceConfig
): SourceConfig {
  const source = raw && typeof raw === "object" ? raw : {};
  const filename = source.filename && typeof source.filename === "object" ? source.filename : {};
  const poster = source.poster && typeof source.poster === "object" ? source.poster : {};
  const templatePath = normalizeVaultRelativePath(source.templatePath || defaults.templatePath);
  const legacyTemplatePath = legacyDefaults?.templatePath
    ? normalizeVaultRelativePath(legacyDefaults.templatePath)
    : "";
  const typeTemplatePaths = buildBangumiTypeTemplatePaths(
    source,
    defaults.typeTemplatePaths,
    legacyDefaults?.typeTemplatePaths
  );

  return {
    targetFolder: normalizePlainRelativePath(source.targetFolder || defaults.targetFolder),
    templatePath:
      legacyTemplatePath && templatePath === legacyTemplatePath ? defaults.templatePath : templatePath,
    searchLimit: normalizeSearchLimit(source.searchLimit, defaults.searchLimit),
    ...(typeTemplatePaths ? { typeTemplatePaths } : {}),
    poster: {
      saveLocal: Boolean(
        typeof poster.saveLocal === "boolean" ? poster.saveLocal : defaults.poster.saveLocal
      ),
      folder: normalizePlainRelativePath(poster.folder || defaults.poster.folder),
    },
    filename: {
      template: String(filename.template || defaults.filename.template).trim(),
      collisionTemplate: String(
        filename.collisionTemplate || defaults.filename.collisionTemplate
      ).trim(),
    },
  };
}

function buildBangumiTypeTemplatePaths(
  source: Record<string, unknown>,
  defaults?: BangumiTypeTemplatePaths,
  legacyDefaults?: BangumiTypeTemplatePaths
): BangumiTypeTemplatePaths | undefined {
  if (!defaults) {
    return undefined;
  }

  const raw = source.typeTemplatePaths && typeof source.typeTemplatePaths === "object"
    ? (source.typeTemplatePaths as Record<string, unknown>)
    : {};

  return BANGUMI_TEMPLATE_TYPES.reduce((result, templateType) => {
    const defaultPath = defaults[templateType];
    const legacyPath = legacyDefaults?.[templateType]
      ? normalizeVaultRelativePath(legacyDefaults[templateType])
      : "";
    const hasExplicitValue = Object.prototype.hasOwnProperty.call(raw, templateType);
    const explicitValue = hasExplicitValue
      ? normalizeOptionalVaultRelativePath(raw[templateType])
      : undefined;

    if (explicitValue === undefined) {
      result[templateType] = defaultPath;
    } else if (legacyPath && explicitValue === legacyPath) {
      result[templateType] = defaultPath;
    } else {
      result[templateType] = explicitValue;
    }

    return result;
  }, {} as BangumiTypeTemplatePaths);
}

function normalizeSourceConfig(
  raw: any,
  sourceKey: SourceId,
  defaults: SourceConfigRoot,
  legacyDefaults: SourceConfigRoot
): SourceConfig {
  return buildTemplateModeSourceConfig(raw, defaults[sourceKey], legacyDefaults[sourceKey]);
}

function normalizeSourceConfigs(
  raw: any,
  defaults: SourceConfigRoot,
  legacyDefaults: SourceConfigRoot
): SourceConfigRoot {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("作品抓取配置格式不对。");
  }

  return SOURCE_IDS.reduce((result, sourceKey) => {
    result[sourceKey] = normalizeSourceConfig(raw[sourceKey], sourceKey, defaults, legacyDefaults);
    return result;
  }, {} as SourceConfigRoot);
}

export function buildConfigRootFromUnknown(
  raw: any,
  defaults: SourceConfigRoot,
  legacyDefaults: SourceConfigRoot
): SourceConfigRoot {
  return SOURCE_IDS.reduce((result, sourceKey) => {
    result[sourceKey] = buildTemplateModeSourceConfig(
      raw?.[sourceKey],
      defaults[sourceKey],
      legacyDefaults[sourceKey]
    );
    return result;
  }, {} as SourceConfigRoot);
}

export function normalizeTemplateEditorValues(
  sourceKey: SourceId,
  state: {
    targetFolder: string;
    templatePath: string;
    searchLimit: string;
    typeTemplatePaths?: Partial<BangumiTypeTemplatePaths>;
    posterSaveLocal: boolean;
    posterFolder: string;
    filenameTemplate: string;
    filenameCollisionTemplate: string;
  },
  defaultSourceConfigs: SourceConfigRoot = DEFAULT_SOURCE_CONFIGS
): SourceConfig {
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
  const typeTemplatePaths = defaults.typeTemplatePaths
    ? BANGUMI_TEMPLATE_TYPES.reduce((result, templateType) => {
        const rawValue = state.typeTemplatePaths?.[templateType];
        result[templateType] =
          typeof rawValue === "string"
            ? normalizeOptionalVaultRelativePath(rawValue)
            : defaults.typeTemplatePaths?.[templateType] || "";
        return result;
      }, {} as BangumiTypeTemplatePaths)
    : undefined;

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
    ...(typeTemplatePaths ? { typeTemplatePaths } : {}),
    poster: {
      saveLocal: posterSaveLocal,
      folder: posterFolder,
    },
    filename: {
      template: filenameTemplate,
      collisionTemplate: filenameCollisionTemplate,
    },
  };
}

export class ConfigStore {
  app: App;
  plugin: PluginDataStore;

  constructor(plugin: PluginDataStore) {
    this.plugin = plugin;
    this.app = plugin.app;
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

  getLegacyPluginFilePath(fileName: string): string {
    const vaultInfo = this.getVaultInfo();
    if (!vaultInfo) {
      throw new Error("当前 vault 不支持插件配置路径。");
    }

    const configDir = (this.app.vault as any)?.configDir || ".obsidian";
    return path.join(vaultInfo.path, configDir, "plugins", LEGACY_PLUGIN_ID, fileName);
  }

  getDefaultSourceConfigs(): SourceConfigRoot {
    const configDir = (this.app.vault as any)?.configDir || ".obsidian";
    return getDefaultSourceConfigs(configDir);
  }

  getLegacyDefaultSourceConfigs(posterFolder = FALLBACK_POSTER_FOLDER): SourceConfigRoot {
    const configDir = (this.app.vault as any)?.configDir || ".obsidian";
    return getLegacyDefaultSourceConfigs(configDir, posterFolder);
  }

  async readVaultAppConfig(vaultBasePath: string): Promise<any> {
    const configDir = (this.app.vault as any)?.configDir || ".obsidian";
    const appConfigPath = path.join(vaultBasePath, configDir, "app.json");

    try {
      const raw = await fsp.readFile(appConfigPath, "utf8");
      return JSON.parse(raw);
    } catch (_error) {
      return {};
    }
  }

  async getDefaultPosterFolder(vaultBasePath: string): Promise<string> {
    const appConfig = await this.readVaultAppConfig(vaultBasePath);
    return resolveAttachmentFolderPath(appConfig, FALLBACK_POSTER_FOLDER);
  }

  async getResolvedDefaultSourceConfigs(vaultBasePath: string): Promise<SourceConfigRoot> {
    const configDir = (this.app.vault as any)?.configDir || ".obsidian";
    const posterFolder = await this.getDefaultPosterFolder(vaultBasePath);
    return getDefaultSourceConfigs(configDir, posterFolder);
  }

  async getResolvedLegacyDefaultSourceConfigs(vaultBasePath: string): Promise<SourceConfigRoot> {
    const posterFolder = await this.getDefaultPosterFolder(vaultBasePath);
    return this.getLegacyDefaultSourceConfigs(posterFolder);
  }

  async ensureDefaultFiles(vaultBasePath: string): Promise<void> {
    const defaults = await this.getResolvedDefaultSourceConfigs(vaultBasePath);

    for (const sourceKey of SOURCE_IDS) {
      await this.ensureTemplateExists(
        vaultBasePath,
        defaults[sourceKey].templatePath,
        TEMPLATE_CONTENTS[sourceKey]
      );
    }

    await this.ensureBangumiTypeTemplates(vaultBasePath, defaults.bangumi, defaults.bangumi);
  }

  async ensureTemplateExists(
    vaultBasePath: string,
    relativePath: string,
    content: string
  ): Promise<void> {
    const absolutePath = path.join(vaultBasePath, normalizeVaultPath(relativePath));
    await ensureTextFile(absolutePath, content);
  }

  async ensureBangumiTypeTemplates(
    vaultBasePath: string,
    config: SourceConfig,
    defaultConfig: SourceConfig
  ): Promise<void> {
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

  private async loadConfigRootFromFile(
    filePath: string,
    label: string,
    defaults: SourceConfigRoot,
    legacyDefaults: SourceConfigRoot
  ): Promise<SourceConfigRoot | null> {
    let raw = "";

    try {
      raw = await fsp.readFile(filePath, "utf8");
    } catch (error: any) {
      if (error?.code === "ENOENT") {
        return null;
      }
      throw new Error(`读取旧插件配置失败：${label}`);
    }

    try {
      const parsed = JSON.parse(raw);
      return buildConfigRootFromUnknown(parsed, defaults, legacyDefaults);
    } catch (_error) {
      throw new Error(`旧插件配置不是合法 JSON：${label}`);
    }
  }

  private async deleteFileIfExists(filePath: string | undefined): Promise<void> {
    if (!filePath) {
      return;
    }

    try {
      await fsp.unlink(filePath);
    } catch (error: any) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }
  }

  async loadLegacyPluginConfigRoot(vaultBasePath: string): Promise<SourceConfigRoot | null> {
    const defaults = await this.getResolvedDefaultSourceConfigs(vaultBasePath);
    const legacyDefaults = await this.getResolvedLegacyDefaultSourceConfigs(vaultBasePath);
    return this.loadConfigRootFromFile(
      this.getLegacyPluginFilePath("media-fetcher-rules.json"),
      `${LEGACY_PLUGIN_ID}/media-fetcher-rules.json`,
      defaults,
      legacyDefaults
    );
  }

  async buildInitialConfig(vaultBasePath: string): Promise<InitialConfigResult> {
    const defaults = await this.getResolvedDefaultSourceConfigs(vaultBasePath);
    const legacyDefaults = await this.getResolvedLegacyDefaultSourceConfigs(vaultBasePath);
    const currentPluginConfigPath = this.getPluginFilePath("media-fetcher-rules.json");
    const currentPluginConfig = await this.loadConfigRootFromFile(
      currentPluginConfigPath,
      `${PLUGIN_ID}/media-fetcher-rules.json`,
      defaults,
      legacyDefaults
    );
    if (currentPluginConfig) {
      return {
        config: currentPluginConfig,
        cleanupPath: currentPluginConfigPath,
      };
    }

    const legacyPluginConfigPath = this.getLegacyPluginFilePath("media-fetcher-rules.json");
    const legacyPluginConfig = await this.loadConfigRootFromFile(
      legacyPluginConfigPath,
      `${LEGACY_PLUGIN_ID}/media-fetcher-rules.json`,
      defaults,
      legacyDefaults
    );
    if (legacyPluginConfig) {
      return {
        config: legacyPluginConfig,
        cleanupPath: legacyPluginConfigPath,
      };
    }

    const configDir = (this.app.vault as any)?.configDir || ".obsidian";
    const organizerConfigPath = path.join(
      vaultBasePath,
      configDir,
      "plugins",
      "MZ-organizer",
      "bangumi-card-rules.json"
    );

    let bangumi = defaults.bangumi;
    try {
      const raw = await fsp.readFile(organizerConfigPath, "utf8");
      bangumi = buildTemplateModeSourceConfig(JSON.parse(raw), defaults.bangumi);
    } catch (_error) {
      bangumi = defaults.bangumi;
    }

    return {
      config: {
        bangumi,
        mobygames: defaults.mobygames,
        bilibili_show: defaults.bilibili_show,
        showstart: defaults.showstart,
      },
    };
  }

  async loadRawSourceConfigRoot(vaultBasePath: string): Promise<any> {
    await this.ensureDefaultFiles(vaultBasePath);

    const stored = await this.plugin.loadData();
    if (typeof stored !== "undefined" && stored !== null) {
      if (typeof stored !== "object" || Array.isArray(stored)) {
        throw new Error("作品抓取配置不是合法 JSON：data.json");
      }
      return stored;
    }

    const initial = await this.buildInitialConfig(vaultBasePath);
    await this.writeSourceConfigRoot(initial.config);
    await this.deleteFileIfExists(initial.cleanupPath);
    return initial.config;
  }

  async writeSourceConfigRoot(raw: SourceConfigRoot): Promise<void> {
    await this.plugin.saveData(raw);
  }

  async loadSourceConfigs(vaultBasePath: string): Promise<SourceConfigRoot> {
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

  async saveTemplateSourceConfig(sourceKey: SourceId, values: SourceConfig): Promise<void> {
    const vaultInfo = this.getVaultInfo();
    if (!vaultInfo) {
      throw new Error("当前 vault 不支持本地插件配置路径。");
    }

    const rawRoot = await this.loadRawSourceConfigRoot(vaultInfo.path);
    const defaults = await this.getResolvedDefaultSourceConfigs(vaultInfo.path);
    const legacyDefaults = await this.getResolvedLegacyDefaultSourceConfigs(vaultInfo.path);
    const nextRoot = buildConfigRootFromUnknown(rawRoot, defaults, legacyDefaults);
    nextRoot[sourceKey] = values;
    await this.writeSourceConfigRoot(nextRoot);
  }
}
