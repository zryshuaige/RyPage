export type SearchEngine = { id: string; name: string; baseUrl: string; placeholder: string };
export type NavLink = { name: string; url: string; description: string; tag: string; iconHost?: string };
export type NavSection = { id: string; title: string; english: string; description: string; links: NavLink[] };

export const searchEngines: SearchEngine[] = [
  { id: "baidu", name: "Baidu", baseUrl: "https://www.baidu.com/s?wd=", placeholder: "搜索中文内容" },
  { id: "bing", name: "Bing", baseUrl: "https://cn.bing.com/search?q=", placeholder: "搜索全网信息" },
  { id: "google", name: "Google", baseUrl: "https://www.google.com/search?q=", placeholder: "Search the web" },
  { id: "github", name: "GitHub", baseUrl: "https://github.com/search?q=", placeholder: "搜索仓库、代码与 Issues" },
  { id: "zhihu", name: "知乎", baseUrl: "https://www.zhihu.com/search?type=content&q=", placeholder: "搜索问答与观点" },
  { id: "bilibili", name: "Bilibili", baseUrl: "https://search.bilibili.com/all?keyword=", placeholder: "搜索视频与课程" },
];

export const navSections: NavSection[] = [
  {
    id: "daily", title: "常用站点", english: "Daily", description: "高频打开的个人与工作入口",
    links: [
      { name: "GitHub", url: "https://github.com", description: "代码托管与协作平台", tag: "Code" },
      { name: "Bilibili", url: "https://www.bilibili.com", description: "技术视频与社区内容", tag: "Video" },
      { name: "Notion", url: "https://www.notion.so", description: "个人知识管理与任务整理", tag: "Notes" },
      { name: "掘金", url: "https://juejin.cn", description: "开发文章与实战经验", tag: "Community" },
    ],
  },
  {
    id: "ai", title: "AI 效率", english: "Intelligence", description: "日常提效的 AI 与自动化平台",
    links: [
      { name: "ChatGPT", url: "https://chatgpt.com/", description: "通用助手与创作支持", tag: "LLM" },
      { name: "Claude", url: "https://claude.ai/", description: "文档分析与对话助手", tag: "Assistant" },
      { name: "DeepSeek", url: "https://www.deepseek.com/", description: "国产深度推理大模型", tag: "LLM", iconHost: "deepseek.com" },
      { name: "Kimi", url: "https://www.kimi.com/", description: "长文本阅读与资料整理", tag: "LLM" },
      { name: "MiniMax", url: "https://www.minimaxi.com/", description: "大模型与多模态平台", tag: "LLM" },
      { name: "GitHub Copilot", url: "https://github.com/features/copilot", description: "代码补全与辅助开发", tag: "Code AI" },
    ],
  },
  {
    id: "design", title: "设计灵感", english: "Design", description: "页面视觉、配色和素材灵感来源",
    links: [
      { name: "Dribbble", url: "https://dribbble.com/", description: "高质量 UI 设计灵感", tag: "Inspire" },
      { name: "Behance", url: "https://www.behance.net/", description: "完整设计项目展示", tag: "Portfolio" },
      { name: "Color Hunt", url: "https://colorhunt.co/", description: "精致配色方案", tag: "Color" },
      { name: "Unsplash", url: "https://unsplash.com/", description: "免费高清图片资源", tag: "Photo" },
      { name: "Iconfont", url: "https://www.iconfont.cn/", description: "矢量图标管理", tag: "Icon" },
      { name: "Figma", url: "https://www.figma.com/", description: "协作式界面设计", tag: "Design" },
    ],
  },
  {
    id: "learn", title: "学习社区", english: "Learning", description: "技术文档、博客与问答社区",
    links: [
      { name: "Vue 文档", url: "https://cn.vuejs.org/", description: "Vue 3 官方中文文档", tag: "Docs" },
      { name: "TypeScript", url: "https://www.typescriptlang.org/", description: "TypeScript 官方手册", tag: "Docs" },
      { name: "CSDN", url: "https://www.csdn.net/", description: "中文开发者社区与博客", tag: "Blog" },
      { name: "博客园", url: "https://www.cnblogs.com/", description: "老牌中文技术博客社区", tag: "Blog" },
      { name: "SegmentFault", url: "https://segmentfault.com/", description: "技术问答与讨论", tag: "Q&A" },
      { name: "Stack Overflow", url: "https://stackoverflow.com/", description: "全球开发者问答社区", tag: "Q&A" },
    ],
  },
];
