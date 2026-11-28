import { ACESFilmicToneMapping, SRGBColorSpace, Vector2, WebGLRenderer, type Camera } from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import type { Space, Theme } from "../site-shell";
import type { AudioEnergy } from "../use-audio-energy";
import { createEarthScene } from "./earth";
import { createMoonScene } from "./moon";
import { createGalaxyScene } from "./galaxy";
import type { SceneOptions, WorldScene } from "./types";

export class WorldRenderer {
  private canvas: HTMLCanvasElement;
  private renderer: WebGLRenderer;
  private composer: EffectComposer;
  private renderPass: RenderPass;
  private bloomPass: UnrealBloomPass;
  private current: WorldScene;
  private currentSpace: Space;
  private pendingSpace: Space | null = null;
  private prepared: { space: Space; world: WorldScene } | null = null;
  private preparing: { space: Space; request: number; dispose: () => void } | null = null;
  private prepareRequest = 0;
  private energy: { current: AudioEnergy };
  private mobile: boolean;
  private reduced: boolean;
  private frameId = 0;
  private resizeId = 0;
  private running = false;
  private disposed = false;
  private lastFrame = 0;
  private transitionStart = 0;
  private transitioning = false;
  private night = 0;
  private nightTarget = 0;
  private product = 0;
  private productTarget = 0;
  private pointer = { x: 0, y: 0 };
  private pointerTarget = { x: 0, y: 0 };
  private wind = { x: 0, y: 0 };
  private windTarget = { x: 0, y: 0 };
  private lastPointer = { x: 0, y: 0 };
  private lastPointerTime = 0;

