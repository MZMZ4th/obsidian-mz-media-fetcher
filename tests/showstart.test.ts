import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import {
  normalizeShowstartActivity,
  normalizeShowstartActivityUrl,
  parseShowstartActivityId,
  unwrapShowstartActivityResponse,
} from "../src/sources/showstart.ts";
import type { ShowstartActivityResponse } from "../src/sources/showstart.ts";
import {
  buildShowstartV3Request,
  extractShowstartAnonymousAuth,
} from "../src/sources/showstart-v3.ts";

const fixture = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "tests/fixtures/showstart-208747.json"), "utf8")
) as ShowstartActivityResponse;

test("parseShowstartActivityId accepts concrete detail URLs", () => {
  assert.equal(
    parseShowstartActivityId(
      "https://wap.showstart.com/pages/activity/detail/detail?activityId=208747"
    ),
    208747
  );
  assert.equal(parseShowstartActivityId("https://www.showstart.com/event/208747"), 208747);
  assert.equal(
    parseShowstartActivityId("https://wap.showstart.com/pages/activity/detail/detail?id=208747"),
    208747
  );
});

test("parseShowstartActivityId rejects invalid URLs", () => {
  assert.throws(
    () => parseShowstartActivityId("https://wap.showstart.com/pages/activity/list/list"),
    /具体活动详情页链接/
  );
  assert.throws(
    () => parseShowstartActivityId("https://example.com/pages/activity/detail/detail?activityId=1"),
    /不是秀动的链接/
  );
  assert.throws(
    () => parseShowstartActivityId("https://wap.showstart.com/pages/activity/detail/detail"),
    /activityId/
  );
});

test("normalizeShowstartActivity extracts core activity fields", () => {
  const parsed = unwrapShowstartActivityResponse(fixture, 208747);
  const normalized = normalizeShowstartActivity(parsed);

  assert.equal(normalized.showstart_activity_id, 208747);
  assert.equal(normalized.showstart_url, normalizeShowstartActivityUrl(208747));
  assert.equal(normalized.title, "2024张惠妹 ASMR MAXXX 巡回演唱会-杭州站");
  assert.equal(normalized.release_date, "2024-09-14");
  assert.equal(normalized.release_year, "2024");
  assert.equal(
    normalized.cover_remote,
    "https://img.showstart.com/example-showstart-poster.jpg"
  );
  assert.equal(normalized.summary, "这是秀动活动简介。\n\n第二段。");
  assert.equal(normalized.venue_name, "杭州奥体中心体育馆");
  assert.equal(normalized.venue_address, "浙江省杭州市滨江区飞虹路3号");
  assert.equal(
    normalized.venue_text,
    "杭州奥体中心体育馆 · 浙江省杭州市滨江区飞虹路3号"
  );
});

test("normalizeShowstartActivity falls back to secondary poster fields", () => {
  const normalized = normalizeShowstartActivity({
    activityId: 208747,
    activityName: "测试活动",
    activityTime: "2024-09-14",
    shareImage: "https://img.showstart.com/example-showstart-share.jpg",
  });

  assert.equal(
    normalized.cover_remote,
    "https://img.showstart.com/example-showstart-share.jpg"
  );
});

test("normalizeShowstartActivity supports v3 response fields", () => {
  const normalized = normalizeShowstartActivity({
    activityId: 208747,
    title: "测试活动",
    showTime: "2023.10.21 周六 19:30",
    avatar: "https://img.showstart.com/example-showstart-avatar.jpg",
    document: "<p>第一段。</p><p>第二段。</p>",
  });

  assert.equal(normalized.release_date, "2023-10-21");
  assert.equal(normalized.cover_remote, "https://img.showstart.com/example-showstart-avatar.jpg");
  assert.equal(normalized.summary, "第一段。\n\n第二段。");
});

test("normalizeShowstartActivity extracts venue fields from fallback candidates", () => {
  const normalized = normalizeShowstartActivity({
    ...fixture.data!,
    siteName: "杭州奥体中心体育馆",
    address: "浙江省杭州市滨江区飞虹路3号",
  });

  assert.equal(normalized.venue_name, "杭州奥体中心体育馆");
  assert.equal(normalized.venue_address, "浙江省杭州市滨江区飞虹路3号");
  assert.equal(
    normalized.venue_text,
    "杭州奥体中心体育馆 · 浙江省杭州市滨江区飞虹路3号"
  );
});

