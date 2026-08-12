/* global React, Reveal */
const { useEffect: useEffectW, useRef: useRefW, useState: useStateW } = React;

/* ============================================================
   SELECTED SYSTEMS — Blueprint split case studies
   ============================================================ */
const PROJECTS = [
  {
    num: "01",
    title: "Atlas",
    year: "26",
    desc: "Ambient design assistant that learns your visual vocabulary and surfaces components, tokens and references before you ask.",
    stack: ["Next.js · 14", "tRPC", "pgvector", "Anthropic · Claude"],
    bigO: [
      { k: "intent", v: "O(1)" },
      { k: "search", v: "O(log n)" },
      { k: "rerank", v: "O(k · d)" },
    ],
    term: [
      { c: "//" },
      { c: "// atlas/intent.ts" },
      { c: "" },
      { s: "intent ", arr: "= ", k: "classify", paren1: "(", v: "selection.lastTokens", paren2: ")" },
      { c: "// → 'paste-component' | 'find-token' | 'compare-state'" },
      { c: "" },
      { s: "if ", paren1: "(", k: "intent.kind ", arr: "=== ", v: "\"paste-component\"", paren2: ") {" },
      { c: "  // hover-summon palette — no modal", indent: 1 },
      { k: "  candidates ", arr: "= ", paren1: "await ", v: "embed.queryK(intent.hint, 6)", semi: ";", indent: 1 },
      { k: "  ghost", arr: ".render", paren1: "(", v: "candidates[0]", paren2: ")", semi: ";", indent: 1 },
      { s: "}" },
    ],
    flow:
`     ┌──────────┐    intent     ┌─────────────┐
     │  caret   │ ───────────▶  │  classifier │
     └──────────┘               └──────┬──────┘
                                       │
              hits ▲                   ▼ embeds
        ┌──────────┴──────┐    ┌──────────────┐
        │  hover-palette  │ ◀──│  pgvector kNN│
        └─────────────────┘    └──────────────┘`,
    killed: [
      { kind: "kill", label: "K-01", why: "sidebar copilot" },
      { kind: "kill", label: "K-02", why: "chat-first UI" },
      { kind: "kill", label: "K-03", why: "auto-apply diffs" },
      { kind: "ship", label: "S-01", why: "inline ghost text" },
    ],
    takeaway: "Intelligence works best when it shows up as a verb, not a noun.",
    surface: "atlas",
    role: "Solo · system & UI",
    status: "v0.3 · internal beta",
  },
  {
    num: "02",
    title: "SG-MeetHalfway",
    year: "25",
    desc: "A spatial scheduling toy for Singapore — drop your friends, pick a vibe, get a coffee spot that's fair for everyone.",
    stack: ["React", "Mapbox GL", "Supabase", "n8n · workflow"],
    bigO: [
      { k: "centroid", v: "O(n)" },
      { k: "POI rank", v: "O(n log n)" },
      { k: "rebalance", v: "O(n²)" },
    ],
    term: [
      { c: "// sg-meet/centroid.ts" },
      { c: "" },
      { s: "const ", k: "fairPoint ", arr: "= ", paren1: "(", v: "friends, weights", paren2: ") => {" },
      { c: "  // weighted geometric median (Weiszfeld)", indent: 1 },
      { k: "  let ", v: "p", arr: " = ", paren1: "geomMean", paren2: "(friends);", indent: 1 },
      { s: "  for ", paren1: "(let i = 0; i < 24; i++) {", indent: 1 },
      { s: "    p ", arr: "= ", v: "step(p, friends, weights)", semi: ";", indent: 1 },
      { s: "  }", indent: 1 },
      { s: "  return ", v: "snapToPOI(p, vibe)", semi: ";", indent: 1 },
      { s: "};" },
      { c: "" },
      { c: "// rebalance penalty: distance² to nearest MRT" },
    ],
    flow:
`     friends[]   vibe              ┌────────────┐
        ▼          ▼                │  re-rank   │
   ┌─────────────────────┐ centroid │ by transit │
   │  Weiszfeld iterator │ ──────▶  └─────┬──────┘
   └─────────────────────┘                ▼
                                  ┌──────────────┐
                                  │   POI pick   │
                                  └──────────────┘`,
    killed: [
      { kind: "kill", label: "K-01", why: "naive midpoint" },
      { kind: "kill", label: "K-02", why: "drive-time only" },
      { kind: "ship", label: "S-01", why: "transit-weighted" },
      { kind: "ship", label: "S-02", why: "vibe filters" },
    ],
    takeaway: "Fairness is a design decision long before it's a math one.",
    surface: "map",
    role: "Solo · weekend project",
    status: "shipped · 1.2k MAU",
  },
  {
    num: "03",
    title: "Estate · Concierge",
    year: "25",
    desc: "Real-estate chatbot that doesn't act like one. Retrieves the listing graph, infers buyer mood, surfaces three options instead of a paragraph.",
    stack: ["Python · FastAPI", "LangChain", "n8n · pipelines", "Postgres"],
    bigO: [
      { k: "retrieve", v: "O(log n)" },
      { k: "mood-cls", v: "O(1)" },
      { k: "ranker", v: "O(k log k)" },
    ],
    term: [
      { c: "// estate/route.py" },
      { c: "" },
      { s: "def ", k: "route", paren1: "(", v: "msg: str, ctx: Buyer", paren2: ") -> Reply:" },
      { c: "    # mood = 'curious' | 'serious' | 'pressured' | 'lost'", indent: 1 },
      { s: "    mood ", arr: "= ", v: "classify(msg, ctx.history)", indent: 1 },
      { s: "    if ", v: "mood", arr: " == ", s2: "\"pressured\"", paren2: ":", indent: 1 },
      { s: "        return ", k: "Reply", paren1: "(", v: "kind=\"shortlist-3\"", paren2: ")", indent: 1 },
      { s: "    if ", v: "mood", arr: " == ", s2: "\"lost\"", paren2: ":", indent: 1 },
      { s: "        return ", k: "Reply", paren1: "(", v: "kind=\"shape-the-question\"", paren2: ")", indent: 1 },
      { s: "    return ", k: "Reply", paren1: "(", v: "kind=\"answer\"", paren2: ")", indent: 1 },
    ],
    flow:
`     buyer-msg ┐                ┌────────────┐
               ├─▶  mood-cls ─▶ │  router    │
     buyer-ctx ┘                └─────┬──────┘
                                      ▼
                       ┌──────────────────────────┐
                       │  retriever · listing kNN │
                       └──────────────────────────┘`,
    killed: [
      { kind: "kill", label: "K-01", why: "long replies" },
      { kind: "kill", label: "K-02", why: "open-ended q&a" },
      { kind: "ship", label: "S-01", why: "3-option shortlist" },
      { kind: "ship", label: "S-02", why: "mood router" },
    ],
    takeaway: "People don't want a chatbot. They want a shorter path to a decision.",
    surface: "chat",
    role: "Lead engineer · 2 collaborators",
    status: "shipped · client project",
  },
  {
    num: "04",
    title: "Vessel",
    year: "25",
    desc: "A generative canvas. Type a phrase, watch it become a living composition — typography, motion and color react together.",
    stack: ["WebGL", "GLSL", "React", "WebAudio"],
    bigO: [
      { k: "tokenize", v: "O(n)" },
      { k: "shade", v: "O(px)" },
      { k: "react·audio", v: "O(1)" },
    ],
    term: [
      { c: "// vessel/main.frag" },
      { c: "" },
      { s: "vec3 ", k: "field", paren1: "(", v: "vec2 uv, float t, vec3 mood", paren2: ") {" },
      { c: "  // mood.x = warmth · mood.y = density · mood.z = chaos", indent: 1 },
      { k: "  float n ", arr: "= ", v: "fbm(uv * mood.y + t * 0.1)", semi: ";", indent: 1 },
      { k: "  vec3 c ", arr: "= ", v: "mix(amber, sage, n + mood.x)", semi: ";", indent: 1 },
      { s: "  return ", v: "c * (1.0 - mood.z * length(uv))", semi: ";", indent: 1 },
      { s: "}" },
    ],
    flow:
`     phrase ──▶ tokenize ──▶ mood-vec ──▶ uniforms
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │  fragment   │
                                       └─────┬───────┘
                                             ▼
                                       audio · react`,
    killed: [
      { kind: "kill", label: "K-01", why: "diffusion backend" },
      { kind: "kill", label: "K-02", why: "keyword tagging" },
      { kind: "ship", label: "S-01", why: "shader-only" },
      { kind: "ship", label: "S-02", why: "live audio" },
    ],
    takeaway: "Constraints make generative work feel intentional. Shaders enforce them.",
    surface: "shader",
    role: "Solo · research",
    status: "WIP · public soon",
  },
];

