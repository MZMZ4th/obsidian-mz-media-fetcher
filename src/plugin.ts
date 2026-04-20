import fsp from "fs/promises";
import path from "path";
import { Notice, Plugin } from "obsidian";
import {
  analyzeBangumiFrontmatterUpdate,
  buildBangumiFrontmatterEntries,
  collectBangumiTemplateValueCandidates,
  extractFrontmatterBlock,
  listFrontmatterKeys,
  parseTemplateFrontmatterBindings,
  replaceFrontmatter,
  sanitizeFrontmatterObject,
  type BangumiRefreshConflict,
  type TemplateFrontmatterBinding,
} from "./bangumi-refresh.ts";
import { buildCard } from "./core/cards.ts";
import { normalizeError } from "./core/errors.ts";
import { ensureFolderExists } from "./core/files.ts";
import { normalizeVaultPath } from "./core/paths.ts";
import { buildTemplateContext } from "./core/template.ts";
import { ConfigStore } from "./config/storage.ts";
import { PLUGIN_ID } from "./config/defaults.ts";
import { MEDIA_SOURCE_UI_META_MAP } from "./source-ui-meta.ts";
import { MEDIA_SOURCE_MAP, MEDIA_SOURCES } from "./sources/index.ts";
import { parseBangumiSubjectId } from "./sources/bangumi.ts";
import {
  BANGUMI_REFRESH_MANAGED_VARIABLES,
} from "./template-fields.ts";
import type { MediaSource, SourceConfig, SourceId } from "./types.ts";
import { BangumiRefreshConflictModal, QueryInputModal, SourceSuggestModal } from "./ui/modals.ts";
import { MZMediaFetcherSettingTab } from "./ui/settings.ts";

export default class MZMediaFetcherPlugin extends Plugin {
  configStore: ConfigStore;
  isRunning: boolean;

  async onload(): Promise<void> {
    this.configStore = new ConfigStore(this.app);
    this.isRunning = false;

    for (const source of MEDIA_SOURCES) {
      this.addCommand({
        id: source.commandId,
        name: source.commandName,
        callback: () => this.createCardForSource(source.id),
      });
    }

    this.addCommand({
      id: "refresh-current-bangumi-note",
      name: "重新补全当前笔记的 Bangumi 信息",
      callback: () => this.refreshCurrentBangumiNote(),
    });

    this.addSettingTab(new MZMediaFetcherSettingTab(this.app, this));
  }

  normalizeError(error: unknown): string {
    return normalizeError(error);
  }

  async createCardForSource(sourceId: SourceId): Promise<void> {
    const source = MEDIA_SOURCE_MAP[sourceId];
    if (!source) {
      new Notice(`不支持的来源：${sourceId}`, 8000);
      return;
    }

    await this.runCreateFlow(source);
  }

  private async refreshCurrentBangumiNote(): Promise<void> {
    if (this.isRunning) {
      new Notice("当前已有抓取任务在进行中。", 5000);
      return;
    }

    const vaultInfo = this.configStore.getVaultInfo();
    if (!vaultInfo) {
      new Notice("当前 vault 不支持本地插件配置路径。", 8000);
      return;
    }

    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile || activeFile.extension !== "md") {
      new Notice("请先打开一篇要补全的 Markdown 笔记。", 8000);
      return;
    }

