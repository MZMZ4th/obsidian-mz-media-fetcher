export const MONTH_MAP: Record<string, string> = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

export function sanitizeList(values: unknown[], maxItems: number): string[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const normalized = String(value || "").trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    output.push(normalized);
    if (output.length >= maxItems) break;
  }

  return output;
}

export function normalizeSummaryText(value: unknown): string {
  const html = String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  return html
    .split(/\r?\n/)
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeDateValue(value: unknown): string {
  const normalized = String(value || "").trim();
  if (!normalized || normalized === "*") return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;
  return "";
}

export function extractYear(value: unknown): string {
  const match = String(value || "").match(/\b(\d{4})\b/);
  return match ? match[1] : "";
}

export function safeYear(value: unknown): string {
  return extractYear(value);
}

export function sanitizeFileName(value: unknown): string {
  return String(value || "")
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function ensureTrailingNewline(text: string): string {
  return text.endsWith("\n") ? text : `${text}\n`;
}

export function escapeRegex(value: unknown): string {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function decodeHtmlEntities(value: unknown): string {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

export function stripHtml(value: unknown): string {
  return decodeHtmlEntities(String(value || "").replace(/<[^>]+>/g, " "));
}

export function normalizeDateText(value: unknown): string {
  const text = String(value || "").trim();
  if (!text) return "";
  const match = text.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (!match) return text;

  const month = MONTH_MAP[match[1].toLowerCase()];
  if (!month) return text;
  const day = match[2].padStart(2, "0");
  return `${match[3]}-${month}-${day}`;
}
