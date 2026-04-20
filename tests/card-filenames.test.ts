import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import os from "os";
import path from "path";
import { buildCard } from "../src/core/cards.ts";

test("buildCard keeps note and poster filenames safe for Windows reserved names", async () => {
  const vaultPath = fs.mkdtempSync(path.join(os.tmpdir(), "mz-media-fetcher-card-filenames-"));
  const templatePath = path.join(vaultPath, "templates", "local-poster.md");
  fs.mkdirSync(path.dirname(templatePath), { recursive: true });
  fs.writeFileSync(templatePath, "海报: {{poster}}\n网络海报: {{yaml.network_poster}}\n", "utf8");

  const createdBinary: Array<{ filePath: string; bytes: ArrayBuffer }> = [];
  const app = {
    vault: {
      adapter: {
        exists: async () => false,
      },
      createFolder: async () => undefined,
      createBinary: async (filePath: string, bytes: ArrayBuffer) => {
        createdBinary.push({ filePath, bytes });
      },
    },
  };

  const card = await buildCard(
    app,
    { name: "test", path: vaultPath },
    "bilibili_show",
    {
      bilibili_show_id: 999001,
      bilibili_show_url: "https://show.bilibili.com/platform/detail.html?id=999001",
      title: "CON...",
      title_original: "",
      aliases: [],
      media_type: "",
      release_date: "2025-10-02",
      release_year: "2025",
      cover_remote: "https://example.com/poster.jpeg",
      summary: "",
      platforms: [],
      platforms_text: "",
      venue_name: "",
      venue_address: "",
      venue_text: "",
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

  assert.equal(card.filePath, "00-Inbox/CON-file.md");
  assert.equal(createdBinary.length, 1);
  assert.equal(createdBinary[0].filePath, "00-Inbox/附件/作品海报/CON-file.jpeg");
  assert.match(card.content, /海报: 00-Inbox\/附件\/作品海报\/CON-file\.jpeg/);
});
