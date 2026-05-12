import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import pathsData from './hobby-paths.json';

const ACCENT = '#f0c040';
const COLOR = '#A41623';
const BG_DARK = '#060e1e';

const hobbyInfo = [
  {
    id: '01',
    menuTitle: 'Football.',
    title: 'THE BEAUTIFUL GAME',
    lines: [
      'I live and breathe football both on and off the pitch. I am obsessed with the',
      'tactical side of the game, from intelligent build up play to pressing',
      'movement. You will find me analysing how teams control space and tempo.'
    ],
    stats: [
      { label: 'OBSESSION SINCE', value: '2006' },
      { label: 'FAVOURITE CLUB', value: 'FC Barcelona' },
      { label: 'FAVOURITE PLAYER', value: 'Lionel Messi' }
    ],
    assetSize: '1500x675',
    svgScale: 'width: 80%, maxWidth: 550px'
  },
  {
    id: '02',
    menuTitle: 'Music.',
    title: 'RHYTHM & SOUNDSCAPES',
    lines: [
      'Music is woven into almost every part of my daily life. I constantly explore',
      'new genres, soundscapes and artists. Whether I am designing, developing,',
      'travelling, or relaxing, there is almost always a soundtrack playing in the background.'
    ],
    stats: [
      { label: 'FAVOURITE SONG', value: 'The Man Who Cant\nBe Moved' },
      { label: 'TOP GENRE', value: 'Hip-Hop/R&B' },
      { label: 'FAVOURITE ARTIST', value: 'One Direction' }
    ],
    assetSize: '1664x2572',
    svgScale: 'width: 50%, maxWidth: 350px'
  },
  {
    id: '03',
    menuTitle: 'Cards.',
    title: 'SLEIGHT OF HAND',
    lines: [
      'I practise cardistry and sleight of hand as a creative outlet. I am drawn to',
      'the precision, rhythm, and elegance behind card flourishes, visual cuts, and',
      'magical routines. I find it fascinating how simple movements and timing can create moments of surprise.'
    ],
    stats: [
      { label: 'FAVOURITE DECK', value: 'Bicycle' },
      { label: 'SPECIALTY', value: 'Cardistry' },
      { label: 'YEARS ACTIVE', value: '10 Years' }
    ],
    assetSize: '360x560',
    svgScale: 'width: 70%, maxWidth: 500px'
  }
];

const StaggeredMusicPath = ({ d, index, total, scrollYProgress, musicFill, musicOp }) => {
  const drawStart = 0.333;
  const drawEnd = 0.463;
  const undrawStart = 0.536;
  const undrawEnd = 0.666;

  const drawDuration = drawEnd - drawStart;
  const staggerTime = drawDuration * 0.7;
  const indDuration = drawDuration * 0.3;
  const myStart = drawStart + (index / Math.max(1, total - 1)) * staggerTime;
  const myEnd = myStart + indDuration;

  const undrawDuration = undrawEnd - undrawStart;
  const undrawStagger = undrawDuration * 0.7;
  const indUndrawDuration = undrawDuration * 0.3;
  const myUndrawStart = undrawStart + (index / Math.max(1, total - 1)) * undrawStagger;
  const myUndrawEnd = myUndrawStart + indUndrawDuration;

  const pathLength = useTransform(
    scrollYProgress,
    [myStart, myEnd, myUndrawStart, myUndrawEnd],
    [0, 1, 1, 0],
    { clamp: true }
  );

  return (
    <motion.path
      d={d}
      fill={COLOR}
      stroke={COLOR}
      strokeWidth="8"
      fillRule="evenodd"
      style={{ pathLength, fillOpacity: musicFill, opacity: musicOp }}
    />
  );
};

