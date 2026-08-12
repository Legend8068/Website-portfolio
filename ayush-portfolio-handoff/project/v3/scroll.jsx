/* global React */
const { useEffect, useRef, useState, useMemo, useCallback } = React;

/* ============================================================
   useScroll — read scroll progress within a wrapper element
   maps scrollTop within [start, end] of the wrapper's range to 0..1
   ============================================================ */
function useElementScrollProgress(ref) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const measure = () => {
      raf = null;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      // when rect.top hits 0 → progress 0
      // when rect.top hits -total → progress 1
      const p = clamp(-rect.top / total, 0, 1);
      setProgress(p);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
  return progress;
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

Object.assign(window, { useElementScrollProgress, clamp, lerp, smoothstep, easeOut });
