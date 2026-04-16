import { requestJson } from "../core/http.ts";
import type { MediaSource } from "../types.ts";
import {
  BilibiliShowProjectResponse,
  normalizeBilibiliShowProject,
  parseBilibiliShowProjectId,
  unwrapBilibiliShowProjectResponse,
} from "./bilibili-show.ts";

async function fetchBilibiliShowProject(projectId: number) {
  const response = await requestJson<BilibiliShowProjectResponse>(
    `https://show.bilibili.com/api/ticket/project/get?id=${projectId}`
  );
  return unwrapBilibiliShowProjectResponse(response, projectId);
}

export const bilibiliShowSource: MediaSource<never, number> = {
  id: "bilibili_show",
  label: "bilibili会员购",
  commandId: "create-bilibili-show-card",
  commandName: "从 bilibili会员购新建作品卡片",
  inputTitle: "从 bilibili会员购新建作品卡片",
  inputHint: "贴 bilibili 会员购详情页链接，插件会直接读取项目详情。",
  inputPlaceholder: "例如：https://show.bilibili.com/platform/detail.html?id=107593",
  parseDirectInput: parseBilibiliShowProjectId,
  fetchByDirectInput: (projectId) => fetchBilibiliShowProject(projectId),
  normalize: normalizeBilibiliShowProject,
};
