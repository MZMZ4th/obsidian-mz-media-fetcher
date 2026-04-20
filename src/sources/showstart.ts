import {
  extractYear,
  normalizeDateText,
  normalizeDateValue,
  normalizeSummaryText,
} from "../core/text.ts";
import type { NormalizedMediaItem } from "../types.ts";

export interface ShowstartActivityResponse {
  status?: number;
  state?: number;
  success?: boolean;
  resultCode?: number | string;
  msg?: string;
  message?: string;
  data?: ShowstartActivity | null;
  result?: ShowstartActivity | null;
}

export interface ShowstartActivity {
  activityId?: number | string;
  id?: number | string;
  activityName?: string;
  title?: string;
  activityTitle?: string;
  activityTime?: string;
  showTime?: string;
  startTime?: number | string;
  startDate?: string;
  avatar?: string;
  poster?: string;
  posterUrl?: string;
  image?: string;
  cover?: string;
  banner?: string;
  shareImage?: string;
  activityImg?: string;
  description?: string;
  document?: string;
  content?: string;
  remark?: string;
  url?: string;
  [key: string]: unknown;
}

function ensureHttpsUrl(value: unknown): string {
  const normalized = String(value || "").trim();
  if (!normalized) return "";
  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (normalized.startsWith("//")) return `https:${normalized}`;
  return normalized;
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

function formatTimestamp(value: unknown): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "";
  }

  const milliseconds = numeric > 1e12 ? numeric : numeric * 1000;
  const date = new Date(milliseconds);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeShowstartDate(detail: Record<string, unknown>): string {
  const timestampDate = formatTimestamp(detail.startTime);
  if (timestampDate) return timestampDate;

  const candidates = [
    pickString(detail, ["activityTime", "showTime", "startDate"]),
    pickString(detail, ["activityDate", "date"]),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const direct = normalizeDateValue(candidate);
    if (direct) return direct;

    const dateMatch =
      candidate.match(/\b\d{4}-\d{2}-\d{2}\b/) ||
      candidate.match(/\b\d{4}\/\d{1,2}\/\d{1,2}\b/) ||
      candidate.match(/\b\d{4}\.\d{1,2}\.\d{1,2}\b/);
    if (dateMatch) {
      const normalized = dateMatch[0].replace(/[/.]/g, "-").replace(/-(\d)(?=-|$)/g, "-0$1");
      const value = normalizeDateValue(normalized);
      if (value) return value;
    }

    const readable = normalizeDateText(candidate);
    const readableValue = normalizeDateValue(readable);
    if (readableValue) return readableValue;
  }

  return "";
}

function pickShowstartCover(detail: Record<string, unknown>): string {
  return ensureHttpsUrl(
    pickString(detail, [
      "avatar",
      "poster",
      "posterUrl",
      "image",
      "cover",
      "banner",
      "shareImage",
      "activityImg",
    ])
  );
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

interface ShowstartVenueContainer {
  record: Record<string, unknown>;
  allowGenericName: boolean;
}

function buildVenueText(name: string, address: string): string {
  if (!name) return address;
  if (!address) return name;
  if (address.includes(name)) return address;
  if (name.includes(address)) return name;
  return `${name} · ${address}`;
}

function pickShowstartVenueContainers(detail: Record<string, unknown>): ShowstartVenueContainer[] {
  const containers: ShowstartVenueContainer[] = [{ record: detail, allowGenericName: false }];
  const seen = new Set<Record<string, unknown>>([detail]);

  for (const key of ["venueInfo", "venue_info", "siteInfo", "site_info", "venue", "place"]) {
    const value = detail[key];
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      continue;
    }

    const record = value as Record<string, unknown>;
    if (seen.has(record)) {
      continue;
    }
    seen.add(record);
    containers.push({ record, allowGenericName: true });
  }

  return containers;
}

function pickStringFromVenueContainers(
  containers: ShowstartVenueContainer[],
  keys: string[],
  options: { genericNameOnly?: boolean } = {}
): string {
  for (const container of containers) {
    if (options.genericNameOnly && !container.allowGenericName) {
      continue;
    }

    const picked = pickString(container.record, keys);
    if (picked) {
      return picked;
    }
  }

  return "";
}

function appendVenuePart(parts: string[], value: unknown): void {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return;
  }

  const duplicateIndex = parts.findIndex(
    (part) =>
      part === normalized || part.includes(normalized) || normalized.includes(part)
  );

  if (duplicateIndex === -1) {
    parts.push(normalized);
    return;
  }

  if (normalized.length > parts[duplicateIndex].length) {
    parts.splice(duplicateIndex, 1, normalized);
  }
}

