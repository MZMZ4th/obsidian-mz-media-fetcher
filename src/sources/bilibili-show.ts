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
  };
}
