import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

export default function ASMonogramLogo({ size = 'hero', interactive = true }) {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const smoothX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 80, damping: 20 });

  const displayX = useTransform(mouseX, v => `x.${Math.round(v * 400).toString().padStart(3, '0')}`);
  const displayY = useTransform(mouseY, v => `y.${Math.round(v * 400).toString().padStart(3, '0')}`);

  // S-curve morph offset driven by mouse
  const sOffsetX = useTransform(smoothX, [0, 1], [-6, 6]);
  const sOffsetY = useTransform(smoothY, [0, 1], [-4, 4]);

  // Gold line position
  const lineX = useTransform(smoothX, [0, 1], [80, 320]);
  const lineY = useTransform(smoothY, [0, 1], [20, 380]);

  // Crosshair offsets (must be at top level, not conditional)
  const crosshairYOffset = useTransform(smoothY, [0, 1], [-30, 30]);
  const crosshairXOffset = useTransform(smoothX, [0, 1], [-30, 30]);

  useEffect(() => {
    if (!interactive) return;
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseX.set(Math.max(0, Math.min(1, x)));
      mouseY.set(Math.max(0, Math.min(1, y)));
    };
    const el = containerRef.current;
    el?.addEventListener('mousemove', handleMouseMove);
    return () => el?.removeEventListener('mousemove', handleMouseMove);
  }, [interactive, mouseX, mouseY]);

  const sizeStyles = {
    hero: { width: '400px', height: '400px' },
    nav: { width: '48px', height: '48px' },
    md: { width: '128px', height: '128px' },
    full: { width: '100%', height: '100%', minHeight: '280px', maxHeight: '400px' },
  };

  const viewBox = "0 0 400 400";

  return (
    <div
      ref={containerRef}
      style={{ ...sizeStyles[size], position: 'relative', userSelect: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <motion.svg
        viewBox={viewBox}
        style={{ width: '100%', height: '100%' }}
        initial="hidden"
        animate="visible"
      >
        <defs>
          {/* Gold gradient for accent elements */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#E8CC6A" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>

          {/* Subtle shadow filter */}
          <filter id="subtleShadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1A1A1A" floodOpacity="0.08" />
          </filter>

          {/* Clip path for the intersection highlight */}
          <clipPath id="intersectionClip">
            <rect x="170" y="140" width="60" height="120" />
          </clipPath>
        </defs>



        <motion.g style={{ transformOrigin: '200px 200px', transform: 'scale(1.45)' }}>
          {/* The "A" — Static, structural, foundational */}
          <motion.g filter="url(#subtleShadow)">
            <motion.path
              d="
                M 120 320
                L 200 80
                L 280 320
                M 148 240
                L 252 240
              "
              fill="none"
              stroke="#E2E0DB"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            />
          </motion.g>

          {/* The "S" — Fluid, expressive, reactive to mouse */}
          <motion.g filter="url(#subtleShadow)">
            <motion.path
              d={`
                M ${260} ${115}
                C ${240} ${85}, ${170} ${75}, ${155} ${110}
                C ${138} ${150}, ${220} ${165}, ${235} ${200}
                C ${255} ${240}, ${160} ${265}, ${155} ${290}
                C ${148} ${325}, ${225} ${335}, ${250} ${305}
              `}
              fill="none"
              stroke="#f0c040"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
              style={{
                x: interactive ? sOffsetX : 0,
                y: interactive ? sOffsetY : 0,
              }}
            />
          </motion.g>
        </motion.g>

        {/* Crosshair lines — architectural reference */}
        {interactive && (
          <>
            <motion.line
              x1="0"
              y1="200"
              x2="400"
              y2="200"
              stroke="hsl(36, 12%, 88%)"
              strokeWidth="0.3"
              strokeDasharray="4 8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.6 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 2.5, duration: 0.8 }}
              style={{ y: crosshairYOffset }}
            />
            <motion.line
              x1="200"
              y1="0"
              x2="200"
              y2="400"
              stroke="hsl(36, 12%, 88%)"
              strokeWidth="0.3"
              strokeDasharray="4 8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.6 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 2.5, duration: 0.8 }}
              style={{ x: crosshairXOffset }}
            />
          </>
        )}

        {/* Removed internal SVG coordinate text */}


      </motion.svg>

      {/* Absolute coordinates anchored perfectly to the HTML container's structural boundaries */}
      <motion.div
        style={{ position: 'absolute', top: '16px', left: '20px', color: 'hsl(0, 0%, 45%)', fontSize: '12px', fontFamily: 'var(--font-display)', letterSpacing: '0.10em' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.5 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: 2.8, duration: 0.6 }}
      >
        {displayX}
      </motion.div>
      <motion.div
        style={{ position: 'absolute', bottom: '16px', right: '20px', color: 'hsl(0, 0%, 45%)', fontSize: '12px', fontFamily: 'var(--font-display)', letterSpacing: '0.10em' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.5 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: 3, duration: 0.6 }}
      >
        {displayY}
      </motion.div>

      {/* Label beneath the monogram */}
      {size === 'hero' && (
        <motion.div
          className="absolute -bottom-10 left-0 right-0 flex justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.2, duration: 0.8 }}
        >
          <span className="font-display text-xs tracking-[0.4em] text-muted-foreground uppercase">
            Architecture · Strategy · Design
          </span>
        </motion.div>
      )}
    </div>
  );
}