function buildVenueAddressFromParts(containers: ShowstartVenueContainer[]): string {
  const parts: string[] = [];

  appendVenuePart(
    parts,
    pickStringFromVenueContainers(containers, ["provinceName", "province_name", "province"])
  );
  appendVenuePart(
    parts,
    pickStringFromVenueContainers(containers, ["cityName", "city_name", "city"])
  );
  appendVenuePart(
    parts,
    pickStringFromVenueContainers(containers, ["districtName", "district_name", "district"])
  );
  appendVenuePart(
    parts,
    pickStringFromVenueContainers(containers, [
      "detailAddress",
      "detail_address",
      "venueAddress",
      "venue_address",
      "placeAddress",
      "place_address",
      "address",
      "addr",
    ])
  );

  return parts.join("");
}

function pickShowstartVenue(detail: Record<string, unknown>): {
  venueName: string;
  venueAddress: string;
  venueText: string;
} {
  const containers = pickShowstartVenueContainers(detail);
  const venueName =
    pickStringFromVenueContainers(containers, [
      "venueName",
      "venue_name",
      "siteName",
      "site_name",
      "placeName",
      "place_name",
      "shopName",
      "stadiumName",
    ]) ||
    pickStringFromVenueContainers(
      containers,
      ["name", "venue", "place"],
      { genericNameOnly: true }
    );

  const venueAddress =
    pickStringFromVenueContainers(containers, [
      "venueAddress",
      "venue_address",
      "placeAddress",
      "place_address",
      "address",
      "addr",
    ]) || buildVenueAddressFromParts(containers);

  return {
    venueName,
    venueAddress,
    venueText: buildVenueText(venueName, venueAddress),
  };
}

export function parseShowstartActivityId(input: string): number | null {
  const text = String(input || "").trim();
  if (!text) {
    throw new Error("请先贴上秀动活动详情页链接。");
  }

  let url: URL;
  try {
    url = new URL(text);
  } catch (_error) {
    throw new Error("秀动目前只支持直接贴活动详情页链接。");
  }

  if (!/showstart\.com$/i.test(url.hostname) && !/\.showstart\.com$/i.test(url.hostname)) {
    throw new Error("这不是秀动的链接。");
  }

  const eventMatch = url.pathname.match(/^\/event\/(\d+)(?:\/)?$/);
  if (eventMatch) {
    return Number(eventMatch[1]);
  }

  if (url.pathname !== "/pages/activity/detail/detail") {
    throw new Error("请贴秀动具体活动详情页链接，不是列表页或其他页面。");
  }

  const activityId = Number(url.searchParams.get("activityId") || url.searchParams.get("id"));
  if (!Number.isInteger(activityId) || activityId <= 0) {
    throw new Error("这个秀动链接里没有有效的 activityId。");
  }

  return activityId;
}

export function normalizeShowstartActivityUrl(activityId: number): string {
  return `https://wap.showstart.com/pages/activity/detail/detail?activityId=${activityId}`;
}

export function unwrapShowstartActivityResponse(
  payload: ShowstartActivityResponse,
  activityId: number
): ShowstartActivity {
  const data = payload?.data || payload?.result;
  const responseActivityId = pickNumber((data || {}) as Record<string, unknown>, [
    "activityId",
    "id",
  ]);

  const state = Number(payload?.state);
  const status = Number(payload?.status);
  const resultCode = Number(payload?.resultCode);
  const explicitlyFailed =
    (Number.isFinite(state) && state !== 1 && state !== 200) ||
    (Number.isFinite(status) && status >= 400) ||
    (Number.isFinite(resultCode) && resultCode !== 0 && resultCode !== 1 && resultCode !== 200);

  if (
    explicitlyFailed ||
    !data ||
    (responseActivityId !== null && responseActivityId !== Number(activityId))
  ) {
    const message = String(payload?.msg || payload?.message || "").trim();
    throw new Error(message || `秀动活动读取失败：${activityId}`);
  }

  return data;
}

export function normalizeShowstartActivity(detail: ShowstartActivity): NormalizedMediaItem {
  const record = (detail || {}) as Record<string, unknown>;
  const activityId = pickNumber(record, ["activityId", "id"]);
  if (!activityId) {
    throw new Error("秀动活动数据里没有有效的 activityId。");
  }

  const title =
    pickString(record, ["activityName", "title", "activityTitle"]) || `秀动活动 ${activityId}`;
  const releaseDate = normalizeShowstartDate(record);
  const summary = normalizeSummaryText(
    pickString(record, ["document", "description", "content", "remark", "summary"])
  );
  const { venueName, venueAddress, venueText } = pickShowstartVenue(record);

  return {
    showstart_activity_id: activityId,
    showstart_url: normalizeShowstartActivityUrl(activityId),
    title,
    title_original: "",
    aliases: [],
    media_type: "",
    release_date: releaseDate,
    release_year: extractYear(releaseDate),
    cover_remote: pickShowstartCover(record),
    summary,
    platforms: [],
    platforms_text: "",
    venue_name: venueName,
    venue_address: venueAddress,
    venue_text: venueText,
  };
}
