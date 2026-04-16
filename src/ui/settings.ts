import { Notice, PluginSettingTab, Setting } from "obsidian";
import { normalizeTemplateEditorValues } from "../config/storage.ts";
import { MEDIA_SOURCES } from "../sources/index.ts";
import type MZMediaFetcherPlugin from "../plugin.ts";
import type { SourceId } from "../types.ts";
import { FolderPathSuggest, TemplatePathSuggest } from "./suggest.ts";

export class MZMediaFetcherSettingTab extends PluginSettingTab {
  plugin: MZMediaFetcherPlugin;

  constructor(app: any, plugin: MZMediaFetcherPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    void this.render();
  }

  async render(): Promise<void> {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "MZ Media Fetcher" });
    containerEl.createEl("p", {
      text: "在这里改模板路径和基础配置。模板正文继续直接改对应模板文件，旧 rules 配置会在保存时自动收敛成模板模式。",
    });

    const vaultInfo = this.plugin.configStore.getVaultInfo();
    if (!vaultInfo) {
      containerEl.createEl("p", { text: "当前 vault 不支持本地插件配置路径。" });
      return;
    }

    let normalizedConfigs;
    try {
      normalizedConfigs = await this.plugin.configStore.loadSourceConfigs(vaultInfo.path);
    } catch (error) {
      containerEl.createEl("p", {
        text: `读取配置失败：${this.plugin.normalizeError(error)}`,
      });
      return;
    }

    for (const source of MEDIA_SOURCES) {
      const normalizedConfig = normalizedConfigs[source.id];
      const state = {
        targetFolder: normalizedConfig.targetFolder,
        templatePath: normalizedConfig.templatePath,
        searchLimit: String(normalizedConfig.searchLimit),
        posterSaveLocal: normalizedConfig.poster.saveLocal,
        posterFolder: normalizedConfig.poster.folder,
        filenameTemplate: normalizedConfig.filename.template,
        filenameCollisionTemplate: normalizedConfig.filename.collisionTemplate,
      };

      await this.renderSourceSection(containerEl, source.id, source.label, state);
    }
  }

  async renderSourceSection(
    containerEl: HTMLElement,
    sourceKey: SourceId,
    label: string,
    state: {
      targetFolder: string;
      templatePath: string;
      searchLimit: string;
      posterSaveLocal: boolean;
      posterFolder: string;
      filenameTemplate: string;
      filenameCollisionTemplate: string;
    }
  ): Promise<void> {
    const sectionEl = containerEl.createDiv();
    sectionEl.createEl("h3", { text: label });

    new Setting(sectionEl)
      .setName("目标目录")
      .setDesc("新建卡片时写入的笔记目录。")
      .addText((text) => {
        new FolderPathSuggest(this.app, text.inputEl);
        text.setPlaceholder("例如：00-Inbox");
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
        text.setPlaceholder(state.templatePath);
        text.setValue(state.templatePath);
        text.onChange((value: string) => {
          state.templatePath = value;
        });
      });

    new Setting(sectionEl)
      .setName("搜索条目数")
      .setDesc("搜索时最多展示多少个候选条目。")
      .addText((text) => {
        text.setPlaceholder("8");
        text.setValue(state.searchLimit);
        text.onChange((value: string) => {
          state.searchLimit = value;
        });
      });

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
      .setDesc("开启“海报存本地”后，海报文件写入的 vault 相对目录。")
      .addText((text) => {
        new FolderPathSuggest(this.app, text.inputEl);
        text.setPlaceholder("例如：00-Inbox/附件/作品海报");
        text.setValue(state.posterFolder);
        text.onChange((value: string) => {
          state.posterFolder = value;
        });
      });

    new Setting(sectionEl)
      .setName("文件名模板")
      .setDesc("第一次尝试创建笔记时使用的文件名模板。")
      .addText((text) => {
        text.setPlaceholder("{{title}}");
        text.setValue(state.filenameTemplate);
        text.onChange((value: string) => {
          state.filenameTemplate = value;
        });
      });

    new Setting(sectionEl)
      .setName("重名文件名模板")
      .setDesc("遇到同名文件时使用的备用模板。")
      .addText((text) => {
        text.setPlaceholder(state.filenameCollisionTemplate);
        text.setValue(state.filenameCollisionTemplate);
        text.onChange((value: string) => {
          state.filenameCollisionTemplate = value;
        });
      });

    const actions = new Setting(sectionEl).setName("保存");
    actions.addButton((button) => {
      button.setButtonText("保存配置");
      button.setCta();
      button.onClick(async () => {
        try {
          const result = normalizeTemplateEditorValues(sourceKey, state);
          await this.plugin.configStore.saveTemplateSourceConfig(sourceKey, result);
          new Notice(`${label} 配置已保存。`, 5000);
          await this.render();
        } catch (error) {
          new Notice(`保存失败：${this.plugin.normalizeError(error)}`, 12000);
        }
      });
    });
  }
}
