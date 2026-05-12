/* ─────────────────────────────────────────────────────────────────────
   FootballMinimap.jsx

   Portrait football mini-map / radar (à la EA FC / FIFA bottom-screen
   minimap) showing a fluid attacking sequence:

     1. Build-up      — Team A's CM has the ball near the centre circle,
                        both teams shift dynamically.
     2. Pass 1        — CM → LB (left back).
     3. Pass 2        — LB → CM (give-and-go).
     4. Through ball  — CM plays the ball into space ahead of the ST.
     5. Goal          — ST runs onto the ball, shoots past the GK.
     6. Reset         — fade out → mirrored sequence with Team B
                        attacking the opposite goal → loop.

   Movement is driven by JavaScript + requestAnimationFrame. Each
   player has a list of keyframes (time + position); positions are
   eased (cubic in-out) between frames. The ball follows piece-wise
   bezier curves whose endpoints are sampled from the live player
   positions, so passes are *always* received cleanly regardless of
   the receiver's exact spot at hand-off time.

   Pitch viewBox: 400 × 800 (portrait, 1:2). Border colour matches
   the portfolio's gold accent; background matches BG_DARK.
   ────────────────────────────────────────────────────────────────── */

import React, { useEffect, useRef, useState } from 'react';

/* ── Theme ─────────────────────────────────────────────────────────── */
const ACCENT     = '#f0c040';   // pitch lines
const BG         = '#0a1628';   // pitch / website background
const A_COLOR    = '#3DA5D9';   // Team A (blue)
const B_COLOR    = '#A41623';   // Team B (red)
const BALL_COLOR = '#ffffff';

/* ── Pitch geometry ────────────────────────────────────────────────── */
const W   = 400;
const H   = 800;
const PAD = 22;     // pitch margin inside the viewBox
const HALF_Y = H / 2;

/* ── Loop timing ───────────────────────────────────────────────────── */
const SEQ_DUR = 6.0;            // one team's attacking sequence
const TOTAL   = SEQ_DUR * 2;    // full A → B → A loop

/* ── Easing ────────────────────────────────────────────────────────── */
const easeInOut = (t) => (t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2);

/* ─────────────────────────────────────────────────────────────────────
   Choreography — keyframes for the ATTACKING side and the DEFENDING
   side, both expressed for an attack going UPWARD (toward y = 0).
   For Team B's mirrored sequence we just reflect every output point
   through the pitch centre (x → W - x, y → H - y).

   Times are seconds within a 6 s sequence:

       0.0  →  fade in
       0.5  →  build-up (CM has the ball near the centre circle)
       1.0  →  PASS 1   (CM → LB)
       1.3  →  LB on the ball, advances
       2.5  →  PASS 2   (LB → CM, give-and-go)
       2.8  →  CM on the ball
       3.5  →  THROUGH BALL (CM → space ahead of ST)
       4.4  →  ST intersects the ball (just inside the box)
       4.4  →  SHOT begins
       4.7  →  ball crosses the goal line
       4.7  →  goal scored — players hold, ball sits in net
       5.5  →  fade out
       6.0  →  end of sequence
   ────────────────────────────────────────────────────────────────── */

