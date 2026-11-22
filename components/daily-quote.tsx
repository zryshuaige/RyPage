"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Quote = { text: string; source: string };
const fallback = { text: "Not all those who wander are lost.", source: "J. R. R. Tolkien" };
const localQuotes: Quote[] = [
  fallback,
  { text: "花自飘零水自流。一种相思，两处闲愁。", source: "一剪梅 · 李清照" },
  { text: "憧憬是距离理解最遥远的感情。", source: "BLEACH" },
  { text: "我的爱如台风过境，处在台风眼中的你一无所知。", source: "台风眼 · 潭石" },
  { text: "循此苦旅，终抵繁星。", source: "拉丁古谚" },
];

function nextLocalQuote(current: Quote) {
  const index = localQuotes.findIndex((item) => item.text === current.text);
  return localQuotes[(index + 1) % localQuotes.length];
}

export function DailyQuote() {
  const [quote, setQuote] = useState<Quote>(fallback);
  const [loading, setLoading] = useState(true);
  const controllerRef = useRef<AbortController | null>(null);

  const loadQuote = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    let timedOut = false;
    const timeout = window.setTimeout(() => { timedOut = true; controller.abort(); }, 4500);
    try {
      const response = await fetch(`https://v1.hitokoto.cn/?encode=json&_=${Date.now()}`, { signal: controller.signal, cache: "no-store" });
      if (!response.ok) throw new Error("Quote request failed");
      const data = await response.json() as { hitokoto?: string; from?: string; from_who?: string | null };
      if (!data.hitokoto) throw new Error("Quote is empty");
      const next = { text: data.hitokoto, source: [data.from, data.from_who].filter(Boolean).join(" · ") || "一言" };
      setQuote((current) => current.text === next.text ? nextLocalQuote(current) : next);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError" && !timedOut) return;
      setQuote((current) => nextLocalQuote(current));
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
      <figcaption><span>A line for today</span><button type="button" onClick={() => void loadQuote()} disabled={loading} aria-label="换一句一言">{loading ? "寻找一句…" : "换一句"} <span aria-hidden="true">↻</span></button></figcaption>
      <blockquote>{quote.text}</blockquote>
      <p>— {quote.source}</p>
    </figure>
  );
}
