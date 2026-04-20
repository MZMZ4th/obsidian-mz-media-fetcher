import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzeBangumiFrontmatterUpdate,
  buildBangumiFrontmatterEntries,
  collectBangumiTemplateValueCandidates,
  listFrontmatterKeys,
  parseTemplateFrontmatterBindings,
  replaceFrontmatter,
} from "../src/bangumi-refresh.ts";

const template = `---
名称: {{yaml.title}}
原名: {{yaml.title_original}}
aliases: {{yaml.aliases}}
Bangumi ID: {{yaml.bangumi_id}}
作者: {{yaml.authors}}
出版社: {{yaml.publishers}}
连载杂志: {{yaml.serial_magazines}}
海报: {{poster}}
来源链接: {{bangumi_url}}
网络海报: {{yaml.network_poster}}
---

正文
`;

test("collectBangumiTemplateValueCandidates resolves logical ids from template-bound properties", () => {
  const bindings = parseTemplateFrontmatterBindings(template);
  const candidates = collectBangumiTemplateValueCandidates(
    {
      来源链接: "https://bgm.tv/subject/328609",
      "Bangumi ID": 328609,
    },
    [bindings]
  );

  assert.equal(candidates.bangumi_url, "https://bgm.tv/subject/328609");
  assert.equal(candidates.bangumi_id, 328609);
});

test("bangumi refresh analysis preserves local posters and detects only real conflicts", () => {
  const bindings = parseTemplateFrontmatterBindings(template);
  const analysis = analyzeBangumiFrontmatterUpdate({
    templateBindings: bindings,
    existingFrontmatter: {
      categories: "新作品卡片",
      名称: "旧标题",
      原名: "Old Name",
      来源链接: "https://bgm.tv/subject/1",
      海报: "00-Inbox/附件/旧海报.jpg",
      网络海报: false,
      评分: "",
      自定义字段: "保留我",
    },
    existingKeyOrder: ["categories", "名称", "原名", "来源链接", "海报", "网络海报", "评分", "自定义字段"],
    fetchedValues: {
      title: "新标题",
      title_original: "New Name",
      aliases: ["别名1", "别名2"],
      bangumi_id: 328609,
      authors: ["作者甲"],
      publishers: ["出版社乙"],
      serial_magazines: ["杂志丙"],
      poster: "https://example.com/new-poster.jpg",
      bangumi_url: "https://bgm.tv/subject/328609",
      network_poster: true,
    },
  });

  assert.deepEqual(
    analysis.conflicts.map((item) => item.propertyKey),
    ["名称", "原名", "来源链接"]
  );

  const posterCandidate = analysis.managedCandidates.find((item) => item.propertyKey === "海报");
  const networkPosterCandidate = analysis.managedCandidates.find(
    (item) => item.propertyKey === "网络海报"
  );
  assert.equal(posterCandidate?.fetchedValue, "00-Inbox/附件/旧海报.jpg");
  assert.equal(networkPosterCandidate?.fetchedValue, false);
});

test("bangumi refresh rewrites frontmatter in template order and keeps body unchanged", () => {
  const content = `---
categories: 新作品卡片
名称: "旧标题"
来源链接: https://bgm.tv/subject/1
海报: 00-Inbox/附件/旧海报.jpg
网络海报: false
评分:
自定义字段: "保留我"
---

## 简介

原正文
`;
  const bindings = parseTemplateFrontmatterBindings(template);
  const analysis = analyzeBangumiFrontmatterUpdate({
    templateBindings: bindings,
    existingFrontmatter: {
      categories: "新作品卡片",
      名称: "旧标题",
      来源链接: "https://bgm.tv/subject/1",
      海报: "00-Inbox/附件/旧海报.jpg",
      网络海报: false,
      评分: "",
      自定义字段: "保留我",
    },
    existingKeyOrder: listFrontmatterKeys(content.split("---\n")[1]),
    fetchedValues: {
      title: "新标题",
      title_original: "New Name",
      aliases: ["别名1", "别名2"],
      bangumi_id: 328609,
      authors: ["作者甲"],
      publishers: ["出版社乙"],
      serial_magazines: ["杂志丙"],
      poster: "https://example.com/new-poster.jpg",
      bangumi_url: "https://bgm.tv/subject/328609",
      network_poster: true,
    },
  });

  const entries = buildBangumiFrontmatterEntries(analysis, {
    名称: "keep",
    来源链接: "replace",
  });
  const nextContent = replaceFrontmatter(content, entries);

  assert.match(nextContent, /^---\n名称: "旧标题"/);
  assert.match(nextContent, /Bangumi ID: 328609/);
  assert.match(nextContent, /作者:\n  - "作者甲"/);
  assert.match(nextContent, /出版社:\n  - "出版社乙"/);
  assert.match(nextContent, /连载杂志:\n  - "杂志丙"/);
  assert.match(nextContent, /海报: "00-Inbox\/附件\/旧海报\.jpg"/);
  assert.match(nextContent, /网络海报: false/);
  assert.match(nextContent, /categories: "新作品卡片"\n评分: ""\n自定义字段: "保留我"/);
  assert.match(nextContent, /## 简介\n\n原正文/);
});