const ATK = {
  // Goalkeeper — barely moves; little reaction shuffle late.
  GK: [
    { t: 0,   x: 200, y: 740 },
    { t: 4.5, x: 218, y: 728 },
    { t: 6,   x: 218, y: 728 },
  ],
  // Left back — receives Pass 1, returns it, then joins the attack.
  LB: [
    { t: 0,   x: 140, y: 600 },
    { t: 1.0, x: 155, y: 540 },  // arrives in passing lane
    { t: 2.5, x: 170, y: 510 },  // about to play return ball
    { t: 4.5, x: 220, y: 420 },  // pushes up after release
    { t: 6,   x: 220, y: 420 },
  ],
  // Right back — supports late, doesn't touch ball this sequence.
  RB: [
    { t: 0,   x: 260, y: 600 },
    { t: 1.5, x: 270, y: 520 },
    { t: 3.0, x: 290, y: 420 },
    { t: 5.0, x: 300, y: 400 },
    { t: 6,   x: 300, y: 400 },
  ],
  // Centre mid — carries the ball, plays both passes + through ball.
  CM: [
    { t: 0,   x: 200, y: 420 },  // start, near centre circle
    { t: 1.0, x: 205, y: 410 },  // releases Pass 1
    { t: 2.5, x: 215, y: 390 },  // adjusts to receive return
    { t: 2.8, x: 220, y: 385 },  // gets the give-and-go
    { t: 3.5, x: 230, y: 365 },  // releases through ball
    { t: 4.4, x: 235, y: 355 },  // settle after release
    { t: 6,   x: 235, y: 355 },
  ],
  // Striker — starts high, makes a sprint onto the through ball.
  ST: [
    { t: 0,   x: 200, y: 260 },
    { t: 1.5, x: 205, y: 240 },
    { t: 3.0, x: 215, y: 200 },  // begins the run
    { t: 3.5, x: 220, y: 175 },  // accelerates
    { t: 4.4, x: 232, y: 110 },  // intersects through ball
    { t: 4.7, x: 232, y:  80 },  // follows shot through
    { t: 6,   x: 232, y:  80 },
  ],
};

const DEF = {
  // Goalkeeper — shuffles, then dives across goal on the shot.
  GK: [
    { t: 0,   x: 200, y:  60 },
    { t: 4.0, x: 205, y:  75 },
    { t: 4.4, x: 218, y:  90 },  // commits to the dive
    { t: 4.7, x: 225, y: 100 },  // beaten, ball past
    { t: 6,   x: 225, y: 100 },
  ],
  LCB: [
    { t: 0,   x: 165, y: 160 },
    { t: 2.5, x: 175, y: 150 },
    { t: 4.4, x: 195, y: 120 },  // late — can't catch ST
    { t: 6,   x: 195, y: 120 },
  ],
  RCB: [
    { t: 0,   x: 235, y: 160 },
    { t: 2.5, x: 225, y: 150 },
    { t: 4.4, x: 215, y: 120 },
    { t: 6,   x: 215, y: 120 },
  ],
  DM: [
    { t: 0,   x: 200, y: 290 },
    { t: 2.0, x: 215, y: 300 },
    { t: 4.0, x: 235, y: 280 },
    { t: 6,   x: 235, y: 280 },
  ],
  AM: [
    { t: 0,   x: 200, y: 380 },
    { t: 1.5, x: 210, y: 395 },
    { t: 3.0, x: 220, y: 380 },
    { t: 6,   x: 220, y: 380 },
  ],
};

/* ── Player position from keyframes at time t ──────────────────────── */
function playerAt(name, t, frames) {
  const kf = frames[name];
  if (t <= kf[0].t) return { x: kf[0].x, y: kf[0].y };
  for (let i = 0; i < kf.length - 1; i++) {
    if (t >= kf[i].t && t <= kf[i + 1].t) {
      const span = kf[i + 1].t - kf[i].t;
      const local = span > 0 ? (t - kf[i].t) / span : 0;
      const e = easeInOut(local);
      return {
        x: kf[i].x + (kf[i + 1].x - kf[i].x) * e,
        y: kf[i].y + (kf[i + 1].y - kf[i].y) * e,
      };
    }
  }
  const last = kf[kf.length - 1];
  return { x: last.x, y: last.y };
}

