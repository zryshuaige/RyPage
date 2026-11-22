import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";
import "./site.css";
import "./world.css";
import "./ry-page.css";

const manrope = localFont({
  src: "./fonts/manrope-variable.ttf",
  variable: "--font-manrope",
  weight: "200 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ryen in AI",
  description: "Ryen 的 AI 应用与产品实践。",
  applicationName: "RyPage",
  openGraph: {
    title: "Ryen in AI",
    description: "Ryen 的 AI 应用与产品实践。",
    type: "website",
    locale: "zh_CN",
  },
};

export const viewport: Viewport = {
  themeColor: "#add4e8",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={manrope.variable}>
      <body><SiteShell>{children}</SiteShell></body>
    </html>
  );
}
