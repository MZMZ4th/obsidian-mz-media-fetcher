import { Notice, Plugin } from "obsidian";
import { buildCard } from "./core/cards.ts";
import { normalizeError } from "./core/errors.ts";
import { ensureFolderExists } from "./core/files.ts";
import { ConfigStore } from "./config/storage.ts";
import { PLUGIN_ID } from "./config/defaults.ts";
import { MEDIA_SOURCE_UI_META_MAP } from "./source-ui-meta.ts";
import { MEDIA_SOURCE_MAP, MEDIA_SOURCES } from "./sources/index.ts";
import type { MediaSource, SourceId } from "./types.ts";
import { QueryInputModal, SourceSuggestModal } from "./ui/modals.ts";
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
}
