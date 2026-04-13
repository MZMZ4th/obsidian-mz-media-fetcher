import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import {
  normalizeMobyGame,
  normalizeMobyGamesGameUrl,
  parseMobyGamesGamePage,
} from "../src/sources/mobygames.ts";

const fixture = fs.readFileSync(
  path.join(process.cwd(), "tests/fixtures/mobygames-balatro.html"),
  "utf8"
);

test("normalizeMobyGamesGameUrl accepts concrete game URLs", () => {
  assert.equal(
    normalizeMobyGamesGameUrl("https://www.mobygames.com/game/217980/balatro/?ref=foo"),
    "https://www.mobygames.com/game/217980/balatro/"
  );
});

test("parseMobyGamesGamePage extracts core game fields", () => {
  const parsed = parseMobyGamesGamePage(
    fixture,
    "https://www.mobygames.com/game/217980/balatro/"
  );
  const normalized = normalizeMobyGame(parsed);

  assert.equal(normalized.mobygames_id, 217980);
  assert.equal(normalized.title, "Balatro");
  assert.equal(normalized.release_date, "2024-02-20");
  assert.equal(normalized.release_year, "2024");
  assert.deepEqual(normalized.platforms, ["Windows", "Nintendo Switch"]);
  assert.equal(normalized.cover_remote, "https://www.mobygames.com/images/covers/l/123456-balatro.jpg");
});
