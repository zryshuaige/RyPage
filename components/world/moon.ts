import { AdditiveBlending, AmbientLight, BufferGeometry, Color, DirectionalLight, Float32BufferAttribute, LinearFilter, Mesh, MeshStandardMaterial, PerspectiveCamera, Points, PointsMaterial, Scene, SphereGeometry, SRGBColorSpace, Texture, TextureLoader } from "three";
import type { SceneOptions, WorldFrame, WorldScene } from "./types";
import { disposeScene } from "./utils";

const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
type MoonTextureName = "moon-albedo.webp" | "moon-elevation.png";
const textureCache = new Map<MoonTextureName, Promise<Texture>>();

function loadMoonTexture(name: MoonTextureName) {
  const cached = textureCache.get(name);
  if (cached) return cached;
  const loading = new TextureLoader().loadAsync(`${publicBasePath}/textures/${name}`).then((texture) => {
    texture.anisotropy = 8;
    if (name === "moon-albedo.webp") texture.colorSpace = SRGBColorSpace;
    else {
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
    }
    return texture;
  }).catch((error: unknown) => {
    textureCache.delete(name);
    throw error;
  });
  textureCache.set(name, loading);
  return loading;
}

export function createMoonScene({ mobile, onAssetReady }: SceneOptions): WorldScene {
  const scene = new Scene();
  scene.background = new Color("#020304");
  const camera = new PerspectiveCamera(46, 1, 0.1, 120);
  camera.position.set(0, 0, 10.5);

  const material = new MeshStandardMaterial({ color: "#ffffff", roughness: 1, metalness: 0, bumpScale: 0.045 });
  const moon = new Mesh(new SphereGeometry(3.05, mobile ? 96 : 160, mobile ? 64 : 128), material);
  moon.position.set(1.9, -0.35, 0);
  moon.rotation.set(0.08, -0.7, -0.03);
  scene.add(moon);

  let disposed = false;
  const ready = Promise.all([loadMoonTexture("moon-albedo.webp"), loadMoonTexture("moon-elevation.png")]).then(([albedo, elevation]) => {
    if (disposed) return;
    material.map = albedo;
    material.bumpMap = elevation;
    material.needsUpdate = true;
    onAssetReady();
  });
  void ready.catch(() => {});

  const sun = new DirectionalLight("#f3f5f7", 3.2);
  sun.position.set(-5, 4, 6);
  const rim = new DirectionalLight("#799bc2", 0.22);
  rim.position.set(5, 1, -3);
  const ambient = new AmbientLight("#7f96b2", 0.045);
  scene.add(sun, rim, ambient);

  const starPositions = new Float32Array((mobile ? 180 : 360) * 3);
  for (let index = 0; index < starPositions.length; index += 3) {
    const x = Math.sin(index * 91.17) * 43758.5453;
    const y = Math.sin(index * 47.33 + 2) * 17331.713;
    const z = Math.sin(index * 13.71 + 8) * 27131.913;
    starPositions[index] = (x - Math.floor(x) - 0.5) * 75;
    starPositions[index + 1] = (y - Math.floor(y) - 0.5) * 48;
    starPositions[index + 2] = -22 - (z - Math.floor(z)) * 35;
  }
  const starGeometry = new BufferGeometry();
  starGeometry.setAttribute("position", new Float32BufferAttribute(starPositions, 3));
  const starMaterial = new PointsMaterial({ color: "#c8d5e6", size: 0.055, transparent: true, opacity: 0.32, depthWrite: false, blending: AdditiveBlending });
  scene.add(new Points(starGeometry, starMaterial));
  const nightSurface = new Color("#b3c1d1");
  const daySpace = new Color("#e4f0f7");
  const nightSpace = new Color("#020304");
  let baseScale = mobile ? 0.32 : 0.74;

  return {
    scene,
    camera,
    ready,
    update(frame: WorldFrame) {
      (scene.background as Color).copy(daySpace).lerp(nightSpace, frame.night);
      material.color.set("#c5d3dd").lerp(nightSurface, frame.night);
      sun.intensity = 3.2 - frame.night * 1.3;
      rim.intensity = 0.22 + frame.night * 0.25 + frame.audio.low * frame.audio.active * 0.08;
      ambient.intensity = 0.045 + frame.night * 0.035;
      starMaterial.opacity = frame.night * 0.68 + frame.audio.high * frame.audio.active * 0.08;
      moon.rotation.y = -0.7 + frame.time * 0.004 + frame.pointer.x * 0.07;
      moon.rotation.x = 0.08 + frame.pointer.y * 0.035;
      moon.scale.setScalar(baseScale * (1 + frame.travel * 0.1));
      camera.position.x = frame.pointer.x * 0.2;
      camera.position.y = frame.pointer.y * 0.12;
      camera.position.z = 10.5 + frame.travel * 0.65;
      camera.lookAt(0, 0, 0);
    },
    resize(width: number, height: number) {
      camera.aspect = width / height;
      camera.fov = width < 640 ? 58 : 46;
      camera.updateProjectionMatrix();
      baseScale = width < 640 ? 0.32 : 0.74;
      moon.position.set(width < 640 ? 1.5 : 2.1, width < 640 ? -0.25 : 1.12, 0);
    },
    dispose() {
      disposed = true;
      disposeScene(scene);
    },
  };
}
