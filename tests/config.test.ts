import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import os from "os";
import path from "path";
import {
  LEGACY_PLUGIN_ID,
  PLUGIN_ID,
  getDefaultSourceConfigs,
  getLegacyDefaultSourceConfigs,
} from "../src/config/defaults.ts";
import { ConfigStore } from "../src/config/storage.ts";
import {
  normalizeTemplateEditorValues,
  resolveAttachmentFolderPath,
} from "../src/config/storage.ts";

test("normalizeTemplateEditorValues keeps template mode essentials only", () => {
  const config = normalizeTemplateEditorValues("bangumi", {
    targetFolder: "00-Inbox",
    templatePath: ".obsidian/plugins/mz-media-fetcher/templates/bangumi.md",
    searchLimit: "12",
    posterSaveLocal: false,
    posterFolder: "00-Inbox/附件/作品海报",
    filenameTemplate: "{{title}}",
    filenameCollisionTemplate: "{{title}} {{release_year}} {{bangumi_id}}",
  });

  assert.deepEqual(config, {
    targetFolder: "00-Inbox",
    templatePath: ".obsidian/plugins/mz-media-fetcher/templates/bangumi.md",
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
    templatePath: ".obsidian/plugins/mz-media-fetcher/templates/bilibili-show.md",
    searchLimit: "8",
    posterSaveLocal: true,
    posterFolder: "20-Assets/Posters",
    filenameTemplate: "{{title}}",
    filenameCollisionTemplate: "{{title}} {{release_year}} {{bilibili_show_id}}",
  });

  assert.deepEqual(config, {
    targetFolder: "00-Inbox",
    templatePath: ".obsidian/plugins/mz-media-fetcher/templates/bilibili-show.md",
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
    templatePath: ".obsidian/plugins/mz-media-fetcher/templates/showstart.md",
    searchLimit: "8",
    posterSaveLocal: false,
    posterFolder: "00-Inbox/附件/作品海报",
    filenameTemplate: "{{title}}",
    filenameCollisionTemplate: "{{title}} {{release_year}} {{showstart_activity_id}}",
  });

  assert.deepEqual(config, {
    targetFolder: "00-Inbox",
    templatePath: ".obsidian/plugins/mz-media-fetcher/templates/showstart.md",
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
      templatePath: ".obsidian/plugins/mz-media-fetcher/templates/bangumi.md",
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

test("ConfigStore imports legacy plugin config and only rewrites old built-in template paths", async () => {
  const vaultPath = fs.mkdtempSync(path.join(os.tmpdir(), "mz-media-fetcher-config-"));
  const configDir = ".obsidian";
  const legacyDefaults = getLegacyDefaultSourceConfigs(configDir, "50-Others/附件");
  const currentDefaults = getDefaultSourceConfigs(configDir, "50-Others/附件");

  fs.mkdirSync(path.join(vaultPath, configDir, "plugins", LEGACY_PLUGIN_ID), { recursive: true });
  fs.writeFileSync(
    path.join(vaultPath, configDir, "plugins", LEGACY_PLUGIN_ID, "media-fetcher-rules.json"),
    `${JSON.stringify(
      {
        bangumi: {
          ...legacyDefaults.bangumi,
          templatePath: legacyDefaults.bangumi.templatePath,
        },
        mobygames: {
          ...legacyDefaults.mobygames,
          templatePath: "50-Others/模板 fetcher/作品卡片MobyGames.md",
        },
        bilibili_show: legacyDefaults.bilibili_show,
        showstart: legacyDefaults.showstart,
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  fs.writeFileSync(
    path.join(vaultPath, configDir, "app.json"),
    `${JSON.stringify({ attachmentFolderPath: "50-Others/附件" }, null, 2)}\n`,
    "utf8"
  );

  const store = new ConfigStore({
    vault: {
      adapter: {
        getBasePath: () => vaultPath,
      },
      getName: () => "test",
      configDir,
    },
  } as any);

  const configs = await store.loadSourceConfigs(vaultPath);

  assert.equal(configs.bangumi.templatePath, currentDefaults.bangumi.templatePath);
  assert.equal(configs.mobygames.templatePath, "50-Others/模板 fetcher/作品卡片MobyGames.md");

  const newConfigPath = path.join(vaultPath, configDir, "plugins", PLUGIN_ID, "media-fetcher-rules.json");
  const saved = JSON.parse(fs.readFileSync(newConfigPath, "utf8"));
  assert.equal(saved.bangumi.templatePath, currentDefaults.bangumi.templatePath);
  assert.equal(saved.mobygames.templatePath, "50-Others/模板 fetcher/作品卡片MobyGames.md");
});
