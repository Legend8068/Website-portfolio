import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Github, Linkedin, Mail, ArrowRight, Briefcase, Download, FileText, Code, Home, User, Folder, ExternalLink, ChevronDown } from 'lucide-react';
import DecryptedText from './DecryptedText';
import Noise from './Noise';

export default function Ayush_portfolio() {
  const circuitCanvasRef = useRef(null);
  const mousePos = useRef({ x: -1000, y: -1000 });
  const zoomWrapperRef = useRef(null);
  const zoomFrameRef = useRef(null);
  const heroSvgRef = useRef(null);
  const heroRef = useRef(null);
  const circuitOpacityRef = useRef(0);
  const maskDataRef = useRef(null);

  const [activeSection, setActiveSection] = useState('home');

  const ACCENT = '#f0c040';
  const BG_DARK = '#0a1628';
  const BG_CARD = 'rgba(12, 26, 48, 0.85)';
  const BG_DIMENSION = 'rgba(6, 14, 30, 0.98)';

  // ── Circuit Board Background ──────────────────────────────────────────────
  useEffect(() => {
    if (!circuitCanvasRef.current) return;
    const canvas = circuitCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    const gridSize = 80;
    const nodes = [], connections = [], signals = [], cursorSignals = [];
    const cols = Math.ceil(canvas.width / gridSize) + 1;
    const rows = Math.ceil(canvas.height / gridSize) + 1;
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++)
        nodes.push({ x: x * gridSize + (y % 2) * (gridSize / 2), y: y * gridSize, baseGlow: 0, cursorGlow: 0, connections: [], isActive: Math.random() > 0.75 });
    nodes.forEach((node, i) => {
      if (!node.isActive) return;
      nodes.forEach((other, j) => {
        if (i >= j) return;
        const dist = Math.hypot(node.x - other.x, node.y - other.y);
        if (dist < gridSize * 1.8 && dist > gridSize * 0.5 && Math.random() > 0.6) {
          const conn = { from: node, to: other };
          connections.push(conn); node.connections.push(conn); other.connections.push(conn);
        }
      });
    });
    const spawnSignal = () => {
      const active = nodes.filter(n => n.isActive && n.connections.length > 0);
      if (!active.length) return;
      const start = active[Math.floor(Math.random() * active.length)];
      const conn = start.connections[Math.floor(Math.random() * start.connections.length)];
      if (conn) signals.push({ connection: conn, progress: 0, speed: 0.006 + Math.random() * 0.008, forward: conn.from === start, intensity: 0.4 + Math.random() * 0.3 });
    };
    const spawnCursorSignal = (node) => {
      node.connections.forEach(conn => {
        if (Math.random() > 0.5) cursorSignals.push({ connection: conn, progress: 0, speed: 0.015 + Math.random() * 0.015, forward: conn.from === node, intensity: 0.8 });
      });
    };
    const handleMouseMove = (e) => { mousePos.current.x = e.clientX; mousePos.current.y = e.clientY; };
    window.addEventListener('mousemove', handleMouseMove);
    let lastSignal = 0, frameId;
    const draw = (ts) => {
      ctx.fillStyle = 'rgba(10, 22, 40, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (ts - lastSignal > 400 && signals.length < 8) { spawnSignal(); lastSignal = ts; }
      nodes.forEach(node => {
        const dist = Math.hypot(node.x - mousePos.current.x, node.y - mousePos.current.y);
        if (dist < 100) { const intensity = 1 - dist / 100; node.cursorGlow = Math.max(node.cursorGlow, intensity); if (node.isActive && intensity > 0.8 && Math.random() > 0.97) spawnCursorSignal(node); }
        node.cursorGlow *= 0.94; node.baseGlow *= 0.96;
      });
      connections.forEach(conn => {
        ctx.beginPath(); ctx.moveTo(conn.from.x, conn.from.y);
        const midX = (conn.from.x + conn.to.x) / 2, midY = (conn.from.y + conn.to.y) / 2;
        if (Math.abs(conn.from.x - conn.to.x) > Math.abs(conn.from.y - conn.to.y)) { ctx.lineTo(midX, conn.from.y); ctx.lineTo(midX, conn.to.y); }
        else { ctx.lineTo(conn.from.x, midY); ctx.lineTo(conn.to.x, midY); }
        ctx.lineTo(conn.to.x, conn.to.y); ctx.strokeStyle = 'rgba(240, 192, 64, 0.04)'; ctx.lineWidth = 1; ctx.stroke();
      });
      const processSignal = (sig, cursor) => {
        sig.progress += sig.speed;
        if (sig.progress >= 1) { const end = sig.forward ? sig.connection.to : sig.connection.from; if (cursor) { end.cursorGlow = Math.min(1, end.cursorGlow + 0.5); if (Math.random() > 0.7) spawnCursorSignal(end); } else end.baseGlow = Math.min(1, end.baseGlow + sig.intensity * 0.3); return true; }
        const conn = sig.connection, t = sig.forward ? sig.progress : 1 - sig.progress;
        const midX = (conn.from.x + conn.to.x) / 2, midY = (conn.from.y + conn.to.y) / 2;
        let x, y;
        if (Math.abs(conn.from.x - conn.to.x) > Math.abs(conn.from.y - conn.to.y)) {
          if (t < 0.33) { x = conn.from.x + (midX - conn.from.x) * (t / 0.33); y = conn.from.y; }
          else if (t < 0.66) { x = midX; y = conn.from.y + (conn.to.y - conn.from.y) * ((t - 0.33) / 0.33); }
          else { x = midX + (conn.to.x - midX) * ((t - 0.66) / 0.34); y = conn.to.y; }
        } else {
          if (t < 0.33) { x = conn.from.x; y = conn.from.y + (midY - conn.from.y) * (t / 0.33); }
          else if (t < 0.66) { x = conn.from.x + (conn.to.x - conn.from.x) * ((t - 0.33) / 0.33); y = midY; }
          else { x = conn.to.x; y = midY + (conn.to.y - midY) * ((t - 0.66) / 0.34); }
        }
        const size = cursor ? 10 : 6, alpha = cursor ? 0.6 : 0.35;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
        grad.addColorStop(0, `rgba(240, 192, 64, ${alpha * sig.intensity})`); grad.addColorStop(1, 'rgba(240, 192, 64, 0)');
        ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
        return false;
      };
      for (let i = signals.length - 1; i >= 0; i--) if (processSignal(signals[i], false)) signals.splice(i, 1);
      for (let i = cursorSignals.length - 1; i >= 0; i--) if (processSignal(cursorSignals[i], true)) cursorSignals.splice(i, 1);
      nodes.forEach(node => {
        if (!node.isActive) return;
        const glow = Math.min(1, node.baseGlow + node.cursorGlow), size = 2 + glow * 2, alpha = 0.08 + glow * 0.5;
        if (glow > 0.15) { const g = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 3); g.addColorStop(0, `rgba(240, 192, 64, ${glow * 0.25})`); g.addColorStop(1, 'rgba(240, 192, 64, 0)'); ctx.beginPath(); ctx.arc(node.x, node.y, size * 3, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); }
        ctx.beginPath(); ctx.arc(node.x, node.y, size, 0, Math.PI * 2); ctx.fillStyle = `rgba(240, 192, 64, ${alpha})`; ctx.fill();
      });
      // Fade circuit canvas based on scroll — hidden during hero
      const scrollY = window.scrollY;
      const heroH = window.innerHeight;
      const fadeStart = heroH * 0.5;
      const fadeEnd = heroH * 1.2;
      const targetOpacity = scrollY < fadeStart ? 0 : Math.min(0.5, ((scrollY - fadeStart) / (fadeEnd - fadeStart)) * 0.5);
      circuitOpacityRef.current += (targetOpacity - circuitOpacityRef.current) * 0.1;
      canvas.style.opacity = circuitOpacityRef.current;
      frameId = requestAnimationFrame(draw);
    };
    frameId = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(frameId); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', handleMouseMove); };
  }, []);

  // ── Hero Wave Lines (cursor-reactive SVG) ─────────────────────────────────
  useEffect(() => {
    const svg = heroSvgRef.current;
    const hero = heroRef.current;
    if (!svg || !hero) return;
    const noise = new Noise(Math.random());
    let lines = [], paths = [];
    const mouse = { x: -10, y: 0, lx: 0, ly: 0, sx: 0, sy: 0, v: 0, vs: 0, a: 0, set: false };
    let bounding = { left: 0, top: 0, width: 0, height: 0 };
    let animId;

    const setSize = () => {
      const rect = hero.getBoundingClientRect();
      bounding = { left: rect.left, top: rect.top + window.scrollY, width: hero.clientWidth, height: hero.clientHeight };
      svg.style.width = bounding.width + 'px';
      svg.style.height = bounding.height + 'px';
    };
    const setLines = () => {
      lines = []; paths.forEach(p => p.remove()); paths = [];
      const xGap = 12, yGap = 36;
      const oW = bounding.width + 200, oH = bounding.height + 40;
      const totalLines = Math.ceil(oW / xGap), totalPoints = Math.ceil(oH / yGap);
      const xStart = (bounding.width - xGap * totalLines) / 2, yStart = (bounding.height - yGap * totalPoints) / 2;
      for (let i = 0; i <= totalLines; i++) {
        const pts = [];
        for (let j = 0; j <= totalPoints; j++) pts.push({ x: xStart + xGap * i, y: yStart + yGap * j, wave: { x: 0, y: 0 }, cursor: { x: 0, y: 0, vx: 0, vy: 0 } });
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'rgba(240, 192, 64, 0.12)');
        path.setAttribute('stroke-width', '1');
        svg.appendChild(path);
        paths.push(path);
        lines.push(pts);
      }
    };
    const onMouseMove = (e) => {
      mouse.x = e.clientX - bounding.left;
      mouse.y = e.clientY - bounding.top + window.scrollY;
      if (!mouse.set) { mouse.sx = mouse.x; mouse.sy = mouse.y; mouse.lx = mouse.x; mouse.ly = mouse.y; mouse.set = true; }
    };
    const onTouchMove = (e) => {
      const t = e.touches[0];
      mouse.x = t.clientX - bounding.left;
      mouse.y = t.clientY - bounding.top + window.scrollY;
      if (!mouse.set) { mouse.sx = mouse.x; mouse.sy = mouse.y; mouse.lx = mouse.x; mouse.ly = mouse.y; mouse.set = true; }
    };
    const tick = (time) => {
      mouse.sx += (mouse.x - mouse.sx) * 0.1;
      mouse.sy += (mouse.y - mouse.sy) * 0.1;
      const dx = mouse.x - mouse.lx, dy = mouse.y - mouse.ly;
      mouse.v = Math.hypot(dx, dy);
      mouse.vs += (mouse.v - mouse.vs) * 0.1;
      mouse.vs = Math.min(100, mouse.vs);
      mouse.lx = mouse.x; mouse.ly = mouse.y;
      mouse.a = Math.atan2(dy, dx);
      // Move points
      lines.forEach(pts => pts.forEach(p => {
        const move = noise.perlin2((p.x + time * 0.0125) * 0.002, (p.y + time * 0.005) * 0.0015) * 12;
        p.wave.x = Math.cos(move) * 32;
        p.wave.y = Math.sin(move) * 16;
        const ddx = p.x - mouse.sx, ddy = p.y - mouse.sy, d = Math.hypot(ddx, ddy), l = Math.max(175, mouse.vs);
        if (d < l) { const s = 1 - d / l, f = Math.cos(d * 0.001) * s; p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.00065; p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.00065; }
        p.cursor.vx += (0 - p.cursor.x) * 0.005; p.cursor.vy += (0 - p.cursor.y) * 0.005;
        p.cursor.vx *= 0.925; p.cursor.vy *= 0.925;
        p.cursor.x += p.cursor.vx * 2; p.cursor.y += p.cursor.vy * 2;
        p.cursor.x = Math.min(100, Math.max(-100, p.cursor.x));
        p.cursor.y = Math.min(100, Math.max(-100, p.cursor.y));
      }));
      // Draw
      lines.forEach((pts, li) => {
        let d = `M ${Math.round((pts[0].x + pts[0].wave.x) * 10) / 10} ${Math.round((pts[0].y + pts[0].wave.y) * 10) / 10}`;
        pts.forEach((p, pi) => {
          const isLast = pi === pts.length - 1;
          const mx = p.x + p.wave.x + (isLast ? 0 : p.cursor.x);
          const my = p.y + p.wave.y + (isLast ? 0 : p.cursor.y);
          d += ` L ${Math.round(mx * 10) / 10} ${Math.round(my * 10) / 10}`;
        });
        paths[li].setAttribute('d', d);
      });
      animId = requestAnimationFrame(tick);
    };
    setSize(); setLines();
    window.addEventListener('mousemove', onMouseMove);
    hero.addEventListener('touchmove', onTouchMove);
    animId = requestAnimationFrame(tick);
    const onResize = () => { setSize(); setLines(); };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('mousemove', onMouseMove); hero.removeEventListener('touchmove', onTouchMove); window.removeEventListener('resize', onResize); };
  }, []);

  // ── Scroll Tracking ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const ids = ['home', 'about', 'experience', 'projects', 'contact'];
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= 300) { setActiveSection(ids[i]); break; }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Portal Mask Computation ─────────────────────────────────────────────
  useEffect(() => {
    const computeMask = () => {
      const wrapper = zoomWrapperRef.current;
      if (!wrapper) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Pill dimensions — capsule shape centered in viewport (enlarged for vertical text)
      const pillW = Math.min(vw * 0.22, 360);
      const pillH = vh * 0.85;
      const cx = vw / 2, cy = vh / 2;
      const r = pillW / 2;
      const left = cx - r, right = cx + r;
      const top = cy - pillH / 2, bottom = cy + pillH / 2;
      // Full viewport rect
      const dRect = `M -1 0 L ${vw + 2} 0 L ${vw + 2} ${vh} L -1 ${vh} Z`;
      // Capsule pill path
      const dPill = `M ${left} ${top + r} A ${r} ${r} 0 0 1 ${right} ${top + r} L ${right} ${bottom - r} A ${r} ${r} 0 0 1 ${left} ${bottom - r} Z`;
      // Inner border pill (inset by thickness for border effect)
      const th = vw > 767 ? 12 : 6;
      const iL = left + th, iR = right - th, iT = top + th, iB = bottom - th;
      const iRad = (iR - iL) / 2;
      const dInnerPill = `M ${iL} ${iT + iRad} A ${iRad} ${iRad} 0 0 1 ${iR} ${iT + iRad} L ${iR} ${iB - iRad} A ${iRad} ${iRad} 0 0 1 ${iL} ${iB - iRad} Z`;
      // Grid lines
      const vLines = vw > 767 ? 12 : 8;
      let dLines = '';
      for (let i = 1; i < vLines; i++) dLines += `M ${(vw / vLines) * i} 0 L ${(vw / vLines) * i} ${vh} `;
      const hGap = vh * 0.1;
      for (let i = 0; i <= Math.ceil(vh / hGap); i++) dLines += `M 0 ${hGap * i} L ${vw} ${hGap * i} `;

      maskDataRef.current = { maxScale: vw / r };

      const svg = wrapper.querySelector('[data-portal-svg]');
      if (!svg) return;
      svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
      svg.querySelector('[data-mask-outer]')?.setAttribute('d', `${dRect} ${dPill}`);
      svg.querySelector('[data-mask-inner]')?.setAttribute('d', `${dRect} ${dInnerPill}`);
      svg.querySelector('[data-grid-clip]')?.setAttribute('d', `${dRect} ${dPill}`);
      const linesEl = svg.querySelector('[data-mask-lines]');
      if (linesEl) linesEl.setAttribute('d', dLines);
    };
    computeMask();
    window.addEventListener('resize', computeMask);
    return () => window.removeEventListener('resize', computeMask);
  }, []);

  // ── Zoom Transition (scroll-driven SVG mask) ──────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const wrapper = zoomWrapperRef.current;
      if (!wrapper || !maskDataRef.current) return;
      const rect = wrapper.getBoundingClientRect();
      const scrollable = wrapper.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const raw = Math.max(0, Math.min(1, -rect.top / scrollable));
      const t = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
      const { maxScale } = maskDataRef.current;

      // Scale the mask (SVG pill cutout grows to fill viewport)
      const scaler = wrapper.querySelector('[data-mask-scaler]');
      if (scaler) scaler.style.transform = `scale(${1 + t * (maxScale - 1)})`;

      // "Explore" text: scroll DOWN into pill from above, center, then zoom
      const exploreEl = wrapper.querySelector('[data-explore-text]');
      if (exploreEl) {
        if (t < 0.4) {
          // Phase 1: scroll downward into the pill center (translateY from -120% to 0%)
          const scrollProgress = t / 0.4;
          const yOffset = -(1 - scrollProgress) * 120;
          const opacity = Math.min(1, scrollProgress * 2);
          exploreEl.style.transform = `translateY(${yOffset}%) scale(1)`;
          exploreEl.style.opacity = opacity;
        } else if (t < 0.7) {
          // Phase 2: centered, zoom in
          const zoomProgress = (t - 0.4) / 0.3;
          const scale = 1 + zoomProgress * 2.5;
          exploreEl.style.transform = `translateY(0%) scale(${scale})`;
          exploreEl.style.opacity = Math.max(0, 1 - zoomProgress * 1.2);
        } else {
          // Phase 3: fully zoomed and faded out
          exploreEl.style.transform = `translateY(0%) scale(3.5)`;
          exploreEl.style.opacity = 0;
        }
      }

      // Inner content fades in
      const inner = wrapper.querySelector('[data-zoom-content]');
      if (inner) inner.style.opacity = Math.max(0, Math.min(1, (t - 0.65) / 0.25));

      // Scene subtle zoom-in
      const scene = wrapper.querySelector('[data-portal-scene]');
      if (scene) scene.style.transform = `scale(${0.85 + t * 0.15})`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Card Reveal on Scroll ─────────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.style.opacity = '1'; entry.target.style.transform = 'translateY(0)'; } }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ── Data ───────────────────────────────────────────────────────────────────
  const skills = ['JavaScript', 'React', 'Python', 'Node.js', 'Three.js', 'TypeScript', 'Git', 'Java', 'Algorithms', 'Data Structures', 'CSS', 'HTML'];
  const exps = [
    { title: "Computer Science & Design", company: "SUTD", period: "2024 — 2028", desc: "Undergraduate studying Computer Science & Design at Singapore University of Technology and Design.", skills: ["Python", "JavaScript", "React", "AI & ML"] },
    { title: "Events & Welfare Leader", company: "ROOT SUTD Student Government", period: "2024 — Present", desc: "Planning and executing welfare events for the community including treasure hunts and the SUTD Student Organisation Showcase.", skills: ["Leadership", "Event Planning", "Community"] },
    { title: "Biodiversity Conservation", company: "ACCB Cambodia", period: "2023", desc: "Worked with Angkor Centre for Conservation of Biodiversity in Siem Reap for the rehabilitation and conservation of endangered species.", skills: ["Conservation", "Fieldwork", "Teamwork"] },
    { title: "Club Treasurer", company: "Tchoukball Club SUTD", period: "2024 — Present", desc: "Handling all finance planning as well as general planning for training and welfare purposes.", skills: ["Finance", "Planning", "Team Management"] }
  ];
  const projs = [
    { title: "SG MeetHalfway", desc: "Web app that finds the optimal meeting spot between multiple people using geolocation and transit data", tech: ["React", "Mapbox", "Google Places API"], color: "#f0c040", link: "https://sg-meet-halfway.vercel.app/" },
    { title: "Portfolio Website (In Progress)", desc: "Interactive personal portfolio featuring dynamic geometry networks, scroll-driven SVG portal transitions, and decrypted text effects.", tech: ["React", "Three.js", "JavaScript"], color: "#e07850" },
    { title: "Telegram Task Bot (In Progress)", desc: "Telegram bot to assist in task and deadline management for better convenience.", tech: ["Python", "Telegram API", "Automation"], color: "#50a0d0" }
  ];

  const scrollTo = id => { setActiveSection(id); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };
  const hov = { transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' };
  const wrap = { width: '100%', maxWidth: '1200px', margin: '0 auto' };
  const revealCard = (delay = 0) => ({ opacity: 0, transform: 'translateY(32px)', transition: `opacity 0.7s cubic-bezier(0.4,0,0.2,1) ${delay}s, transform 0.7s cubic-bezier(0.4,0,0.2,1) ${delay}s` });

  // Portal "Explore" text — no ghost letters needed

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: BG_DARK, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#fff', overflowX: 'hidden', fontSize: '16px', lineHeight: 1.6 }}>
      <canvas ref={circuitCanvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0 }} />

      {/* Bottom Navigation */}
      <nav style={{ position: 'fixed', bottom: 'clamp(16px, 2.5vw, 32px)', left: '50%', transform: 'translateX(-50%)', zIndex: 60, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'rgba(12,26,48,0.95)', backdropFilter: 'blur(16px)', borderRadius: '50px', border: `1px solid ${ACCENT}18` }}>
        {[{ id: 'home', Icon: Home }, { id: 'about', Icon: User }, { id: 'experience', Icon: Briefcase }, { id: 'projects', Icon: Folder }, { id: 'contact', Icon: Mail }].map(({ id, Icon }) => (
          <button key={id} onClick={() => scrollTo(id)} style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: activeSection === id ? ACCENT : 'transparent', border: 'none', borderRadius: '50%', color: activeSection === id ? BG_DARK : 'rgba(255,255,255,0.45)', cursor: 'pointer', ...hov }}><Icon size={20} /></button>
        ))}
      </nav>

      {/* Side Dots */}
      <div style={{ position: 'fixed', right: 'clamp(12px, 1.5vw, 32px)', top: '50%', transform: 'translateY(-50%)', zIndex: 60, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {['home', 'about', 'experience', 'projects', 'contact'].map(id => (
          <button key={id} onClick={() => scrollTo(id)} style={{ width: activeSection === id ? '14px' : '10px', height: activeSection === id ? '14px' : '10px', borderRadius: '50%', background: activeSection === id ? ACCENT : 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', ...hov, boxShadow: activeSection === id ? `0 0 12px ${ACCENT}` : 'none' }} />
        ))}
      </div>

      {/* ═══════════════════ HERO with WAVE LINES ═══════════════════ */}
      <section id="home" ref={heroRef} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        {/* SVG Wave Lines */}
        <svg ref={heroSvgRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />

        {/* Hero Content - Centered like reference */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 clamp(24px, 5vw, 80px)', width: '100%', maxWidth: '1400px' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 'clamp(11px, 0.9vw, 14px)', letterSpacing: '6px', fontFamily: 'monospace', marginBottom: 'clamp(20px, 2vw, 40px)', textTransform: 'uppercase' }}>Ayush Singh &middot; Portfolio</p>

          <h1 style={{ fontSize: 'clamp(48px, 10vw, 180px)', fontWeight: 700, lineHeight: 0.9, margin: '0 0 clamp(28px, 3vw, 48px) 0', letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
            <DecryptedText text="Aspiring" speed={35} maxIterations={15} animateOn="view" sequential revealDirection="start" parentStyle={{ display: 'block' }} />
            <span style={{ color: ACCENT }}>
              <DecryptedText text="Software" speed={30} maxIterations={18} animateOn="view" sequential revealDirection="start" parentStyle={{ display: 'block' }} encryptedStyle={{ color: `${ACCENT}88` }} />
            </span>
            <span style={{ color: ACCENT }}>
              <DecryptedText text="Engineer" speed={28} maxIterations={18} animateOn="view" sequential revealDirection="start" parentStyle={{ display: 'block' }} encryptedStyle={{ color: `${ACCENT}88` }} />
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(14px, 1.2vw, 20px)', color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, marginBottom: 'clamp(32px, 4vw, 56px)', maxWidth: '560px', margin: '0 auto clamp(32px, 4vw, 56px)' }}>
            Learning and Exploring new things everyday
          </p>

          <div style={{ display: 'flex', gap: 'clamp(12px, 1.2vw, 20px)', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'clamp(48px, 6vw, 80px)' }}>
            <button onClick={() => scrollTo('projects')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: 'clamp(14px, 1.2vw, 22px) clamp(28px, 2.4vw, 44px)', background: ACCENT, color: BG_DARK, fontSize: 'clamp(15px, 1.2vw, 20px)', fontWeight: 700, border: 'none', borderRadius: '12px', cursor: 'pointer', ...hov }}>
              View Projects <ArrowRight size={20} />
            </button>
            <button onClick={() => scrollTo('contact')} style={{ padding: 'clamp(14px, 1.2vw, 22px) clamp(28px, 2.4vw, 44px)', background: 'transparent', color: '#fff', fontSize: 'clamp(15px, 1.2vw, 20px)', fontWeight: 500, border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: '12px', cursor: 'pointer', ...hov }}>Contact Me</button>
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            {[{ Icon: Github, href: 'https://github.com/Legend8068' }, { Icon: Linkedin, href: 'https://www.linkedin.com/in/ayush-singh0606' }, { Icon: Mail, href: 'mailto:ayushsinghsolanki06@gmail.com' }].map(({ Icon, href }, i) => (
              <a key={i} href={href} target="_blank" rel="noopener noreferrer" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG_CARD, border: `1px solid ${ACCENT}20`, borderRadius: '12px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', ...hov }}><Icon size={20} /></a>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 'clamp(32px, 5vh, 80px)', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', animation: 'scrollIndicator 2s ease-in-out infinite', cursor: 'pointer' }} onClick={() => scrollTo('about')}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase' }}>Scroll</span>
          <ChevronDown size={20} color="rgba(255,255,255,0.3)" />
        </div>
      </section>

      {/* ═══════════════════ ABOUT ═══════════════════ */}
      <section id="about" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', width: '100%', padding: 'clamp(80px, 10vh, 140px) clamp(24px, 5vw, 80px)', position: 'relative', zIndex: 1 }}>
        <div style={{ ...wrap, textAlign: 'center', maxWidth: '800px' }}>
          <p style={{ color: ACCENT, fontSize: 'clamp(13px, 1.1vw, 18px)', letterSpacing: '5px', marginBottom: 'clamp(16px, 1.5vw, 24px)', fontWeight: 500 }}>// ABOUT ME</p>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 80px)', fontWeight: 700, marginBottom: 'clamp(48px, 5vw, 80px)', lineHeight: 1.05 }}>Passionate about code.</h2>
          <p style={{ fontSize: 'clamp(16px, 1.3vw, 22px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 'clamp(20px, 2vw, 32px)' }}>I'm Ayush Singh, a Computer Science & Design undergraduate at the Singapore University of Technology and Design. I'm passionate about building elegant solutions to complex problems and regularly participate in hackathons to push my skills further.</p>
          <p style={{ fontSize: 'clamp(16px, 1.3vw, 22px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8 }}>When I'm not coding, you'll find me at hackathons, exploring new technologies, or working on creative side projects that blend design and engineering.</p>
        </div>
      </section>

      {/* ═══════════════════ TECH TICKER ═══════════════════ */}
      <div style={{ overflow: 'hidden', padding: 'clamp(20px, 2.5vw, 36px) 0', borderTop: `1px solid ${ACCENT}12`, borderBottom: `1px solid ${ACCENT}12`, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', width: 'max-content', animation: 'tickerScroll 35s linear infinite' }}>
          {[...skills, ...skills, ...skills, ...skills].map((s, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', padding: '0 clamp(20px, 2.5vw, 40px)', whiteSpace: 'nowrap', fontSize: 'clamp(13px, 1.1vw, 18px)', color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', fontWeight: 500 }}>
              <span style={{ color: ACCENT, fontSize: '8px' }}>&#9670;</span>{s.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════ PORTAL ZOOM TRANSITION ═══════════════════ */}
      <div ref={zoomWrapperRef} style={{ height: '300vh', position: 'relative', background: ACCENT, clipPath: 'inset(0)' }}>

        {/* Dark scene — fixed but contained by clipPath on wrapper */}
        <div data-portal-scene style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: BG_DIMENSION, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '40rem', willChange: 'transform', transformOrigin: 'center center', zIndex: 1 }}>

          {/* "Explore" text — vertical, scrolls down into pill, then zooms */}
          <div data-explore-text style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15em', fontWeight: 900, color: ACCENT, textTransform: 'uppercase', willChange: 'transform, opacity', zIndex: 3, opacity: 0, transform: 'translateY(-120%) scale(1)', fontSize: 'clamp(28px, 4.5vw, 58px)', letterSpacing: '0.05em' }}>
            {'EXPLORE'.split('').map((letter, i) => (
              <span key={i} style={{ lineHeight: 1 }}>{letter}</span>
            ))}
          </div>

          {/* Inner content that fades in after transition completes */}
          <div data-zoom-content style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, zIndex: 4, background: BG_DIMENSION }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: ACCENT, fontSize: 'clamp(13px, 1.1vw, 18px)', letterSpacing: '6px', marginBottom: 'clamp(16px, 2vw, 32px)', fontWeight: 500 }}>// EXPERIENCE & PROJECTS</p>
              <h2 style={{ fontSize: 'clamp(32px, 5vw, 80px)', fontWeight: 700, lineHeight: 1.1 }}>
                <DecryptedText text="Explore my journey." speed={40} maxIterations={12} animateOn="view" sequential revealDirection="start" parentStyle={{ display: 'inline' }} />
              </h2>
            </div>
          </div>
        </div>

        {/* SVG Mask overlay — gold fill with pill-shaped cutout (evenodd) */}
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 2 }}>
          <div data-mask-scaler style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', willChange: 'transform', transformOrigin: 'center center' }}>
            <svg data-portal-svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
              <defs>
                <clipPath id="portal-grid-clip" clipPathUnits="userSpaceOnUse">
                  <path data-grid-clip fillRule="evenodd" d="" />
                </clipPath>
              </defs>
              <path data-mask-outer fillRule="evenodd" fill={ACCENT} stroke={BG_DARK} strokeWidth="1" d="" />
              <path data-mask-inner fillRule="evenodd" fill={ACCENT} stroke={BG_DARK} strokeWidth="0.5" d="" />
              <path data-mask-lines clipPath="url(#portal-grid-clip)" fill="none" stroke={BG_DARK} strokeWidth="1" strokeOpacity="0.25" d="" />
            </svg>
          </div>
        </div>

      </div>

      {/* ═══════════════════ EXPERIENCE ═══════════════════ */}
      <section id="experience" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', width: '100%', padding: 'clamp(80px, 10vh, 140px) clamp(24px, 5vw, 80px)', background: BG_DIMENSION }}>
        <div style={wrap}>
          <p style={{ color: ACCENT, fontSize: 'clamp(13px, 1.1vw, 18px)', letterSpacing: '5px', marginBottom: 'clamp(12px, 1.2vw, 20px)', fontWeight: 500 }}>// EXPERIENCE</p>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 80px)', fontWeight: 700, marginBottom: 'clamp(48px, 5vw, 80px)', lineHeight: 1.05 }}>Professional journey.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 'clamp(20px, 2.5vw, 36px)' }}>
            {exps.map((e, i) => (
              <div key={i} data-reveal style={{ ...revealCard(i * 0.12), padding: 'clamp(24px, 2.5vw, 40px)', background: BG_CARD, border: `1px solid ${ACCENT}18`, borderRadius: '20px', backdropFilter: 'blur(8px)', ...hov }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: 'clamp(18px, 1.6vw, 28px)', fontWeight: 700, marginBottom: '8px' }}>{e.title}</h3>
                    <p style={{ color: ACCENT, fontSize: 'clamp(13px, 1.1vw, 18px)', display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={16} /> {e.company}</p>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(12px, 0.9vw, 15px)', fontFamily: 'monospace', letterSpacing: '1px', whiteSpace: 'nowrap' }}>{e.period}</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(14px, 1.15vw, 19px)', lineHeight: 1.7 }}>{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PROJECTS ═══════════════════ */}
      <section id="projects" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', width: '100%', padding: 'clamp(80px, 10vh, 140px) clamp(24px, 5vw, 80px)', background: BG_DIMENSION }}>
        <div style={wrap}>
          <p style={{ color: ACCENT, fontSize: 'clamp(13px, 1.1vw, 18px)', letterSpacing: '5px', marginBottom: 'clamp(12px, 1.2vw, 20px)', fontWeight: 500 }}>// PROJECTS</p>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 80px)', fontWeight: 700, marginBottom: 'clamp(48px, 5vw, 80px)', lineHeight: 1.05 }}>Featured work.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 'clamp(20px, 2.5vw, 36px)' }}>
            {projs.map((p, i) => (
              <div key={i} data-reveal onClick={() => p.link && window.open(p.link, '_blank')} style={{ ...revealCard(i * 0.12), padding: 'clamp(24px, 2.5vw, 40px)', background: BG_CARD, border: `1px solid ${p.color}30`, borderRadius: '20px', cursor: p.link ? 'pointer' : 'default', backdropFilter: 'blur(8px)', ...(p.link ? hov : {}) }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'clamp(18px, 1.8vw, 30px)' }}>
                  <Code size={40} color={p.color} />
                  <ExternalLink size={22} color={p.link ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)"} />
                </div>
                <h3 style={{ fontSize: 'clamp(18px, 1.6vw, 28px)', fontWeight: 700, marginBottom: 'clamp(10px, 1vw, 18px)' }}>{p.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(14px, 1.15vw, 19px)', lineHeight: 1.6, marginBottom: 'clamp(18px, 1.8vw, 30px)' }}>{p.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {p.tech.map(t => <span key={t} style={{ padding: 'clamp(5px, 0.5vw, 8px) clamp(12px, 1vw, 20px)', background: `${p.color}18`, borderRadius: '10px', color: p.color, fontSize: 'clamp(12px, 0.9vw, 15px)', fontWeight: 600 }}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CONTACT ═══════════════════ */}
      <section id="contact" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', width: '100%', padding: 'clamp(80px, 10vh, 140px) clamp(24px, 5vw, 80px)', position: 'relative', zIndex: 1 }}>
        <div style={wrap}>
          <p style={{ color: ACCENT, fontSize: 'clamp(13px, 1.1vw, 18px)', letterSpacing: '5px', marginBottom: 'clamp(12px, 1.2vw, 20px)', fontWeight: 500 }}>// RESUME & CONTACT</p>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 80px)', fontWeight: 700, marginBottom: 'clamp(16px, 1.5vw, 24px)', lineHeight: 1.05 }}>Let's Build Something<span style={{ color: ACCENT }}> Together.</span></h2>
          <p style={{ fontSize: 'clamp(16px, 1.3vw, 22px)', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: 'clamp(48px, 5vw, 80px)', maxWidth: '600px' }}>Whether you have a project idea, a question, or just want to connect — I'd love to hear from you.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(20px, 2.5vw, 36px)', marginBottom: 'clamp(48px, 5vw, 80px)' }}>
            <div data-reveal style={{ ...revealCard(0), padding: 'clamp(28px, 3vw, 48px)', background: BG_CARD, border: `1px solid ${ACCENT}18`, borderRadius: '24px', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', ...hov }}>
              <div style={{ width: 'clamp(72px, 6vw, 96px)', height: 'clamp(72px, 6vw, 96px)', background: `${ACCENT}10`, borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'clamp(20px, 2vw, 32px)' }}><FileText size={36} color={ACCENT} /></div>
              <h3 style={{ fontSize: 'clamp(20px, 1.8vw, 30px)', fontWeight: 700, marginBottom: '10px' }}>My Resume</h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(14px, 1.1vw, 18px)', lineHeight: 1.7, marginBottom: 'clamp(24px, 2.5vw, 40px)' }}>Download my resume to learn more about my education, skills, and experiences.</p>
              <a href="/Ayush Singh resume.pdf" download style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: 'clamp(12px, 1.1vw, 20px) clamp(24px, 2.2vw, 40px)', background: ACCENT, color: BG_DARK, fontSize: 'clamp(14px, 1.1vw, 18px)', fontWeight: 700, borderRadius: '14px', textDecoration: 'none', ...hov }}><Download size={20} /> Download</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.5vw, 24px)' }}>
              {[{ icon: Mail, label: 'Email', value: 'ayushsinghsolanki06@gmail.com', href: 'mailto:ayushsinghsolanki06@gmail.com' }, { icon: Github, label: 'GitHub', value: 'github.com/Legend8068', href: 'https://github.com/Legend8068' }, { icon: Linkedin, label: 'LinkedIn', value: 'linkedin.com/in/ayush-singh0606', href: 'https://www.linkedin.com/in/ayush-singh0606' }].map(({ icon: Icon, label, value, href }, idx) => (
                <a key={label} data-reveal href={href} target="_blank" rel="noopener noreferrer" style={{ ...revealCard(idx * 0.08), display: 'flex', alignItems: 'center', gap: 'clamp(14px, 1.5vw, 24px)', padding: 'clamp(18px, 2vw, 32px)', background: BG_CARD, borderRadius: '18px', border: `1px solid ${ACCENT}18`, textDecoration: 'none', backdropFilter: 'blur(8px)', ...hov }}>
                  <div style={{ width: 'clamp(48px, 4vw, 64px)', height: 'clamp(48px, 4vw, 64px)', background: `${ACCENT}12`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={24} color={ACCENT} /></div>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(11px, 0.9vw, 14px)', marginBottom: '4px', letterSpacing: '2px', textTransform: 'uppercase' }}>{label}</p>
                    <p style={{ color: '#fff', fontSize: 'clamp(14px, 1.15vw, 19px)', fontWeight: 500 }}>{value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: 'clamp(32px, 4vw, 64px) clamp(24px, 5vw, 80px)', borderTop: `1px solid ${ACCENT}15`, position: 'relative', zIndex: 1 }}>
        <div style={{ ...wrap, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}><Code size={36} color={ACCENT} /><span style={{ fontSize: 'clamp(18px, 1.8vw, 30px)', fontWeight: 700 }}>Ayush Singh</span></div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 'clamp(13px, 1vw, 17px)' }}>&copy; 2026 &middot; Crafted with precision</p>
          <p style={{ color: ACCENT, fontSize: 'clamp(13px, 1vw, 17px)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 500 }}><span style={{ width: '10px', height: '10px', background: ACCENT, borderRadius: '50%', boxShadow: `0 0 10px ${ACCENT}` }} />System Status: Online</p>
        </div>
      </footer>

      <style>{`
        @keyframes tickerScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes scrollIndicator { 0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.6; } 50% { transform: translateX(-50%) translateY(10px); opacity: 1; } }
        html { scroll-behavior: smooth; }
        a:hover, button:hover { filter: brightness(1.1); }
      `}</style>
    </div>
  );
}