const HobbiesScrollSequence = () => {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.33) {
      if (activeIndex !== 0) setActiveIndex(0);
    } else if (latest < 0.66) {
      if (activeIndex !== 1) setActiveIndex(1);
    } else {
      if (activeIndex !== 2) setActiveIndex(2);
    }
  });

  // ─── Football ──────────────────────────────────────────────────
  const fbOp       = useTransform(scrollYProgress, [0, 0.001, 0.332, 0.333], [0, 1, 1, 0], { clamp: true });
  const fbPath     = useTransform(scrollYProgress, [0.000, 0.130, 0.203, 0.333], [0, 1, 1, 0], { clamp: true });
  const fbFill     = useTransform(scrollYProgress, [0.130, 0.150, 0.183, 0.203], [0, 1, 1, 0], { clamp: true });

  // ─── Music ─────────────────────────────────────────────────────
  const musicOp      = useTransform(scrollYProgress, [0.332, 0.333, 0.665, 0.666], [0, 1, 1, 0], { clamp: true });
  const musicPath    = useTransform(scrollYProgress, [0.333, 0.463, 0.536, 0.666], [0, 1, 1, 0], { clamp: true });
  const musicFill    = useTransform(scrollYProgress, [0.463, 0.483, 0.516, 0.536], [0, 1, 1, 0], { clamp: true });

  // ─── Ace ───────────────────────────────────────────────────────
  const aceOp      = useTransform(scrollYProgress, [0.665, 0.666, 0.998, 0.999], [0, 1, 1, 0], { clamp: true });
  const acePath    = useTransform(scrollYProgress, [0.666, 0.796, 0.869, 0.999], [0, 1, 1, 0], { clamp: true });
  const aceFill    = useTransform(scrollYProgress, [0.796, 0.816, 0.849, 0.869], [0, 1, 1, 0], { clamp: true });

  // Base SVG styles
  const svgBase = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    overflow: 'visible',
    zIndex: 10
  };

  return (
    <div
      ref={containerRef}
      id="hobbies"
      style={{ position: 'relative', height: '1800vh', background: BG_DARK }}
    >
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 4vw'
      }}>

        {/* ══════════════ TWO COLUMN LAYOUT ══════════════ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: '6vw',
          width: '100%',
          maxWidth: '1600px',
          height: '80vh',
          position: 'relative'
        }}>

          {/* ─── LEFT COLUMN (Context & Navigation) ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

            {/* Header */}
            <div>
              <p style={{ color: ACCENT, fontSize: '13px', letterSpacing: '4px', marginBottom: '8px', fontWeight: 600 }}>
                // BEYOND THE CODE
              </p>
              <p style={{ color: 'rgba(255, 255, 255, 1)', fontSize: '20px', letterSpacing: '3px', textTransform: 'uppercase' }}>
                HOBBIES & INTERESTS
              </p>
            </div>

            {/* Menu List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '40px 0' }}>
              {hobbyInfo.map((info, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{
                      color: isActive ? ACCENT : 'rgba(255,255,255,0.3)',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      marginRight: '16px',
                      transition: 'color 0.4s ease'
                    }}>
                      {info.id}
                    </span>
                    <h2 style={{
                      fontSize: 'clamp(40px, 6vw, 100px)',
                      fontWeight: 800,
                      margin: 0,
                      lineHeight: 1.1,
                      color: isActive ? '#fff' : 'transparent',
                      WebkitTextStroke: isActive ? 'none' : '1.5px rgba(255,255,255,0.15)',
                      transition: 'color 0.4s ease, -webkit-text-stroke 0.4s ease'
                    }}>
                      {info.menuTitle}
                    </h2>
                    {isActive && (
                      <motion.div
                        layoutId="activeLine"
                        style={{
                          height: '2px',
                          background: ACCENT,
                          flexGrow: 1,
                          marginLeft: '32px',
                          maxWidth: '120px'
                        }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Content Area */}
            <div style={{ minHeight: '180px', position: 'relative' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}
                >
                  <h4 style={{
                    fontSize: '14px',
                    letterSpacing: '4px',
                    color: '#fff',
                    marginBottom: '16px',
                    textTransform: 'uppercase'
                  }}>
                    {hobbyInfo[activeIndex].title}
                  </h4>
                  {hobbyInfo[activeIndex].lines.map((line, i) => (
                    <p key={i} style={{
                      color: 'rgba(255,255,255,0.55)',
                      fontSize: 'clamp(14px, 1vw, 18px)',
                      lineHeight: 1.7,
                      margin: 0
                    }}>
                      {line}
                    </p>
                  ))}

                  {/* Metadata Stats Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '24px',
                    marginTop: '32px'
                  }}>
                    {hobbyInfo[activeIndex].stats.map((stat, i) => (
                      <div key={i}>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', letterSpacing: '2px', marginBottom: '8px', textTransform: 'uppercase' }}>
                          {stat.label}
                        </p>
                        <p style={{ color: '#fff', fontSize: '14px', fontWeight: 500, margin: 0 }}>
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ─── RIGHT COLUMN (Asset Container) ─── */}
          <div style={{
            position: 'relative',
            border: '1.5px dashed rgba(255,255,255,0.08)',
            height: '100%',
            width: '100%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Background Diagonal Stripes */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: `repeating-linear-gradient(
                -45deg,
                rgba(255, 255, 255, 0.015),
                rgba(255, 255, 255, 0.015) 2px,
                transparent 2px,
                transparent 12px
              )`,
              zIndex: 0
            }} />

            {/* Corner Markers */}
            <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '16px', height: '16px', borderTop: '2px solid rgba(255,255,255,0.2)', borderLeft: '2px solid rgba(255,255,255,0.2)' }} />
            <div style={{ position: 'absolute', top: '-1px', right: '-1px', width: '16px', height: '16px', borderTop: '2px solid rgba(255,255,255,0.2)', borderRight: '2px solid rgba(255,255,255,0.2)' }} />
            <div style={{ position: 'absolute', bottom: '-1px', left: '-1px', width: '16px', height: '16px', borderBottom: '2px solid rgba(255,255,255,0.2)', borderLeft: '2px solid rgba(255,255,255,0.2)' }} />
            <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '16px', height: '16px', borderBottom: '2px solid rgba(255,255,255,0.2)', borderRight: '2px solid rgba(255,255,255,0.2)' }} />

            {/* Technical Labels */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}
              >
                <div style={{ position: 'absolute', top: '24px', left: '24px', color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '2px' }}>
                  [ ILLUSTRATION • {hobbyInfo[activeIndex].menuTitle.replace('.', '').toUpperCase()} • {hobbyInfo[activeIndex].assetSize} ]
                </div>
                <div style={{ position: 'absolute', bottom: '24px', right: '24px', color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '2px' }}>
                  {hobbyInfo[activeIndex].id} / 03
                </div>

                {/* Massive Background Number */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '40vw',
                  fontWeight: 900,
                  color: 'transparent',
                  WebkitTextStroke: '1px rgba(255,255,255,0.03)',
                  zIndex: 1,
                  lineHeight: 1
                }}>
                  {hobbyInfo[activeIndex].id}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* ═══ SVGs ═══ */}
            {/* Football */}
            <svg viewBox="0 0 1500.34 675.49" style={{ ...svgBase, width: '80%', maxWidth: '550px' }}>
              {pathsData.football.map((d, i) => (
                <motion.path
                  key={`fb-${i}`}
                  d={d}
                  fill={COLOR}
                  stroke={COLOR}
                  strokeWidth="8"
                  fillRule="evenodd"
                  style={{ pathLength: fbPath, fillOpacity: fbFill, opacity: fbOp }}
                />
              ))}
            </svg>

            {/* Music */}
            <svg viewBox="0 0 1664 2572" style={{ ...svgBase, width: '45%', maxWidth: '350px' }}>
              {pathsData.music.map((d, i) => (
                <StaggeredMusicPath
                  key={`mu-${i}`}
                  d={d}
                  index={i}
                  total={pathsData.music.length}
                  scrollYProgress={scrollYProgress}
                  musicFill={musicFill}
                  musicOp={musicOp}
                />
              ))}
            </svg>

            {/* Ace */}
            <svg viewBox="780 400 360 560" style={{ ...svgBase, width: '55%', maxWidth: '400px' }}>
              {pathsData.ace.map((d, i) => (
                <motion.path
                  key={`ac-${i}`}
                  d={d}
                  fill={i === 0 ? 'transparent' : COLOR}
                  stroke={COLOR}
                  strokeWidth="2"
                  fillRule="evenodd"
                  style={{ pathLength: acePath, fillOpacity: aceFill, opacity: aceOp }}
                />
              ))}
            </svg>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HobbiesScrollSequence;
