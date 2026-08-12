/* global React, ReactDOM,
   LivingGrid, CursorSystem, Reveal,
   Nav, HeroSection, PhilosophySection,
   WorkSection, PlaygroundSection, SignalSection,
   TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakSelect, TweakToggle, TweakColor */
const { useEffect, useMemo, useState } = React;

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "direction": "cinematic",
  "accent": "#6fa8ff",
  "order": "default",
  "cursor": true,
  "grid": true
}/*EDITMODE-END*/;

const SECTION_ORDERS = {
  default:    ["hero", "philosophy", "work", "playground", "signal"],
  workfirst:  ["hero", "work", "philosophy", "playground", "signal"],
  playfirst:  ["hero", "playground", "work", "philosophy", "signal"],
  philosophy: ["hero", "philosophy", "playground", "work", "signal"],
};

function App() {
  const [tweaks, setTweak] = useTweaks(DEFAULTS);

  // Sync direction + accent to CSS variables / data attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-direction", tweaks.direction);
    document.documentElement.style.setProperty("--accent", tweaks.accent);
  }, [tweaks.direction, tweaks.accent]);

  const order = SECTION_ORDERS[tweaks.order] || SECTION_ORDERS.default;

  const sectionMap = {
    hero:       <HeroSection key="hero" direction={tweaks.direction} />,
    philosophy: <PhilosophySection key="philosophy" />,
    work:       <WorkSection key="work" />,
    playground: <PlaygroundSection key="playground" />,
    signal:     <SignalSection key="signal" />,
  };

  return (
    <>
      {tweaks.grid && <LivingGrid />}
      <div className="vignette" aria-hidden="true"></div>
      {tweaks.cursor && <CursorSystem />}
      <Nav direction={tweaks.direction} />

      <main>
        {order.map(k => sectionMap[k])}
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Direction">
          <TweakRadio
            label="Type system"
            value={tweaks.direction}
            onChange={(v) => setTweak("direction", v)}
            options={[
              { value: "cinematic", label: "Cinematic" },
              { value: "technical", label: "Technical" },
            ]}
          />
          <p className="directions-note">
            Cinematic — editorial italic display. Technical — grotesque throughout.
          </p>
        </TweakSection>

        <TweakSection label="Section order">
          <TweakSelect
            label="Sequence"
            value={tweaks.order}
            onChange={(v) => setTweak("order", v)}
            options={[
              { value: "default",    label: "Default · Philosophy → Work → Play" },
              { value: "workfirst",  label: "Work-first · proof before posture" },
              { value: "playfirst",  label: "Play-first · personality first" },
              { value: "philosophy", label: "Philosophy → Play → Work" },
            ]}
          />
        </TweakSection>

        <TweakSection label="Accent">
          <TweakColor
            label="Accent hue"
            value={tweaks.accent}
            onChange={(v) => setTweak("accent", v)}
            options={["#6fa8ff", "#c8d6f0", "#f0b86e", "#a78bfa", "#34d399"]}
          />
        </TweakSection>

        <TweakSection label="Ambient">
          <TweakToggle
            label="Living grid background"
            value={tweaks.grid}
            onChange={(v) => setTweak("grid", v)}
          />
          <TweakToggle
            label="Intelligent cursor"
            value={tweaks.cursor}
            onChange={(v) => setTweak("cursor", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
