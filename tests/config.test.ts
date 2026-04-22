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
import {
  ConfigStore,
  normalizeTemplateEditorValues,
  resolveAttachmentFolderPath,
} from "../src/config/storage.ts";

function createPluginHarness(vaultPath: string, configDir = ".obsidian") {
  const dataPath = path.join(vaultPath, configDir, "plugins", PLUGIN_ID, "data.json");
  const plugin = {
    app: {
      vault: {
        adapter: {
          getBasePath: () => vaultPath,
        },
        getName: () => "test",
        configDir,
      },
    },
    async loadData() {
      try {
        return JSON.parse(fs.readFileSync(dataPath, "utf8"));
      } catch (error: any) {
        if (error?.code === "ENOENT") {
          return null;
        }
        throw error;
      }
    },
    async saveData(data: unknown) {
      fs.mkdirSync(path.dirname(dataPath), { recursive: true });
      fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    },
  };

  return {
    dataPath,
    store: new ConfigStore(plugin as any),
  };
}

test("normalizeTemplateEditorValues keeps template mode essentials only", () => {
  const defaultConfigs = getDefaultSourceConfigs(".obsidian", "00-Inbox/附件/作品海报");
  const config = normalizeTemplateEditorValues("bangumi", {
    targetFolder: "00-Inbox",
    templatePath: ".obsidian/plugins/mz-media-fetcher/templates/bangumi.md",
    searchLimit: "12",
    typeTemplatePaths: {
      game: ".obsidian/plugins/mz-media-fetcher/templates/bangumi-game.md",
      anime: ".obsidian/plugins/mz-media-fetcher/templates/bangumi-anime.md",
      book: "",
      liveAction: ".obsidian/plugins/mz-media-fetcher/templates/bangumi-live-action.md",
    },
    posterSaveLocal: false,
    posterFolder: "00-Inbox/附件/作品海报",
    filenameTemplate: "{{title}}",
    filenameCollisionTemplate: "{{title}} {{release_year}} {{bangumi_id}}",
  }, defaultConfigs);

  assert.deepEqual(config, {
    targetFolder: "00-Inbox",
    templatePath: ".obsidian/plugins/mz-media-fetcher/templates/bangumi.md",
    searchLimit: 12,
    typeTemplatePaths: {
      game: ".obsidian/plugins/mz-media-fetcher/templates/bangumi-game.md",
      anime: ".obsidian/plugins/mz-media-fetcher/templates/bangumi-anime.md",
      book: "",
      liveAction: ".obsidian/plugins/mz-media-fetcher/templates/bangumi-live-action.md",
    },
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
  assert.deepEqual(config.typeTemplatePaths, defaultConfigs.bangumi.typeTemplatePaths);
});

test("resolveAttachmentFolderPath reads attachmentFolderPath from app config", () => {
  assert.equal(
    resolveAttachmentFolderPath({ attachmentFolderPath: "50-Others/附件" }),
    "50-Others/附件"
  );
  assert.equal(resolveAttachmentFolderPath({}, "00-Inbox/附件/作品海报"), "00-Inbox/附件/作品海报");
});

test("ConfigStore imports current plugin config into data.json and deletes the old rules file", async () => {
  const vaultPath = fs.mkdtempSync(path.join(os.tmpdir(), "mz-media-fetcher-config-current-"));
  const configDir = ".obsidian";
  const currentDefaults = getDefaultSourceConfigs(configDir, "50-Others/附件");
  const currentRulesPath = path.join(vaultPath, configDir, "plugins", PLUGIN_ID, "media-fetcher-rules.json");

  fs.mkdirSync(path.dirname(currentRulesPath), { recursive: true });
  fs.writeFileSync(
    currentRulesPath,
    `${JSON.stringify(
      {
        bangumi: {
          ...currentDefaults.bangumi,
          typeTemplatePaths: {
            ...currentDefaults.bangumi.typeTemplatePaths,
            game: "",
          },
        },
        mobygames: currentDefaults.mobygames,
        bilibili_show: currentDefaults.bilibili_show,
        showstart: currentDefaults.showstart,
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

  const { dataPath, store } = createPluginHarness(vaultPath, configDir);
  const configs = await store.loadSourceConfigs(vaultPath);

  assert.equal(configs.bangumi.typeTemplatePaths?.game, "");
  assert.equal(fs.existsSync(currentRulesPath), false);

  const saved = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  assert.equal(saved.bangumi.typeTemplatePaths.game, "");
});

test("ConfigStore imports legacy plugin config into data.json and rewrites old built-in template paths", async () => {
  const vaultPath = fs.mkdtempSync(path.join(os.tmpdir(), "mz-media-fetcher-config-legacy-"));
  const configDir = ".obsidian";
  const legacyDefaults = getLegacyDefaultSourceConfigs(configDir, "50-Others/附件");
  const currentDefaults = getDefaultSourceConfigs(configDir, "50-Others/附件");
  const legacyRulesPath = path.join(vaultPath, configDir, "plugins", LEGACY_PLUGIN_ID, "media-fetcher-rules.json");

  fs.mkdirSync(path.dirname(legacyRulesPath), { recursive: true });
  fs.writeFileSync(
    legacyRulesPath,
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

  const { dataPath, store } = createPluginHarness(vaultPath, configDir);
  const configs = await store.loadSourceConfigs(vaultPath);

  assert.equal(configs.bangumi.templatePath, currentDefaults.bangumi.templatePath);
  assert.deepEqual(configs.bangumi.typeTemplatePaths, currentDefaults.bangumi.typeTemplatePaths);
  assert.equal(configs.mobygames.templatePath, "50-Others/模板 fetcher/作品卡片MobyGames.md");
  assert.equal(fs.existsSync(legacyRulesPath), false);

  const saved = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  assert.equal(saved.bangumi.templatePath, currentDefaults.bangumi.templatePath);
  assert.deepEqual(saved.bangumi.typeTemplatePaths, currentDefaults.bangumi.typeTemplatePaths);
  assert.equal(saved.mobygames.templatePath, "50-Others/模板 fetcher/作品卡片MobyGames.md");
});

test("ConfigStore falls back to MZ-organizer bangumi config and keeps the old file", async () => {
  const vaultPath = fs.mkdtempSync(path.join(os.tmpdir(), "mz-media-fetcher-config-organizer-"));
  const configDir = ".obsidian";
  const currentDefaults = getDefaultSourceConfigs(configDir, "50-Others/附件");
  const organizerRulesPath = path.join(
    vaultPath,
    configDir,
    "plugins",
    "MZ-organizer",
    "bangumi-card-rules.json"
  );

  fs.mkdirSync(path.dirname(organizerRulesPath), { recursive: true });
  fs.writeFileSync(
    organizerRulesPath,
    `${JSON.stringify(
      {
        targetFolder: "00-Inbox",
        templatePath: "00-Sandbox/custom-bangumi.md",
        searchLimit: 12,
        poster: {
          saveLocal: true,
          folder: "50-Others/附件",
        },
        filename: {
          template: "{{title}}",
          collisionTemplate: "{{title}} {{bangumi_id}}",
        },
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

  const { dataPath, store } = createPluginHarness(vaultPath, configDir);
  const configs = await store.loadSourceConfigs(vaultPath);

  assert.equal(configs.bangumi.templatePath, "00-Sandbox/custom-bangumi.md");
  assert.equal(configs.bangumi.searchLimit, 12);
  assert.equal(configs.mobygames.templatePath, currentDefaults.mobygames.templatePath);
  assert.equal(fs.existsSync(organizerRulesPath), true);

  const saved = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  assert.equal(saved.bangumi.templatePath, "00-Sandbox/custom-bangumi.md");
  assert.equal(saved.bangumi.searchLimit, 12);
});
