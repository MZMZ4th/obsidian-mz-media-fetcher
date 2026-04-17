import test from "node:test";
import assert from "node:assert/strict";
import { getDefaultSourceConfigs } from "../src/config/defaults.ts";
import {
  normalizeTemplateEditorValues,
  resolveAttachmentFolderPath,
} from "../src/config/storage.ts";

test("normalizeTemplateEditorValues keeps template mode essentials only", () => {
  const config = normalizeTemplateEditorValues("bangumi", {
    targetFolder: "00-Inbox",
    templatePath: ".obsidian/plugins/MZ-media-fetcher/templates/bangumi.md",
    searchLimit: "12",
    posterSaveLocal: false,
    posterFolder: "00-Inbox/附件/作品海报",
    filenameTemplate: "{{title}}",
    filenameCollisionTemplate: "{{title}} {{release_year}} {{bangumi_id}}",
  });

  assert.deepEqual(config, {
    targetFolder: "00-Inbox",
    templatePath: ".obsidian/plugins/MZ-media-fetcher/templates/bangumi.md",
    searchLimit: 12,
    poster: {
      saveLocal: false,
      folder: "00-Inbox/附件/作品海报",
    },
    filename: {
      template: "{{title}}",
      collisionTemplate: "{{title}} {{release_year}} {{bangumi_id}}",
    },
  });
});

test("normalizeTemplateEditorValues supports bilibili_show", () => {
  const config = normalizeTemplateEditorValues("bilibili_show", {
    targetFolder: "00-Inbox",
    templatePath: ".obsidian/plugins/MZ-media-fetcher/templates/bilibili-show.md",
    searchLimit: "8",
    posterSaveLocal: true,
    posterFolder: "20-Assets/Posters",
    filenameTemplate: "{{title}}",
    filenameCollisionTemplate: "{{title}} {{release_year}} {{bilibili_show_id}}",
  });

  assert.deepEqual(config, {
    targetFolder: "00-Inbox",
    templatePath: ".obsidian/plugins/MZ-media-fetcher/templates/bilibili-show.md",
    searchLimit: 8,
    poster: {
      saveLocal: true,
      folder: "20-Assets/Posters",
    },
    filename: {
      template: "{{title}}",
      collisionTemplate: "{{title}} {{release_year}} {{bilibili_show_id}}",
    },
  });
});

test("normalizeTemplateEditorValues supports showstart", () => {
  const config = normalizeTemplateEditorValues("showstart", {
    targetFolder: "00-Inbox",
    templatePath: ".obsidian/plugins/MZ-media-fetcher/templates/showstart.md",
    searchLimit: "8",
    posterSaveLocal: false,
    posterFolder: "00-Inbox/附件/作品海报",
    filenameTemplate: "{{title}}",
    filenameCollisionTemplate: "{{title}} {{release_year}} {{showstart_activity_id}}",
  });

  assert.deepEqual(config, {
    targetFolder: "00-Inbox",
    templatePath: ".obsidian/plugins/MZ-media-fetcher/templates/showstart.md",
    searchLimit: 8,
    poster: {
      saveLocal: false,
      folder: "00-Inbox/附件/作品海报",
    },
    filename: {
      template: "{{title}}",
      collisionTemplate: "{{title}} {{release_year}} {{showstart_activity_id}}",
    },
  });
});

test("normalizeTemplateEditorValues falls back to runtime default poster folder", () => {
  const defaultConfigs = getDefaultSourceConfigs(".obsidian", "50-Others/附件");
  const config = normalizeTemplateEditorValues(
    "bangumi",
    {
      targetFolder: "00-Inbox",
      templatePath: ".obsidian/plugins/MZ-media-fetcher/templates/bangumi.md",
      searchLimit: "8",
      posterSaveLocal: true,
      posterFolder: "",
      filenameTemplate: "{{title}}",
      filenameCollisionTemplate: "{{title}} {{release_year}} {{bangumi_id}}",
    },
    defaultConfigs
  );

  assert.equal(config.poster.folder, "50-Others/附件");
});

test("resolveAttachmentFolderPath reads attachmentFolderPath from app config", () => {
  assert.equal(
    resolveAttachmentFolderPath({ attachmentFolderPath: "50-Others/附件" }),
    "50-Others/附件"
  );
  assert.equal(resolveAttachmentFolderPath({}, "00-Inbox/附件/作品海报"), "00-Inbox/附件/作品海报");
});
