/* global React, Reveal */
const { useEffect: useEffectH, useRef: useRefH, useState: useStateH } = React;

/* ============================================================
   NAV
   ============================================================ */
function Nav() {
  return (
    <nav className="nav">
      <div className="brand" data-cursor="link">
        <span className="glyph">A</span>
        <span>AYUSH · SINGH<span style={{ color: "var(--fg-dim)" }}> // CDS · NTU</span></span>
      </div>
      <div className="links">
        <a href="#philosophy"><span className="num">01</span>PHILOSOPHY</a>
        <a href="#work"><span className="num">02</span>WORK</a>
        <a href="#playground"><span className="num">03</span>PLAYGROUND</a>
        <a href="#signal"><span className="num">04</span>SIGNAL</a>
      </div>
      <div className="status">
        <span className="dot"></span>
        <span>AVAILABLE · S26+ · GMT+8</span>
      </div>
    </nav>
  );
}

/* ============================================================
   HERO  — node network + asymmetric editorial
   ============================================================ */

// Network specification — nodes and links (deterministic layout)
const NODES = [
  { id: "core",  x: 50, y: 50, label: "core/", size: 7, kind: "core" },
  { id: "ui",    x: 22, y: 22, label: "ui/render", size: 5, kind: "frontend" },
  { id: "ai",    x: 78, y: 22, label: "ai/intent", size: 5, kind: "ai" },
  { id: "store", x: 22, y: 78, label: "store/embed", size: 5, kind: "data" },
  { id: "rt",    x: 78, y: 78, label: "rt/sync", size: 5, kind: "infra" },
  { id: "motion",x: 50, y: 14, label: "motion", size: 4, kind: "frontend" },
  { id: "gen",   x: 92, y: 50, label: "gen/shader", size: 4, kind: "gen" },
  { id: "audio", x: 50, y: 86, label: "audio", size: 4, kind: "gen" },
  { id: "ide",   x: 8,  y: 50, label: "ide/local", size: 4, kind: "tools" },
];
const LINKS = [
  ["core","ui"], ["core","ai"], ["core","store"], ["core","rt"],
  ["ui","motion"], ["ai","gen"], ["store","ide"], ["rt","audio"],
  ["ui","ai"], ["store","rt"], ["motion","gen"], ["ide","store"],
];

