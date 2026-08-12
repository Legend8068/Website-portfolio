/* global React, Reveal */
const { useEffect: useEffectW, useRef: useRefW, useState: useStateW } = React;

/* ============================================================
   SELECTED SYSTEMS (Case studies)
   ============================================================ */
const PROJECTS = [
  {
    num: "01",
    title: "Atlas",
    year: "26",
    tags: "AI · Design Tools",
    desc: "An ambient design assistant that learns your visual vocabulary and surfaces components, tokens and references before you ask.",
    stack: "Next.js · tRPC · pgvector · Anthropic",
    idea: "Designers context-switch hundreds of times an hour. What if the tool quietly held the context for you?",
    system: "A local embedding index over your design files, a lightweight intent classifier, and a streaming completion layer that injects suggestions inline — never as a modal.",
    iterations: [
      { kind: "kill", label: "Sidebar copilot" },
      { kind: "kill", label: "Chat-first UI" },
      { kind: "kill", label: "Auto-apply changes" },
      { kind: "ship", label: "Inline ghost text" },
      { kind: "ship", label: "Hover-to-summon palette" },
    ],
    takeaway: "Intelligence works best when it shows up as a verb, not a noun.",
    preview: "ATLAS · v0.3 build",
  },
  {
    num: "02",
    title: "Vessel",
    year: "25",
    tags: "Generative · WebGL",
    desc: "A real-time generative canvas. Type a phrase, watch it become a living composition — typography, motion and color react together.",
    stack: "WebGL · GLSL · React · WebAudio",
    idea: "Most generative tools output a picture. I wanted one that outputs a feeling.",
    system: "Sentence-level sentiment + intent feeds a shader pipeline; cadence drives motion; nouns drive geometry. Everything renders in a single GPU pass.",
    iterations: [
      { kind: "kill", label: "Diffusion backend" },
      { kind: "kill", label: "Keyword tagging" },
      { kind: "ship", label: "Shader-only pipeline" },
      { kind: "ship", label: "Live audio reactive mode" },
    ],
    takeaway: "Constraints make generative work feel intentional. Shaders force them.",
    preview: "VESSEL · render frame 244",
  },
  {
    num: "03",
    title: "Orbit",
    year: "25",
    tags: "Collab · Realtime",
    desc: "A spatial canvas for design critique. Cursors carry voice, sketches anchor to elements, and timelines replay every decision.",
    stack: "Yjs · WebRTC · Three.js · Fastify",
    idea: "Async critique loses the room. Synchronous critique loses the record. Orbit keeps both.",
    system: "CRDTs for state, a custom audio-cursor layer over WebRTC, and a deterministic replay engine that rebuilds any moment from operations.",
    iterations: [
      { kind: "kill", label: "Video-call overlay" },
      { kind: "kill", label: "Threaded comments" },
      { kind: "ship", label: "Voice-cursor primitive" },
      { kind: "ship", label: "Scrubbable timeline" },
    ],
    takeaway: "Real-time isn't a feature, it's a substrate. Build for it from operation zero.",
    preview: "ORBIT · 4 cursors live",
  },
  {
    num: "04",
    title: "Signal",
    year: "25",
    tags: "Personal AI · iOS",
    desc: "A private memory companion. Capture a thought, a photo, a meeting — Signal stitches them into a queryable timeline of your own life.",
    stack: "Swift · CoreML · Whisper · Local-first",
    idea: "I was tired of journals I never re-read. I wanted a memory that I could ask questions of.",
    system: "Everything runs on-device. A small fine-tuned model handles linking; transcripts and embeddings live in an encrypted local store. The cloud is opt-in for sync only.",
    iterations: [
      { kind: "kill", label: "Cloud-first sync" },
      { kind: "kill", label: "Daily summary push" },
      { kind: "ship", label: "On-device only" },
      { kind: "ship", label: "Ask anything search" },
    ],
    takeaway: "Privacy is a UX feature, not a compliance one. People share more when nothing leaves the device.",
    preview: "SIGNAL · 2,144 memories indexed",
  },
];

function WorkRow({ p, open, onToggle, index }) {
  return (
    <div className="work-row" data-open={open ? "true" : "false"}>
      <span className="num">{p.num}</span>

      <button
        className="title-button"
        style={{ textAlign: "left", display: "contents" }}
        data-cursor="project"
        data-cursor-label={open ? "Close" : "Open case"}
        onClick={onToggle}
      >
        <span className="title">{p.title}</span>
        <span className="desc">{p.desc}</span>
        <span className="stack">{p.stack}</span>
        <span className="arrow">{open ? "—" : "↗"}</span>
      </button>

      <div className="case-panel">
        <div></div>
        <div className="case-grid">
          <div>
            <h5>// The Idea</h5>
            <p>{p.idea}</p>
            <h5 style={{ marginTop: 24 }}>// System Thinking</h5>
            <p>{p.system}</p>
          </div>
          <div>
            <h5>// Iterations</h5>
            <p style={{ color: "var(--fg-mute)" }}>
              Killed paths first. Shipped paths after.
            </p>
            <div className="case-iter">
              {p.iterations.map((it, i) => (
                <span key={i} className={"chip " + it.kind}>
                  {it.kind === "kill" ? "× " : "→ "}{it.label}
                </span>
              ))}
            </div>
            <h5 style={{ marginTop: 28 }}>// Takeaway</h5>
            <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 20, lineHeight: 1.35 }}>
              "{p.takeaway}"
            </p>
          </div>
          <div className="visual">
            <CaseVisual variant={index} label={p.preview} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* SVG case-study visuals — abstract, on-brand */
