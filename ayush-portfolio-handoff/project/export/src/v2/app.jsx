/* global React, ReactDOM,
   AmbientTransit, CursorSystem, Reveal,
   Nav, HeroSection, PhilosophySection, WorkSection, PlaygroundSection, SignalSection,
   TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakSelect, TweakToggle, TweakColor */
const { useEffect } = React;

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "amber",
  "direction": "cinematic",
  "order": "default",
  "cursor": true,
  "ambient": true,
  "grain": true
}/*EDITMODE-END*/;

const SECTION_ORDERS = {
  default:    ["hero", "philosophy", "work", "playground", "signal"],
  workfirst:  ["hero", "work", "philosophy", "playground", "signal"],
  playfirst:  ["hero", "playground", "work", "philosophy", "signal"],
  philosophy: ["hero", "philosophy", "playground", "work", "signal"],
};

function App() {
  const [t, setTweak] = useTweaks(DEFAULTS);

  useEffect(() => {
    document.documentElement.setAttribute("data-palette", t.palette);
    document.documentElement.setAttribute("data-direction", t.direction);
  }, [t.palette, t.direction]);

  useEffect(() => {
    const grain = document.querySelector(".layer-grain");
    if (grain) grain.style.display = t.grain ? "" : "none";
  }, [t.grain]);

  const order = SECTION_ORDERS[t.order] || SECTION_ORDERS.default;
  const sections = {
    hero:       <HeroSection key="hero" />,
    philosophy: <PhilosophySection key="philosophy" />,
    work:       <WorkSection key="work" />,
    playground: <PlaygroundSection key="playground" />,
    signal:     <SignalSection key="signal" />,
  };

  return (
    <>
      <div className="layer layer-ambient" aria-hidden="true"></div>
      {t.ambient && <AmbientTransit />}
      <div className="layer layer-grain" aria-hidden="true"></div>
      <div className="layer layer-vignette" aria-hidden="true"></div>
      {t.cursor && <CursorSystem />}
      <Nav />
      <main>{order.map(k => sections[k])}</main>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Palette · industrial accents">
          <TweakRadio
            label="Hue"
            value={t.palette}
            onChange={(v) => setTweak("palette", v)}
            options={[
              { value: "amber",  label: "Amber" },
              { value: "sage",   label: "Sage" },
              { value: "silver", label: "Silver" },
              { value: "clay",   label: "Clay" },
            ]}
          />
        </TweakSection>

        <TweakSection label="Direction · type system">
          <TweakRadio
            label="Vibe"
            value={t.direction}
            onChange={(v) => setTweak("direction", v)}
            options={[
              { value: "cinematic", label: "Editorial" },
              { value: "technical", label: "Technical" },
            ]}
          />
        </TweakSection>

        <TweakSection label="Section order">
          <TweakSelect
            label="Sequence"
            value={t.order}
            onChange={(v) => setTweak("order", v)}
            options={[
              { value: "default",    label: "Default · Philosophy → Work → Play" },
              { value: "workfirst",  label: "Work-first · proof before posture" },
              { value: "playfirst",  label: "Play-first · personality first" },
              { value: "philosophy", label: "Philosophy → Play → Work" },
            ]}
          />
        </TweakSection>

        <TweakSection label="Ambient">
          <TweakToggle label="Transit lines (scroll-velocity reactive)"
            value={t.ambient} onChange={(v) => setTweak("ambient", v)} />
          <TweakToggle label="Film grain overlay"
            value={t.grain} onChange={(v) => setTweak("grain", v)} />
          <TweakToggle label="Intelligent cursor"
            value={t.cursor} onChange={(v) => setTweak("cursor", v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
