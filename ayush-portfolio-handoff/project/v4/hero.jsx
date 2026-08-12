/* global React, Reveal, useScrollProgress, clamp, lerp, smoothstep, easeOut, easeInOut */
const { useEffect: useEffectH, useRef: useRefH, useState: useStateH } = React;

/* ============================================================
   HERO — Poster sans + element-by-element materialization

   The BEFORE image stays at 100% opacity throughout. Three AFTER layers
   are stacked on top, each clipped to a feature region. As you scroll,
   each layer's clip-path animates from "collapsed" to "revealed":

     • HEADPHONES band  — clip top-down inside top 40%
     • GLASSES band     — clip horizontal-from-center inside eye band (32–48%)
     • SWEATER region   — clip bottom-up inside bottom 32%

   No fade. The face is the same throughout — it gets *augmented*.
   ============================================================ */

function Hero({ onStageChange }) {
  const runwayRef = useRefH(null);

  // Refs for direct DOM mutation (rAF-driven, no React re-renders per frame)
  const layerHeadphones = useRefH(null);
  const layerGlasses    = useRefH(null);
  const layerSweater    = useRefH(null);
  const baseRef         = useRefH(null);
  const portraitZone    = useRefH(null);
  const glowRef         = useRefH(null);
  const scrollPxRef     = useRefH(null);
  const stageNameRef    = useRefH(null);

  const [chapter, setChapter] = useStateH({ code: "I", name: "PERSON" });

  // Feature region rectangles, expressed as inset() values for clip-path.
  // (top, right, bottom, left) — all percentages
  // Headphones region: inside top 0..42% of frame
  // Glasses region:    inside 32..50% of frame (eye band)
  // Sweater region:    inside 64..100% of frame
  const REGIONS = {
    head:    { top: 0,  bottom: 58 },
    glasses: { top: 32, bottom: 52 },
    sweater: { top: 66, bottom: 0  },
  };

  const onScroll = React.useCallback((p) => {
    // ----- 1. HEADPHONES: reveal top-to-bottom within head region -----
    // Start hidden (top edge meets bottom edge at REGIONS.head.bottom)
    // End fully revealed (top=0, bottom=REGIONS.head.bottom)
    const tHead = smoothstep(0.10, 0.32, p);
    if (layerHeadphones.current) {
      const t = REGIONS.head;
      const topInset = lerp(100 - t.bottom, t.top, tHead);
      layerHeadphones.current.style.clipPath =
        `inset(${topInset}% 0 ${t.bottom}% 0)`;
    }

    // ----- 2. GLASSES: snap horizontally from center within eye band -----
    const tGlass = smoothstep(0.34, 0.56, p);
    if (layerGlasses.current) {
      const g = REGIONS.glasses;
      // Horizontal collapse: at p=0 both edges meet at 50%; at p=1 they reach 0/0
      const sideInset = lerp(50, 0, tGlass);
      layerGlasses.current.style.clipPath =
        `inset(${g.top}% ${sideInset}% ${g.bottom}% ${sideInset}%)`;
    }

    // ----- 3. SWEATER: fill from bottom up within sweater region -----
    const tSweat = smoothstep(0.58, 0.82, p);
    if (layerSweater.current) {
      const s = REGIONS.sweater;
      // Top edge animates down from 100-s.bottom (collapsed at very bottom) to s.top
      const topInset = lerp(100 - s.bottom, s.top, tSweat);
      layerSweater.current.style.clipPath =
        `inset(${topInset}% 0 ${s.bottom}% 0)`;
    }

    // ----- 4. Subtle camera drift on the portrait zone -----
    if (portraitZone.current) {
      const sc = lerp(1.0, 1.035, easeInOut(p));
      const y  = lerp(0, -14, easeInOut(p));
      portraitZone.current.style.transform =
        `translateX(-50%) translateY(${y}px) scale(${sc})`;
    }

    // ----- 5. Soft ambient glow under sweater once it lands -----
    if (glowRef.current) {
      glowRef.current.style.opacity = smoothstep(0.70, 0.95, p).toFixed(3);
    }

    // ----- 6. Live SCROLL_Y px in status rail -----
    if (scrollPxRef.current) {
      scrollPxRef.current.textContent = `${Math.round(window.scrollY)}PX`;
    }

    // ----- 7. Chapter label + over-red flag for the topbar -----
    const next =
      p < 0.10 ? { code: "I",   name: "PERSON",        stage: "settle"  } :
      p < 0.32 ? { code: "II",  name: "OBSERVING",     stage: "drift"   } :
      p < 0.56 ? { code: "III", name: "PUTTING ON",    stage: "audio"   } :
      p < 0.82 ? { code: "IV",  name: "MATERIAL",      stage: "compose" } :
                 { code: "V",   name: "ENGINEER",      stage: "ready"   };
    setChapter((prev) => prev.code === next.code ? prev : { code: next.code, name: next.name });

    if (stageNameRef.current) {
      stageNameRef.current.textContent =
        next.code === "I" ? "BASELINE" :
        next.code === "II" ? "OBSERVING" :
        next.code === "III" ? "HEADPHONES + GLASSES" :
        next.code === "IV" ? "SWEATER · INDIGO" : "READY TO BUILD";
    }

    // ----- 8. Notify parent (topbar over-red flag, etc) -----
    if (onStageChange) {
      const stillOverRed = p < 0.999;   // hero pinned until we exit
      onStageChange({ overRed: stillOverRed, progress: p, chapter: next });
    }
  }, [onStageChange]);

  useScrollProgress(runwayRef, onScroll);

  return (
    <section id="hero" className="hero-runway" ref={runwayRef}>
      <div className="hero-pin">

        <span className="portfolio-tag">— PORTFOLIO 2026 —</span>

        {/* The massive AYUSH + SINGH stack */}
        <div className="hero-marks">
          <h1 style={{ display: "contents" }}>
            <span className="hero-mark"><span className="row">AYUSH</span></span>
            <span></span>{/* spacer — portrait zone overlaps SINGH */}
            <span className="hero-mark outline"><span className="row">SINGH</span></span>
          </h1>
        </div>

        {/* Vertical side text */}
        <div className="hero-vt left">
          CS &amp; DESIGN <span className="bar"></span> NTU 2026
        </div>
        <div className="hero-vt right">
          SINGAPORE <span className="bar"></span> AVAILABLE S26+
        </div>

        {/* PORTRAIT — the morph stage */}
        <div className="portrait-zone" ref={portraitZone}>
          <div className="glow" ref={glowRef}></div>
          <div className="pframe">
            {/* base: always visible */}
            <img className="layer base" ref={baseRef}
              src="assets/portrait-before.png"
              alt="Ayush, baseline" decoding="async" />
            {/* augment layers — same AFTER image, clipped per-region */}
            <img className="layer aug headphones" ref={layerHeadphones}
              src="assets/portrait-after.png"
              style={{ clipPath: "inset(42% 0 58% 0)" }}
              alt="" decoding="async" aria-hidden="true" />
            <img className="layer aug glasses" ref={layerGlasses}
              src="assets/portrait-after.png"
              style={{ clipPath: "inset(32% 50% 52% 50%)" }}
              alt="" decoding="async" aria-hidden="true" />
            <img className="layer aug sweater" ref={layerSweater}
              src="assets/portrait-after.png"
              style={{ clipPath: "inset(100% 0 0% 0)" }}
              alt="" decoding="async" aria-hidden="true" />
          </div>
        </div>

        {/* Foot rail */}
        <div className="hero-foot">
          <div className="left">CHAPTER {chapter.code} / V</div>
          <div className="center">
            <span className="pill">SCROLL TO COMPOSE ↓</span>
          </div>
          <div className="right">
            <span className="stage-name" ref={stageNameRef}>BASELINE</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   STATUS RAIL — site-wide info strip (under topbar)
   ============================================================ */
function StatusRail({ overRed, scrollPxRef }) {
  const [time, setTime] = React.useState("");
  React.useEffect(() => {
    const tick = () => {
      const d = new Date();
      const p = (n) => String(n).padStart(2, "0");
      setTime(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={"status-rail" + (overRed ? " over-red" : "")}>
      <div className="cell"><span className="dot"></span>1.35°N 103.82°E · SINGAPORE</div>
      <div className="cell"><span className="dim">SYS.TIME</span>{time} GMT+8</div>
      <div className="cell"><span className="dim">SCROLL_Y</span><span ref={scrollPxRef}>0PX</span></div>
      <div className="cell"><span className="dim">STATUS</span>ONLINE</div>
      <div className="cell"><span className="dim">PORT:</span>2026–2030</div>
    </div>
  );
}

Object.assign(window, { Hero, StatusRail });
