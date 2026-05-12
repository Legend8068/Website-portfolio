/* ─────────────────────────────────────────────────────────────────────
   MusicLogo.jsx

   Port of the design package "Music Logo" (gramophone with spinning
   vinyl, dropping tonearm, music notes drifting from the C letter)
   into a self-contained React component. The animation runs on its
   own requestAnimationFrame loop and resets every DURATION seconds.

   Source files this is derived from:
     /Users/ayush/my-portfolio/Logos/Music Logo.html
     /Users/ayush/my-portfolio/Logos/scene.jsx
     /Users/ayush/my-portfolio/Logos/animations.jsx
     /Users/ayush/my-portfolio/Logos/logo-paths.json  → src/logo-paths.json
   ────────────────────────────────────────────────────────────────── */

import React, { useEffect, useRef, useState } from 'react';
import paths from './logo-paths.json';

/* ── Theme constants (from the design) ─────────────────────────────── */
const RED  = '#A41623';
const BLUE = '#3da5d9';
const BG   = '#0A1628';

/* SVG viewBox (full gramophone). */
const VB_W = 1664;
const VB_H = 2572;

/* Disc (vinyl record) — top-down ellipse on the gramophone. */
const DISC_CX = 899;
const DISC_CY = 1717;
const DISC_RX = 340;
const DISC_RY = 58;

/* C letter — origin for the floating notes. */
const C_X = 1310;
const C_Y = 470;

/* Tonearm: paths #12 (cartridge bracket) + #13 (arm body) rotate as a
   group. Pivot at the top of the arm; lift-off angle is negative so
   the arm comes UP off the disc. */
const TONEARM_PATH_IDS = new Set([12, 13]);
const TONEARM_PIVOT_X  = 446;
const TONEARM_PIVOT_Y  = 1240;
const TONEARM_LIFT_DEG = -22;

/* Loop length (seconds). Disc spins forever; tonearm lifts/drops once
   per loop; notes are scheduled across the whole window. */
const DURATION = 10;

/* ── Easing helpers (matched to the source design) ─────────────────── */
const easeOutCubic = (t) => --t * t * t + 1;
const easeOutQuad  = (t) => t * (2 - t);
const easeOutBack  = (t) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ── useLoopTime: advance `time` (s) and wrap at `duration`. ──────── */
function useLoopTime(duration = DURATION) {
  const [time, setTime] = useState(0);
  const lastRef = useRef(null);
  useEffect(() => {
    let raf;
    const tick = (ts) => {
      if (lastRef.current == null) lastRef.current = ts;
      const dt = (ts - lastRef.current) / 1000;
      lastRef.current = ts;
      setTime((t) => (t + dt) % duration);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      lastRef.current = null;
    };
  }, [duration]);
  return time;
}

/* ─────────────────────────────────────────────────────────────────────
   SpinningDisc

   The original disc path is a top-down (foreshortened) ellipse —
   rotating concentric ellipses is invisible. We instead draw the
   surface in "circle space" (radius = DISC_RX), rotate it normally,
   then apply scale(1, ry/rx) so the result reads as a foreshortened
   spinning record (with grooves, label, tick mark).
   ────────────────────────────────────────────────────────────────── */
