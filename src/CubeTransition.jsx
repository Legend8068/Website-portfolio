import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const ACCENT = '#f0c040';
const CARD_BG = '#0C1A30';
const GAP = 1.05;
const SZ = 0.92;

const COLORS = {
  right: '#c49030', left: '#2a5a7b', top: '#e8d4a0',
  bottom: '#1a3050', back: '#0d2140', inner: '#080e1a',
};

const MOVES = [
  { axis: 'y', layer: 1, angle: Math.PI / 2 },
  { axis: 'x', layer: -1, angle: -Math.PI / 2 },
  { axis: 'z', layer: 1, angle: Math.PI / 2 },
  { axis: 'y', layer: -1, angle: -Math.PI / 2 },
  { axis: 'x', layer: 0, angle: Math.PI / 2 },
  { axis: 'z', layer: -1, angle: -Math.PI / 2 },
];

const P = { SOLVE: 0.42, PAUSE: 0.50, MORPH: 0.80, CARDS: 1.0 };

function av(a) { return a === 'x' ? [1, 0, 0] : a === 'y' ? [0, 1, 0] : [0, 0, 1]; }
function lv(pos, a) { return Math.round((a === 'x' ? pos.x : a === 'y' ? pos.y : pos.z) / GAP); }
function ease3(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

function computeKF() {
  const cubies = [];
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++)
        cubies.push({ ix: x, iy: y, iz: z });

  let st = cubies.map(c => ({
    pos: new THREE.Vector3(c.ix * GAP, c.iy * GAP, c.iz * GAP),
    quat: new THREE.Quaternion()
  }));
  const kf = [st.map(s => ({ pos: s.pos.clone(), quat: s.quat.clone() }))];

  for (const m of MOVES) {
    const axis = new THREE.Vector3(...av(m.axis));
    const rq = new THREE.Quaternion().setFromAxisAngle(axis, m.angle);
    st = st.map(s => {
      if (lv(s.pos, m.axis) === m.layer) {
        const np = s.pos.clone().applyQuaternion(rq);
        np.x = Math.round(np.x / GAP) * GAP;
        np.y = Math.round(np.y / GAP) * GAP;
        np.z = Math.round(np.z / GAP) * GAP;
        return { pos: np, quat: rq.clone().multiply(s.quat) };
      }
      return { pos: s.pos.clone(), quat: s.quat.clone() };
    });
    kf.push(st.map(s => ({ pos: s.pos.clone(), quat: s.quat.clone() })));
  }
  return { kf, cubies };
}

const geo = new THREE.BoxGeometry(SZ, SZ, SZ);

// ── Typewriter Text ──
function TypewriterText({ text, progress, style }) {
  const len = Math.floor(progress * text.length);
  return <span style={style}>{text.substring(0, len)}{progress > 0 && progress < 1 && <span style={{ color: ACCENT }}>|</span>}</span>;
}

function CardContent({ exp, cardProgress }) {
  if (cardProgress <= 0) return null;
  
  const total = exp.title.length + exp.company.length + exp.period.length + exp.desc.length;
  const t1 = exp.title.length / total;
  const t2 = t1 + exp.company.length / total;
  const t3 = t2 + exp.period.length / total;

  return (
    <div style={{
      width: '100%', height: '100%',
      padding: 'clamp(12px, 1.2vw, 24px)',
      boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
      opacity: Math.min(1, cardProgress * 5),
    }}>
      <TypewriterText text={exp.title} progress={Math.min(1, cardProgress / t1)}
        style={{ fontSize: 'clamp(13px, 1.1vw, 18px)', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '4px', lineHeight: 1.2 }} />
      <TypewriterText text={exp.company} progress={cardProgress > t1 ? Math.min(1, (cardProgress - t1) / (t2 - t1)) : 0}
        style={{ color: ACCENT, fontSize: 'clamp(10px, 0.8vw, 13px)', display: 'block', marginBottom: '3px', fontWeight: 500 }} />
      <TypewriterText text={exp.period} progress={cardProgress > t2 ? Math.min(1, (cardProgress - t2) / (t3 - t2)) : 0}
        style={{ color: 'rgba(255,255,255,0.3)', fontSize: 'clamp(9px, 0.7vw, 12px)', fontFamily: 'monospace', display: 'block', marginBottom: '8px' }} />
      <TypewriterText text={exp.desc} progress={cardProgress > t3 ? Math.min(1, (cardProgress - t3) / (1 - t3)) : 0}
        style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(10px, 0.8vw, 14px)', lineHeight: 1.5, display: 'block' }} />
    </div>
  );
}

