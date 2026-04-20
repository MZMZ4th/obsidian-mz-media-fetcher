import test from "node:test";
import assert from "node:assert/strict";
import { normalizeBangumiSubject } from "../src/sources/bangumi.ts";

test("normalizeBangumiSubject maps titles, aliases and release info", () => {
  const normalized = normalizeBangumiSubject({
    id: 328609,
    name: "Bocchi the Rock!",
    name_cn: "孤独摇滚！",
    date: "2022-10-08",
    type: 2,
    summary: "  一支乐队的故事。  ",
    images: {
      large: "https://example.com/cover.jpg",
    },
    infobox: [
      {
        key: "别名",
        value: ["ぼっち・ざ・ろっく！", { v: "BTR" }],
      },
      {
        key: "作者",
        value: [{ v: "はまじあき" }, "Hamazi Aki"],
      },
      {
        key: "出版社",
        value: ["芳文社", { v: "Houbunsha" }],
      },
      {
        key: "连载杂志",
        value: ["Manga Time Kirara MAX"],
      },
    ],
  });

  assert.equal(normalized.title, "孤独摇滚！");
  assert.equal(normalized.title_original, "Bocchi the Rock!");
  assert.equal(normalized.release_date, "2022-10-08");
  assert.equal(normalized.release_year, "2022");
  assert.equal(normalized.media_type, "动画");
  assert.equal(normalized.cover_remote, "https://example.com/cover.jpg");
  assert.deepEqual(normalized.aliases, ["ぼっち・ざ・ろっく！", "BTR"]);
  assert.deepEqual(normalized.authors, ["はまじあき", "Hamazi Aki"]);
  assert.deepEqual(normalized.publishers, ["芳文社", "Houbunsha"]);
  assert.deepEqual(normalized.serial_magazines, ["Manga Time Kirara MAX"]);
});
