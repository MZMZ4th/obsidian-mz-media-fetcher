import { requestText } from "../core/http.ts";
import type { MediaSource } from "../types.ts";
import {
  MobyGameDetail,
  normalizeMobyGame,
  normalizeMobyGamesGameUrl,
  parseMobyGamesGamePage,
} from "./mobygames.ts";

async function fetchMobyGame(url: string): Promise<MobyGameDetail> {
  const response = await requestText(url);
  return parseMobyGamesGamePage(response, url);
}

export const mobygamesSource: MediaSource<never, string, MobyGameDetail> = {
  id: "mobygames",
  label: "MobyGames",
  commandId: "create-mobygames-card",
  commandName: "从 MobyGames 新建作品卡片",
  inputTitle: "从 MobyGames 新建作品卡片",
  inputHint: "贴 MobyGames 游戏页面链接，插件会直接抓公开页面内容。",
  inputPlaceholder: "例如：https://www.mobygames.com/game/217980/balatro/",
  parseDirectInput: normalizeMobyGamesGameUrl,
  fetchByDirectInput: (directInput) => fetchMobyGame(directInput),
  normalize: normalizeMobyGame,
};
