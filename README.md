<div align="center">

# RYEN IN AI

**Between imagination and implementation.**

一个关于梦境、远方与 AI 产品实践的个人站点。

[进入站点](https://zryshuaige.github.io/RyPage/) · [作品](https://zryshuaige.github.io/RyPage/works/) · [导航索引](https://zryshuaige.github.io/RyPage/navigator/)

![Next.js](https://img.shields.io/badge/Next.js-16-111827?style=flat-square)
![React](https://img.shields.io/badge/React-19-111827?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-6-111827?style=flat-square)
[![Deploy](https://github.com/zryshuaige/RyPage/actions/workflows/deploy.yaml/badge.svg)](https://github.com/zryshuaige/RyPage/actions/workflows/deploy.yaml)

</div>

---

## Reverie → Yonder

两种心境，一段连续的光影。

- **Reverie** — 雾绿、暖金与德彪西《Rêverie》。Soft light. Open thoughts. A daydream in motion.
- **Yonder** — 深靛、浅蓝与贝多芬《Moonlight Sonata》。After dark, the distant feels a little closer.

日月同轨的主题开关、指针响应的流线场、同步换曲的播放器，以及藏在首页的一言。首次访问不自动发声；主题会保存在本地。

## Three pages

| Route | Experience |
| --- | --- |
| `/` | 纯视觉入口：主题、音乐、一言与 IP 城市天气 |
| `/navigator/` | 六个搜索引擎与四组网址索引；`/`、`⌘/Ctrl K` 快速聚焦 |
| `/works/` | RyHarness、ReAGround、RyBox、RyAgent As A Service |

## Run locally

```bash
npm ci
npm run dev
```

```bash
npm run lint
npm run build
```

Next.js 16 · React 19 · TypeScript · Canvas 2D · 静态导出至 `out/`。

## GitHub Pages

1. 推送至 GitHub 的 `main` 分支。
2. 打开 **Settings → Pages**，将 **Source** 设为 **GitHub Actions**。
3. `Deploy to GitHub Pages` 工作流会自动检查、构建并发布。

工作流会根据仓库名设置 `/repository-name` 子路径，站内链接与本地音乐均可用于项目页。若迁移到 `username.github.io` 根站点，请移除工作流中的 `NEXT_PUBLIC_BASE_PATH`。

## Audio

Rêverie 音频来自 [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Reverie.ogg)，与 Moonlight Sonata 公共领域录音一样随站点本地提供，并预加载当前曲目。
