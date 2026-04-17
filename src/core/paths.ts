type ObsidianModule = {
  normalizePath?: (value: string) => string;
};

function fallbackNormalizePath(value: string): string {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/\/{2,}/g, "/")
    .trim();
}

function getRuntimeNormalizePath(): (value: string) => string {
  const maybeRequire = (globalThis as { require?: (name: string) => unknown }).require;
  if (typeof maybeRequire === "function") {
    try {
      const obsidian = maybeRequire("obsidian") as ObsidianModule;
      if (typeof obsidian?.normalizePath === "function") {
        return obsidian.normalizePath;
      }
    } catch (_error) {
      // Ignore and fall back to local normalization for tests.
    }
  }

  return fallbackNormalizePath;
}

export function normalizeVaultPath(value: unknown): string {
  const normalized = getRuntimeNormalizePath()(String(value ?? ""));
  return normalized.replace(/^\/+|\/+$/g, "");
}

export function joinVaultPath(...segments: unknown[]): string {
  return normalizeVaultPath(
    segments
      .map((segment) => String(segment ?? "").trim())
      .filter(Boolean)
      .join("/")
  );
}
