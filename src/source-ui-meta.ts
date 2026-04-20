import { SOURCE_TEMPLATE_VARIABLES_MAP } from "./template-fields.ts";
import type { MediaSourceUiMeta, SourceId } from "./types.ts";

export const MEDIA_SOURCE_UI_META_MAP: Record<SourceId, MediaSourceUiMeta> = {
  bangumi: {
    supportsSearch: true,
    inputFieldLabel: "作品名、链接或 ID",
    featureNotes: [
      "支持标题搜索，并从候选条目里选择后再创建卡片。",
      "支持直接粘贴 Bangumi 条目链接。",
      "支持直接输入数字条目 ID。",
      "支持按游戏、动画、书籍、三次元自动切换到不同模板；留空时会回退通用模板。",
      "会按模板新建作品卡片，并可按配置决定是否下载本地海报。",
      "支持对当前打开的 Bangumi 卡片重新补全 frontmatter，不会重写正文。",
    ],
    templateVariables: SOURCE_TEMPLATE_VARIABLES_MAP.bangumi,
  },
  mobygames: {
    supportsSearch: false,
    inputFieldLabel: "详情链接",
    featureNotes: [
      "只支持直接粘贴 MobyGames 具体游戏页面链接。",
      "不支持搜索页、列表页或站内标题搜索。",
      "会抓取公开页面内容并按模板新建作品卡片。",
    ],
    templateVariables: SOURCE_TEMPLATE_VARIABLES_MAP.mobygames,
  },
  bilibili_show: {
    supportsSearch: false,
    inputFieldLabel: "详情链接",
    featureNotes: [
      "只支持直接粘贴 bilibili 会员购活动详情页链接。",
      "不支持站内搜索。",
      "会直接读取项目详情接口，不解析页面正文。",
    ],
    templateVariables: SOURCE_TEMPLATE_VARIABLES_MAP.bilibili_show,
  },
  showstart: {
    supportsSearch: false,
    inputFieldLabel: "详情链接",
    featureNotes: [
      "只支持直接粘贴秀动活动详情页链接。",
      "不支持站内搜索。",
      "会读取秀动活动详情接口，不解析页面正文。",
    ],
    templateVariables: SOURCE_TEMPLATE_VARIABLES_MAP.showstart,
  },
};
