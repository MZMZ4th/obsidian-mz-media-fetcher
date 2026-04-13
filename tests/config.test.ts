import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTemplateEditorValues } from "../src/config/storage.ts";

test("normalizeTemplateEditorValues keeps template mode essentials only", () => {
  const config = normalizeTemplateEditorValues("bangumi", {
    targetFolder: "00-Inbox",
    templatePath: ".obsidian/plugins/MZ-media-fetcher/templates/bangumi.md",
    searchLimit: "12",
    filenameTemplate: "{{title}}",
    filenameCollisionTemplate: "{{title}} {{release_year}} {{bangumi_id}}",
  });

  assert.deepEqual(config, {
    targetFolder: "00-Inbox",
    templatePath: ".obsidian/plugins/MZ-media-fetcher/templates/bangumi.md",
    searchLimit: 12,
    filename: {
      template: "{{title}}",
      collisionTemplate: "{{title}} {{release_year}} {{bangumi_id}}",
    },
  });
});
