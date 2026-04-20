English | [简体中文](README.zh-CN.md)

# MZ Media Fetcher

Create media and event notes from Bangumi, MobyGames, Bilibili Show, and Showstart.

`MZ Media Fetcher` is a desktop-only Obsidian plugin that fetches public metadata from supported sources and creates template-driven notes inside your vault.

## Highlights

- Bangumi supports title search, subject links, numeric IDs, and per-type template overrides for game, anime, book, and live action subjects.
- MobyGames supports direct game detail links.
- Bilibili Show supports direct event detail links and venue metadata.
- Showstart supports direct event detail links and venue metadata.
- Each source keeps its own parser and adapter, while note creation follows one shared pipeline.
- The settings tab is split by source, and only Bangumi exposes search-limit controls.
- Built-in templates ship with the plugin, and you can copy them into your own template files.
- Poster filenames and note filenames normalize whitespace into hyphenated names.

## Commands

The plugin currently registers these Obsidian commands. The command names below are the actual in-app labels:

- `从 Bangumi 新建作品卡片`: create a new media note from Bangumi.
- `重新补全当前笔记的 Bangumi 信息`: refresh the current Bangumi note's frontmatter.
- `从 MobyGames 新建作品卡片`: create a new media note from MobyGames.
- `从 bilibili会员购新建作品卡片`: create a new event note from Bilibili Show.
- `从秀动新建作品卡片`: create a new event note from Showstart.

## Install

### Community release assets

1. Download `main.js`, `manifest.json`, `styles.css`, and `versions.json` from the latest GitHub release.
2. Put them in `YOUR_VAULT/.obsidian/plugins/mz-media-fetcher`.
3. Enable `MZ Media Fetcher` in `Settings -> Community plugins`.

### From source

```bash
npm install
npm run build
npm test
npm run install:dev
npm run package
```

The repository root is the plugin root, so the build output lands directly in `main.js`.
`npm run install:dev` installs the plugin into `~/Obsidian/PluginLab` by default and enables it in that vault's `community-plugins.json`.
`npm run package` prepares the publishable release assets in `release/<version>/`.

## Defaults

- The plugin stores its runtime config in `media-fetcher-rules.json` under the plugin folder.
- Built-in templates live under `.obsidian/plugins/mz-media-fetcher/templates/`.
- The default local poster folder follows `attachmentFolderPath` from `.obsidian/app.json`.
- Existing custom `templatePath` values are preserved during upgrades.
- If the vault still has the old plugin id directory `MZ-media-fetcher`, the plugin imports its existing config on first launch and rewrites only the old built-in template paths.

## Usage

### Bangumi

- Search by title.
- Paste a subject URL such as `https://bgm.tv/subject/328609`.
- Enter a numeric subject ID such as `328609`.
- Game / anime / book / live action subjects can point to separate template paths; blank overrides fall back to the general Bangumi template.
- Bangumi cards can refresh the current note's frontmatter from the latest subject metadata without rewriting the body.

### MobyGames

- Paste a concrete game URL such as `https://www.mobygames.com/game/217980/balatro/`.
- Search pages and list pages are not supported.

### Bilibili Show

- Paste a concrete event URL such as `https://show.bilibili.com/platform/detail.html?id=107593`.
- Release dates are normalized to `YYYY-MM-DD`.
- Venue metadata is exposed as `venue_name`, `venue_address`, and `venue_text`.

### Showstart

- Paste a concrete event URL such as `https://wap.showstart.com/pages/activity/detail/detail?activityId=208747`.
- Release dates are normalized to `YYYY-MM-DD`.
- Venue metadata is exposed as `venue_name`, `venue_address`, and `venue_text`.

## Templates

Built-in templates now include a preview section that renders every currently supported variable. Common variables include:

- `{{title}}`
- `{{title_original}}`
- `{{aliases}}`
- `{{media_type}}`
- `{{release_date}}`
- `{{release_year}}`
- `{{cover_remote}}`
- `{{platforms}}`
- `{{poster_path}}`
- `{{poster}}`
- `{{network_poster}}`
- `{{categories}}`
- `{{source}}`
- `{{rating}}`
- `{{status}}`
- `{{finished_at}}`
- `{{rewatch_count}}`
- `{{summary}}`
- `{{platforms_text}}`
- `{{cover_markdown}}`
- `{{yaml.title}}`
- `{{yaml.aliases}}`
- `{{yaml.media_type}}`
- `{{yaml.release_date}}`
- `{{yaml.network_poster}}`
- `{{bangumi_id}}`
- `{{bangumi_url}}`
- `{{authors}}`
- `{{publishers}}`
- `{{serial_magazines}}`
- `{{mobygames_id}}`
- `{{venue_name}}`
- `{{venue_address}}`
- `{{venue_text}}`
- `{{mobygames_url}}`
- `{{bilibili_show_id}}`
- `{{bilibili_show_url}}`
- `{{showstart_activity_id}}`
- `{{showstart_url}}`

## Network & Privacy

- Bangumi requests use the public Bangumi API.
- MobyGames requests fetch the public game detail page HTML.
- Bilibili Show requests use the public project detail API behind the event page.
- Showstart requests first fetch an anonymous guest token, then request the event detail API used by the public page.
- The plugin does not send telemetry.
- The plugin only writes files inside the current vault.
- The plugin does not read files outside the current vault.

## Development

- `src/core/`: shared note building, file handling, path normalization, and template rendering
- `src/config/`: defaults, config migration, and config storage
- `src/sources/`: Bangumi, MobyGames, Bilibili Show, and Showstart adapters
- `src/ui/`: modals, settings tab, and path suggestions
- `templates/`: bundled default templates
- `tests/`: parser, template, config, and migration tests
