"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { StudyHeading } from "./study-heading";

export function RyboxSection() {
  const [executed, setExecuted] = useState(false);
  const reducedMotion = useReducedMotion();
  const duration = reducedMotion ? 0 : 1.35;

  return (
    <section id="rybox" className="product-study rybox-study" aria-labelledby="rybox-title">
      <StudyHeading
        id="rybox-title"
        eyebrow="Recoverable computer use"
        name="RyBox"
        title="让 Agent 敢行动，也能撤销行动。"
        description="探索面向 Computer Use 的沙箱模型与执行环境：边界可见、动作可观察、状态可恢复。可靠性不是永不犯错，而是错误不会变成无法挽回的代价。"
        status="未来构想"
      />
      <div className="sandbox-workbench">
        <div className="sandbox-stage" aria-label={executed ? "动作已执行，可以回滚到检查点" : "动作等待执行，检查点已经保存"}>
          <svg viewBox="0 0 800 460" fill="none" aria-hidden="true">
            <rect x="40" y="40" width="720" height="380" className="sandbox-boundary" />
            <path d="M120 350 C210 350 210 210 300 210 C390 210 400 110 520 110" className="sandbox-path" />
            <motion.g animate={{ opacity: executed ? 0.22 : 1 }} transition={{ duration: reducedMotion ? 0 : 0.2 }}>
              <rect x="82" y="312" width="76" height="76" className="sandbox-checkpoint" />
              <path d="M101 350 H139 M120 331 V369" className="sandbox-checkpoint-mark" />
            </motion.g>
            <motion.g animate={{ opacity: executed ? 1 : 0.16 }} transition={{ duration: reducedMotion ? 0 : 0.25 }}>
              <rect x="278" y="188" width="44" height="44" className="sandbox-ghost" />
              <rect x="498" y="88" width="44" height="44" className="sandbox-ghost" />
            </motion.g>
            <motion.circle
              r="13"
              className="sandbox-token"
              initial={{ cx: 120, cy: 350 }}
              animate={{ cx: executed ? [120, 240, 360, 520] : [520, 360, 240, 120], cy: executed ? [350, 245, 205, 110] : [110, 205, 245, 350] }}
              transition={{ duration, ease: "easeInOut" }}
            />
          </svg>
          <div className="sandbox-labels" aria-hidden="true"><span>Checkpoint</span><span>New state</span></div>
        </div>
        <div className="sandbox-controls">
          <div aria-live="polite">
            <p>{executed ? "动作已执行，环境产生新状态。" : "检查点已保存，动作尚未进入环境。"}</p>
            <span>{executed ? "Every action leaves an observable trace." : "A reversible world starts before the first action."}</span>
          </div>
          <div className="sandbox-buttons">
            <button type="button" onClick={() => setExecuted(true)} disabled={executed}>执行动作</button>
            <button type="button" onClick={() => setExecuted(false)} disabled={!executed}>回到检查点</button>
          </div>
        </div>
      </div>
    </section>
  );
}