function TermLine({ ln }) {
  if (ln.c !== undefined) {
    return <div><span className="c">{ln.c || "\u00a0"}</span></div>;
  }
  const indent = "  ".repeat(ln.indent || 0);
  return (
    <div>
      {indent}
      {ln.s   && <span className="s">{ln.s}</span>}
      {ln.k   && <span className="k">{ln.k}</span>}
      {ln.arr && <span className="arr">{ln.arr}</span>}
      {ln.paren1 && <span className="s">{ln.paren1}</span>}
      {ln.v   && <span className="v">{ln.v}</span>}
      {ln.paren2 && <span className="s">{ln.paren2}</span>}
      {ln.s2 && <span className="v">{ln.s2}</span>}
      {ln.semi && <span className="s">{ln.semi}</span>}
    </div>
  );
}

function SurfaceMock({ kind, title }) {
  return (
    <div className="surface-mock">
      <div className="mock-bar">
        <span className="dots"><i></i><i></i><i></i></span>
        <span>{title}</span>
      </div>
      <div className="mock-body">
        {kind === "atlas"  && <AtlasMock />}
        {kind === "map"    && <MapMock />}
        {kind === "chat"   && <ChatMock />}
        {kind === "shader" && <ShaderMock />}
      </div>
    </div>
  );
}