/* ── Quadratic bezier (for ball passes / through ball / shot) ──────── */
function qbez(p0, p1, p2, t) {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

/* ─────────────────────────────────────────────────────────────────────
   Ball position at sequence-time `t`.

   Each segment samples the receiver's *live* position (via playerAt)
   so the pass always lands at the receiver's foot regardless of how
   the receiver's keyframes are tuned. Bezier control points are
   chosen to give passes a slight arc and the through ball a longer
   travel curve.
   ────────────────────────────────────────────────────────────────── */
function ballAt(t) {
  // Phase: with CM (pre-Pass-1)
  if (t <= 1.0) {
    const p = playerAt('CM', t, ATK);
    return { ...p, opacity: 1 };
  }
  // Pass 1: CM → LB
  if (t <= 1.3) {
    const p0 = playerAt('CM', 1.0, ATK);
    const p2 = playerAt('LB', 1.3, ATK);
    const p1 = { x: (p0.x + p2.x) / 2, y: (p0.y + p2.y) / 2 - 14 };
    return { ...qbez(p0, p1, p2, (t - 1.0) / 0.3), opacity: 1 };
  }
  // With LB
  if (t <= 2.5) {
    const p = playerAt('LB', t, ATK);
    return { ...p, opacity: 1 };
  }
  // Pass 2: LB → CM (give-and-go)
  if (t <= 2.8) {
    const p0 = playerAt('LB', 2.5, ATK);
    const p2 = playerAt('CM', 2.8, ATK);
    const p1 = { x: (p0.x + p2.x) / 2, y: (p0.y + p2.y) / 2 - 12 };
    return { ...qbez(p0, p1, p2, (t - 2.5) / 0.3), opacity: 1 };
  }
  // With CM
  if (t <= 3.5) {
    const p = playerAt('CM', t, ATK);
    return { ...p, opacity: 1 };
  }
  // Through ball: CM → space at (232, 110)
  if (t <= 4.4) {
    const p0    = playerAt('CM', 3.5, ATK);
    const p2    = { x: 232, y: 110 };
    const p1    = { x: 230, y: 240 };           // arched over the defenders
    return { ...qbez(p0, p1, p2, (t - 3.5) / 0.9), opacity: 1 };
  }
  // Shot: ball → goal mouth, passing the diving keeper
  if (t <= 4.7) {
    const p0 = { x: 232, y: 110 };
    const p2 = { x: 200, y: 22 };                 // just past the goal line
    const p1 = { x: 213, y: 55 };                 // curl to keeper's left
    return { ...qbez(p0, p1, p2, (t - 4.4) / 0.3), opacity: 1 };
  }
  // Goal scored — ball sits in the net
  if (t <= 5.3) {
    return { x: 200, y: 22, opacity: 1 };
  }
  // Fade out
  if (t <= 6.0) {
    return { x: 200, y: 22, opacity: Math.max(0, 1 - (t - 5.3) / 0.7) };
  }
  return { x: 200, y: 22, opacity: 0 };
}

/* ── Goal-celebration ring (expands + fades when ball hits net) ────── */
function goalRing(t) {
  const start = 4.7, end = 5.7;
  if (t < start || t > end) return { r: 0, opacity: 0 };
  const local = (t - start) / (end - start);
  return { r: 18 + local * 38, opacity: (1 - local) * 0.8 };
}

/* ── Sequence-wide fade in / out (hides the snap at seq boundaries) ─ */
function seqOpacity(t) {
  if (t < 0.4)              return t / 0.4;
  if (t > 5.5 && t <= 6.0)  return Math.max(0, 1 - (t - 5.5) / 0.5);
  return 1;
}

/* ── Mirror through pitch centre for Team B's sequence ─────────────── */
const mirror = (p) => ({ ...p, x: W - p.x, y: H - p.y });

/* ─────────────────────────────────────────────────────────────────────
   Compute every animated value for the whole frame at absolute time.
   Returns positions for both teams, the ball, the goal-flash, and an
   alpha multiplier for sequence transitions.
   ────────────────────────────────────────────────────────────────── */
function computeFrame(timeAbs, isBackground) {
  const cycle  = ((timeAbs % TOTAL) + TOTAL) % TOTAL;
  const isA    = cycle < SEQ_DUR;
  const seqT   = cycle - (isA ? 0 : SEQ_DUR);
  const alpha  = seqOpacity(seqT);
  const ringRaw = goalRing(seqT);

  if (isA) {
    // Team A attacks UP, Team B defends the top goal.
    const teamA = {
      GK: playerAt('GK', seqT, ATK),
      LB: playerAt('LB', seqT, ATK),
      RB: playerAt('RB', seqT, ATK),
      CM: playerAt('CM', seqT, ATK),
      ST: playerAt('ST', seqT, ATK),
    };
    const teamB = {
      GK:  playerAt('GK',  seqT, DEF),
      LCB: playerAt('LCB', seqT, DEF),
      RCB: playerAt('RCB', seqT, DEF),
      DM:  playerAt('DM',  seqT, DEF),
      AM:  playerAt('AM',  seqT, DEF),
    };
    const ring = { x: 200, y: PAD + 4, r: ringRaw.r, opacity: ringRaw.opacity };
    const separated = applyNonOverlap(teamA, teamB, isBackground);
    let ball = ballAt(seqT);
    
    // Background ball avoidance (center UI zone)
    if (isBackground) {
      const cx = 200, cy = 400;
      const dx = ball.x - cx, dy = ball.y - cy;
      const nx = dx / 80, ny = dy / 250;
      const dist = Math.sqrt(nx*nx + ny*ny);
      if (dist < 1 && dist > 0.01) {
        const easedPush = Math.pow(1 - dist, 1.5);
        ball.x += (nx / dist) * easedPush * 80;
        ball.y += (ny / dist) * easedPush * 250;
      }
    }

    return { teamA: separated.teamA, teamB: separated.teamB, ball, ring, alpha, attackingTeam: 'A' };
  } else {
    // Team B attacks DOWN (mirrored), Team A defends the bottom goal.
    const teamA = {
      GK:  mirror(playerAt('GK',  seqT, DEF)),
      LCB: mirror(playerAt('LCB', seqT, DEF)),
      RCB: mirror(playerAt('RCB', seqT, DEF)),
      DM:  mirror(playerAt('DM',  seqT, DEF)),
      AM:  mirror(playerAt('AM',  seqT, DEF)),
    };
    const teamB = {
      GK: mirror(playerAt('GK', seqT, ATK)),
      LB: mirror(playerAt('LB', seqT, ATK)),
      RB: mirror(playerAt('RB', seqT, ATK)),
      CM: mirror(playerAt('CM', seqT, ATK)),
      ST: mirror(playerAt('ST', seqT, ATK)),
    };
    const ballRaw = ballAt(seqT);
    const ring = { x: 200, y: H - PAD - 4, r: ringRaw.r, opacity: ringRaw.opacity };
    const separated = applyNonOverlap(teamA, teamB, isBackground);
    let ball = { x: W - ballRaw.x, y: H - ballRaw.y, opacity: ballRaw.opacity };

    // Background ball avoidance (center UI zone)
    if (isBackground) {
      const cx = 200, cy = 400;
      const dx = ball.x - cx, dy = ball.y - cy;
      const nx = dx / 80, ny = dy / 250;
      const dist = Math.sqrt(nx*nx + ny*ny);
      if (dist < 1 && dist > 0.01) {
        const easedPush = Math.pow(1 - dist, 1.5);
        ball.x += (nx / dist) * easedPush * 80;
        ball.y += (ny / dist) * easedPush * 250;
      }
    }

    return { teamA: separated.teamA, teamB: separated.teamB, ball, ring, alpha, attackingTeam: 'B' };
  }
}

/* ── Player radii (must match Dot) ─────────────────────────────────── */
const PLAYER_R = 7;
const GK_R     = 8;
const MIN_GAP  = 2;   // minimum pixel gap between circle edges

/* ── Push overlapping player circles apart (iterative relaxation) ──── */
function separatePlayers(players, iterations = 6, isBackground = false) {
  const pos = players.map(p => ({ ...p }));
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < pos.length; i++) {
      
      // Behavioral avoidance for background mode
      if (isBackground) {
        const cx = 200, cy = 400;
        const dx = pos[i].x - cx, dy = pos[i].y - cy;
        // SVG X = Screen Y (height). Screen text height is small.
        // SVG Y = Screen X (width). Screen text width is large.
        const nx = dx / 60, ny = dy / 150;
        const distToCenter = Math.sqrt(nx*nx + ny*ny);
        
        if (distToCenter < 1 && distToCenter > 0.01) {
          const push = (1 - distToCenter) * 0.05; 
          pos[i].x += (nx / distToCenter) * push * 60;
          pos[i].y += (ny / distToCenter) * push * 150;
        }
      }

      for (let j = i + 1; j < pos.length; j++) {
        const a = pos[i], b = pos[j];
        const minDist = a.r + b.r + MIN_GAP;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        if (dist < minDist) {
          const push = (minDist - dist) / 2;
          const nx = dx / dist, ny = dy / dist;
          a.x -= nx * push; a.y -= ny * push;
          b.x += nx * push; b.y += ny * push;
        }
      }
    }
  }
  return pos;
}

