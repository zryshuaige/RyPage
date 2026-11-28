"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { EvidenceDisclosure } from "./evidence-disclosure";
import { ProductAccent } from "./product-accent";
import { StudyHeading } from "./study-heading";

const targets = [
  { id: "search", label: "搜索按钮", instruction: "点击搜索按钮", region: { x: 57, y: 12, width: 37, height: 28 }, point: { x: 84, y: 26 }, coordinate: ["0.84", "0.26"], confidence: "0.98" },
  { id: "download", label: "下载按钮", instruction: "下载第一个文件", region: { x: 34, y: 43, width: 60, height: 27 }, point: { x: 82, y: 56 }, coordinate: ["0.82", "0.56"], confidence: "0.96" },
  { id: "settings", label: "设置入口", instruction: "打开设置", region: { x: 3, y: 66, width: 28, height: 26 }, point: { x: 16, y: 79 }, coordinate: ["0.16", "0.79"], confidence: "0.97" },
] as const;
type TargetId = (typeof targets)[number]["id"];

const evidence = [
  { title: "One backbone, one adapter", text: "同一个 Qwen2.5-VL backbone 与 LoRA adapter 贯穿训练和推理，区域定位不是额外拼接的一套模型。" },
  { title: "Region → crop → point", text: "模型先预测区域，只裁剪一次，再在局部完成点击坐标预测并映射回原图；没有候选搜索。" },
  { title: "Learning how to inspect", text: "Direct-point SFT 建立直接定位能力，Region SFT 建立区域输出分布，GRPO 再用覆盖与紧凑度优化观察策略。" },
];

export function ReagroundSection() {
  const [selected, setSelected] = useState<TargetId>("search");
  const reducedMotion = useReducedMotion();
  const target = targets.find((item) => item.id === selected) ?? targets[0];

  return (
    <section id="reaground" className="product-study reaground-study" aria-labelledby="reaground-title">
      <div className="product-scene-accent"><ProductAccent product="reaground" /></div>
      <StudyHeading
        id="reaground-title"
        eyebrow="Local models, made practical"
        name="ReAGround"
        title="让本地模型看懂屏幕，并告诉 Agent 点哪里。"
        description="截图不必离开设备。3B 模型先找出相关区域，再输出可以点击的坐标；一次区域裁剪，把计算留给真正有用的像素。"
        status="研究与开发"
        category="ON-DEVICE GUI GROUNDING"
        flow={["屏幕与指令", "本地 3B 定位", "坐标与动作"]}
        href="https://github.com/zryshuaige/ReAGround"
      />
      <div className="grounding-lab">
        <div className="grounding-command">
          <div><span>YOUR INSTRUCTION</span><p>“{target.instruction}”</p></div>
          <span className="local-inference-badge"><i aria-hidden="true" />LOCAL · NO CLOUD UPLOAD</span>
        </div>
        <div className="ground-target-picker" aria-label="选择屏幕定位目标">
          {targets.map((item) => <button key={item.id} type="button" aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}>{item.label}<span>↗</span></button>)}
        </div>
        <div className="grounding-pipeline">
          <div className="ground-screen-panel">
            <div className="scene-topline"><span>01 / OBSERVE</span><span>1920 × 1080</span></div>
            <div className="mock-desktop">
              <div className="mock-browser-bar"><i /><i /><i /><span>workspace.local</span></div>
              <div className="mock-sidebar"><b>RySpace</b><span>Overview</span><span>Documents</span><span>Activity</span><span className="mock-settings">⚙ Settings</span></div>
              <div className="mock-content"><span>Good morning, Ryen</span><strong>Workspace</strong><div className="mock-search">Search anything…</div><div className="mock-file"><span>AI-research.pdf</span><b>Download</b></div><div className="mock-file is-second"><span>Weekly-notes.md</span><b>•••</b></div></div>
              <motion.div key={`region-${target.id}`} className="ground-region" initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{ left: `${target.region.x}%`, top: `${target.region.y}%`, width: `${target.region.width}%`, height: `${target.region.height}%` }}><span>REGION 01</span></motion.div>
              <motion.i key={`point-${target.id}`} className="ground-click-point" initial={reducedMotion ? false : { opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={{ left: `${target.point.x}%`, top: `${target.point.y}%` }} />
            </div>
          </div>
          <div className="ground-crop-panel">
            <div className="scene-topline"><span>02 / CROP ONCE</span><span>LOCAL</span></div>
            <motion.div key={target.id} className="ground-crop-preview" initial={reducedMotion ? false : { opacity: 0.5 }} animate={{ opacity: 1 }}>
              <span>{target.label}</span>
              <div className="crop-ui-bar" /><div className="crop-ui-block" /><i aria-hidden="true" />
            </motion.div>
            <p>只保留相关区域<br /><span>减少无效像素与候选搜索</span></p>
          </div>
          <div className="ground-output-panel">
            <div className="scene-topline"><span>03 / POINT</span><span>3B MODEL</span></div>
            <div className="ground-coordinate"><span>CLICK TARGET</span><strong>{target.coordinate[0]}<em>,</em> {target.coordinate[1]}</strong><p>归一化屏幕坐标</p></div>
            <pre><code>{`{\n  "action": "click",\n  "x": ${target.coordinate[0]},\n  "y": ${target.coordinate[1]}\n}`}</code></pre>
            <div className="ground-confidence"><span>CONFIDENCE</span><b>{target.confidence}</b></div>
          </div>
        </div>
        <div className="grounding-foot"><span>REGION → CROP → POINT</span><span>CONCEPT SIMULATION / NO LIVE MODEL INFERENCE</span></div>
      </div>
      <EvidenceDisclosure items={evidence} />
    </section>
  );
}
