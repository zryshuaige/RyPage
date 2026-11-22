import { Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2 } from "three";
import type { WorldFrame, WorldScene } from "./types";
import { disposeScene, glslNoise } from "./utils";

export function createGalaxyScene(): WorldScene {
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 2);
  camera.position.z = 1;
  const uniforms = {
    uResolution: { value: new Vector2(1, 1) },
    uCenter: { value: new Vector2(0.4, 0.08) },
    uTime: { value: 0 },
    uNight: { value: 0 },
    uPointer: { value: new Vector2() },
    uWind: { value: new Vector2() },
    uLow: { value: 0 },
    uHigh: { value: 0 },
    uProduct: { value: 0 },
    uTravel: { value: 0 },
  };
  const material = new ShaderMaterial({
    depthWrite: false,
    depthTest: false,
    uniforms,
    vertexShader: `void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: `
      ${glslNoise}
      uniform vec2 uResolution;
      uniform vec2 uCenter;
      uniform float uTime;
      uniform float uNight;
      uniform vec2 uPointer;
      uniform vec2 uWind;
      uniform float uLow;
      uniform float uHigh;
      uniform float uProduct;
      uniform float uTravel;
      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
        vec2 p = uv * (1.0 + uTravel * 0.12) + uPointer * 0.045 + uWind * 0.005;
        float time = uTime * 0.007;
        float backgroundNoise = fbm(p * 2.1 + vec2(time, -time * 0.4));
        vec3 dayBase = mix(vec3(0.72, 0.79, 0.88), vec3(0.55, 0.65, 0.81), smoothstep(-0.7, 0.8, uv.y));
        vec3 nightBase = mix(vec3(0.002, 0.004, 0.013), vec3(0.005, 0.012, 0.032), smoothstep(-0.8, 0.8, uv.y));
        vec3 base = mix(dayBase, nightBase, uNight);
        base += mix(vec3(0.04, 0.06, 0.1), vec3(0.015, 0.025, 0.06), uNight) * (backgroundNoise - 0.5);

        vec2 q = p - uCenter;
        q = mat2(0.86, -0.5, 0.5, 0.86) * q;
        q.y *= 1.52;
        float radius = length(q);
        float angle = atan(q.y, q.x);
        float detail = fbm(q * 4.2 + vec2(time * 0.2, 8.0));
        float phase = angle - log(radius + 0.075) * 3.35 + (detail - 0.5) * 0.32 + time * 0.035;
        float arms = pow(0.5 + 0.5 * cos(phase * 2.0), 7.0);
        float radial = exp(-radius * 3.25) * smoothstep(0.025, 0.12, radius);
        float outer = exp(-radius * 1.7) * 0.2;
        float core = exp(-radius * 23.0);
        float coreHalo = exp(-radius * 6.5);
        float dust = pow(0.5 + 0.5 * cos(phase * 2.0 + 0.52), 13.0) * exp(-radius * 3.0);
        float quiet = mix(0.42, 1.0, smoothstep(-0.55, 0.25, uv.x));
        float visibility = quiet * (1.0 - uProduct * 0.62);
        vec3 armColor = mix(vec3(0.09, 0.25, 0.47), vec3(0.1, 0.32, 0.62), uNight);
        vec3 armSecondary = mix(vec3(0.31, 0.2, 0.46), vec3(0.34, 0.18, 0.55), uNight);
        vec3 color = base;
        float armGrain = fbm(q * 12.0 + detail);
        float armLight = arms * radial * (0.45 + detail * 0.65 + armGrain * 0.55) + outer * backgroundNoise;
        color = mix(color, mix(armColor, armSecondary, detail), clamp(armLight * visibility * mix(1.55, 1.3, uNight), 0.0, 0.9));
        color *= 1.0 - dust * visibility * mix(0.32, 0.62, uNight);
        color += mix(vec3(0.24, 0.4, 0.62), vec3(0.28, 0.52, 0.88), uNight) * coreHalo * visibility * (0.3 + uLow * 0.18);
        vec3 coreColor = mix(vec3(0.1, 0.2, 0.38), vec3(0.86, 0.92, 1.0), uNight);
        color = mix(color, coreColor, clamp(core * visibility * mix(0.85, 1.25, uNight) * (1.0 + uLow * 0.35), 0.0, 1.0));

        vec2 grid = gl_FragCoord.xy / 6.5;
        vec2 id = floor(grid);
        vec2 cell = fract(grid) - 0.5;
        float seed = hash21(id);
        vec2 offset = vec2(hash21(id + 2.7), hash21(id + 7.3)) - 0.5;
        float distanceToStar = length(cell - offset * 0.72);
        float star = smoothstep(0.13, 0.0, distanceToStar) * step(mix(0.955, 0.968, uNight), seed);
        float brightStar = smoothstep(0.25, 0.0, distanceToStar) * step(0.995, seed);
        float twinkle = 0.72 + 0.28 * sin(uTime * (0.4 + seed) + seed * 50.0);
        vec3 starColor = mix(vec3(0.12, 0.22, 0.42), vec3(0.82, 0.91, 1.0), uNight);
        color = mix(color, starColor, clamp((star * 0.88 + brightStar) * twinkle * (0.85 + uHigh * 0.35) * (1.0 - uProduct * 0.45), 0.0, 1.0));
        vec2 fineId = floor(gl_FragCoord.xy / 4.5);
        vec2 fineCell = fract(gl_FragCoord.xy / 4.5) - 0.5;
        float fineSeed = hash21(fineId + 19.0);
        float fineStar = smoothstep(0.12, 0.0, length(fineCell)) * step(0.986, fineSeed) * exp(-radius * 2.3);
        color = mix(color, starColor, fineStar * 0.55 * (1.0 - uProduct * 0.5));
        float vignette = 1.0 - smoothstep(0.42, 1.35, length(uv)) * mix(0.05, 0.34, uNight);
        gl_FragColor = vec4(color * vignette, 1.0);
      }
    `,
  });
  scene.add(new Mesh(new PlaneGeometry(2, 2), material));

  return {
    scene,
    camera,
    update(frame: WorldFrame) {
      uniforms.uTime.value = frame.time;
      uniforms.uNight.value = frame.night;
      uniforms.uPointer.value.set(frame.pointer.x, frame.pointer.y);
      uniforms.uWind.value.set(frame.wind.x, frame.wind.y);
      uniforms.uLow.value = frame.audio.low * frame.audio.active;
      uniforms.uHigh.value = frame.audio.high * frame.audio.active;
      uniforms.uProduct.value = frame.product;
      uniforms.uTravel.value = frame.travel;
    },
    resize(width: number, height: number) {
      uniforms.uResolution.value.set(width, height);
      uniforms.uCenter.value.set(width < 640 ? 0.1 : 0.4, width < 640 ? -0.1 : 0.08);
    },
    dispose() { disposeScene(scene); },
  };
}
