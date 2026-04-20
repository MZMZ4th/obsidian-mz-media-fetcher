# MZ Media Fetcher

Create media and event notes from Bangumi, MobyGames, Bilibili Show, and Showstart.

`MZ Media Fetcher` is a desktop-only Obsidian plugin that fetches public metadata from supported sources and creates template-driven notes inside your vault.

`MZ Media Fetcher` 是一个仅支持桌面版 Obsidian 的插件。它会从支持的站点获取公开信息，并按模板在你的 vault 里新建作品或活动卡片。

## Highlights / 功能概览

- Bangumi supports title search, subject links, numeric IDs, and per-type template overrides for game, anime, book, and live action subjects.
- MobyGames supports direct game detail links.
- Bilibili Show supports direct event detail links and venue metadata.
- Showstart supports direct event detail links and venue metadata.
- Each source keeps its own parser and adapter, while note creation follows one shared pipeline.
- The settings tab is split by source, and only Bangumi exposes search-limit controls.
- Built-in templates ship with the plugin, and you can copy them into your own template files.
- Poster filenames and note filenames normalize whitespace into hyphenated names.

- Bangumi 支持标题搜索、条目链接、数字 ID，以及按游戏 / 动画 / 书籍 / 三次元切换模板。
- MobyGames 支持直接粘贴游戏详情页链接。
- bilibili 会员购支持直接粘贴活动详情页链接，并会带出演出场所信息。
- 秀动支持直接粘贴活动详情页链接，并会带出演出场所信息。
- 每个来源保留自己的解析模块，但卡片生成共用一条主链路。
- 设置页按来源拆分，只有 Bangumi 会显示搜索条目数设置。
- 插件自带默认模板，也可以一键复制后改成你自己的模板。
- 笔记文件名和海报文件名都会把空白统一收成短横线。

## Commands / 当前命令

- `从 Bangumi 新建作品卡片`
- `从 MobyGames 新建作品卡片`
- `从 bilibili会员购新建作品卡片`
- `从秀动新建作品卡片`

## Install / 安装

### Community release assets / 使用发布资产安装

1. Download `main.js`, `manifest.json`, `styles.css`, and `versions.json` from the latest GitHub release.
2. Put them in `YOUR_VAULT/.obsidian/plugins/mz-media-fetcher`.
3. Enable `MZ Media Fetcher` in `Settings -> Community plugins`.

1. 从最新 GitHub release 下载 `main.js`、`manifest.json`、`styles.css` 和 `versions.json`。
2. 把它们放进 `YOUR_VAULT/.obsidian/plugins/mz-media-fetcher`。
3. 在 `设置 -> 第三方插件` 里启用 `MZ Media Fetcher`。

### From source / 从源码运行

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

这个仓库根目录本身就是插件目录，所以构建产物会直接输出到 `main.js`。
`npm run install:dev` 默认会把插件安装到 `~/Obsidian/PluginLab`，并把它写进这个开发 vault 的 `community-plugins.json`。
`npm run package` 会把可发布资产整理到 `release/<version>/`。

## Defaults / 默认行为

- The plugin stores its runtime config in `media-fetcher-rules.json` under the plugin folder.
- Built-in templates live under `.obsidian/plugins/mz-media-fetcher/templates/`.
- The default local poster folder follows `attachmentFolderPath` from `.obsidian/app.json`.
- Existing custom `templatePath` values are preserved during upgrades.
- If the vault still has the old plugin id directory `MZ-media-fetcher`, the plugin imports its existing config on first launch and rewrites only the old built-in template paths.

- 插件会把运行配置保存在插件目录下的 `media-fetcher-rules.json`。
- 插件自带模板默认放在 `.obsidian/plugins/mz-media-fetcher/templates/`。
- 本地海报目录默认跟随 `.obsidian/app.json` 里的 `attachmentFolderPath`。
- 升级时，如果你已经有自定义 `templatePath`，插件会继续保留。
- 如果你的 vault 里还保留旧插件目录 `MZ-media-fetcher`，插件会在首次启动时导入旧配置，并且只改写旧的内置模板路径，不会动你自己的自定义模板路径。

## Usage / 使用方式

### Bangumi

- Search by title.
- Paste a subject URL such as `https://bgm.tv/subject/328609`.
- Enter a numeric subject ID such as `328609`.
- Game / anime / book / live action subjects can point to separate template paths; blank overrides fall back to the general Bangumi template.

- 支持直接搜作品名。
- 支持粘贴条目链接，例如 `https://bgm.tv/subject/328609`。
- 支持直接输入数字 ID，例如 `328609`。
- 游戏 / 动画 / 书籍 / 三次元条目可以分别配置模板路径；留空时会回退到通用 Bangumi 模板。

