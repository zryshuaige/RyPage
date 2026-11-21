"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { StudyHeading } from "./study-heading";

function AbstractInterface() {
  return (
    <div className="grounding-ui" aria-hidden="true">
      <div className="grounding-ui-top"><i /><i /><i /><span /></div>
      <div className="grounding-ui-body">
        <aside>{[0, 1, 2, 3].map((item) => <i key={item} />)}</aside>
        <div className="grounding-ui-main">
          <div className="grounding-ui-title"><span /><span /></div>
          <div className="grounding-ui-grid">
            <div className="grounding-ui-map"><i /><i /><i /><b /></div>
            <div className="grounding-ui-actions">{[0, 1, 2, 3].map((item) => <span key={item}><i /><b /></span>)}</div>
          </div>
          <div className="grounding-ui-footer"><span /><button type="button" tabIndex={-1}>Continue</button></div>
        </div>
      </div>
    </div>
  );
}

export function ReagroundSection() {
  const [focused, setFocused] = useState(true);
  const fieldRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(420);
  const y = useMotionValue(270);
  const smoothX = useSpring(x, { stiffness: 180, damping: 26, mass: 0.35 });
  const smoothY = useSpring(y, { stiffness: 180, damping: 26, mass: 0.35 });
  const reducedMotion = useReducedMotion();
  const lensX = reducedMotion ? x : smoothX;
  const lensY = reducedMotion ? y : smoothY;
  const clipPath = useMotionTemplate`circle(104px at ${lensX}px ${lensY}px)`;

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    const centerLens = () => {
      const bounds = field.getBoundingClientRect();
      x.set(bounds.width * 0.52);
      y.set(bounds.height * 0.48);
    };
    centerLens();
    const observer = new ResizeObserver(centerLens);
    observer.observe(field);
    return () => observer.disconnect();
  }, [x, y]);

  const moveLens = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - bounds.left);
    y.set(event.clientY - bounds.top);
  };

  return (
    <section id="reaground" className="product-study reaground-study" aria-labelledby="reaground-title">
      <StudyHeading
        id="reaground-title"
        eyebrow="Local GUI optimization"
        name="ReAGround"
        title="让本地小模型，看懂真实界面。"
        description="围绕本地模型的训练与推理约束，联合优化 GUI 观察空间、数据策略与部署方式。区域定位只是实现机制，目标是让有限参数稳定完成视觉理解与定位。"
        status="研究与开发"
        href="https://github.com/zryshuaige/ReAGround"
      />
      <div className="grounding-workbench">
        <div className="grounding-toolbar">
          <p>Observation space</p>
          <div aria-label="观察方式">
            <button type="button" aria-pressed={focused} onClick={() => setFocused(true)}>区域观察</button>
            <button type="button" aria-pressed={!focused} onClick={() => setFocused(false)}>整屏观察</button>
          </div>
        </div>
        <div ref={fieldRef} className="grounding-field" onPointerMove={moveLens} onPointerDown={moveLens}>
          <div className={`grounding-layer grounding-layer-base ${focused ? "is-muted" : ""}`}><AbstractInterface /></div>
          {focused && (
            <motion.div className="grounding-layer grounding-layer-focus" style={{ clipPath }}><AbstractInterface /></motion.div>
          )}
          {focused && <motion.div className="grounding-lens" style={{ x: lensX, y: lensY }} aria-hidden="true"><span>LOCAL FOCUS</span></motion.div>}
        </div>
        <div className="grounding-caption">
          <p>移动指针或触摸界面，改变局部观察区域。</p>
          <span>Local training · Efficient inference · GUI grounding</span>
        </div>
      </div>
    </section>
  );
}
