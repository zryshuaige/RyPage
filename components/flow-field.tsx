"use client";

import { useEffect, useRef } from "react";
import type { Theme } from "./site-shell";

export function FlowField({ theme }: { theme: Theme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true, desynchronized: true });
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dark = theme === "yonder";
    let width = window.innerWidth;
    let height = window.innerHeight;
    let frameId = 0;
    let running = false;
    let lastFrame = 0;
    let xs = new Float32Array(0);
    let baseYs = new Float32Array(0);
    const pointer = { x: width * 0.7, y: height * 0.4 };
    const target = { ...pointer };
    const strokeStyles = [dark ? "rgba(135, 205, 218, 0.085)" : "rgba(31, 91, 75, 0.08)", dark ? "rgba(135, 205, 218, 0.2)" : "rgba(31, 91, 75, 0.19)"];

    const draw = (time: number, delta: number) => {
      context.clearRect(0, 0, width, height);
      const damping = 1 - Math.exp(-delta * 0.012);
      pointer.x += (target.x - pointer.x) * damping;
      pointer.y += (target.y - pointer.y) * damping;
      const influenceCutoff = 180000;

      for (let line = 0; line < baseYs.length; line += 1) {
        const baseY = baseYs[line];
        const dy = baseY - pointer.y;
        context.beginPath();
        for (let step = 0; step < xs.length; step += 1) {
          const x = xs[step];
          const wave = Math.sin(x * 0.003 + time * 0.00016 + line * 0.34) * 25
            + Math.cos(x * 0.0014 - time * 0.00011 + line * 0.21) * 17;
          const dx = x - pointer.x;
          const distance = dx * dx + dy * dy;
          let bend = 0;
          if (!reducedMotion && distance < influenceCutoff) {
            const influence = Math.exp(-distance / 52000);
            bend = dy * influence * 0.32 + Math.sin(dx * 0.018) * influence * 15;
          }
          const y = baseY + wave + bend;
          if (step === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        const emphasized = line % 5 === 0;
        context.strokeStyle = strokeStyles[Number(emphasized)];
        context.lineWidth = emphasized ? 1.15 : 0.7;
        context.stroke();
      }
    };

    const frame = (time: number) => {
      if (!running) return;
      if (time - lastFrame >= 15) {
        const delta = lastFrame ? Math.min(time - lastFrame, 40) : 16.67;
        draw(time, delta);
        lastFrame = time;
      }
      frameId = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running || reducedMotion || document.hidden) return;
      running = true;
      lastFrame = 0;
      frameId = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frameId);
    };
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const lines = width < 640 ? 18 : 28;
      const steps = width < 640 ? 32 : 48;
      xs = Float32Array.from({ length: steps + 1 }, (_, step) => (step / steps) * width);
      baseYs = Float32Array.from({ length: lines }, (_, line) => (line / (lines - 1)) * height);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.lineCap = "round";
      draw(0, 16.67);
      lastFrame = 0;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      target.x = event.clientX;
      target.y = event.clientY;
    };
    const onVisibility = () => document.hidden ? stop() : start();

    resize();
    start();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="flow-field" aria-hidden="true" />;
}
