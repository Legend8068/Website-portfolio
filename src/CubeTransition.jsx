import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Briefcase } from 'lucide-react';
gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────────────
   Theme — kept in lockstep with the Projects section so the experience
   tiles read as the same family of card.
   ────────────────────────────────────────────────────────────────── */
const ACCENT = '#f0c040';
const BG_CARD = 'rgba(12, 26, 48, 0.85)';
const BG_DIMENSION = 'rgba(6, 14, 30, 0.98)';

/* The cubie's front face color is computed to match the *perceived*
   color of BG_CARD over BG_DIMENSION (alpha 0.85 over rgb(6,14,30)
   ≈ rgb(11,24,45)). Setting the cube to this exact color means the
   crossfade between the canvas and the HTML grid has no perceptible
   jump in tile color — the only thing that changes is the tile chrome
   (rounded border, blur). */
const FRONT_COLOR = '#0B182D';

/* ─────────────────────────────────────────────────────────────────────
   Cube geometry constants
   ────────────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────────────
   Phase boundaries on scroll progress p ∈ [0, 1] across the pin's
   3000px scroll distance.

   The first 0–HANDOFF_END is the *visual hand-off from the portal
   section*. The pin starts with a copy of the portal's "Explore my
   journey" content sitting at viewport center (matches the portal's
   end-state, no decrypt scramble — already settled). As the user
   scrolls, that text translates UP off-screen while the cube canvas
   translates UP from below, taking the text's place. After the
   hand-off, the cube animation runs normally.
   ────────────────────────────────────────────────────────────────── */
const P = {
  HANDOFF_END: 0.13,  // text exits up; cube enters from below to centre
  IDLE_END:    0.20,  // gentle showcase orbit on the scrambled cube
  SOLVE_END:   0.58,  // solve sequence finishes
  FACE_END:    0.65,  // camera centered on front face, brief beat
  MORPH_END:   0.88,  // cubies have flattened into tile-shaped slabs
  // 0.88 → 1.00: HTML grid crossfades over the slabs, text fades in,
  //              then the pin releases.
};

/* Top two rows of the front face become the in-pin grid; the bottom
   row falls offscreen (those experiences live in the post-pin section
   that the user scrolls down to). */
const TILE_COLS = 3;
const VISIBLE_ROWS = 2;
const VISIBLE_TILES = TILE_COLS * VISIBLE_ROWS;

/* ─────────────────────────────────────────────────────────────────────
   3D-world morph targets — hand-tuned for ~1440×900 viewport with the
   camera at z=11.5, fov=38. The HTML grid above renders centered with
   the same column count and similar aspect ratios so the cubies and
   tiles share screen space at the moment of crossfade. Slight
   misalignment at other viewport sizes is masked by the fade.
   ────────────────────────────────────────────────────────────────── */
const TILE_WORLD = {
  SPX: 3.85,   // distance between column centers
  SPY: 1.65,   // distance from y=0 to a row center (rows at +SPY, -SPY)
  SX:  3.95,   // cubie x-scale at end of morph (tile width)
  SY:  3.05,   // cubie y-scale at end of morph (tile height)
  SZ:  0.04,   // very flat
};

/* ─────────────────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────────────── */
function av(a) { return a === 'x' ? [1, 0, 0] : a === 'y' ? [0, 1, 0] : [0, 0, 1]; }
function lv(pos, a) { return Math.round((a === 'x' ? pos.x : a === 'y' ? pos.y : pos.z) / GAP); }

const easeInOutCubic = t => (t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2);
const easeOutCubic   = t => 1 - Math.pow(1-t, 3);
const easeInCubic    = t => t*t*t;
const easeInQuad     = t => t*t;

