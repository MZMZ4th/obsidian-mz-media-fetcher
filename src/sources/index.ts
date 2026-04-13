import { bangumiSource } from "./bangumi-source.ts";
import { mobygamesSource } from "./mobygames-source.ts";
import type { MediaSource, SourceId } from "../types.ts";

export const MEDIA_SOURCES: MediaSource[] = [bangumiSource, mobygamesSource];

export const MEDIA_SOURCE_MAP: Record<SourceId, MediaSource> = {
  bangumi: bangumiSource,
  mobygames: mobygamesSource,
};
