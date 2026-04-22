import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import os from "os";
import { chooseAvailableCardPath } from "../src/core/files.ts";
import { buildCard } from "../src/core/cards.ts";
import { resolvePosterLinkText } from "../src/core/poster.ts";
import { buildTemplateContext, renderTemplate } from "../src/core/template.ts";
import { MEDIA_SOURCE_UI_META_MAP } from "../src/source-ui-meta.ts";
import { sanitizeFileName } from "../src/core/text.ts";

function createLinkAwareApp(resolveLinkText?: (filePath: string, sourcePath: string) => string) {
  const files = new Set<string>();
  const createdFolders: string[] = [];
  const createdBinary: Array<{ filePath: string; bytes: ArrayBuffer }> = [];

  const app = {
    vault: {
      adapter: {
        exists: async (candidate: string) => files.has(candidate),
      },
      getAbstractFileByPath: (filePath: string) => {
        if (!files.has(filePath)) {
          return null;
        }
        return {
          path: filePath,
          name: path.basename(filePath),
          basename: path.parse(filePath).name,
          extension: path.extname(filePath).replace(/^\./, ""),
        };
      },
      createFolder: async (folder: string) => {
        createdFolders.push(folder);
      },
      createBinary: async (filePath: string, bytes: ArrayBuffer) => {
        files.add(filePath);
        createdBinary.push({ filePath, bytes });
      },
    },
    metadataCache: {
      fileToLinktext: (file: { path: string }, sourcePath: string) =>
        resolveLinkText ? resolveLinkText(file.path, sourcePath) : path.basename(file.path),
      getFirstLinkpathDest: (linkText: string) => {
        for (const filePath of files) {
          if (path.basename(filePath) === linkText || filePath === linkText) {
            return {
              path: filePath,
              name: path.basename(filePath),
              basename: path.parse(filePath).name,
              extension: path.extname(filePath).replace(/^\./, ""),
            };
          }
        }
        return null;
      },
    },
  };

  return { app, createdBinary, createdFolders, files };
}

test("renderTemplate uses yaml-safe values in context", () => {
  const context = buildTemplateContext("bangumi", {
    title: "孤独摇滚！",
    title_original: "Bocchi the Rock!",
    aliases: ["BTR"],
    media_type: "动画",
    release_date: "2022-10-08",
    release_year: "2022",
    cover_remote: "https://example.com/cover.jpg",
    summary: "简介",
    platforms: [],
    platforms_text: "",
    bangumi_url: "https://bgm.tv/subject/328609",
  });

  const rendered = renderTemplate("名称: {{yaml.title}}\n海报: {{poster}}", context);
  assert.equal(rendered, '名称: "孤独摇滚！"\n海报: https://example.com/cover.jpg');
});

test("chooseAvailableCardPath falls back to collision template and suffix", async () => {
  const seen = new Set([
    "00-Inbox/Balatro.md",
    "00-Inbox/Balatro 2024 217980.md",
  ]);

  const selected = await chooseAvailableCardPath(
    "00-Inbox",
    "Balatro",
    "Balatro 2024 217980",
    async (candidate) => seen.has(candidate)
  );

  assert.equal(selected, "00-Inbox/Balatro 2024 217980-2.md");
});

test("sanitizeFileName normalizes whitespace and illegal characters", () => {
  assert.equal(sanitizeFileName("  Hello   World  "), "Hello-World");
  assert.equal(sanitizeFileName("A/B:C"), "A-B-C");
  assert.equal(sanitizeFileName("Act 1---Finale"), "Act-1-Finale");
});

test("sanitizeFileName strips control chars and trailing dots", () => {
  assert.equal(
    sanitizeFileName("  bad\u0000name\twith\nchars:*?\"<>|  "),
    "bad-name-with-chars"
  );
  assert.equal(sanitizeFileName("Report Final...  "), "Report-Final");
  assert.equal(sanitizeFileName("...\t"), "");
});

test("sanitizeFileName avoids Windows reserved names", () => {
  assert.equal(sanitizeFileName("CON"), "CON-file");
  assert.equal(sanitizeFileName("nul"), "nul-file");
  assert.equal(sanitizeFileName("Lpt9.txt"), "Lpt9-file.txt");
  assert.equal(sanitizeFileName(" \n\t "), "");
});

