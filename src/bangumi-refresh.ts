import { ensureTrailingNewline } from "./core/text.ts";
import { renderYamlValue } from "./core/template.ts";
import {
  BANGUMI_REFRESH_MANAGED_VARIABLE_SET,
  type BangumiRefreshManagedVariable,
} from "./template-fields.ts";

export interface FrontmatterBlock {
  frontmatter: string;
  body: string;
}

export interface TemplateFrontmatterBinding {
  propertyKey: string;
  variableKey: string;
}

export interface BangumiRefreshCandidate {
  propertyKey: string;
  variableKey: BangumiRefreshManagedVariable;
  currentValue: unknown;
  fetchedValue: unknown;
}

export interface BangumiRefreshConflict extends BangumiRefreshCandidate {}

export interface BangumiRefreshAnalysis {
  managedCandidates: BangumiRefreshCandidate[];
  conflicts: BangumiRefreshConflict[];
  otherEntries: Array<{ key: string; value: unknown }>;
}

const TEMPLATE_PLACEHOLDER_PATTERN = /\{\{\s*(?:yaml\.)?([a-zA-Z0-9_]+)\s*\}\}/g;

export function extractFrontmatterBlock(content: string): FrontmatterBlock | null {
  const normalized = String(content || "").replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  if (lines[0] !== "---") {
    return null;
  }

  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index] !== "---") {
      continue;
    }

    return {
      frontmatter: lines.slice(1, index).join("\n"),
      body: lines.slice(index + 1).join("\n"),
    };
  }

  return null;
}

