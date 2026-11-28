import { AdditiveBlending, BackSide, BufferGeometry, Float32BufferAttribute, Mesh, PerspectiveCamera, PlaneGeometry, Points, PointsMaterial, Scene, ShaderMaterial, SphereGeometry, Vector3, Vector4 } from "three";
import { disposeScene, glslNoise } from "./utils";
import type { SceneOptions, WorldFrame, WorldScene } from "./types";

const shorelineBase = -13;
const shoreline = `
float shoreline(float x) {
  float coast = x + 3.0;
  return ${shorelineBase.toFixed(1)} + coast * coast * 0.085 + sin(x * 0.65) * 0.11 + sin(x * 1.7) * 0.035;
}
`;

const swash = `
vec4 swashState(float x, float time) {
  float phase = fract(time * 0.13 + sin(x * 0.12) * 0.025);
  float primary = smoothstep(0.0, 0.18, phase) * (1.0 - smoothstep(0.18, 1.0, phase));
  float secondary = smoothstep(0.0, 0.24, fract(time * 0.17 + 0.43)) * (1.0 - smoothstep(0.24, 1.0, fract(time * 0.17 + 0.43)));
  float alongshore = sin(x * 0.43 + time * 0.25) * 0.12 + sin(x * 1.1 - time * 0.17) * 0.04;
  float reach = 0.18 + primary * 2.0 + secondary * 0.38 + alongshore * primary;
  return vec4(shoreline(x) + reach, primary, phase, secondary);
}
`;

function shorelineAt(x: number) {
  const coast = x + 3;
  return shorelineBase + coast * coast * 0.085 + Math.sin(x * 0.65) * 0.11 + Math.sin(x * 1.7) * 0.035;
}

const skyRadiance = `
vec3 skyRadiance(vec3 direction, float celestial) {
  vec3 dir = normalize(direction);
  float height = max(dir.y, 0.0);
  vec3 day = mix(vec3(0.72, 0.84, 0.86), vec3(0.16, 0.43, 0.66), pow(height, 0.42));
  vec3 night = mix(vec3(0.04, 0.07, 0.11), vec3(0.004, 0.011, 0.029), pow(height, 0.5));
  vec3 color = mix(day, night, uNight);
  vec3 sourceDirection = normalize(mix(vec3(0.55, 0.34, -0.76), vec3(0.42, 0.22, -0.88), uNight));
  float source = max(dot(dir, sourceDirection), 0.0);
  color += mix(vec3(0.32, 0.25, 0.15) * pow(source, 12.0) * 0.05, vec3(0.18, 0.28, 0.42) * pow(source, 30.0) * 0.18, uNight);
  float disc = smoothstep(0.999965, 0.99999, source);
  color += vec3(0.72, 0.84, 1.0) * disc * uNight * 0.75 * celestial;

  vec2 cloudUv = dir.xz / (dir.y + 0.24) * 1.15;
  cloudUv += vec2(uTime * 0.004, uTime * 0.001);
  float warp = fbm(cloudUv * 0.7);
  float density = fbm(cloudUv * 1.35 + vec2(warp * 1.5, -warp));
  density += (noise2(cloudUv * 4.2) - 0.5) * 0.08;
  float clouds = smoothstep(0.53, 0.67, density);
  clouds *= smoothstep(-0.02, 0.1, dir.y) * (1.0 - smoothstep(0.4, 0.95, dir.y));
  clouds *= mix(0.68, 0.3, uNight);
  vec3 cloudColor = mix(vec3(0.96, 0.97, 0.94), vec3(0.1, 0.16, 0.23), uNight);
  return mix(color, cloudColor, clouds);
}
`;

