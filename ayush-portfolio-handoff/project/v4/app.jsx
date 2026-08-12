/* global React, ReactDOM,
   TopBar, Hero, StatusRail, Intro, Manifesto, Work, Log, Connect,
   TweaksPanel, useTweaks, TweakSection, TweakRadio */
const { useState, useRef } = React;

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "crimson"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(DEFAULTS);
  const [overRed, setOverRed] = useState(true);
  const scrollPxRef = useRef(null);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-accent", t.accent);
  }, [t.accent]);

  // Update SCROLL_Y via window.scroll (more accurate than hero progress alone)
  React.useEffect(() => {
    let raf;
    const update = () => {
      raf = null;
      if (scrollPxRef.current) scrollPxRef.current.textContent = `${Math.round(window.scrollY)}PX`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Hero notifies us when it's no longer over the red stage so the topbar
  // and status rail can flip back to ink.
  const onStageChange = React.useCallback(({ overRed: nowOver }) => {
    // The hero is "over red" while its runway is on-screen — use IO instead
    // of the progress so the flip is crisp at the boundary.
  }, []);

  // Watch when hero leaves viewport — flip topbar color.
  React.useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // While any part of the hero is visible we consider topbar "over red"
          setOverRed(e.isIntersecting && e.intersectionRatio > 0.05);
        }
      },
      { threshold: [0, 0.05, 0.1, 0.2] }
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <TopBar overRed={overRed} />
      <StatusRail overRed={overRed} scrollPxRef={scrollPxRef} />

      <main>
        <Hero onStageChange={onStageChange} />
        <Intro/>
        <Manifesto/>
        <Work/>
        <Log/>
        <Connect/>
      </main>

      <div className="paper-grain" aria-hidden="true"></div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Accent">
          <TweakRadio
            label="Hue"
            value={t.accent}
            onChange={(v) => setTweak("accent", v)}
            options={[
              { value: "crimson", label: "Crimson" },
              { value: "cyan",    label: "Cyan" },
              { value: "ink",     label: "Ink" },
            ]}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