    this.isRunning = true;
    try {
      const sourceConfigs = await this.configStore.loadSourceConfigs(vaultInfo.path);
      const bangumiConfig = sourceConfigs.bangumi;
      const rawContent = await this.app.vault.cachedRead(activeFile);
      const frontmatterBlock = extractFrontmatterBlock(rawContent);
      if (!frontmatterBlock) {
        throw new Error("当前笔记没有 frontmatter，无法重新补全 Bangumi 信息。");
      }

      const existingFrontmatter = sanitizeFrontmatterObject(
        ((this.app.metadataCache.getFileCache(activeFile) as any)?.frontmatter || {}) as Record<
          string,
          unknown
        >
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
        throw new Error("当前笔记没有可识别的 bangumi_id 或 bangumi_url。");
      }

      const bangumiSource = MEDIA_SOURCE_MAP.bangumi;
      const detail = await bangumiSource.fetchByDirectInput(subjectId, bangumiConfig);
      const normalizedItem = bangumiSource.normalize(detail as never);
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
        fetchedValues,
      });

      const decisions = await this.collectBangumiConflictDecisions(analysis.conflicts);
      if (decisions === null) {
        new Notice("已取消，未修改当前笔记。", 4000);
        return;
      }

      const nextEntries = buildBangumiFrontmatterEntries(analysis, decisions);
      const nextContent = replaceFrontmatter(rawContent, nextEntries);
      const normalizedCurrentContent = rawContent.replace(/\r\n/g, "\n");
      if (nextContent === normalizedCurrentContent) {
        new Notice("当前 Bangumi 信息已经是最新的。", 5000);
        return;
      }

      await this.app.vault.modify(activeFile, nextContent);
      new Notice(`Bangumi 信息已补全：${normalizedItem.title}`, 8000);
    } catch (error) {
      console.error(`[${PLUGIN_ID}]`, error);
      new Notice(`补全 Bangumi 信息失败：${normalizeError(error)}`, 12000);
    } finally {
      this.isRunning = false;
    }
  }

  private async runCreateFlow(source: MediaSource): Promise<void> {
    const sourceMeta = MEDIA_SOURCE_UI_META_MAP[source.id];
    if (this.isRunning) {
      new Notice(`${source.commandName}已在进行中。`, 5000);
      return;
    }

    const vaultInfo = this.configStore.getVaultInfo();
    if (!vaultInfo) {
      new Notice("当前 vault 不支持本地插件配置路径。", 8000);
      return;
    }

    this.isRunning = true;
    try {
      const query = await new QueryInputModal(this.app, {
        title: source.inputTitle,
        hint: source.inputHint,
        placeholder: source.inputPlaceholder,
        fieldLabel: sourceMeta?.inputFieldLabel,
      }).openAndWait();

      if (!query) {
        new Notice("已取消，未新建任何作品卡片。", 4000);
        return;
      }

      const sourceConfigs = await this.configStore.loadSourceConfigs(vaultInfo.path);
      const sourceConfig = sourceConfigs[source.id];
      const directInput = source.parseDirectInput(query);

      let detail: unknown;
      if (directInput !== null && typeof directInput !== "undefined") {
        detail = await source.fetchByDirectInput(directInput as never, sourceConfig);
      } else if (
        sourceMeta?.supportsSearch &&
        source.search &&
        source.fetchBySearchItem &&
        source.toSuggestItem
      ) {
        const normalizedQuery = String(query || "").trim();
        if (!normalizedQuery) {
          throw new Error("请输入要搜索的作品名。");
        }

        const searchItems = await source.search(normalizedQuery, sourceConfig);
        if (!Array.isArray(searchItems) || searchItems.length === 0) {
          throw new Error(`${source.label} 没有搜到“${normalizedQuery}”相关条目。`);
        }

        const chosen = await new SourceSuggestModal(this.app, {
          title: `选择要新建的 ${source.label} 条目`,
          items: searchItems.map(source.toSuggestItem),
        }).openAndWait();

        if (!chosen) {
          new Notice("已取消，未新建任何作品卡片。", 4000);
          return;
        }

        detail = await source.fetchBySearchItem(chosen as never, sourceConfig);
      } else {
        throw new Error(`${source.label} 目前只支持直接输入指定详情链接或 ID。`);
      }

      const normalizedItem = source.normalize(detail as never);
      const card = await buildCard(this.app, vaultInfo, source.id, normalizedItem, sourceConfig);

      await ensureFolderExists(this.app.vault, card.folderPath);
      const file = await this.app.vault.create(card.filePath, card.content);
      await this.app.workspace.getLeaf(true).openFile(file);
      new Notice(`作品卡片已创建：${normalizedItem.title}`, 8000);
    } catch (error) {
      console.error(`[${PLUGIN_ID}]`, error);
      new Notice(`新建作品卡片失败：${normalizeError(error)}`, 12000);
    } finally {
      this.isRunning = false;
    }
  }

  private buildBangumiFetchedValues(item: Record<string, unknown>): Record<string, unknown> {
    const context = buildTemplateContext("bangumi", item as any);
    return BANGUMI_REFRESH_MANAGED_VARIABLES.reduce<Record<string, unknown>>((result, key) => {
      result[key] = context[key];
      return result;
    }, {});
  }

  private resolveCurrentBangumiSubjectId(candidateValues: Record<string, unknown>): number | null {
    const literalId = Number(candidateValues.bangumi_id);
    if (Number.isInteger(literalId) && literalId > 0) {
      return literalId;
    }

    return parseBangumiSubjectId(String(candidateValues.bangumi_url || ""));
  }

  private async loadBangumiTemplateBindingGroups(
    vaultBasePath: string,
    config: SourceConfig
  ): Promise<TemplateFrontmatterBinding[][]> {
    const templatePaths = [config.templatePath];
    for (const templatePath of Object.values(config.typeTemplatePaths || {})) {
      if (templatePath && !templatePaths.includes(templatePath)) {
        templatePaths.push(templatePath);
      }
    }

    return Promise.all(
      templatePaths.map(async (templatePath) => {
        const absolutePath = path.join(vaultBasePath, normalizeVaultPath(templatePath));
        const template = await fsp.readFile(absolutePath, "utf8");
        return parseTemplateFrontmatterBindings(template);
      })
    );
  }

  private async readTemplateBindings(
    vaultBasePath: string,
    config: SourceConfig,
    item: Record<string, unknown>
  ): Promise<TemplateFrontmatterBinding[]> {
    const relativePath = this.resolveBangumiTemplatePath(config, item);
    const absolutePath = path.join(vaultBasePath, normalizeVaultPath(relativePath));
    const template = await fsp.readFile(absolutePath, "utf8");
    return parseTemplateFrontmatterBindings(template);
  }

  private resolveBangumiTemplatePath(config: SourceConfig, item: Record<string, unknown>): string {
    const mediaType = String(item.media_type || "").trim();
    if (!config.typeTemplatePaths) {
      return config.templatePath;
    }

    if (mediaType === "游戏") {
      return config.typeTemplatePaths.game || config.templatePath;
    }
    if (mediaType === "动画") {
      return config.typeTemplatePaths.anime || config.templatePath;
    }
    if (mediaType === "书籍") {
      return config.typeTemplatePaths.book || config.templatePath;
    }
    if (mediaType === "三次元") {
      return config.typeTemplatePaths.liveAction || config.templatePath;
    }

    return config.templatePath;
  }

  private async collectBangumiConflictDecisions(
    conflicts: BangumiRefreshConflict[]
  ): Promise<Record<string, "keep" | "replace"> | null> {
    const decisions: Record<string, "keep" | "replace"> = {};

    for (const conflict of conflicts) {
      const decision = await new BangumiRefreshConflictModal(this.app, conflict).openAndWait();
      if (!decision) {
        return null;
      }
      decisions[conflict.propertyKey] = decision;
    }

    return decisions;
  }
}
