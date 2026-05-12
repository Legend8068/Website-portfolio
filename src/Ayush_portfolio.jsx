import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Github, Linkedin, Mail, ArrowRight, Briefcase, Download, FileText, Code, Home, User, Folder, ExternalLink, ChevronDown, Gamepad2 } from 'lucide-react';
import DecryptedText from './DecryptedText';
import ASMonogramLogo from './ASMonogramLogo';
import CubeTransition from './CubeTransition';
import AudioWaveDivider from './AudioWaveDivider';
import MusicPictogram from './MusicPictogram';
import MusicLogo from './MusicLogo';
import PlayingCards from './PlayingCards';
import HobbiesScrollSequence from './HobbiesScrollSequence';

export default function Ayush_portfolio({ loaderDone = true }) {
  const circuitCanvasRef = useRef(null);
  const mousePos = useRef({ x: -1000, y: -1000 });
  const zoomWrapperRef = useRef(null);
  const zoomFrameRef = useRef(null);
  const heroRef = useRef(null);
  const circuitOpacityRef = useRef(0);
  const maskDataRef = useRef(null);

  const [activeSection, setActiveSection] = useState('home');
  const [heroWordIndex, setHeroWordIndex] = useState(0);
  // introStage: 'pre' (loader still showing) | 'centered' (name big, scrambling)
  //             | 'final' (name at top, rest of hero revealed)
  const [introStage, setIntroStage] = useState('pre');
  const heroWords = [['Software', 'Engineer'], ['Creative', 'Developer'], ['Solutions', 'Architect'], ['Tech', 'Enthusiast']];

  const [currentTime, setCurrentTime] = useState(() => {
    return new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Singapore', hour: 'numeric', minute: '2-digit', hour12: true });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Singapore', hour: 'numeric', minute: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Kick off the name intro the moment the loader finishes.
  useEffect(() => {
    if (!loaderDone) return;
    setIntroStage('centered');
    const t = setTimeout(() => setIntroStage('final'), 1500);
    return () => clearTimeout(t);
  }, [loaderDone]);

  const ACCENT = '#f0c040';
  const BG_DARK = '#0a1628';
  const BG_CARD = 'rgba(12, 26, 48, 0.85)';
  const BG_DIMENSION = 'rgba(6, 14, 30, 0.98)';

  // ── Circuit Board Background ──────────────────────────────────────────────
  useEffect(() => {
    if (!circuitCanvasRef.current) return;
    const canvas = circuitCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const resize = () => { 
      canvas.width = window.innerWidth; 
      canvas.height = window.innerHeight - parseInt(getComputedStyle(canvas).top || '0', 10); 
    };
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
      // Render the nodes without scroll-fading since it's now the hero background
      canvas.style.opacity = '0.5';
      frameId = requestAnimationFrame(draw);
    };
    frameId = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(frameId); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', handleMouseMove); };
  }, []);

  // ── Scroll Tracking ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const ids = ['home', 'about', 'hobbies', 'experience', 'projects', 'contact'];
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= 300) { setActiveSection(ids[i]); break; }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Hero Word Cycling ────────────────────────────────────────────────────
  useEffect(() => {
    let intervalId;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        setHeroWordIndex(prev => (prev + 1) % 4);
      }, 2000);
    }, 2000); // Start cycling sooner to match the 2s interval
    return () => { clearTimeout(timeoutId); if (intervalId) clearInterval(intervalId); };
  }, []);

  // ── Portal Mask Computation ─────────────────────────────────────────────
  useEffect(() => {
    const computeMask = () => {
      const wrapper = zoomWrapperRef.current;
      if (!wrapper) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Store viewport dimensions for scroll handler
      // Pill initial insets: horizontal = (100% - pillWidth%) / 2, vertical = (100% - pillHeight%) / 2
      const pillWidthPct = Math.min(22, 360 / vw * 100); // ~22% of viewport width
      const pillHeightPct = 80; // 80% of viewport height
      const insetX = (100 - pillWidthPct) / 2; // ~39%
      const insetY = (100 - pillHeightPct) / 2; // ~10%
      maskDataRef.current = { vw, vh, insetX, insetY };

      // Build grid lines SVG
      const svg = wrapper.querySelector('[data-portal-svg]');
      if (svg) {
        svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
        const vLines = vw > 767 ? 12 : 8;
        let dLines = '';
        for (let i = 1; i < vLines; i++) dLines += `M ${(vw / vLines) * i} 0 L ${(vw / vLines) * i} ${vh} `;
        const hGap = vh * 0.1;
        for (let i = 0; i <= Math.ceil(vh / hGap); i++) dLines += `M 0 ${hGap * i} L ${vw} ${hGap * i} `;
        const linesEl = svg.querySelector('[data-mask-lines]');
        if (linesEl) linesEl.setAttribute('d', dLines);
      }
    };
    computeMask();
    window.addEventListener('resize', computeMask);
    return () => window.removeEventListener('resize', computeMask);
  }, []);

  // ── Zoom Transition (scroll-driven CSS clip-path pill) ────────────────
  useEffect(() => {
    const handleScroll = () => {
      const wrapper = zoomWrapperRef.current;
      if (!wrapper || !maskDataRef.current) return;
      const rect = wrapper.getBoundingClientRect();
      const scrollable = wrapper.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const raw = Math.max(0, Math.min(1, -rect.top / scrollable));
      const { insetX, insetY } = maskDataRef.current;

      // ── 1. Dark scene clip-path: pill window grows from small capsule to full viewport
      //    clip-path: inset(Y% X% round 9999px) on the dark scene
      //    round 9999px guarantees a perfect capsule at ALL sizes
      const scene = wrapper.querySelector('[data-portal-scene]');
      if (scene) {
        // Hold the pill shape steady until raw = 0.6, then expand smoothly
        const t = raw < 0.6 ? 0 : Math.pow((raw - 0.6) / 0.4, 2.5);
        // Overshoot to -15% so the 9999px rounded corners extend beyond viewport
        const curInsetX = insetX - t * (insetX + 15);
        const curInsetY = insetY - t * (insetY + 15);
        // Apply capsule clip-path — at t=1 insets are -15%, pushing corners off-screen
        scene.style.clipPath = `inset(${curInsetY}% ${curInsetX}% round 9999px)`;
        // Scene scales from 0.82 to 1.0 for depth effect towards the end as we pass through
        const sceneT = raw < 0.6 ? 0 : Math.pow((raw - 0.6) / 0.4, 3);
        const sceneScale = 0.82 + sceneT * 0.18;
        scene.style.transform = `scale(${sceneScale})`;
      }

      // ── 2. "EXPLORE" text: slides down into pill, then fades
      const exploreEl = wrapper.querySelector('[data-explore-text]');
      if (exploreEl) {
        if (raw < 0.4) {
          const slideP = raw / 0.4;
          const yOff = -(1 - slideP) * 130;
          exploreEl.style.transform = `translateY(${yOff}%)`;
          exploreEl.style.opacity = Math.min(1, slideP * 3);
        } else if (raw < 0.65) {
          const fadeP = (raw - 0.4) / 0.25;
          exploreEl.style.transform = 'translateY(0%)';
          exploreEl.style.opacity = Math.max(0, 1 - fadeP);
        } else {
          exploreEl.style.transform = 'translateY(0%)';
          exploreEl.style.opacity = 0;
        }
      }

      // ── 3. Inner content fades in once through the portal
      const inner = wrapper.querySelector('[data-zoom-content]');
      if (inner) inner.style.opacity = Math.max(0, Math.min(1, (raw - 0.8) / 0.15));

      // ── 4. "Sucked-in" zooming effect on the outer grid
      const gridSvg = wrapper.querySelector('[data-portal-svg]');
      if (gridSvg) {
        let zoomRaw = 0;
        if (raw > 0.4) {
          zoomRaw = (raw - 0.4) / 0.6; // Starts after EXPLORE drops in
        }
        const gridScale = 1 + Math.pow(zoomRaw, 2) * 5;
        gridSvg.style.transformOrigin = 'center center';
        gridSvg.style.transform = `scale(${gridScale})`;
        gridSvg.style.opacity = Math.max(0, 1 - Math.pow(zoomRaw, 1.5) * 1.5);
      }
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
  const skills = ['JavaScript', 'React', 'Python', 'Node.js', 'Three.js', 'TypeScript', 'Git', 'Java', 'Algorithms', 'Computer Structures', 'CSS', 'HTML'];
  const exps = [
    { title: "Computer Science & Design", company: "SUTD", period: "2024 — 2028", desc: "Undergraduate studying Computer Science & Design at Singapore University of Technology and Design.", skills: ["Python", "JavaScript", "React", "AI & ML"] },
    { title: "Events & Welfare Director", company: "Student Government", period: "2025", desc: "Planning and executing welfare events for the community including treasure hunts and the SUTD Student Organisation Showcase.", skills: ["Leadership", "Event Planning", "Community"] },
    { title: "Biodiversity Conservation", company: "ACCB Cambodia", period: "2023", desc: "Worked with Angkor Centre for Conservation of Biodiversity in Siem Reap for the rehabilitation and conservation of endangered species.", skills: ["Conservation", "Fieldwork", "Teamwork"] },
    { title: "Club Treasurer", company: "Tchoukball Club SUTD", period: "2025 — Present", desc: "Handling all finance planning as well as general planning for training and welfare purposes.", skills: ["Finance", "Planning", "Team Management"] },
    { title: "Crackerjack Convention", company: "SUTD", period: "2023", desc: "Facilitated the Crackerjack Convention, a multi disciplinary event bringing together innovators, designers, and engineers to collaborate and tackle real world 21st century challenges with creative solutions.", skills: ["Innovation", "Design Thinking", "Collaboration"] },
    { title: "What The Hack", company: "SUTD", period: "2024", desc: "Produced a solution combining hardware and software to solve a medical related issue, producing an automated medicine pill box dispenser.", skills: ["Hardware", "Software", "IoT"] },
    { title: "Maritime Hackathon", company: "NUS", period: "2025", desc: "Produced an analytics and dashboard solution for visualising different statistics for maritime companies.", skills: ["Data Analytics", "Dashboard", "Full-Stack"] },
    { title: "SIM UOL CSSC Hackathon", company: "SIM", period: "2024", desc: "Designed and built a 3 level maze running and combat game within the hackathon timeframe.", skills: ["Game Dev", "Problem Solving", "Teamwork"] },
    { title: "CatalystX Startathon", company: "NTU", period: "2024", desc: "Won $200 for the Most Creative Idea for a biofuels startup concept aimed at making sustainable fuels more prevalent in daily life.", skills: ["Entrepreneurship", "Pitching", "Sustainability"] }
  ];
  const projs = [
    { title: "SG MeetHalfway", desc: "Web app that finds the optimal meeting spot between multiple people using geolocation and transit data", tech: ["React", "Leaflet", "Google Places API"], color: "#f0c040", link: "https://sg-meet-halfway.vercel.app/" },
    { title: "Portfolio Website (In Progress)", desc: "Interactive personal portfolio featuring dynamic geometry networks, scroll driven SVG portal transitions, and decrypted text effects.", tech: ["React", "Three.js", "JavaScript"], color: "#e07850" },
    { title: "Telegram Task Bot (In Progress)", desc: "Telegram bot to assist in task and deadline management for better convenience.", tech: ["Python", "Telegram API", "Automation"], color: "#50a0d0" }
  ];

  const scrollTo = id => { setActiveSection(id); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };
  const hov = { transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' };
  const wrap = { width: '100%', maxWidth: '1200px', margin: '0 auto' };
  const revealCard = (delay = 0) => ({ opacity: 0, transform: 'translateY(32px)', transition: `opacity 0.7s cubic-bezier(0.4,0,0.2,1) ${delay}s, transform 0.7s cubic-bezier(0.4,0,0.2,1) ${delay}s` });

  // Portal "Explore" text — no ghost letters needed

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: BG_DARK, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#fff', fontSize: '16px', lineHeight: 1.6 }}>
      {/* Bottom Navigation */}
      <nav style={{ position: 'fixed', bottom: 'clamp(16px, 2.5vw, 32px)', left: '50%', transform: 'translateX(-50%)', zIndex: 60, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'rgba(12,26,48,0.95)', backdropFilter: 'blur(16px)', borderRadius: '50px', border: `1px solid ${ACCENT}18` }}>
        {[{ id: 'home', Icon: Home }, { id: 'about', Icon: User }, { id: 'hobbies', Icon: Gamepad2 }, { id: 'experience', Icon: Briefcase }, { id: 'projects', Icon: Folder }, { id: 'contact', Icon: Mail }].map(({ id, Icon }) => (
          <button key={id} onClick={() => scrollTo(id)} style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: activeSection === id ? ACCENT : 'transparent', border: 'none', borderRadius: '50%', color: activeSection === id ? BG_DARK : 'rgba(255,255,255,0.45)', cursor: 'pointer', ...hov }}><Icon size={20} /></button>
        ))}
      </nav>

      {/* Side Dots */}
      <div style={{ position: 'fixed', right: 'clamp(12px, 1.5vw, 32px)', top: '50%', transform: 'translateY(-50%)', zIndex: 60, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {['home', 'about', 'hobbies', 'experience', 'projects', 'contact'].map(id => (
          <button key={id} onClick={() => scrollTo(id)} style={{ width: activeSection === id ? '14px' : '10px', height: activeSection === id ? '14px' : '10px', borderRadius: '50%', background: activeSection === id ? ACCENT : 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', ...hov, boxShadow: activeSection === id ? `0 0 12px ${ACCENT}` : 'none' }} />
        ))}
      </div>

      {/* ═══════════════════ HERO & ABOUT WRAPPER ═══════════════════ */}
      <div style={{ position: 'relative', width: '100%' }}>

        {/* Nodes Background (Spans both Home and About, starts below topbar) */}
        <canvas 
          ref={circuitCanvasRef} 
          style={{ 
            position: 'absolute', 
            top: 'clamp(90px, 11vh, 130px)', 
            left: 0, 
            width: '100%', 
            height: 'calc(100% - clamp(90px, 11vh, 130px))', 
            zIndex: 0, 
            opacity: 0.5 
          }} 
        />

        {/* ═══════════════════ HERO ═══════════════════ */}
        <section id="home" ref={heroRef} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', position: 'relative', zIndex: 1, overflow: 'hidden' }}>

        <style>{`
          .toolbar-coords { display: none; }
          @media (min-width: 768px) { .toolbar-coords { display: block; } }
          .toolbar-icon { color: rgba(255,255,255,0.6); transition: color 0.3s; display: flex; align-items: center; justify-content: center; }
          .toolbar-icon:hover { color: ${ACCENT}; }
        `}</style>

        {/* Top Toolbar (Landing Section Only) */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: 'clamp(20px, 3vw, 40px)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px, 2.5vw, 32px)', color: 'rgba(255,255,255,0.6)', fontSize: '11px', letterSpacing: '2px', fontFamily: 'monospace', textTransform: 'uppercase', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ACCENT }}></span>
              SINGAPORE, SG
            </div>
            <div>{currentTime} GMT+8</div>
            <div className="toolbar-coords">1° 20′ 23.22″ N, 03° 57′ 51.65″ E</div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            {[{ Icon: Github, href: 'https://github.com/Legend8068' }, { Icon: Linkedin, href: 'https://www.linkedin.com/in/ayush-singh0606' }, { Icon: Mail, href: 'mailto:ayushsinghsolanki06@gmail.com' }].map(({ Icon, href }, i) => (
              <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="toolbar-icon">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Hero Content - Centered */}
        {/* paddingTop reserves space for the fixed toolbar so content never slides under it */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: 'clamp(90px, 11vh, 130px) clamp(24px, 5vw, 80px) 0', width: '100%', maxWidth: '1400px' }}>
          {/* Soft radial glow for text readability - constrained tightly around text */}
          <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', background: `radial-gradient(ellipse at center, ${BG_DARK} 10%, rgba(10,22,40,0.85) 25%, transparent 60%)`, zIndex: -1, pointerEvents: 'none' }} />

          {/* Name row: starts as one big centered "AYUSH SINGH"; in the
              final stage it splits — AYUSH slides to the left, SINGH to
              the right — and the audio-wave track expands into the gap
              between them. The whole row also lifts slightly so the
              block below can breathe and grow bigger type. */}
          <div
            data-hero-name
            style={{
              transform: introStage === 'centered'
                ? 'translateY(18vh) scale(1.75)'
                : 'translateY(0) scale(1)',
              opacity: introStage === 'pre' ? 0 : 1,
              transformOrigin: 'center center',
              transition: 'transform 1000ms cubic-bezier(0.76, 0, 0.24, 1), opacity 400ms ease-out',
              willChange: 'transform, opacity',
              marginBottom: 'clamp(16px, 2.5vw, 40px)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: introStage === 'final'
                ? 'clamp(12px, 2.2vw, 36px)'
                : 'clamp(8px, 0.8vw, 16px)',
              transition: 'gap 1000ms cubic-bezier(0.76, 0, 0.24, 1)',
              width: '100%',
            }}>
              {/* AYUSH — anchors to the left when the row opens */}
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(44px, 8vw, 128px)',
                fontWeight: 400,
                lineHeight: 0.95,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                color: '#3DA5D9',
                margin: 0,
                flexShrink: 0,
              }}>
                {introStage !== 'pre' && (
                  <DecryptedText
                    key={`hero-first-${introStage === 'centered' ? 'c' : 'f'}`}
                    text="Ayush"
                    speed={55}
                    maxIterations={18}
                    sequential
                    revealDirection="start"
                    animateOn="view"
                    useOriginalCharsOnly={false}
                    parentStyle={{ display: 'inline-block', whiteSpace: 'nowrap' }}
                    encryptedStyle={{ color: '#3DA5D988' }}
                  />
                )}
              </h1>

              {/* Audio-wave track — collapsed to 0 width in the centered
                  stage, expands into the gap between the names in final. */}
              <div style={{
                flex: introStage === 'final' ? '1 1 auto' : '0 0 auto',
                width: introStage === 'final' ? 'clamp(120px, 20vw, 320px)' : 0,
                maxWidth: introStage === 'final' ? 'clamp(120px, 20vw, 320px)' : 0,
                opacity: introStage === 'final' ? 1 : 0,
                overflow: 'hidden',
                transition:
                  'width 1000ms cubic-bezier(0.76, 0, 0.24, 1),' +
                  'max-width 1000ms cubic-bezier(0.76, 0, 0.24, 1),' +
                  'opacity 500ms ease-out 500ms',
                pointerEvents: 'none',
              }}>
                <AudioWaveDivider />
              </div>

              {/* SINGH — anchors to the right when the row opens */}
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(44px, 8vw, 128px)',
                fontWeight: 400,
                lineHeight: 0.95,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                color: '#3DA5D9',
                margin: 0,
                flexShrink: 0,
              }}>
                {introStage !== 'pre' && (
                  <DecryptedText
                    key={`hero-last-${introStage === 'centered' ? 'c' : 'f'}`}
                    text="Singh"
                    speed={55}
                    maxIterations={18}
                    sequential
                    revealDirection="start"
                    animateOn="view"
                    useOriginalCharsOnly={false}
                    parentStyle={{ display: 'inline-block', whiteSpace: 'nowrap' }}
                    encryptedStyle={{ color: '#3DA5D988' }}
                  />
                )}
              </h1>
            </div>
          </div>

          {/* Everything below fades in after the name has split apart.
              With the audio track now up in the name row and the whole
              block lifted a little, this section gets more vertical
              breathing room — so type scales a step larger. */}
          <div style={{
            opacity: introStage === 'final' ? 1 : 0,
            transform: introStage === 'final' ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 700ms ease-out 350ms, transform 700ms cubic-bezier(0.25,0.46,0.45,0.94) 350ms',
            pointerEvents: introStage === 'final' ? 'auto' : 'none',
          }}>
            <h2 style={{ fontSize: 'clamp(34px, 6.5vw, 112px)', fontWeight: 700, lineHeight: 0.95, margin: '0 0 clamp(20px, 2.4vw, 40px) 0', letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
              <DecryptedText text="Aspiring" speed={55} maxIterations={20} animateOn="view" sequential revealDirection="start" parentStyle={{ display: 'block' }} />
              <span style={{ color: ACCENT }}>
                <DecryptedText key={`hw-${heroWordIndex}-0`} text={heroWords[heroWordIndex][0]} speed={heroWordIndex === 0 ? 65 : 40} maxIterations={heroWordIndex === 0 ? 28 : 16} animateOn="view" sequential revealDirection="start" parentStyle={{ display: 'block' }} encryptedStyle={{ color: `${ACCENT}88` }} />
              </span>
              <span style={{ color: ACCENT }}>
                <DecryptedText key={`hw-${heroWordIndex}-1`} text={heroWords[heroWordIndex][1]} speed={heroWordIndex === 0 ? 60 : 38} maxIterations={heroWordIndex === 0 ? 25 : 14} animateOn="view" sequential revealDirection="start" parentStyle={{ display: 'block' }} encryptedStyle={{ color: `${ACCENT}88` }} />
              </span>
            </h2>

            <p style={{ fontSize: 'clamp(16px, 1.5vw, 26px)', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, marginBottom: 'clamp(24px, 3vw, 44px)', maxWidth: '640px', margin: '0 auto clamp(24px, 3vw, 44px)' }}>
              Learning and Exploring new things everyday
            </p>

            <div style={{ display: 'flex', gap: 'clamp(14px, 1.4vw, 24px)', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'clamp(48px, 6vw, 80px)' }}>
              <button data-hover-btn-primary onClick={() => scrollTo('projects')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: 'clamp(16px, 1.4vw, 26px) clamp(32px, 2.8vw, 52px)', background: ACCENT, color: BG_DARK, fontSize: 'clamp(16px, 1.4vw, 22px)', fontWeight: 700, border: 'none', borderRadius: '14px', cursor: 'pointer' }}>
                View Projects <span data-arrow style={{ display: 'inline-flex' }}><ArrowRight size={22} /></span>
              </button>
              <button data-hover-btn-secondary onClick={() => scrollTo('contact')} style={{ padding: 'clamp(16px, 1.4vw, 26px) clamp(32px, 2.8vw, 52px)', background: 'transparent', color: '#fff', fontSize: 'clamp(16px, 1.4vw, 22px)', fontWeight: 500, border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: '14px', cursor: 'pointer' }}>Contact Me</button>
            </div>
          </div>
        </div>

      </section>

      {/* ═══════════════════ ABOUT ═══════════════════ */}
      <section id="about" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', width: '100%', padding: 'clamp(80px, 10vh, 140px) clamp(24px, 5vw, 80px)', position: 'relative', zIndex: 1 }}>
        <div style={{ ...wrap, textAlign: 'center', maxWidth: '800px', position: 'relative', zIndex: 2 }}>
          <p style={{ color: ACCENT, fontSize: 'clamp(13px, 1.1vw, 18px)', letterSpacing: '5px', marginBottom: 'clamp(16px, 1.5vw, 24px)', fontWeight: 500 }}>// ABOUT ME</p>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 80px)', fontWeight: 700, marginBottom: 'clamp(48px, 5vw, 80px)', lineHeight: 1.05 }}>Passionate about code.</h2>
          <p style={{ fontSize: 'clamp(16px, 1.3vw, 22px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 'clamp(20px, 2vw, 32px)' }}>I'm Ayush Singh, a Computer Science & Design undergraduate at the Singapore University of Technology and Design. I'm passionate about building elegant solutions to complex problems and regularly participate in hackathons to push my skills further.</p>
          <p style={{ fontSize: 'clamp(16px, 1.3vw, 22px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8 }}>When I'm not developing, you'll find me at hackathons, exploring new technologies, or working on creative side projects that blend design and engineering.</p>
        </div>

        {/* ═══════════════════ TECH TICKER ═══════════════════ */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', overflow: 'hidden', padding: 'clamp(20px, 2.5vw, 36px) 0', borderTop: `1px solid ${ACCENT}12`, zIndex: 2 }}>
          <div style={{ display: 'flex', width: 'max-content', animation: 'tickerScroll 35s linear infinite' }}>
            {[...skills, ...skills, ...skills, ...skills].map((s, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', padding: '0 clamp(20px, 2.5vw, 40px)', whiteSpace: 'nowrap', fontSize: 'clamp(13px, 1.1vw, 18px)', color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', fontWeight: 500 }}>
                <span style={{ color: ACCENT, fontSize: '8px' }}>&#9670;</span>{s.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </section>

      </div>

      {/* ═══════════════════ HOBBIES & INTERESTS ═══════════════════ */}
      <HobbiesScrollSequence />




      {/* ═══════════════════ PORTAL ZOOM TRANSITION ═══════════════════ */}
      <div ref={zoomWrapperRef} style={{ height: '300vh', position: 'relative', background: ACCENT, clipPath: 'inset(0)' }}>

        {/* Grid lines on the gold background */}
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
          <svg data-portal-svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <path data-mask-lines fill="none" stroke={BG_DARK} strokeWidth="1" strokeOpacity="0.18" d="" />
          </svg>
        </div>

        {/* Dark scene — clipped to pill shape, visible through the capsule window */}
        <div data-portal-scene style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: BG_DIMENSION, display: 'flex', alignItems: 'center', justifyContent: 'center', willChange: 'transform, clip-path', transformOrigin: 'center center', transform: 'scale(0.82)', clipPath: 'inset(10% 39% round 9999px)', zIndex: 2 }}>

          {/* Pill border glow */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: '9999px', boxShadow: `inset 0 0 60px ${ACCENT}20, 0 0 80px ${ACCENT}15`, pointerEvents: 'none', zIndex: 5 }} />

          {/* "Explore" text — vertical, slides down into pill, then fades */}
          <div data-explore-text style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.12em', fontWeight: 900, color: ACCENT, textTransform: 'uppercase', willChange: 'transform, opacity', zIndex: 3, opacity: 0, transform: 'translateY(-130%)', fontSize: 'clamp(32px, 5vw, 64px)', letterSpacing: '0.04em' }}>
            {'EXPLORE'.split('').map((letter, i) => (
              <span key={i} style={{ lineHeight: 1, display: 'block' }}>{letter}</span>
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

      </div>

      {/* ═══════════════════ CUBE → EXPERIENCE TRANSITION ═══════════════════ */}
      <CubeTransition experiences={exps} />

      {/* ═══════════════════ PROJECTS ═══════════════════ */}
      <section id="projects" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', width: '100%', padding: 'clamp(80px, 10vh, 140px) clamp(24px, 5vw, 80px)', background: BG_DIMENSION }}>
        <div style={wrap}>
          <p style={{ color: ACCENT, fontSize: 'clamp(13px, 1.1vw, 18px)', letterSpacing: '5px', marginBottom: 'clamp(12px, 1.2vw, 20px)', fontWeight: 500 }}>// PROJECTS</p>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 80px)', fontWeight: 700, marginBottom: 'clamp(48px, 5vw, 80px)', lineHeight: 1.05 }}>Featured work.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 'clamp(20px, 2.5vw, 36px)' }}>
            {projs.map((p, i) => (
              <div key={i} data-reveal data-hover-lift onClick={() => p.link && window.open(p.link, '_blank')} style={{ ...revealCard(i * 0.12), padding: 'clamp(24px, 2.5vw, 40px)', background: BG_CARD, border: `1px solid ${p.color}30`, borderRadius: '20px', cursor: p.link ? 'pointer' : 'default', backdropFilter: 'blur(8px)' }}>
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
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 80px)', fontWeight: 700, marginBottom: 'clamp(16px, 1.5vw, 24px)', lineHeight: 1.05 }}>
            Let's Build Something<br />
            <span style={{ color: ACCENT }}><DecryptedText key={`together-${Math.floor(heroWordIndex / 2)}`} text="Together." speed={70} maxIterations={15} animateOn="view" sequential revealDirection="start" parentStyle={{ display: 'inline-block', whiteSpace: 'nowrap' }} encryptedStyle={{ color: `${ACCENT}88` }} /></span>
          </h2>
          <p style={{ fontSize: 'clamp(16px, 1.3vw, 22px)', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: 'clamp(48px, 5vw, 80px)', maxWidth: '600px' }}>Whether you have a project idea, a question, or just want to connect — I'd love to hear from you.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(20px, 2.5vw, 36px)', marginBottom: 'clamp(48px, 5vw, 80px)' }}>
            <div data-reveal data-hover-lift style={{ ...revealCard(0), padding: 'clamp(28px, 3vw, 48px)', background: BG_CARD, border: `1px solid ${ACCENT}18`, borderRadius: '24px', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <ASMonogramLogo size="full" interactive={true} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.5vw, 24px)', height: '100%' }}>
              {[{ icon: Mail, label: 'Email', value: 'ayushsinghsolanki06@gmail.com', href: 'mailto:ayushsinghsolanki06@gmail.com' }, { icon: Github, label: 'GitHub', value: 'github.com/Legend8068', href: 'https://github.com/Legend8068' }, { icon: Linkedin, label: 'LinkedIn', value: 'linkedin.com/in/ayush-singh0606', href: 'https://www.linkedin.com/in/ayush-singh0606' }].map(({ icon: Icon, label, value, href }, idx) => (
                <a key={label} data-reveal data-hover-link href={href} target="_blank" rel="noopener noreferrer" style={{ ...revealCard(idx * 0.08), display: 'flex', alignItems: 'center', gap: 'clamp(14px, 1.5vw, 24px)', padding: 'clamp(18px, 2vw, 32px)', background: BG_CARD, borderRadius: '18px', border: `1px solid ${ACCENT}18`, textDecoration: 'none', backdropFilter: 'blur(8px)', flex: 1 }}>
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

        /* ── Hover: Card Lift ── */
        [data-hover-lift] {
          transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
        }
        [data-hover-lift]:hover {
          transform: translateY(-5px) !important;
          box-shadow: 0 14px 40px rgba(240, 192, 64, 0.1), 0 4px 12px rgba(0, 0, 0, 0.25) !important;
          border-color: rgba(240, 192, 64, 0.3) !important;
        }

        /* ── Hover: Primary Button ── */
        [data-hover-btn-primary] {
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.3s ease !important;
        }
        [data-hover-btn-primary]:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 28px rgba(240, 192, 64, 0.35) !important;
          filter: brightness(1.08) !important;
        }
        [data-arrow] {
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        [data-hover-btn-primary]:hover [data-arrow] {
          transform: translateX(5px);
        }

        /* ── Hover: Secondary Button ── */
        [data-hover-btn-secondary] {
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease !important;
        }
        [data-hover-btn-secondary]:hover {
          transform: translateY(-2px) !important;
          background: rgba(240, 192, 64, 0.08) !important;
          border-color: rgba(240, 192, 64, 0.45) !important;
          box-shadow: 0 6px 20px rgba(240, 192, 64, 0.12) !important;
        }

        /* ── Hover: Icon Links ── */
        [data-hover-icon] {
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), background 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease !important;
        }
        [data-hover-icon]:hover {
          transform: translateY(-3px) scale(1.05) !important;
          border-color: rgba(240, 192, 64, 0.4) !important;
          color: #f0c040 !important;
          box-shadow: 0 6px 20px rgba(240, 192, 64, 0.15) !important;
        }

        /* ── Hover: Contact Links ── */
        [data-hover-link] {
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease !important;
        }
        [data-hover-link]:hover {
          transform: translateX(6px) !important;
          border-color: rgba(240, 192, 64, 0.35) !important;
          background: rgba(12, 26, 48, 0.98) !important;
          box-shadow: 0 4px 20px rgba(240, 192, 64, 0.08) !important;
        }

        /* ── Nav button hover ── */
        nav button {
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
        }
        nav button:hover {
          transform: scale(1.12) !important;
        }
      `}</style>
    </div>
  );
}
