"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";

export type EvidenceItem = { title: string; text: string };

export function EvidenceDisclosure({ label = "Explore the mechanisms", items, concept = false }: { label?: string; items: EvidenceItem[]; concept?: boolean }) {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const id = useId();
  return (
    <div className="evidence-disclosure">
      <button type="button" className="evidence-toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen((value) => !value)}>
        <span>{open ? "Close notes" : label}</span><i aria-hidden="true">{open ? "−" : "+"}</i>
      </button>
      <AnimatePresence initial={false}>
        {open && <motion.div id={id} className="evidence-panel" initial={reducedMotion ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reducedMotion ? { display: "none" } : { height: 0, opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.24, ease: [0.23, 1, 0.32, 1] }}>
          <div className="evidence-grid">
            {items.map((item, index) => <article key={item.title}><span>{concept ? "PRINCIPLE" : "MECHANISM"} / 0{index + 1}</span><h4>{item.title}</h4><p>{item.text}</p></article>)}
          </div>
          {concept && <p className="concept-note">Concept exploration — not a claim of shipped functionality.</p>}
        </motion.div>}
      </AnimatePresence>
    </div>
  );
}
