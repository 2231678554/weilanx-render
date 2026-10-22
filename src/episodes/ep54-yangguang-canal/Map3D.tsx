import React, {useEffect, useMemo, useState} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import {MAP_H, MAP_W, proj} from './geo';
import {LF} from '../../library/lamplight/theme';

/**
 * 真三维地形：真实高程（1024×768 网格，uint16，height-china.bin）+ 贴图 terrain3d-china.jpg（河流、海岸已烘进去）。
 * 世界坐标：x = 地图像素 - 2048，z = 地图像素 - 1536，y = 高度（像素，含垂直夸张）。由 /data/geo/bake3d.py 生成。
 */
export const GW = 1024, GH = 768;
export const EXAG = 0.075; // 每 1 米抬多少地图像素（真实约 0.001，夸张约 75 倍让山体立起来）
const MAXM = 6000;

let HEIGHTS: Uint16Array | null = null;
let TEX: THREE.Texture | null = null;
let LAND: HTMLImageElement | null = null;
export const useTerrainData = () => {
  const [ready, setReady] = useState(!!(HEIGHTS && TEX && LAND));
  const [handle] = useState(() => (HEIGHTS && TEX && LAND ? null : delayRender('terrain3d')));
  useEffect(() => {
    if (!handle) return;
    Promise.all([
      fetch(staticFile('images/lamplight/height-china.bin')).then((r) => r.arrayBuffer()),
      new Promise<THREE.Texture>((res, rej) => new THREE.TextureLoader().load(staticFile('images/lamplight/terrain3d-china.jpg'), res, undefined, rej)),
      new Promise<HTMLImageElement>((res, rej) => {
        const im = new Image();
        im.onload = () => res(im);
        im.onerror = rej;
        im.src = staticFile('images/lamplight/land-china.png');
      }),
    ])
      .then(([buf, tex, land]) => {
        LAND = land;
        HEIGHTS = new Uint16Array(buf);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        TEX = tex;
        setReady(true);
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [handle]);
  return ready;
};

/** 地图像素处的高度（世界单位） */
export const heightAt = (px: number, py: number) => {
  if (!HEIGHTS) return 0;
  const gx = Math.min(GW - 1.001, Math.max(0, (px / MAP_W) * GW - 0.5));
  const gy = Math.min(GH - 1.001, Math.max(0, (py / MAP_H) * GH - 0.5));
  const x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
  const h = (x: number, y: number) => HEIGHTS![y * GW + x];
  const v = h(x0, y0) * (1 - fx) * (1 - fy) + h(x0 + 1, y0) * fx * (1 - fy) + h(x0, y0 + 1) * (1 - fx) * fy + h(x0 + 1, y0 + 1) * fx * fy;
  return (v / 65535) * MAXM * EXAG;
};
export const world = (lon: number, lat: number, lift = 0): THREE.Vector3 => {
  const [px, py] = proj(lon, lat);
  return new THREE.Vector3(px - MAP_W / 2, heightAt(px, py) + lift, py - MAP_H / 2);
};

/** 镜头：看向 (lon, lat)，距离 dist（地图像素），俯角 pitch（90 = 正俯视），朝向 yaw（0 = 朝北看） */
export type Cam3 = {lon: number; lat: number; dist: number; pitch: number; yaw?: number; fov?: number};
export const makeCamera = (c: Cam3) => {
  const cam = new THREE.PerspectiveCamera(c.fov ?? 34, 1920 / 1080, 5, 20000);
  const t = world(c.lon, c.lat);
  const p = (c.pitch * Math.PI) / 180, y = ((c.yaw ?? 0) * Math.PI) / 180;
  const off = new THREE.Vector3(Math.sin(y) * Math.cos(p), Math.sin(p), Math.cos(y) * Math.cos(p)).multiplyScalar(c.dist);
  cam.position.copy(t).add(off);
  cam.up.set(0, 1, 0);
  if (c.pitch > 89.5) cam.up.set(-Math.sin(y), 0, -Math.cos(y));
  cam.lookAt(t);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return cam;
};
/** 三维点 → 画面像素（1920×1080） */
export const project = (c: Cam3, lon: number, lat: number, lift = 4): [number, number] => {
  const v = world(lon, lat, lift).project(makeCamera(c));
  return [(v.x + 1) * 960, (1 - v.y) * 540];
};

const CamSync: React.FC<{c: Cam3}> = ({c}) => {
  const {camera} = useThree();
  const m = makeCamera(c);
  const pc = camera as THREE.PerspectiveCamera;
  pc.fov = m.fov; pc.near = m.near; pc.far = m.far; pc.aspect = m.aspect;
  pc.position.copy(m.position); pc.up.copy(m.up); pc.quaternion.copy(m.quaternion);
  pc.updateProjectionMatrix(); pc.updateMatrixWorld();
  return null;
};

let GEO_: THREE.BufferGeometry | null = null;
const terrainGeo = () => {
  if (GEO_) return GEO_;
  const g = new THREE.PlaneGeometry(MAP_W, MAP_H, GW - 1, GH - 1);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) pos.setY(j * GW + i, (HEIGHTS![j * GW + i] / 65535) * MAXM * EXAG);
  g.computeVertexNormals();
  GEO_ = g;
  return g;
};

/** 贴在地形上的一层半透明彩绘（疆域着色、箭头）：paint 在 2048×1536 画布上画，px 把经纬度换成画布坐标；默认只留陆地 */
export type Px = (lon: number, lat: number) => [number, number];
export const Drape: React.FC<{paint: (g: CanvasRenderingContext2D, px: Px) => void; dep: string; opacity?: number; landOnly?: boolean}> = ({paint, dep, opacity = 1, landOnly = true}) => {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 2048;
    c.height = 1536;
    const g = c.getContext('2d')!;
    const k = 2048 / MAP_W;
    paint(g, (lo, la) => {
      const [x, y] = proj(lo, la);
      return [x * k, y * k];
    });
    if (landOnly && LAND) {
      g.globalCompositeOperation = 'destination-in';
      g.drawImage(LAND, 0, 0, 2048, 1536);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep]);
  return (
    <mesh geometry={terrainGeo()} position={[0, 1.5, 0]} renderOrder={2}>
      <meshStandardMaterial map={tex} transparent opacity={opacity} depthWrite={false} polygonOffset polygonOffsetFactor={-4} roughness={1} metalness={0} />
    </mesh>
  );
};

const Terrain: React.FC = () => {
  const geo = terrainGeo();
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial map={TEX!} roughness={1} metalness={0} />
    </mesh>
  );
};

