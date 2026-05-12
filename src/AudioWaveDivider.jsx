import React, { useEffect, useRef } from "react";

const BAR_COUNT = 40;
const BAR_COLOR = "#f0c040";
const BAR_WIDTH = 6;
const BAR_GAP = 5;
const SVG_HEIGHT = 120;
const MAX_BAR_HEIGHT = 90;
const MIN_BAR_HEIGHT = 8;

const BASE_HEIGHTS = [
  55, 70, 85, 60, 40, 75, 90, 80, 55, 35,
  65, 88, 70, 50, 30, 78, 90, 85, 60, 40,
  25, 50, 70, 88, 80, 60, 35, 65, 85, 75,
  55, 30, 60, 82, 90, 70, 45, 72, 88, 60,
];

export default function AudioWaveDivider() {
  const barsRef = useRef([]);
  const animFrameRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const animate = () => {
      timeRef.current += 0.04;
      const t = timeRef.current;

      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        // Left-to-right sweep wave
        const sweepPhase = (i / BAR_COUNT) * Math.PI * 2;
        const sweep = Math.sin(t * 1.2 - sweepPhase) * 0.5 + 0.5;
        // Per-bar unique bounce
        const bounce = Math.abs(Math.sin(t * (2.5 + (i % 5) * 0.4) + i * 0.7));
        const energy = 0.3 + sweep * 0.5 + bounce * 0.2;
        const height = Math.max(MIN_BAR_HEIGHT, Math.min(MAX_BAR_HEIGHT, BASE_HEIGHTS[i] * energy));
        const y = (SVG_HEIGHT - height) / 2;
        bar.setAttribute("height", height.toFixed(1));
        bar.setAttribute("y", y.toFixed(1));
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const svgWidth = BAR_COUNT * (BAR_WIDTH + BAR_GAP) - BAR_GAP;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: 'clamp(8px, 1.5vw, 20px) 0', userSelect: 'none' }}>
      <div style={{ width: '100%', maxWidth: '350px', padding: '0 16px' }}>
        <svg
          width="100%"
          viewBox={`0 0 ${svgWidth} ${SVG_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          {Array.from({ length: BAR_COUNT }).map((_, i) => (
            <rect
              key={i}
              ref={(el) => (barsRef.current[i] = el)}
              x={i * (BAR_WIDTH + BAR_GAP)}
              y={(SVG_HEIGHT - BASE_HEIGHTS[i]) / 2}
              width={BAR_WIDTH}
              height={BASE_HEIGHTS[i]}
              rx={BAR_WIDTH / 2}
              ry={BAR_WIDTH / 2}
              fill={BAR_COLOR}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
