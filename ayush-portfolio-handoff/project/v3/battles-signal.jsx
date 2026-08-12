/* global React */
const { useEffect: useEffectBA, useRef: useRefBA, useState: useStateBA } = React;

/* ============================================================
   BATTLES — poster case studies with parallax cards + giant overlapping type
   ============================================================ */

const BATTLES = [
  {
    n: "01",
    year: "26",
    title: "ATLAS",
    headlineColor: "red",
    tag: "DESIGN COPILOT",
    desc: "An ambient design assistant that learns your visual vocabulary and surfaces components, tokens and references before you ask. No modal. No chatbot. Inline ghost text.",
    role: "SOLO · SYSTEM & UI",
    stack: "NEXT.JS · TRPC · PGVECTOR",
    state: "V0.3 · BETA",
    tags: ["AI", "DESIGN TOOLS", "INLINE UX"],
    artKind: "atlas",
    artTone: "dark",
  },
  {
    n: "02",
    year: "25",
    title: "SG · MEET HALFWAY",
    headlineColor: "ink",
    tag: "SPATIAL · SOCIAL",
    desc: "A scheduling toy for Singapore. Drop your friends, pick a vibe, get a fair coffee spot — transit-weighted, never just the geometric midpoint.",
    role: "SOLO · WEEKEND",
    stack: "REACT · MAPBOX · SUPABASE",
    state: "SHIPPED · 1.2K MAU",
    tags: ["MAPS", "GEOMETRIC MEDIAN", "FAIRNESS"],
    artKind: "map",
    artTone: "invert",
  },
  {
    n: "03",
    year: "25",
    title: "ESTATE · CONCIERGE",
    headlineColor: "red",
    tag: "MOOD ROUTER",
    desc: "A real-estate chatbot that doesn't act like one. Retrieves the listing graph, infers buyer mood, surfaces three options instead of a paragraph.",
    role: "LEAD ENG · 2 COLLABS",
    stack: "PYTHON · FASTAPI · LLM",
    state: "SHIPPED · CLIENT",
    tags: ["AI", "RETRIEVAL", "DECISION UX"],
    artKind: "chat",
    artTone: "cream",
  },
  {
    n: "04",
    year: "25",
    title: "VESSEL",
    headlineColor: "ink",
    tag: "GENERATIVE CANVAS",
    desc: "Type a phrase, watch it become a living composition. Typography, motion and color react together. Shader-only — every frame is one GPU pass.",
    role: "SOLO · RESEARCH",
    stack: "WEBGL · GLSL · WEBAUDIO",
    state: "WIP · PUBLIC SOON",
    tags: ["GENERATIVE", "SHADER", "TYPE"],
    artKind: "shader",
    artTone: "dark",
  },
];

function ArtAtlas() {
  return (
    <svg viewBox="0 0 600 360" className="art-svg">
      <rect x="20" y="20" width="380" height="320" fill="none" stroke="rgba(244,240,234,0.6)" strokeWidth="1.5"/>
      <rect x="50" y="60" width="180" height="60" fill="rgba(244,240,234,0.18)" stroke="rgba(244,240,234,0.6)" strokeDasharray="4 4"/>
      <text x="58" y="80" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(244,240,234,0.85)" letterSpacing="1">SELECTION · hero-card</text>
      <text x="58" y="96" fontFamily="JetBrains Mono" fontSize="8" fill="rgba(244,240,234,0.5)">last · 14:32</text>
      <rect x="50" y="140" width="180" height="60" fill="none" stroke="rgba(178,34,52,0.95)" strokeDasharray="2 3"/>
      <text x="58" y="160" fontFamily="JetBrains Mono" fontSize="9" fill="var(--accent)" letterSpacing="1">GHOST · suggested next</text>
      <text x="58" y="176" fontFamily="JetBrains Mono" fontSize="8" fill="rgba(244,240,234,0.55)">tab to accept</text>
      <rect x="420" y="20" width="160" height="320" fill="rgba(17,17,17,0.7)" stroke="rgba(244,240,234,0.6)"/>
      <text x="432" y="42" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(244,240,234,0.7)">SUMMON · ⌘K</text>
      {["hero-card","cta-row","badge-clay","testimonial","callout-sage"].map((s, i) => (
        <g key={s}>
          <rect x="432" y={56 + i * 30} width="138" height="22" fill={i===0 ? "rgba(178,34,52,0.35)" : "rgba(244,240,234,0.08)"}/>
          <text x="440" y={71 + i * 30} fontFamily="JetBrains Mono" fontSize="10" fill="rgba(244,240,234,0.9)">{s}</text>
          <text x="558" y={71 + i * 30} fontFamily="JetBrains Mono" fontSize="9" fill="rgba(244,240,234,0.5)" textAnchor="end">⌘{i+1}</text>
        </g>
      ))}
    </svg>
  );
}

