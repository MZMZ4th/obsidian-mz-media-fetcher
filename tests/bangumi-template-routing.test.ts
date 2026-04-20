import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import os from "os";
import path from "path";
import { buildCard, resolveTemplatePathForItem } from "../src/core/cards.ts";
import type { BangumiTypeTemplatePaths, NormalizedMediaItem, SourceConfig } from "../src/types.ts";

function createBangumiConfig(templatePath: string, typeTemplatePaths: BangumiTypeTemplatePaths): SourceConfig {
  return {
    targetFolder: "00-Inbox",
    templatePath,
    searchLimit: 8,
    typeTemplatePaths,
    poster: {
      saveLocal: false,
      folder: "00-Inbox/附件/作品海报",
    },
    filename: {
      template: "{{title}}",
      collisionTemplate: "{{title}} {{release_year}} {{bangumi_id}}",
    },
  };
}

function createBangumiItem(mediaType: string): NormalizedMediaItem {
  return {
    bangumi_id: 328609,
    bangumi_url: "https://bgm.tv/subject/328609",
    title: `测试-${mediaType || "unknown"}`,
    title_original: "",
    aliases: [],
    media_type: mediaType,
    release_date: "2022-10-08",
    release_year: "2022",
    cover_remote: "https://example.com/cover.jpg",
    summary: "简介",
    platforms: [],
    platforms_text: "",
  };
}

test("resolveTemplatePathForItem maps bangumi media types to dedicated template paths", () => {
  const typeTemplatePaths = {
    game: "templates/bangumi-game.md",
    anime: "templates/bangumi-anime.md",
    book: "templates/bangumi-book.md",
    liveAction: "templates/bangumi-live-action.md",
  };
  const config = createBangumiConfig("templates/bangumi.md", typeTemplatePaths);

  assert.equal(resolveTemplatePathForItem("bangumi", createBangumiItem("游戏"), config), typeTemplatePaths.game);
  assert.equal(resolveTemplatePathForItem("bangumi", createBangumiItem("动画"), config), typeTemplatePaths.anime);
  assert.equal(resolveTemplatePathForItem("bangumi", createBangumiItem("书籍"), config), typeTemplatePaths.book);
  assert.equal(
    resolveTemplatePathForItem("bangumi", createBangumiItem("三次元"), config),
    typeTemplatePaths.liveAction
  );
  assert.equal(resolveTemplatePathForItem("bangumi", createBangumiItem("音乐"), config), "templates/bangumi.md");
});

test("resolveTemplatePathForItem falls back to the general bangumi template when override is blank", () => {
  const config = createBangumiConfig("templates/bangumi.md", {
    game: "",
    anime: "",
    book: "",
    liveAction: "",
  });

  assert.equal(resolveTemplatePathForItem("bangumi", createBangumiItem("游戏"), config), "templates/bangumi.md");
});

test("buildCard uses bangumi type template when one is configured", async () => {
  const vaultPath = fs.mkdtempSync(path.join(os.tmpdir(), "mz-media-fetcher-bangumi-template-"));
  fs.mkdirSync(path.join(vaultPath, "templates"), { recursive: true });
  fs.writeFileSync(path.join(vaultPath, "templates", "bangumi.md"), "通用模板\n", "utf8");
  fs.writeFileSync(path.join(vaultPath, "templates", "bangumi-game.md"), "游戏模板：{{title}}\n", "utf8");

  const app = {
    vault: {
      adapter: {
        exists: async () => false,
      },
      createFolder: async () => undefined,
      createBinary: async () => undefined,
    },
  };

  const card = await buildCard(
    app,
    { name: "test", path: vaultPath },
    "bangumi",
    createBangumiItem("游戏"),
    createBangumiConfig("templates/bangumi.md", {
      game: "templates/bangumi-game.md",
      anime: "",
      book: "",
      liveAction: "",
    })
  );

  assert.equal(card.filePath, "00-Inbox/测试-游戏.md");
  assert.equal(card.content, "游戏模板：测试-游戏\n");
});
