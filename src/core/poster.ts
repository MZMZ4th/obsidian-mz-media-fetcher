import type { NormalizedMediaItem } from "../types.ts";

function isRemotePosterTarget(value: string): boolean {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function resolvePosterFile(app: any, posterPath: string, sourcePath: string): any {
  const vault = app?.vault;
  const metadataCache = app?.metadataCache;

  return (
    vault?.getAbstractFileByPath?.(posterPath) ||
    metadataCache?.getFirstLinkpathDest?.(posterPath, sourcePath) ||
    null
  );
}

export function resolvePosterLinkText(app: any, sourcePath: string, posterPath: string): string {
  const rawPath = String(posterPath || "").trim();
  if (!rawPath || isRemotePosterTarget(rawPath)) {
    return rawPath;
  }

  const file = resolvePosterFile(app, rawPath, sourcePath);
  if (!file) {
    return rawPath;
  }

  const linkText = app?.metadataCache?.fileToLinktext?.(file, sourcePath, false);
  return String(linkText || rawPath).trim();
}

export function buildCoverMarkdown(poster: string): string {
  const target = String(poster || "").trim();
  if (!target) {
    return "";
  }

  if (isRemotePosterTarget(target)) {
    return `![cover|300](${target})`;
  }

  return `![cover|300](<${target}>)`;
}

export function decoratePosterFields(
  app: any,
  sourcePath: string,
  subject: NormalizedMediaItem
): NormalizedMediaItem {
  const posterPath = String(subject.poster_path || subject.poster || subject.cover_remote || "").trim();
  const poster = resolvePosterLinkText(app, sourcePath, posterPath);

  return {
    ...subject,
    ...(posterPath ? { poster_path: posterPath } : {}),
    poster,
    cover_markdown: buildCoverMarkdown(poster),
  };
}
