/* global React, Reveal */
const { useEffect: useEffectP, useRef: useRefP, useState: useStateP } = React;

/* ============================================================
   PLAYGROUND
   ============================================================ */
const PLAY = [
  { id: "P-01", title: "Glyph Plasma", note: "Shader study", size: "w6", kind: "plasma" },
  { id: "P-02", title: "Cursor Echo", note: "Interaction toy", size: "w3", kind: "echo" },
  { id: "P-03", title: "Drift", note: "Generative", size: "w3", kind: "drift" },
  { id: "P-04", title: "Field Notes", note: "AI · daily-log", size: "w4", kind: "field" },
  { id: "P-05", title: "Spectrogram", note: "Audio · visualization", size: "w4", kind: "spec" },
  { id: "P-06", title: "Soft Grid", note: "Layout experiment", size: "w4", kind: "softgrid" },
  { id: "P-07", title: "Long-form transit", note: "Motion principle test", size: "w12", kind: "transit" },
];

function PlayVisual({ kind }) {
  if (kind === "plasma") {
    return (
      <svg viewBox="0 0 400 250" style={{ width: "100%", height: "100%" }}>
        <defs>
          <radialGradient id="p1" cx="0.3" cy="0.6">
            <stop offset="0" stopColor="rgba(111,168,255,0.5)"/>
            <stop offset="1" stopColor="rgba(111,168,255,0)"/>
          </radialGradient>
          <radialGradient id="p2" cx="0.8" cy="0.3">
            <stop offset="0" stopColor="rgba(200,214,240,0.35)"/>
            <stop offset="1" stopColor="rgba(200,214,240,0)"/>
          </radialGradient>
        </defs>
        <rect width="400" height="250" fill="url(#p1)"/>
        <rect width="400" height="250" fill="url(#p2)"/>
        <g stroke="rgba(232,237,245,0.18)" fill="none">
          {Array.from({ length: 24 }).map((_, i) => (
            <path key={i} d={`M 0 ${20 + i * 10} Q 200 ${10 + i * 12} 400 ${30 + i * 9}`} />
          ))}
        </g>
      </svg>
    );
  }
  if (kind === "echo") {
    return (
      <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%" }}>
        {[6, 14, 24, 36, 50, 66, 84].map((r, i) => (
          <circle key={i} cx="100" cy="120" r={r}
            fill="none" stroke={i === 3 ? "var(--accent)" : "rgba(232,237,245,0.2)"} />
        ))}
        <circle cx="100" cy="120" r="3" fill="var(--accent)"/>
      </svg>
    );
  }
  if (kind === "drift") {
    return (
      <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%" }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <line key={i}
            x1={10 + i * 4} y1={100 + Math.sin(i / 2) * 40}
            x2={10 + i * 4} y2={180}
            stroke={i % 5 === 0 ? "var(--accent)" : "rgba(232,237,245,0.2)"} />
        ))}
      </svg>
    );
  }
  if (kind === "field") {
    return (
      <svg viewBox="0 0 300 200" style={{ width: "100%", height: "100%" }}>
        <g fontFamily="JetBrains Mono" fontSize="9" fill="rgba(232,237,245,0.5)" letterSpacing="1">
          <text x="20" y="40">2026.05.14 · 09:12</text>
          <text x="20" y="60" fill="rgba(111,168,255,0.85)">— noticed I sketch slower</text>
          <text x="20" y="74">  when listening to vocals.</text>
          <text x="20" y="100">2026.05.14 · 14:32</text>
          <text x="20" y="114" fill="rgba(111,168,255,0.85)">— the best layouts I've made</text>
          <text x="20" y="128">  start from one anchor.</text>
          <text x="20" y="160">2026.05.13 · 22:50</text>
          <text x="20" y="174" fill="rgba(111,168,255,0.85)">— tools should ask</text>
          <text x="20" y="188">  fewer questions.</text>
        </g>
      </svg>
    );
  }
  if (kind === "spec") {
    return (
      <svg viewBox="0 0 300 200" style={{ width: "100%", height: "100%" }}>
        {Array.from({ length: 70 }).map((_, i) => {
          const h = 20 + Math.abs(Math.sin(i / 3) * 90) + (i % 7) * 4;
          return <rect key={i} x={6 + i * 4} y={180 - h}
            width="2.5" height={h}
            fill={i % 9 === 0 ? "var(--accent)" : "rgba(232,237,245,0.4)"} />;
        })}
      </svg>
    );
  }
  if (kind === "softgrid") {
    return (
      <svg viewBox="0 0 300 200" style={{ width: "100%", height: "100%" }}>
        <g stroke="rgba(232,237,245,0.15)" fill="none">
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 28 + 10} x2="300" y2={i * 28 + 10} />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 28 + 10} y1="0" x2={i * 28 + 10} y2="200" />
          ))}
        </g>
        <rect x="40" y="36" width="76" height="36" fill="rgba(111,168,255,0.25)"/>
        <rect x="40" y="80" width="120" height="22" fill="rgba(232,237,245,0.18)"/>
        <rect x="40" y="106" width="180" height="56" fill="rgba(232,237,245,0.08)" stroke="rgba(232,237,245,0.18)"/>
      </svg>
    );
  }
  if (kind === "transit") {
    return (
      <svg viewBox="0 0 900 200" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
        <path d="M 0 130 C 200 130, 240 60, 440 60 S 700 130, 900 130"
          stroke="var(--accent)" fill="none" strokeWidth="1.5"
          strokeDasharray="2 4" />
        <g fontFamily="JetBrains Mono" fontSize="10" fill="rgba(232,237,245,0.55)" letterSpacing="1.5">
          <text x="20" y="160">A · idle</text>
          <text x="430" y="40">B · gather</text>
          <text x="800" y="160">C · settle</text>
        </g>
        <circle cx="20" cy="130" r="4" fill="var(--accent)"/>
        <circle cx="440" cy="60" r="4" fill="var(--accent)"/>
        <circle cx="880" cy="130" r="4" fill="var(--accent)"/>
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
          <span className="idx">03</span><span>Playground</span><span className="line"></span><span>experiments · loose · weekly</span>
        </Reveal>
        <Reveal className="display" style={{ fontSize: "clamp(28px, 3.4vw, 44px)", color: "var(--fg-mute)", maxWidth: "60ch", marginBottom: 56, lineHeight: 1.15 }}>
          A shelf for half-finished ideas. Most of what I think with starts here — small, fast, unprecious.
        </Reveal>
        <div className="play-grid">
          {PLAY.map((p, i) => (
            <Reveal
              key={p.id}
              className={"play-card " + p.size}
              delay={Math.min(i, 4)}
              data-cursor="link"
            >
              <div className="pc-head">
                <span>{p.id}</span>
                <span>{p.note}</span>
              </div>
              <div className="pc-title">{p.title}</div>
              <div className="pc-visual">
                <PlayVisual kind={p.kind} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SIGNAL (Contact)
   ============================================================ */
function SignalSection() {
  return (
    <section id="signal" className="section signal">
      <div className="wrap">
        <Reveal className="section-label">
          <span className="idx">04</span><span>Signal</span><span className="line"></span><span>Get in touch</span>
        </Reveal>
        <Reveal as="h2" className="signal-headline">
          <span>Let's build something</span><br/>
          <span className="italic">unmistakable.</span>
        </Reveal>

        <div className="signal-grid">
          <Reveal className="col" delay={1}>
            <h4>// Email</h4>
            <a href="mailto:hello@ayushsingh.dev">hello@ayushsingh.dev</a>
            <p style={{ color: "var(--fg-mute)", fontSize: 13, marginTop: 6 }}>Replace with your email →</p>
          </Reveal>
          <Reveal className="col" delay={2}>
            <h4>// Networks</h4>
            <a href="#">GitHub  ↗</a>
            <a href="#">LinkedIn  ↗</a>
            <a href="#">X / Twitter  ↗</a>
            <a href="#">Read.cv  ↗</a>
          </Reveal>
          <Reveal className="col" delay={3}>
            <h4>// Open to</h4>
            <p>SWE internships (S26 · F26)</p>
            <p>Creative engineering collabs</p>
            <p>Speculative tools &amp; AI projects</p>
          </Reveal>
          <Reveal className="col" delay={4}>
            <h4>// Coordinates</h4>
            <p>Singapore · GMT+8</p>
            <p style={{ color: "var(--fg-mute)", fontSize: 13 }}>
              Currently: shipping Atlas v0.4, prototyping Vessel's audio layer.
            </p>
          </Reveal>
        </div>

        <div className="footer">
          <span>© Ayush Singh · 2026</span>
          <span>Built from scratch · No template</span>
          <span>v 04.0 — Spring 26</span>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { PlaygroundSection, SignalSection });
