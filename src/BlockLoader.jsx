import React, { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const ACCENT = '#f0c040';
const BG_DARK = '#0a1628';
const BLOCK_COUNT = 7;

function assignDigit(column, value) {
  if (!column.current || !column.next) return;

  column.current.textContent = value;
  column.next.textContent = value;

  gsap.set(column.current, { yPercent: 0, autoAlpha: 1 });
  gsap.set(column.next, { yPercent: 100, autoAlpha: 0 });
}

function createColumnChange(column, nextValue, duration, ease) {
  const timeline = gsap.timeline();

  timeline.add(() => {
    if (!column.next) return;
    column.next.textContent = nextValue;
    gsap.set(column.next, { yPercent: 100, autoAlpha: 1 });
  }, 0);

  timeline.to(
    column.current,
    {
      yPercent: -100,
      autoAlpha: 0,
      duration,
      ease,
    },
    0,
  );

  timeline.to(
    column.next,
    {
      yPercent: 0,
      autoAlpha: 1,
      duration,
      ease,
    },
    0,
  );

  timeline.call(() => assignDigit(column, nextValue), null, duration);

  return timeline;
}

export default function BlockLoader({ onComplete }) {
  const [randomTarget] = useState(() => Math.floor(Math.random() * 81) + 10);
  const [exited, setExited] = useState(false);

  const rootRef = useRef(null);
  const shellRef = useRef(null);

  const hundredsCurrentRef = useRef(null);
  const hundredsNextRef = useRef(null);
  const tensCurrentRef = useRef(null);
  const tensNextRef = useRef(null);
  const unitsCurrentRef = useRef(null);
  const unitsNextRef = useRef(null);

  const blockRefs = useRef([]);

  const targetTens = Math.floor(randomTarget / 10).toString();
  const targetUnits = (randomTarget % 10).toString();

  useLayoutEffect(() => {
    let completionTimeout;
    let timeline;

    const ctx = gsap.context(() => {
      const columns = {
        hundreds: {
          current: hundredsCurrentRef.current,
          next: hundredsNextRef.current,
        },
        tens: {
          current: tensCurrentRef.current,
          next: tensNextRef.current,
        },
        units: {
          current: unitsCurrentRef.current,
          next: unitsNextRef.current,
        },
      };

      const blocks = blockRefs.current.filter(Boolean);

      Object.values(columns).forEach((column) => {
        if (!column.current || !column.next) return;

        column.current.textContent = '0';
        column.next.textContent = '0';

        gsap.set(column.current, { yPercent: 100, autoAlpha: 1 });
        gsap.set(column.next, { yPercent: 100, autoAlpha: 0 });
      });

      gsap.set(shellRef.current, { autoAlpha: 1, yPercent: 0 });
      gsap.set(blocks, { yPercent: 0, backgroundColor: BG_DARK });

      const introDigits = [
        columns.hundreds.current,
        columns.tens.current,
        columns.units.current,
      ];

      timeline = gsap.timeline({
        defaults: { overwrite: 'auto' },
      });

      timeline.to(introDigits, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out',
      }, 0.2);

      timeline.add(createColumnChange(columns.tens, targetTens, 0.7, 'power2.inOut'), '+=0.1');
      timeline.add(createColumnChange(columns.units, targetUnits, 0.7, 'power2.inOut'), '<+=0.08');

      // 1. Reveal 100 sequentially left to right
      timeline.add(createColumnChange(columns.hundreds, '1', 0.6, 'power2.inOut'), '+=0.25');
      timeline.add(createColumnChange(columns.tens, '0', 0.6, 'power2.inOut'), '<+=0.1');
      timeline.add(createColumnChange(columns.units, '0', 0.6, 'power2.inOut'), '<+=0.1');

      // 2. Hide other digits to prepare for zoom
      timeline.to(
        [columns.hundreds.current, columns.hundreds.next, columns.units.current, columns.units.next],
        { autoAlpha: 0, duration: 0.3, ease: 'power2.out' },
        '+=0.3'
      );

      // Fade out shell decorations (glassmorphism)
      timeline.to(
        shellRef.current,
        {
          backgroundColor: 'transparent',
          backgroundImage: 'none',
          boxShadow: 'none',
          borderColor: 'transparent',
          backdropFilter: 'none',
          duration: 0.35
        },
        '<'
      );

      // Disable overflow clipping so '0' can scale beyond container
      timeline.set('.text-container, .digit-col', { overflow: 'visible' }, '<');

      // 3. Zoom into the middle '0'
      // scale massive so the stroke of '0' becomes huge
      timeline.to(
        columns.tens.current,
        {
          scale: 60,
          duration: 1.0,
          ease: 'expo.inOut',
        },
        '<'
      );

      // Concurrently turn blocks to gold as the '0' expands to fill screen
      timeline.to(
        blocks,
        {
          backgroundColor: ACCENT,
          duration: 0.45,
          ease: 'power2.inOut',
        },
        '<+=0.25'
      );

      // Hide the scaled '0' so it's just the pure gold blocks
      timeline.set(columns.tens.current, { autoAlpha: 0 }, '<+=0.45');

      // 4. Cascade blocks FALLING DOWN
      timeline.to(
        blocks,
        {
          yPercent: 100, // Falling downwards
          duration: 0.7,
          stagger: 0.07,
          ease: 'power3.inOut',
        },
        '+=0.1'
      );

      timeline.call(() => {
        completionTimeout = window.setTimeout(() => {
          setExited(true);
          onComplete?.();
        }, 50);
      });
    }, rootRef);

    return () => {
      if (completionTimeout) window.clearTimeout(completionTimeout);
      timeline?.kill();
      ctx.revert();
    };
  }, [onComplete, targetTens, targetUnits]);

  if (exited) return null;

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          gridTemplateColumns: `repeat(${BLOCK_COUNT}, 1fr)`,
          background: 'transparent',
          overflow: 'hidden',
        }}
      >
        {Array.from({ length: BLOCK_COUNT }).map((_, index) => (
          <div
            key={index}
            ref={(element) => {
              blockRefs.current[index] = element;
            }}
            style={{
              background: BG_DARK,
              willChange: 'transform',
            }}
          />
        ))}
      </div>

      <div
        ref={shellRef}
        role="status"
        aria-live="polite"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          className="text-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.01em',
            height: '1em',
            overflow: 'hidden',
            color: ACCENT,
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(108px, 18vw, 240px)',
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: '-0.04em',
          }}
        >
          <DigitColumn className="digit-col" currentRef={hundredsCurrentRef} nextRef={hundredsNextRef} />
          <DigitColumn className="digit-col" currentRef={tensCurrentRef} nextRef={tensNextRef} />
          <DigitColumn className="digit-col" currentRef={unitsCurrentRef} nextRef={unitsNextRef} />
        </div>

        <span
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          Loading portfolio
        </span>
      </div>
    </div>
  );
}

function DigitColumn({ currentRef, nextRef, className }) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '0.58em',
        height: '1em',
        overflow: 'hidden',
      }}
    >
      <div
        ref={currentRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          willChange: 'transform, opacity',
        }}
      />

      <div
        ref={nextRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          willChange: 'transform, opacity',
        }}
      />
    </div>
  );
}
