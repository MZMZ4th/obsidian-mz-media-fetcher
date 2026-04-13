# MZ Media Fetcher

`MZ Media Fetcher` 是一个桌面版 Obsidian 插件，用来从外部作品站点抓数据，并按模板新建作品卡片。

当前支持：

- Bangumi：支持标题搜索、直接贴条目链接、直接输入条目 ID
- MobyGames：支持直接贴具体游戏页面链接

## 功能概览

- 保留站点专属 adapter：每个站点的数据获取、解析和归一化都放在自己的模块里
- 使用统一的卡片生成流程：输入、搜索候选、模板渲染、重名处理、写入笔记都走同一条主链路
- 默认模板随插件一起分发：开箱即用，不再依赖某个私有 vault 里的模板路径
- 设置页可改：目标目录、模板路径、搜索数量、文件名模板、重名模板

## 当前命令

- `从 Bangumi 新建作品卡片`
- `从 MobyGames 新建作品卡片`

## 安装方式

### 直接放进现有 vault

1. 把这个仓库放到你的 vault 目录下：
   `YOUR_VAULT/.obsidian/plugins/MZ-media-fetcher`
2. 在这个目录执行：

```bash
npm install
npm run build
```

3. 打开 Obsidian 的 `设置 -> 第三方插件`，启用 `MZ Media Fetcher`

### 从当前仓库开发

仓库根目录本身就是插件目录，构建产物会直接输出到根目录的 `main.js`。

```bash
npm install
npm run build
npm test
```

## 默认配置

插件会在自己的目录下维护配置文件：

- `media-fetcher-rules.json`

默认模板会放在：

- `.obsidian/plugins/MZ-media-fetcher/templates/bangumi.md`
- `.obsidian/plugins/MZ-media-fetcher/templates/mobygames.md`

默认配置字段只有模板模式所需的最小集合：

- `targetFolder`
- `templatePath`
- `searchLimit`
- `filename.template`
- `filename.collisionTemplate`

如果你之前已经有自定义模板路径，插件会继续沿用，不会强行改掉你的现有设置。

## 使用方式

### Bangumi

支持三种输入：

- 直接输入作品名，插件会先搜索，再让你选条目
- 直接贴条目链接，例如 `https://bgm.tv/subject/328609`
- 直接输入数字 ID，例如 `328609`

### MobyGames

当前只支持直接贴具体游戏页面链接，例如：

- `https://www.mobygames.com/game/217980/balatro/`

不支持搜索页、列表页或站内标题搜索。

## 模板覆盖

默认模板只是起点。你可以在插件设置页里，把 `模板路径` 改到自己喜欢的位置。

推荐做法：

- 先复制插件自带模板到你自己的模板目录
- 再在设置页把 `templatePath` 指过去
- 后续只维护你自己的模板

模板变量沿用统一上下文，常用字段包括：

- `{{title}}`
- `{{title_original}}`
- `{{yaml.aliases}}`
- `{{yaml.media_type}}`
- `{{yaml.release_date}}`
- `{{poster}}`
- `{{summary}}`
- `{{platforms_text}}`
- `{{bangumi_url}}`
- `{{mobygames_url}}`
- `{{cover_markdown}}`

## 扩展新站点

当前代码结构已经按“通用流程 + source adapter”拆开。后续新增站点时，优先按下面的方式加：

1. 在 `src/sources/` 新增一个纯解析模块
2. 再新增一个 adapter 模块，负责请求和注册命令元信息
3. 在 `src/sources/index.ts` 注册
4. 复用现有的配置、设置页和卡片写入逻辑

这样新增站点时，不需要再复制整条命令链。

## 开发结构

- `src/core/`：模板渲染、文件写入、通用错误处理
- `src/config/`：默认配置、配置读写、旧配置迁移
- `src/sources/`：Bangumi / MobyGames 的解析和 adapter
- `src/ui/`：输入弹窗、候选弹窗、设置页、路径补全
- `templates/`：插件自带默认模板
- `tests/`：解析、模板和配置测试

## 兼容说明

- 旧的 `rules` 配置不会再进入主运行链路；插件会在读取时自动收敛成模板模式配置
- 已有自定义 `templatePath` 会保留
- 插件继续只支持桌面版 Obsidian
