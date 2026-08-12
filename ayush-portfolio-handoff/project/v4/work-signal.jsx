/* global React, Reveal */
const { useEffect: useEffectW, useRef: useRefW } = React;

/* ============================================================
   WORK — case studies (same projects, all-caps mono + Archivo Black)
   ============================================================ */
const PROJECTS = [
  {
    num: "01", year: "2026", title: "ATLAS", tag: "AI · DESIGN COPILOT",
    summary: "AN AMBIENT DESIGN ASSISTANT THAT LEARNS YOUR VISUAL VOCABULARY AND SURFACES COMPONENTS, TOKENS AND REFERENCES BEFORE YOU ASK. NO MODAL. NO CHATBOT. INLINE GHOST TEXT.",
    chapters: [
      { h: "// PROBLEM", p: "DESIGNERS CONTEXT-SWITCH HUNDREDS OF TIMES AN HOUR. MODAL AI ASSISTANTS MAKE THAT WORSE — A DESTINATION, NOT A TOOL." },
      { h: "// SYSTEM",  p: "LOCAL EMBEDDING INDEX OVER DESIGN FILES, INTENT CLASSIFIER, STREAMING COMPLETION INJECTED INLINE — NEVER MODAL." },
      { h: "// LESSON",  p: "INTELLIGENCE WORKS BEST WHEN IT SHOWS UP AS A VERB, NOT A NOUN." },
      { h: "// STATE",   p: "V0.3 · INTERNAL BETA · 12 DESIGN TEAMS" },
    ],
    stack: ["NEXT.JS", "TRPC", "PGVECTOR", "ANTHROPIC"],
    tone: "ink", art: "atlas",
  },
  {
    num: "02", year: "2025", title: "ESTATE · CONCIERGE", tag: "AI · MOOD ROUTER",
    summary: "A REAL-ESTATE CHATBOT THAT DOESN'T ACT LIKE ONE. RETRIEVES THE LISTING GRAPH, INFERS BUYER MOOD, SURFACES THREE OPTIONS INSTEAD OF A PARAGRAPH.",
    chapters: [
      { h: "// PROBLEM", p: "BUYERS DON'T WANT A CONVERSATION. THEY WANT A SHORTER PATH TO A DECISION. MOST REAL-ESTATE AI GIVES THEM MORE CONVERSATION." },
      { h: "// SYSTEM",  p: "MOOD CLASSIFIER → ROUTER → RETRIEVER. EACH MESSAGE ROUTES TO ONE OF FOUR REPLY SHAPES: SHORTLIST, SHAPE-THE-QUESTION, ANSWER OR ESCALATE." },
      { h: "// LESSON",  p: "PEOPLE DON'T WANT A CHATBOT. THEY WANT A SHORTER PATH TO A DECISION." },
      { h: "// STATE",   p: "SHIPPED · CLIENT PROJECT · 4 MARKETS" },
    ],
    stack: ["PYTHON", "FASTAPI", "LANGCHAIN", "POSTGRES"],
    tone: "crimson", art: "chat",
  },
  {
    num: "03", year: "2025", title: "SG · MEET HALFWAY", tag: "SPATIAL · SOCIAL",
    summary: "A SCHEDULING TOY FOR SINGAPORE. DROP YOUR FRIENDS ON THE MAP, PICK A VIBE, GET A COFFEE SPOT THAT'S FAIR FOR EVERYONE — TRANSIT-WEIGHTED, NEVER JUST THE MIDPOINT.",
    chapters: [
      { h: "// PROBLEM", p: "'WHERE SHOULD WE MEET?' DEVOLVES INTO PASSIVE-AGGRESSIVE GROUP CHAT. THE GEOMETRIC MIDPOINT IS RARELY THE FAIR POINT." },
      { h: "// SYSTEM",  p: "WEISZFELD GEOMETRIC MEDIAN, WEIGHTED BY TRANSIT TIME TO NEAREST MRT, RE-RANKED BY POI VIBE." },
      { h: "// LESSON",  p: "FAIRNESS IS A DESIGN DECISION LONG BEFORE IT'S A MATH ONE." },
      { h: "// STATE",   p: "SHIPPED · 1.2K MAU · 6 MONTHS" },
    ],
    stack: ["REACT", "MAPBOX GL", "SUPABASE", "N8N"],
    tone: "cream", art: "map",
  },
  {
    num: "04", year: "2025", title: "VESSEL", tag: "GENERATIVE · CANVAS",
    summary: "A REAL-TIME GENERATIVE CANVAS. TYPE A PHRASE, WATCH IT BECOME A LIVING COMPOSITION — TYPOGRAPHY, MOTION AND COLOR REACT TOGETHER. SHADER-ONLY · ONE GPU PASS.",
    chapters: [
      { h: "// PROBLEM", p: "MOST GENERATIVE TOOLS OUTPUT A PICTURE. I WANTED ONE THAT OUTPUTS A FEELING. DIFFUSION IS SLOW · OPAQUE · EXPENSIVE." },
      { h: "// SYSTEM",  p: "SENTENCE-LEVEL MOOD VECTOR → UNIFORMS → FRAGMENT SHADER. CADENCE DRIVES MOTION · NOUNS DRIVE GEOMETRY · ONE GPU PASS." },
      { h: "// LESSON",  p: "CONSTRAINTS MAKE GENERATIVE WORK FEEL INTENTIONAL. SHADERS ENFORCE THEM." },
      { h: "// STATE",   p: "WIP · PUBLIC SOON · AUDIO LAYER NEXT" },
    ],
    stack: ["WEBGL", "GLSL", "REACT", "WEBAUDIO"],
    tone: "ink", art: "shader",
  },
];