function AtlasMock() {
  return (
    <svg viewBox="0 0 600 350" preserveAspectRatio="xMidYMid slice" style={{ width:"100%", height:"100%" }}>
      <rect width="600" height="350" fill="rgba(13,13,11,0.7)"/>
      {/* canvas area */}
      <rect x="30" y="30" width="380" height="290" stroke="rgba(236,232,222,0.14)" fill="none"/>
      <text x="30" y="22" fontFamily="JetBrains Mono" fontSize="10" fill="rgba(236,232,222,0.5)">canvas / brand-deck-v3.fig</text>
      {/* current selection */}
      <rect x="80" y="80" width="170" height="60" fill="rgba(200,167,114,0.12)" stroke="var(--accent)" strokeDasharray="3 2"/>
      <text x="86" y="100" fontFamily="JetBrains Mono" fontSize="10" fill="var(--accent)">SELECTION · hero-card</text>
      <text x="86" y="116" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(236,232,222,0.5)">last edit · 14:32</text>
      {/* ghost suggestion */}
      <rect x="80" y="160" width="170" height="60" fill="none" stroke="rgba(154,170,134,0.45)" strokeDasharray="2 3"/>
      <text x="86" y="180" fontFamily="JetBrains Mono" fontSize="10" fill="var(--accent-2)">GHOST · suggested next</text>
      <text x="86" y="196" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(236,232,222,0.5)">tab to accept · esc to dismiss</text>
      {/* right side - summon palette */}
      <rect x="430" y="30" width="140" height="290" fill="rgba(26,25,21,0.85)" stroke="rgba(236,232,222,0.14)"/>
      <text x="440" y="50" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(236,232,222,0.55)">SUMMON · palette</text>
      <line x1="440" y1="58" x2="560" y2="58" stroke="rgba(236,232,222,0.12)"/>
      {["hero-card","cta-row","badge-amber","testimonial","callout-sage","grid-2-col"].map((s, i) => (
        <g key={s}>
          <rect x="440" y={70 + i * 32} width="120" height="24" fill={i===0 ? "rgba(200,167,114,0.18)" : "rgba(236,232,222,0.04)"}/>
          <text x="448" y={86 + i * 32} fontFamily="JetBrains Mono" fontSize="10" fill="rgba(236,232,222,0.85)">{s}</text>
          <text x="540" y={86 + i * 32} fontFamily="JetBrains Mono" fontSize="9" fill="rgba(236,232,222,0.4)" textAnchor="end">⌘{i+1}</text>
        </g>
      ))}
    </svg>
  );
}
function MapMock() {
  return (
    <svg viewBox="0 0 600 350" preserveAspectRatio="xMidYMid slice" style={{ width:"100%", height:"100%" }}>
      <rect width="600" height="350" fill="rgba(13,13,11,0.7)"/>
      {/* faux map streets */}
      <g stroke="rgba(236,232,222,0.10)" fill="none">
        <path d="M0 80 Q200 120 400 100 T600 130"/>
        <path d="M0 200 Q120 180 280 220 T600 200"/>
        <path d="M120 0 Q140 120 90 240 T120 350"/>
        <path d="M340 0 Q360 100 320 200 T380 350"/>
        <path d="M0 280 Q200 310 600 280"/>
      </g>
      {/* friend pins */}
      {[{x:120,y:90,l:"A"},{x:380,y:150,l:"B"},{x:260,y:260,l:"C"},{x:460,y:230,l:"D"}].map(p=>(
        <g key={p.l}>
          <circle cx={p.x} cy={p.y} r="14" fill="none" stroke="rgba(236,232,222,0.4)" strokeDasharray="2 2"/>
          <circle cx={p.x} cy={p.y} r="5" fill="var(--accent-3)"/>
          <text x={p.x + 10} y={p.y + 4} fontFamily="JetBrains Mono" fontSize="10" fill="rgba(236,232,222,0.85)">{p.l}</text>
        </g>
      ))}
      {/* fair point */}
      <g>
        <circle cx="290" cy="180" r="22" fill="rgba(200,167,114,0.18)" stroke="var(--accent)"/>
        <circle cx="290" cy="180" r="6" fill="var(--accent)"/>
        <text x="300" y="178" fontFamily="JetBrains Mono" fontSize="10" fill="var(--accent)">FAIR · 4 min Δ</text>
        <text x="300" y="192" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(236,232,222,0.6)">@ Common Man · cozy</text>
      </g>
      {/* sidebar */}
      <rect x="440" y="20" width="140" height="120" fill="rgba(26,25,21,0.85)" stroke="rgba(236,232,222,0.14)"/>
      <text x="448" y="38" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(236,232,222,0.55)">VIBE · cozy</text>
      <line x1="448" y1="44" x2="572" y2="44" stroke="rgba(236,232,222,0.12)"/>
      {["cozy","focus","loud","outdoor"].map((s,i)=>(
        <g key={s}>
          <rect x="448" y={52+i*18} width="116" height="14" fill={s==="cozy"?"rgba(200,167,114,0.2)":"rgba(236,232,222,0.04)"}/>
          <text x="454" y={62+i*18} fontFamily="JetBrains Mono" fontSize="9" fill="rgba(236,232,222,0.8)">{s}</text>
        </g>
      ))}
    </svg>
  );
}
function ChatMock() {
  return (
    <svg viewBox="0 0 600 350" preserveAspectRatio="xMidYMid slice" style={{ width:"100%", height:"100%" }}>
      <rect width="600" height="350" fill="rgba(13,13,11,0.7)"/>
      {/* user bubble */}
      <rect x="200" y="36" width="370" height="30" fill="rgba(236,232,222,0.06)"/>
      <text x="208" y="56" fontFamily="JetBrains Mono" fontSize="11" fill="rgba(236,232,222,0.85)">{"\""}3-room near Tampines, under 1.2M, quiet street{"\""}</text>
      {/* mood chip */}
      <g>
        <rect x="30" y="80" width="120" height="22" fill="none" stroke="var(--accent-2)" strokeDasharray="2 2"/>
        <text x="38" y="95" fontFamily="JetBrains Mono" fontSize="10" fill="var(--accent-2)">MOOD · serious</text>
      </g>
      <text x="30" y="120" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(236,232,222,0.55)">ROUTE · shortlist-3</text>
      {/* 3 cards */}
      {[
        { x: 30,  t: "Tampines St 32", p: "$1.18M · 3-rm · 99y", a: "9 min MRT" },
        { x: 220, t: "Pasir Ris D5",   p: "$1.09M · 3-rm · 99y", a: "12 min MRT" },
        { x: 410, t: "Bedok Rise",     p: "$1.21M · 3-rm · 99y", a: "6 min MRT" },
      ].map((c, i) => (
        <g key={c.t}>
          <rect x={c.x} y="140" width="160" height="170" fill="rgba(26,25,21,0.85)" stroke={i===0?"var(--accent)":"rgba(236,232,222,0.14)"}/>
          {/* "image" placeholder */}
          <rect x={c.x + 8} y="148" width="144" height="80" fill="rgba(200,167,114,0.10)"/>
          <line x1={c.x+8} y1="148" x2={c.x+152} y2="228" stroke="rgba(236,232,222,0.08)"/>
          <text x={c.x + 10} y="248" fontFamily="JetBrains Mono" fontSize="10" fill="rgba(236,232,222,0.85)">{c.t}</text>
          <text x={c.x + 10} y="264" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(236,232,222,0.55)">{c.p}</text>
          <text x={c.x + 10} y="280" fontFamily="JetBrains Mono" fontSize="9" fill="var(--accent-2)">{c.a}</text>
          <text x={c.x + 10} y="298" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(236,232,222,0.4)">⌘ {i+1} · open</text>
        </g>
      ))}
    </svg>
  );
}
function ShaderMock() {
  return (
    <svg viewBox="0 0 600 350" preserveAspectRatio="xMidYMid slice" style={{ width:"100%", height:"100%" }}>
      <defs>
        <radialGradient id="vsh1" cx="0.3" cy="0.4"><stop offset="0" stopColor="rgba(200,167,114,0.55)"/><stop offset="1" stopColor="rgba(200,167,114,0)"/></radialGradient>
        <radialGradient id="vsh2" cx="0.75" cy="0.65"><stop offset="0" stopColor="rgba(154,170,134,0.45)"/><stop offset="1" stopColor="rgba(154,170,134,0)"/></radialGradient>
        <linearGradient id="vsh3" x1="0" x2="1"><stop offset="0" stopColor="rgba(184,184,179,0.0)"/><stop offset="1" stopColor="rgba(184,184,179,0.25)"/></linearGradient>
      </defs>
      <rect width="600" height="350" fill="rgba(13,13,11,0.7)"/>
      <rect width="600" height="350" fill="url(#vsh1)"/>
      <rect width="600" height="350" fill="url(#vsh2)"/>
      <rect width="600" height="350" fill="url(#vsh3)"/>
      {/* fbm-ish curves */}
      <g stroke="rgba(236,232,222,0.16)" fill="none">
        {Array.from({length:18}).map((_,i)=>(
          <path key={i}
            d={`M 0 ${30 + i * 18} C 120 ${20 + i * 16}, 280 ${50 + i * 18}, 600 ${30 + i * 17}`}
            strokeWidth="0.8" />
        ))}
      </g>
      {/* phrase input */}
      <rect x="30" y="290" width="540" height="34" fill="rgba(26,25,21,0.85)" stroke="rgba(236,232,222,0.14)"/>
      <text x="40" y="312" fontFamily="JetBrains Mono" fontSize="11" fill="rgba(236,232,222,0.85)">{"\""}slow morning, warm light, almost nothing{"\""}</text>
      <text x="490" y="312" fontFamily="JetBrains Mono" fontSize="9" fill="var(--accent)">↵ shade</text>
      <text x="30" y="36" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(236,232,222,0.55)">VESSEL · frame 244 · 11.2ms</text>
    </svg>
  );
}

