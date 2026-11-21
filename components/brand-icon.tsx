import type { ReactNode } from "react";

export type BrandIconId = "baidu" | "bing" | "google" | "github" | "zhihu" | "bilibili" | "notion" | "juejin" | "chatgpt" | "claude" | "deepseek" | "kimi" | "minimax" | "copilot" | "csdn" | "stackoverflow" | "aliyun" | "tencent" | "azure";

const colors: Record<BrandIconId, string> = {
  baidu: "#2563c7", bing: "#168c82", google: "#4285f4", github: "#24292f", zhihu: "#1772f6", bilibili: "#ef6a91",
  notion: "#24292f", juejin: "#1e80ff", chatgpt: "#16866f", claude: "#d97757", deepseek: "#4d6bfe", kimi: "#24292f",
  minimax: "#ef564d", copilot: "#24292f", csdn: "#e33e33", stackoverflow: "#f48024", aliyun: "#ff6a00", tencent: "#1677ff", azure: "#1689d4",
};

const text = (label: string, size = 15) => <text x="12" y="17" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={size} fontWeight="700" fill="currentColor">{label}</text>;
const github = <path fill="currentColor" d="M12 1a11 11 0 0 0-3.48 21.43c.55.1.75-.24.75-.53v-2.08c-3.06.66-3.7-1.3-3.7-1.3-.5-1.28-1.23-1.62-1.23-1.62-1-.68.08-.67.08-.67 1.1.08 1.7 1.14 1.7 1.14.98 1.7 2.59 1.2 3.22.92.1-.72.39-1.2.7-1.48-2.44-.28-5-1.22-5-5.43 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.91 0 0 .92-.3 3.02 1.13a10.5 10.5 0 0 1 5.5 0c2.1-1.43 3.02-1.13 3.02-1.13.6 1.51.22 2.63.11 2.91.7.77 1.13 1.75 1.13 2.95 0 4.22-2.57 5.15-5.02 5.42.4.35.75 1.03.75 2.07v3.06c0 .3.2.64.76.53A11 11 0 0 0 12 1Z" />;

const icons: Record<BrandIconId, ReactNode> = {
  baidu: <g fill="currentColor"><ellipse cx="12" cy="15.5" rx="5.2" ry="4.2" /><circle cx="6.4" cy="9" r="2" /><circle cx="10.3" cy="5.8" r="2" /><circle cx="15.1" cy="5.8" r="2" /><circle cx="18.7" cy="9" r="2" /></g>,
  bing: <image href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/brands/bing.png`} x="1" y="1" width="22" height="22" />,
  google: text("G", 19),
  github,
  zhihu: <><rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor" /><text x="12" y="17" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="700" fill="white">知</text></>,
  bilibili: <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="3" y="6" width="18" height="14" rx="4" /><path d="m7 3 3 3M17 3l-3 3M8 12v2M16 12v2" /></g>,
  notion: <><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />{text("N", 14)}</>,
  juejin: <path fill="currentColor" d="m12 3 9 5-9 13-9-13 9-5Zm0 4L7 9l5 7 5-7-5-2Z" />,
  chatgpt: <g fill="none" stroke="currentColor" strokeWidth="1.5"><ellipse cx="12" cy="12" rx="4" ry="8" /><ellipse cx="12" cy="12" rx="4" ry="8" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="4" ry="8" transform="rotate(120 12 12)" /></g>,
  claude: <path fill="currentColor" d="m12 2 1.7 6.3L19 4l-2.3 6.1L23 9l-5.1 3.9L23 17l-6.3-1.1L19 22l-5.3-4.3L12 24l-1.7-6.3L5 22l2.3-6.1L1 17l5.1-3.9L1 9l6.3 1.1L5 4l5.3 4.3L12 2Z" />,
  deepseek: <g fill="currentColor"><path d="M2.5 14c4-1 5-7 11-7 4.3 0 6.8 3 7.8 6.2-2.2-1.2-4.5-.2-5.5 1.8-2 4.1-8.1 4.1-11.2 1.1L2 18l1-3.8-.5-.2Z" /><circle cx="14.5" cy="10.5" r=".7" fill="white" /></g>,
  kimi: text("K", 18),
  minimax: <path fill="currentColor" d="M2 20V4h4l6 9 6-9h4v16h-4V10l-6 9-6-9v10H2Z" />,
  copilot: <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d="M4 8 8 4h8l4 4-2 9H6L4 8Z" /><path d="M7 10h3v4H7zM14 10h3v4h-3zM8 18v3M16 18v3" /></g>,
  csdn: <><path fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" d="M18 6a8 8 0 1 0 0 12" /><path stroke="currentColor" strokeWidth="2" d="M12 12h9" /></>,
  stackoverflow: <g fill="currentColor"><path d="M5 15v6h14v-6h-2v4H7v-4H5Z" /><path d="m8 16 8 .8-.2 2-8-.8.2-2Zm.8-4 7.5 2.5.6-1.9-7.5-2.5-.6 1.9Zm2.2-4.5 6.3 4.2 1.1-1.6-6.3-4.2-1.1 1.6ZM15.5 3l4.6 6.5 1.6-1.2-4.6-6.5-1.6 1.2Z" /></g>,
  aliyun: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 6H3v12h4M17 6h4v12h-4M8 15c1-5 7-5 8 0M9 12h6" /></g>,
  tencent: <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M7 18a5 5 0 1 1 1-9.8A6 6 0 0 1 19 10a4 4 0 0 1-1 8H7Z" /><path d="M9 21h8" /></g>,
  azure: <path fill="currentColor" d="M13 3 4 20h6l2-5 4 5h4L13 3Zm0 5 2 4h-4l2-4Z" />,
};

export function BrandIcon({ id, size = 22 }: { id: BrandIconId; size?: number }) {
  return <svg className="brand-icon" viewBox="0 0 24 24" width={size} height={size} style={{ color: colors[id] }} aria-hidden="true" focusable="false">{icons[id]}</svg>;
}
