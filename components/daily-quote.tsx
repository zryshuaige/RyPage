"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Quote = { text: string; source: string };
const fallback = { text: "保持热爱，奔赴下一场山海。", source: "编辑部寄语" };

export function DailyQuote() {
  const [quote, setQuote] = useState<Quote>(fallback);
  const [loading, setLoading] = useState(true);
  const controllerRef = useRef<AbortController | null>(null);

  const loadQuote = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    const timeout = window.setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch("https://v1.hitokoto.cn/?encode=json", { signal: controller.signal });
      if (!response.ok) throw new Error("Quote request failed");
      const data = await response.json() as { hitokoto?: string; from?: string; from_who?: string | null };
      if (!data.hitokoto) throw new Error("Quote is empty");
      setQuote({ text: data.hitokoto, source: [data.from, data.from_who].filter(Boolean).join(" · ") || "一言" });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setQuote(fallback);
    } finally {
      window.clearTimeout(timeout);
      if (controllerRef.current === controller) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadQuote(), 0);
    return () => {
      window.clearTimeout(timeout);
      controllerRef.current?.abort();
    };
  }, [loadQuote]);

  return (
    <figure className="home-quote" aria-busy={loading}>
      <figcaption><span>A line for today</span><button type="button" onClick={() => void loadQuote()} disabled={loading} aria-label="换一句一言">换一句 <span aria-hidden="true">↻</span></button></figcaption>
      <blockquote>{quote.text}</blockquote>
      <p>— {quote.source}</p>
    </figure>
  );
}
