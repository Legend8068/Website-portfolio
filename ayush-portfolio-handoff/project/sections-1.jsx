/* global React, Reveal */
const { useEffect: useEffectS, useRef: useRefS, useState: useStateS } = React;

/* ============================================================
   NAV
   ============================================================ */
function Nav({ direction }) {
  return (
    <nav className="nav">
      <a href="#top" className="brand" data-cursor="link">
        <span className="badge">A</span>
        <span>Ayush Singh · CDS</span>
      </a>
      <div className="links">
        <a href="#philosophy"><span className="num">01</span>Philosophy</a>
        <a href="#work"><span className="num">02</span>Work</a>
        <a href="#playground"><span className="num">03</span>Playground</a>
        <a href="#signal"><span className="num">04</span>Signal</a>
      </div>
    </nav>
  );
}

/* ============================================================
   HERO
   ============================================================ */
function HeroSection({ direction }) {
  return (
    <section id="top" className="section hero">
      <div className="wrap">
        <div className="hero-top">
          <Reveal className="meta" delay={1}>
            <span className="pulse"></span>
            <span>Singapore · GMT+8 · Available · 2026</span>
          </Reveal>
          <Reveal className="meta" delay={2}>
            <span>v 04.0 — Spring 26</span>
          </Reveal>
        </div>

        <div>
          <Reveal as="h1" className="hero-headline display" delay={1}>
            <span className="row">Engineering</span>
            <span className="row indent italic">systems</span>
            <span className="row">that feel <span className="alive">alive.</span></span>
          </Reveal>
        </div>

        <div className="hero-bottom" style={{ marginTop: "auto" }}>
          <Reveal className="col" delay={2}>
            <h4>// Identity</h4>
            <p>
              Ayush Singh — a Computer Science &amp; Design student in Singapore.
              I build intelligent interfaces, generative systems, and the small
              connective tissue between them.
            </p>
          </Reveal>
          <Reveal className="col" delay={3}>
            <h4>// Practice</h4>
            <div className="tags">
              <span className="tag">Fullstack</span>
              <span className="tag">Creative FE</span>
              <span className="tag">AI Interfaces</span>
              <span className="tag">Motion</span>
              <span className="tag">Generative</span>
            </div>
          </Reveal>
          <Reveal className="col" delay={4} style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }}>
            <div className="hero-scroll">
              <span>Scroll · 00 → 04</span>
              <span className="scroll-line"></span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PHILOSOPHY
   ============================================================ */
const PHILOSOPHY = [
  {
    n: "01",
    tag: "Posture",
    stmt: "I build solutions, not portfolios.",
    gloss: "Every project here started as a real problem — friction I felt, a system I wanted to exist. Polish is a side-effect of caring.",
  },
  {
    n: "02",
    tag: "Craft",
    stmt: "Interfaces should disappear when they work.",
    gloss: "The best interaction is the one you don't notice. Motion explains structure; structure earns the motion.",
  },
  {
    n: "03",
    tag: "Method",
    stmt: "Design and engineering are the same conversation.",
    gloss: "I prototype to think. The fastest way to a good idea is a worse version of it on a screen, today.",
  },
  {
    n: "04",
    tag: "Edge",
    stmt: "Intelligence should be ambient, not theatrical.",
    gloss: "AI is most useful when it removes a step you didn't realise you were taking. Less chatbot, more current.",
  },
  {
    n: "05",
    tag: "Pace",
    stmt: "Ship sharp things. Then sharpen.",
    gloss: "Iteration over performance. The product I want to build is the next one.",
  },
];

function PhilosophySection() {
  return (
    <section id="philosophy" className="section">
      <div className="wrap">
        <Reveal className="section-label">
          <span className="idx">01</span><span>Philosophy</span><span className="line"></span><span>5 statements</span>
        </Reveal>
        <div className="philosophy">
          {PHILOSOPHY.map((p, i) => (
            <Reveal key={p.n} className="philos-row" delay={Math.min(i, 4)}>
              <span className="n">{p.n}</span>
              <span className="tag">{p.tag}</span>
              <span className="stmt">{p.stmt}</span>
              <span className="gloss">{p.gloss}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Nav, HeroSection, PhilosophySection });
