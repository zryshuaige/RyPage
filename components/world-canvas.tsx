"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { Space, Theme } from "./site-shell";
import type { AudioEnergy } from "./use-audio-energy";
import type { ProductId } from "./product-accent";
import type { WorldRenderer } from "./world/renderer";

const productIds: ProductId[] = ["ryharness", "reaground", "rybox", "ryagent"];
const nextSpaces: Record<Space, Space> = { earth: "moon", moon: "galaxy", galaxy: "earth" };

function schedulePreparation(space: Space, prepare: (space: Space) => void) {
  let idleId: number | null = null;
  let fallbackId: number | null = null;
  const run = () => prepare(nextSpaces[space]);
  if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(run, { timeout: 3000 });
  else fallbackId = window.setTimeout(run, 1500);
  return () => {
    if (idleId !== null) window.cancelIdleCallback(idleId);
    if (fallbackId !== null) window.clearTimeout(fallbackId);
  };
}

export function WorldCanvas({ space, theme, energy }: { space: Space; theme: Theme; energy: RefObject<AudioEnergy> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WorldRenderer | null>(null);
  const latest = useRef({ space, theme, energy });
  const [activeProduct, setActiveProduct] = useState<ProductId | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => { latest.current = { space, theme, energy }; }, [space, theme, energy]);

  useEffect(() => {
    let cancelled = false;
    let cancelPreload: (() => void) | null = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    import("./world/renderer").then(({ createWorldRenderer }) => {
      if (cancelled) return;
      const current = latest.current;
      rendererRef.current = createWorldRenderer(canvas, current.space, current.theme, current.energy);
      cancelPreload = schedulePreparation(current.space, (space) => rendererRef.current?.prepareSpace(space));
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => {
      cancelled = true;
      cancelPreload?.();
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => schedulePreparation(space, (next) => rendererRef.current?.prepareSpace(next)), [space]);

  useEffect(() => { rendererRef.current?.transitionTo(space); }, [space]);
  useEffect(() => { rendererRef.current?.setTheme(theme); }, [theme]);

  useEffect(() => {
    if (space !== "galaxy") return;
    const visible = new Set<ProductId>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id as ProductId;
        if (entry.isIntersecting) visible.add(id);
        else visible.delete(id);
      });
      const active = productIds.find((id) => visible.has(id)) ?? null;
      setActiveProduct(active);
      rendererRef.current?.setProductMode(active !== null);
    }, { rootMargin: "-18% 0px -46% 0px", threshold: 0 });
    productIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, [space]);

  return <div className={`world-backdrop is-${space}${activeProduct && space === "galaxy" ? " has-product" : ""}${failed ? " is-fallback" : ""}`} aria-hidden="true">
    <div className="world-fallback" />
    <canvas ref={canvasRef} className="world-canvas" />
    <div className="world-reading-light" />
    <div className="world-grain" />
  </div>;
}
