/* global React */
const { useEffect, useRef, useState } = React;

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

/* useElementScrollProgress — progress (0..1) of how far we've scrolled
   through a pinned wrapper. Returned as a ref-backed value so the consumer
   can imperatively update DOM without React re-renders (smoother for the
   sticky cinematic hero). */
function useScrollProgress(ref, onChange) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const measure = () => {
      raf = null;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
      onChange(p);
    };
    const onScroll = () => { if (raf) return; raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, onChange]);
}

/* Reveal — slides up below-the-fold elements. Above-the-fold ones get
   added immediately to avoid the case where the observer never fires. */
function Reveal({ children, delay = 0, as = "div", className = "", ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const r = node.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      node.classList.add("in");
      return;
    }
    node.classList.add("pending");
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) {
          e.target.classList.remove("pending");
          e.target.classList.add("in");
          obs.unobserve(e.target);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -10% 0px" }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);
  const Tag = as;
  return (
    <Tag ref={ref} className={"reveal " + className} data-delay={delay} {...rest}>
      {children}
    </Tag>
  );
}

Object.assign(window, { useScrollProgress, Reveal, clamp, lerp, smoothstep, easeOut, easeInOut });