function WorkRow({ p, open, onToggle }) {
  return (
    <div className="work-row" data-open={open ? "true" : "false"}>
      <div
        className="work-head"
        data-cursor="project"
        data-cursor-label={open ? "Close case" : "Open case"}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
      >
        <span className="num">{p.num} · 20{p.year}</span>
        <span className="title">{p.title}</span>
        <span className="desc">{p.desc}</span>
        <span className="meta">
          <div><span className="k">stack ·</span> {p.stack.join(" / ")}</div>
          <div><span className="k">role ·</span> {p.role}</div>
          <div><span className="k">state ·</span> {p.status}</div>
        </span>
        <span className="indicator">{open ? "—" : "+"}</span>
      </div>
      <div className="case">
        <div className="case-inner">
          <div className="case-body">
            {/* BLUEPRINT */}
            <div className="case-blueprint">
              <div className="case-block">
                <h5>// the idea</h5>
                <p className="mono-p" style={{ color: "var(--fg)" }}>{p.desc}</p>
              </div>
              <div className="case-block">
                <h5>// complexity · what does it cost</h5>
                <div>
                  {p.bigO.map(o => (
                    <span key={o.k} className="big-o"><span className="k">{o.k}</span><span className="v">{o.v}</span></span>
                  ))}
                </div>
              </div>
              <div className="case-block">
                <h5>// architecture · ascii flow</h5>
                <div className="flow">{p.flow}</div>
              </div>
              <div className="case-block">
                <h5>// inner loop · code excerpt</h5>
                <div className="term">
                  {p.term.map((ln, i) => <TermLine key={i} ln={ln} />)}
                </div>
              </div>
            </div>

            {/* SURFACE */}
            <div className="case-surface">
              <div className="case-block">
                <h5>// final UI · the surface users see</h5>
                <SurfaceMock kind={p.surface} title={`${p.title.toUpperCase()} · ${p.status.toUpperCase()}`} />
              </div>
              <div className="case-block">
                <h5>// iterations · killed paths come first</h5>
                <p className="mono-p" style={{ marginBottom: 8 }}>
                  Four UI states tried. Three were wrong. The wrongness was the most useful data.
                </p>
                <div className="killed-grid">
                  {p.killed.map((k, i) => (
                    <div key={i} className={"killed-cell " + (k.kind === "ship" ? "shipped" : "")}>
                      <div className="ph"></div>
                      <div className="label">
                        <span>{k.label}</span>
                        <span>{k.kind === "ship" ? "→ SHIP" : "× KILL"}</span>
                      </div>
                      <div className="why">{k.why}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="case-block">
                <h5>// takeaway</h5>
                <div className="takeaway">"{p.takeaway}"</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkSection() {
  const [open, setOpen] = useStateW(0);
  return (
    <section id="work" className="section">
      <div className="wrap">
        <Reveal className="section-label">
          <span className="idx">02</span>
          <span className="label">Selected Systems</span>
          <span className="rule"></span>
          <span className="meta-r">{PROJECTS.length} CASE STUDIES · CLICK TO OPEN BLUEPRINT</span>
        </Reveal>
        <div className="work-list">
          {PROJECTS.map((p, i) => (
            <WorkRow
              key={p.num}
              p={p}
              open={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { WorkSection });