export function listFrontmatterKeys(frontmatter: string): string[] {
  const keys: string[] = [];

  for (const line of String(frontmatter || "").split("\n")) {
    const match = line.match(/^([^-\s#][^:]*):(?:\s|$)/);
    if (match) {
      keys.push(match[1].trim());
    }
  }

  return keys;
}

export function parseTemplateFrontmatterBindings(template: string): TemplateFrontmatterBinding[] {
  const block = extractFrontmatterBlock(template);
  if (!block) {
    return [];
  }

  const bindings: TemplateFrontmatterBinding[] = [];
  for (const line of block.frontmatter.split("\n")) {
    const match = line.match(/^([^-\s#][^:]*):\s*(.*)$/);
    if (!match) {
      continue;
    }

    const propertyKey = match[1].trim();
    const valueText = match[2] || "";
    const placeholderMatch = [...valueText.matchAll(TEMPLATE_PLACEHOLDER_PATTERN)][0];
    if (!placeholderMatch?.[1]) {
      continue;
    }

    bindings.push({
      propertyKey,
      variableKey: placeholderMatch[1],
    });
  }

  return bindings;
}

export function sanitizeFrontmatterObject(frontmatter: Record<string, unknown>): Record<string, unknown> {
  return Object.entries(frontmatter || {}).reduce<Record<string, unknown>>((result, [key, value]) => {
    if (key === "position") {
      return result;
    }
    result[key] = value;
    return result;
  }, {});
}

export function stringifyFrontmatterEntries(
  entries: Array<{ key: string; value: unknown }>
): string {
  const lines = ["---"];

  for (const entry of entries) {
    const renderedValue = renderYamlValue(entry.value, 0);
    if (renderedValue.startsWith("\n")) {
      lines.push(`${entry.key}:${renderedValue}`);
    } else {
      lines.push(`${entry.key}: ${renderedValue}`);
    }
  }

  lines.push("---", "");
  return `${lines.join("\n")}`;
}

export function replaceFrontmatter(content: string, entries: Array<{ key: string; value: unknown }>): string {
  const normalized = String(content || "").replace(/\r\n/g, "\n");
  const block = extractFrontmatterBlock(normalized);
  const body = block ? block.body : normalized;
  const prefix = stringifyFrontmatterEntries(entries);
  const normalizedBody = body.replace(/^\n*/, "");
  if (!normalizedBody) {
    return ensureTrailingNewline(prefix);
  }
  return ensureTrailingNewline(`${prefix}${normalizedBody}`);
}

function normalizeComparableValue(value: unknown): string {
  if (Array.isArray(value)) {
    return JSON.stringify(value.map((item) => String(item || "").trim()).filter(Boolean));
  }
  if (typeof value === "boolean" || typeof value === "number") {
    return String(value);
  }
  return String(value || "").trim();
}

function hasMeaningfulValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => String(item || "").trim());
  }
  if (typeof value === "boolean" || typeof value === "number") {
    return true;
  }
  return Boolean(String(value || "").trim());
}

function preferExistingWhenFetchedIsBlank(currentValue: unknown, fetchedValue: unknown): unknown {
  if (hasMeaningfulValue(fetchedValue) || !hasMeaningfulValue(currentValue)) {
    return fetchedValue;
  }

  return currentValue;
}

function shouldRefreshPoster(
  frontmatter: Record<string, unknown>,
  posterPropertyKey: string | null,
  networkPosterPropertyKey: string | null
): boolean {
  const networkPosterValue = networkPosterPropertyKey
    ? frontmatter[networkPosterPropertyKey]
    : undefined;

  if (networkPosterValue === false || String(networkPosterValue || "").trim().toLowerCase() === "false") {
    return false;
  }

  const currentPosterValue = posterPropertyKey ? frontmatter[posterPropertyKey] : undefined;
  if (!hasMeaningfulValue(currentPosterValue)) {
    return true;
  }

  return /^https?:\/\//i.test(String(currentPosterValue || "").trim());
}

export function collectBangumiTemplateValueCandidates(
  frontmatter: Record<string, unknown>,
  bindingGroups: TemplateFrontmatterBinding[][]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const literalKey of ["bangumi_id", "bangumi_url"]) {
    if (hasMeaningfulValue(frontmatter[literalKey])) {
      result[literalKey] = frontmatter[literalKey];
    }
  }

  for (const bindings of bindingGroups) {
    for (const binding of bindings) {
      if (typeof result[binding.variableKey] !== "undefined") {
        continue;
      }
      if (!hasMeaningfulValue(frontmatter[binding.propertyKey])) {
        continue;
      }
      result[binding.variableKey] = frontmatter[binding.propertyKey];
    }
  }

  return result;
}

export function analyzeBangumiFrontmatterUpdate(args: {
  templateBindings: TemplateFrontmatterBinding[];
  existingFrontmatter: Record<string, unknown>;
  existingKeyOrder: string[];
  fetchedValues: Record<string, unknown>;
}): BangumiRefreshAnalysis {
  const managedCandidates: BangumiRefreshCandidate[] = [];
  const conflicts: BangumiRefreshConflict[] = [];
  const managedPropertyKeys = new Set<string>();
  const posterBinding = args.templateBindings.find((binding) => binding.variableKey === "poster");
  const networkPosterBinding = args.templateBindings.find(
    (binding) => binding.variableKey === "network_poster"
  );
  const canRefreshPoster = shouldRefreshPoster(
    args.existingFrontmatter,
    posterBinding?.propertyKey || null,
    networkPosterBinding?.propertyKey || null
  );

  for (const binding of args.templateBindings) {
    if (!BANGUMI_REFRESH_MANAGED_VARIABLE_SET.has(binding.variableKey)) {
      continue;
    }

    const variableKey = binding.variableKey as BangumiRefreshManagedVariable;
    const currentValue = args.existingFrontmatter[binding.propertyKey];
    let fetchedValue = preferExistingWhenFetchedIsBlank(
      currentValue,
      args.fetchedValues[variableKey]
    );

    if (variableKey === "poster" && !canRefreshPoster && hasMeaningfulValue(currentValue)) {
      fetchedValue = currentValue;
    }

    if (
      variableKey === "network_poster" &&
      !canRefreshPoster &&
      typeof currentValue !== "undefined"
    ) {
      fetchedValue = currentValue;
    }

    const candidate: BangumiRefreshCandidate = {
      propertyKey: binding.propertyKey,
      variableKey,
      currentValue,
      fetchedValue,
    };

    managedCandidates.push(candidate);
    managedPropertyKeys.add(binding.propertyKey);

    if (
      hasMeaningfulValue(currentValue) &&
      hasMeaningfulValue(fetchedValue) &&
      normalizeComparableValue(currentValue) !== normalizeComparableValue(fetchedValue)
    ) {
      conflicts.push(candidate);
    }
  }

  const otherEntries = args.existingKeyOrder
    .filter((key) => !managedPropertyKeys.has(key))
    .map((key) => ({
      key,
      value: args.existingFrontmatter[key],
    }));

  return {
    managedCandidates,
    conflicts,
    otherEntries,
  };
}

export function buildBangumiFrontmatterEntries(
  analysis: BangumiRefreshAnalysis,
  decisions: Record<string, "keep" | "replace"> = {}
): Array<{ key: string; value: unknown }> {
  const managedEntries = analysis.managedCandidates.map((candidate) => ({
    key: candidate.propertyKey,
    value:
      decisions[candidate.propertyKey] === "keep" ? candidate.currentValue : candidate.fetchedValue,
  }));

  return [...managedEntries, ...analysis.otherEntries];
}