test("normalizeShowstartActivity extracts venue fields from nested venue info", () => {
  const normalized = normalizeShowstartActivity({
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

test("normalizeShowstartActivity prefers a composed full address over top-level city only", () => {
  const normalized = normalizeShowstartActivity({
    activityId: 208747,
    activityName: "测试活动",
    cityName: "杭州市",
    venueInfo: {
      name: "杭州奥体中心体育馆",
      provinceName: "浙江省",
      cityName: "杭州市",
      districtName: "滨江区",
      detailAddress: "飞虹路3号",
    },
  });

  assert.equal(normalized.venue_name, "杭州奥体中心体育馆");
  assert.equal(normalized.venue_address, "浙江省杭州市滨江区飞虹路3号");
  assert.equal(
    normalized.venue_text,
    "杭州奥体中心体育馆 · 浙江省杭州市滨江区飞虹路3号"
  );
});

test("normalizeShowstartActivity assembles split venue address parts", () => {
  const normalized = normalizeShowstartActivity({
    activityId: 208747,
    activityName: "测试活动",
    venueInfo: {
      siteName: "杭州奥体中心体育馆",
      provinceName: "浙江省",
      cityName: "杭州市",
      districtName: "滨江区",
      detailAddress: "飞虹路3号",
    },
  });

  assert.equal(normalized.venue_name, "杭州奥体中心体育馆");
  assert.equal(normalized.venue_address, "浙江省杭州市滨江区飞虹路3号");
});

test("normalizeShowstartActivity extracts venue fields from object-style venue containers", () => {
  const normalized = normalizeShowstartActivity({
    activityId: 208747,
    activityName: "测试活动",
    venue: {
      name: "杭州奥体中心体育馆",
      address: "浙江省杭州市滨江区飞虹路3号",
    },
  });

  assert.equal(normalized.venue_name, "杭州奥体中心体育馆");
  assert.equal(normalized.venue_address, "浙江省杭州市滨江区飞虹路3号");
  assert.equal(
    normalized.venue_text,
    "杭州奥体中心体育馆 · 浙江省杭州市滨江区飞虹路3号"
  );
});

test("normalizeShowstartActivity extracts venue fields from live site objects", () => {
  const normalized = normalizeShowstartActivity({
    activityId: 208747,
    activityName: "测试活动",
    site: {
      id: 6836653,
      name: "杭州东坡大剧院",
      address: "杭州市上城区东坡路10号杭州湖滨银泰in77D区",
      cityName: "杭州",
    },
  });

  assert.equal(normalized.venue_name, "杭州东坡大剧院");
  assert.equal(normalized.venue_address, "杭州市上城区东坡路10号杭州湖滨银泰in77D区");
  assert.equal(
    normalized.venue_text,
    "杭州东坡大剧院 · 杭州市上城区东坡路10号杭州湖滨银泰in77D区"
  );
});

test("buildShowstartV3Request matches the verified v3 route format", () => {
  const request = buildShowstartV3Request(
    "/waf/gettoken",
    {},
    {
      accessToken: "",
      idToken: "",
      userId: "",
      deviceToken: "cc8ce721ab9a06044cd946faba8d89ad",
      traceId: "1n659dgi058W6iCw1xlq1uqj6S536xB61776361509575",
    }
  );

  assert.equal(request.url, "https://wap.showstart.com/v3/waf/gettoken");
  assert.equal(request.body, "{}");
  assert.equal(request.headers.CUSAT, "nil");
  assert.equal(request.headers.CDEVICENO, "cc8ce721ab9a06044cd946faba8d89ad");
  assert.equal(request.headers.CRPSIGN, "ab94af7d0ebcbc01a526f12338a554ac");
});

test("extractShowstartAnonymousAuth unwraps guest tokens", () => {
  const auth = extractShowstartAnonymousAuth({
    state: "1",
    result: {
      accessToken: {
        access_token: "93ffedaa67928b5969e1286cYjeR4Q7v",
        expire: 1776363628,
      },
      idToken: {
        id_token: "",
        expire: 0,
      },
    },
  }, "cc8ce721ab9a06044cd946faba8d89ad");

  assert.equal(auth.accessToken, "93ffedaa67928b5969e1286cYjeR4Q7v");
  assert.equal(auth.idToken, "");
  assert.equal(auth.deviceToken, "cc8ce721ab9a06044cd946faba8d89ad");
  assert.equal(auth.expiresAt, 1776363628 * 1000);
});
