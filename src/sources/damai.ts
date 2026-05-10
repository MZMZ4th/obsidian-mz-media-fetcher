import {
  decodeHtmlEntities,
  extractYear,
  normalizeDateValue,
  normalizeSummaryText,
} from "../core/text.ts";
import type { NormalizedMediaItem } from "../types.ts";

export interface DamaiPageDetail {
  damai_item_id: number;
  damai_url: string;
  title: string;
  media_type: string;
  show_time: string;
  release_date: string;
  cover_remote: string;
  summary: string;
  city_name: string;
  venue_name: string;
  venue_address: string;
  venue_text: string;
}

interface DamaiHiddenPayloads {
  dataDefault?: Record<string, unknown>;
  staticDataDefault?: Record<string, unknown>;
}

function pickRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function pickString(detail: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = detail[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function pickNumber(detail: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const numeric = Number(detail[key]);
    if (Number.isInteger(numeric) && numeric > 0) {
      return numeric;
    }
  }
  return null;
}

function ensureHttpsUrl(value: unknown): string {
  const normalized = String(value || "").trim();
  if (!normalized) return "";
  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (normalized.startsWith("//")) return `https:${normalized}`;
  return normalized;
}

function buildVenueText(name: string, address: string): string {
  if (!name) return address;
  if (!address) return name;
  if (address.includes(name)) return address;
  if (name.includes(address)) return name;
  return `${name} · ${address}`;
}

function decodeMaybeUriComponent(value: unknown): string {
  const text = String(value || "");
  if (!text) return "";

  try {
    return decodeURIComponent(text);
  } catch (_error) {
    return text;
  }
}

function parseHiddenJson(html: string, elementId: string): Record<string, unknown> {
  const pattern = new RegExp(
    `<div[^>]+id=["']${elementId}["'][^>]*>([\\s\\S]*?)<\\/div>`,
    "i"
  );
  const match = html.match(pattern);
  if (!match) {
    return {};
  }

  const text = match[1].trim();
  if (!text) {
    return {};
  }

  const candidates = [text, decodeHtmlEntities(text)];
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as Record<string, unknown>;
    } catch (_error) {
      // Try the next representation.
    }
  }

  throw new Error(`大麦页面里的 ${elementId} 不是有效 JSON。`);
}

function parseDamaiHiddenPayloads(html: string): DamaiHiddenPayloads {
  return {
    dataDefault: parseHiddenJson(html, "dataDefault"),
    staticDataDefault: parseHiddenJson(html, "staticDataDefault"),
  };
}

function normalizeDamaiShowDate(showTime: unknown): string {
  const text = String(showTime || "").trim();
  if (!text) return "";

  const direct =
    text.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/) ||
    text.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/);
  if (!direct) return "";

  const year = direct[1];
  const month = direct[2].padStart(2, "0");
  const day = direct[3].padStart(2, "0");
  return normalizeDateValue(`${year}-${month}-${day}`);
}

function pickDamaiCover(itemBase: Record<string, unknown>): string {
  const direct = ensureHttpsUrl(pickString(itemBase, ["itemPic", "cover", "poster", "image"]));
  if (direct) {
    return direct;
  }

  const itemPics = pickRecord(itemBase.itemPics);
  const itemPicList = Array.isArray(itemPics.itemPicList) ? itemPics.itemPicList : [];
  for (const item of itemPicList) {
    const picUrl = ensureHttpsUrl(pickString(pickRecord(item), ["picUrl", "url"]));
    if (picUrl) {
      return picUrl;
    }
  }

  return "";
}

function pickDamaiSummary(staticDataDefault: Record<string, unknown>): string {
  const itemExtendInfo = pickRecord(staticDataDefault.itemExtendInfo);
  const itemExtend = pickString(itemExtendInfo, ["itemExtend", "content", "description"]);
  if (!itemExtend) {
    return "";
  }

  return normalizeSummaryText(decodeMaybeUriComponent(itemExtend));
}

