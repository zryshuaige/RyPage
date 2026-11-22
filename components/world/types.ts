import type { Camera, Scene } from "three";
import type { AudioEnergy } from "../use-audio-energy";

export type WorldFrame = {
  time: number;
  delta: number;
  night: number;
  pointer: { x: number; y: number };
  wind: { x: number; y: number };
  audio: AudioEnergy;
  product: number;
  travel: number;
};

export type WorldScene = {
  scene: Scene;
  camera: Camera;
  update: (frame: WorldFrame) => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
};

export type SceneOptions = {
  mobile: boolean;
  onAssetReady: () => void;
};