/* ── Apply non-overlap to both teams after keyframe interpolation ───── */
function applyNonOverlap(teamA, teamB, isBackground) {
  const aKeys = Object.keys(teamA);
  const bKeys = Object.keys(teamB);
  const players = [
    ...aKeys.map(k => ({ team: 'A', key: k, x: teamA[k].x, y: teamA[k].y, r: k === 'GK' ? GK_R : PLAYER_R })),
    ...bKeys.map(k => ({ team: 'B', key: k, x: teamB[k].x, y: teamB[k].y, r: k === 'GK' ? GK_R : PLAYER_R })),
  ];
  const sep = separatePlayers(players, 6, isBackground);
  const newA = {}, newB = {};
  sep.forEach(p => {
    if (p.team === 'A') newA[p.key] = { x: p.x, y: p.y };
    else                newB[p.key] = { x: p.x, y: p.y };
  });
  return { teamA: newA, teamB: newB };
}

/* ── Single player dot (with ring for the GK) ──────────────────────── */
function Dot({ x, y, color, isGK, isBackground }) {
  const r = (isGK ? GK_R : PLAYER_R) * (isBackground ? 1.8 : 1);
  return (
    <g>
      {isGK && (
        <circle cx={x} cy={y} r={r + 4} fill="none" stroke={color}
                strokeWidth={isBackground ? 2 : 1.2} opacity={0.45} />
      )}
      <circle cx={x} cy={y} r={r} fill={color} stroke={BG} strokeWidth={isBackground ? 2.5 : 1.4} />
      {isBackground && <circle cx={x} cy={y} r={r + 12} fill={color} opacity={0.35} />}
    </g>
  );
}