export function parseDamaiItemId(input: string): number {
  const text = String(input || "").trim();
  if (!text) {
    throw new Error("请先贴上大麦网演出详情页链接。");
  }

  let url: URL;
  try {
    url = new URL(text);
  } catch (_error) {
    throw new Error("大麦网目前只支持直接贴演出详情页链接。");
  }

  const hostname = url.hostname.toLowerCase();
  const isPcDetail = hostname === "detail.damai.cn" && url.pathname === "/item.htm";
  const isMobileDetail =
    (hostname === "m.damai.cn" || hostname === "m.taopiaopiao.com") &&
    /\/item\.html$/i.test(url.pathname);

  if (!isPcDetail && !isMobileDetail) {
    throw new Error("请贴大麦网具体演出详情页链接，不是列表页或其他页面。");
  }

  const itemId = Number(url.searchParams.get("id") || url.searchParams.get("itemId"));
  if (!Number.isInteger(itemId) || itemId <= 0) {
    throw new Error("这个大麦网链接里没有有效的 itemId。");
  }

  return itemId;
}

export function normalizeDamaiItemUrl(itemId: number): string {
  return `https://detail.damai.cn/item.htm?id=${itemId}`;
}

export function parseDamaiItemPage(html: string, fallbackItemId?: number): DamaiPageDetail {
  const payloads = parseDamaiHiddenPayloads(html);
  const staticDataDefault = pickRecord(payloads.staticDataDefault);
  const dataDefault = pickRecord(payloads.dataDefault);
  const itemBase = pickRecord(staticDataDefault.itemBase);
  const venue = pickRecord(staticDataDefault.venue);
  const itemId =
    pickNumber(itemBase, ["itemId", "id"]) ||
    pickNumber(dataDefault, ["itemId", "id"]) ||
    (Number.isInteger(fallbackItemId) && Number(fallbackItemId) > 0 ? Number(fallbackItemId) : null);

  if (!itemId) {
    throw new Error("大麦页面结构和预期不一致，暂时没法读出演出 ID。");
  }

  const title = pickString(itemBase, ["itemName", "title", "name"]) || `大麦网演出 ${itemId}`;
  const showTime = pickString(itemBase, ["showTime", "show_time", "time"]);
  const releaseDate = normalizeDamaiShowDate(showTime);
  const venueName = pickString(venue, ["venueName", "name"]);
  const venueAddress = pickString(venue, ["venueAddr", "venueAddress", "address", "addr"]);
  const cityName =
    pickString(itemBase, ["cityName", "city"]) ||
    pickString(venue, ["venueCityName", "cityName", "city"]);

  return {
    damai_item_id: itemId,
    damai_url: normalizeDamaiItemUrl(itemId),
    title,
    media_type: pickString(itemBase, ["guideCat", "categoryName", "category"]),
    show_time: showTime,
    release_date: releaseDate,
    cover_remote: pickDamaiCover(itemBase),
    summary: pickDamaiSummary(staticDataDefault),
    city_name: cityName,
    venue_name: venueName,
    venue_address: venueAddress,
    venue_text: buildVenueText(venueName, venueAddress),
  };
}

export function normalizeDamaiItem(detail: DamaiPageDetail): NormalizedMediaItem {
  const itemId = Number(detail?.damai_item_id);

  return {
    damai_item_id: itemId,
    damai_url: String(detail?.damai_url || "").trim() || normalizeDamaiItemUrl(itemId),
    title: String(detail?.title || "").trim() || `大麦网演出 ${itemId}`,
    title_original: "",
    aliases: [],
    media_type: String(detail?.media_type || "").trim(),
    release_date: normalizeDateValue(detail?.release_date),
    release_year: extractYear(detail?.release_date),
    cover_remote: String(detail?.cover_remote || "").trim(),
    summary: normalizeSummaryText(detail?.summary || ""),
    platforms: [],
    platforms_text: "",
    show_time: String(detail?.show_time || "").trim(),
    city_name: String(detail?.city_name || "").trim(),
    venue_name: String(detail?.venue_name || "").trim(),
    venue_address: String(detail?.venue_address || "").trim(),
    venue_text: String(detail?.venue_text || "").trim(),
  };
}