function ArtMap() {
  return (
    <svg viewBox="0 0 600 360" className="art-svg">
      <g stroke="rgba(244,240,234,0.45)" strokeWidth="1.2" fill="none">
        <path d="M0 90 Q200 130 400 100 T600 130"/>
        <path d="M0 220 Q120 200 280 240 T600 220"/>
        <path d="M120 0 Q140 130 90 260 T120 360"/>
        <path d="M340 0 Q360 110 320 220 T380 360"/>
        <path d="M0 300 Q300 330 600 300"/>
      </g>
      {[{x:120,y:100,l:"A"},{x:380,y:160,l:"B"},{x:260,y:270,l:"C"},{x:460,y:240,l:"D"}].map(p=>(
        <g key={p.l}>
          <circle cx={p.x} cy={p.y} r="14" fill="none" stroke="rgba(244,240,234,0.95)" strokeDasharray="2 2"/>
          <circle cx={p.x} cy={p.y} r="6" fill="rgba(244,240,234,0.95)"/>
          <text x={p.x + 10} y={p.y + 4} fontFamily="Anton" fontSize="14" fill="rgba(244,240,234,0.95)">{p.l}</text>
        </g>
      ))}
      <g>
        <circle cx="290" cy="190" r="26" fill="rgba(17,17,17,0.5)" stroke="var(--ink)" strokeWidth="2"/>
        <circle cx="290" cy="190" r="8" fill="var(--ink)"/>
        <text x="306" y="186" fontFamily="JetBrains Mono" fontSize="10" fill="var(--ink)" fontWeight="700">FAIR · 4 MIN Δ</text>
        <text x="306" y="200" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(17,17,17,0.7)">@ COMMON MAN</text>
      </g>
      <g>
        <text x="30" y="40" fontFamily="Anton" fontSize="40" fill="rgba(17,17,17,0.95)">SG · 03</text>
      </g>
    </svg>
  );
}

function ArtChat() {
  return (
    <svg viewBox="0 0 600 360" className="art-svg">
      <rect x="180" y="30" width="380" height="32" fill="rgba(17,17,17,0.1)"/>
      <text x="188" y="51" fontFamily="JetBrains Mono" fontSize="11" fill="var(--ink)">"3-rm Tampines, under 1.2M, quiet street"</text>
      <rect x="30" y="78" width="120" height="22" fill="none" stroke="var(--ink)" strokeDasharray="2 2"/>
      <text x="40" y="93" fontFamily="JetBrains Mono" fontSize="10" fill="var(--ink)">MOOD · SERIOUS</text>
      <text x="30" y="118" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(17,17,17,0.55)">ROUTE · SHORTLIST-3</text>
      {[
        { x: 30,  t: "TAMPINES 32", p: "$1.18M · 99Y", a: "9 MIN MRT" },
        { x: 220, t: "PASIR RIS D5", p: "$1.09M · 99Y", a: "12 MIN MRT" },
        { x: 410, t: "BEDOK RISE", p: "$1.21M · 99Y", a: "6 MIN MRT" },
      ].map((c, i) => (
        <g key={c.t}>
          <rect x={c.x} y="138" width="160" height="180" fill="rgba(244,240,234,0.9)" stroke={i===0?"var(--accent)":"rgba(17,17,17,0.4)"} strokeWidth={i===0?"2":"1"}/>
          <rect x={c.x + 8} y="146" width="144" height="80" fill="rgba(17,17,17,0.05)"/>
          <line x1={c.x+8} y1="146" x2={c.x+152} y2="226" stroke="rgba(17,17,17,0.15)"/>
          <text x={c.x + 12} y="246" fontFamily="Anton" fontSize="20" fill="var(--ink)">{c.t}</text>
          <text x={c.x + 12} y="266" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(17,17,17,0.7)">{c.p}</text>
          <text x={c.x + 12} y="282" fontFamily="JetBrains Mono" fontSize="9" fill="var(--accent)" fontWeight="700">{c.a}</text>
          <text x={c.x + 12} y="304" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(17,17,17,0.45)">⌘ {i+1} · OPEN</text>
        </g>
      ))}
    </svg>
  );
}

