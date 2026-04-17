import { requestJson } from "../core/http.ts";
import type { MediaSource } from "../types.ts";
import {
  ShowstartActivity,
  ShowstartActivityResponse,
  normalizeShowstartActivity,
  parseShowstartActivityId,
  unwrapShowstartActivityResponse,
} from "./showstart.ts";
import {
  buildShowstartV3Request,
  extractShowstartAnonymousAuth,
  type ShowstartAnonymousAuth,
  type ShowstartGuestTokenResponse,
} from "./showstart-v3.ts";

const SHOWSTART_GETTOKEN_PATH = "/waf/gettoken";
const SHOWSTART_ACTIVITY_DETAILS_PATH = "/wap/activity/details";
const SHOWSTART_TOKEN_REFRESH_MARGIN_MS = 60 * 1000;

let cachedShowstartAuth: ShowstartAnonymousAuth | null = null;

async function requestShowstartV3<T>(
  path: string,
  body: Record<string, unknown>,
  auth: ShowstartAnonymousAuth | null
): Promise<T> {
  const request = buildShowstartV3Request(path, body, auth || undefined);
  return requestJson<T>(request.url, {
    method: "POST",
    body: request.body,
    headers: {
      "Content-Type": "application/json",
      ...request.headers,
    },
  });
}

function hasValidShowstartAuth(auth: ShowstartAnonymousAuth | null): auth is ShowstartAnonymousAuth {
  return Boolean(
    auth &&
      auth.accessToken &&
      auth.expiresAt &&
      auth.expiresAt - SHOWSTART_TOKEN_REFRESH_MARGIN_MS > Date.now()
  );
}

async function fetchShowstartGuestAuth(forceRefresh = false): Promise<ShowstartAnonymousAuth> {
  if (!forceRefresh && hasValidShowstartAuth(cachedShowstartAuth)) {
    return cachedShowstartAuth;
  }

  const request = buildShowstartV3Request(SHOWSTART_GETTOKEN_PATH, {}, cachedShowstartAuth || undefined);
  const response = await requestJson<ShowstartGuestTokenResponse>(request.url, {
    method: "POST",
    body: request.body,
    headers: {
      "Content-Type": "application/json",
      ...request.headers,
    },
  });
  const nextAuth = extractShowstartAnonymousAuth(response, request.headers.CDEVICENO);

  cachedShowstartAuth = {
    ...nextAuth,
  };

  return cachedShowstartAuth;
}

function shouldRefreshShowstartAuth(error: unknown): boolean {
  const message = String((error as Error)?.message || error || "").toLowerCase();
  return (
    message.includes("登录过期") ||
    message.includes("token-clean") ||
    message.includes("token-expire") ||
    message.includes("user_not_login")
  );
}

async function requestShowstartActivity(
  activityId: number,
  auth: ShowstartAnonymousAuth
): Promise<ShowstartActivityResponse> {
  return requestShowstartV3<ShowstartActivityResponse>(
    SHOWSTART_ACTIVITY_DETAILS_PATH,
    {
      activityId,
      coupon: "",
      shareId: "",
      previewPwd: "",
      terminal: "wap",
      trackPath: "",
    },
    auth
  );
}

async function fetchShowstartActivity(activityId: number): Promise<ShowstartActivity> {
  let auth = await fetchShowstartGuestAuth();

  try {
    const response = await requestShowstartActivity(activityId, auth);
    return unwrapShowstartActivityResponse(response, activityId);
  } catch (error) {
    if (!shouldRefreshShowstartAuth(error)) {
      throw error;
    }
  }

  cachedShowstartAuth = null;
  auth = await fetchShowstartGuestAuth(true);
  const response = await requestShowstartActivity(activityId, auth);
  return unwrapShowstartActivityResponse(response, activityId);
}

export const showstartSource: MediaSource<never, number, ShowstartActivity> = {
  id: "showstart",
  label: "秀动",
  commandId: "create-showstart-card",
  commandName: "从秀动新建作品卡片",
  inputTitle: "从秀动新建作品卡片",
  inputHint: "贴秀动活动详情页链接，插件会直接读取活动详情。",
  inputPlaceholder:
    "例如：https://wap.showstart.com/pages/activity/detail/detail?activityId=208747",
  parseDirectInput: parseShowstartActivityId,
  fetchByDirectInput: (activityId) => fetchShowstartActivity(activityId),
  normalize: normalizeShowstartActivity,
};
