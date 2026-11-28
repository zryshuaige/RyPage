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

const replies: Record<Trait, string> = {
  outgoing: "我先整理了 12 条来源，也补充了几条值得关注的新动态。",
  rigorous: "我先整理了 12 条来源，并剔除重复报道，保留可核验的原始链接。",
  humor: "我整理了 12 条来源，热闹留给行业，清晰留给你。",
  proactive: "我已整理 12 条来源，并主动安排核验与简报写入。",
};

const evidence = [
  { title: "A visible relay", text: "@ 指定助理，或让调度器选择合适的人。任务在不同人格之间转交时，接力链始终可见。" },
  { title: "Memory you can edit", text: "关键词与向量混合召回、事实抽取和经验手册都可读可改，真实反馈会回流到后续相处。" },
  { title: "Work that lands on disk", text: "RyVibe 把一句话变成文件、文档、表格或流程；验收、预览、迭代和快照回滚都属于交付。" },
];

export function HarnessSection() {
  const [traits, setTraits] = useState<Record<Trait, number>>({ outgoing: 64, rigorous: 72, humor: 46, proactive: 68 });
  const [bond, setBond] = useState(56);
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null);
  const reducedMotion = useReducedMotion();
  const lead = [...traitDefinitions].sort((a, b) => traits[b.id] - traits[a.id])[0];
  const behavior = traits[lead.id] >= 50 ? lead.high : lead.low;

  return (
    <section id="ryharness" className="product-study harness-study" aria-labelledby="harness-title">
      <div className="product-scene-accent"><ProductAccent product="ryharness" /></div>
      <StudyHeading
        id="ryharness-title"
        eyebrow="Personality before infrastructure"
        name="RyHarness"
        title="一支带人格、记忆和交付能力的 AI 助手团队。"
        description="把任务交给不同性格的助理，看得见他们如何接力、记住你的偏好，并把讨论变成可以打开的文件。"
        status="开发者预览"
        category="PERSONAL AI WORKFORCE"
        flow={["你的任务", "协作与记忆", "文件交付"]}
        href="https://github.com/zryshuaige/RyHarness"
      />
      <div className="harness-workspace">
        <div className="harness-conversation">
          <div className="scene-topline"><span>TASK 024 / WEEKLY AI BRIEF</span><span>4 ASSISTANTS ONLINE</span></div>
          <div className="harness-user-task"><span>YOU</span><p>整理本周 AI 动态，核验来源，生成一份中文简报。</p></div>
          <div className="harness-messages">
            <article className="harness-message">
              <span className="assistant-avatar">M</span>
              <div><header><strong>Mira</strong><small>调研助理 · 外向 / 主动</small></header><motion.p key={lead.id} initial={reducedMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>{replies[lead.id]}</motion.p><span className="message-artifact">sources.md · 12 references</span></div>
            </article>
            <div className="harness-handoff"><span>@Sage</span><p>请核验关键数据与原始出处</p><i aria-hidden="true">↓</i></div>
            <article className="harness-message">
              <span className="assistant-avatar is-sage">S</span>
              <div><header><strong>Sage</strong><small>核验助理 · 严谨</small></header><p>9 条已通过原始来源核验，3 条作为行业观点单独标注。</p><span className="message-artifact">verified.md · 9 confirmed</span></div>
            </article>
            <div className="harness-handoff"><span>@RyVibe</span><p>将确认后的内容写入工作区</p><i aria-hidden="true">↓</i></div>
          </div>
          <div className="harness-deliverable">
            <span className="file-glyph" aria-hidden="true">MD</span>
            <div><strong>weekly-ai-brief.md</strong><p>/workspace/reports · 2.8 KB</p></div>
            <span>已交付 ✓</span>
          </div>
          <p className="demo-note">INTERACTIVE PRODUCT DEMO / SAMPLE CONVERSATION</p>
        </div>
        <aside className="harness-profile">
          <div className="scene-topline"><span>ASSISTANT PROFILE</span><span>BOND / {String(bond).padStart(3, "0")}</span></div>
          <div className="profile-identity"><span>Ry</span><div><strong>Research partner</strong><p>{behavior}，同时保留自己的工作节奏。</p></div></div>
          <div className="memory-card">
            <span>EDITABLE MEMORY</span>
            <p>偏好中文简报；重要数据需要原始来源；结论先行，细节随后。</p>
            <small aria-live="polite">{feedback === "positive" ? "✓ 认可已记录：保留这种协作方式" : feedback === "negative" ? "✓ 反馈已记录：下次减少类似表达" : "记忆可读、可改，也会回应真实反馈"}</small>
          </div>
          <div className="trait-list">
            {traitDefinitions.map((trait) => <label key={trait.id}>
              <span>{trait.label}<output>{String(traits[trait.id]).padStart(2, "0")}</output></span>
              <input type="range" min="0" max="100" value={traits[trait.id]} aria-label={`${trait.label}人格参数`} style={{ "--trait-value": `${traits[trait.id]}%` } as React.CSSProperties} onChange={(event) => setTraits((current) => ({ ...current, [trait.id]: Number(event.target.value) }))} />
              <small>{traits[trait.id] >= 50 ? trait.high : trait.low}</small>
            </label>)}
          </div>
          <div className="bond-controls"><span>这次协作是否符合你的偏好？</span><div><button type="button" aria-pressed={feedback === "positive"} onClick={() => { setBond((value) => Math.min(100, value + 4)); setFeedback("positive"); }}>认可 <b>+4</b></button><button type="button" aria-pressed={feedback === "negative"} onClick={() => { setBond((value) => Math.max(0, value - 4)); setFeedback("negative"); }}>点踩 <b>−4</b></button></div></div>
        </aside>
      </div>
      <EvidenceDisclosure items={evidence} />
    </section>
  );
}
