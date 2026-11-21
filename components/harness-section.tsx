"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { StudyHeading } from "./study-heading";

const layers = [
  {
    id: "personality",
    label: "人格",
    title: "行为可以被塑造，而不是换一张角色皮肤。",
    detail: "人格参数进入系统行为，真实反馈持续改变 Agent 与人的工作关系。",
    path: "M72 142 C212 24 354 280 628 102",
  },
  {
    id: "memory",
    label: "记忆",
    title: "上下文既要来得快，也要持续生长。",
    detail: "同步召回服务即时响应，异步补正把经验沉淀为可理解、可编辑的工作记忆。",
    path: "M58 264 C232 92 382 424 650 238",
  },
  {
    id: "plugins",
    label: "插件",
    title: "能力可以装载，也必须真正卸载。",
    detail: "工具、模型与工作法按需进入运行时；关闭之后，相关能力从系统中真实退出。",
    path: "M54 382 C238 548 410 226 646 412",
  },
  {
    id: "delivery",
    label: "交付",
    title: "完成不是一段回答，而是一份可验证的结果。",
    detail: "产物经过验收才完成，并留下可预览、可迭代、可回滚的快照。",
    path: "M74 508 C256 346 424 578 632 482",
  },
] as const;

export function HarnessSection() {
  const [active, setActive] = useState<(typeof layers)[number]["id"]>("memory");
  const reducedMotion = useReducedMotion();
  const selected = layers.find((layer) => layer.id === active) ?? layers[0];

  return (
    <section id="ryharness" className="product-study harness-study" aria-labelledby="harness-title">
      <StudyHeading
        id="harness-title"
        eyebrow="Interaction harness"
        name="RyHarness"
        title="不是更会聊天，而是更能一起工作。"
        description="把人格、记忆、插件与交付组织成一套注重体验的 Harness。模型能力因此变成可相处、可控制、可持续的工作关系。"
        status="开发中"
        href="https://github.com/zryshuaige/RyHarness"
      />
      <div className="harness-workbench">
        <div className="harness-weave" aria-hidden="true">
          <svg viewBox="0 0 700 600" fill="none">
            <defs>
              <linearGradient id="fiber-silver" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#edf5fa" />
                <stop offset="0.48" stopColor="#8ea6b6" />
                <stop offset="0.72" stopColor="#f5fbff" />
                <stop offset="1" stopColor="#6f8492" />
              </linearGradient>
            </defs>
            {layers.map((layer) => (
              <motion.path
                key={layer.id}
                d={layer.path}
                stroke="url(#fiber-silver)"
                strokeLinecap="round"
                initial={false}
                animate={{ opacity: active === layer.id ? 1 : 0.16, strokeWidth: active === layer.id ? 38 : 18 }}
                transition={{ duration: reducedMotion ? 0 : 0.26, ease: [0.23, 1, 0.32, 1] }}
              />
            ))}
          </svg>
          <p>{selected.label} / active fiber</p>
        </div>
        <div className="harness-controls">
          <div className="harness-layer-list" aria-label="Harness 组成">
            {layers.map((layer) => (
              <button key={layer.id} type="button" aria-pressed={active === layer.id} onClick={() => setActive(layer.id)}>
                <span>{layer.label}</span><i aria-hidden="true" />
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selected.id}
              className="harness-layer-detail"
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <h4>{selected.title}</h4>
              <p>{selected.detail}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
