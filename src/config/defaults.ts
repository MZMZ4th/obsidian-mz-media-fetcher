import { joinVaultPath } from "../core/paths.ts";
import { buildTemplatePreviewSection } from "../template-fields.ts";
import type {
  BangumiTemplateType,
  BangumiTypeTemplatePaths,
  SourceConfigRoot,
  SourceId,
} from "../types.ts";

export const PLUGIN_ID = "mz-media-fetcher";
export const LEGACY_PLUGIN_ID = "MZ-media-fetcher";
export const PLUGIN_NAME = "MZ Media Fetcher";
export const PLUGIN_VERSION = "0.3.4";
export const PLUGIN_DESCRIPTION =
  "Create media and event notes from Bangumi, MobyGames, Bilibili Show, and Showstart.";
export const HTTP_USER_AGENT = `${PLUGIN_NAME}/${PLUGIN_VERSION} (Obsidian)`;
export const BANGUMI_API_BASE = "https://api.bgm.tv/v0";
export const FALLBACK_POSTER_FOLDER = "00-Inbox/附件/作品海报";

function buildTemplateContent(
  sourceId: SourceId,
  frontmatter: string[],
  options: { cover: string; details?: string[] }
): string {
  const sections = [
    `---\n${frontmatter.join("\n")}\n---`,
    options.cover,
    buildTemplatePreviewSection(sourceId).trimEnd(),
    "## 简介",
    "{{summary}}",
    ...(options.details || []),
    "## 简记",
  ];

  return `${sections.join("\n\n")}\n`;
}

const BANGUMI_TEMPLATE_FRONTMATTER = [
  "categories: 新作品卡片",
  "名称: {{yaml.title}}",
  "原名: {{yaml.title_original}}",
  "aliases: {{yaml.aliases}}",
  "媒体类型: {{yaml.media_type}}",
  "发布日期: {{yaml.release_date}}",
  "Bangumi ID: {{yaml.bangumi_id}}",
  "作者: {{yaml.authors}}",
  "出版社: {{yaml.publishers}}",
  "连载杂志: {{yaml.serial_magazines}}",
  "评分:",
  "状态: 进行中",
  '完成时间: ""',
  "体验次数: 1",
  "海报: {{poster}}",
  "来源链接: {{bangumi_url}}",
  "网络海报: {{yaml.network_poster}}",
];

const BANGUMI_TEMPLATE_CONTENT = buildTemplateContent("bangumi", BANGUMI_TEMPLATE_FRONTMATTER, {
  cover: "{{cover_markdown}}",
});

const BILIBILI_SHOW_TEMPLATE_CONTENT = buildTemplateContent(
  "bilibili_show",
  [
    "categories: 新作品卡片",
    "名称: {{yaml.title}}",
    "原名:",
    "aliases:",
    "媒体类型:",
    "发布日期: {{yaml.release_date}}",
    "演出场所: {{yaml.venue_text}}",
    "评分:",
    "状态:",
    "完成时间:",
    "体验次数:",
    "海报: {{poster}}",
    "来源链接: {{bilibili_show_url}}",
    "网络海报: {{yaml.network_poster}}",
  ],
  {
    cover: "![cover|300]({{poster}})",
  }
);

const SHOWSTART_TEMPLATE_CONTENT = buildTemplateContent(
  "showstart",
  [
    "categories: 新作品卡片",
    "名称: {{yaml.title}}",
    "原名:",
    "aliases:",
    "媒体类型:",
    "发布日期: {{yaml.release_date}}",
    "演出场所: {{yaml.venue_text}}",
    "评分:",
    "状态: 已完成",
    "完成时间: {{yaml.release_date}}",
    "体验次数: 1",
    "海报: {{poster}}",
    "来源链接: {{showstart_url}}",
    "网络海报: {{yaml.network_poster}}",
  ],
  {
    cover: "![cover|300]({{poster}})",
  }
);

export const TEMPLATE_CONTENTS: Record<SourceId, string> = {
  bangumi: BANGUMI_TEMPLATE_CONTENT,
  mobygames: buildTemplateContent(
    "mobygames",
    [
      "categories: 新作品卡片",
      "名称: {{yaml.title}}",
      "原名: {{yaml.title_original}}",
      "aliases: {{yaml.aliases}}",
      "媒体类型: {{yaml.media_type}}",
      "发布日期: {{yaml.release_date}}",
      "评分:",
      "状态: 进行中",
      '完成时间: ""',
      "体验次数: 1",
      "海报: {{poster}}",
      "来源链接: {{mobygames_url}}",
      "网络海报: {{yaml.network_poster}}",
    ],
    {
      cover: "{{cover_markdown}}",
      details: ["## 平台", "{{platforms_text}}"],
    }
  ),
  bilibili_show: BILIBILI_SHOW_TEMPLATE_CONTENT,
  showstart: SHOWSTART_TEMPLATE_CONTENT,
};