const vertexWorld = `
varying vec3 vWorldPosition;
void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

export function createEarthScene({ mobile }: SceneOptions): WorldScene {
  const scene = new Scene();
  const camera = new PerspectiveCamera(48, 1, 0.1, 1500);
  camera.position.set(0, 3.7, 12);

  const shared = {
    uTime: { value: 0 },
    uNight: { value: 0 },
    uAudio: { value: 0 },
  };
  const sky = new Mesh(new SphereGeometry(85, 32, 20), new ShaderMaterial({
    side: BackSide,
    depthWrite: false,
    uniforms: shared,
    vertexShader: `varying vec3 vDirection; void main() { vDirection = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      ${glslNoise}
      varying vec3 vDirection;
      uniform float uTime;
      uniform float uNight;
      ${skyRadiance}
      void main() { gl_FragColor = vec4(skyRadiance(vDirection, 1.0), 1.0); }
    `,
  }));
  scene.add(sky);

  const sandSegments = mobile ? 100 : 150;
  const sandGeometry = new PlaneGeometry(220, 180, sandSegments, sandSegments);
  sandGeometry.rotateX(-Math.PI / 2);
  sandGeometry.translate(0, 0, -50);
  const positions = sandGeometry.attributes.position;
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const z = positions.getZ(index);
    const distance = z - shorelineAt(x);
    const height = -0.035 + Math.max(distance, 0) * 0.068 + Math.min(distance, 0) * 0.045;
    const undulation = Math.sin(x * 0.31 + z * 0.16) * Math.sin(z * 0.27) * 0.035 * Math.min(Math.max(distance / 5, 0), 1);
    positions.setY(index, height + undulation);
  }
  sandGeometry.computeVertexNormals();
  const sand = new Mesh(sandGeometry, new ShaderMaterial({
    uniforms: shared,
    vertexShader: `
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        vNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      ${glslNoise}
      ${shoreline}
      ${swash}
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      uniform float uTime;
      uniform float uNight;
      void main() {
        vec2 p = vWorldPosition.xz;
        float distanceToWater = p.y - shoreline(p.x);
        vec4 wash = swashState(p.x, uTime);
        float dry = smoothstep(0.45 + wash.y * 0.7, 5.0 + wash.y * 1.2, distanceToWater);
        float grain = noise2(p * 22.0) * 0.025 + noise2(p * 1.4) * 0.035;
        vec3 wetDay = vec3(0.43, 0.51, 0.47);
        vec3 dryDay = vec3(0.72, 0.65, 0.51);
        vec3 wetNight = vec3(0.045, 0.085, 0.105);
        vec3 dryNight = vec3(0.12, 0.16, 0.19);
        vec3 color = mix(mix(wetDay, dryDay, dry), mix(wetNight, dryNight, dry), uNight);
        vec3 lightDirection = normalize(mix(vec3(0.55, 0.7, 0.4), vec3(0.58, 0.6, -0.3), uNight));
        float diffuse = 0.84 + max(dot(normalize(vNormal), lightDirection), 0.0) * 0.16;
        color *= diffuse + grain;
        if (distanceToWater < 5.0) {
          float edge = p.y - wash.x;
          float antialias = max(0.025, fwidth(edge) * 1.25);
          float film = (1.0 - smoothstep(-antialias, antialias, edge)) * smoothstep(-0.08, 0.12, distanceToWater);
          vec3 filmColor = mix(vec3(0.32, 0.47, 0.5), vec3(0.035, 0.09, 0.12), uNight);
          color = mix(color, filmColor, film * 0.68);
          float retreat = smoothstep(0.18, 0.34, wash.z) * (1.0 - wash.y);
          float residue = exp(-pow((distanceToWater - 1.35) / 0.75, 2.0)) * retreat * smoothstep(0.0, 0.12, edge);
          float foamNoise = noise2(p * 2.4 + vec2(uTime * 0.035, 0.0));
          float width = max(0.12, fwidth(edge) * 1.5);
          float foam = exp(-pow(edge / width, 2.0)) * smoothstep(-0.02, 0.12, distanceToWater);
          foam *= (0.25 + foamNoise * 0.75) * (0.35 + wash.y * 0.65);
          foam += residue * smoothstep(0.45, 0.8, foamNoise) * 0.28;
          vec3 foamColor = mix(vec3(0.86, 0.91, 0.87), vec3(0.24, 0.36, 0.43), uNight);
          color = mix(color, foamColor, clamp(foam, 0.0, 0.78));
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float glint = pow(max(dot(reflect(-lightDirection, normalize(vNormal)), viewDirection), 0.0), 90.0);
          color += mix(vec3(0.32, 0.38, 0.36), vec3(0.08, 0.13, 0.18), uNight) * glint * film * 0.35;
        }
        float haze = smoothstep(45.0, 130.0, length(p));
        color = mix(color, mix(vec3(0.72, 0.84, 0.86), vec3(0.04, 0.07, 0.11), uNight), haze);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  }));
  scene.add(sand);

  const ripples = Array.from({ length: 4 }, () => new Vector4(0, 0, -100, 0));
  const water = new Mesh(new PlaneGeometry(2400, 2400), new ShaderMaterial({
    uniforms: { ...shared, uRipples: { value: ripples } },
    vertexShader: vertexWorld,
    fragmentShader: `
      ${glslNoise}
      varying vec3 vWorldPosition;
      uniform float uTime;
      uniform float uNight;
      uniform float uAudio;
      uniform vec4 uRipples[4];
      ${shoreline}
      ${swash}
      ${skyRadiance}

      void main() {
        vec2 p = vWorldPosition.xz;
        float cameraDistance = distance(cameraPosition, vWorldPosition);
        float detail = 1.0 - smoothstep(24.0, 160.0, cameraDistance);
        float energy = 1.0 + uAudio * 0.12;
        vec2 slope = vec2(0.0);
        slope += vec2(0.82, 0.57) * cos(dot(p, vec2(0.82, 0.57)) * 1.7 + uTime * 0.65) * 0.021;
        slope += vec2(-0.36, 0.93) * cos(dot(p, vec2(-0.36, 0.93)) * 2.6 - uTime * 0.48) * 0.012;
        slope += vec2(0.96, -0.28) * cos(dot(p, vec2(0.96, -0.28)) * 4.1 + uTime * 0.82) * 0.006;
        slope += vec2(-0.71, -0.7) * cos(dot(p, vec2(-0.71, -0.7)) * 6.3 - uTime * 0.7) * 0.003;
        slope *= detail * energy;
        float nearShore = 1.0 - smoothstep(0.0, 7.0, shoreline(p.x) - p.y);
        slope += vec2(0.18, 0.82) * cos((shoreline(p.x) - p.y) * 3.2 - uTime * 1.6) * 0.012 * nearShore;

        for (int i = 0; i < 4; i++) {
          float age = uTime - uRipples[i].z;
          float alive = step(0.0, age) * (1.0 - step(4.0, age));
          vec2 offset = p - uRipples[i].xy;
          float distanceToRing = length(offset) - age * 0.85;
          float ring = exp(-distanceToRing * distanceToRing * 7.0) * exp(-age * 0.8) * alive;
          slope += normalize(offset + vec2(0.0001)) * ring * 0.035 * uRipples[i].w;
        }

        vec3 normal = normalize(vec3(-slope.x, 1.0, -slope.y));
        vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
        vec3 reflectionDirection = reflect(-viewDirection, normal);
        vec3 reflection = skyRadiance(reflectionDirection, 0.25);
        vec4 swashData = swashState(p.x, uTime);
        float shoreDistance = swashData.x - p.y;
        float depth = smoothstep(0.0, 28.0, shoreDistance);
        vec3 shallow = mix(vec3(0.17, 0.37, 0.37), vec3(0.018, 0.052, 0.073), uNight);
        vec3 deep = mix(vec3(0.025, 0.17, 0.24), vec3(0.004, 0.018, 0.035), uNight);
        vec3 waterColor = mix(shallow, deep, depth);
        float fresnel = 0.035 + 0.965 * pow(1.0 - max(dot(normal, viewDirection), 0.0), 5.0);
        vec3 color = mix(waterColor, reflection, clamp(fresnel * 1.35, 0.0, 1.0));

        vec3 lightDirection = normalize(mix(vec3(0.55, 0.34, -0.76), vec3(0.42, 0.22, -0.88), uNight));
        float glint = pow(max(dot(reflect(-lightDirection, normal), viewDirection), 0.0), mix(280.0, 120.0, uNight));
        color += mix(vec3(1.0, 0.87, 0.62), vec3(0.56, 0.75, 1.0), uNight) * glint * (mix(0.42, 0.1, uNight) + uAudio * 0.03);

        float shoreNoise = (noise2(p * 0.8 + vec2(uTime * 0.035, 0.0)) - 0.5) * 0.32;
        float edgeDistance = p.y - swashData.x + shoreNoise;
        float foamWidth = max(0.16, fwidth(edgeDistance) * 1.4);
        float foam = exp(-pow(edgeDistance / foamWidth, 2.0));
        foam *= (0.18 + noise2(p * 2.1 + vec2(uTime * 0.05, 0.0)) * 0.82) * (0.35 + swashData.y * 0.65);
        foam += exp(-pow((edgeDistance + 0.85) / 0.22, 2.0)) * (0.04 + noise2(p * 1.3) * 0.12) * (0.4 + swashData.w);
        color = mix(color, mix(vec3(0.86, 0.91, 0.87), vec3(0.24, 0.36, 0.43), uNight), clamp(foam, 0.0, 0.72));
        float haze = smoothstep(90.0, 650.0, cameraDistance);
        color = mix(color, mix(vec3(0.42, 0.64, 0.72), vec3(0.025, 0.05, 0.08), uNight), haze * 0.88);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  }));
  water.rotation.x = -Math.PI / 2;
  scene.add(water);

  const starPositions = new Float32Array((mobile ? 150 : 260) * 3);
  for (let index = 0; index < starPositions.length; index += 3) {
    const seed = index + 1;
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    const y = Math.sin(seed * 78.233) * 24634.6345;
    const z = Math.sin(seed * 39.425) * 56445.234;
    const direction = new Vector3(x - Math.floor(x) - 0.5, Math.max(0.08, y - Math.floor(y)), -(z - Math.floor(z)) - 0.2).normalize().multiplyScalar(75);
    starPositions[index] = direction.x;
    starPositions[index + 1] = direction.y;
    starPositions[index + 2] = direction.z;
  }
  const starGeometry = new BufferGeometry();
  starGeometry.setAttribute("position", new Float32BufferAttribute(starPositions, 3));
  const starMaterial = new PointsMaterial({ color: "#d5e8fa", size: 0.09, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending });
  scene.add(new Points(starGeometry, starMaterial));

  const ray = new Vector3();
  const hit = new Vector3();
  const lastRipple = new Vector3(100, 0, 100);
  let rippleIndex = 0;
  let lastRippleTime = -1;

  return {
    scene,
    camera,
    ready: Promise.resolve(),
    update(frame: WorldFrame) {
      shared.uTime.value = frame.time;
      shared.uNight.value = frame.night;
      shared.uAudio.value = frame.audio.low * frame.audio.active;
      starMaterial.opacity = frame.night * 0.72;
      camera.position.set(frame.pointer.x * 0.32, 3.7 + frame.pointer.y * 0.12, 12 + frame.travel * 0.5);
      camera.lookAt(frame.pointer.x * 0.05, 7.5 + frame.pointer.y * 0.1, -18);
      camera.updateMatrixWorld();

      ray.set(frame.pointer.x, frame.pointer.y, 0.5).unproject(camera).sub(camera.position).normalize();
      const distance = ray.y < -0.015 ? -camera.position.y / ray.y : -1;
      if (distance > 0 && distance < 100) {
        hit.copy(ray).multiplyScalar(distance).add(camera.position);
        if (hit.z < shorelineAt(hit.x) && hit.distanceTo(lastRipple) > 0.55 && frame.time - lastRippleTime > 0.16) {
          ripples[rippleIndex].set(hit.x, hit.z, frame.time, 1);
          rippleIndex = (rippleIndex + 1) % ripples.length;
          lastRipple.copy(hit);
          lastRippleTime = frame.time;
        }
      }
    },
    resize(width: number, height: number) {
      camera.aspect = width / height;
      camera.fov = width < 640 ? 58 : 48;
      camera.updateProjectionMatrix();
    },
    dispose() { disposeScene(scene); },
  };
}
