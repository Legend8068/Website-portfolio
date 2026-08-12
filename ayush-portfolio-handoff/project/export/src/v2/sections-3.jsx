/* global React, Reveal */
const { useEffect: useEffectP, useRef: useRefP, useState: useStateP } = React;

/* ============================================================
   PLAYGROUND  —  messy desk of terminal & shader windows
   ============================================================ */

const WINDOWS = [
  {
    id: "W-01",
    title: "shader · plasma.frag",
    sub: "exp · 0:14",
    x: "2%",  y: 0,    w: 360, h: 240, rot: -1.4, z: 6,
    kind: "plasma",
    name: "Plasma Field",
    note: "fbm noise + mood-warm",
  },
  {
    id: "W-02",
    title: "term · agent.run",
    sub: "live · 14:08",
    x: "30%", y: 70,  w: 380, h: 280, rot: 0.6, z: 8,
    kind: "agent",
    name: "Daily Agent",
    note: "AI · journal · local",
  },
  {
    id: "W-03",
    title: "spec · stft.exe",
    sub: "1024 fft",
    x: "58%", y: 12, w: 320, h: 200, rot: -0.8, z: 5,
    kind: "spectro",
    name: "Spectrogram",
    note: "audio · 22.05k",
  },
  {
    id: "W-04",
    title: "draft · cursor-echo",
    sub: "interaction",
    x: "78%", y: 130, w: 260, h: 240, rot: 2.2, z: 7,
    kind: "echo",
    name: "Cursor Echo",
    note: "spring · 18 iters",
  },
  {
    id: "W-05",
    title: "term · drift.py",
    sub: "ascii",
    x: "5%", y: 300, w: 340, h: 220, rot: 1.2, z: 4,
    kind: "drift",
    name: "Drift",
    note: "generative ascii",
  },
  {
    id: "W-06",
    title: "shader · lattice.frag",
    sub: "isometric",
    x: "40%", y: 380, w: 340, h: 240, rot: -0.4, z: 9,
    kind: "lattice",
    name: "Lattice",
    note: "iso · sage",
  },
  {
    id: "W-07",
    title: "term · type-tool",
    sub: "REPL",
    x: "70%", y: 410, w: 320, h: 220, rot: 1.6, z: 6,
    kind: "type",
    name: "Type-tool",
    note: "kerning REPL",
  },
  {
    id: "W-08",
    title: "drawing · transit-lines",
    sub: "principle test",
    x: "15%", y: 580, w: 580, h: 200, rot: -0.6, z: 3,
    kind: "transit",
    name: "Transit Principle",
    note: "motion · 3 anchors",
  },
];