/** 沿地形走的发光金线：pts 经纬度，p 0–1 */
export const GoldTube: React.FC<{pts: [number, number][]; p: number; r?: number; color?: string}> = ({pts, p, r = 5, color = '#ffd070'}) => {
  const full = useMemo(() => {
    const raw = pts.map(([lo, la]) => world(lo, la, 0));
    const c0 = new THREE.CatmullRomCurve3(raw);
    const N = 240;
    return Array.from({length: N + 1}, (_, i) => {
      const v = c0.getPoint(i / N);
      v.y = heightAt(v.x + MAP_W / 2, v.z + MAP_H / 2) + r * 1.6 + 2;
      return v;
    });
  }, [pts, r]);
  if (p <= 0.005) return null;
  const n = Math.max(2, Math.round(p * (full.length - 1)) + 1);
  const curve = new THREE.CatmullRomCurve3(full.slice(0, n));
  const seg = Math.max(8, n * 2);
  const head = full[n - 1];
  return (
    <group>
      <mesh geometry={new THREE.TubeGeometry(curve, seg, r * 3, 10)}>
        <meshBasicMaterial color="#ffb040" transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh geometry={new THREE.TubeGeometry(curve, seg, r, 10)}>
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position={head}>
        <sphereGeometry args={[r * 2.2, 16, 12]} />
        <meshBasicMaterial color="#fff0b8" toneMapped={false} />
      </mesh>
    </group>
  );
};

/** 城市标桩：金色小柱 + 顶珠 */
export const Pin3: React.FC<{at: [number, number]; big?: boolean; o?: number}> = ({at, big, o = 1}) => {
  const base = world(at[0], at[1], 0);
  const h = big ? 34 : 24;
  if (o <= 0) return null;
  return (
    <group position={base} scale={o}>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[1.6, 1.6, h, 8]} />
        <meshBasicMaterial color="#d9a24a" toneMapped={false} />
      </mesh>
      <mesh position={[0, h, 0]}>
        <sphereGeometry args={[big ? 7 : 5, 16, 12]} />
        <meshBasicMaterial color="#ffd060" toneMapped={false} />
      </mesh>
    </group>
  );
};

export const Map3D: React.FC<{cam: Cam3; children?: React.ReactNode; opacity?: number; light?: number}> = ({cam, children, opacity = 1, light = 1}) => {
  const ready = useTerrainData();
  if (!ready) return null;
  return (
    <div style={{position: 'absolute', inset: 0, opacity, background: '#07090b'}}>
      <ThreeCanvas width={1920} height={1080} gl={{antialias: true, preserveDrawingBuffer: true}} style={{position: 'absolute', inset: 0}}>
        <CamSync c={cam} />
        <color attach="background" args={['#07090b']} />
        <fog attach="fog" args={['#0a0907', cam.dist * 0.9, cam.dist * 3.2]} />
        <ambientLight intensity={0.35 * light} color="#ffe2b0" />
        <hemisphereLight args={['#ffe0a8', '#1a1208', 0.35 * light]} />
        <directionalLight position={[-1500, 900, -1100]} intensity={2.4 * light} color="#ffd9a0" />
        <Terrain />
        {children}
      </ThreeCanvas>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)'}} />
    </div>
  );
};

/** 画面上的地名（HTML，跟着三维投影走） */
export const Label3: React.FC<{cam: Cam3; at: [number, number]; name: string; side?: 'left' | 'right'; size?: number; o?: number; lift?: number; color?: string}> = ({cam, at, name, side = 'right', size = 44, o = 1, lift = 30, color = '#ffe6b0'}) => {
  const [x, y] = project(cam, at[0], at[1], lift);
  return (
    <div style={{position: 'absolute', left: side === 'right' ? x + 18 : undefined, right: side === 'left' ? 1920 - x + 18 : undefined, top: y - size * 0.62, fontFamily: LF.label, fontWeight: 900, fontSize: size, color, opacity: o, textShadow: '0 0 6px #000, 0 2px 10px #000, 0 0 2px #000', whiteSpace: 'nowrap'}}>
      {name}
    </div>
  );
};