function ArtAtlas() {
  return (
    <svg viewBox="0 0 600 450" className="art" preserveAspectRatio="xMidYMid slice">
      <rect x="40" y="40" width="370" height="370" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1"/>
      <text x="40" y="32" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="1.5" fill="currentColor" opacity="0.55">CANVAS / BRAND-DECK-V3.FIG</text>
      <rect x="80" y="100" width="180" height="60" fill="currentColor" opacity="0.10" stroke="currentColor" strokeOpacity="0.4" strokeDasharray="3 3"/>
      <text x="88" y="120" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="1.5" fill="currentColor" opacity="0.95">SELECTION · HERO-CARD</text>
      <text x="88" y="134" fontFamily="JetBrains Mono" fontSize="8" fill="currentColor" opacity="0.55">LAST EDIT · 14:32</text>
      <rect x="80" y="180" width="180" height="60" fill="none" stroke="rgba(230, 58, 46, 0.95)" strokeWidth="1.5" strokeDasharray="2 3"/>
      <text x="88" y="200" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="1.5" fill="rgba(230, 58, 46, 1)">GHOST · SUGGESTED NEXT</text>
      <text x="88" y="214" fontFamily="JetBrains Mono" fontSize="8" fill="currentColor" opacity="0.5">TAB ACCEPT · ESC DISMISS</text>
      <rect x="430" y="40" width="140" height="370" fill="currentColor" opacity="0.06" stroke="currentColor" strokeOpacity="0.2"/>
      <text x="440" y="60" fontFamily="JetBrains Mono" fontSize="9" fill="currentColor" opacity="0.6">SUMMON · ⌘K</text>
      <line x1="440" y1="68" x2="560" y2="68" stroke="currentColor" strokeOpacity="0.15"/>
      {["HERO-CARD","CTA-ROW","BADGE-AMBER","TESTIMONIAL","CALLOUT-SAGE","GRID-2-COL","CAROUSEL"].map((s, i) => (
        <g key={s}>
          <rect x="440" y={80 + i * 36} width="120" height="28"
            fill={i === 0 ? "rgba(230, 58, 46, 0.45)" : "currentColor"} opacity={i === 0 ? 0.95 : 0.05}/>
          <text x="448" y={98 + i * 36} fontFamily="JetBrains Mono" fontSize="10" fill="currentColor" opacity="0.85">{s}</text>
          <text x="550" y={98 + i * 36} fontFamily="JetBrains Mono" fontSize="9" fill="currentColor" opacity="0.4" textAnchor="end">⌘{i+1}</text>
        </g>
      ))}
    </svg>
  );
}
function ArtChat() {
  return (
    <svg viewBox="0 0 600 450" className="art" preserveAspectRatio="xMidYMid slice">
      <rect x="180" y="40" width="380" height="36" fill="rgba(255,255,255,0.10)"/>
      <text x="188" y="62" fontFamily="JetBrains Mono" fontSize="11" fill="currentColor" opacity="0.9">"3-ROOM NEAR TAMPINES, UNDER 1.2M, QUIET STREET"</text>
      <rect x="40" y="92" width="120" height="22" fill="none" stroke="currentColor" strokeDasharray="2 2"/>
      <text x="48" y="107" fontFamily="JetBrains Mono" fontSize="10" fill="currentColor" opacity="0.95">MOOD · SERIOUS</text>
      <text x="40" y="136" fontFamily="JetBrains Mono" fontSize="9" fill="currentColor" opacity="0.55">ROUTE · SHORTLIST-3</text>
      {[
        { x: 40,  t: "TAMPINES ST 32", p: "$1.18M · 99Y", a: "9 MIN MRT" },
        { x: 230, t: "PASIR RIS D5",   p: "$1.09M · 99Y", a: "12 MIN MRT" },
        { x: 420, t: "BEDOK RISE",     p: "$1.21M · 99Y", a: "6 MIN MRT" },
      ].map((c, i) => (
        <g key={c.t}>
          <rect x={c.x} y="156" width="160" height="240"
            fill="rgba(255,255,255,0.12)" stroke={i === 0 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.25)"} strokeWidth={i === 0 ? "2" : "1"}/>
          <rect x={c.x + 8} y="166" width="144" height="100" fill="rgba(255,255,255,0.10)"/>
          <line x1={c.x + 8} y1="166" x2={c.x + 152} y2="266" stroke="rgba(255,255,255,0.18)"/>
          <text x={c.x + 12} y="288" fontFamily="Archivo" fontWeight="900" fontSize="14" fill="currentColor" opacity="0.95">{c.t}</text>
          <text x={c.x + 12} y="306" fontFamily="JetBrains Mono" fontSize="9" fill="currentColor" opacity="0.7">{c.p}</text>
          <text x={c.x + 12} y="322" fontFamily="JetBrains Mono" fontSize="9" fill="currentColor" opacity="1" fontWeight="700">{c.a}</text>
          <text x={c.x + 12} y="368" fontFamily="JetBrains Mono" fontSize="9" fill="currentColor" opacity="0.5">⌘ {i+1} · OPEN</text>
        </g>
      ))}
    </svg>
  );
}
function ArtMap() {
  return (
    <svg viewBox="0 0 600 450" className="art" preserveAspectRatio="xMidYMid slice">
      <g stroke="currentColor" strokeOpacity="0.30" fill="none" strokeWidth="1.2">
        <path d="M0 110 Q200 150 400 120 T600 150"/>
        <path d="M0 250 Q120 230 280 270 T600 250"/>
        <path d="M120 0 Q140 150 90 290 T120 450"/>
        <path d="M340 0 Q360 130 320 250 T380 450"/>
        <path d="M0 360 Q300 390 600 360"/>
      </g>
      {[{x:120,y:140,l:"A"},{x:380,y:190,l:"B"},{x:260,y:310,l:"C"},{x:460,y:280,l:"D"}].map(p=>(
        <g key={p.l}>
          <circle cx={p.x} cy={p.y} r="14" fill="none" stroke="currentColor" strokeOpacity="0.85" strokeDasharray="2 2"/>
          <circle cx={p.x} cy={p.y} r="5" fill="currentColor"/>
          <text x={p.x + 11} y={p.y + 4} fontFamily="Archivo" fontWeight="900" fontSize="14" fill="currentColor" letterSpacing="1">{p.l}</text>
        </g>
      ))}
      <g>
        <circle cx="290" cy="220" r="28" fill="rgba(230, 58, 46, 0.18)" stroke="rgba(230, 58, 46, 0.85)" strokeWidth="2"/>
        <circle cx="290" cy="220" r="8" fill="rgba(230, 58, 46, 0.95)"/>
        <text x="306" y="216" fontFamily="JetBrains Mono" fontSize="10" fill="currentColor" fontWeight="700">FAIR · 4 MIN Δ</text>
        <text x="306" y="230" fontFamily="JetBrains Mono" fontSize="9" fill="currentColor" opacity="0.75">@ COMMON MAN · COZY</text>
      </g>
      <text x="40" y="42" fontFamily="JetBrains Mono" fontSize="10" letterSpacing="1.5" fill="currentColor" opacity="0.7">SG · LIVE</text>
    </svg>
  );
}
function ArtShader() {
  return (
    <svg viewBox="0 0 600 450" className="art" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="v4sh1" cx="0.3" cy="0.45"><stop offset="0" stopColor="rgba(230, 58, 46, 0.85)"/><stop offset="1" stopColor="rgba(230, 58, 46, 0)"/></radialGradient>
        <radialGradient id="v4sh2" cx="0.75" cy="0.65"><stop offset="0" stopColor="rgba(111, 182, 196, 0.55)"/><stop offset="1" stopColor="rgba(111, 182, 196, 0)"/></radialGradient>
        <linearGradient id="v4sh3" x1="0" x2="1"><stop offset="0" stopColor="rgba(255,255,255,0)"/><stop offset="1" stopColor="rgba(255,255,255,0.25)"/></linearGradient>
      </defs>
      <rect width="600" height="450" fill="url(#v4sh1)"/>
      <rect width="600" height="450" fill="url(#v4sh2)"/>
      <rect width="600" height="450" fill="url(#v4sh3)"/>
      <g stroke="currentColor" strokeOpacity="0.30" fill="none" strokeWidth="0.8">
        {Array.from({length:28}).map((_,i)=>(
          <path key={i} d={`M 0 ${10 + i * 16} C 120 ${6 + i * 14} 300 ${50 + i * 18} 600 ${30 + i * 15}`}/>
        ))}
      </g>
      <rect x="40" y="380" width="520" height="40" fill="rgba(0,0,0,0.55)"/>
      <text x="54" y="406" fontFamily="JetBrains Mono" fontSize="12" fill="currentColor" opacity="0.95">"SLOW MORNING, WARM LIGHT, ALMOST NOTHING"</text>
      <text x="490" y="406" fontFamily="JetBrains Mono" fontSize="10" fill="currentColor" fontWeight="700">↵ SHADE</text>
      <text x="40" y="52" fontFamily="JetBrains Mono" fontSize="10" letterSpacing="1.5" fill="currentColor" opacity="0.85">VESSEL · F 244 · 11.2MS</text>
    </svg>
  );
}
function ArtFor({ kind }) {
  if (kind === "atlas")  return <ArtAtlas/>;
  if (kind === "chat")   return <ArtChat/>;
  if (kind === "map")    return <ArtMap/>;
  if (kind === "shader") return <ArtShader/>;
  return null;
}

