/* global React, ReactDOM,
   TopBar, MarginMarks, Hero, Biodata, Manifesto, Battles, Signal,
   TweaksPanel, useTweaks, TweakSection, TweakRadio */
const { useEffect } = React;

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "crimson"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(DEFAULTS);

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", t.accent);
  }, [t.accent]);

  return (
    <>
      <div className="grain" aria-hidden="true"></div>
      <TopBar/>
      <MarginMarks/>

      <main className="frame">
        <Hero/>
        <Biodata/>
        <Manifesto/>
        <Battles/>
        <Signal/>
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Accent · ink color">
          <TweakRadio
            label="Hue"
            value={t.accent}
            onChange={(v) => setTweak("accent", v)}
            options={[
              { value: "crimson",     label: "Crimson" },
              { value: "ultramarine", label: "Ultramarine" },
              { value: "black",       label: "All Black" },
            ]}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
