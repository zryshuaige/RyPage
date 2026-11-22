"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EvidenceDisclosure } from "./evidence-disclosure";
import { ProductAccent } from "./product-accent";
import { StudyHeading } from "./study-heading";

const routes = [
  { title: "Plan", host: "Harness", device: "HARNESS HOST / ORCHESTRATOR", detail: "任务先进入 Harness 调度层：理解意图、读取上下文，再把工作分配给合适的 hosted agent。", state: "Decompose + route" },
  { title: "Browse", host: "Browser", device: "BROWSER HOST / WEB AGENT", detail: "浏览器 Agent 在独立宿主中接管网页操作，任务状态不因执行位置变化而中断。", state: "Web operation routed" },
  { title: "Reason", host: "Cloud", device: "CLOUD HOST / REASONING AGENT", detail: "复杂规划按需分配给云端 Agent，而不是让每个宿主重复加载所有能力。", state: "Reasoning routed" },
  { title: "Deliver", host: "Local", device: "LOCAL HOST / WORKSPACE AGENT", detail: "结果回到本地宿主，文件、进度与上下文继续保留，等待下一次接力。", state: "Workspace + state" },
];

const hosts = [
  { name: "Harness Host", capability: "Orchestrator" },
  { name: "Browser Host", capability: "Web operations" },
  { name: "Cloud Host", capability: "Reasoning" },
  { name: "Local Host", capability: "Files + state" },
];

const principles = [
  { title: "A registry of hosted agents", text: "不同设备与环境中的 Agent 注册自己的能力、状态和可用性，调度层知道谁存在、能做什么、当前是否适合接取任务。" },
  { title: "Optimized multi-host dispatch", text: "Harness 根据任务、上下文与成本选择宿主，让浏览器操作、复杂推理和本地交付进入合适的 Agent，而不是所有工作挤在一个进程里。" },
  { title: "Continuity across the fleet", text: "任务状态、产物与恢复信息在接力中保持连续；跨会话和跨设备是调度的基础能力，端云协同则退居底层。" },
];

export function RyagentSection() {
  const [running, setRunning] = useState(true);
  const [step, setStep] = useState(0);
  const sceneRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sceneRef, { amount: 0.3 });
  const reducedMotion = useReducedMotion();
  const current = routes[step];

  useEffect(() => {
    if (!running || !inView || reducedMotion) return;
    const interval = window.setInterval(() => {
      if (!document.hidden) setStep((value) => (value + 1) % routes.length);
    }, 2800);
    return () => window.clearInterval(interval);
  }, [running, inView, reducedMotion]);

  return (
    <section id="ryagent" className="product-study ryagent-study" aria-labelledby="ryagent-title">
      <div className="product-scene-accent"><ProductAccent product="ryagent" /></div>
      <StudyHeading id="ryagent-title" eyebrow="Harness as a Service, evolved" name="RyAgent As A Service" title="不止一个 Agent 在线，而是一群 Agent 协同运行。" description="从 Harness as a Service 进阶为 Multi-Hosted Agents 的调度优化层：发现不同宿主中的 Agent，按任务分配、接力与恢复。持续状态连接整个集群，端云协同在底层完成。" status="未来服务构想" />
      <div className="continuity-scene" ref={sceneRef}>
        <div className="continuity-top"><span><i className={running ? "is-live" : ""} />MULTI-HOSTED AGENTS / {running ? "SCHEDULING" : "SCHEDULER HELD"}</span><button type="button" onClick={() => setRunning((value) => !value)}>{running ? "暂停调度" : "继续调度"}<span aria-hidden="true">{running ? "Ⅱ" : "▷"}</span></button></div>
        <div className="continuity-body">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div className="continuity-copy" key={step} initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.25 }} aria-live="polite">
              <span>{current.device}</span><h3>{current.host}<em> / 0{step + 1}</em></h3><p>{current.detail}</p>
            </motion.div>
          </AnimatePresence>
          <div className="task-state host-registry">
            <div className="scene-topline"><span>HOSTED AGENTS</span><span>04 DISCOVERED</span></div>
            <div className="host-list">
              {hosts.map((host, index) => <div key={host.name} className={index === step ? "is-routed" : ""}><span><i aria-hidden="true" />{host.name}<small>{host.capability}</small></span><b>{index === step ? "ACTIVE" : "READY"}</b></div>)}
            </div>
            <p><i aria-hidden="true" />One task. Optimized across hosts.</p>
          </div>
        </div>
        <div className="continuity-track">
          <div className="continuity-line"><motion.i animate={{ scaleX: step / (routes.length - 1) }} transition={{ duration: reducedMotion ? 0 : 0.5, ease: [0.23, 1, 0.32, 1] }} /></div>
          {routes.map((route, index) => <button key={route.title} type="button" className={index === step ? "is-current" : index < step ? "is-past" : ""} aria-current={index === step ? "step" : undefined} onClick={() => { setStep(index); setRunning(false); }}><i /><span>{route.title}</span><small>{index === step ? "TASK ROUTED" : `ROUTE 0${index + 1}`}</small></button>)}
        </div>
        <div className="continuity-foot"><span>Many hosts. One harness.</span><span>CONCEPT SIMULATION / NO LIVE FLEET</span></div>
      </div>
      <EvidenceDisclosure label="Read the design principles" items={principles} concept />
    </section>
  );
}