function WinVisual({ kind }) {
  if (kind === "plasma") {
    return (
      <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
        <defs>
          <radialGradient id="pl1" cx="0.3" cy="0.5"><stop offset="0" stopColor="rgba(200,167,114,0.55)"/><stop offset="1" stopColor="rgba(200,167,114,0)"/></radialGradient>
          <radialGradient id="pl2" cx="0.8" cy="0.3"><stop offset="0" stopColor="rgba(154,170,134,0.4)"/><stop offset="1" stopColor="rgba(154,170,134,0)"/></radialGradient>
        </defs>
        <rect width="400" height="240" fill="url(#pl1)"/>
        <rect width="400" height="240" fill="url(#pl2)"/>
        <g stroke="rgba(236,232,222,0.18)" fill="none">
          {Array.from({length:20}).map((_,i)=>(
            <path key={i} d={`M 0 ${10 + i * 12} Q 200 ${4 + i * 14} 400 ${20 + i * 11}`} strokeWidth="0.7"/>
          ))}
        </g>
        <text x="10" y="226" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(236,232,222,0.55)">u_mood = vec3(0.42, 0.7, 0.18)</text>
      </svg>
    );
  }
  if (kind === "agent") {
    return (
      <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
        <rect width="400" height="280" fill="rgba(13,13,11,0.4)"/>
        <g fontFamily="JetBrains Mono" fontSize="10" fill="rgba(236,232,222,0.7)">
          <text x="14" y="24" fill="var(--accent)">$ agent.run --since 09:00</text>
          <text x="14" y="44">[09:12] noticed: 2 unfinished sketches in Atlas</text>
          <text x="14" y="60">       → grouped under "vessel · audio"</text>
          <text x="14" y="80">[10:48] picked up: cmd-shift-K twice</text>
          <text x="14" y="96">       → opened search before naming</text>
          <text x="14" y="116">[12:20] memo: <tspan fill="var(--accent-2)">"the best layouts I make</tspan></text>
          <text x="14" y="132">              <tspan fill="var(--accent-2)">start from one anchor."</tspan></text>
          <text x="14" y="152">[14:08] agent.summary →</text>
          <text x="14" y="168" fill="var(--accent)">  3 ideas, 1 question, 2 todos</text>
          <text x="14" y="200" fill="rgba(236,232,222,0.4)">─────────────────────────────────</text>
          <text x="14" y="220" fill="var(--accent-3)">? want me to draft a daily-end note?</text>
          <text x="14" y="240">  [y/n] _</text>
          <text x="14" y="266" fill="rgba(236,232,222,0.4)">local-only · 0 net</text>
        </g>
      </svg>
    );
  }
  if (kind === "spectro") {
    return (
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
        <rect width="320" height="200" fill="rgba(13,13,11,0.5)"/>
        {Array.from({length:80}).map((_,i)=>{
          const h = 20 + Math.abs(Math.sin(i/2.2) * 90) + (i % 11) * 4;
          return <rect key={i} x={4 + i * 3.9} y={180 - h} width="2.3" height={h}
            fill={i % 9 === 0 ? "var(--accent)" : (i % 5 === 0 ? "var(--accent-2)" : "rgba(236,232,222,0.5)")}/>;
        })}
        <line x1="0" y1="180" x2="320" y2="180" stroke="rgba(236,232,222,0.25)"/>
        <text x="10" y="196" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(236,232,222,0.55)">0 — 11.025 kHz · window 1024</text>
      </svg>
    );
  }
  if (kind === "echo") {
    return (
      <svg viewBox="0 0 260 240" style={{ width: "100%", height: "100%" }}>
        <rect width="260" height="240" fill="rgba(13,13,11,0.3)"/>
        {[8, 18, 32, 50, 72, 96, 124].map((r, i) => (
          <circle key={i} cx="130" cy="140" r={r}
            fill="none"
            stroke={i === 3 ? "var(--accent)" : "rgba(236,232,222,0.2)"}
            strokeDasharray={i % 2 ? "3 4" : "none"}/>
        ))}
        <circle cx="130" cy="140" r="3" fill="var(--accent)"/>
        <text x="14" y="24" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(236,232,222,0.55)">spring · k=140 d=12</text>
        <text x="14" y="40" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(236,232,222,0.55)">trail · 7 echoes</text>
      </svg>
    );
  }
  if (kind === "drift") {
    return (
      <svg viewBox="0 0 340 220" style={{ width: "100%", height: "100%" }}>
        <rect width="340" height="220" fill="rgba(13,13,11,0.4)"/>
        <g fontFamily="JetBrains Mono" fontSize="9" fill="rgba(236,232,222,0.55)">
          {Array.from({length:16}).map((_,row)=>(
            <text key={row} x="12" y={26 + row * 12}>
              {Array.from({length:42}).map((__,col)=>{
                const v = (Math.sin(col/3 + row/2) + Math.cos(col/4 - row/3));
                return v > 0.6 ? "▓" : v > 0.0 ? "▒" : v > -0.6 ? "░" : "·";
              }).join("")}
            </text>
          ))}
        </g>
        <rect x="0" y="0" width="340" height="220" fill="url(#dgrad)"/>
        <defs>
          <linearGradient id="dgrad" x1="0" x2="1"><stop offset="0" stopColor="rgba(200,167,114,0.15)"/><stop offset="1" stopColor="rgba(200,167,114,0)"/></linearGradient>
        </defs>
      </svg>
    );
  }
  if (kind === "lattice") {
    return (
      <svg viewBox="0 0 340 240" style={{ width: "100%", height: "100%" }}>
        <rect width="340" height="240" fill="rgba(13,13,11,0.4)"/>
        <g stroke="rgba(154,170,134,0.45)" fill="none">
          {Array.from({length:12}).map((_,i)=>(
            <g key={i}>
              <line x1={20 + i * 26} y1="40"  x2={20 + i * 26 - 60} y2="200"/>
              <line x1={20 + i * 26} y1="40"  x2={20 + i * 26 + 60} y2="200"/>
            </g>
          ))}
          {Array.from({length:6}).map((_,i)=>(
            <path key={i} d={`M ${0} ${40 + i*32} L ${340} ${40 + i*32}`} strokeDasharray="2 4"/>
          ))}
        </g>
        <text x="14" y="26" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(236,232,222,0.55)">iso-30° · sage</text>
      </svg>
    );
  }
  if (kind === "type") {
    return (
      <svg viewBox="0 0 320 220" style={{ width: "100%", height: "100%" }}>
        <rect width="320" height="220" fill="rgba(13,13,11,0.4)"/>
        <text x="20" y="80"
          fontFamily="Instrument Serif" fontSize="84" fontStyle="italic" fill="rgba(236,232,222,0.9)" letterSpacing="-3">Aa</text>
        <line x1="20" y1="92" x2="160" y2="92" stroke="var(--accent)" strokeWidth="0.7"/>
        <line x1="20" y1="36" x2="160" y2="36" stroke="rgba(236,232,222,0.3)" strokeDasharray="2 2" strokeWidth="0.6"/>
        <g fontFamily="JetBrains Mono" fontSize="9" fill="rgba(236,232,222,0.55)">
          <text x="170" y="56">cap-h · 56</text>
          <text x="170" y="74">x-h · 38</text>
          <text x="170" y="92">baseline · 92</text>
          <text x="170" y="116">track · -3</text>
          <text x="170" y="134">slant · 14°</text>
        </g>
        <line x1="200" y1="170" x2="280" y2="170" stroke="var(--accent)"/>
        <text x="20" y="180" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(236,232,222,0.55)">REPL · type-tool v0.2 ‹ a / shift ›</text>
      </svg>
    );
  }
  if (kind === "transit") {
    return (
      <svg viewBox="0 0 580 200" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
        <rect width="580" height="200" fill="rgba(13,13,11,0.4)"/>
        <path d="M 20 140 C 160 140, 200 60, 290 60 S 460 140, 560 140"
          stroke="var(--accent)" fill="none" strokeWidth="1.2" strokeDasharray="2 4"/>
        {/* anchors */}
        {[
          { x: 20,  y: 140, l: "A · idle",   t: "0.0s" },
          { x: 290, y: 60,  l: "B · gather", t: "0.6s" },
          { x: 560, y: 140, l: "C · settle", t: "1.4s" },
        ].map((a, i) => (
          <g key={i}>
            <circle cx={a.x} cy={a.y} r="4" fill="var(--accent)"/>
            <circle cx={a.x} cy={a.y} r="9" fill="none" stroke="var(--accent)" strokeDasharray="2 2"/>
            <text x={a.x + 12} y={a.y - 8} fontFamily="JetBrains Mono" fontSize="10" fill="rgba(236,232,222,0.85)">{a.l}</text>
            <text x={a.x + 12} y={a.y + 8} fontFamily="JetBrains Mono" fontSize="9" fill="var(--accent-2)">{a.t}</text>
          </g>
        ))}
        <g fontFamily="JetBrains Mono" fontSize="9" fill="rgba(236,232,222,0.4)">
          <text x="20" y="186">PRINCIPLE · motion has three anchors max</text>
          <text x="420" y="186">EASING · expo-out 0.85</text>
        </g>
      </svg>
    );
  }
  return null;
}