function ArtShader() {
  return (
    <svg viewBox="0 0 600 360" className="art-svg">
      <defs>
        <radialGradient id="sh1" cx="0.3" cy="0.45"><stop offset="0" stopColor="rgba(178,34,52,0.85)"/><stop offset="1" stopColor="rgba(178,34,52,0)"/></radialGradient>
        <radialGradient id="sh2" cx="0.75" cy="0.6"><stop offset="0" stopColor="rgba(244,240,234,0.55)"/><stop offset="1" stopColor="rgba(244,240,234,0)"/></radialGradient>
      </defs>
      <rect width="600" height="360" fill="url(#sh1)"/>
      <rect width="600" height="360" fill="url(#sh2)"/>
      <g stroke="rgba(244,240,234,0.45)" fill="none" strokeWidth="0.8">
        {Array.from({length:22}).map((_,i)=>(
          <path key={i} d={`M 0 ${10 + i * 16} C 150 ${4 + i * 14} 300 ${50 + i * 18} 600 ${30 + i * 15}`}/>
        ))}
      </g>
      <rect x="30" y="300" width="540" height="36" fill="rgba(17,17,17,0.85)"/>
      <text x="42" y="324" fontFamily="JetBrains Mono" fontSize="11" fill="rgba(244,240,234,0.95)">"slow morning, warm light, almost nothing"</text>
      <text x="500" y="324" fontFamily="JetBrains Mono" fontSize="9" fill="var(--bg)" fontWeight="700">↵ SHADE</text>
      <text x="30" y="40" fontFamily="Anton" fontSize="32" fill="rgba(244,240,234,0.95)">VESSEL · F 244</text>
    </svg>
  );
}

function ArtFor({ kind }) {
  if (kind === "atlas")  return <ArtAtlas/>;
  if (kind === "map")    return <ArtMap/>;
  if (kind === "chat")   return <ArtChat/>;
  if (kind === "shader") return <ArtShader/>;
  return null;
}

