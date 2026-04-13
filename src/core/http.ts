import { requestUrl } from "obsidian";
import { HTTP_USER_AGENT } from "../config/defaults.ts";

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

async function request(url: string, accept: string, options: RequestOptions = {}): Promise<any> {
  const method = String(options.method || "GET").toUpperCase();

  let response = null;
  try {
    response = await requestUrl({
      url,
      method,
      headers: {
        Accept: accept,
        "User-Agent": HTTP_USER_AGENT,
        ...(options.headers || {}),
      },
      body: options.body,
    });
  } catch (error: any) {
    const message =
      error?.response?.text || error?.response?.status || error?.message || String(error);
    throw new Error(`请求失败：${String(message).trim()}`);
  }

  if (!response || response.status >= 400) {
    throw new Error(`请求失败：HTTP ${response?.status || "unknown"}`);
  }

  return response;
}

export async function requestJson<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const response = await request(url, "application/json", options);
  const text = String(response.text || "").trim();
  if (!text) {
    throw new Error("接口没有返回内容。");
  }

  try {
    return JSON.parse(text) as T;
  } catch (_error) {
    throw new Error("接口返回了无法解析的内容。");
  }
}

export async function requestText(url: string, options: RequestOptions = {}): Promise<string> {
  const response = await request(url, "text/html,application/xhtml+xml", options);
  const text = String(response.text || "");
  if (!text.trim()) {
    throw new Error("页面没有返回内容。");
  }
  return text;
}
