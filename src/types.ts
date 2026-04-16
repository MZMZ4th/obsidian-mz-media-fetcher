export const SOURCE_IDS = ["bangumi", "mobygames", "bilibili_show"] as const;

export type SourceId = (typeof SOURCE_IDS)[number];

export interface SourceConfig {
  targetFolder: string;
  templatePath: string;
  searchLimit: number;
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
  [key: string]: unknown;
}

export interface SourceSuggestItem<TItem = unknown> {
  item: TItem;
  title: string;
  subtitle: string;
  searchText: string;
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
