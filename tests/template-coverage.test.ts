import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import {
  BANGUMI_TYPE_TEMPLATE_CONTENTS,
  TEMPLATE_CONTENTS,
} from "../src/config/defaults.ts";
import { getSourceTemplateVariables } from "../src/template-fields.ts";
import { SOURCE_IDS } from "../src/types.ts";

function includesTemplatePlaceholder(template: string, key: string): boolean {
  return (
    template.includes(`{{${key}}}`) ||
    template.includes(`{{yaml.${key}}}`)
  );
}

test("checked-in templates stay in sync with runtime default contents", () => {
  for (const sourceId of SOURCE_IDS) {
    const templatePath =
      sourceId === "bilibili_show" ? "bilibili-show.md" : `${sourceId.replace(/_/g, "-")}.md`;
    const template = fs.readFileSync(path.join(process.cwd(), "templates", templatePath), "utf8");
    assert.equal(template, TEMPLATE_CONTENTS[sourceId]);
  }

  assert.equal(
    fs.readFileSync(path.join(process.cwd(), "templates", "bangumi-game.md"), "utf8"),
    BANGUMI_TYPE_TEMPLATE_CONTENTS.game
  );
  assert.equal(
    fs.readFileSync(path.join(process.cwd(), "templates", "bangumi-anime.md"), "utf8"),
    BANGUMI_TYPE_TEMPLATE_CONTENTS.anime
  );
  assert.equal(
    fs.readFileSync(path.join(process.cwd(), "templates", "bangumi-book.md"), "utf8"),
    BANGUMI_TYPE_TEMPLATE_CONTENTS.book
  );
  assert.equal(
    fs.readFileSync(path.join(process.cwd(), "templates", "bangumi-live-action.md"), "utf8"),
    BANGUMI_TYPE_TEMPLATE_CONTENTS.liveAction
  );
});

test("default templates expose every supported variable from the registry", () => {
  for (const sourceId of SOURCE_IDS) {
    const template = TEMPLATE_CONTENTS[sourceId];
    for (const variable of getSourceTemplateVariables(sourceId)) {
      assert.equal(
        includesTemplatePlaceholder(template, variable.key),
        true,
        `${sourceId} template is missing ${variable.key}`
      );
    }
  }
});

test("README template variable list stays in sync with the registry", () => {
  const readme = fs.readFileSync(path.join(process.cwd(), "README.md"), "utf8");

  for (const sourceId of SOURCE_IDS) {
    for (const variable of getSourceTemplateVariables(sourceId)) {
      assert.equal(
        readme.includes(`\`{{${variable.key}}}\``) || readme.includes(`\`{{yaml.${variable.key}}}\``),
        true,
        `README is missing ${variable.key}`
      );
    }
  }
});
