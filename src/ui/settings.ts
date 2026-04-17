import { Notice, PluginSettingTab, Setting } from "obsidian";
import { TEMPLATE_CONTENTS } from "../config/defaults.ts";
import { normalizeTemplateEditorValues } from "../config/storage.ts";
import { MEDIA_SOURCE_UI_META_MAP } from "../source-ui-meta.ts";
import { MEDIA_SOURCES } from "../sources/index.ts";
import type MZMediaFetcherPlugin from "../plugin.ts";
import type { SourceConfig, SourceConfigRoot, SourceId, TemplateVariableDefinition } from "../types.ts";
import { FolderPathSuggest, TemplatePathSuggest } from "./suggest.ts";

interface TemplateEditorState {
  targetFolder: string;
  templatePath: string;
  searchLimit: string;
  posterSaveLocal: boolean;
  posterFolder: string;
  filenameTemplate: string;
  filenameCollisionTemplate: string;
}

async function copyTextToClipboard(text: string): Promise<void> {
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
      throw new Error("当前环境不支持直接写入剪贴板。");
    }
  } finally {
    document.body.removeChild(textarea);
  }
}

function createTemplateEditorState(config: SourceConfig): TemplateEditorState {
  return {
    targetFolder: config.targetFolder,
    templatePath: config.templatePath,
    searchLimit: String(config.searchLimit),
    posterSaveLocal: config.poster.saveLocal,
    posterFolder: config.poster.folder,
    filenameTemplate: config.filename.template,
    filenameCollisionTemplate: config.filename.collisionTemplate,
  };
}

export class MZMediaFetcherSettingTab extends PluginSettingTab {
  plugin: MZMediaFetcherPlugin;
  activeSourceId: SourceId;
  sourceStates: Record<SourceId, TemplateEditorState> | null;
  defaultSourceConfigs: SourceConfigRoot | null;
  defaultPosterFolder: string;

  constructor(app: any, plugin: MZMediaFetcherPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.activeSourceId = MEDIA_SOURCES[0]?.id || "bangumi";
    this.sourceStates = null;
    this.defaultSourceConfigs = null;
    this.defaultPosterFolder = "";
  }

  display(): void {
    void this.render(true);
  }

