import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import {
  normalizeDamaiItem,
  normalizeDamaiItemUrl,
  parseDamaiItemId,
  parseDamaiItemPage,
} from "../src/sources/damai.ts";

const fixture = fs.readFileSync(
  path.join(process.cwd(), "tests/fixtures/damai-1012125810980.html"),
  "utf8"
);

test("parseDamaiItemId accepts concrete detail URLs", () => {
  assert.equal(
    parseDamaiItemId("https://detail.damai.cn/item.htm?id=1012125810980"),
    1012125810980
  );
  assert.equal(
    parseDamaiItemId("https://m.damai.cn/shows/item.html?itemId=1012125810980"),
    1012125810980
  );
  assert.equal(
    parseDamaiItemId(
      "https://m.taopiaopiao.com/shows/item.html?itemId=1012125810980"
    ),
    1012125810980
  );
});

test("parseDamaiItemId rejects invalid URLs", () => {
  assert.throws(
    () => parseDamaiItemId("https://detail.damai.cn/search.htm?keyword=jolin"),
    /具体演出详情页链接/
  );
  assert.throws(
    () => parseDamaiItemId("https://example.com/item.htm?id=1012125810980"),
    /具体演出详情页链接/
  );
  assert.throws(
    () => parseDamaiItemId("https://detail.damai.cn/item.htm"),
    /itemId/
  );
});

test("parseDamaiItemPage extracts core event fields", () => {
  const parsed = parseDamaiItemPage(fixture, 1012125810980);
  const normalized = normalizeDamaiItem(parsed);

  assert.equal(normalized.damai_item_id, 1012125810980);
  assert.equal(normalized.damai_url, normalizeDamaiItemUrl(1012125810980));
  assert.equal(normalized.title, "【北京】Jolin蔡依林PLEASURE巡回演唱会2026 - 北京站");
  assert.equal(normalized.media_type, "演唱会");
  assert.equal(normalized.show_time, "2026.06.12-06.14");
  assert.equal(normalized.release_date, "2026-06-12");
  assert.equal(normalized.release_year, "2026");
  assert.equal(normalized.city_name, "北京市");
  assert.equal(normalized.venue_name, "国家体育场-鸟巢");
  assert.equal(
    normalized.venue_address,
    "北京市朝阳区国家体育场南路1号奥林匹克公园"
  );
  assert.equal(
    normalized.venue_text,
    "国家体育场-鸟巢 · 北京市朝阳区国家体育场南路1号奥林匹克公园"
  );
  assert.equal(
    normalized.cover_remote,
    "https://img.alicdn.com/imgextra/i4/2251059038/O1CN01AKNL4M2GdSmPNkVZc_!!2251059038.jpg"
  );
  assert.equal(normalized.summary, "蔡依林全新主题巡回演唱会《PLEASURE》。\n\n第二段介绍。");
});

test("parseDamaiItemPage supports single-day show time", () => {
  const parsed = parseDamaiItemPage(
    fixture.replace("2026.06.12-06.14", "2026.06.20"),
    1012125810980
  );
  const normalized = normalizeDamaiItem(parsed);

  assert.equal(normalized.release_date, "2026-06-20");
});