function Cubie({ index, ix, iy, iz, exp, globalProgress }) {
  const ref = useRef();
  const isFront = iz === 1;
  const cardIndex = isFront ? (ix + 1) + -(iy - 1) * 3 : -1;
  
  const mats = useMemo(() => {
    const mk = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.25, metalness: 0.3 });
    const frontMat = new THREE.MeshBasicMaterial({ color: CARD_BG });
    const inner = mk(COLORS.inner);
    return [
      ix === 1 ? mk(COLORS.right) : inner.clone(),
      ix === -1 ? mk(COLORS.left) : inner.clone(),
      iy === 1 ? mk(COLORS.top) : inner.clone(),
      iy === -1 ? mk(COLORS.bottom) : inner.clone(),
      iz === 1 ? frontMat : inner.clone(),
      iz === -1 ? mk(COLORS.back) : inner.clone(),
    ];
  }, [ix, iy, iz]);

  useFrame(() => {
    const m = ref.current;
    if (!m || !m.userData.a) return;
    const a = m.userData.a;
    m.position.set(a.px, a.py, a.pz);
    m.quaternion.set(a.qx, a.qy, a.qz, a.qw);
    m.scale.set(a.sx, a.sy, a.sz);
    m.visible = a.vis;
    if (Math.abs((m.userData.lo || 1) - a.op) > 0.02) {
      m.userData.lo = a.op;
      const t = a.op < 0.98;
      mats.forEach(mt => { 
        mt.transparent = t; 
        mt.opacity = a.op; 
        mt.needsUpdate = true; // CRITICAL FIX for black squares
      });
    }
  });

  // Calculate typewriter progress for this specific card
  let cardProgress = 0;
  if (isFront && globalProgress > P.MORPH) {
    const cardT = (globalProgress - P.MORPH) / (P.CARDS - P.MORPH);
    const stagger = cardIndex * 0.05;
    cardProgress = Math.max(0, Math.min(1, (cardT - stagger) / (1 - 0.05 * 8)));
  }

  return (
    <mesh ref={ref} geometry={geo} material={mats}
      userData={{ index, ix, iy, iz, isFront, col: ix + 1, row: -(iy - 1), a: null, lo: 1 }}>
      
      {isFront && exp && (
        <Html transform position={[0, 0, 0.461]} scale={0.26} zIndexRange={[100, 0]}
          style={{ 
            width: '320px', height: '240px', 
            pointerEvents: globalProgress > P.MORPH + 0.1 ? 'auto' : 'none',
            display: globalProgress > P.MORPH ? 'block' : 'none'
          }}>
          <CardContent exp={exp} cardProgress={cardProgress} />
        </Html>
      )}
    </mesh>
  );
}

