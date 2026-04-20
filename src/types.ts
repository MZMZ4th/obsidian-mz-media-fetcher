export const SOURCE_IDS = ["bangumi", "mobygames", "bilibili_show", "showstart"] as const;

export type SourceId = (typeof SOURCE_IDS)[number];
export const BANGUMI_TEMPLATE_TYPES = ["game", "anime", "book", "liveAction"] as const;
export type BangumiTemplateType = (typeof BANGUMI_TEMPLATE_TYPES)[number];

export interface BangumiTypeTemplatePaths {
  game: string;
  anime: string;
  book: string;
  liveAction: string;
}

export interface SourceConfig {
  targetFolder: string;
  templatePath: string;
  searchLimit: number;
  typeTemplatePaths?: BangumiTypeTemplatePaths;
  poster: {
    saveLocal: boolean;
    folder: string;
  };
  filename: {
    template: string;
    collisionTemplate: string;
  };
}

export type SourceConfigRoot = Record<SourceId, SourceConfig>;

export interface NormalizedMediaItem {
  title: string;
  title_original: string;
  aliases: string[];
  media_type: string;
  release_date: string;
  release_year: string;
  cover_remote: string;
  summary: string;
  platforms: string[];
  platforms_text: string;
  venue_name?: string;
  venue_address?: string;
  venue_text?: string;
  [key: string]: unknown;
}

export interface SourceSuggestItem<TItem = unknown> {
  item: TItem;
  title: string;
  subtitle: string;
  searchText: string;
}

export interface TemplateVariableDefinition {
  key: string;
  description: string;
  yamlSafe?: boolean;
}

export interface MediaSourceUiMeta {
  supportsSearch: boolean;
  inputFieldLabel: string;
  featureNotes: string[];
  templateVariables: TemplateVariableDefinition[];
}

export interface MediaSource<SearchItem = unknown, DirectInput = unknown, RawDetail = unknown> {
  id: SourceId;
  label: string;
  commandId: string;
  commandName: string;
  inputTitle: string;
  inputHint: string;
  inputPlaceholder: string;
  parseDirectInput(input: string): DirectInput | null;
  search?: (query: string, config: SourceConfig) => Promise<SearchItem[]>;
  toSuggestItem?: (item: SearchItem) => SourceSuggestItem<SearchItem>;
  fetchByDirectInput: (
    directInput: DirectInput,
    config: SourceConfig
  ) => Promise<RawDetail>;
  fetchBySearchItem?: (item: SearchItem, config: SourceConfig) => Promise<RawDetail>;
  normalize: (detail: RawDetail) => NormalizedMediaItem;
}

export interface VaultInfo {
  name: string;
  path: string;
}