function Case({ p }) {
  const cls = "case-frame " + (p.tone === "cream" ? "cream" : p.tone === "crimson" ? "crimson" : "");
  return (
    <Reveal as="article" className="case">
      <div className="case-text">
        <div className="meta">
          <span className="num">{p.num}</span>
          <span>· {p.year}</span>
          <span className="acc">· {p.tag}</span>
        </div>
        <h3>{p.title}<span className="accent">.</span></h3>
        <p className="summary">{p.summary}</p>
        <div className="chapters">
          {p.chapters.map((c, i) => (
            <div key={i} className="ch">
              <h6>{c.h}</h6>
              <p>{c.p}</p>
            </div>
          ))}
        </div>
        <div className="stack-rail">
          {p.stack.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      </div>
      <div className={cls}>
        <span className="corner tl">SCROLL № {p.num} · {p.tag}</span>
        <span className="corner tr">FILE · {p.title.toLowerCase().replace(/[^a-z]+/g, '-')}</span>
        <span className="corner bl">{p.stack.join(" · ")}</span>
        <span className="corner br">{p.year}</span>
        <ArtFor kind={p.art} />
        <span className="art-num">{p.num}</span>
      </div>
    </Reveal>
  );
}

function Work() {
  return (
    <section id="work" className="section">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="stamp"><span className="now">003</span> / 05</span>
          <div className="name">
            <span className="num">03</span>
            <span className="pipe"></span>
            <span className="word">WORK</span>
          </div>
          <span className="right-stamp"><span className="acc">●</span> AYUSH SINGH</span>
        </Reveal>

        <div className="work-intro">
          <Reveal className="lede" delay={1}>
            FOUR ENGAGEMENTS.<br/>
            ONE <span className="acc">LIVING</span> POSTURE.
          </Reveal>
          <Reveal className="side" delay={2}>
            // EACH PROJECT BELOW IS A SYSTEM I SHIPPED OR STUDIED FOR LONG ENOUGH TO LEARN SOMETHING.
            CHAPTERS FOLLOW HOW I ACTUALLY THINK — PROBLEM, SYSTEM, LESSON, STATE.
          </Reveal>
        </div>

        <div className="work-list">
          {PROJECTS.map(p => <Case key={p.num} p={p} />)}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   LOG  — chronological list, reference layout
   ============================================================ */
const LOG = [
  { year: "2024 – 2028", title: "COMPUTER SCIENCE & DESIGN",        where: "SUTD",                tag: "EDUCATION", featured: true },
  { year: "2025",        title: "MARITIME HACKATHON",                where: "NUS",                 tag: "HACKATHON" },
  { year: "2025",        title: "EVENTS & WELFARE DIRECTOR",         where: "STUDENT GOVERNMENT",  tag: "LEADERSHIP" },
  { year: "2024",        title: "CATALYSTX STARTATHON — $200 BEST CREATIVE IDEA", where: "NTU", tag: "HACKATHON" },
  { year: "2024",        title: "SIM UOL CSSC HACKATHON",            where: "SIM",                 tag: "HACKATHON" },
  { year: "2024",        title: "WHAT THE HACK",                     where: "SUTD",                tag: "HACKATHON" },
  { year: "2023",        title: "BIODIVERSITY CONSERVATION",         where: "ACCB CAMBODIA",       tag: "VOLUNTEER" },
];

function Log() {
  return (
    <section id="log" className="section">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="stamp"><span className="now">004</span> / 05</span>
          <div className="name">
            <span className="num">04</span>
            <span className="pipe"></span>
            <span className="word">LOG</span>
          </div>
          <span className="right-stamp"><span className="acc">●</span> AYUSH SINGH</span>
        </Reveal>
        <div className="log-list">
          {LOG.map((row, i) => (
            <Reveal key={i} className="log-row" delay={Math.min(i, 4)}>
              <span className="year">{row.year}</span>
              <span className="title">{row.title}</span>
              <span className="where">{row.where}</span>
              <span className={"tag" + (row.featured ? " education" : "")}>{row.tag}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CONNECT  — contact in reference layout
   ============================================================ */
function Connect() {
  return (
    <section id="connect" className="section">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="stamp"><span className="now">005</span> / 05</span>
          <div className="name">
            <span className="num">05</span>
            <span className="pipe"></span>
            <span className="word">CONNECT</span>
          </div>
          <span className="right-stamp"><span className="acc">●</span> AYUSH SINGH</span>
        </Reveal>

        <div className="connect-stage">
          <div className="connect-main">
            <Reveal className="lede">
              WHETHER YOU HAVE A PROJECT IDEA, A HACKATHON COLLABORATION, OR JUST WANT TO CONNECT —
              <span className="acc"> I'D LOVE TO HEAR FROM YOU.</span> CURRENTLY BASED IN SINGAPORE,
              OPEN TO INTERESTING PROBLEMS AND CREATIVE BUILDS.
            </Reveal>
            <Reveal className="links" delay={2}>
              <a href="mailto:hello@ayushsingh.dev"><span className="k">EMAIL</span><span className="v">hello@ayushsingh.dev</span><span className="arr">↗</span></a>
              <a href="#"><span className="k">GITHUB</span><span className="v">github.com/ayushsingh</span><span className="arr">↗</span></a>
              <a href="#"><span className="k">LINKEDIN</span><span className="v">linkedin.com/in/ayush-singh</span><span className="arr">↗</span></a>
              <a href="#"><span className="k">READ.CV</span><span className="v">read.cv/ayush</span><span className="arr">↗</span></a>
              <a href="#"><span className="k">X / TWITTER</span><span className="v">@ayush</span><span className="arr">↗</span></a>
            </Reveal>
          </div>
          <Reveal className="connect-side" delay={2}>
            <h4>// LINKS</h4>
            <div className="stack-cell">REACT</div>
            <div className="stack-cell">NEXT.JS</div>
            <div className="stack-cell">TYPESCRIPT</div>
            <div className="stack-cell">PYTHON</div>
            <div className="stack-cell">GLSL</div>
            <div className="stack-cell">POSTGRES</div>
            <div className="stack-cell">FIGMA</div>
          </Reveal>
        </div>

        <div className="colophon">
          <div className="cell"><span className="k">EDITION</span><span className="v">VOL · 05.0 · SPRING 26</span></div>
          <div className="cell"><span className="k">SET IN</span><span className="v"><span className="acc">ARCHIVO BLACK</span> · JETBRAINS MONO</span></div>
          <div className="cell"><span className="k">PALETTE</span><span className="v">CREAM · INK · <span className="acc">CRIMSON</span></span></div>
          <div className="cell"><span className="k">© 2026</span><span className="v">AYUSH SINGH · ALL RIGHTS</span></div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Work, Log, Connect });