function SpinningDisc({ time }) {
  // Continuous rotation, ramping in over the first 1.2 s.
  const rampEnd  = 1.2;
  const omegaMax = 320; // deg/sec at full speed
  let angle;
  if (time < rampEnd) {
    angle = (omegaMax * time * time) / (2 * rampEnd);
  } else {
    const angleAtRamp = (omegaMax * rampEnd) / 2;
    angle = angleAtRamp + omegaMax * (time - rampEnd);
  }

  const squash = DISC_RY / DISC_RX; // foreshortening
  const surfaceTransform =
    `translate(${DISC_CX} ${DISC_CY}) scale(1 ${squash}) rotate(${angle})`;
  const labelR = DISC_RX * 0.32;

  // Pronounced groove arcs — primary visible rotating element.
  const grooveArcs = [];
  for (let i = 0; i < 5; i++) {
    const r  = DISC_RX * (0.55 + i * 0.08);
    const a0 = ((-50 + i * 6) * Math.PI) / 180;
    const a1 = ((30  + i * 6) * Math.PI) / 180;
    const x0 = r * Math.cos(a0), y0 = r * Math.sin(a0);
    const x1 = r * Math.cos(a1), y1 = r * Math.sin(a1);
    grooveArcs.push(
      <path
        key={`ga${i}`}
        d={`M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`}
        fill="none" stroke="#7a0f1a" strokeWidth={3} opacity={0.7}
      />
    );
  }

  // Subtle full circles for groove texture.
  const baseGrooves = [];
  for (let i = 0; i < 8; i++) {
    const r = DISC_RX * (0.42 + i * 0.07);
    baseGrooves.push(
      <circle key={`bg${i}`} cx={0} cy={0} r={r}
        fill="none" stroke="#7a0f1a" strokeWidth={1} opacity={0.45} />
    );
  }

  // Two pie-slice highlights for asymmetry — make rotation read clearly.
  const wedge = (rMul, a0Deg, a1Deg) => {
    const r  = DISC_RX * rMul;
    const a0 = (a0Deg * Math.PI) / 180;
    const a1 = (a1Deg * Math.PI) / 180;
    const x0 = r * Math.cos(a0), y0 = r * Math.sin(a0);
    const x1 = r * Math.cos(a1), y1 = r * Math.sin(a1);
    return `M 0 0 L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`;
  };

  return (
    <g>
      {/* Base disc — solid red, matches original silhouette. */}
      <ellipse cx={DISC_CX} cy={DISC_CY} rx={DISC_RX} ry={DISC_RY} fill={RED} />

      <g transform={surfaceTransform}>
        {baseGrooves}

        <path d={wedge(0.97, -100, -20)} fill="#c93246" opacity={0.55} />
        <path d={wedge(0.85,   70, 110)} fill="#c93246" opacity={0.40} />

        {grooveArcs}

        {/* Center label. */}
        <circle cx={0} cy={0} r={labelR} fill={BG} />
        <circle cx={0} cy={0} r={labelR * 0.94}
          fill="none" stroke={RED} strokeWidth={2} opacity={0.6} />

        {/* Three radial ticks make rotation unmistakable. */}
        {[0, 120, 240].map((deg) => {
          const a  = (deg * Math.PI) / 180;
          const r1 = labelR * 0.55, r2 = labelR * 0.85;
          return (
            <line
              key={deg}
              x1={r1 * Math.cos(a)} y1={r1 * Math.sin(a)}
              x2={r2 * Math.cos(a)} y2={r2 * Math.sin(a)}
              stroke={RED} strokeWidth={4} strokeLinecap="round" opacity={0.85}
            />
          );
        })}

        {/* Single asymmetric tick for single-frame rotation read. */}
        <rect x={-3} y={-labelR * 0.92} width={6} height={labelR * 0.35} fill={RED} />

        {/* Center pin hole. */}
        <circle cx={0} cy={0} r={DISC_RX * 0.04}  fill={BG} />
        <circle cx={0} cy={0} r={DISC_RX * 0.018} fill={RED} />
      </g>
    </g>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Tonearm

   At the start of each loop the arm starts lifted (rotated UP by
   TONEARM_LIFT_DEG), then drops down with an ease-out so the needle
   settles onto the record, plus a small bounce on touchdown.
   ────────────────────────────────────────────────────────────────── */
function Tonearm({ time, armPaths }) {
  const dropStart = 0.2;
  const dropDur   = 1.2;

  let p;
  if (time < dropStart)               p = 0;
  else if (time > dropStart + dropDur) p = 1;
  else                                p = (time - dropStart) / dropDur;

  const eased = easeOutCubic(p);

  // Tiny bounce when needle touches the disc.
  let bounce = 0;
  const touchT = dropStart + dropDur;
  if (time > touchT && time < touchT + 0.25) {
    const b = (time - touchT) / 0.25;
    bounce = Math.sin(b * Math.PI) * 1.4;
  }

  const angle = TONEARM_LIFT_DEG * (1 - eased) + bounce;

  return (
    <g transform={`rotate(${angle} ${TONEARM_PIVOT_X} ${TONEARM_PIVOT_Y})`}>
      {armPaths.map((p, i) => (
        <path key={i} d={p.d} fill={p.fill || RED} />
      ))}
    </g>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Music note glyphs (eighth, beamed pair, quarter).
   The transform shifts the glyph so (0,0) is its visual centre, so
   FloatingNote can place each one with translate/rotate/scale.
   ────────────────────────────────────────────────────────────────── */
function NoteGlyph({ kind = 'eighth', size = 1.0, color = BLUE }) {
  const wrap = `scale(${size}) translate(-50 -70)`;
  if (kind === 'eighth') {
    return (
      <g transform={wrap}>
        <ellipse cx="32" cy="108" rx="28" ry="20" fill={color} transform="rotate(-22 32 108)" />
        <rect x="55" y="20" width="8" height="92" fill={color} />
        <path d="M 63 20 Q 95 38 88 80 Q 85 50 63 50 Z" fill={color} />
      </g>
    );
  }
  if (kind === 'beamed') {
    return (
      <g transform={wrap}>
        <ellipse cx="22"  cy="112" rx="22" ry="16" fill={color} transform="rotate(-22 22 112)" />
        <ellipse cx="92"  cy="100" rx="22" ry="16" fill={color} transform="rotate(-22 92 100)" />
        <rect    x="42"   y="28"  width="6" height="86" fill={color} />
        <rect    x="112"  y="16"  width="6" height="86" fill={color} />
        <path    d="M 42 28 L 118 16 L 118 32 L 42 44 Z" fill={color} />
      </g>
    );
  }
  // 'quarter'
  return (
    <g transform={wrap}>
      <ellipse cx="32" cy="108" rx="28" ry="20" fill={color} transform="rotate(-22 32 108)" />
      <rect x="55" y="20" width="8" height="92" fill={color} />
    </g>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   FloatingNote — Sprite-equivalent for one drifting note.

   Each note is emitted at `start`, drifts upward/outward (with sway
   and a small rotation), pops in with a back-overshoot scale, and
   fades out near the end.
   ────────────────────────────────────────────────────────────────── */
function FloatingNote({
  time, start, dur,
  kind, side, size,
  lateral, lift,
  originDx, originDy,
  color = BLUE,
}) {
  if (time < start || time > start + dur) return null;

  const localTime = time - start;
  const progress  = clamp(localTime / dur, 0, 1);

  const easeUp = easeOutCubic(progress);
  const sway   = Math.sin(localTime * 2.4 + start) * 30;
  const dx     = side * lateral * easeOutQuad(progress) + sway;
  const dy     = -lift * easeUp;

  const scale = progress < 0.15
    ? easeOutBack(progress / 0.15) * 0.6 + 0.4
    : 1 + progress * 0.15;

  const rot = Math.sin(localTime * 1.6 + start * 2) * 14 + side * progress * 18;

  let opacity = 1;
  if (progress < 0.1)      opacity = progress / 0.1;
  else if (progress > 0.7) opacity = 1 - (progress - 0.7) / 0.3;

  const x = C_X + originDx + dx;
  const y = C_Y + originDy + dy;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${rot})`} opacity={opacity}>
      <NoteGlyph kind={kind} size={size} color={color} />
    </g>
  );
}

/* Pre-baked note emission schedule (lifted from scene.jsx).  Notes
   emerge from slightly varied positions around the C letter's opening
   so the emission doesn't look mechanical. */
const NOTE_SCHEDULE = [
  { start: 0.8, dur: 3.6, kind: 'eighth',  side:  1, size: 2.4, lateral: 480, lift: 900,  originDx:  20, originDy: -10 },
  { start: 1.1, dur: 3.6, kind: 'beamed',  side: -1, size: 2.6, lateral: 320, lift: 850,  originDx: -30, originDy:   0 },
  { start: 1.5, dur: 3.6, kind: 'quarter', side:  1, size: 2.0, lateral: 240, lift: 1000, originDx:  10, originDy:  20 },
  { start: 1.9, dur: 3.6, kind: 'eighth',  side: -1, size: 2.5, lateral: 540, lift: 880,  originDx: -10, originDy: -20 },
  { start: 2.3, dur: 3.6, kind: 'beamed',  side:  1, size: 2.2, lateral: 400, lift: 950,  originDx:  30, originDy:  10 },
  { start: 2.7, dur: 3.6, kind: 'quarter', side: -1, size: 2.4, lateral: 220, lift: 850,  originDx: -20, originDy:  20 },
  { start: 3.1, dur: 3.6, kind: 'eighth',  side:  1, size: 2.2, lateral: 580, lift: 920,  originDx:  40, originDy:   0 },
  { start: 3.5, dur: 3.6, kind: 'beamed',  side: -1, size: 2.5, lateral: 440, lift: 1000, originDx:  -5, originDy: -10 },
  { start: 3.9, dur: 3.6, kind: 'quarter', side:  1, size: 2.3, lateral: 340, lift: 880,  originDx:  20, originDy:  10 },
  { start: 4.3, dur: 3.6, kind: 'eighth',  side: -1, size: 2.3, lateral: 500, lift: 850,  originDx: -25, originDy: -10 },
  { start: 4.7, dur: 3.6, kind: 'beamed',  side:  1, size: 2.2, lateral: 260, lift: 850,  originDx:   0, originDy:  20 },
  { start: 5.1, dur: 3.6, kind: 'quarter', side: -1, size: 2.4, lateral: 380, lift: 950,  originDx: -15, originDy:  -5 },
  { start: 5.5, dur: 3.4, kind: 'eighth',  side:  1, size: 2.2, lateral: 460, lift: 880,  originDx:  25, originDy:  10 },
  { start: 5.9, dur: 3.2, kind: 'beamed',  side: -1, size: 2.5, lateral: 320, lift: 900,  originDx: -20, originDy:  20 },
  { start: 6.3, dur: 3.0, kind: 'quarter', side:  1, size: 2.2, lateral: 280, lift: 800,  originDx:  10, originDy: -15 },
  { start: 6.7, dur: 2.8, kind: 'eighth',  side: -1, size: 2.3, lateral: 420, lift: 850,  originDx: -10, originDy:  10 },
];

/* Pre-compute tonearm group composition (which paths render inside
   the rotating <g>, and which is the "anchor" placeholder). */
const TONEARM_INDICES = paths
  .map((_, i) => (TONEARM_PATH_IDS.has(i) ? i : -1))
  .filter((i) => i >= 0);
const TONEARM_FIRST = TONEARM_INDICES[0];

/* ─────────────────────────────────────────────────────────────────────
   MusicLogo — public component.

   Props:
     style     — inline style merged onto the <svg> (use this to size /
                 position the logo). The SVG keeps its 1664×2572 aspect
                 via preserveAspectRatio.
     noteColor — fill color for the floating music notes (default BLUE).
   ────────────────────────────────────────────────────────────────── */
export default function MusicLogo({ style = {}, noteColor = BLUE, className }) {
  const time = useLoopTime(DURATION);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', overflow: 'visible', ...style }}
      aria-label="Animated music logo: spinning vinyl record on a gramophone with floating music notes"
    >
      {paths.map((p, i) => {
        // Skip the giant inverse-mask rect.
        if (i === 0)  return null;
        // Skip the white inner highlight that sat on the static disc.
        if (i === 27) return null;
        // Replace the static disc top with the spinning version.
        if (i === 4)  return <SpinningDisc key="disc" time={time} />;
        // Tonearm paths render inside one rotating group.
        if (TONEARM_PATH_IDS.has(i)) {
          if (i !== TONEARM_FIRST) return null;
          return (
            <Tonearm
              key="tonearm"
              time={time}
              armPaths={TONEARM_INDICES.map((j) => paths[j])}
            />
          );
        }
        return <path key={i} d={p.d} fill={p.fill || RED} />;
      })}

      {NOTE_SCHEDULE.map((n, i) => (
        <FloatingNote key={i} time={time} color={noteColor} {...n} />
      ))}
    </svg>
  );
}
