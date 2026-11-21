import type { BrandIconId } from "@/components/brand-icon";

export type SearchEngine = { id: string; name: string; baseUrl: string; placeholder: string; icon: BrandIconId };
export type NavLink = { name: string; url: string; description: string; tag: string; icon: BrandIconId };
export type NavSection = { id: string; title: string; english: string; description: string; links: NavLink[] };

export const searchEngines: SearchEngine[] = [
  { id: "baidu", name: "Baidu", baseUrl: "https://www.baidu.com/s?wd=", placeholder: "搜索中文内容", icon: "baidu" },
  { id: "bing", name: "Bing", baseUrl: "https://cn.bing.com/search?q=", placeholder: "搜索全网信息", icon: "bing" },
  { id: "google", name: "Google", baseUrl: "https://www.google.com/search?q=", placeholder: "Search the web", icon: "google" },
  { id: "github", name: "GitHub", baseUrl: "https://github.com/search?q=", placeholder: "搜索仓库、代码与 Issues", icon: "github" },
  { id: "zhihu", name: "知乎", baseUrl: "https://www.zhihu.com/search?type=content&q=", placeholder: "搜索问答与观点", icon: "zhihu" },
  { id: "bilibili", name: "Bilibili", baseUrl: "https://search.bilibili.com/all?keyword=", placeholder: "搜索视频与课程", icon: "bilibili" },
];

export const navSections: NavSection[] = [
  {
    id: "daily", title: "常用站点", english: "Daily", description: "高频打开的个人与工作入口",
    links: [
      { name: "GitHub", url: "https://github.com", description: "代码托管与协作平台", tag: "Code", icon: "github" },
      { name: "Bilibili", url: "https://www.bilibili.com", description: "技术视频与社区内容", tag: "Video", icon: "bilibili" },
      { name: "Notion", url: "https://www.notion.so", description: "个人知识管理与任务整理", tag: "Notes", icon: "notion" },
      { name: "掘金", url: "https://juejin.cn", description: "开发文章与实战经验", tag: "Community", icon: "juejin" },
    ],
  },
  {
    id: "ai", title: "AI 效率", english: "Intelligence", description: "日常提效的 AI 与自动化平台",
    links: [
      { name: "ChatGPT", url: "https://chatgpt.com/", description: "通用助手与创作支持", tag: "LLM", icon: "chatgpt" },
      { name: "Claude", url: "https://claude.ai/", description: "文档分析与对话助手", tag: "Assistant", icon: "claude" },
      { name: "DeepSeek", url: "https://www.deepseek.com/", description: "国产深度推理大模型", tag: "LLM", icon: "deepseek" },
      { name: "Kimi", url: "https://www.kimi.com/", description: "长文本阅读与资料整理", tag: "LLM", icon: "kimi" },
      { name: "MiniMax", url: "https://www.minimaxi.com/", description: "大模型与多模态平台", tag: "LLM", icon: "minimax" },
      { name: "GitHub Copilot", url: "https://github.com/features/copilot", description: "代码补全与辅助开发", tag: "Code AI", icon: "copilot" },
    ],
  },
  {
    id: "developers", title: "开发社区", english: "Developers", description: "开发博客与技术问答",
    links: [
      { name: "CSDN", url: "https://www.csdn.net/", description: "中文开发者社区与博客", tag: "Blog", icon: "csdn" },
      { name: "Stack Overflow", url: "https://stackoverflow.com/", description: "全球开发者问答社区", tag: "Q&A", icon: "stackoverflow" },
    ],
  },
  {
    id: "cloud", title: "云平台", english: "Cloud", description: "云端计算与基础设施",
    links: [
      { name: "阿里云", url: "https://www.aliyun.com/", description: "云计算与云服务平台", tag: "Cloud", icon: "aliyun" },
      { name: "腾讯云", url: "https://cloud.tencent.com/", description: "云服务器与开发者服务", tag: "Cloud", icon: "tencent" },
      { name: "Microsoft Azure", url: "https://azure.microsoft.com/", description: "微软云计算与 AI 服务", tag: "Cloud", icon: "azure" },
    ],
  },
];
