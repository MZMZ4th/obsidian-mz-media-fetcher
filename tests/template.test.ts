import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { chooseAvailableCardPath } from "../src/core/files.ts";
import { buildTemplateContext, renderTemplate } from "../src/core/template.ts";

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

  assert.equal(selected, "00-Inbox/Balatro 2024 217980 2.md");
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
    release_date: "2025-10-02 19:00",
    release_year: "2025",
    cover_remote: "https://i2.hdslb.com/example.jpeg",
    summary: "",
    platforms: [],
    platforms_text: "",
    bilibili_show_url: "https://show.bilibili.com/platform/detail.html?id=107593",
    bilibili_show_id: 107593,
  });

  const rendered = renderTemplate(template, context);
  assert.match(rendered, /名称: "杭州· ilem&林震Linz「哎嗒派送」音乐专场"/);
  assert.match(rendered, /发布日期: "2025-10-02 19:00"/);
  assert.match(rendered, /海报: https:\/\/i2\.hdslb\.com\/example\.jpeg/);
  assert.match(
    rendered,
    /来源链接: https:\/\/show\.bilibili\.com\/platform\/detail\.html\?id=107593/
  );
  assert.match(rendered, /网络海报: true/);
});
