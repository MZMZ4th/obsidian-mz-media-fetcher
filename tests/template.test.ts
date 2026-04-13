import test from "node:test";
import assert from "node:assert/strict";
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