### MobyGames

- Paste a concrete game URL such as `https://www.mobygames.com/game/217980/balatro/`.
- Search pages and list pages are not supported.

- 直接粘贴具体游戏详情页链接，例如 `https://www.mobygames.com/game/217980/balatro/`。
- 不支持搜索页、列表页或站内标题搜索。

### Bilibili Show

- Paste a concrete event URL such as `https://show.bilibili.com/platform/detail.html?id=107593`.
- Release dates are normalized to `YYYY-MM-DD`.
- Venue metadata is exposed as `venue_name`, `venue_address`, and `venue_text`.

- 直接粘贴活动详情页链接，例如 `https://show.bilibili.com/platform/detail.html?id=107593`。
- 发布日期会统一写成 `YYYY-MM-DD`。
- 会额外提供 `venue_name`、`venue_address`、`venue_text` 这 3 个演出场所变量。

### Showstart

- Paste a concrete event URL such as `https://wap.showstart.com/pages/activity/detail/detail?activityId=208747`.
- Release dates are normalized to `YYYY-MM-DD`.
- Venue metadata is exposed as `venue_name`, `venue_address`, and `venue_text`.

- 直接粘贴活动详情页链接，例如 `https://wap.showstart.com/pages/activity/detail/detail?activityId=208747`。
- 发布日期会统一写成 `YYYY-MM-DD`。
- 会额外提供 `venue_name`、`venue_address`、`venue_text` 这 3 个演出场所变量。

## Templates / 模板

Common variables include:

- `{{title}}`
- `{{title_original}}`
- `{{release_year}}`
- `{{poster_path}}`
- `{{poster}}`
- `{{summary}}`
- `{{platforms_text}}`
- `{{cover_markdown}}`
- `{{yaml.title}}`
- `{{yaml.aliases}}`
- `{{yaml.media_type}}`
- `{{yaml.release_date}}`
- `{{yaml.network_poster}}`
- `{{bangumi_url}}`
- `{{venue_name}}`
- `{{venue_address}}`
- `{{venue_text}}`
- `{{mobygames_url}}`
- `{{bilibili_show_url}}`
- `{{showstart_url}}`

常用模板变量包括：

- `{{title}}`
- `{{title_original}}`
- `{{release_year}}`
- `{{poster_path}}`
- `{{poster}}`
- `{{summary}}`
- `{{platforms_text}}`
- `{{cover_markdown}}`
- `{{yaml.title}}`
- `{{yaml.aliases}}`
- `{{yaml.media_type}}`
- `{{yaml.release_date}}`
- `{{yaml.network_poster}}`
- `{{bangumi_url}}`
- `{{venue_name}}`
- `{{venue_address}}`
- `{{venue_text}}`
- `{{mobygames_url}}`
- `{{bilibili_show_url}}`
- `{{showstart_url}}`

## Network & Privacy / 网络与隐私

- Bangumi requests use the public Bangumi API.
- MobyGames requests fetch the public game detail page HTML.
- Bilibili Show requests use the public project detail API behind the event page.
- Showstart requests first fetch an anonymous guest token, then request the event detail API used by the public page.
- The plugin does not send telemetry.
- The plugin only writes files inside the current vault.
- The plugin does not read files outside the current vault.

- Bangumi 走公开 Bangumi API。
- MobyGames 读取公开游戏详情页 HTML。
- bilibili 会员购走活动详情页背后的公开项目详情接口。
- 秀动会先获取匿名访客 token，再请求公开页面实际使用的活动详情接口。
- 插件不会发送遥测。
- 插件只会在当前 vault 内写文件。
- 插件不会读取当前 vault 之外的文件。

## Development / 开发结构

- `src/core/`: shared note building, file handling, path normalization, and template rendering
- `src/config/`: defaults, config migration, and config storage
- `src/sources/`: Bangumi, MobyGames, Bilibili Show, and Showstart adapters
- `src/ui/`: modals, settings tab, and path suggestions
- `templates/`: bundled default templates
- `tests/`: parser, template, config, and migration tests

- `src/core/`：通用卡片生成、文件处理、路径归一化和模板渲染
- `src/config/`：默认配置、配置迁移和配置读写
- `src/sources/`：Bangumi、MobyGames、bilibili 会员购、秀动的来源适配器
- `src/ui/`：弹窗、设置页和路径补全
- `templates/`：插件内置默认模板
- `tests/`：解析、模板、配置和迁移测试
