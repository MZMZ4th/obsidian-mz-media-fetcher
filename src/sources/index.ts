import { bangumiSource } from "./bangumi-source.ts";
import { bilibiliShowSource } from "./bilibili-show-source.ts";
import { mobygamesSource } from "./mobygames-source.ts";
import { showstartSource } from "./showstart-source.ts";
import type { MediaSource, SourceId } from "../types.ts";

export const MEDIA_SOURCES: MediaSource[] = [
  bangumiSource,
  mobygamesSource,
  bilibiliShowSource,
  showstartSource,
];

export const MEDIA_SOURCE_MAP: Record<SourceId, MediaSource> = {
  bangumi: bangumiSource,
  mobygames: mobygamesSource,
  bilibili_show: bilibiliShowSource,
  showstart: showstartSource,
};
