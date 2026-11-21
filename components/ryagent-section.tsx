"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { StudyHeading } from "./study-heading";

const policies = [
  { id: "privacy", label: "隐私", title: "敏感上下文留在本地。", description: "本地完成交互、感知与交付，云端不成为默认的数据出口。", path: "M180 300 C100 220 100 400 180 340 C260 280 260 380 180 300" },
  { id: "latency", label: "时延", title: "实时操作不必绕远路。", description: "本地感知直接进入可控执行环境，减少不必要的云端往返。", path: "M180 300 C240 240 280 240 340 300 C280 360 240 360 180 300" },
  { id: "capability", label: "能力", title: "复杂规划按需调用云端。", description: "需要更强能力时使用云端规划，再把具体行动交回本地环境。", path: "M180 300 C320 100 480 100 620 300 C480 460 320 460 180 300" },
  { id: "cost", label: "成本", title: "只有收益明确时才增加计算。", description: "优先使用已有本地能力，云端补充必须带来足够明确的收益。", path: "M180 300 C300 230 400 260 510 320" },
] as const;

export function RyagentSection() {
  const [active, setActive] = useState<(typeof policies)[number]["id"]>("privacy");
  const reducedMotion = useReducedMotion();
  const selected = policies.find((policy) => policy.id === active) ?? policies[0];

  return (
    <section id="ryagent" className="product-study ryagent-study" aria-labelledby="ryagent-title">
      <StudyHeading
        id="ryagent-title"
        eyebrow="Edge–cloud orchestration"
        name="RyAgent As A Service"
        title="计算发生在哪里，也是产品体验。"
        description="不是把现有能力简单包装成 API，而是根据隐私、时延、能力与成本，在端和云之间组织每一次任务。统一的是策略，不是四个产品的边界。"
        status="未来服务构想"
      />
      <div className="agent-workbench">
        <div className="agent-space" aria-hidden="true">
          <svg viewBox="0 0 800 600" fill="none">
            <line x1="180" y1="100" x2="180" y2="500" className="agent-axis" />
            <line x1="620" y1="100" x2="620" y2="500" className="agent-axis" />
            <circle cx="180" cy="300" r="112" className="agent-zone" />
            <circle cx="620" cy="300" r="112" className="agent-zone agent-zone-cloud" />
            <text x="180" y="82" textAnchor="middle">LOCAL</text>
            <text x="620" y="82" textAnchor="middle">CLOUD</text>
            <text x="180" y="540" textAnchor="middle">PERCEPTION / ACTION</text>
            <text x="620" y="540" textAnchor="middle">PLANNING / CAPABILITY</text>
            <motion.path
              key={selected.id}
              d={selected.path}
              className="agent-route"
              initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.65, ease: [0.23, 1, 0.32, 1] }}
            />
            <circle cx="180" cy="300" r="9" className="agent-node" />
            <circle cx="620" cy="300" r="9" className="agent-node agent-node-cloud" />
          </svg>
        </div>
        <div className="agent-policy-panel">
          <div className="agent-policy-list" aria-label="端云策略">
            {policies.map((policy) => (
              <button key={policy.id} type="button" aria-pressed={active === policy.id} onClick={() => setActive(policy.id)}>{policy.label}</button>
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selected.id}
              className="agent-policy-detail"
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <h4>{selected.title}</h4>
              <p>{selected.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
