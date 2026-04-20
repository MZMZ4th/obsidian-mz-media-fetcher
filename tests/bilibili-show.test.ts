import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import {
  normalizeBilibiliShowProject,
  normalizeBilibiliShowProjectUrl,
  parseBilibiliShowProjectId,
  unwrapBilibiliShowProjectResponse,
} from "../src/sources/bilibili-show.ts";
import type { BilibiliShowProjectResponse } from "../src/sources/bilibili-show.ts";

const fixture = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "tests/fixtures/bilibili-show-107593.json"), "utf8")
) as BilibiliShowProjectResponse;

test("parseBilibiliShowProjectId accepts concrete detail URLs", () => {
  assert.equal(
    parseBilibiliShowProjectId("https://show.bilibili.com/platform/detail.html?id=107593"),
    107593
  );
});

test("parseBilibiliShowProjectId rejects non-detail URLs", () => {
  assert.throws(
    () => parseBilibiliShowProjectId("https://show.bilibili.com/platform/home.html"),
    /具体详情页链接/
  );
});

test("normalizeBilibiliShowProject extracts core project fields", () => {
  const parsed = unwrapBilibiliShowProjectResponse(fixture, 107593);
  const normalized = normalizeBilibiliShowProject(parsed);

  assert.equal(normalized.bilibili_show_id, 107593);
  assert.equal(
    normalized.bilibili_show_url,
    normalizeBilibiliShowProjectUrl(107593)
  );
  assert.equal(normalized.title, "杭州· ilem&林震Linz「哎嗒派送」音乐专场");
  assert.equal(normalized.release_date, "2025-10-02");
  assert.equal(normalized.release_year, "2025");
  assert.equal(
    normalized.cover_remote,
    "https://i2.hdslb.com/bfs/openplatform/202509/nhqsQVvz1756986449057.jpeg"
  );
  assert.equal(normalized.venue_name, "");
  assert.equal(normalized.venue_address, "");
  assert.equal(normalized.venue_text, "");
});

test("normalizeBilibiliShowProject extracts venue fields from fallback candidates", () => {
  const normalized = normalizeBilibiliShowProject({
    ...fixture.data!,
    site_name: "杭州奥体中心体育馆",
    detail_address: "浙江省杭州市滨江区飞虹路3号",
  });

  assert.equal(normalized.venue_name, "杭州奥体中心体育馆");
  assert.equal(normalized.venue_address, "浙江省杭州市滨江区飞虹路3号");
  assert.equal(
    normalized.venue_text,
    "杭州奥体中心体育馆 · 浙江省杭州市滨江区飞虹路3号"
  );
});

test("normalizeBilibiliShowProject extracts venue fields from nested venue info", () => {
  const normalized = normalizeBilibiliShowProject({
    ...fixture.data!,
    venueInfo: {
      name: "杭州奥体中心体育馆",
      detailAddress: "浙江省杭州市滨江区飞虹路3号",
    },
  });

  assert.equal(normalized.venue_name, "杭州奥体中心体育馆");
  assert.equal(normalized.venue_address, "浙江省杭州市滨江区飞虹路3号");
  assert.equal(
    normalized.venue_text,
    "杭州奥体中心体育馆 · 浙江省杭州市滨江区飞虹路3号"
  );
});
