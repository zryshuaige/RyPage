import { Material, Scene, type BufferGeometry, type Object3D } from "three";

export const glslNoise = `
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + 1.0), f.x), f.y);
}
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rotation = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise2(p);
    p = rotation * p * 2.03 + 13.7;
    amplitude *= 0.5;
  }
  return value;
}
`;

export function disposeScene(scene: Scene) {
  scene.traverse((object: Object3D) => {
    if ("geometry" in object) (object.geometry as BufferGeometry).dispose();
    if ("material" in object) {
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material: Material) => material.dispose());
    }
  });
}