function HeroNetwork() {
  const ref = useRefH(null);
  const [pulse, setPulse] = useStateH(0);
  useEffectH(() => {
    let i = 0;
    const t = setInterval(() => { i = (i + 1) % LINKS.length; setPulse(i); }, 900);
    return () => clearInterval(t);
  }, []);

  const findNode = (id) => NODES.find(n => n.id === id);

  return (
    <div className="hero-network" ref={ref} data-cursor="default">
      <div className="corner tl">
        SYSTEM · ROUTING<br/>
        <span className="accent">{NODES.length}</span> NODES · <span className="accent">{LINKS.length}</span> EDGES
      </div>
      <div className="corner tr">
        LIVE TRACE<br/>
        <span className="accent">{LINKS[pulse][0]}</span> → {LINKS[pulse][1]}
      </div>
      <div className="corner bl">
        O(V + E) TRAVERSAL<br/>
        <span style={{ color: "var(--accent-2)" }}>p99 4.2ms</span>
      </div>
      <div className="corner br">
        2026 · BUILD 04.0<br/>
        <span className="accent">render: webgl-canvas</span>
      </div>

      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="bp-grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(236,232,222,0.06)" strokeWidth="0.1"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#bp-grid)"/>

        {/* coords axes */}
        <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(236,232,222,0.08)" strokeWidth="0.12" strokeDasharray="0.6,0.6"/>
        <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(236,232,222,0.08)" strokeWidth="0.12" strokeDasharray="0.6,0.6"/>

        {/* links */}
        {LINKS.map(([a, b], i) => {
          const A = findNode(a), B = findNode(b);
          const active = pulse === i;
          return (
            <line key={i}
              x1={A.x} y1={A.y} x2={B.x} y2={B.y}
              stroke={active ? "var(--accent)" : "rgba(236,232,222,0.25)"}
              strokeWidth={active ? "0.35" : "0.18"}
              strokeDasharray={active ? "none" : "0.5,0.6"}/>
          );
        })}

        {/* nodes */}
        {NODES.map(n => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={n.size * 0.42}
              fill="none"
              stroke="rgba(236,232,222,0.30)" strokeWidth="0.18" strokeDasharray="0.4,0.4"/>
            <circle cx={n.x} cy={n.y} r={n.kind === "core" ? 1.6 : 1.1}
              fill={n.kind === "core" ? "var(--accent)" :
                    n.kind === "ai" ? "var(--accent-2)" :
                    n.kind === "data" ? "var(--accent-3)" :
                    "var(--fg)"} />
            <text x={n.x + 2.6} y={n.y + 0.6}
              fontFamily="JetBrains Mono"
              fontSize="1.9"
              fill="rgba(236,232,222,0.85)"
              letterSpacing="0.02">
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function HeroSection() {
  return (
    <section id="top" className="section hero">
      <div className="wrap">
        <div className="hero-stage">
          {/* LEFT — node network */}
          <Reveal className="" delay={1}>
            <HeroNetwork />
          </Reveal>

          {/* RIGHT — asymmetric editorial headline */}
          <div className="hero-headline-wrap">
            <Reveal as="h1" className="hero-headline display" delay={1}>
              <span className="row">Engineering</span>
              <span className="row indent italic">intelligent</span>
              <span className="row outdent">systems</span>
              <span className="row indent" style={{ marginTop: "0.04em" }}>
                that{" "}
                <span className="italic accent underscore">feel alive.</span>
              </span>
            </Reveal>

            <div className="hero-foot">
              <Reveal className="col" delay={2}>
                <h4>// ON FILE</h4>
                <p>
                  CS &amp; Design student in <span className="acc">Singapore</span>.
                  I build intelligent interfaces, generative systems and the connective tissue
                  between them — usually with one foot in a terminal and one in a sketchbook.
                </p>
              </Reveal>
              <Reveal className="col" delay={3}>
                <h4>// PRACTICE</h4>
                <div className="tags">
                  <span className="tag amber">FULLSTACK</span>
                  <span className="tag amber">CREATIVE FE</span>
                  <span className="tag sage">AI · LLM</span>
                  <span className="tag sage">GENERATIVE</span>
                  <span className="tag">MOTION</span>
                  <span className="tag">SYSTEMS</span>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-meta-bar">
        <span>// LATITUDE 1.35°N · LONGITUDE 103.81°E</span>
        <span>SCROLL <span className="accent">↓</span> 00 → 04</span>
        <span>BUILD 04.0 · SPRING 26</span>
      </div>
    </section>
  );
}

/* ============================================================
   PHILOSOPHY  —  schematic margin notes
   ============================================================ */
const PHILOSOPHY = [
  {
    n: "01",
    tag: "Posture",
    stmt: "I build solutions, not portfolios.",
    gloss: <>Every project here started as a real <span className="high">problem I felt</span> — a missing tool, a slow workflow, an idea I couldn't stop sketching. Polish is the side-effect of caring about the underlying thing.</>,
  },
  {
    n: "02",
    tag: "Craft",
    stmt: "An interface should disappear when it works.",
    gloss: <>The best interaction is the one you don't notice. Motion <span className="high">explains</span> structure; structure earns the motion. Both serve a faster path to the user's actual intent.</>,
  },
  {
    n: "03",
    tag: "Method",
    stmt: "Design and engineering are the same conversation.",
    gloss: <>I prototype to think. The fastest route to a good idea is a worse version of it on a screen <span className="high">today</span> — then a sharper one tomorrow.</>,
  },
  {
    n: "04",
    tag: "Edge",
    stmt: "Intelligence should be ambient, not theatrical.",
    gloss: <>AI is most useful when it <span className="high">removes a step</span> you didn't realise you were taking. Less chatbot. More current. Models live inside the verbs, not the modals.</>,
  },
  {
    n: "05",
    tag: "Pace",
    stmt: "Ship sharp things, then sharpen.",
    gloss: <>Iteration > performance. The product I most want to build is the <span className="high">next</span> one — and the one after that.</>,
  },
];

function PhilosophySection() {
  return (
    <section id="philosophy" className="section">
      <div className="wrap">
        <Reveal className="section-label">
          <span className="idx">01</span>
          <span className="label">Philosophy</span>
          <span className="rule"></span>
          <span className="meta-r">5 STATEMENTS · ABOUT POSTURE, NOT BIO</span>
        </Reveal>

        <div className="philosophy">
          <div className="philosophy-side">
            <h4>// MARGIN NOTE</h4>
            <p style={{ color: "var(--fg-mute)" }}>
              I removed the "About Me" section.<br/>
              Nobody reads them. Instead — what I <em>actually believe</em> about systems, craft and pace. Each statement is a knob I tune projects against.
            </p>
            <p style={{ marginTop: 18, fontSize: 10, color: "var(--fg-dim)" }}>
              FILED UNDER · POSTURE/CORE.MD<br/>
              REV · 04.0<br/>
              LAST EDIT · 2026.05
            </p>
          </div>
          <div className="philos-list">
            {PHILOSOPHY.map((p, i) => (
              <Reveal key={p.n} className="philos-row" delay={Math.min(i, 5)}>
                <span className="n">{p.n}</span>
                <span className="tag">{p.tag}</span>
                <span className="body">
                  <span className="stmt">{p.stmt}</span>
                  <span className="gloss">{p.gloss}</span>
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Nav, HeroSection, PhilosophySection });
