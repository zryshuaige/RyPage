"use client";

import { useEffect, useRef, useState } from "react";
import type { SearchEngine } from "@/data/navigation";
import { BrandIcon } from "./brand-icon";

export function EnginePicker({ engines, value, onChange }: { engines: SearchEngine[]; value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const currentIndex = Math.max(0, engines.findIndex((engine) => engine.id === value));
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = engines[currentIndex];

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", closeOutside);
    return () => window.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  const show = (index = currentIndex) => {
    setActiveIndex(index);
    setOpen(true);
    requestAnimationFrame(() => optionRefs.current[index]?.focus());
  };
  const close = () => { setOpen(false); triggerRef.current?.focus(); };
  const select = (index: number) => { onChange(engines[index].id); close(); };
  const move = (event: React.KeyboardEvent, index: number) => {
    if (event.key === "Escape") { event.preventDefault(); close(); return; }
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(index); return; }
    let next = index;
    if (event.key === "ArrowDown") next = (index + 1) % engines.length;
    else if (event.key === "ArrowUp") next = (index - 1 + engines.length) % engines.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = engines.length - 1;
    else if (event.key === "Tab") { setOpen(false); return; }
    else return;
    event.preventDefault();
    setActiveIndex(next);
    optionRefs.current[next]?.focus();
  };

  return (
    <div className="engine-picker" ref={containerRef}>
      <button ref={triggerRef} type="button" className="engine-trigger" aria-haspopup="listbox" aria-expanded={open} aria-controls="engine-options" onClick={() => open ? setOpen(false) : show()} onKeyDown={(event) => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); show(currentIndex); } }}>
        <BrandIcon id={current.icon} size={18} /><span>{current.name}</span><span className="engine-caret" aria-hidden="true">⌄</span>
      </button>
      {open && <div id="engine-options" className="engine-options" role="listbox" aria-label="选择搜索引擎" tabIndex={-1}>
        {engines.map((engine, index) => <button key={engine.id} ref={(node) => { optionRefs.current[index] = node; }} type="button" role="option" aria-selected={index === currentIndex} tabIndex={index === activeIndex ? 0 : -1} className={index === currentIndex ? "is-selected" : ""} onClick={() => select(index)} onKeyDown={(event) => move(event, index)}>
          <BrandIcon id={engine.icon} size={18} /><span>{engine.name}</span>{index === currentIndex && <i aria-hidden="true">✓</i>}
        </button>)}
      </div>}
    </div>
  );
}