test("bangumi default template renders required card fields", () => {
  const template = fs.readFileSync(path.join(process.cwd(), "templates/bangumi.md"), "utf8");
  const context = buildTemplateContext("bangumi", {
    title: "四叠半神话大系",
    title_original: "四畳半神話大系",
    aliases: ["The Tatami Galaxy"],
    media_type: "书籍",
    release_date: "2010-04-22",
    release_year: "2010",
    cover_remote: "https://example.com/bangumi-cover.jpg",
    summary: "简介",
    platforms: [],
    platforms_text: "",
    bangumi_id: 328609,
    bangumi_url: "https://bgm.tv/subject/328609",
    authors: ["森见登美彦"],
    publishers: ["角川书店"],
    serial_magazines: ["野性时代"],
  });

  const rendered = renderTemplate(template, context);
  assert.match(rendered, /Bangumi ID: 328609/);
  assert.match(rendered, /作者:\s*\n\s*- "森见登美彦"/);
  assert.match(rendered, /出版社:\s*\n\s*- "角川书店"/);
  assert.match(rendered, /连载杂志:\s*\n\s*- "野性时代"/);
  assert.match(rendered, /网络海报: true/);
  assert.match(rendered, /- bangumi_id: 328609/);
  assert.match(rendered, /- authors: 森见登美彦/);
});

test("bilibili_show default template renders required card fields", () => {
  const template = fs.readFileSync(
    path.join(process.cwd(), "templates/bilibili-show.md"),
    "utf8"
  );
  const context = buildTemplateContext("bilibili_show", {
    title: "杭州· ilem&林震Linz「哎嗒派送」音乐专场",
    title_original: "",
    aliases: [],
    media_type: "",
    release_date: "2025-10-02",
    release_year: "2025",
    cover_remote: "https://i2.hdslb.com/example.jpeg",
    summary: "",
    platforms: [],
    platforms_text: "",
    venue_name: "杭州奥体中心体育馆",
    venue_address: "浙江省杭州市滨江区飞虹路3号",
    venue_text: "杭州奥体中心体育馆 · 浙江省杭州市滨江区飞虹路3号",
    bilibili_show_url: "https://show.bilibili.com/platform/detail.html?id=107593",
    bilibili_show_id: 107593,
  });

  const rendered = renderTemplate(template, context);
  assert.match(rendered, /名称: "杭州· ilem&林震Linz「哎嗒派送」音乐专场"/);
  assert.match(rendered, /发布日期: "2025-10-02"/);
  assert.match(rendered, /演出场所: "杭州奥体中心体育馆 · 浙江省杭州市滨江区飞虹路3号"/);
  assert.match(rendered, /海报: https:\/\/i2\.hdslb\.com\/example\.jpeg/);
  assert.match(
    rendered,
    /来源链接: https:\/\/show\.bilibili\.com\/platform\/detail\.html\?id=107593/
  );
  assert.match(rendered, /网络海报: true/);
  assert.match(rendered, /- bilibili_show_id: 107593/);
  assert.match(rendered, /- venue_name: 杭州奥体中心体育馆/);
});

test("showstart default template renders required card fields", () => {
  const template = fs.readFileSync(
    path.join(process.cwd(), "templates/showstart.md"),
    "utf8"
  );
  const context = buildTemplateContext("showstart", {
    title: "2024张惠妹 ASMR MAXXX 巡回演唱会-杭州站",
    title_original: "",
    aliases: [],
    media_type: "",
    release_date: "2024-09-14",
    release_year: "2024",
    cover_remote: "https://img.showstart.com/example-showstart-poster.jpg",
    summary: "",
    platforms: [],
    platforms_text: "",
    venue_name: "杭州奥体中心体育馆",
    venue_address: "浙江省杭州市滨江区飞虹路3号",
    venue_text: "杭州奥体中心体育馆 · 浙江省杭州市滨江区飞虹路3号",
    showstart_url: "https://wap.showstart.com/pages/activity/detail/detail?activityId=208747",
    showstart_activity_id: 208747,
  });

  const rendered = renderTemplate(template, context);
  assert.match(rendered, /名称: "2024张惠妹 ASMR MAXXX 巡回演唱会-杭州站"/);
  assert.match(rendered, /发布日期: "2024-09-14"/);
  assert.match(rendered, /演出场所: "杭州奥体中心体育馆 · 浙江省杭州市滨江区飞虹路3号"/);
  assert.match(rendered, /海报: https:\/\/img\.showstart\.com\/example-showstart-poster\.jpg/);
  assert.match(
    rendered,
    /来源链接: https:\/\/wap\.showstart\.com\/pages\/activity\/detail\/detail\?activityId=208747/
  );
  assert.match(rendered, /网络海报: true/);
  assert.match(rendered, /状态: 已完成/);
  assert.match(rendered, /完成时间: "2024-09-14"/);
  assert.match(rendered, /- showstart_activity_id: 208747/);
});