function CaseVisual({ variant, label }) {
  // Four variants — each schematic, restrained
  const v = variant % 4;
  return (
    <div className="ph" data-label={label}>
      <svg viewBox="0 0 800 340" preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5 }}>
        <defs>
          <linearGradient id={`g${variant}`} x1="0" x2="1">
            <stop offset="0" stopColor="rgba(111,168,255,0.0)"/>
            <stop offset="1" stopColor="rgba(111,168,255,0.35)"/>
          </linearGradient>
        </defs>
        {v === 0 && (
          <g stroke="rgba(232,237,245,0.18)" fill="none">
            {Array.from({ length: 16 }).map((_, i) => (
              <line key={i} x1={50 + i * 45} y1="40" x2={50 + i * 45} y2="300"
                strokeDasharray={i % 3 === 0 ? "0" : "4 4"} />
            ))}
            <rect x="200" y="120" width="200" height="100" stroke="var(--accent)" />
            <rect x="430" y="80" width="180" height="140" stroke={`url(#g${variant})`} />
            <text x="210" y="138" fontFamily="JetBrains Mono" fontSize="10" fill="rgba(232,237,245,0.7)" letterSpacing="2">SUGGEST · INLINE</text>
          </g>
        )}
        {v === 1 && (
          <g stroke="rgba(232,237,245,0.18)" fill="none">
            <path d="M50 270 Q 200 60 400 170 T 750 80" stroke="var(--accent)" strokeWidth="1.5"/>
            <path d="M50 240 Q 200 100 400 200 T 750 130" />
            <path d="M50 210 Q 200 140 400 230 T 750 180" />
            {Array.from({ length: 60 }).map((_, i) => (
              <circle key={i} cx={50 + i * 12} cy={270 - Math.sin(i / 4) * 80 - i * 0.6}
                r="1.4" fill="rgba(232,237,245,0.5)" stroke="none"/>
            ))}
          </g>
        )}
        {v === 2 && (
          <g fill="none" stroke="rgba(232,237,245,0.2)">
            <circle cx="400" cy="170" r="120"/>
            <circle cx="400" cy="170" r="80" stroke="var(--accent)" strokeDasharray="2 4"/>
            <circle cx="400" cy="170" r="40"/>
            {[0, 60, 120, 180, 240, 300].map((a, i) => {
              const rad = (a * Math.PI) / 180;
              const x = 400 + Math.cos(rad) * 120;
              const y = 170 + Math.sin(rad) * 120;
              return <circle key={i} cx={x} cy={y} r="6" fill="var(--accent)" stroke="none"/>;
            })}
            <text x="380" y="174" fontFamily="JetBrains Mono" fontSize="10" fill="rgba(232,237,245,0.7)" letterSpacing="2">NODE · 4</text>
          </g>
        )}
        {v === 3 && (
          <g stroke="rgba(232,237,245,0.18)" fill="none">
            {Array.from({ length: 30 }).map((_, i) => (
              <rect key={i} x={40 + i * 24} y={150 - Math.sin(i / 3) * 50}
                width="14" height={80 + Math.cos(i / 4) * 40}
                stroke={i % 5 === 0 ? "var(--accent)" : "rgba(232,237,245,0.18)"} />
            ))}
            <line x1="40" y1="260" x2="760" y2="260" stroke="rgba(232,237,245,0.3)"/>
            <text x="40" y="280" fontFamily="JetBrains Mono" fontSize="10" fill="rgba(232,237,245,0.55)" letterSpacing="2">MEMORY · TIMELINE</text>
          </g>
        )}
      </svg>
    </div>
  );
}

function WorkSection() {
  const [open, setOpen] = useStateW(null);
  return (
    <section id="work" className="section">
      <div className="wrap">
        <Reveal className="section-label">
          <span className="idx">02</span><span>Selected Systems</span><span className="line"></span><span>{PROJECTS.length} case studies · click to open</span>
        </Reveal>
        <div className="work-list">
          {PROJECTS.map((p, i) => (
            <WorkRow
              key={p.num}
              p={p}
              index={i}
              open={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { WorkSection });
