import { BANGUMI_API_BASE } from "../config/defaults.ts";
import { requestJson } from "../core/http.ts";
import type { MediaSource } from "../types.ts";
import {
  BangumiSearchItem,
  BangumiSubject,
  normalizeBangumiSearchItem,
  normalizeBangumiSubject,
  parseBangumiSubjectId,
} from "./bangumi.ts";

async function searchBangumiSubjects(query: string, limit: number): Promise<BangumiSearchItem[]> {
  const response = await requestJson<{ data?: BangumiSearchItem[] }>(
    `${BANGUMI_API_BASE}/search/subjects?limit=${limit}`,
    {
      method: "POST",
      body: JSON.stringify({ keyword: query }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!Array.isArray(response?.data)) {
    throw new Error("Bangumi 搜索结果格式不对。");
  }

  return response.data;
}

async function fetchBangumiSubject(subjectId: number): Promise<BangumiSubject> {
  const response = await requestJson<BangumiSubject>(`${BANGUMI_API_BASE}/subjects/${subjectId}`);
  if (!response || Number(response.id) !== Number(subjectId)) {
    throw new Error(`Bangumi 条目读取失败：${subjectId}`);
  }
  return response;
}

export const bangumiSource: MediaSource<BangumiSearchItem, number, BangumiSubject> = {
  id: "bangumi",
  label: "Bangumi",
  commandId: "create-bangumi-card",
  commandName: "从 Bangumi 新建作品卡片",
  inputTitle: "从 Bangumi 新建作品卡片",
  inputHint: "输入作品名，或直接贴 Bangumi 条目链接。",
  inputPlaceholder: "例如：孤独摇滚 / https://bgm.tv/subject/328609",
  parseDirectInput: parseBangumiSubjectId,
  search: (query, config) => searchBangumiSubjects(query, config.searchLimit),
  toSuggestItem: normalizeBangumiSearchItem,
  fetchByDirectInput: (directInput) => fetchBangumiSubject(directInput),
  fetchBySearchItem: (item) => fetchBangumiSubject(item.id),
  normalize: normalizeBangumiSubject,
};
