import { useEffect, useRef, useState } from 'react';

export function CoreBot() {
  const [hover, setHover] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [wave, setWave] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    // Terminal cursor blink effect
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
      setTimeout(() => setBlink(true), 400);
      setTimeout(() => setBlink(false), 600);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Wave animation every 8 seconds, lasts longer (10 cycles)
    const interval = setInterval(() => {
      let count = 0;
      setWave(1);
      const waveInt = setInterval(() => {
        count++;
        setWave(count % 2 === 0 ? 1 : 2);
        if (count >= 10) {
          clearInterval(waveInt);
          setWave(0);
        }
      }, 250);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / window.innerWidth;
      const dy = (e.clientY - cy) / window.innerHeight;
      
      let ex = 0;
      let ey = 0;
      if (dx > 0.05) ex = 1;
      else if (dx < -0.05) ex = -1;
      
      if (dy > 0.05) ey = 1;
      else if (dy < -0.05) ey = -1;

      setMousePos({ x: ex, y: ey });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const w = 15;
  const h = 16;
  const frame = Array(h).fill(0).map(() => Array(w).fill('.'));

  const draw = (x, y, char) => {
    if (y >= 0 && y < h && x >= 0 && x < w) frame[y][x] = char;
  };

  // 1. Static body with long dangling legs and shoe tips
  const bodyPattern = [
    "....#######....",
    "...#g.....g#...",
    "..#g.......g#..",
    "..#g.......g#..",
    "..#g.......g#..",
    "...#g.....g#...",
    "....#######....", // hips — THIS row's base is the seat line, and
                       // .proc-core-bot-anchor pins it to the table edge
    "......#.#......", // upper legs, over the lip
    "......#.#......", // lower legs
    "......w.w......"  // shoe tips, dangling in the air
  ];
  
  // Plus design antenna
  draw(7, 0, 'p');
  draw(6, 1, 'p');
  draw(7, 1, 'p');
  draw(8, 1, 'p');
  draw(7, 2, 'p');
  
  for (let r = 0; r < bodyPattern.length; r++) {
    for (let c = 0; c < bodyPattern[r].length; c++) {
      if (bodyPattern[r][c] !== '.') draw(c, r + 3, bodyPattern[r][c]);
    }
  }

  // 2. Eyes (track cursor)
  let ex1 = 5 + mousePos.x;
  let ex2 = 9 + mousePos.x;
  let ey = 6 + mousePos.y;
  
  // Prevent eyes from shifting down into the smile when hovering
  if (hover && ey > 6) {
    ey = 6;
  }
  
  if (blink) {
    draw(ex1, ey, '_');
    draw(ex2, ey, '_');
  } else {
    draw(ex1, ey, 'w');
    draw(ex2, ey, 'w');
  }

  // 3. Mouth (tech smile on hover)
  if (hover) {
    draw(5, 7, 'w');
    draw(6, 8, 'w');
    draw(7, 8, 'w');
    draw(8, 8, 'w');
    draw(9, 7, 'w');
  } else {
    draw(6, 8, 'w');
    draw(7, 8, 'w');
    draw(8, 8, 'w');
  }

  // 4. Wave Animation (logical arm movement, doesn't overlap body)
  if (wave === 1) {
    draw(13, 6, '#');
    draw(14, 5, '#');
    draw(14, 4, '#');
  } else if (wave === 2) {
    draw(12, 4, '#');
    draw(13, 3, '#');
    draw(13, 2, '#');
  }

  return (
    <div 
      className="core-bot-wrapper" 
      style={{ display: 'flex', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}
    >
      <style>{`
        @keyframes antenna-pulse {
          0%, 100% { fill: var(--bone); filter: drop-shadow(0 0 4px var(--bone)); }
          50% { fill: var(--bone-dim); filter: none; }
        }
        .antenna-pixel {
          animation: antenna-pulse 3s ease-in-out infinite;
        }
      `}</style>
      <svg 
        ref={containerRef}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        viewBox={`0 0 ${w * 4} ${h * 4}`} 
        style={{ width: 110, height: 118, filter: 'drop-shadow(0 4px 12px rgba(255, 184, 0, 0.18))', display: 'block' }} 
        aria-hidden="true" 
        shapeRendering="crispEdges"
      >
        {/* Contact shadow: a hard line right where the hips meet the
            ledge, then a stepped falloff down the panel face behind
            the dangling legs. Stepped rather than blurred so it reads
            as part of the same raster as the sprite. */}
        <g className="core-shadow">
          <rect x="18" y="40" width="24" height="4" fill="rgba(0,0,0,0.5)" />
          <rect x="20" y="44" width="20" height="4" fill="rgba(0,0,0,0.32)" />
          <rect x="22" y="48" width="16" height="4" fill="rgba(0,0,0,0.16)" />
        </g>

        <g className="core-bot-body">
          {frame.map((row, y) => [...row].map((ch, x) => {
            if (ch === '.') return null;
            if (ch === '_') {
              return <rect key={x + '-' + y} x={x * 4} y={y * 4 + 2} width="4" height="2" fill="var(--bone)" />
            }
            if (ch === 'p') {
              return <rect key={x + '-' + y} x={x * 4} y={y * 4} width="4" height="4" className="antenna-pixel" />
            }
            
            let fill = 'var(--bone)';
            if (ch === '#') fill = 'var(--amber)';
            if (ch === 'g') fill = 'var(--obsidian-2)';
            if (ch === 'w') fill = 'var(--bone)';
            
            return <rect key={x + '-' + y} x={x * 4} y={y * 4} width="4" height="4" fill={fill} />
          }))}
        </g>
      </svg>
    </div>
  );
}
