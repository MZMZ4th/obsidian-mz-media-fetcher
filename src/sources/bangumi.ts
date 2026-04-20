import {
  extractYear,
  normalizeDateValue,
  normalizeSummaryText,
  safeYear,
  sanitizeList,
} from "../core/text.ts";
import type { NormalizedMediaItem, SourceSuggestItem } from "../types.ts";

export interface BangumiSearchItem {
  id: number;
  name?: string;
  name_cn?: string;
  date?: string;
  type?: number;
}

export interface BangumiSubject {
  id: number;
  name?: string;
  name_cn?: string;
  date?: string;
  type?: number;
  summary?: string;
  images?: Record<string, string>;
  infobox?: Array<{ key?: string; value?: unknown }>;
}

function mapBangumiSubjectType(type: unknown): string {
  const mapping: Record<number, string> = {
    1: "书籍",
    2: "动画",
    3: "音乐",
    4: "游戏",
    6: "三次元",
  };
  return mapping[Number(type)] || "条目";
}

function extractInfoboxValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => extractInfoboxValues(entry));
  }

  if (value && typeof value === "object") {
    if (typeof (value as any).v !== "undefined") {
      return extractInfoboxValues((value as any).v);
    }
    return [];
  }

  const normalized = String(value || "").trim();
  return normalized ? [normalized] : [];
}

function collectBangumiAliases(
  subject: BangumiSubject,
  preferredTitle: string,
  originalTitle: string
): string[] {
  return collectBangumiInfoboxValues(subject, ["别名"], [preferredTitle, originalTitle]);
}

function collectBangumiInfoboxValues(
  subject: BangumiSubject,
  keys: string[],
  excludedValues: string[] = []
): string[] {
  const aliases: string[] = [];
  const seen = new Set<string>();
  const normalizedExcludedValues = new Set(
    excludedValues.map((value) => String(value || "").trim()).filter(Boolean)
  );
  const keySet = new Set(keys.map((key) => key.trim()));

  const pushAlias = (value: unknown) => {
    const normalized = String(value || "").trim();
    if (!normalized) return;
    if (normalizedExcludedValues.has(normalized)) return;
    if (seen.has(normalized)) return;
    seen.add(normalized);
    aliases.push(normalized);
  };

  if (Array.isArray(subject.infobox)) {
    for (const item of subject.infobox) {
      if (!keySet.has(String(item?.key || "").trim())) continue;
      extractInfoboxValues(item?.value).forEach(pushAlias);
    }
  }

  return sanitizeList(aliases, 20);
}

function pickBangumiCover(images: unknown): string {
  if (!images || typeof images !== "object") return "";
  const imageMap = images as Record<string, string>;
  return (
    String(imageMap.large || "").trim() ||
    String(imageMap.common || "").trim() ||
    String(imageMap.medium || "").trim() ||
    String(imageMap.grid || "").trim() ||
    String(imageMap.small || "").trim()
  );
}

export function parseBangumiSubjectId(input: string): number | null {
  const match = String(input || "").match(/(?:bgm\.tv|bangumi\.tv|chii\.in)\/subject\/(\d+)/i);
  if (match) return Number(match[1]);

  const numeric = String(input || "").trim();
  if (/^\d+$/.test(numeric)) {
    return Number(numeric);
  }

  return null;
}

export function normalizeBangumiSearchItem(item: BangumiSearchItem): SourceSuggestItem<BangumiSearchItem> {
  const title =
    String(item?.name_cn || "").trim() ||
    String(item?.name || "").trim() ||
    `Bangumi ${item?.id || ""}`;
  const originalTitle = String(item?.name || "").trim();
  const subtitle = [
    originalTitle && originalTitle !== title ? originalTitle : "",
    safeYear(item?.date),
    mapBangumiSubjectType(item?.type),
    item?.id ? `ID ${item.id}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    item,
    title,
    subtitle,
    searchText: [title, originalTitle].filter(Boolean).join(" "),
  };
}

export function normalizeBangumiSubject(subject: BangumiSubject): NormalizedMediaItem {
  const preferredTitle =
    String(subject?.name_cn || "").trim() || String(subject?.name || "").trim();
  const originalTitle = String(subject?.name || "").trim();
  const titleOriginal = originalTitle && originalTitle !== preferredTitle ? originalTitle : "";
  const releaseDate = normalizeDateValue(subject?.date);
  const releaseYear = extractYear(subject?.date);
  const aliases = collectBangumiAliases(subject, preferredTitle, originalTitle);
  const authors = collectBangumiInfoboxValues(subject, ["作者"]);
  const publishers = collectBangumiInfoboxValues(subject, ["出版社"]);
  const serialMagazines = collectBangumiInfoboxValues(subject, ["连载杂志"]);

  return {
    bangumi_id: Number(subject?.id),
    bangumi_url: `https://bgm.tv/subject/${subject?.id}`,
    title: preferredTitle || `Bangumi ${subject?.id}`,
    title_original: titleOriginal,
    aliases,
    media_type: mapBangumiSubjectType(subject?.type),
    release_date: releaseDate,
    release_year: releaseYear,
    cover_remote: pickBangumiCover(subject?.images),
    summary: normalizeSummaryText(subject?.summary),
    platforms: [],
    platforms_text: "",
    authors,
    publishers,
    serial_magazines: serialMagazines,
  };
}
