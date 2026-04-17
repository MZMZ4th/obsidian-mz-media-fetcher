import type { MediaSourceUiMeta, SourceId, TemplateVariableDefinition } from "./types.ts";

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
  { key: "poster_path", description: "最终海报路径；下载本地后会变成本地路径。" },
  { key: "poster", description: "模板里推荐直接使用的海报字段。" },
  { key: "network_poster", description: "当前海报是否仍是网络链接。" },
  { key: "categories", description: "默认分类。" },
  { key: "source", description: "来源 id。" },
  { key: "rating", description: "预留评分默认值。" },
  { key: "status", description: "预留状态默认值。" },
  { key: "finished_at", description: "预留完成时间默认值。" },
  { key: "rewatch_count", description: "预留体验次数默认值。" },
  { key: "cover_markdown", description: "现成封面 Markdown。", yamlSafe: false },
];

function buildTemplateVariables(
  sourceSpecific: TemplateVariableDefinition[]
): TemplateVariableDefinition[] {
  return [...COMMON_TEMPLATE_VARIABLES, ...sourceSpecific];
}

export const MEDIA_SOURCE_UI_META_MAP: Record<SourceId, MediaSourceUiMeta> = {
  bangumi: {
    supportsSearch: true,
    inputFieldLabel: "作品名、链接或 ID",
    featureNotes: [
      "支持标题搜索，并从候选条目里选择后再创建卡片。",
      "支持直接粘贴 Bangumi 条目链接。",
      "支持直接输入数字条目 ID。",
      "会按模板新建作品卡片，并可按配置决定是否下载本地海报。",
    ],
    templateVariables: buildTemplateVariables([
      { key: "bangumi_id", description: "Bangumi 条目 ID。" },
      { key: "bangumi_url", description: "Bangumi 条目链接。" },
    ]),
  },
  mobygames: {
    supportsSearch: false,
    inputFieldLabel: "详情链接",
    featureNotes: [
      "只支持直接粘贴 MobyGames 具体游戏页面链接。",
      "不支持搜索页、列表页或站内标题搜索。",
      "会抓取公开页面内容并按模板新建作品卡片。",
    ],
    templateVariables: buildTemplateVariables([
      { key: "mobygames_id", description: "MobyGames 游戏 ID。" },
      { key: "mobygames_url", description: "MobyGames 游戏链接。" },
    ]),
  },
  bilibili_show: {
    supportsSearch: false,
    inputFieldLabel: "详情链接",
    featureNotes: [
      "只支持直接粘贴 bilibili 会员购活动详情页链接。",
      "不支持站内搜索。",
      "会直接读取项目详情接口，不解析页面正文。",
    ],
    templateVariables: buildTemplateVariables([
      { key: "bilibili_show_id", description: "会员购项目 ID。" },
      { key: "bilibili_show_url", description: "会员购详情页链接。" },
    ]),
  },
  showstart: {
    supportsSearch: false,
    inputFieldLabel: "详情链接",
    featureNotes: [
      "只支持直接粘贴秀动活动详情页链接。",
      "不支持站内搜索。",
      "会读取秀动活动详情接口，不解析页面正文。",
    ],
    templateVariables: buildTemplateVariables([
      { key: "showstart_activity_id", description: "秀动活动 ID。" },
      { key: "showstart_url", description: "秀动活动详情页链接。" },
    ]),
  },
};