  async render(refreshFromDisk = false): Promise<void> {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "MZ Media Fetcher" });
    containerEl.createEl("p", {
      text: "按来源管理作品抓取配置。模板正文继续直接改模板文件；这里负责来源能力说明、基础设置和默认模板工具。",
    });

    const vaultInfo = this.plugin.configStore.getVaultInfo();
    if (!vaultInfo) {
      containerEl.createEl("p", { text: "当前 vault 不支持本地插件配置路径。" });
      return;
    }

    try {
      if (refreshFromDisk || !this.sourceStates || !this.defaultSourceConfigs) {
        await this.loadSourceStates(vaultInfo.path);
      }
    } catch (error) {
      containerEl.createEl("p", {
        text: `读取配置失败：${this.plugin.normalizeError(error)}`,
      });
      return;
    }

    if (!this.sourceStates || !this.defaultSourceConfigs) {
      containerEl.createEl("p", { text: "当前还没有可用的来源配置。" });
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

  async loadSourceStates(vaultBasePath: string): Promise<void> {
    const [normalizedConfigs, defaultSourceConfigs, defaultPosterFolder] = await Promise.all([
      this.plugin.configStore.loadSourceConfigs(vaultBasePath),
      this.plugin.configStore.getResolvedDefaultSourceConfigs(vaultBasePath),
      this.plugin.configStore.getDefaultPosterFolder(vaultBasePath),
    ]);

    this.sourceStates = MEDIA_SOURCES.reduce((result, source) => {
      result[source.id] = createTemplateEditorState(normalizedConfigs[source.id]);
      return result;
    }, {} as Record<SourceId, TemplateEditorState>);
    this.defaultSourceConfigs = defaultSourceConfigs;
    this.defaultPosterFolder = defaultPosterFolder;
  }

  renderTabs(containerEl: HTMLElement): void {
    const tabsEl = containerEl.createDiv();
    tabsEl.style.display = "flex";
    tabsEl.style.flexWrap = "wrap";
    tabsEl.style.gap = "8px";
    tabsEl.style.marginBottom = "16px";

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

  async renderSourceSection(
    containerEl: HTMLElement,
    sourceKey: SourceId,
    label: string,
    state: TemplateEditorState,
    defaultConfig: SourceConfig
  ): Promise<void> {
    const sectionEl = containerEl.createDiv();
    const sourceMeta = MEDIA_SOURCE_UI_META_MAP[sourceKey];

    sectionEl.createEl("h3", { text: label });
    this.renderFeatureNotes(sectionEl, sourceMeta.featureNotes);

    new Setting(sectionEl)
      .setName("目标目录")
      .setDesc("新建卡片时写入的笔记目录。")
      .addText((text) => {
        new FolderPathSuggest(this.app, text.inputEl);
        text.setPlaceholder(defaultConfig.targetFolder || "例如：00-Inbox");
        text.setValue(state.targetFolder);
        text.onChange((value: string) => {
          state.targetFolder = value;
        });
      });

    new Setting(sectionEl)
      .setName("模板路径")
      .setDesc("模板文件在 vault 内的相对路径。")
      .addText((text) => {
        new TemplatePathSuggest(this.app, text.inputEl);
        text.setPlaceholder(defaultConfig.templatePath);
        text.setValue(state.templatePath);
        text.onChange((value: string) => {
          state.templatePath = value;
        });
      });

    if (sourceMeta.supportsSearch) {
      new Setting(sectionEl)
        .setName("搜索条目数")
        .setDesc("搜索时最多展示多少个候选条目。")
        .addText((text) => {
          text.setPlaceholder(String(defaultConfig.searchLimit));
          text.setValue(state.searchLimit);
          text.onChange((value: string) => {
            state.searchLimit = value;
          });
        });
    }

    new Setting(sectionEl)
      .setName("海报存本地")
      .setDesc("开启后会把远程海报下载到 vault 内，并在卡片里改用本地路径。")
      .addToggle((toggle) => {
        toggle.setValue(state.posterSaveLocal);
        toggle.onChange((value) => {
          state.posterSaveLocal = value;
        });
      });

    new Setting(sectionEl)
      .setName("本地海报目录")
      .setDesc(
        `开启“海报存本地”后，海报文件写入的 vault 相对目录。留空时会默认跟随 Obsidian 附件目录：${this.defaultPosterFolder || defaultConfig.poster.folder || "未配置"}。`
      )
      .addText((text) => {
        new FolderPathSuggest(this.app, text.inputEl);
        text.setPlaceholder(defaultConfig.poster.folder || "例如：50-Others/附件");
        text.setValue(state.posterFolder);
        text.onChange((value: string) => {
          state.posterFolder = value;
        });
      });

    new Setting(sectionEl)
      .setName("文件名模板")
      .setDesc("第一次尝试创建笔记时使用的文件名模板；生成结果会自动把空格改成短横线。")
      .addText((text) => {
        text.setPlaceholder(defaultConfig.filename.template);
        text.setValue(state.filenameTemplate);
        text.onChange((value: string) => {
          state.filenameTemplate = value;
        });
      });

    new Setting(sectionEl)
      .setName("重名文件名模板")
      .setDesc("遇到同名文件时使用的备用模板；重复后缀会自动写成 -2、-3。")
      .addText((text) => {
        text.setPlaceholder(defaultConfig.filename.collisionTemplate);
        text.setValue(state.filenameCollisionTemplate);
        text.onChange((value: string) => {
          state.filenameCollisionTemplate = value;
        });
      });

    new Setting(sectionEl)
      .setName("默认模板")
      .setDesc("复制插件内置默认模板原文到剪贴板，方便直接改成自己的模板。")
      .addButton((button) => {
        button.setButtonText("复制默认模板");
        button.onClick(async () => {
          try {
            await copyTextToClipboard(TEMPLATE_CONTENTS[sourceKey]);
            new Notice(`${label} 默认模板已复制到剪贴板。`, 5000);
          } catch (error) {
            new Notice(`复制失败：${this.plugin.normalizeError(error)}`, 12000);
          }
        });
      });

    this.renderTemplateVariables(sectionEl, sourceMeta.templateVariables);

    const actions = new Setting(sectionEl).setName("保存");
    actions.addButton((button) => {
      button.setButtonText("保存配置");
      button.setCta();
      button.onClick(async () => {
        try {
          const result = normalizeTemplateEditorValues(
            sourceKey,
            state,
            this.defaultSourceConfigs || undefined
          );
          await this.plugin.configStore.saveTemplateSourceConfig(sourceKey, result);
          this.sourceStates = {
            ...(this.sourceStates || {}),
            [sourceKey]: createTemplateEditorState(result),
          };
          new Notice(`${label} 配置已保存。`, 5000);
          await this.render(true);
        } catch (error) {
          new Notice(`保存失败：${this.plugin.normalizeError(error)}`, 12000);
        }
      });
    });
  }

  renderFeatureNotes(containerEl: HTMLElement, notes: string[]): void {
    containerEl.createEl("h4", { text: "支持的功能" });
    const listEl = containerEl.createEl("ul");
    for (const note of notes) {
      listEl.createEl("li", { text: note });
    }
  }

  renderTemplateVariables(
    containerEl: HTMLElement,
    variables: TemplateVariableDefinition[]
  ): void {
    containerEl.createEl("h4", { text: "支持的模板参数" });
    containerEl.createEl("p", {
      text: "每个参数都可以直接写进模板；支持 yaml 版本的，会同时提供 {{yaml.xxx}} 这种 YAML 安全写法。",
    });

    const listEl = containerEl.createEl("ul");
    for (const variable of variables) {
      const itemEl = listEl.createEl("li");
      itemEl.createEl("code", { text: `{{${variable.key}}}` });
      if (variable.yamlSafe !== false) {
        itemEl.appendText(" / ");
        itemEl.createEl("code", { text: `{{yaml.${variable.key}}}` });
      }
      itemEl.appendText(`：${variable.description}`);
    }
  }
}
