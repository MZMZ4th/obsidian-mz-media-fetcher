import { requestText } from "../core/http.ts";
import type { MediaSource } from "../types.ts";
import {
  DamaiPageDetail,
  normalizeDamaiItem,
  normalizeDamaiItemUrl,
  parseDamaiItemId,
  parseDamaiItemPage,
} from "./damai.ts";

async function fetchDamaiItem(itemId: number): Promise<DamaiPageDetail> {
  const url = normalizeDamaiItemUrl(itemId);
  const response = await requestText(url);
  return parseDamaiItemPage(response, itemId);
}

export const damaiSource: MediaSource<never, number, DamaiPageDetail> = {
  id: "damai",
  label: "大麦网",
  commandId: "create-damai-card",
  commandName: "从大麦网新建作品卡片",
  inputTitle: "从大麦网新建作品卡片",
  inputHint: "贴大麦网演出详情页链接，插件会直接读取页面里的公开演出信息。",
  inputPlaceholder: "例如：https://detail.damai.cn/item.htm?id=1012125810980",
  parseDirectInput: parseDamaiItemId,
  fetchByDirectInput: (itemId) => fetchDamaiItem(itemId),
  normalize: normalizeDamaiItem,
};
