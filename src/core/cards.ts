import fsp from "fs/promises";
import path from "path";
import type { SourceConfig, NormalizedMediaItem, SourceId, VaultInfo } from "../types.ts";
import { chooseAvailableAssetPath, chooseAvailableCardPath, ensureFolderExists } from "./files.ts";
import { normalizeVaultPath } from "./paths.ts";
import { buildTemplateContext, renderTemplate } from "./template.ts";
import { ensureTrailingNewline, sanitizeFileName } from "./text.ts";

export interface BuiltCard {
  folderPath: string;
  filePath: string;
  content: string;
}

async function defaultDownloadBinary(url: string): Promise<ArrayBuffer> {
  const { requestBinary } = await import("./http.ts");
  return requestBinary(url);
}

export async function buildCard(
  app: any,
  vaultInfo: VaultInfo,
  sourceKey: SourceId,
  item: NormalizedMediaItem,
  config: SourceConfig,
  downloadBinary: (url: string) => Promise<ArrayBuffer> = defaultDownloadBinary
): Promise<BuiltCard> {
  const filePath = await resolveCardPath(app, config, item, sourceKey);
  const resolvedItem = await resolvePosterAsset(app, config, item, filePath, downloadBinary);
  const templatePath = path.join(vaultInfo.path, normalizeVaultPath(config.templatePath));
  const template = await fsp.readFile(templatePath, "utf8");
  const renderContext = buildTemplateContext(sourceKey, resolvedItem);
  const content = renderTemplate(template, renderContext).trim();

  return {
    folderPath: normalizeVaultPath(config.targetFolder),
    filePath,
    content: ensureTrailingNewline(content),
  };
}

async function resolveCardPath(
  app: any,
  config: SourceConfig,
  item: NormalizedMediaItem,
  sourceKey: SourceId
): Promise<string> {
  const idKeyMap: Record<SourceId, string> = {
    bangumi: "bangumi_id",
    mobygames: "mobygames_id",
    bilibili_show: "bilibili_show_id",
    showstart: "showstart_activity_id",
  };
  const idKey = idKeyMap[sourceKey];
  const primaryName = sanitizeFileName(renderTemplate(config.filename.template, item));
  const collisionName = sanitizeFileName(
    renderTemplate(config.filename.collisionTemplate, item)
  );
  const itemId = String(item[idKey] || "").trim();
  const primaryBase = primaryName || [sourceKey, itemId].filter(Boolean).join("-");
  const collisionBase = collisionName || [primaryBase, itemId].filter(Boolean).join("-");

  return chooseAvailableCardPath(
    config.targetFolder,
    primaryBase,
    collisionBase,
    async (candidate) => app.vault.adapter.exists(candidate)
  );
}

function inferRemoteFileExtension(urlText: string): string {
  try {
    const url = new URL(urlText);
    const match = url.pathname.match(/\.([a-zA-Z0-9]+)$/);
    if (match) {
      return match[1].toLowerCase();
    }
  } catch (_error) {
    // Ignore and use fallback.
  }

  return "jpg";
}

async function resolvePosterAsset(
  app: any,
  config: SourceConfig,
  item: NormalizedMediaItem,
  cardFilePath: string,
  downloadBinary: (url: string) => Promise<ArrayBuffer>
): Promise<NormalizedMediaItem> {
  const remotePoster = String(item.cover_remote || "").trim();
  if (!config.poster.saveLocal || !remotePoster) {
    return {
      ...item,
      poster_path: remotePoster,
      network_poster: true,
    };
  }

  const baseName = path.parse(cardFilePath).name;
  const extension = inferRemoteFileExtension(remotePoster);
  const assetPath = await chooseAvailableAssetPath(
    config.poster.folder,
    sanitizeFileName(baseName) || "poster",
    extension,
    async (candidate) => app.vault.adapter.exists(candidate)
  );

  await ensureFolderExists(app.vault, config.poster.folder);
  const binary = await downloadBinary(remotePoster);
  await app.vault.createBinary(assetPath, binary);

  return {
    ...item,
    poster_path: assetPath,
    network_poster: false,
  };
}
