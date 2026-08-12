/* global React, Reveal */
const { useEffect: useEffectS, useRef: useRefS } = React;

/* ============================================================
   TOPBAR — MENU · NAME · CONTACT
   ============================================================ */
function TopBar({ overRed }) {
  return (
    <header className={"topbar" + (overRed ? " over-red" : "")}>
      <div className="left">
        <a href="#hero" className="name">MENU</a>
      </div>
      <a href="#hero" className="name">AYUSH SINGH</a>
      <div className="right">
        <a href="#connect" className="name">CONTACT</a>
      </div>
    </header>
  );
}

/* ============================================================
   INTRO  — short identity card
   ============================================================ */
function Intro() {
  return (
    <section id="intro" className="section">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="stamp"><span className="now">001</span> / 05</span>
          <div className="name">
            <span className="num">01</span>
            <span className="pipe"></span>
            <span className="word">INTRO</span>
          </div>
          <span className="right-stamp"><span className="acc">●</span> AYUSH SINGH</span>
        </Reveal>

        <div className="intro">
          <Reveal className="lede" delay={1}>
            COMPUTER SCIENCE &amp; DESIGN STUDENT IN <span className="acc">SINGAPORE</span>.
            BUILDING INTELLIGENT INTERFACES, GENERATIVE SYSTEMS AND THE CONNECTIVE
            TISSUE BETWEEN THEM. ONE FOOT IN A TERMINAL · ONE IN A SKETCHBOOK.
          </Reveal>
          <Reveal className="body" delay={2}>
            <div className="cell">
              <span className="k">// FOCUS</span>
              <span className="v">INTELLIGENT INTERFACES · AMBIENT INTELLIGENCE · CREATIVE FRONTEND</span>
            </div>
            <div className="cell">
              <span className="k">// STUDIES</span>
              <span className="v">SUTD · COMPUTER SCIENCE &amp; DESIGN · <span className="acc">2024 – 2028</span></span>
            </div>
            <div className="cell">
              <span className="k">// STACK</span>
              <span className="v">TS · REACT · NEXT.JS · PYTHON · GLSL · POSTGRES</span>
            </div>
            <div className="cell">
              <span className="k">// AVAILABLE</span>
              <span className="v">SWE / CREATIVE-ENG INTERNSHIPS · <span className="acc">S26+</span></span>
            </div>
            <div className="cell full">
              <span className="k">// CURRENTLY</span>
              <span className="v">SHIPPING ATLAS V0.4 · PROTOTYPING VESSEL'S AUDIO LAYER · ITERATING ON SG-MEETHALFWAY</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   MANIFESTO
   ============================================================ */
const MANIFESTO = [
  {
    n: "01",
    stmt: "BUILD SOLUTIONS, NOT PORTFOLIOS",
    gloss: <>EVERY PROJECT STARTED AS A <span className="high">PROBLEM I FELT</span> — A MISSING TOOL, A SLOW WORKFLOW, AN IDEA I COULDN'T STOP SKETCHING. POLISH IS THE SIDE EFFECT OF CARING ABOUT THE UNDERLYING THING.</>,
  },
  {
    n: "02",
    stmt: "THE BEST INTERFACE DISAPPEARS WHEN IT WORKS",
    gloss: <>MOTION <span className="high">EXPLAINS</span> STRUCTURE. STRUCTURE EARNS THE MOTION. BOTH SERVE A FASTER PATH TO THE USER'S ACTUAL INTENT. IF THE USER HAS TO THINK ABOUT THE INTERFACE, THE INTERFACE FAILED.</>,
  },
  {
    n: "03",
    stmt: "DESIGN & ENGINEERING ARE THE SAME CONVERSATION",
    gloss: <>I PROTOTYPE TO THINK. THE FASTEST ROUTE TO A GOOD IDEA IS A <span className="high">WORSE VERSION</span> OF IT ON A SCREEN TODAY, THEN A SHARPER ONE TOMORROW.</>,
  },
  {
    n: "04",
    stmt: "INTELLIGENCE SHOULD BE AMBIENT NOT THEATRICAL",
    gloss: <>AI IS MOST USEFUL WHEN IT <span className="high">REMOVES A STEP</span> YOU DIDN'T REALISE YOU WERE TAKING. LESS CHATBOT. MORE CURRENT. MODELS LIVE INSIDE THE VERBS — NOT THE MODALS.</>,
  },
];

function Manifesto() {
  return (
    <section id="manifesto" className="section">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="stamp"><span className="now">002</span> / 05</span>
          <div className="name">
            <span className="num">02</span>
            <span className="pipe"></span>
            <span className="word">POSTURE</span>
          </div>
          <span className="right-stamp"><span className="acc">●</span> AYUSH SINGH</span>
        </Reveal>
        <div className="manifesto-list">
          {MANIFESTO.map((m, i) => (
            <Reveal key={m.n} className="manifesto-row" delay={Math.min(i, 4)}>
              <span className="n">{m.n}</span>
              <span className="stmt">{m.stmt}</span>
              <span className="gloss">{m.gloss}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { TopBar, Intro, Manifesto });