function computeKF() {
  const cubies = [];
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++)
        cubies.push({ ix: x, iy: y, iz: z });

  let st = cubies.map(c => ({
    pos: new THREE.Vector3(c.ix * GAP, c.iy * GAP, c.iz * GAP),
    quat: new THREE.Quaternion(),
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

/* ─────────────────────────────────────────────────────────────────────
   Cubie — a pure 3D mesh; never re-renders. All animation happens in
   the parent's useFrame. No HTML lives inside it — that was the source
   of the overlap/clipping mess in the previous version.
   ────────────────────────────────────────────────────────────────── */
function Cubie({ index, ix, iy, iz }) {
  const ref = useRef();

  const mats = useMemo(() => {
    const mk = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.32, metalness: 0.18 });
    const inner = mk(COLORS.inner);
    return [
      ix ===  1 ? mk(COLORS.right)  : inner.clone(),
      ix === -1 ? mk(COLORS.left)   : inner.clone(),
      iy ===  1 ? mk(COLORS.top)    : inner.clone(),
      iy === -1 ? mk(COLORS.bottom) : inner.clone(),
      iz ===  1 ? new THREE.MeshStandardMaterial({ color: FRONT_COLOR, roughness: 0.55, metalness: 0.0 }) : inner.clone(),
      iz === -1 ? mk(COLORS.back)   : inner.clone(),
    ];
  }, [ix, iy, iz]);

  return (
    <mesh
      ref={ref}
      geometry={geo}
      material={mats}
      userData={{
        index,
        ix, iy, iz,
        isFront: iz === 1,
        col: ix + 1,
        row: -(iy - 1),
        lo: 1,
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Scene — drives camera + every cubie purely from pRef each frame.
   No React state; reads pRef.current and writes to Three objects.
   ────────────────────────────────────────────────────────────────── */
function Scene({ pRef, pre }) {
  const { camera } = useThree();
  const grp = useRef();
  const { kf, cubies } = pre;
  const N = MOVES.length;

  // Reusable scratch so we don't allocate inside useFrame.
  const _v  = useMemo(() => new THREE.Vector3(),    []);
  const _q  = useMemo(() => new THREE.Quaternion(), []);
  const _q2 = useMemo(() => new THREE.Quaternion(), []);
  const _ax = useMemo(() => new THREE.Vector3(),    []);
  const idQ = useMemo(() => new THREE.Quaternion(), []);

  useEffect(() => {
    camera.fov = 38;
    camera.near = 0.1;
    camera.far = 100;
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame(() => {
    if (!grp.current) return;
    const p = pRef.current;
    const ch = grp.current.children;

    /* ── CAMERA ──────────────────────────────────────────────────
       Phases: hand-off (cube off-screen, hold orbit start) → idle
       orbit → drift while solving → settle face-on. Cubic easing on
       every segment so the boundaries don't pop. */
    let cx, cy, cz;
    if (p < P.HANDOFF_END) {
      // Cube wrapper is below viewport for the hand-off; just hold
      // the orbit-start camera so it's ready when it slides in.
      const ang = -0.5 * 0.55;
      cx = Math.sin(ang) * 8.5;
      cy = 2.4;
      cz = 8.2 + Math.cos(ang) * 0.6;
    } else if (p < P.IDLE_END) {
      const t = (p - P.HANDOFF_END) / (P.IDLE_END - P.HANDOFF_END);
      const ang = (t - 0.5) * 0.55;
      cx = Math.sin(ang) * 8.5;
      cy = 2.4 + Math.sin(t * Math.PI) * 0.6;
      cz = 8.2 + Math.cos(ang) * 0.6;
    } else if (p < P.SOLVE_END) {
      const t = (p - P.IDLE_END) / (P.SOLVE_END - P.IDLE_END);
      const e = easeInOutCubic(t);
      cx = THREE.MathUtils.lerp(Math.sin(0.275 * 0.5) * 8.5, 1.2, e);
      cy = THREE.MathUtils.lerp(3.0,  0.4, e);
      cz = THREE.MathUtils.lerp(8.5, 10.5, e);
    } else if (p < P.FACE_END) {
      const t = (p - P.SOLVE_END) / (P.FACE_END - P.SOLVE_END);
      const e = easeInOutCubic(t);
      cx = THREE.MathUtils.lerp(1.2, 0,    e);
      cy = THREE.MathUtils.lerp(0.4, 0,    e);
      cz = THREE.MathUtils.lerp(10.5, 11.5, e);
    } else {
      cx = 0; cy = 0; cz = 11.5;
    }
    camera.position.set(cx, cy, cz);
    camera.lookAt(0, 0, 0);

    /* ── PER-CUBIE ─────────────────────────────────────────────── */
    for (let ci = 0; ci < ch.length; ci++) {
      const m = ch[ci];
      const ud = m.userData;
      if (ud.index === undefined) continue;

      let px = 0, py = 0, pz = 0;
      let qx = 0, qy = 0, qz = 0, qw = 1;
      let sx = 1, sy = 1, sz = 1;
      let visible = true;
      let opacity = 1;

      if (p <= P.IDLE_END) {
        // Hand-off + idle: cube stays in fully-scrambled keyframe.
        // (Hand-off period is hidden by the wrapper translateY.)
        const s = kf[N][ud.index];
        px = s.pos.x; py = s.pos.y; pz = s.pos.z;
        qx = s.quat.x; qy = s.quat.y; qz = s.quat.z; qw = s.quat.w;

      } else if (p <= P.SOLVE_END) {
        // Run the solve in reverse iteration order.
        const t  = (p - P.IDLE_END) / (P.SOLVE_END - P.IDLE_END);
        const mf = t * N;
        const mi = Math.min(Math.floor(mf), N - 1);
        const mt = easeInOutCubic(Math.min(1, mf - mi));
        const si = N - 1 - mi;
        const move = MOVES[si];
        const from = kf[N - mi][ud.index];
        const to   = kf[N - mi - 1][ud.index];
        const inLayer = lv(from.pos, move.axis) === move.layer;

        if (mt >= 0.999 || !inLayer) {
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

      } else if (p <= P.FACE_END) {
        // Solved & holding while the camera centers up.
        const s = kf[0][ud.index];
        px = s.pos.x; py = s.pos.y; pz = s.pos.z;
        qx = s.quat.x; qy = s.quat.y; qz = s.quat.z; qw = s.quat.w;

      } else if (p <= P.MORPH_END) {
        const t = (p - P.FACE_END) / (P.MORPH_END - P.FACE_END);
        const eOut = easeOutCubic(t);
        const eIn  = easeInQuad(t);
        const s = kf[0][ud.index];

        if (ud.isFront) {
          const isVisibleRow = ud.row < VISIBLE_ROWS;

          if (isVisibleRow) {
            /* Top 2 rows → flatten and translate to the corresponding
               HTML tile cell. The targets are tuned so the cubie's
               final flat rectangle covers the same screen pixels as
               the HTML tile that fades in over it. */
            const tgtX = (ud.col - 1) * TILE_WORLD.SPX;
            const tgtY = (VISIBLE_ROWS - 1 - ud.row) * 2 * TILE_WORLD.SPY - TILE_WORLD.SPY - 1.012;
            const tgtZ = 0;

            px = THREE.MathUtils.lerp(s.pos.x, tgtX, eOut);
            py = THREE.MathUtils.lerp(s.pos.y, tgtY, eOut);
            pz = THREE.MathUtils.lerp(s.pos.z, tgtZ, eOut);

            // Slerp rotation to identity so the front face is square-on.
            _q.copy(s.quat).slerp(idQ, eOut);
            qx = _q.x; qy = _q.y; qz = _q.z; qw = _q.w;

            // Stretch into the tile silhouette while collapsing depth.
            sx = THREE.MathUtils.lerp(1, TILE_WORLD.SX, eOut);
            sy = THREE.MathUtils.lerp(1, TILE_WORLD.SY, eOut);
            sz = THREE.MathUtils.lerp(1, TILE_WORLD.SZ, eOut);

            // Hold full opacity to the very end — the HTML grid fades
            // in over the cubies (matching color), so we want the
            // cubies still solid right up until the crossfade.
            opacity = 1;

          } else {
            /* Bottom row of the front face → drop offscreen with a
               gravity-style accelerating fall and a small tumble.
               These cubies live below pinRef's overflow:hidden so
               the fall is partially visible at the lower edge. */
            const fall = eIn * 16;
            px = s.pos.x + (ud.col - 1) * 0.05;
            py = s.pos.y - fall;
            pz = s.pos.z;
            _ax.set(1, 0, 0);
            _q.setFromAxisAngle(_ax, -t * t * Math.PI * 0.9);
            _q2.copy(_q).multiply(s.quat);
            qx = _q2.x; qy = _q2.y; qz = _q2.z; qw = _q2.w;
            opacity = 1 - easeInCubic(Math.max(0, (t - 0.5) / 0.5));
          }

        } else {
          /* Back / inner cubies — shrink and fade quickly so the
             stage clears for the front cubies' flatten. They also
             drift backward (away from camera) for a soft depth cue. */
          const sh = Math.max(0.001, 1 - easeOutCubic(Math.min(1, t * 1.6)));
          px = s.pos.x;
          py = s.pos.y - eIn * 4;
          pz = s.pos.z - eIn * 2;
          qx = s.quat.x; qy = s.quat.y; qz = s.quat.z; qw = s.quat.w;
          sx = sy = sz = sh;
          opacity = sh;
          if (opacity <= 0.02) visible = false;
        }

      } else {
        /* Past MORPH_END — the HTML grid takes the stage. We hold
           the front cubies in their final flattened pose so the
           color of the canvas matches the HTML tile's color
           through the entire crossfade window; only the canvas
           wrapper's opacity actually animates down. */
        const s = kf[0][ud.index];
        if (ud.isFront && ud.row < VISIBLE_ROWS) {
          px = (ud.col - 1) * TILE_WORLD.SPX;
          py = (VISIBLE_ROWS - 1 - ud.row) * 2 * TILE_WORLD.SPY - TILE_WORLD.SPY - 1.012;
          pz = 0;
          qx = 0; qy = 0; qz = 0; qw = 1;
          sx = TILE_WORLD.SX; sy = TILE_WORLD.SY; sz = TILE_WORLD.SZ;
          opacity = 1;
        } else {
          visible = false;
        }
      }

      m.position.set(px, py, pz);
      m.quaternion.set(qx, qy, qz, qw);
      m.scale.set(sx, sy, sz);
      m.visible = visible;

      if (Math.abs((ud.lo ?? 1) - opacity) > 0.015) {
        ud.lo = opacity;
        const transparent = opacity < 0.985;
        const arr = m.material;
        for (let mi = 0; mi < arr.length; mi++) {
          arr[mi].transparent = transparent;
          arr[mi].opacity = opacity;
        }
      }
    }
  });

  return (
    <group ref={grp}>
      {cubies.map((c, i) => (
        <Cubie key={i} index={i} ix={c.ix} iy={c.iy} iz={c.iz} />
      ))}
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 5, 5]} intensity={1.0} />
      <directionalLight position={[-3, -2, 4]} intensity={0.32} color={ACCENT} />
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   ExperienceTile — same visual family as the Projects card. No
   typewriter; content simply fades in once `animateIn` flips on.
   ────────────────────────────────────────────────────────────────── */
function ExperienceTile({ exp, color, animateIn = true, delay = 0 }) {
  if (!exp) return null;
  return (
    <div
      style={{
        opacity: animateIn ? 1 : 0,
        transform: animateIn ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.985)',
        transition: `opacity 0.55s cubic-bezier(0.4,0,0.2,1) ${delay}s, transform 0.55s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        data-hover-lift
        style={{
          padding: 'clamp(18px, 1.8vw, 28px)',
          background: BG_CARD,
          border: `1px solid ${color}30`,
          borderRadius: '20px',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          height: 'var(--tile-h, clamp(300px, 33vh, 350px))',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'clamp(12px, 1.4vw, 20px)' }}>
          <Briefcase size={36} color={color} strokeWidth={1.6} />
        </div>

        <h3 style={{ fontSize: 'clamp(16px, 1.4vw, 22px)', fontWeight: 700, lineHeight: 1.25, margin: 0, marginBottom: '6px', color: '#fff' }}>
          {exp.title}
        </h3>
        <div style={{ color, fontSize: 'clamp(12px, 0.9vw, 15px)', fontWeight: 600, marginBottom: '4px' }}>
          {exp.company}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(11px, 0.8vw, 13px)', fontFamily: 'monospace', marginBottom: '10px' }}>
          {exp.period}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 'clamp(12px, 0.95vw, 15px)', lineHeight: 1.45, margin: 0 }}>
          {exp.desc}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Main scroll-driven cube → tile transition
   ────────────────────────────────────────────────────────────────── */
export default function CubeTransition({ experiences = [] }) {
  const secRef = useRef();
  const pinRef = useRef();
  const pRef   = useRef(0);
  const pre    = useMemo(() => computeKF(), []);

  /* React state: only updated at meaningful boundaries so the 3D scene
     itself never re-renders.
       - handoffP:    0 → 1 over the hand-off phase. Drives the text-up
                      and cube-up translateY transforms via inline style.
       - tilesIn:     whether the HTML grid is faded in.
       - titleOpacity: opacity of the // EXPERIENCE label. */
  const [handoffP, setHandoffP] = useState(0);
  const [tilesIn, setTilesIn] = useState(false);
  const [titleOpacity, setTitleOpacity] = useState(0);

  useEffect(() => {
    if (!secRef.current || !pinRef.current) return;

    let raf;
    let lastTilesIn = false;
    let lastTitle = -1;
    let lastHandoff = -1;

    const tick = () => {
      const p = pRef.current;
      // Hand-off progress: 0 at p=0, 1 at HANDOFF_END.
      const hp = Math.max(0, Math.min(1, p / P.HANDOFF_END));
      if (Math.abs(hp - lastHandoff) > 0.005) {
        lastHandoff = hp;
        setHandoffP(hp);
      }
      const ti = p > P.MORPH_END;
      if (ti !== lastTilesIn) {
        lastTilesIn = ti;
        setTilesIn(ti);
      }
      // Section label is hidden during hand-off (still showing the
      // "Explore my journey" text), then fades in once the cube has
      // taken centre stage, and stays visible.
      const labelStart = P.HANDOFF_END + 0.02;
      const to = p < labelStart ? 0 : Math.min(1, (p - labelStart) / 0.04);
      if (Math.abs(to - lastTitle) > 0.02) {
        lastTitle = to;
        setTitleOpacity(to);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    /* Pin runs from the moment the section reaches the top of the
       viewport (so the hand-off plays out on contact with the portal)
       through 3000px of scroll — long enough for hand-off + idle +
       solve + morph + tile crossfade. After that the pin releases and
       the user keeps scrolling normally to reach the bottom row. */
    const trigger = ScrollTrigger.create({
      trigger: secRef.current,
      start: 'top top',
      end:   '+=3000',
      pin:   pinRef.current,
      scrub: 0.8,
      onUpdate: (s) => { pRef.current = s.progress; },
    });

    return () => { cancelAnimationFrame(raf); trigger.kill(); };
  }, []);

  /* Hand-off transforms.
       cubeY: cube + grid wrapper rides up from below the viewport
              (translateY 100% → 0%) over the hand-off phase.
       textY: the *original* "Explore my journey" content in the
              portal section translates up (0% → -100%) at the same
              rate. Effect: the cube physically pushes the existing
              portal text up out of the way — no duplication. The
              push is applied via a side-effect below to the live
              data-zoom-content element so we don't have to re-render
              the portal. */
  const handoffEased = handoffP < 0.5
    ? 2 * handoffP * handoffP
    : 1 - Math.pow(-2 * handoffP + 2, 2) / 2;
  const cubeY = (1 - handoffEased) * 100;
  const textY = -handoffEased * 100;

  // Apply the textY translate directly to the portal's settled-text
  // node. We only touch transform; the portal scroll handler doesn't
  // set it during raw=1 so we won't fight it. Cleanup on unmount.
  useEffect(() => {
    const node = document.querySelector('[data-zoom-content]');
    if (!node) return;
    node.style.transform = `translateY(${textY}%)`;
    node.style.transition = 'none';
    node.style.willChange = 'transform';
  }, [textY]);

  // Top six fill the in-pin grid; the remaining three flow below.
  const visibleExps = experiences.slice(0, VISIBLE_TILES);
  const continuationExps = experiences.slice(VISIBLE_TILES, VISIBLE_TILES + TILE_COLS);

  return (
    <div
      ref={secRef}
      id="experience"
      style={{
        position: 'relative',
        background: BG_DIMENSION,
        '--tile-h': 'clamp(300px, 33vh, 350px)',
        '--tile-gap': 'clamp(16px, 2vw, 32px)',
      }}
    >
      {/* ── Pin region: cube hand-off + animation + top 6 tiles ─── */}
      <div
        ref={pinRef}
        style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}
      >
        {/* Cube + tile group — translates up from below during the
            hand-off, physically taking the place of the portal's
            "Explore my journey" text (which is the previous section's
            content; we don't duplicate it here, the natural scroll
            pushes it up as the portal exits viewport). */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translateY(${cubeY}%)`,
            willChange: 'transform',
          }}
        >
          {/* 3D layer — fades out under the HTML once we've crossed MORPH_END.
              A long fade (0.65s) keeps the color match feeling natural. */}
          <Canvas
            style={{
              position: 'absolute', inset: 0, zIndex: 1,
              opacity: tilesIn ? 0 : 1,
              transition: 'opacity 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: tilesIn ? 'none' : 'auto',
            }}
            camera={{ fov: 38, near: 0.1, far: 100, position: [4, 2.4, 8.2] }}
            dpr={[1, 2]}
            frameloop="always"
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          >
            <Scene pRef={pRef} pre={pre} />
          </Canvas>

          {/* HTML tile grid — sits above the canvas, fades in once the
              cube has flattened into matching-colored slabs. Sits
              inside the cube wrapper so it rides up alongside the
              cube during the hand-off. */}
          <div
            style={{
              position: 'absolute', inset: 0, zIndex: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              paddingTop: '12vh', // Shifts the grid vertically downwards by 6vh
              paddingLeft: 'clamp(24px, 5vw, 80px)',
              paddingRight: 'clamp(24px, 5vw, 80px)',
              opacity: tilesIn ? 1 : 0,
              transition: 'opacity 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: tilesIn ? 'auto' : 'none',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ width: '100%', maxWidth: '1280px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${TILE_COLS}, minmax(0, 1fr))`,
                  gap: 'var(--tile-gap)',
                }}
              >
                {visibleExps.map((exp, i) => (
                  <ExperienceTile
                    key={i}
                    exp={exp}
                    color={ACCENT}
                    animateIn={tilesIn}
                    delay={i * 0.04}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section label — pinned top-left, doesn't ride the hand-off
            transform. Fades in after the cube has settled in centre. */}
        <div
          style={{
            position: 'absolute',
            top: 'clamp(24px, 3vh, 48px)',
            left: 'clamp(24px, 5vw, 80px)',
            zIndex: 1, // Place behind tiles in case of slight overlap on short screens
            opacity: titleOpacity,
            transition: 'opacity 0.3s ease-out',
            pointerEvents: 'none',
          }}
        >
          <p style={{ color: ACCENT, fontSize: 'clamp(13px, 1.1vw, 18px)', letterSpacing: '5px', fontWeight: 500, margin: '0 0 clamp(8px, 1.5vw, 16px) 0' }}>
            // EXPERIENCE
          </p>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 80px)', fontWeight: 700, margin: 0, lineHeight: 1.05, color: '#fff' }}>
            Professional journey.
          </h2>
        </div>
      </div>

      {/* ── Continuation region: bottom row of tiles, seamlessly matched ── */}
      <div
        style={{
          marginTop: 'calc(var(--tile-h) + 1.5 * var(--tile-gap) - 44vh)',
          padding: '0 clamp(24px, 5vw, 80px) clamp(80px, 10vh, 140px)',
          position: 'relative',
          zIndex: 3,
        }}
      >
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${TILE_COLS}, minmax(0, 1fr))`,
              gap: 'var(--tile-gap)',
            }}
          >
            {continuationExps.map((exp, i) => (
              <ExperienceTile key={i} exp={exp} color={ACCENT} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
