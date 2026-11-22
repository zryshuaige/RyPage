export type BrandIconId = "baidu" | "bing" | "google" | "github" | "zhihu" | "bilibili" | "notion" | "juejin" | "chatgpt" | "claude" | "deepseek" | "kimi" | "minimax" | "copilot" | "csdn" | "stackoverflow" | "aliyun" | "tencent" | "azure";

const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function BrandIcon({ id, size = 22 }: { id: BrandIconId; size?: number }) {
  const extension = id === "bing" ? "png" : "svg";
  return <svg className="brand-icon" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false"><image href={`${publicBasePath}/brands/${id}.${extension}`} width="24" height="24" /></svg>;
}
