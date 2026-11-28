"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EvidenceDisclosure } from "./evidence-disclosure";
import { ProductAccent } from "./product-accent";
import { StudyHeading } from "./study-heading";

const allocations = [
  { id: "light", complexity: "LIGHT", task: "整理文档与内容摘要", requirement: "基础推理 · 少量文件", size: "S", cpu: "1 vCPU", memory: "2 GB", runtime: "15 min", tools: "Filesystem", detail: "轻任务只申请基础规格，不为简单摘要长期占用大沙箱。", output: "summary.md" },
  { id: "standard", complexity: "STANDARD", task: "竞品调研与网页操作", requirement: "网页访问 · 多步推理", size: "M", cpu: "2 vCPU", memory: "4 GB", runtime: "45 min", tools: "Browser + Filesystem", detail: "需要浏览器与更多上下文时，同一个 Hosted Agent 迁移到标准规格沙箱。", output: "research.md" },
  { id: "complex", complexity: "COMPLEX", task: "代码迁移与批量验证", requirement: "高并发 · 构建与测试", size: "L", cpu: "4 vCPU", memory: "8 GB", runtime: "120 min", tools: "Build + Test + Filesystem", detail: "复杂构建临时提升计算、内存和时长配额，任务结束后即可释放。", output: "migration-report.md" },
] as const;
type AllocationId = (typeof allocations)[number]["id"];

const principles = [
  { title: "Hosted Agents as a rental capability", text: "用户通过租赁获得可持续的 Hosted Agent，而不是购买并长期维护一台固定机器。Agent 的身份、能力与任务状态可以独立存在。" },
  { title: "Task-matched sandbox specifications", text: "Harness 根据任务复杂度、工具需求与预计时长匹配不同规格的沙箱。资源可以按需升级、降级和释放，而不是始终占用最高配置。" },
  { title: "Harness and sandbox, decoupled", text: "Harness 负责发现、匹配、状态与恢复，不绑定某个具体沙箱实现。沙箱环境可以替换、迁移或回收，Hosted Agent 本身不被环境锁定。" },
];

export function RyagentSection() {
  const [running, setRunning] = useState(true);
  const [selected, setSelected] = useState<AllocationId>("standard");
  const sceneRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sceneRef, { amount: 0.3 });
  const reducedMotion = useReducedMotion();
  const currentIndex = allocations.findIndex((item) => item.id === selected);
  const current = allocations[currentIndex] ?? allocations[1];

  useEffect(() => {
    if (!running || !inView || reducedMotion) return;
    const interval = window.setInterval(() => {
      if (!document.hidden) setSelected((value) => {
        const index = allocations.findIndex((item) => item.id === value);
        return allocations[(index + 1) % allocations.length].id;
      });
    }, 2800);
    return () => window.clearInterval(interval);
  }, [running, inView, reducedMotion]);

  return (
    <section id="ryagent" className="product-study ryagent-study" aria-labelledby="ryagent-title">
      <div className="product-scene-accent"><ProductAccent product="ryagent" /></div>
      <StudyHeading
        id="ryagent-title"
        eyebrow="Hosted Agents in Multi-Harness"
        name="RyAgent As A Service"
        title="让 Hosted Agent 按任务获得刚刚好的沙箱资源。"
        description="用户租赁 Hosted Agent，由 Harness 按任务复杂度匹配不同规格的沙箱。资源灵活、可变，Harness 与沙箱环境本身解耦。"
        status="未来服务构想"
        category="RESOURCE SCHEDULING FOR HOSTED AGENTS"
        flow={["租赁 Hosted Agent", "按复杂度匹配", "弹性沙箱执行"]}
      />
      <div className="agent-orchestrator" ref={sceneRef}>
        <div className="continuity-top"><span><i className={running ? "is-live" : ""} />HOSTED AGENTS IN MULTI-HARNESS / {running ? "MATCHING" : "MATCHER HELD"}</span><button type="button" onClick={() => setRunning((value) => !value)}>{running ? "暂停匹配" : "继续匹配"}<span aria-hidden="true">{running ? "Ⅱ" : "▷"}</span></button></div>
        <div className="agent-rental-brief">
          <div><span>HOSTED AGENT / RENTED</span><strong>Hosted Agent A-17</strong><p>Agent 身份、能力与任务状态独立存在，不被某台沙箱锁定。</p></div>
          <div><span>ARCHITECTURE</span><strong>Harness ≠ Sandbox</strong><small>调度与执行环境解耦</small></div>
        </div>
        <div className="resource-task-picker" aria-label="选择任务复杂度">
          {allocations.map((item) => <button key={item.id} type="button" aria-pressed={selected === item.id} onClick={() => { setSelected(item.id); setRunning(false); }}><span>{item.complexity}</span><strong>{item.task}</strong><small>{item.requirement}</small></button>)}
        </div>
        <div className="agent-allocation">
          <div className="allocation-agent">
            <span className="allocation-label">01 / HOSTED AGENT</span>
            <div className="allocation-agent-id"><span>A17</span><div><strong>Leased Agent</strong><small>PORTABLE IDENTITY</small></div></div>
            <p>当前任务</p><strong>{current.task}</strong>
            <code>{current.requirement}</code>
          </div>
          <div className="allocation-harness">
            <span className="gate-arrow" aria-hidden="true">→</span>
            <div className="gate-icon" aria-hidden="true">H</div>
            <span>HARNESS</span>
            <strong>MATCHED</strong>
            <p>只负责匹配与状态<br />不绑定执行环境</p>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div className="allocation-sandbox" key={current.id} initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
              <div className="allocation-sandbox-head"><div><span className="allocation-label">03 / ELASTIC SANDBOX</span><strong>Sandbox {current.size}</strong></div><span><i aria-hidden="true" />ALLOCATED</span></div>
              <div className="sandbox-spec-grid"><div><span>COMPUTE</span><strong>{current.cpu}</strong></div><div><span>MEMORY</span><strong>{current.memory}</strong></div><div><span>RUNTIME</span><strong>{current.runtime}</strong></div></div>
              <div className="sandbox-tooling"><span>TOOLS</span><code>{current.tools}</code></div>
              <div className="allocation-output"><span>EXPECTED ARTIFACT</span><strong>{current.output}</strong></div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="sandbox-pool" aria-label="沙箱资源池">
          {allocations.map((item) => <div key={item.size} className={selected === item.id ? "is-allocated" : ""}><span>SANDBOX {item.size}</span><strong>{item.cpu} · {item.memory}</strong><small>{selected === item.id ? "ALLOCATED" : "AVAILABLE"}</small></div>)}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div className="agent-current-detail" key={current.id} initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reducedMotion ? undefined : { opacity: 0 }} aria-live="polite"><span>WHY THIS ALLOCATION</span><p>{current.detail}</p></motion.div>
        </AnimatePresence>
        <div className="continuity-foot"><span>One leased agent. Elastic environments.</span><span>CONCEPT SIMULATION / EXAMPLE SPECIFICATIONS ONLY</span></div>
      </div>
      <EvidenceDisclosure label="Read the design principles" items={principles} concept />
    </section>
  );
}
