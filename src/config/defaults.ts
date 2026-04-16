import type { SourceConfigRoot, SourceId } from "../types.ts";

export const PLUGIN_ID = "MZ-media-fetcher";
export const PLUGIN_NAME = "MZ Media Fetcher";
export const PLUGIN_VERSION = "0.2.0";
export const HTTP_USER_AGENT = `${PLUGIN_NAME}/${PLUGIN_VERSION} (Obsidian)`;
export const BANGUMI_API_BASE = "https://api.bgm.tv/v0";

export const TEMPLATE_CONTENTS: Record<SourceId, string> = {
  bangumi: `---
categories: 新作品卡片
名称: {{yaml.title}}
原名: {{yaml.title_original}}
aliases: {{yaml.aliases}}
媒体类型: {{yaml.media_type}}
发布日期: {{yaml.release_date}}
评分:
状态: 进行中
完成时间: ""
体验次数: 1
海报: {{poster}}
来源链接: {{bangumi_url}}
网络海报: {{yaml.network_poster}}
---

{{cover_markdown}}

## 简介

{{summary}}

## 简记
`,
  mobygames: `---
categories: 新作品卡片
名称: {{yaml.title}}
原名: {{yaml.title_original}}
aliases: {{yaml.aliases}}
媒体类型: {{yaml.media_type}}
发布日期: {{yaml.release_date}}
评分:
状态: 进行中
完成时间: ""
体验次数: 1
海报: {{poster}}
来源链接: {{mobygames_url}}
网络海报: {{yaml.network_poster}}
---

{{cover_markdown}}

## 简介

{{summary}}

## 平台

{{platforms_text}}

## 简记
`,
  bilibili_show: `---
categories: 新作品卡片
名称: {{yaml.title}}
原名:
aliases:
媒体类型:
发布日期: {{yaml.release_date}}
评分:
状态:
完成时间:
体验次数:
海报: {{poster}}
来源链接: {{bilibili_show_url}}
网络海报: {{yaml.network_poster}}
---

![cover|300]({{poster}})

## 简介

{{summary}}

## 简记
`,
};

export function getDefaultSourceConfigs(configDir = ".obsidian"): SourceConfigRoot {
  const pluginRoot = `${configDir}/plugins/${PLUGIN_ID}`;
  return {
    bangumi: {
      targetFolder: "00-Inbox",
      templatePath: `${pluginRoot}/templates/bangumi.md`,
      searchLimit: 8,
      poster: {
        saveLocal: false,
        folder: "00-Inbox/附件/作品海报",
      },
      filename: {
        template: "{{title}}",
        collisionTemplate: "{{title}} {{release_year}} {{bangumi_id}}",
      },
    },
    mobygames: {
      targetFolder: "00-Inbox",
      templatePath: `${pluginRoot}/templates/mobygames.md`,
      searchLimit: 8,
      poster: {
        saveLocal: false,
        folder: "00-Inbox/附件/作品海报",
      },
      filename: {
        template: "{{title}}",
        collisionTemplate: "{{title}} {{release_year}} {{mobygames_id}}",
      },
    },
    bilibili_show: {
      targetFolder: "00-Inbox",
      templatePath: `${pluginRoot}/templates/bilibili-show.md`,
      searchLimit: 8,
      poster: {
        saveLocal: false,
        folder: "00-Inbox/附件/作品海报",
      },
      filename: {
        template: "{{title}}",
        collisionTemplate: "{{title}} {{release_year}} {{bilibili_show_id}}",
      },
    },
  };
}

export const DEFAULT_SOURCE_CONFIGS = getDefaultSourceConfigs();
