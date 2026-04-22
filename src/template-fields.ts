import type { SourceId, TemplateVariableDefinition } from "./types.ts";

const COMMON_TEMPLATE_VARIABLES: TemplateVariableDefinition[] = [
  { key: "title", description: "当前卡片标题。" },
  { key: "title_original", description: "原名。" },
  { key: "aliases", description: "别名列表；直接使用时会拼成逗号分隔文本。" },
  { key: "media_type", description: "媒体类型。" },
  { key: "release_date", description: "发布日期，格式为 YYYY-MM-DD。" },
  { key: "release_year", description: "发行年份。" },
  { key: "cover_remote", description: "来源站点返回的远程海报链接。" },
  { key: "summary", description: "简介正文。" },
  { key: "platforms", description: "平台列表；直接使用时会拼成逗号分隔文本。" },
  { key: "platforms_text", description: "平台列表的换行文本。" },
  { key: "poster_path", description: "海报真实值；网络海报时是 URL，本地海报时是 vault 相对路径。" },
  { key: "poster", description: "按 Obsidian 链接规则收敛后的海报文本；本地海报优先用文件名，重名时退回最短唯一路径。" },
  { key: "network_poster", description: "当前海报是否仍是网络链接。" },
  { key: "categories", description: "默认分类。" },
  { key: "source", description: "来源 id。" },
  { key: "rating", description: "预留评分默认值。" },
  { key: "status", description: "预留状态默认值。" },
  { key: "finished_at", description: "预留完成时间默认值。" },
  { key: "rewatch_count", description: "预留体验次数默认值。" },
  { key: "cover_markdown", description: "基于 poster 生成的现成封面 Markdown。", yamlSafe: false },
];

const SOURCE_SPECIFIC_TEMPLATE_VARIABLES: Record<SourceId, TemplateVariableDefinition[]> = {
  bangumi: [
    { key: "bangumi_id", description: "Bangumi 条目 ID。" },
    { key: "bangumi_url", description: "Bangumi 条目链接。" },
    { key: "authors", description: "作者列表；直接使用时会拼成逗号分隔文本。" },
    { key: "publishers", description: "出版社列表；直接使用时会拼成逗号分隔文本。" },
    { key: "serial_magazines", description: "连载杂志列表；直接使用时会拼成逗号分隔文本。" },
  ],
  mobygames: [
    { key: "mobygames_id", description: "MobyGames 游戏 ID。" },
    { key: "mobygames_url", description: "MobyGames 游戏链接。" },
  ],
  bilibili_show: [
    { key: "bilibili_show_id", description: "会员购项目 ID。" },
    { key: "bilibili_show_url", description: "会员购详情页链接。" },
    { key: "venue_name", description: "演出场所名称。" },
    { key: "venue_address", description: "演出场所地址。" },
    { key: "venue_text", description: "演出场所的一行文本，优先拼接名称和地址。" },
  ],
  showstart: [
    { key: "showstart_activity_id", description: "秀动活动 ID。" },
    { key: "showstart_url", description: "秀动活动详情页链接。" },
    { key: "venue_name", description: "演出场所名称。" },
    { key: "venue_address", description: "演出场所地址。" },
    { key: "venue_text", description: "演出场所的一行文本，优先拼接名称和地址。" },
  ],
};

const PREVIEW_INLINE_VARIABLES = new Set([
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
  "venue_text",
]);

const PREVIEW_BLOCK_VARIABLES = ["summary", "platforms_text", "cover_markdown"];

export const BANGUMI_REFRESH_MANAGED_VARIABLES = [
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
  "network_poster",
] as const;

export type BangumiRefreshManagedVariable =
  (typeof BANGUMI_REFRESH_MANAGED_VARIABLES)[number];

export const BANGUMI_REFRESH_MANAGED_VARIABLE_SET = new Set<string>(
  BANGUMI_REFRESH_MANAGED_VARIABLES
);

export function getSourceTemplateVariables(sourceId: SourceId): TemplateVariableDefinition[] {
  return [...COMMON_TEMPLATE_VARIABLES, ...SOURCE_SPECIFIC_TEMPLATE_VARIABLES[sourceId]];
}

export const SOURCE_TEMPLATE_VARIABLES_MAP: Record<SourceId, TemplateVariableDefinition[]> = {
  bangumi: getSourceTemplateVariables("bangumi"),
  mobygames: getSourceTemplateVariables("mobygames"),
  bilibili_show: getSourceTemplateVariables("bilibili_show"),
  showstart: getSourceTemplateVariables("showstart"),
};

export function buildTemplatePreviewSection(sourceId: SourceId): string {
  const variables = getSourceTemplateVariables(sourceId);
  const lines = ["## 抓取字段预览", ""];

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

  return `${lines.join("\n")}\n`;
}