function Poster({ b, index }) {
  const ref = useRefBA(null);
  useEffectBA(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const tick = () => {
      raf = null;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // progress: when card center enters from bottom
      const center = rect.top + rect.height / 2;
      const p = (vh - center) / vh; // 0 below viewport center, 1 at top, etc
      const clamped = Math.max(-0.4, Math.min(0.6, p));
      const ty = -clamped * 36;  // gentle parallax
      el.style.transform = `translateY(${ty}px)`;
    };
    const onScroll = () => { if (raf) return; raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", tick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", tick);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  const artClass = "poster-art " + (b.artTone === "invert" ? "invert" : b.artTone === "cream" ? "cream" : "");
  return (
    <article className="poster" ref={ref}>
      <div className={artClass}>
        <span className="corner tl">SCROLL № {b.n} · {b.tag}</span>
        <span className="corner tr">FILE / {b.title.replace(/\s+/g,'').toLowerCase()}.case</span>
        <span className="corner bl">{b.stack}</span>
        <span className="corner br">{b.state}</span>
        <ArtFor kind={b.artKind} />
        <span className="art-num">{b.n}</span>
      </div>
      <div className="poster-body">
        <div className="meta">
          <span className="num">{b.n}</span>
          <span className="year">·  20{b.year}</span>
          <span style={{ color: "var(--accent)" }}>·  {b.tag}</span>
        </div>
        <h3>
          {b.headlineColor === "red"
            ? <><span>{b.title.split(" ")[0]}</span> {b.title.split(" ").slice(1).map((w, i) => <span key={i} className="red">{w} </span>)}</>
            : <>{b.title}</>}
        </h3>
        <p>{b.desc}</p>
        <div className="tags">{b.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
        <div className="meta-rail">
          <div className="cell"><span className="k">// ROLE</span><span className="v">{b.role}</span></div>
          <div className="cell"><span className="k">// STACK</span><span className="v">{b.stack}</span></div>
          <div className="cell"><span className="k">// STATE</span><span className="v">{b.state}</span></div>
        </div>
      </div>
    </article>
  );
}

function Battles() {
  return (
    <section id="battles">
      <div className="section-head">
        <span className="idx">04</span>
        <span className="title">Battles / Selected Systems</span>
        <span className="right">4 SCROLLS · ENGAGEMENTS 22 – 26</span>
      </div>
      <div className="battles-stage">
        <div className="battles-mega">
          <span className="word">SYSTEMS</span>
          <span className="word outline shift-l">SHIPPED</span>
          <span className="word shift-r"><span className="red">+ </span>STUDIED</span>
          <span className="footnote">↓ FOUR ENGAGEMENTS. ONE LIVING POSTURE.</span>
        </div>
        <div className="posters">
          {BATTLES.map((b, i) => <Poster key={b.n} b={b} index={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SIGNAL + COLOPHON
   ============================================================ */
function Signal() {
  return (
    <section id="signal">
      <div className="section-head">
        <span className="idx">05</span>
        <span className="title">Signal</span>
        <span className="right">CHANNELS · 4 · REPLY {"<"} 24H</span>
      </div>
      <div className="signal">
        <div className="signal-call">
          <div className="eyebrow">DISPATCH · BUILD WITH ME</div>
          <h2>
            LET'S BUILD<br/>
            SOMETHING<br/>
            <span className="red">UNMISTAKABLE.</span>
          </h2>
          <div className="row">
            <a href="mailto:hello@ayushsingh.dev">HELLO@AYUSHSINGH.DEV →</a>
            <a href="#" className="ghost">SCHEDULE A CALL →</a>
          </div>
        </div>
        <div className="signal-card">
          <h4>// NETWORKS</h4>
          <div className="links">
            <a href="#"><span>GITHUB</span><span>/AYUSH · ↗</span></a>
            <a href="#"><span>LINKEDIN</span><span>/AYUSH-SINGH · ↗</span></a>
            <a href="#"><span>READ.CV</span><span>/AYUSH · ↗</span></a>
            <a href="#"><span>X / TWITTER</span><span>@AYUSH · ↗</span></a>
          </div>
          <h4 style={{ marginTop: 10 }}>// COORDINATES</h4>
          <div className="row"><span>LOCALE</span><span className="v">SINGAPORE · GMT+8</span></div>
          <div className="row"><span>STATUS</span><span className="v">AVAILABLE · S26+</span></div>
          <div className="row"><span>OPEN TO</span><span className="v">SWE · CREATIVE ENG · AI</span></div>
          <div className="row"><span>NOW</span><span className="v">ATLAS V0.4 · VESSEL AUDIO</span></div>
        </div>
      </div>
      <div className="colophon">
        <div className="cell"><span className="k">EDITION</span>VOL · 04.0 / SPRING 26</div>
        <div className="cell"><span className="k">PRESS</span>SET IN <span className="acc">ANTON</span> · SPACE GROTESK</div>
        <div className="cell"><span className="k">PALETTE</span>CREAM · INK · <span className="acc">CRIMSON</span></div>
        <div className="cell"><span className="k">© 2026</span>AYUSH · SINGH · ALL RIGHTS</div>
      </div>
    </section>
  );
}

Object.assign(window, { Battles, Signal });
