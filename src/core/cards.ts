import fsp from "fs/promises";
import path from "path";
import type { SourceConfig, NormalizedMediaItem, SourceId, VaultInfo } from "../types.ts";
import { chooseAvailableCardPath } from "./files.ts";
import { buildTemplateContext, renderTemplate } from "./template.ts";
import { ensureTrailingNewline, sanitizeFileName } from "./text.ts";

export interface BuiltCard {
  folderPath: string;
  filePath: string;
  content: string;
}

export async function buildCard(
  app: any,
  vaultInfo: VaultInfo,
  sourceKey: SourceId,
  item: NormalizedMediaItem,
  config: SourceConfig
): Promise<BuiltCard> {
  const templatePath = path.join(vaultInfo.path, config.templatePath);
  const template = await fsp.readFile(templatePath, "utf8");
  const renderContext = buildTemplateContext(sourceKey, item);
  const content = renderTemplate(template, renderContext).trim();
  const filePath = await resolveCardPath(app, config, item, sourceKey);

  return {
    folderPath: config.targetFolder,
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
  };
  const idKey = idKeyMap[sourceKey];
  const primaryName = sanitizeFileName(renderTemplate(config.filename.template, item));
  const collisionName = sanitizeFileName(
    renderTemplate(config.filename.collisionTemplate, item)
  );
  const itemId = String(item[idKey] || "").trim();
  const primaryBase = primaryName || `${sourceKey} ${itemId}`.trim();
  const collisionBase = collisionName || `${primaryBase} ${itemId}`.trim();

  return chooseAvailableCardPath(
    config.targetFolder,
    primaryBase,
    collisionBase,
    async (candidate) => app.vault.adapter.exists(candidate)
  );
}
