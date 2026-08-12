/* global React, useElementScrollProgress, clamp, lerp, smoothstep, easeOut */
const { useEffect: useEffectH, useRef: useRefH, useState: useStateH, useMemo: useMemoH } = React;

/* ============================================================
   HERO — Person → Creative Engineer
   Pinned via position: sticky inside a tall wrapper.
   ============================================================ */
function Hero() {
  const wrapRef = useRefH(null);
  const p = useElementScrollProgress(wrapRef);   // 0..1 over the pinned region

  // Stage-stops
  // 0.00 – 0.18 : enter — name parallax + face holds
  // 0.18 – 0.42 : VISOR scales in
  // 0.36 – 0.62 : WIREFRAME mesh fades over jaw
  // 0.55 – 0.85 : BRACKETS + NODES lock in
  // 0.85 – 1.00 : label crossfade Person → Creative Engineer
  const tVisor   = smoothstep(0.18, 0.42, p);
  const tMesh    = smoothstep(0.36, 0.62, p);
  const tLock    = smoothstep(0.55, 0.85, p);
  const tLabel   = smoothstep(0.85, 1.00, p);

  // background name parallax + dim
  const nameY = lerp(0, -120, p);
  const nameDim = lerp(1, 0.35, easeOut(p));

  // face slight zoom + rise
  const faceScale = lerp(1, 1.06, p);
  const faceY = lerp(0, -28, p);

  const stage =
    p < 0.18 ? "boot" :
    p < 0.6  ? "augmenting" :
    p < 0.9  ? "locking" : "engineer";

  return (
    <div className="hero-scroll-wrap" ref={wrapRef} id="hero">
      <div className="hero-sticky">
        {/* head bar — stage indicator + progress */}
        <div className="hero-headbar">
          <div className="left">
            <span className="stamp-tag"><span className="b">01 / HERO</span> · TRANSITION SEQUENCE</span>
          </div>
          <div className="center">
            <span className={"label" + (stage === "boot" ? " active" : "")}>I · PERSON</span>
            <span className="arrow">→</span>
            <span className={"label" + (stage === "augmenting" ? " active" : "")}>II · AUGMENT</span>
            <span className="arrow">→</span>
            <span className={"label" + (stage === "locking" ? " active" : "")}>III · LOCK</span>
            <span className="arrow">→</span>
            <span className={"label" + (stage === "engineer" ? " active" : "")}>IV · ENGINEER</span>
          </div>
          <div className="progress">
            <span className="pct">{String(Math.round(p * 100)).padStart(3, "0")}%</span>
            <span className="bar" style={{ "--p": p.toFixed(3) }}></span>
          </div>
        </div>

        {/* main stage */}
        <div className="hero-stage">
          {/* Layer 1 — giant name */}
          <div className="hero-name" style={{ opacity: nameDim }}>
            <div className="name" style={{ "--name-y": `${nameY}px` }}>
              AYUSH<span className="red">.</span>SINGH
            </div>
          </div>

          {/* Layer 2/3 — face + augmentations */}
          <svg className="hero-svg" viewBox="0 0 600 700" preserveAspectRatio="xMidYMax meet">
            <defs>
              <linearGradient id="visorG" x1="0" x2="1">
                <stop offset="0"   stopColor="rgba(178,34,52,0.0)"/>
                <stop offset="0.4" stopColor="rgba(178,34,52,0.6)"/>
                <stop offset="0.7" stopColor="rgba(29,63,191,0.55)"/>
                <stop offset="1"   stopColor="rgba(29,63,191,0)"/>
              </linearGradient>
              <linearGradient id="visorG2" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="rgba(244,240,234,0.55)"/>
                <stop offset="1" stopColor="rgba(244,240,234,0)"/>
              </linearGradient>
              <clipPath id="lowerFace">
                {/* lower jaw region — mesh only fills here */}
                <path d="M 200 410 Q 200 540 300 600 Q 400 540 400 410 L 400 480 Q 300 540 200 480 Z"/>
              </clipPath>
            </defs>

            {/* ─── BASE FACE — geometric flat vector ─────────────── */}
            <g style={{ transform: `translateY(${faceY}px) scale(${faceScale})`, transformOrigin: "300px 600px" }}>
              {/* shoulders / collar */}
              <path d="M 60 700 L 60 640 Q 180 580 300 580 Q 420 580 540 640 L 540 700 Z"
                fill="var(--ink)"/>
              {/* neck */}
              <rect x="270" y="500" width="60" height="100" fill="var(--ink)"/>
              {/* head */}
              <path d="M 200 220
                       Q 200 120 300 120
                       Q 400 120 400 220
                       L 400 410
                       Q 400 540 300 540
                       Q 200 540 200 410 Z"
                fill="var(--ink)" />
              {/* hair block (slightly squared) */}
              <path d="M 198 230 Q 188 130 300 110 Q 412 130 402 230 L 402 200 Q 402 150 300 144 Q 198 150 198 200 Z"
                fill="var(--accent)" opacity="0.95" />

              {/* face plane — cream cutout for features */}
              <g>
                {/* eye line */}
                <line x1="232" y1="262" x2="368" y2="262" stroke="var(--bg)" strokeWidth="2" opacity={1 - tVisor * 0.85}/>
                {/* eyes */}
                <rect x="244" y="252" width="40" height="14" fill="var(--bg)" opacity={1 - tVisor * 0.85}/>
                <rect x="316" y="252" width="40" height="14" fill="var(--bg)" opacity={1 - tVisor * 0.85}/>
                {/* brow */}
                <rect x="240" y="236" width="48" height="3" fill="var(--bg)" opacity={1 - tVisor * 0.85}/>
                <rect x="312" y="236" width="48" height="3" fill="var(--bg)" opacity={1 - tVisor * 0.85}/>
                {/* nose */}
                <path d="M 300 280 L 286 360 L 314 360 Z" fill="none" stroke="var(--bg)" strokeWidth="2" opacity={1 - tMesh * 0.6}/>
                {/* mouth */}
                <line x1="270" y1="430" x2="330" y2="430" stroke="var(--bg)" strokeWidth="3" opacity={1 - tMesh * 0.6}/>
                {/* jaw shadow */}
                <path d="M 210 410 Q 300 540 390 410" stroke="var(--bg)" strokeWidth="1.2" fill="none" opacity="0.25"/>
              </g>
            </g>

            {/* ─── LAYER 3a — AR/Spatial visor ──────────────────── */}
            <g style={{
                transform: `translate(0,${(1 - tVisor) * -10}px) scaleY(${0.3 + tVisor * 0.7})`,
                transformOrigin: "300px 262px",
                opacity: tVisor,
              }}>
              {/* outer frame */}
              <rect x="200" y="238" width="200" height="58" rx="6"
                fill="rgba(17,17,17,0.85)" stroke="var(--ink)" strokeWidth="2"/>
              {/* translucent lens */}
              <rect x="206" y="244" width="188" height="46" rx="4" fill="url(#visorG)"/>
              <rect x="206" y="244" width="188" height="46" rx="4" fill="url(#visorG2)" opacity="0.55"/>
              {/* scanline */}
              <line x1="208" y1="266" x2="392" y2="266" stroke="rgba(244,240,234,0.55)" strokeWidth="1" strokeDasharray="3 4"/>
              {/* hud micro-text */}
              <text x="216" y="259" fontFamily="JetBrains Mono" fontSize="8" fill="rgba(244,240,234,0.85)" letterSpacing="1">
                AR · vMode 0.4 · OK
              </text>
              <text x="304" y="285" fontFamily="JetBrains Mono" fontSize="8" fill="rgba(244,240,234,0.7)" letterSpacing="1">
                fps 90  ·  pose ✓  ·  ttf 4.2ms
              </text>
              {/* bridge */}
              <rect x="293" y="252" width="14" height="6" fill="var(--ink)"/>
              {/* temple arms */}
              <rect x="180" y="258" width="22" height="6" fill="var(--ink)"/>
              <rect x="398" y="258" width="22" height="6" fill="var(--ink)"/>
              {/* status pip */}
              <circle cx="386" cy="252" r="3" fill="var(--accent)"/>
            </g>

            {/* ─── LAYER 3b — wireframe mesh on lower face ──────── */}
            <g clipPath="url(#lowerFace)" style={{ opacity: tMesh }}>
              {/* triangulated network */}
              {meshLines.map((ln, i) => (
                <line key={i} x1={ln[0]} y1={ln[1]} x2={ln[2]} y2={ln[3]}
                  stroke="rgba(244,240,234,0.85)" strokeWidth="1"
                  strokeDasharray="2 3"/>
              ))}
              {meshNodes.map((n, i) => (
                <circle key={i} cx={n[0]} cy={n[1]} r="2.2"
                  fill={i % 3 === 0 ? "var(--accent)" : "rgba(244,240,234,0.95)"}/>
              ))}
            </g>

            {/* ─── LAYER 3c — corner brackets ──────────────────── */}
            <g style={{ opacity: tLock }}>
              <Bracket cx={130} cy={150} dir="tl" t={tLock}/>
              <Bracket cx={470} cy={150} dir="tr" t={tLock}/>
              <Bracket cx={130} cy={560} dir="bl" t={tLock}/>
              <Bracket cx={470} cy={560} dir="br" t={tLock}/>
            </g>

            {/* ─── LAYER 3d — floating geometric nodes ─────────── */}
            <g style={{ opacity: tLock }}>
              {floatNodes.map((n, i) => (
                <g key={i} style={{
                    transform: `translate(${lerp(n.fromX, n.x, easeOut(tLock))}px, ${lerp(n.fromY, n.y, easeOut(tLock))}px)`,
                  }}>
                  {n.shape === "sq"  && <rect x="-5" y="-5" width="10" height="10" fill="var(--ink)" stroke="var(--accent)" strokeWidth="1"/>}
                  {n.shape === "dot" && <circle r="3.5" fill="var(--accent)"/>}
                  {n.shape === "ring" && <circle r="6" fill="none" stroke="var(--ink)" strokeWidth="1.6"/>}
                  {n.shape === "cross" && (
                    <g stroke="var(--ink)" strokeWidth="1.6">
                      <line x1="-6" y1="0" x2="6" y2="0"/>
                      <line x1="0" y1="-6" x2="0" y2="6"/>
                    </g>
                  )}
                </g>
              ))}
            </g>

            {/* ─── LAYER 3e — annotation tags ──────────────────── */}
            <g style={{ opacity: tLock }} fontFamily="JetBrains Mono" fontSize="10" letterSpacing="1">
              <line x1="130" y1="262" x2="200" y2="262" stroke="var(--ink)" strokeWidth="1.2"/>
              <rect x="46" y="252" width="84" height="20" fill="var(--ink)"/>
              <text x="56" y="266" fill="var(--bg)">VISOR · AR/SC</text>

              <line x1="470" y1="450" x2="400" y2="450" stroke="var(--accent)" strokeWidth="1.2"/>
              <rect x="470" y="440" width="86" height="20" fill="var(--accent)"/>
              <text x="482" y="454" fill="var(--bg)">MESH · 142v</text>

              <line x1="300" y1="120" x2="300" y2="80" stroke="var(--ink)" strokeWidth="1.2"/>
              <rect x="240" y="58" width="120" height="22" fill="var(--bg)" stroke="var(--ink)" strokeWidth="2"/>
              <text x="262" y="74" fill="var(--ink)">CREATIVE / ENGINEER</text>
            </g>
          </svg>

          {/* side typographic labels */}
          <div className="hero-side l">SCROLL TO MORPH · 01 → 04</div>
          <div className="hero-side r">SPRING / SINGAPORE · 26</div>

          {/* state tags floating */}
          <div className="hero-overlay-tag" style={{ left: 28, bottom: 22, opacity: 1 - tLabel }}>
            STATE · PERSON
          </div>
          <div className="hero-overlay-tag" style={{ left: 28, bottom: 22, background: "var(--accent)", opacity: tLabel }}>
            STATE · CREATIVE ENGINEER
          </div>
          <div className="hero-overlay-tag" style={{ right: 28, bottom: 22 }}>
            FRAME · 0{Math.min(4, Math.floor(p * 4) + 1)} / 04
          </div>
        </div>

        {/* foot rail — biodata seed */}
        <div className="hero-foot">
          <div className="cell">
            <span className="k">// SUBJECT</span>
            <span className="v">AYUSH SINGH</span>
          </div>
          <div className="cell">
            <span className="k">// ROLE</span>
            <span className="v acc">CREATIVE ENGINEER · CDS</span>
          </div>
          <div className="cell">
            <span className="k">// ERA</span>
            <span className="v">SINGAPORE / 2026 — ∞</span>
          </div>
          <div className="cell">
            <span className="k">// STATUS</span>
            <span className="v">AVAILABLE · S26+ INTERNSHIPS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bracket({ cx, cy, dir, t }) {
  const L = 36;
  const W = 3;
  const offset = (1 - t) * 18 * (dir.includes("l") ? -1 : 1);
  const offY   = (1 - t) * 18 * (dir.includes("t") ? -1 : 1);
  const lines = [];
  if (dir === "tl") {
    lines.push([cx, cy, cx + L, cy], [cx, cy, cx, cy + L]);
  } else if (dir === "tr") {
    lines.push([cx, cy, cx - L, cy], [cx, cy, cx, cy + L]);
  } else if (dir === "bl") {
    lines.push([cx, cy, cx + L, cy], [cx, cy, cx, cy - L]);
  } else if (dir === "br") {
    lines.push([cx, cy, cx - L, cy], [cx, cy, cx, cy - L]);
  }
  return (
    <g style={{ transform: `translate(${offset}px,${offY}px)` }}>
      {lines.map((ln, i) => (
        <line key={i} x1={ln[0]} y1={ln[1]} x2={ln[2]} y2={ln[3]}
          stroke="var(--ink)" strokeWidth={W} strokeLinecap="square"/>
      ))}
    </g>
  );
}

/* precomputed mesh lines + nodes — sit only inside lowerFace clip path */
const meshNodes = [
  [220, 420], [260, 412], [300, 410], [340, 412], [380, 420],
  [232, 458], [274, 452], [300, 460], [326, 452], [368, 458],
  [248, 500], [284, 510], [300, 520], [316, 510], [352, 500],
  [274, 540], [300, 552], [326, 540]
];
const meshLines = (() => {
  const out = [];
  const link = (a, b) => out.push([meshNodes[a][0], meshNodes[a][1], meshNodes[b][0], meshNodes[b][1]]);
  // horizontal rows
  for (let r = 0; r < 3; r++) {
    const base = r * 5;
    for (let c = 0; c < 4; c++) link(base + c, base + c + 1);
  }
  // verticals
  for (let c = 0; c < 5; c++) { link(c, c + 5); link(c + 5, c + 10); }
  // diagonals
  link(0, 6); link(2, 6); link(2, 8); link(4, 8);
  link(5, 11); link(7, 11); link(7, 13); link(9, 13);
  link(10, 15); link(12, 15); link(12, 17); link(14, 17);
  link(11, 15); link(13, 17);
  return out;
})();
const floatNodes = [
  { fromX: -40, fromY: 100,  x: 110, y: 200, shape: "sq" },
  { fromX: 640, fromY: 110,  x: 490, y: 200, shape: "ring" },
  { fromX: -40, fromY: 460,  x: 90,  y: 460, shape: "dot" },
  { fromX: 640, fromY: 460,  x: 510, y: 460, shape: "cross" },
  { fromX: 300, fromY: -60,  x: 200, y: 70,  shape: "dot" },
  { fromX: 300, fromY: -60,  x: 400, y: 70,  shape: "cross" },
  { fromX: 300, fromY: 760,  x: 250, y: 670, shape: "sq" },
  { fromX: 300, fromY: 760,  x: 350, y: 670, shape: "ring" },
];

Object.assign(window, { Hero });
