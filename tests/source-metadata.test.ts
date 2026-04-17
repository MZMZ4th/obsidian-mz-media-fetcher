import test from "node:test";
import assert from "node:assert/strict";
import { MEDIA_SOURCE_UI_META_MAP } from "../src/source-ui-meta.ts";

test("only bangumi exposes search settings metadata", () => {
  assert.equal(MEDIA_SOURCE_UI_META_MAP.bangumi.supportsSearch, true);
  assert.equal(MEDIA_SOURCE_UI_META_MAP.mobygames.supportsSearch, false);
  assert.equal(MEDIA_SOURCE_UI_META_MAP.bilibili_show.supportsSearch, false);
  assert.equal(MEDIA_SOURCE_UI_META_MAP.showstart.supportsSearch, false);
});

test("source metadata includes common and source-specific template variables", () => {
  const bangumiKeys = MEDIA_SOURCE_UI_META_MAP.bangumi.templateVariables.map((item) => item.key);
  const showstartKeys = MEDIA_SOURCE_UI_META_MAP.showstart.templateVariables.map((item) => item.key);
  const coverMarkdown = MEDIA_SOURCE_UI_META_MAP.bangumi.templateVariables.find(
    (item) => item.key === "cover_markdown"
  );

  assert.ok(bangumiKeys.includes("title"));
  assert.ok(bangumiKeys.includes("poster"));
  assert.ok(bangumiKeys.includes("bangumi_id"));
  assert.ok(showstartKeys.includes("showstart_activity_id"));
  assert.equal(coverMarkdown?.yamlSafe, false);
});
