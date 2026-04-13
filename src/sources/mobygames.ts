import {
  decodeHtmlEntities,
  escapeRegex,
  extractYear,
  normalizeDateText,
  normalizeDateValue,
  normalizeSummaryText,
  sanitizeList,
  stripHtml,
} from "../core/text.ts";
import type { NormalizedMediaItem } from "../types.ts";

export interface MobyGameDetail {
  mobygames_id: number;
  mobygames_url: string;
  title: string;
  title_original: string;
  aliases: string[];
  release_date: string;
  release_year: string;
  cover_remote: string;
  summary: string;
  platforms: string[];
  genres: string[];
}

export function normalizeMobyGamesGameUrl(input: string): string {
  const text = String(input || "").trim();
  if (!text) {
    throw new Error("请先贴上 MobyGames 游戏链接。");
  }

  let url: URL;
  try {
    url = new URL(text);
  } catch (_error) {
    throw new Error("MobyGames 目前只支持直接贴游戏页面链接。");
  }

  if (!/mobygames\.com$/i.test(url.hostname) && !/\.mobygames\.com$/i.test(url.hostname)) {
    throw new Error("这不是 MobyGames 的链接。");
  }

  if (!/^\/game\/\d+(?:\/[^/?#]+)?\/?$/i.test(url.pathname)) {
    throw new Error("请贴 MobyGames 具体游戏页面链接，不是搜索页或其他页面。");
  }

  url.search = "";
  url.hash = "";
  return url.toString();
}

function parseMobyGamesIdFromUrl(url: string): number | null {
  const match = String(url || "").match(/mobygames\.com\/game\/(\d+)/i);
  return match ? Number(match[1]) : null;
}

function extractMetaContent(html: string, attrName: string, attrValue: string): string {
  const pattern = new RegExp(
    `<meta[^>]+${attrName}=["']${escapeRegex(attrValue)}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i"
  );
  const reversePattern = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+${attrName}=["']${escapeRegex(attrValue)}["'][^>]*>`,
    "i"
  );
  const match = html.match(pattern) || html.match(reversePattern);
  return match ? decodeHtmlEntities(match[1].trim()) : "";
}

function extractLinkHref(html: string, relValue: string): string {
  const pattern = new RegExp(
    `<link[^>]+rel=["'][^"']*${escapeRegex(relValue)}[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>`,
    "i"
  );
  const reversePattern = new RegExp(
    `<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*${escapeRegex(relValue)}[^"']*["'][^>]*>`,
    "i"
  );
  const match = html.match(pattern) || html.match(reversePattern);
  return match ? decodeHtmlEntities(match[1].trim()) : "";
}

function extractFirstTagText(html: string, tagName: string): string {
  const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  if (!match) return "";
  return stripHtml(match[1]).trim();
}

function extractTagTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? stripHtml(match[1]).trim() : "";
}

function cleanDocumentTitle(title: string): string {
  return String(title || "")
    .replace(/\s*-\s*MobyGames\s*$/i, "")
    .replace(/\s*\(\d{4}\)\s*$/i, "")
    .trim();
}

function parseAliasesFromText(text: string, title: string): string[] {
  const match = text.match(/\baka:\s*([^\n]+)/i);
  if (!match) return [];
  return sanitizeList(
    match[1]
      .split(/\s*,\s*/)
      .map((item) => item.trim())
      .filter((item) => item && item !== title),
    20
  );
}

function parseMobyReleaseInfo(text: string): {
  release_date: string;
  release_year: string;
  platforms: string[];
} {
  const releaseMatch = text.match(/Released\s+([^\n]+?)\s+on\s+([^\n]+)/i);
  const firstReleaseRaw = releaseMatch ? releaseMatch[1].trim() : "";
  const firstPlatform = releaseMatch ? releaseMatch[2].trim() : "";

  const releaseBlockMatch = text.match(
    /Releases by Date(?:\s*\(by platform\))?\s+([\s\S]*?)(?:\n##\s+\w|\nPublishers\b|\nDevelopers\b|\nMoby Score\b|\nCritics\b|\nPlayers\b|\nCollected By\b|\nGenre\b|$)/i
  );

  const releaseLines = releaseBlockMatch
    ? releaseBlockMatch[1]
        .split("\n")
        .map((line) => line.replace(/^[-*]\s*/, "").trim())
        .filter(Boolean)
    : [];

  const platforms: string[] = [];
  if (firstPlatform) {
    platforms.push(firstPlatform);
  }

  let releaseDate = normalizeDateValue(normalizeDateText(firstReleaseRaw));
  let releaseYear = extractYear(firstReleaseRaw);

  for (const line of releaseLines) {
    const platformMatch = line.match(/\(([^)]+)\)/);
    if (platformMatch) {
      platforms.push(platformMatch[1].trim());
    }

    if (!releaseDate) {
      const dateMatch = line.match(/^([A-Za-z]+\s+\d{1,2},\s+\d{4}|\d{4})/);
      if (dateMatch) {
        releaseDate = normalizeDateValue(normalizeDateText(dateMatch[1]));
        releaseYear = releaseYear || extractYear(dateMatch[1]);
      }
    }
  }

  return {
    release_date: releaseDate,
    release_year: releaseYear,
    platforms: sanitizeList(platforms, 20),
  };
}

function parseMobyDescription(text: string): string {
  const match = text.match(
    /##\s*Description(?:\s+official descriptions)?\s+([\s\S]*?)(?:\n##\s+\w|\nGroups\b|\nCredits\b|\nReviews\b|\nRelated Games\b|\nIdentifiers\b|\nContributors to this Entry\b|$)/i
  );
  return match ? match[1].trim() : "";
}

function parseMobyLabeledValues(text: string, labels: string[]): string[] {
  const output: string[] = [];
  for (const label of labels) {
    const regex = new RegExp(
      `${escapeRegex(label)}\\s+([^\\n]+(?:\\n(?![A-Z][A-Za-z ]+\\b)[^\\n]+)*)`,
      "i"
    );
    const match = text.match(regex);
    if (!match) continue;

    const values = match[1]
      .split("\n")
      .map((line) => line.replace(/^[-*]\s*/, "").trim())
      .flatMap((line) => line.split(/\s*,\s*/))
      .filter(Boolean);

    output.push(...values);
  }

  return sanitizeList(output, 20);
}

function htmlToReadableText(html: string): string {
  return stripHtml(
    String(html || "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<(h1|h2|h3|h4|h5|h6)[^>]*>([\s\S]*?)<\/\1>/gi, (_match, _level, content) => {
        const heading = stripHtml(content).trim();
        return heading ? `\n## ${heading}\n` : "\n";
      })
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_match, content) => {
        const line = stripHtml(content).trim();
        return line ? `\n- ${line}\n` : "\n";
      })
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|section|article|main|header|footer|aside|ul|ol|table|tr)>/gi, "\n")
  )
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function parseMobyGamesGamePage(html: string, fallbackUrl: string): MobyGameDetail {
  const canonicalUrl =
    extractMetaContent(html, "property", "og:url") ||
    extractLinkHref(html, "canonical") ||
    fallbackUrl;
  const title =
    decodeHtmlEntities(extractFirstTagText(html, "h1")) ||
    cleanDocumentTitle(extractTagTitle(html)) ||
    "";
  const text = htmlToReadableText(html);
  const mobyIdMatch = text.match(/Moby ID:\s*(\d+)/i);
  const mobygamesId = mobyIdMatch ? Number(mobyIdMatch[1]) : parseMobyGamesIdFromUrl(canonicalUrl);

  if (!title || !mobygamesId) {
    throw new Error("MobyGames 页面结构和预期不一致，暂时没法读出游戏信息。");
  }

  const aliases = parseAliasesFromText(text, title);
  const releaseInfo = parseMobyReleaseInfo(text);
  const description = parseMobyDescription(text);
  const genres = parseMobyLabeledValues(text, ["Genre"]);
  const coverRemote =
    extractMetaContent(html, "property", "og:image") ||
    extractMetaContent(html, "name", "twitter:image") ||
    "";

  return {
    mobygames_id: mobygamesId,
    mobygames_url: canonicalUrl,
    title,
    title_original: "",
    aliases,
    release_date: releaseInfo.release_date,
    release_year: releaseInfo.release_year,
    cover_remote: coverRemote,
    summary: description,
    platforms: releaseInfo.platforms,
    genres,
  };
}

export function normalizeMobyGame(detail: MobyGameDetail): NormalizedMediaItem {
  const mobygamesId = Number(detail?.mobygames_id);
  const platforms = sanitizeList(detail?.platforms || [], 20);
  const aliases = sanitizeList(detail?.aliases || [], 20);

  return {
    mobygames_id: mobygamesId,
    mobygames_url: String(detail?.mobygames_url || "").trim(),
    title: String(detail?.title || "").trim() || `MobyGames ${mobygamesId}`,
    title_original: String(detail?.title_original || "").trim(),
    aliases,
    media_type: "游戏",
    release_date: normalizeDateValue(detail?.release_date),
    release_year: String(detail?.release_year || extractYear(detail?.release_date)).trim(),
    cover_remote: String(detail?.cover_remote || "").trim(),
    summary: normalizeSummaryText(detail?.summary || ""),
    platforms,
    platforms_text: platforms.join("\n"),
    genres: sanitizeList(detail?.genres || [], 20),
  };
}