  constructor(canvas: HTMLCanvasElement, space: Space, theme: Theme, energy: { current: AudioEnergy }) {
    this.canvas = canvas;
    this.energy = energy;
    this.mobile = window.innerWidth < 640;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.night = this.nightTarget = theme === "yonder" ? 1 : 0;
    this.renderer = new WebGLRenderer({ canvas, antialias: !this.mobile, powerPreference: "high-performance" });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.mobile ? 1.15 : 1.5));
    this.currentSpace = space;
    this.current = this.createScene(space);
    this.renderPass = new RenderPass(this.current.scene, this.current.camera);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(this.renderPass);
    this.bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 0.2, 0.52, 0.86);
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(new OutputPass());
    this.resize();
    window.addEventListener("resize", this.onResize, { passive: true });
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", this.onPointerLeave, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);
    canvas.addEventListener("webglcontextlost", this.onContextLost);
    canvas.addEventListener("webglcontextrestored", this.onContextRestored);
    if (this.reduced) this.renderNow();
    else this.start();
  }

  private createScene(space: Space) {
    const options: SceneOptions = { mobile: this.mobile, onAssetReady: this.onAssetReady };
    return space === "earth" ? createEarthScene(options) : space === "moon" ? createMoonScene(options) : createGalaxyScene();
  }

  prepareSpace(space: Space) {
    if (this.disposed || space === this.currentSpace || this.prepared?.space === space || this.preparing?.space === space) return;
    const request = ++this.prepareRequest;
    this.preparing?.dispose();
    this.preparing = null;
    this.prepared?.world.dispose();
    this.prepared = null;
    const world = this.createScene(space);
    world.resize(window.innerWidth, window.innerHeight);
    let worldDisposed = false;
    const dispose = () => {
      if (worldDisposed) return;
      worldDisposed = true;
      world.dispose();
    };
    this.preparing = { space, request, dispose };
    void world.ready.then(() => {
      if (worldDisposed || this.disposed || request !== this.prepareRequest || space === this.currentSpace) {
        dispose();
        return;
      }
      return this.renderer.compileAsync(world.scene, world.camera).then(() => {
        if (worldDisposed || this.disposed || request !== this.prepareRequest || space === this.currentSpace) {
          dispose();
          return;
        }
        this.prepared = { space, world };
        this.preparing = null;
      });
    }).catch(() => {
      dispose();
      if (request === this.prepareRequest) this.preparing = null;
    });
  }

  private onAssetReady = () => {
    if (this.disposed) return;
    if (this.reduced) this.renderNow();
  };

  private onResize = () => {
    cancelAnimationFrame(this.resizeId);
    this.resizeId = requestAnimationFrame(() => this.resize());
  };

  private onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === "touch" || this.reduced) return;
    const now = performance.now();
    this.pointerTarget.x = event.clientX / window.innerWidth * 2 - 1;
    this.pointerTarget.y = -(event.clientY / window.innerHeight * 2 - 1);
    if (now - this.lastPointerTime >= 24) {
      this.windTarget.x = Math.max(-28, Math.min(28, (event.clientX - this.lastPointer.x) * 0.65));
      this.windTarget.y = Math.max(-20, Math.min(20, (event.clientY - this.lastPointer.y) * 0.65));
      this.lastPointer.x = event.clientX;
      this.lastPointer.y = event.clientY;
      this.lastPointerTime = now;
    }
  };

  private onPointerLeave = () => { this.pointerTarget.x = 0; this.pointerTarget.y = 0; };
  private onVisibility = () => document.hidden ? this.stop() : this.start();
  private onContextLost = (event: Event) => {
    event.preventDefault();
    this.stop();
    this.canvas.style.opacity = "0";
  };
  private onContextRestored = () => {
    this.canvas.style.opacity = "1";
    this.start();
  };

  private resize() {
    if (this.disposed) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.mobile = width < 640;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.mobile ? 1.15 : 1.5));
    this.renderer.setSize(width, height, false);
    this.composer.setSize(width, height);
    this.current.resize(width, height);
    if (this.reduced) this.renderNow();
  }

  private replaceScene(space: Space) {
    this.prepareRequest += 1;
    this.preparing?.dispose();
    this.preparing = null;
    const prepared = this.prepared?.space === space ? this.prepared.world : null;
    if (this.prepared && !prepared) this.prepared.world.dispose();
    this.prepared = null;
    const previous = this.current;
    this.currentSpace = space;
    this.current = prepared ?? this.createScene(space);
    this.current.resize(window.innerWidth, window.innerHeight);
    this.renderPass.scene = this.current.scene;
    this.renderPass.camera = this.current.camera as Camera;
    previous.dispose();
  }

  private draw(timeMs: number, deltaMs: number) {
    const delta = Math.min(deltaMs, 50) / 1000;
    const damping = 1 - Math.exp(-delta * 8);
    this.pointer.x += (this.pointerTarget.x - this.pointer.x) * damping;
    this.pointer.y += (this.pointerTarget.y - this.pointer.y) * damping;
    this.wind.x += (this.windTarget.x - this.wind.x) * damping;
    this.wind.y += (this.windTarget.y - this.wind.y) * damping;
    this.windTarget.x *= Math.exp(-delta * 7);
    this.windTarget.y *= Math.exp(-delta * 7);
    this.night += (this.nightTarget - this.night) * (1 - Math.exp(-delta * 5));
    this.product += (this.productTarget - this.product) * (1 - Math.exp(-delta * 5));
    let travel = 0;
    if (this.transitioning) {
      const progress = Math.min((timeMs - this.transitionStart) / 600, 1);
      if (progress >= 0.5 && this.pendingSpace) {
        const next = this.pendingSpace;
        this.pendingSpace = null;
        this.replaceScene(next);
      }
      travel = Math.sin(progress * Math.PI);
      const fade = progress < 0.5 ? 1 - progress * 1.7 : 0.15 + (progress - 0.5) * 1.7;
      this.canvas.style.opacity = String(Math.min(1, Math.max(0.15, fade)));
      if (progress >= 1) {
        this.transitioning = false;
        this.canvas.style.opacity = "1";
        travel = 0;
      }
    }
    this.bloomPass.threshold = this.currentSpace === "galaxy" ? 0.78 : 0.94;
    this.bloomPass.strength = this.currentSpace === "galaxy" ? this.night * 0.12 : this.currentSpace === "earth" ? 0.05 + this.night * 0.06 : 0.015;
    this.current.update({
      time: timeMs / 1000,
      delta,
      night: this.night,
      pointer: this.pointer,
      wind: this.wind,
      audio: this.energy.current,
      product: this.product,
      travel,
    });
    this.composer.render(delta);
  }

  private frame = (time: number) => {
    if (!this.running) return;
    const interval = 1000 / (this.transitioning ? 50 : 30);
    const elapsed = time - this.lastFrame;
    if (!this.lastFrame || elapsed >= interval) {
      const delta = this.lastFrame ? elapsed : 16.67;
      this.draw(time, delta);
      this.lastFrame = this.lastFrame ? time - (elapsed % interval) : time;
    }
    this.frameId = requestAnimationFrame(this.frame);
  };

  private start() {
    if (this.running || this.reduced || this.disposed || document.hidden) return;
    this.running = true;
    this.lastFrame = 0;
    this.frameId = requestAnimationFrame(this.frame);
  }

  private stop() {
    this.running = false;
    cancelAnimationFrame(this.frameId);
  }

  private renderNow() {
    if (this.disposed) return;
    this.draw(performance.now(), 16.67);
  }

  setTheme(theme: Theme) {
    this.nightTarget = theme === "yonder" ? 1 : 0;
    if (this.reduced) {
      this.night = this.nightTarget;
      this.renderNow();
    }
  }

  setProductMode(active: boolean) {
    this.productTarget = active ? 1 : 0;
    if (this.reduced) {
      this.product = this.productTarget;
      this.renderNow();
    }
  }

  transitionTo(space: Space) {
    if (space === this.currentSpace && !this.pendingSpace) return;
    if (this.reduced) {
      this.replaceScene(space);
      this.pendingSpace = null;
      this.renderNow();
      return;
    }
    this.pendingSpace = space;
    this.prepareSpace(space);
    this.transitionStart = performance.now();
    this.transitioning = true;
    this.start();
  }

  dispose() {
    this.disposed = true;
    this.stop();
    cancelAnimationFrame(this.resizeId);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointermove", this.onPointerMove);
    document.documentElement.removeEventListener("pointerleave", this.onPointerLeave);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.canvas.removeEventListener("webglcontextrestored", this.onContextRestored);
    this.prepareRequest += 1;
    this.preparing?.dispose();
    this.preparing = null;
    this.prepared?.world.dispose();
    this.prepared = null;
    this.current.dispose();
    this.composer.dispose();
    this.bloomPass.dispose();
    this.renderer.dispose();
  }
}

export function createWorldRenderer(canvas: HTMLCanvasElement, space: Space, theme: Theme, energy: { current: AudioEnergy }) {
  return new WorldRenderer(canvas, space, theme, energy);
}
