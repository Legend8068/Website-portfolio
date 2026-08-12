/* global React */
const { useEffect: useEffectB, useRef: useRefB, useState: useStateB } = React;

/* ============================================================
   TOP BAR + vertical margin markers (with active section)
   ============================================================ */
function TopBar() {
  return (
    <header className="topbar">
      <a href="#hero" className="brand">
        <span className="seal">A</span>
        <span>AYUSH · SINGH <span style={{ color: "var(--mute)" }}>// CDS · NTU</span></span>
      </a>
      <nav className="links">
        <a href="#hero"><span className="n">01</span> HERO</a>
        <a href="#core"><span className="n">02</span> CORE</a>
        <a href="#manifesto"><span className="n">03</span> MANIFESTO</a>
        <a href="#battles"><span className="n">04</span> BATTLES</a>
        <a href="#signal"><span className="n">05</span> SIGNAL</a>
      </nav>
      <div className="status">
        <span className="dot"></span>
        <span>AVAILABLE · S26+ · GMT+8</span>
      </div>
    </header>
  );
}

const MARK_SECTIONS = [
  { id: "hero",      label: "HERO",      num: "01" },
  { id: "core",      label: "CORE",      num: "02" },
  { id: "manifesto", label: "MANIFESTO", num: "03" },
  { id: "battles",   label: "BATTLES",   num: "04" },
  { id: "signal",    label: "SIGNAL",    num: "05" },
];

function MarginMarks() {
  const [active, setActive] = useStateB("hero");
  useEffectB(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -40% 0px", threshold: [0, 0.2, 0.6] }
    );
    MARK_SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);
  return (
    <>
      <aside className="margin-mark left">
        {MARK_SECTIONS.map(s => (
          <span key={s.id} className={"vt" + (active === s.id ? " active" : "")}>
            <span className="accent">{s.num}</span> / {s.label}
          </span>
        ))}
      </aside>
      <aside className="margin-mark right">
        <span className="vt"><span className="accent">EDITION</span> · 04.0 · SPRING 26</span>
        <span className="vt"><span className="accent">PRESS</span> · NO TEMPLATE · NO BENTO</span>
      </aside>
    </>
  );
}

/* ============================================================
   BIODATA — 4 quadrant
   ============================================================ */
function RotatingCrest() {
  const ref = useRefB(null);
  useEffectB(() => {
    let raf;
    const start = performance.now();
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      const node = ref.current;
      if (node) {
        node.style.transform = `rotate(${(t * 12) % 360}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="crest-stage">
      <svg viewBox="0 0 200 200" width="200" height="200">
        {/* fixed center disc */}
        <circle cx="100" cy="100" r="34" fill="var(--accent)"/>
        <text x="100" y="106" textAnchor="middle"
          fontFamily="Anton" fontSize="36" fill="var(--bg)" letterSpacing="1">A</text>

        {/* rotating ring */}
        <g ref={ref} style={{ transformOrigin: "100px 100px" }}>
          {/* outer dashed ring */}
          <circle cx="100" cy="100" r="78" fill="none" stroke="var(--bg)" strokeWidth="1.4" strokeDasharray="3 4"/>
          <circle cx="100" cy="100" r="56" fill="none" stroke="var(--bg)" strokeWidth="1.2" strokeDasharray="1 5"/>
          {/* ticks */}
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const x1 = 100 + Math.cos(a) * 82;
            const y1 = 100 + Math.sin(a) * 82;
            const x2 = 100 + Math.cos(a) * (i % 6 === 0 ? 90 : 86);
            const y2 = 100 + Math.sin(a) * (i % 6 === 0 ? 90 : 86);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={i % 6 === 0 ? "var(--accent)" : "var(--bg)"} strokeWidth="1.4"/>;
          })}
          {/* compass marks */}
          {["N","E","S","W"].map((c, i) => {
            const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
            const x = 100 + Math.cos(a) * 70;
            const y = 100 + Math.sin(a) * 70 + 4;
            return <text key={c} x={x} y={y} textAnchor="middle"
              fontFamily="JetBrains Mono" fontSize="9" fill="var(--bg)" letterSpacing="1">{c}</text>;
          })}
        </g>

        {/* counter rotating inner */}
        <g style={{ transformOrigin: "100px 100px", animation: "spinReverse 22s linear infinite" }}>
          <polygon points="100,46 130,100 100,154 70,100"
            fill="none" stroke="var(--bg)" strokeWidth="1.4"/>
        </g>

        <style>{`@keyframes spinReverse { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }`}</style>
      </svg>
    </div>
  );
}

function Biodata() {
  return (
    <section id="core">
      <div className="section-head">
        <span className="idx">02</span>
        <span className="title">Core / Biodata</span>
        <span className="right">FILE · ID/AYUSH.0026</span>
      </div>
      <div className="bio">
        <div className="bio-cell crest">
          <div className="lab"><span>CREST</span><span className="n">★ 01</span></div>
          <RotatingCrest/>
          <div className="meta"><span>SEAL</span><span>REV 04</span></div>
        </div>
        <div className="bio-cell">
          <div className="lab"><span>FOCUS</span><span className="n">02</span></div>
          <div className="val">Intelligent Interfaces<span style={{ color: "var(--accent)" }}>.</span></div>
        </div>
        <div className="bio-cell">
          <div className="lab"><span>LOCATION</span><span className="n">03</span></div>
          <div className="val">Singapore<br/><span style={{ color: "var(--accent)" }}>GMT+8</span> · 1.35°N</div>
        </div>
        <div className="bio-cell">
          <div className="lab"><span>STACK</span><span className="n">04</span></div>
          <div className="val" style={{ fontSize: "clamp(22px, 2.4vw, 36px)" }}>
            NEXT.JS / REACT / TS<br/>
            <span style={{ color: "var(--accent)" }}>+</span> THREE / FRAMER / PG
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   MANIFESTO  — 3 plates
   ============================================================ */
function Manifesto() {
  return (
    <section id="manifesto">
      <div className="section-head">
        <span className="idx">03</span>
        <span className="title">Manifesto</span>
        <span className="right">3 STATEMENTS · ABOUT POSTURE</span>
      </div>
      <div className="manifesto">
        <div className="plate">
          <div className="n">01</div>
          <h4>// POSTURE</h4>
          <div className="stmt">I build solutions, not portfolios.</div>
          <div className="body">
            Every project starts as a real problem I felt — a missing tool, a slow workflow, an idea I couldn't stop sketching. Polish is the side-effect of caring about the underlying thing.
          </div>
          <span className="stamp-r">▣ Plate 01</span>
        </div>
        <div className="plate">
          <div className="n">02</div>
          <h4>// CRAFT</h4>
          <div className="stmt">An interface should disappear when it works.</div>
          <div className="body">
            The best interaction is the one you don't notice. Motion explains structure; structure earns the motion. Both serve a faster path to the user's actual intent.
          </div>
          <span className="stamp-r">▣ Plate 02</span>
        </div>
        <div className="plate">
          <div className="n">03</div>
          <h4>// EDGE</h4>
          <div className="stmt">Intelligence should be ambient, not theatrical.</div>
          <div className="body">
            AI is most useful when it removes a step you didn't realise you were taking. Less chatbot. More current. Models live inside the verbs, not the modals.
          </div>
          <span className="stamp-r">▣ Plate 03</span>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { TopBar, MarginMarks, Biodata, Manifesto });