function Scene({ pRef, pre, experiences, dp }) {
  const { camera } = useThree();
  const grp = useRef();
  const { kf, cubies } = pre;
  const N = MOVES.length;
  const _v = useMemo(() => new THREE.Vector3(), []);
  const _q = useMemo(() => new THREE.Quaternion(), []);
  const _q2 = useMemo(() => new THREE.Quaternion(), []);
  const _ax = useMemo(() => new THREE.Vector3(), []);
  const idQ = useMemo(() => new THREE.Quaternion(), []);

  useEffect(() => {
    camera.position.set(4, 3, 8);
    camera.lookAt(0, 0, 0);
    camera.fov = 40;
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame(() => {
    if (!grp.current) return;
    const p = pRef.current, ch = grp.current.children;

    // ── CAMERA ──
    if (p < P.PAUSE) {
      const t = p / P.PAUSE;
      const ang = t * 0.3;
      const frontT = p > P.SOLVE ? ease3((p - P.SOLVE) / (P.PAUSE - P.SOLVE)) : 0;
      camera.position.set(
        4 * Math.cos(ang * Math.PI) * (1 - frontT),
        (3 - t * 0.6) * (1 - frontT),
        8 + frontT * 4
      );
      camera.lookAt(0, 0, 0);
    } else {
      camera.position.set(0, 0, 12);
      camera.lookAt(0, 0, 0);
    }

    // ── PER-CUBIE ──
    for (let ci = 0; ci < ch.length; ci++) {
      const m = ch[ci], ud = m.userData;
      if (ud.index === undefined) continue;

      let px = 0, py = 0, pz = 0, qx = 0, qy = 0, qz = 0, qw = 1;
      let sx = 1, sy = 1, sz = 1, op = 1, vis = true;

      if (p <= P.SOLVE) {
        const st = Math.min(1, p / P.SOLVE), mf = st * N;
        const mi = Math.min(Math.floor(mf), N - 1), mt = ease3(Math.min(1, mf - mi));
        const si = N - 1 - mi, move = MOVES[si];
        const from = kf[N - mi][ud.index], to = kf[N - mi - 1][ud.index];
        const inL = lv(from.pos, move.axis) === move.layer;

        if (mt >= 0.999 || !inL) {
          const s = mt >= 0.999 ? to : from;
          px = s.pos.x; py = s.pos.y; pz = s.pos.z;
          qx = s.quat.x; qy = s.quat.y; qz = s.quat.z; qw = s.quat.w;
        } else {
          _ax.set(...av(move.axis));
          _q.setFromAxisAngle(_ax, -move.angle * mt);
          _v.copy(from.pos).applyQuaternion(_q);
          _q2.copy(_q).multiply(from.quat);
          px = _v.x; py = _v.y; pz = _v.z;
          qx = _q2.x; qy = _q2.y; qz = _q2.z; qw = _q2.w;
        }

      } else if (p <= P.PAUSE) {
        const s = kf[0][ud.index];
        px = s.pos.x; py = s.pos.y; pz = s.pos.z;
        qx = s.quat.x; qy = s.quat.y; qz = s.quat.z; qw = s.quat.w;

      } else if (p <= P.MORPH) {
        const t = ease3((p - P.PAUSE) / (P.MORPH - P.PAUSE));
        const s = kf[0][ud.index];

        if (ud.isFront) {
          const sp = 3.6; 
          const tgtX = (ud.col - 1) * sp;
          const tgtY = -(ud.row - 1) * sp;
          const tgtZ = 0;

          px = s.pos.x + (tgtX - s.pos.x) * t;
          py = s.pos.y + (tgtY - s.pos.y) * t;
          pz = s.pos.z + (tgtZ - s.pos.z) * t;

          _q.copy(s.quat).slerp(idQ, t);
          qx = _q.x; qy = _q.y; qz = _q.z; qw = _q.w;

          sx = 1 + t * 2.8; 
          sy = 1 + t * 2.0;  
          sz = 1 - t * 0.999; // Extremely flat so edges don't show
        } else {
          px = s.pos.x; py = s.pos.y; pz = s.pos.z;
          qx = s.quat.x; qy = s.quat.y; qz = s.quat.z; qw = s.quat.w;
          const shrink = Math.max(0.001, 1 - t * 2);
          sx = sy = sz = shrink; // physically shrink to 0
          op = shrink;
          if (op <= 0.01) vis = false;
        }

      } else {
        if (ud.isFront) {
          const sp = 3.6;
          px = (ud.col - 1) * sp; py = -(ud.row - 1) * sp; pz = 0;
          sx = 3.8; sy = 3.0; sz = 0.001;
        } else {
          vis = false;
        }
      }

      ud.a = { px, py, pz, qx, qy, qz, qw, sx, sy, sz, op, vis };
    }
  });

  return (
    <group ref={grp}>
      {cubies.map((c, i) => {
        const isFront = c.iz === 1;
        const cardIndex = isFront ? (c.ix + 1) + -(c.iy - 1) * 3 : -1;
        return (
          <Cubie key={i} index={i} ix={c.ix} iy={c.iy} iz={c.iz} 
            exp={isFront ? experiences[cardIndex] : null} 
            globalProgress={dp} />
        );
      })}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.0} />
      <directionalLight position={[-3, -2, 4]} intensity={0.3} color={ACCENT} />
    </group>
  );
}

// ── MAIN ──
export default function CubeTransition({ experiences = [] }) {
  const secRef = useRef(), pinRef = useRef(), pRef = useRef(0);
  const pre = useMemo(() => computeKF(), []);

  const [dp, setDp] = React.useState(0);
  const lastUpdate = useRef(0);

  useEffect(() => {
    let raf;
    const tick = () => {
      const now = performance.now();
      if (now - lastUpdate.current > 40 && Math.abs(dp - pRef.current) > 0.003) {
        lastUpdate.current = now;
        setDp(pRef.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dp]);

  useEffect(() => {
    if (!secRef.current || !pinRef.current) return;
    const trigger = ScrollTrigger.create({
      trigger: secRef.current, start: 'top top', end: 'bottom bottom',
      pin: pinRef.current, scrub: true,
      onUpdate: (s) => { pRef.current = s.progress; },
    });
    return () => trigger.kill();
  }, []);

  return (
    <div ref={secRef} id="experience" style={{ height: '5000px', position: 'relative', background: 'rgba(6,14,30,0.98)' }}>
      <div ref={pinRef} style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <Canvas style={{ position: 'absolute', inset: 0, zIndex: 1 }}
          camera={{ fov: 40, near: 0.1, far: 100, position: [4, 3, 8] }}
          dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
          <Scene pRef={pRef} pre={pre} experiences={experiences} dp={dp} />
        </Canvas>
        <div style={{
          position: 'absolute', top: 'clamp(24px,3vh,48px)', left: 'clamp(24px,5vw,80px)', zIndex: 5,
          opacity: dp < 0.05 ? dp / 0.05 : dp > 0.75 ? Math.max(0, 1 - (dp - 0.75) / 0.05) : 1,
        }}>
          <p style={{ color: ACCENT, fontSize: 'clamp(13px,1.1vw,18px)', letterSpacing: '5px', fontWeight: 500, margin: 0 }}>// EXPERIENCE</p>
        </div>
      </div>
    </div>
  );
}