export const BANGUMI_TYPE_TEMPLATE_FILENAMES: Record<BangumiTemplateType, string> = {
  game: "bangumi-game.md",
  anime: "bangumi-anime.md",
  book: "bangumi-book.md",
  liveAction: "bangumi-live-action.md",
};

export const BANGUMI_TYPE_TEMPLATE_CONTENTS: Record<BangumiTemplateType, string> = {
  game: BANGUMI_TEMPLATE_CONTENT,
  anime: BANGUMI_TEMPLATE_CONTENT,
  book: BANGUMI_TEMPLATE_CONTENT,
  liveAction: BANGUMI_TEMPLATE_CONTENT,
};

function buildDefaultBangumiTypeTemplatePaths(pluginRoot: string): BangumiTypeTemplatePaths {
  return {
    game: joinVaultPath(pluginRoot, "templates", BANGUMI_TYPE_TEMPLATE_FILENAMES.game),
    anime: joinVaultPath(pluginRoot, "templates", BANGUMI_TYPE_TEMPLATE_FILENAMES.anime),
    book: joinVaultPath(pluginRoot, "templates", BANGUMI_TYPE_TEMPLATE_FILENAMES.book),
    liveAction: joinVaultPath(pluginRoot, "templates", BANGUMI_TYPE_TEMPLATE_FILENAMES.liveAction),
  };
}

function buildSourceConfigs(
  pluginId: string,
  configDir = ".obsidian",
  posterFolder = FALLBACK_POSTER_FOLDER
): SourceConfigRoot {
  const pluginRoot = joinVaultPath(configDir, "plugins", pluginId);
  return {
    bangumi: {
      targetFolder: "00-Inbox",
      templatePath: joinVaultPath(pluginRoot, "templates", "bangumi.md"),
      searchLimit: 8,
      typeTemplatePaths: buildDefaultBangumiTypeTemplatePaths(pluginRoot),
      poster: {
        saveLocal: false,
        folder: posterFolder,
      },
      filename: {
        template: "{{title}}",
        collisionTemplate: "{{title}} {{release_year}} {{bangumi_id}}",
      },
    },
    mobygames: {
      targetFolder: "00-Inbox",
      templatePath: joinVaultPath(pluginRoot, "templates", "mobygames.md"),
      searchLimit: 8,
      poster: {
        saveLocal: false,
        folder: posterFolder,
      },
      filename: {
        template: "{{title}}",
        collisionTemplate: "{{title}} {{release_year}} {{mobygames_id}}",
      },
    },
    bilibili_show: {
      targetFolder: "00-Inbox",
      templatePath: joinVaultPath(pluginRoot, "templates", "bilibili-show.md"),
      searchLimit: 8,
      poster: {
        saveLocal: false,
        folder: posterFolder,
      },
      filename: {
        template: "{{title}}",
        collisionTemplate: "{{title}} {{release_year}} {{bilibili_show_id}}",
      },
    },
    showstart: {
      targetFolder: "00-Inbox",
      templatePath: joinVaultPath(pluginRoot, "templates", "showstart.md"),
      searchLimit: 8,
      poster: {
        saveLocal: false,
        folder: posterFolder,
      },
      filename: {
        template: "{{title}}",
        collisionTemplate: "{{title}} {{release_year}} {{showstart_activity_id}}",
      },
    },
  };
}

export function getDefaultSourceConfigs(
  configDir = ".obsidian",
  posterFolder = FALLBACK_POSTER_FOLDER
): SourceConfigRoot {
  return buildSourceConfigs(PLUGIN_ID, configDir, posterFolder);
}

export function getLegacyDefaultSourceConfigs(
  configDir = ".obsidian",
  posterFolder = FALLBACK_POSTER_FOLDER
): SourceConfigRoot {
  return buildSourceConfigs(LEGACY_PLUGIN_ID, configDir, posterFolder);
}

export const DEFAULT_SOURCE_CONFIGS = getDefaultSourceConfigs();
