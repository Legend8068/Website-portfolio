/* global React */
const { useEffect, useRef, useState } = React;

/* ============================================================
   AMBIENT TRANSIT — slow drifting lines + scroll-velocity stretch
   ============================================================ */
function AmbientTransit() {
  const canvasRef = useRef(null);
  const velRef = useRef(0);
  const lastScrollRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // generate a static set of "transit lines" — slow drift in y, x persistent
    const N = 18;
    const lines = Array.from({ length: N }, (_, i) => ({
      y0: Math.random() * h,
      amp: 30 + Math.random() * 80,
      freq: 0.0015 + Math.random() * 0.003,
      phase: Math.random() * Math.PI * 2,
      speed: 0.12 + Math.random() * 0.25,
      hue: i % 5 === 0 ? "amber" : (i % 7 === 0 ? "sage" : "silver"),
      alpha: 0.04 + Math.random() * 0.08,
      width: 0.6 + Math.random() * 0.8,
    }));

    const onScroll = () => {
      const y = window.scrollY;
      const now = performance.now();
      const dt = Math.max(8, now - lastTimeRef.current);
      const dy = y - lastScrollRef.current;
      const v = Math.min(40, Math.abs(dy) / dt * 16);
      velRef.current = velRef.current * 0.6 + v * 0.4;
      lastScrollRef.current = y;
      lastTimeRef.current = now;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    let t = 0;
    let raf;
    const tick = () => {
      t += 1;
      velRef.current *= 0.96; // decay
      const vel = velRef.current;
      ctx.clearRect(0, 0, w, h);

      const colors = {
        amber: getCSS("--accent"),
        sage: getCSS("--accent-2"),
        silver: getCSS("--accent-3"),
      };

      for (const ln of lines) {
        const y = (ln.y0 + t * ln.speed) % (h + 200) - 100;
        const stretch = 1 + vel * 0.08;
        ctx.beginPath();
        const step = 12;
        for (let x = -20; x <= w + 20; x += step) {
          const yy = y + Math.sin(x * ln.freq + ln.phase + t * 0.005) * ln.amp * stretch;
          if (x === -20) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        const col = colors[ln.hue] || colors.silver;
        ctx.strokeStyle = withAlpha(col, ln.alpha + Math.min(0.06, vel * 0.005));
        ctx.lineWidth = ln.width;
        ctx.stroke();
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="layer layer-transit" aria-hidden="true">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

/* helpers */
function getCSS(prop) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(prop).trim() || "#c8a772";
  return v;
}
function withAlpha(hex, a) {
  // hex #rrggbb → rgba
  if (hex.startsWith("#")) {
    const n = hex.slice(1);
    const r = parseInt(n.substring(0,2), 16);
    const g = parseInt(n.substring(2,4), 16);
    const b = parseInt(n.substring(4,6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  return hex;
}

/* ============================================================
   INTELLIGENT CURSOR
   ============================================================ */
function CursorSystem() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const ringPosRef = useRef({ x: 0, y: 0 });
  const stateRef = useRef("default");
  const labelRef = useRef("");

  useEffect(() => {
    const onMove = (e) => {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + "px";
        dotRef.current.style.top = e.clientY + "px";
      }
      const el = document.elementFromPoint(e.clientX, e.clientY);
      let next = "default";
      let label = "";
      if (el) {
        const c = el.closest("[data-cursor]");
        if (c) {
          next = c.getAttribute("data-cursor");
          label = c.getAttribute("data-cursor-label") || "";
        } else if (el.closest("a, button")) next = "link";
        else if (el.closest("input, textarea, [contenteditable]")) next = "text";
      }
      if (next !== stateRef.current || label !== labelRef.current) {
        stateRef.current = next;
        labelRef.current = label;
        const ring = ringRef.current;
        if (ring) {
          ring.className = "cursor-ring " + (next === "default" ? "" : next);
          ring.textContent = label;
          ring.style.color = (next === "project") ? "var(--bg)" : "transparent";
        }
        const dot = dotRef.current;
        if (dot) {
          dot.className = "cursor-dot" + ((next === "project" || next === "link") ? " hidden" : "");
        }
      }
    };
    window.addEventListener("mousemove", onMove);

    let raf;
    const tick = () => {
      const t = targetRef.current, p = ringPosRef.current;
      p.x += (t.x - p.x) * 0.22;
      p.y += (t.y - p.y) * 0.22;
      if (ringRef.current) {
        ringRef.current.style.left = p.x + "px";
        ringRef.current.style.top = p.y + "px";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div className="cursor-system" aria-hidden="true">
      <div ref={dotRef} className="cursor-dot"></div>
      <div ref={ringRef} className="cursor-ring"></div>
    </div>
  );
}

/* ============================================================
   REVEAL on scroll
   ============================================================ */
function Reveal({ children, delay = 0, as = "div", className = "", ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Below-the-fold elements: start hidden, reveal on scroll.
    // Above-the-fold (or close): keep visible. This avoids the case where
    // the observer never fires for elements already on-screen.
    const r = node.getBoundingClientRect();
    const inView = r.top < window.innerHeight && r.bottom > 0;
    if (inView) {
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

Object.assign(window, { AmbientTransit, CursorSystem, Reveal });