/* ── Main component ────────────────────────────────────────────────── */
export default function FootballMinimap({ style = {}, className, isBackground = false }) {
  const [time, setTime] = useState(0);
  const lastRef = useRef(null);

  useEffect(() => {
    let raf;
    const tick = (ts) => {
      if (lastRef.current == null) lastRef.current = ts;
      const rawDt = (ts - lastRef.current) / 1000;
      const dt = isBackground ? rawDt * 1.3 : rawDt;
      lastRef.current = ts;
      setTime((t) => (t + dt) % TOTAL);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      lastRef.current = null;
    };
  }, []);

  const f = computeFrame(time, isBackground);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', ...style }}
      aria-label="Animated football minimap: two teams scoring goals in alternating sequences"
    >
      {/* ── Soft Mask Defs ──────────────────────────────────────── */}
      {isBackground && (
        <defs>
          <radialGradient id="ui-mask-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="black" />
            <stop offset="15%" stopColor="black" />
            <stop offset="40%" stopColor="white" />
            <stop offset="100%" stopColor="white" />
          </radialGradient>
          <mask id="ui-mask">
            <rect width="100%" height="100%" fill="white" />
            <ellipse cx="200" cy="400" rx="90" ry="200" fill="url(#ui-mask-grad)" />
          </mask>
        </defs>
      )}

      {/* ── Pitch background ────────────────────────────────────── */}
      <rect width={W} height={H} fill={isBackground ? 'transparent' : BG} />

      {/* ── Pitch markings (border, halfway, centre circle, boxes) ── */}
      <g stroke={ACCENT} strokeWidth={isBackground ? 2.5 : 1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={isBackground ? 0.2 : 1}>
        {/* Outer border */}
        <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} rx={3} />
          {/* Halfway line */}
          <line x1={PAD} y1={HALF_Y} x2={W - PAD} y2={HALF_Y} />
          {/* Centre circle + spot */}
          <circle cx={W / 2} cy={HALF_Y} r={48} />
          <circle cx={W / 2} cy={HALF_Y} r={2} fill={ACCENT} />
          {/* Top penalty + 6-yard boxes + spot */}
          <rect x={W / 2 - 90} y={PAD} width={180} height={102} />
          <rect x={W / 2 - 42} y={PAD} width={84}  height={42}  />
          <circle cx={W / 2} cy={PAD + 70} r={2} fill={ACCENT} />
          {/* Bottom penalty + 6-yard boxes + spot */}
          <rect x={W / 2 - 90} y={H - PAD - 102} width={180} height={102} />
          <rect x={W / 2 - 42} y={H - PAD - 42}  width={84}  height={42}  />
        <circle cx={W / 2} cy={H - PAD - 70} r={2} fill={ACCENT} />
      </g>

      {/* ── Goal markings (thicker stroke just outside the pitch) ─ */}
      <g stroke={ACCENT} strokeWidth={isBackground ? 5 : 4} strokeLinecap="square" opacity={isBackground ? 0.2 : 1}>
        <line x1={W / 2 - 28} y1={PAD - 1}     x2={W / 2 + 28} y2={PAD - 1} />
        <line x1={W / 2 - 28} y1={H - PAD + 1} x2={W / 2 + 28} y2={H - PAD + 1} />
      </g>

      {/* ── Animated content (faded at sequence boundaries) ─────── */}
      <g opacity={f.alpha} mask={isBackground ? "url(#ui-mask)" : undefined}>
        {/* Goal-celebration ring (under players, over pitch) */}
        {f.ring.opacity > 0 && (
          <circle cx={f.ring.x} cy={f.ring.y} r={f.ring.r}
                  fill="none" stroke="#ffffff" strokeWidth={2}
                  opacity={f.ring.opacity} />
        )}

        {/* ── Team A players ─────────────────────────────────── */}
        <g>
          {Object.entries(f.teamA).map(([name, p]) => (
            <Dot key={`A-${name}`} x={p.x} y={p.y} color={A_COLOR}
                 isGK={name === 'GK'} isBackground={isBackground} />
          ))}
        </g>

        {/* ── Team B players ─────────────────────────────────── */}
        <g>
          {Object.entries(f.teamB).map(([name, p]) => (
            <Dot key={`B-${name}`} x={p.x} y={p.y} color={B_COLOR}
                 isGK={name === 'GK'} isBackground={isBackground} />
          ))}
        </g>

        {/* ── Ball — last in DOM so it always renders on top ── */}
        <circle
          cx={f.ball.x} cy={f.ball.y} r={isBackground ? 6 : 5}
          fill={BALL_COLOR}
          stroke={BG} strokeWidth={1}
          opacity={f.ball.opacity}
        />
      </g>
    </svg>
  );
}
