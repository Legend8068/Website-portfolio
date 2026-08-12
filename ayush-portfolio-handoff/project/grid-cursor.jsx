/* global React */
const { useEffect, useRef, useState } = React;

/* ============================================================
   LIVING GRID — ambient cursor-reactive dot grid
   ============================================================ */
function LivingGrid() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    const onLeave = () => { mouseRef.current.active = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    const SPACING = 44;
    const RADIUS = 1.0;
    const INFLUENCE = 180;

    const tick = () => {
      timeRef.current += 0.005;
      const t = timeRef.current;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const active = mouseRef.current.active;

      const cols = Math.ceil(w / SPACING) + 1;
      const rows = Math.ceil(h / SPACING) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * SPACING;
          const y = j * SPACING;

          // ambient breathing
          const breathe = Math.sin(t * 1.4 + (i + j) * 0.3) * 0.05 + 0.12;

          // cursor influence
          let influence = 0;
          if (active) {
            const dx = mx - x, dy = my - y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < INFLUENCE) {
              influence = (1 - d / INFLUENCE);
            }
          }

          const alpha = breathe + influence * 0.7;
          const r = RADIUS + influence * 1.6;

          // tint shift on influence
          const blue = 168 + influence * 87;   // toward 255
          const green = 168 + influence * 30;
          const red = 168 + influence * 20;
          ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${Math.min(alpha, 0.9)})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="living-grid" aria-hidden="true">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

/* ============================================================
   INTELLIGENT CURSOR — adapts to context
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

      // detect context
      const el = document.elementFromPoint(e.clientX, e.clientY);
      let next = "default";
      let label = "";
      if (el) {
        const ctx = el.closest("[data-cursor]");
        if (ctx) {
          next = ctx.getAttribute("data-cursor");
          label = ctx.getAttribute("data-cursor-label") || "";
        } else if (el.closest("a, button")) {
          next = "link";
        } else if (el.closest("input, textarea, [contenteditable]")) {
          next = "text";
        }
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

    let raf = 0;
    const tick = () => {
      const t = targetRef.current;
      const p = ringPosRef.current;
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
   REVEAL ON SCROLL — drop-in IntersectionObserver wrapper
   ============================================================ */
function Reveal({ children, delay = 0, as = "div", className = "", ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 }
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

Object.assign(window, { LivingGrid, CursorSystem, Reveal });
