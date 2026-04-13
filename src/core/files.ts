import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { ensureTrailingNewline } from "./text.ts";

export async function ensureTextFile(filePath: string, content: string): Promise<void> {
  try {
    await fsp.access(filePath, fs.constants.F_OK);
    return;
  } catch (error: any) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }

  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  await fsp.writeFile(filePath, ensureTrailingNewline(content), "utf8");
}

export async function ensureJsonFile(filePath: string, data: unknown): Promise<void> {
  try {
    await fsp.access(filePath, fs.constants.F_OK);
    return;
  } catch (error: any) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }

  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  await fsp.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function ensureFolderExists(vault: any, targetFolder: string): Promise<void> {
  const normalized = String(targetFolder || "").trim().replace(/^\/+|\/+$/g, "");
  if (!normalized) return;

  const segments = normalized.split("/");
  let current = "";

  for (const segment of segments) {
    current = current ? `${current}/${segment}` : segment;
    if (!(await vault.adapter.exists(current))) {
      await vault.createFolder(current);
    }
  }
}

export async function chooseAvailableCardPath(
  folder: string,
  primaryBase: string,
  collisionBase: string,
  exists: (candidate: string) => Promise<boolean>
): Promise<string> {
  const cleanFolder = String(folder || "").trim().replace(/^\/+|\/+$/g, "");
  const prefix = cleanFolder ? `${cleanFolder}/` : "";

  let candidate = `${prefix}${primaryBase}.md`;
  if (!(await exists(candidate))) {
    return candidate;
  }

  candidate = `${prefix}${collisionBase}.md`;
  if (!(await exists(candidate))) {
    return candidate;
  }

  let index = 2;
  while (true) {
    candidate = `${prefix}${collisionBase} ${index}.md`;
    if (!(await exists(candidate))) {
      return candidate;
    }
    index += 1;
  }
}
