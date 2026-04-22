import type { NormalizedMediaItem } from "../types.ts";
import { buildCoverMarkdown } from "./poster.ts";

function renderYamlScalar(value: unknown, indentLevel: number): string {
  if (value === null || typeof value === "undefined") return '""';
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  const text = String(value);
  if (text.includes("\n")) {
    const indent = "  ".repeat(indentLevel + 1);
    return `|-\n${text
      .split("\n")
      .map((line) => `${indent}${line}`)
      .join("\n")}`;
  }

  return JSON.stringify(text);
}

export function renderYamlValue(value: unknown, indentLevel: number): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const indent = "  ".repeat(indentLevel + 1);
    return `\n${value
      .map((item) => `${indent}- ${renderYamlScalar(item, indentLevel + 1)}`)
      .join("\n")}`;
  }

  return renderYamlScalar(value, indentLevel);
}

function getValueByPath(target: Record<string, unknown>, sourcePath: string): unknown {
  return String(sourcePath || "")
    .split(".")
    .filter(Boolean)
    .reduce<unknown>((current, key) => {
      if (current === null || typeof current === "undefined") return undefined;
      return (current as Record<string, unknown>)[key];
    }, target);
}

export function renderTemplate(template: string, context: Record<string, unknown>): string {
  return String(template || "").replace(/\{\{\s*([a-zA-Z0-9_\.]+)\s*\}\}/g, (_, key) => {
    const value = getValueByPath(context, key);
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (value === null || typeof value === "undefined") {
      return "";
    }
    return String(value);
  });
}

function buildYamlTemplateContext(values: Record<string, unknown>): Record<string, string> {
  return Object.entries(values).reduce<Record<string, string>>((result, [key, value]) => {
    result[key] = renderYamlValue(value, 0);
    return result;
  }, {});
}

export function buildTemplateContext(
  sourceKey: string,
  subject: NormalizedMediaItem
): Record<string, unknown> {
  const context: Record<string, unknown> = {
    ...subject,
    categories: "新作品卡片",
    source: sourceKey,
    poster: String(subject.poster || subject.poster_path || subject.cover_remote || "").trim(),
    network_poster:
      typeof subject.network_poster === "boolean" ? subject.network_poster : true,
    rating: "",
    status: "进行中",
    finished_at: "",
    rewatch_count: 1,
  };
  const coverMarkdown = String(
    subject.cover_markdown || buildCoverMarkdown(String(context.poster || ""))
  ).trim();

  return {
    ...context,
    yaml: buildYamlTemplateContext(context),
    cover_markdown: coverMarkdown,
  };
}
