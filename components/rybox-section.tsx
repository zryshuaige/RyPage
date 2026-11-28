"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { EvidenceDisclosure } from "./evidence-disclosure";
import { ProductAccent } from "./product-accent";
import { StudyHeading } from "./study-heading";

const actions = [
  { id: "browser", label: "浏览器操作", english: "Browser · click", tool: "browser.click", request: 'browser.click({ target: "Search" })', tone: "safe", gate: "ALLOW", title: "允许进入沙箱", logs: ["→ browser.click({ target: \"Search\" })", "✓ Policy check passed", "✓ Click completed in 42 ms", "✓ Snapshot #042 retained"], result: "页面已在隔离环境中更新", files: "No filesystem changes" },
  { id: "software", label: "软件编辑", english: "Application · edit", tool: "app.replace_text", request: 'app.replace_text({ before: "draft" })', tone: "caution", gate: "CHECKPOINT", title: "创建检查点后执行", logs: ["→ app.replace_text({ before: \"draft\" })", "✓ Checkpoint #107 created", "✓ Text replaced in sandbox", "↩ Restore point available"], result: "编辑完成，可随时恢复快照", files: "document.txt · modified safely" },
  { id: "delete", label: "删除项目文件", english: "Filesystem · delete", tool: "fs.delete", request: 'fs.delete({ path: "/project" })', tone: "stop", gate: "BLOCK", title: "在策略边界处拦截", logs: ["→ fs.delete({ path: \"/project\" })", "× Irreversible action detected", "× Execution denied by policy gate", "0 changes inside sandbox"], result: "未执行，项目文件保持不变", files: "/project · unchanged" },
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
      <div className="product-scene-accent"><ProductAccent product="rybox" /></div>
      <StudyHeading
        id="rybox-title"
        eyebrow="Computer use, with a shorter path to action"
        name="RyBox"
        title="让 Agent 在隔离沙箱里操作电脑，快，但不越界。"
        description="浏览器与软件操作通过内置 tool_use 直接执行；文件删除等高风险调用，会在策略边界被检查或拦截。"
        status="未来构想"
        category="SANDBOXED COMPUTER USE"
        flow={["Agent 指令", "沙箱策略检查", "执行或拦截"]}
      />
      <div className={`rybox-lab is-${executed ? action.tone : "idle"}`}>
        <div className="scene-topline"><span>AGENT COMPUTER USE / ISOLATED RUNTIME</span><span>POLICY ALWAYS ON</span></div>
        <div className="rybox-flow">
          <div className="rybox-agent-panel">
            <span className="sandbox-zone-label">OUTSIDE / AGENT HOST</span>
            <div className="rybox-agent-identity"><span>AI</span><div><strong>Computer Use Agent</strong><p>选择一条指令，观察它能否越过边界。</p></div></div>
            <div className="sandbox-candidates" aria-label="候选 Computer Use 工具">
              {actions.map((item, index) => <button key={item.id} type="button" aria-pressed={selected === item.id} onClick={() => { setSelected(item.id); setExecuted(false); }}>
                <span className="candidate-index">0{index + 1}</span><span className="candidate-name">{item.label}<small>{item.english}</small></span><span className={`candidate-signal is-${item.tone}`} aria-hidden="true" /><span className="candidate-arrow" aria-hidden="true">↗</span>
              </button>)}
            </div>
            <code className="rybox-request">{action.request}</code>
            <div className="consequence-buttons"><button type="button" onClick={() => setExecuted(true)} disabled={executed}>推演调用 <span>↗</span></button><button type="button" onClick={() => setExecuted(false)} disabled={!executed}>重置</button></div>
          </div>
          <div className="rybox-policy-gate">
            <span className="gate-arrow" aria-hidden="true">→</span>
            <div className="gate-icon" aria-hidden="true">◇</div>
            <span>POLICY GATE</span>
            <strong>{executed ? action.gate : "WAITING"}</strong>
            <p>{executed ? action.title : "检查权限与可逆性"}</p>
          </div>
          <div className="rybox-environment">
            <div className="sandbox-environment-head"><div><span className="sandbox-zone-label">INSIDE / RYBOX SANDBOX</span><strong>Isolated workspace</strong></div><span className="sandbox-status"><i aria-hidden="true" />ISOLATED</span></div>
            <div className="sandbox-resources"><span>FS <b>ISOLATED</b></span><span>NET <b>CONTROLLED</b></span><span>SNAPSHOT <b>READY</b></span></div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div className="sandbox-terminal" key={`${selected}-${executed}`} initial={reducedMotion ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0 }} transition={{ duration: 0.2 }}>
                <div><i /><i /><i /><span>sandbox — tool_use</span></div>
                {(executed ? action.logs : ["$ Waiting for an Agent instruction", "  Policy gate is active", "  No changes will leave this environment"]).map((line) => <code key={line}>{line}</code>)}
              </motion.div>
            </AnimatePresence>
            <div className="sandbox-file-result"><span>WORKSPACE RESULT</span><strong>{executed ? action.result : "等待调用"}</strong><p>{executed ? action.files : "/project · untouched"}</p></div>
          </div>
        </div>
        <div className="rybox-foot"><span>Fast execution. Explicit boundaries.</span><span>CONCEPT SIMULATION / NO LIVE TOOL EXECUTION</span></div>
      </div>
      <EvidenceDisclosure label="Read the design principles" items={principles} concept />
    </section>
  );
}
