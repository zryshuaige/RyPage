"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { EvidenceDisclosure } from "./evidence-disclosure";
import { ProductAccent } from "./product-accent";
import { StudyHeading } from "./study-heading";

const traitDefinitions = [
  { id: "outgoing", label: "外向", english: "OUTGOING", low: "先倾听", high: "主动搭话" },
  { id: "rigorous", label: "严谨", english: "RIGOROUS", low: "保留直觉", high: "反复校验" },
  { id: "humor", label: "幽默", english: "HUMOR", low: "平静表达", high: "带点俏皮" },
  { id: "proactive", label: "主动", english: "PROACTIVE", low: "等待指令", high: "推进下一步" },
] as const;
type Trait = (typeof traitDefinitions)[number]["id"];

const evidence = [
  { title: "A visible relay", text: "@ 指定助理，或让调度器选择合适的人。任务在不同人格之间转交时，接力链始终可见。" },
  { title: "Memory you can edit", text: "关键词与向量混合召回、事实抽取和经验手册都可读可改，真实反馈会回流到后续相处。" },
  { title: "Work that lands on disk", text: "RyVibe 把一句话变成文件、文档、表格或流程；验收、预览、迭代和快照回滚都属于交付。" },
];

const radii = [164, 134, 104, 74];

export function HarnessSection() {
  const [traits, setTraits] = useState<Record<Trait, number>>({ outgoing: 64, rigorous: 72, humor: 46, proactive: 68 });
  const [bond, setBond] = useState(56);
  const reducedMotion = useReducedMotion();
  const lead = [...traitDefinitions].sort((a, b) => traits[b.id] - traits[a.id])[0];
  const behavior = traits[lead.id] >= 50 ? lead.high : lead.low;

  return (
    <section id="ryharness" className="product-study harness-study" aria-labelledby="harness-title">
      <div className="product-scene-accent"><ProductAccent product="ryharness" /></div>
      <StudyHeading id="harness-title" eyebrow="Personality before infrastructure" name="RyHarness" title="不只回应你，也慢慢懂得如何与你相处。" description="人格不是一张角色皮肤。外向、严谨、幽默与主动进入真实行为，记忆和反馈则让每一次共同工作都改变下一次相遇。" status="开发者预览" href="https://github.com/zryshuaige/RyHarness" />
      <div className="personality-scene">
        <div className="personality-visual">
          <div className="scene-topline"><span>BEHAVIOR SIGNATURE</span><span>LIVE / 01</span></div>
          <svg viewBox="0 0 560 480" fill="none" aria-label="由外向、严谨、幽默、主动四项参数构成的人格签名" role="img">
            <defs>
              <radialGradient id="signature-core"><stop stopColor="#add4e8" stopOpacity=".2" /><stop offset="1" stopColor="#add4e8" stopOpacity=".025" /></radialGradient>
            </defs>
            <circle cx="280" cy="240" r="55" fill="url(#signature-core)" />
            {traitDefinitions.map((trait, index) => {
              const radius = radii[index];
              const circumference = 2 * Math.PI * radius;
              return <g key={trait.id}>
                <circle cx="280" cy="240" r={radius} className="signature-track" />
                <motion.circle cx="280" cy="240" r={radius} className={`signature-arc signature-arc-${index + 1}`} strokeDasharray={circumference} animate={{ strokeDashoffset: circumference * (1 - traits[trait.id] / 100) }} transition={{ duration: reducedMotion ? 0 : 0.45, ease: [0.23, 1, 0.32, 1] }} transform="rotate(-90 280 240)" />
              </g>;
            })}
            <text x="280" y="248" textAnchor="middle" className="signature-monogram">Ry</text>
            <text x="280" y="278" textAnchor="middle" className="signature-center-label">ONE OF ONE</text>
            <text x="36" y="63" className="signature-label">OUTGOING</text><text x="36" y="86" className="signature-value">{traits.outgoing}</text>
            <text x="524" y="63" textAnchor="end" className="signature-label">RIGOROUS</text><text x="524" y="86" textAnchor="end" className="signature-value">{traits.rigorous}</text>
            <text x="36" y="415" className="signature-label">HUMOR</text><text x="36" y="438" className="signature-value">{traits.humor}</text>
            <text x="524" y="415" textAnchor="end" className="signature-label">PROACTIVE</text><text x="524" y="438" textAnchor="end" className="signature-value">{traits.proactive}</text>
          </svg>
          <div className="signature-footer"><span>CHARACTER, NOT A COSTUME.</span><span>BOND / {String(bond).padStart(3, "0")}</span></div>
        </div>
        <div className="personality-controls">
          <div className="personality-live"><span>DOMINANT TRAIT / {lead.english}</span><p aria-live="polite">{behavior}，<br />但始终保留自己的节奏。</p></div>
          <div className="trait-list">
            {traitDefinitions.map((trait) => <label key={trait.id}>
              <span>{trait.label}<output>{String(traits[trait.id]).padStart(2, "0")}</output></span>
              <input type="range" min="0" max="100" value={traits[trait.id]} aria-label={`${trait.label}人格参数`} style={{ "--trait-value": `${traits[trait.id]}%` } as React.CSSProperties} onChange={(event) => setTraits((current) => ({ ...current, [trait.id]: Number(event.target.value) }))} />
              <small>{traits[trait.id] >= 50 ? trait.high : trait.low}</small>
            </label>)}
          </div>
          <div className="bond-controls"><span>真实反馈，让关系继续生长。</span><div><button type="button" onClick={() => setBond((value) => Math.min(100, value + 4))}>认可 <b>+4</b></button><button type="button" onClick={() => setBond((value) => Math.max(0, value - 4))}>点踩 <b>−4</b></button></div></div>
        </div>
      </div>
      <EvidenceDisclosure items={evidence} />
    </section>
  );
}