function PlaygroundSection() {
  return (
    <section id="playground" className="section">
      <div className="wrap">
        <Reveal className="section-label">
          <span className="idx">03</span>
          <span className="label">Playground</span>
          <span className="rule"></span>
          <span className="meta-r">8 OPEN WINDOWS · ACTIVE DESK · WEEKLY</span>
        </Reveal>
        <div className="play-intro">
          <Reveal className="lead" delay={1}>
            A working desk of unfinished ideas.<br/>
            Half are dead-ends. The other half become projects.
          </Reveal>
          <Reveal className="side" delay={2}>
            // Most of what I think with starts here. Each window stays open until it stops teaching me something. Hover to lift; click into a project once it earns the title page.
          </Reveal>
        </div>

        <div className="play-desk">
          {WINDOWS.map((w, i) => (
            <Reveal
              key={w.id}
              className="window"
              delay={Math.min(i, 6)}
              data-cursor="link"
              style={{
                left: w.x,
                top: w.y,
                width: w.w,
                height: w.h,
                zIndex: w.z,
                transform: `rotate(${w.rot}deg)`,
                "--rot": `${w.rot}deg`,
              }}
            >
              <div className="titlebar">
                <div className="left">
                  <span className="dots"><i className="live"></i><i></i><i></i></span>
                  <span>{w.title}</span>
                </div>
                <div className="right">{w.id} · {w.sub}</div>
              </div>
              <div className="body">
                <WinVisual kind={w.kind} />
              </div>
              <div className="label-bottom">
                <span className="t">{w.name}</span>
                <span className="right-note">{w.note}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SIGNAL
   ============================================================ */
function SignalSection() {
  return (
    <section id="signal" className="section signal">
      <div className="wrap">
        <Reveal className="section-label">
          <span className="idx">04</span>
          <span className="label">Signal</span>
          <span className="rule"></span>
          <span className="meta-r">CHANNELS · 4 · TYPICAL REPLY {"<"} 24H</span>
        </Reveal>

        <div className="signal-stage">
          <Reveal as="h2" className="signal-headline display" delay={1}>
            Let's build something
            <br/>
            <span className="italic">unmistakable.</span>
          </Reveal>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Reveal className="signal-card" delay={1}>
              <h4>// NETWORKS</h4>
              <div className="links">
                <a href="mailto:hello@ayushsingh.dev" data-cursor="link">
                  <span>hello@ayushsingh.dev</span>
                  <span className="arr">↗ mail</span>
                </a>
                <a href="#" data-cursor="link">
                  <span>github.com/ayushsingh</span>
                  <span className="arr">↗ code</span>
                </a>
                <a href="#" data-cursor="link">
                  <span>linkedin.com/in/ayush-singh</span>
                  <span className="arr">↗ network</span>
                </a>
                <a href="#" data-cursor="link">
                  <span>read.cv/ayush</span>
                  <span className="arr">↗ cv</span>
                </a>
              </div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-dim)" }}>
                ↳ Replace placeholders with your real handles — click any line to edit.
              </p>
            </Reveal>

            <Reveal className="signal-card" delay={2}>
              <h4>// COORDINATES</h4>
              <div className="row"><span>Locale</span><span className="v">Singapore · GMT+8</span></div>
              <div className="row"><span>Status</span><span className="v">Available · S26+ internships</span></div>
              <div className="row"><span>Open to</span><span className="v">SWE · creative-eng · AI tools</span></div>
              <div className="row"><span>Currently</span><span className="v">Atlas v0.4 · Vessel audio</span></div>
            </Reveal>
          </div>
        </div>

        <div className="footer">
          <span>© AYUSH SINGH · 2026</span>
          <span>BUILD 04.0 · TACTILE ENGINEERING</span>
          <span>NO TEMPLATE · NO BENTO</span>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { PlaygroundSection, SignalSection });
