import { useMemo } from 'react'

/* ============================================================
   PUNCHCARD TAPE — a teletype ribbon feeding through the uplink.

   The punches ARE the message. Earlier this encoded each letter
   as 7-bit ASCII, which is faithful to real paper tape and
   completely unreadable to anyone standing in front of it; now
   every glyph is punched as its own letterform on a 5×7 grid, so
   the holes spell the words out. Light bleeds through a punched
   cell, un-punched stock stays dark.
   ============================================================ */

const MESSAGE = "SAY HELLO · LET'S BUILD SOMETHING · OPEN A CHANNEL · "

/* 5×7 punch font. '#' is a hole; '.' is untouched stock. */
const GW = 5
const GH = 7
const FONT = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..##', '.####'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#...#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  "'": ['..#..', '..#..', '.....', '.....', '.....', '.....', '.....'],
  '·': ['.....', '.....', '.....', '..#..', '.....', '.....', '.....'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
}
const BLANK = FONT[' ']

/* one column of holes per grid column, laid out left to right */
function punch(str) {
  const cols = []
  for (const ch of str) {
    const g = FONT[ch.toUpperCase()] || BLANK
    for (let c = 0; c < GW; c++) {
      const bits = []
      for (let r = 0; r < GH; r++) bits.push(g[r][c] === '#')
      cols.push(bits)
    }
    cols.push(new Array(GH).fill(false)) // the gap between letters
  }
  return cols
}

/* deterministic jitter, so the punch brightness varies like real stock */
function hash(i) {
  return ((i * 2654435761) >>> 0) / 4294967296
}

const CELL = 6          // px per punch cell
const GAP = 3
const PITCH = CELL + GAP
const SPROCKET_R = 2.2
const TAPE_PAD_Y = 18
const FEED_MARGIN = 8
/* px/sec. Scaled with the pitch so the wider stock still reads at
   the same words-per-second as the small tape did. */
const SPEED = 50

export function PunchcardTape({ className = '' }) {
  const cols = useMemo(() => punch(MESSAGE + MESSAGE), [])

  const tapeW = cols.length * PITCH
  const gridH = GH * PITCH
  const tapeH = gridH + TAPE_PAD_Y * 2
  const halfW = tapeW / 2

  return (
    <div className={'punchcard-tape-wrap ' + className} role="img" aria-label={MESSAGE.trim()}>
      <div className="punchcard-fade-l" />
      <div className="punchcard-fade-r" />

      <div className="punchcard-scroll-container" style={{
        width: tapeW,
        height: tapeH,
        animation: `punchcard-scroll ${(halfW / SPEED).toFixed(1)}s linear infinite`,
      }}>
        <svg className="punchcard-tape-svg" width={tapeW} height={tapeH}
          viewBox={`0 0 ${tapeW} ${tapeH}`} shapeRendering="crispEdges" aria-hidden="true">
          <defs>
            <filter id="punch-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* the stock */}
          <rect x="0" y="0" width={tapeW} height={tapeH} fill="var(--slate-deep)" opacity="0.5" />
          <line x1="0" y1="1" x2={tapeW} y2="1"
            stroke="var(--bone-faint)" strokeWidth="1" opacity="0.2" strokeDasharray="4 4" />
          <line x1="0" y1={tapeH - 1} x2={tapeW} y2={tapeH - 1}
            stroke="var(--bone-faint)" strokeWidth="1" opacity="0.2" strokeDasharray="4 4" />

          {/* sprocket feed holes, both edges */}
          {cols.map((_, ci) => (
            <g key={'s' + ci}>
              <circle cx={ci * PITCH + PITCH / 2} cy={FEED_MARGIN} r={SPROCKET_R}
                fill="none" stroke="var(--bone-faint)" strokeWidth="0.6"
                opacity={0.18 + hash(ci) * 0.14} />
              <circle cx={ci * PITCH + PITCH / 2} cy={tapeH - FEED_MARGIN} r={SPROCKET_R}
                fill="none" stroke="var(--bone-faint)" strokeWidth="0.6"
                opacity={0.18 + hash(ci + 999) * 0.14} />
            </g>
          ))}

          {/* the message, punched. Only holes are drawn — an un-punched
              grid mark behind every cell muddied the letterforms and the
              whole point here is that the words can be read. */}
          {cols.map((bits, ci) =>
            bits.map((bit, ri) => {
              if (!bit) return null
              const x = ci * PITCH + GAP / 2
              const y = TAPE_PAD_Y + ri * PITCH + GAP / 2
              return (
                <g key={ci + '-' + ri}>
                  <rect x={x - 1} y={y - 1} width={CELL + 2} height={CELL + 2}
                    fill="var(--red)" opacity="0.1" filter="url(#punch-glow)" />
                  <rect x={x} y={y} width={CELL} height={CELL}
                    fill="var(--red)" opacity={0.62 + hash(ci * 7 + ri) * 0.3} />
                </g>
              )
            })
          )}
        </svg>
      </div>
    </div>
  )
}