test("event source metadata exposes venue template variables", () => {
  const bilibiliVenue = MEDIA_SOURCE_UI_META_MAP.bilibili_show.templateVariables.filter((item) =>
    item.key.startsWith("venue_")
  );
  const showstartVenue = MEDIA_SOURCE_UI_META_MAP.showstart.templateVariables.filter((item) =>
    item.key.startsWith("venue_")
  );

  assert.deepEqual(
    bilibiliVenue.map((item) => item.key),
    ["venue_name", "venue_address", "venue_text"]
  );
  assert.deepEqual(
    showstartVenue.map((item) => item.key),
    ["venue_name", "venue_address", "venue_text"]
  );
  assert.match(String(bilibiliVenue[2]?.description || ""), /演出场所/);
});

test("resolvePosterLinkText keeps unique filenames and falls back to shortest unique path", () => {
  const { app, files } = createLinkAwareApp((filePath) =>
    filePath.includes("重复") ? filePath : path.basename(filePath)
  );
  files.add("50-Attachments/唯一海报.jpg");
  files.add("50-Attachments/重复海报.jpg");

  assert.equal(
    resolvePosterLinkText(app, "00-Inbox/测试.md", "50-Attachments/唯一海报.jpg"),
    "唯一海报.jpg"
  );
  assert.equal(
    resolvePosterLinkText(app, "00-Inbox/测试.md", "50-Attachments/重复海报.jpg"),
    "50-Attachments/重复海报.jpg"
  );
});

test("buildCard downloads poster locally when poster.saveLocal is enabled", async () => {
  const vaultPath = fs.mkdtempSync(path.join(os.tmpdir(), "mz-media-fetcher-"));
  const templatePath = path.join(vaultPath, "templates", "local-poster.md");
  fs.mkdirSync(path.dirname(templatePath), { recursive: true });
  fs.writeFileSync(
    templatePath,
    "海报: {{poster}}\n网络海报: {{yaml.network_poster}}\n{{cover_markdown}}\n",
    "utf8"
  );

  const { app, createdBinary, createdFolders } = createLinkAwareApp();

  const card = await buildCard(
    app,
    { name: "test", path: vaultPath },
    "bilibili_show",
    {
      title: "测试 活动",
      title_original: "",
      aliases: [],
      media_type: "",
      release_date: "2025-10-02",
      release_year: "2025",
      cover_remote: "https://example.com/poster.jpeg",
      summary: "",
      platforms: [],
      platforms_text: "",
      bilibili_show_id: 107593,
      bilibili_show_url: "https://show.bilibili.com/platform/detail.html?id=107593",
    },
    {
      targetFolder: "00-Inbox",
      templatePath: "templates/local-poster.md",
      searchLimit: 8,
      poster: {
        saveLocal: true,
        folder: "00-Inbox/附件/作品海报",
      },
      filename: {
        template: "{{title}}",
        collisionTemplate: "{{title}} {{release_year}} {{bilibili_show_id}}",
      },
    },
    async () => new Uint8Array([1, 2, 3]).buffer
  );

  assert.deepEqual(createdFolders, ["00-Inbox", "00-Inbox/附件", "00-Inbox/附件/作品海报"]);
  assert.equal(createdBinary.length, 1);
  assert.equal(card.filePath, "00-Inbox/测试-活动.md");
  assert.equal(createdBinary[0].filePath, "00-Inbox/附件/作品海报/测试-活动.jpeg");
  assert.match(card.content, /海报: 测试-活动\.jpeg/);
  assert.match(card.content, /!\[cover\|300\]\(<测试-活动\.jpeg>\)/);
  assert.match(card.content, /网络海报: false/);
});
