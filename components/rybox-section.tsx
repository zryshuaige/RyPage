"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { EvidenceDisclosure } from "./evidence-disclosure";
import { StudyHeading } from "./study-heading";

const actions = [
  { id: "browser", label: "浏览器操作", english: "Browser · click", tool: "browser.click", verdict: "Direct tool path", title: "浏览器操作，不必每次绕道坐标推演。", result: "Agent 直接调用结构化浏览器工具，缩短从观察、规划到点击的链路。", tone: "safe", level: "NATIVE TOOL_USE", position: 18, before: "Screenshot → plan → coordinates", after: "Agent → browser.click", recovery: "Action boundary visible" },
  { id: "software", label: "软件操作", english: "Application · edit", tool: "app.replace_text", verdict: "Native action", title: "软件能力，成为 Agent 可直接调用的工具。", result: "把软件操作封装成明确的 tool_use，让 Agent 少处理一层界面猜测，同时保留必要的状态检查。", tone: "caution", level: "CHECKPOINT + TOOL_USE", position: 54, before: "Screenshot → locate → simulate", after: "Agent → app.replace_text", recovery: "State checkpoint retained" },
  { id: "delete", label: "高风险操作", english: "Filesystem · delete", tool: "fs.delete", verdict: "Do not execute", title: "高风险调用，仍需先越过可逆性检查。", result: "tool_use 缩短的是操作链路，不是安全判断；越过可逆边界的行动不会进入真实环境。", tone: "stop", level: "OUTSIDE BOUNDARY", position: 88, before: "/project/ → fs.delete", after: "Blocked before execution", recovery: "Recovery unavailable" },
] as const;
type ActionId = (typeof actions)[number]["id"];

const principles = [
  { title: "Native tool_use", text: "面向浏览器与软件操作内置结构化工具，让点击、导航、编辑等 Computer Use 技能成为直接调用，而非重复的界面猜测。" },
  { title: "Responsive by design", text: "减少截图理解、坐标规划与模拟输入之间的往返，把感知到行动的路径做得更短，提升 Agent 操作电脑的响应与灵敏性。" },
  { title: "Fast, with boundaries", text: "效率不取代安全。沙箱仍负责隔离环境、检查状态与保留恢复路径，高风险操作必须先通过可逆性判断。" },
];

export function RyboxSection() {
  const [selected, setSelected] = useState<ActionId>("browser");
  const [executed, setExecuted] = useState(false);
  const reducedMotion = useReducedMotion();
  const action = actions.find((item) => item.id === selected) ?? actions[0];
  return (
    <section id="rybox" className="product-study rybox-study" aria-labelledby="rybox-title">
      <StudyHeading id="rybox-title" eyebrow="Computer use, with a shorter path to action" name="RyBox" title="让 Agent 操作电脑，更接近一种本能。" description="针对 Agent Computer Use 技能特殊优化的沙箱：为浏览器与软件操作内置 tool_use，减少感知到执行之间的往返，提升响应与操作灵敏性；隔离与可逆性则是它的底层边界。" status="未来构想" />
      <div className="sandbox-model-scene">
        <div className="sandbox-policy">
          <div className="scene-topline"><span>COMPUTER USE TOOLS</span><span>03</span></div>
          <p className="sandbox-instruction">浏览器、软件与文件操作，<br />都应该有直接的调用路径。</p>
          <div className="sandbox-candidates" aria-label="候选 Computer Use 工具">
            {actions.map((item, index) => <button key={item.id} type="button" aria-pressed={selected === item.id} onClick={() => { setSelected(item.id); setExecuted(false); }}>
              <span className="candidate-index">0{index + 1}</span><span className="candidate-name">{item.label}<small>{item.english}</small></span><span className={`candidate-signal is-${item.tone}`} aria-hidden="true" /><span className="candidate-arrow" aria-hidden="true">↗</span>
            </button>)}
          </div>
          <p className="sandbox-note">OPTIMIZED FOR AGENT COMPUTER USE<br />Concept simulation. No live tool execution.</p>
        </div>
        <div className="consequence-field">
          <div className="scene-topline"><span>TOOL_USE DISPATCH</span><span className={executed ? `is-${action.tone}` : ""}>{executed ? action.level : "READY TO CALL"}</span></div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div className="decision-content" key={`${selected}-${executed}`} initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
              <div className="decision-heading"><span>{executed ? `tool_use / ${action.tool}` : "SHORTER PERCEPTION-TO-ACTION PATH"}</span><h3>{executed ? action.verdict : "Direct by design."}</h3><p>{executed ? action.title : "选择一种电脑操作，观察它如何通过内置工具直接抵达环境。"}</p></div>
              <div className="state-diff">
                <div><span>CONVENTIONAL PATH</span><code>{executed ? action.before : "Observe → plan → operate"}</code></div><span className="diff-arrow" aria-hidden="true">→</span><div><span>RYBOX PATH</span><code>{executed ? action.after : "Agent → tool_use"}</code></div>
              </div>
              <div className={`reversibility is-${executed ? action.tone : "idle"}`}>
                <div><span>SANDBOX BOUNDARY</span><span>{executed ? action.recovery : "Always active"}</span></div>
                <div className="reversibility-track"><span className="boundary-marker" /><motion.i animate={{ left: executed ? `${action.position}%` : "4%" }} transition={{ duration: reducedMotion ? 0 : 0.4, ease: [0.23, 1, 0.32, 1] }} /></div>
                <div className="reversibility-labels"><span>RESTORABLE</span><span>IRREVERSIBLE</span></div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className={`consequence-result is-${action.tone}`} aria-live="polite"><p>{executed ? action.result : "这里不会执行真实操作，只呈现内置 tool_use 的调用方式。"}</p></div>
          <div className="consequence-buttons"><button type="button" onClick={() => setExecuted(true)} disabled={executed}>推演调用 <span>↗</span></button><button type="button" onClick={() => setExecuted(false)} disabled={!executed}>重置</button></div>
        </div>
      </div>
      <EvidenceDisclosure label="Read the design principles" items={principles} concept />
    </section>
  );
}
