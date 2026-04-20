import { extractYear, normalizeSummaryText } from "../core/text.ts";
import type { NormalizedMediaItem } from "../types.ts";

export interface BilibiliShowProjectResponse {
  errno?: number;
  msg?: string;
  data?: BilibiliShowProject;
}

export interface BilibiliShowProject {
  id: number;
  name?: string;
  description?: string;
  cover?: string;
  banner?: string;
  start_time?: number;
  [key: string]: unknown;
}

function ensureHttpsUrl(value: unknown): string {
  const normalized = String(value || "").trim();
  if (!normalized) return "";
  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (normalized.startsWith("//")) return `https:${normalized}`;
  return normalized;
}

function formatUnixTimestamp(timestamp: unknown): string {
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "";
  }

  const date = new Date(seconds * 1000);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

function pickNestedString(
  detail: Record<string, unknown>,
  containerKeys: string[],
  valueKeys: string[]
): string {
  for (const containerKey of containerKeys) {
    const container = detail[containerKey];
    if (!container || typeof container !== "object" || Array.isArray(container)) {
      continue;
    }

    const picked = pickString(container as Record<string, unknown>, valueKeys);
    if (picked) {
      return picked;
    }
  }

  return "";
}

function buildVenueText(name: string, address: string): string {
  if (!name) return address;
  if (!address) return name;
  if (address.includes(name)) return address;
  if (name.includes(address)) return name;
  return `${name} · ${address}`;
}

function pickBilibiliVenue(detail: Record<string, unknown>): {
  venueName: string;
  venueAddress: string;
  venueText: string;
} {
  const venueName =
    pickString(detail, [
      "venue_name",
      "venueName",
      "venue",
      "site_name",
      "siteName",
      "place_name",
      "placeName",
      "place",
      "screen_name",
      "screenName",
    ]) ||
    pickNestedString(detail, ["venue_info", "venueInfo", "site_info", "siteInfo"], [
      "venue_name",
      "venueName",
      "name",
      "site_name",
      "siteName",
      "place_name",
      "placeName",
      "screen_name",
      "screenName",
    ]);

  const venueAddress =
    pickString(detail, [
      "venue_address",
      "venueAddress",
      "address",
      "addr",
      "detail_address",
      "detailAddress",
      "place_address",
      "placeAddress",
      "city_name",
      "cityName",
      "city",
    ]) ||
    pickNestedString(detail, ["venue_info", "venueInfo", "site_info", "siteInfo"], [
      "venue_address",
      "venueAddress",
      "address",
      "addr",
      "detail_address",
      "detailAddress",
      "place_address",
      "placeAddress",
      "city_name",
      "cityName",
      "city",
    ]);

  return {
    venueName,
    venueAddress,
    venueText: buildVenueText(venueName, venueAddress),
  };
}

export function parseBilibiliShowProjectId(input: string): number | null {
  const text = String(input || "").trim();
  if (!text) {
    throw new Error("请先贴上 bilibili 会员购详情页链接。");
  }

  let url: URL;
  try {
    url = new URL(text);
  } catch (_error) {
    throw new Error("bilibili会员购目前只支持直接贴详情页链接。");
  }

  if (!/show\.bilibili\.com$/i.test(url.hostname)) {
    throw new Error("这不是 bilibili 会员购详情页链接。");
  }

  if (url.pathname !== "/platform/detail.html") {
    throw new Error("请贴 bilibili 会员购具体详情页链接，不是列表页或其他页面。");
  }

  const projectId = Number(url.searchParams.get("id"));
  if (!Number.isInteger(projectId) || projectId <= 0) {
    throw new Error("这个 bilibili 会员购链接里没有有效的项目 id。");
  }

  return projectId;
}

export function normalizeBilibiliShowProjectUrl(projectId: number): string {
  return `https://show.bilibili.com/platform/detail.html?id=${projectId}`;
}

export function unwrapBilibiliShowProjectResponse(
  payload: BilibiliShowProjectResponse,
  projectId: number
): BilibiliShowProject {
  if (Number(payload?.errno) !== 0 || !payload?.data) {
    throw new Error(payload?.msg || `bilibili会员购项目读取失败：${projectId}`);
  }

  if (Number(payload.data.id) !== Number(projectId)) {
    throw new Error(`bilibili会员购项目读取失败：${projectId}`);
  }

  return payload.data;
}

export function normalizeBilibiliShowProject(
  detail: BilibiliShowProject
): NormalizedMediaItem {
  const projectId = Number(detail?.id);
  const releaseDate = formatUnixTimestamp(detail?.start_time);
  const coverRemote = ensureHttpsUrl(detail?.cover) || ensureHttpsUrl(detail?.banner);
  const record = (detail || {}) as Record<string, unknown>;
  const { venueName, venueAddress, venueText } = pickBilibiliVenue(record);

  return {
    bilibili_show_id: projectId,
    bilibili_show_url: normalizeBilibiliShowProjectUrl(projectId),
    title: String(detail?.name || "").trim() || `bilibili会员购 ${projectId}`,
    title_original: "",
    aliases: [],
    media_type: "",
    release_date: releaseDate,
    release_year: extractYear(releaseDate),
    cover_remote: coverRemote,
    summary: normalizeSummaryText(detail?.description || ""),
    platforms: [],
    platforms_text: "",
    venue_name: venueName,
    venue_address: venueAddress,
    venue_text: venueText,
  };
}
