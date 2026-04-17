import { createHash, randomBytes } from "crypto";

const SHOWSTART_V3_BASE = "https://wap.showstart.com/v3";
const SHOWSTART_APP_ID = "wap";
const SHOWSTART_VERSION = "997";

const SHOWSTART_DEVICE_INFO = encodeURI(
  JSON.stringify({
    vendorName: "",
    deviceMode: "",
    deviceName: "",
    systemName: "",
    systemVersion: "",
    cpuMode: " ",
    cpuCores: "",
    cpuArch: "",
    memerySize: "",
    diskSize: "",
    network: "WIFI",
    resolution: "1920*1080",
    pixelResolution: "",
  })
);

function md5Hex(value: string): string {
  return createHash("md5").update(value).digest("hex");
}

function createShowstartDeviceToken(): string {
  return md5Hex(randomBytes(16).toString("hex")).toLowerCase();
}

function createShowstartTraceId(): string {
  const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let output = "";

  for (let index = 0; index < 32; index += 1) {
    output += charset[Math.floor(Math.random() * charset.length)];
  }

  return `${output}${Date.now()}`;
}

function normalizeHeaderValue(value: string): string {
  return value || "nil";
}

export interface ShowstartGuestTokenResponse {
  state?: number | string;
  msg?: string;
  message?: string;
  success?: boolean;
  result?: {
    accessToken?: {
      access_token?: string;
      expire?: number | string;
    };
    idToken?: {
      id_token?: string;
      expire?: number | string;
    };
  } | null;
}

export interface ShowstartAnonymousAuth {
  accessToken: string;
  idToken: string;
  userId: string;
  deviceToken: string;
  expiresAt: number;
}

export interface ShowstartV3Request {
  url: string;
  body: string;
  headers: Record<string, string>;
  traceId: string;
}

export interface ShowstartV3RequestAuthOverrides {
  accessToken?: string;
  idToken?: string;
  userId?: string;
  deviceToken?: string;
  traceId?: string;
}

export function buildShowstartV3Request(
  path: string,
  body: Record<string, unknown>,
  auth: ShowstartV3RequestAuthOverrides = {}
): ShowstartV3Request {
  const bodyString = JSON.stringify(body);
  const deviceToken = auth.deviceToken || createShowstartDeviceToken();
  const traceId = auth.traceId || createShowstartTraceId();
  const accessToken = auth.accessToken || "";
  const idToken = auth.idToken || "";
  const userId = auth.userId || "";

  const headers: Record<string, string> = {
    CUSAT: normalizeHeaderValue(accessToken),
    CUSUT: "nil",
    CUSIT: normalizeHeaderValue(idToken),
    CUSID: normalizeHeaderValue(userId),
    CUSNAME: "nil",
    CTERMINAL: SHOWSTART_APP_ID,
    CSAPPID: SHOWSTART_APP_ID,
    CDEVICENO: deviceToken,
    CUUSERREF: deviceToken,
    CVERSION: SHOWSTART_VERSION,
    CDEVICEINFO: SHOWSTART_DEVICE_INFO,
    CRTRACEID: traceId,
    CTRACKPATH: "",
    CSOURCEPATH: "",
    CRPSIGN: md5Hex(
      `${accessToken}${""}${idToken}${userId}${SHOWSTART_APP_ID}${deviceToken}${bodyString}${path}${SHOWSTART_VERSION}${SHOWSTART_APP_ID}${traceId}`
    ),
  };

  return {
    url: `${SHOWSTART_V3_BASE}${path}`,
    body: bodyString,
    headers,
    traceId,
  };
}

export function extractShowstartAnonymousAuth(
  payload: ShowstartGuestTokenResponse,
  deviceToken = ""
): ShowstartAnonymousAuth {
  const state = Number(payload?.state);
  const result = payload?.result;
  const accessToken = String(result?.accessToken?.access_token || "").trim();
  const idToken = String(result?.idToken?.id_token || "").trim();
  const expireSeconds = Number(result?.accessToken?.expire);
  const message = String(payload?.msg || payload?.message || "").trim();

  if (state !== 1 || !accessToken) {
    throw new Error(message || "秀动匿名令牌获取失败。");
  }

  return {
    accessToken,
    idToken,
    userId: "",
    deviceToken: deviceToken || createShowstartDeviceToken(),
    expiresAt: Number.isFinite(expireSeconds) && expireSeconds > 0 ? expireSeconds * 1000 : 0,
  };
}
