"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { EvidenceDisclosure } from "./evidence-disclosure";
import { ProductAccent } from "./product-accent";
import { StudyHeading } from "./study-heading";

const dimensions = [
  { id: "local", index: "01", label: "LOCAL INFERENCE", title: "感知留在设备里。", detail: "屏幕、指令与模型形成本地闭环，云端不是默认的数据出口。", footer: "ONE DEVICE · CLOSED LOOP" },
  { id: "speed", index: "02", label: "INFERENCE SPEED", title: "把计算留给有效像素。", detail: "共享缩放预算与一次区域裁剪，减少无效观察，而不是盲目搜索候选框。", footer: "RESIZE ONCE · CROP ONCE" },
  { id: "training", index: "03", label: "POST-TRAINING", title: "让观察策略继续进化。", detail: "SFT 与 GRPO 通过覆盖和紧凑度奖励，教会模型选择更有用的区域。", footer: "COVERAGE · COMPACTNESS" },
] as const;
type Dimension = (typeof dimensions)[number]["id"];

const evidence = [
  { title: "One backbone, one adapter", text: "同一个 Qwen2.5-VL backbone 与 LoRA adapter 贯穿训练和推理，区域定位不是额外拼接的一套模型。" },
  { title: "Region → crop → point", text: "模型先预测区域，只裁剪一次，再在局部完成点击坐标预测并映射回原图；没有候选搜索。" },
  { title: "Learning how to inspect", text: "Direct-point SFT 建立直接定位能力，Region SFT 建立区域输出分布，GRPO 再用覆盖与紧凑度优化观察策略。" },
];

function LocalScene() {
  return <svg viewBox="0 0 320 220" fill="none" aria-hidden="true">
    <rect x="20" y="25" width="280" height="158" rx="16" className="ground-device" />
    {[20, 120, 220].map((x) => <rect key={x} x={x + 8} y="67" width="64" height="66" rx="9" className="ground-node" />)}
    <path d="M92 100h28m-6-5 6 5-6 5M192 100h28m-6-5 6 5-6 5" className="ground-arrow" />
    <text x="60" y="94" textAnchor="middle" className="ground-node-label">SCREEN</text><text x="60" y="112" textAnchor="middle" className="ground-node-value">输入</text>
    <text x="160" y="99" textAnchor="middle" className="ground-model">3B</text><text x="160" y="117" textAnchor="middle" className="ground-node-label">LOCAL</text>
    <text x="260" y="94" textAnchor="middle" className="ground-node-label">ACTION</text><text x="260" y="112" textAnchor="middle" className="ground-node-value">输出</text>
    <circle cx="36" cy="42" r="3" className="ground-status" /><text x="47" y="46" className="ground-micro">ON DEVICE</text>
    <text x="160" y="161" textAnchor="middle" className="ground-micro">NO CLOUD REQUIRED</text>
  </svg>;
}

function SpeedScene({ active }: { active: boolean }) {
  const reducedMotion = useReducedMotion();
  return <svg viewBox="0 0 320 220" fill="none" aria-hidden="true">
    <rect x="22" y="25" width="196" height="158" rx="12" className="ground-screen" />
    <path d="M22 49h196" className="ground-hairline" /><circle cx="36" cy="37" r="2.5" className="ground-ui" /><circle cx="45" cy="37" r="2.5" className="ground-ui" />
    <rect x="39" y="66" width="69" height="10" rx="3" className="ground-ui" /><rect x="39" y="86" width="43" height="7" rx="3" className="ground-ui faint" />
    <rect x="39" y="115" width="69" height="42" rx="6" className="ground-ui faint" /><rect x="126" y="66" width="70" height="91" rx="6" className="ground-ui faint" />
    <motion.g animate={{ opacity: active || reducedMotion ? 1 : 0.55 }} transition={{ duration: 0.25 }}>
      <rect x="116" y="58" width="90" height="108" rx="8" className="ground-crop" />
      <path d="M116 72V58h14M192 58h14v14M206 152v14h-14M130 166h-14v-14" className="ground-crop-corner" />
    </motion.g>
    <path d="M225 105h28m-6-5 6 5-6 5" className="ground-arrow" />
    <circle cx="278" cy="105" r="22" className="ground-target" /><circle cx="278" cy="105" r="5" className="ground-target-point" />
    <path d="M278 75v12M278 123v12M248 105h12M296 105h12" className="ground-arrow" />
  </svg>;
}

function TrainingScene() {
  const stages = [
    { x: 31, px: 12, py: 17, width: 80, height: 117, label: "DIRECT", type: "SFT" },
    { x: 119, px: 9, py: 10, width: 66, height: 94, label: "REGION", type: "SFT" },
    { x: 207, px: 5, py: 5, width: 54, height: 74, label: "GRPO", type: "RL" },
  ];
  return <svg viewBox="0 0 320 220" fill="none" aria-hidden="true">
    {stages.map((stage) => <g key={stage.label}>
      <rect x={stage.x} y="32" width="82" height="142" rx="9" className="ground-training-frame" />
      <rect x={stage.x + 18} y="57" width="46" height="68" rx="4" className="ground-training-target" />
      <rect x={stage.x + stage.px} y={32 + stage.py} width={stage.width} height={stage.height} rx="5" className="ground-training-prediction" />
      <text x={stage.x + 41} y="151" textAnchor="middle" className="ground-node-label">{stage.label}</text><text x={stage.x + 41} y="164" textAnchor="middle" className="ground-micro">{stage.type}</text>
    </g>)}
    <path d="M61 194h198" className="ground-hairline" /><path d="m246 189 6 5-6 5" className="ground-arrow" />
    <text x="31" y="199" className="ground-micro">LEARN TO INSPECT</text>
  </svg>;
}

export function ReagroundSection() {
  const [active, setActive] = useState<Dimension>("local");
  return (
    <section id="reaground" className="product-study reaground-study" aria-labelledby="reaground-title">
      <div className="product-scene-accent"><ProductAccent product="reaground" /></div>
      <StudyHeading id="reaground-title" eyebrow="Local models, made practical" name="ReAGround" title="本地推理、推理效率、后训练，缺一不可。" description="不是只让 GUI 模型看懂截图，而是同时回答它能否留在本地、能否高效观察、能否通过训练持续变得更好。" status="研究与开发" href="https://github.com/zryshuaige/ReAGround" />
      <div className="grounding-dimensions">
        {dimensions.map((dimension) => <button key={dimension.id} type="button" className={`grounding-dimension ${active === dimension.id ? "is-active" : ""}`} aria-pressed={active === dimension.id} onPointerEnter={() => setActive(dimension.id)} onFocus={() => setActive(dimension.id)} onClick={() => setActive(dimension.id)}>
          <span className="dimension-heading"><span>{dimension.index} / {dimension.label}</span><i aria-hidden="true" /></span>
          <span className="dimension-title">{dimension.title}</span>
          {dimension.id === "local" ? <LocalScene /> : dimension.id === "speed" ? <SpeedScene active={active === "speed"} /> : <TrainingScene />}
          <span className="dimension-copy">{dimension.detail}</span><span className="dimension-footer">{dimension.footer}</span>
        </button>)}
      </div>
      <EvidenceDisclosure items={evidence} />
    </section>
  );
}
