import { useEffect, useRef } from 'react'
import { Reveal } from '../lib/util.jsx'

/* ============================================================
   RASTER PRIMITIVES — the shared pixel vocabulary of AYUSH.OS:
   dithered edges, stepped bands, 1-bit sprites, data buses,
   radar targets, bit fields, the CRT overlay.
   ============================================================ */

/* deterministic hash → 0..1, so dither patterns are stable
   across renders and rebuilds */
function hash01(a, b, c = 0) {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0
  h = (h ^ (h >> 13)) * 1274126177
  h = h ^ (h >> 16)
  return ((h >>> 0) % 1000) / 1000
}

/* ── Dithered boundary — the reference-image edge: the upper
   field disintegrates into the lower one, Bayer-style. `deep`
   stretches it into a long dissolve (the section seam is the
   only texture between two flat grounds); `spark` sprinkles a
   few accent pixels into the falloff like far-off signals. ─── */
export function DitherEdge({
  from = 'var(--obsidian)', to = 'var(--slate)',
  flip = false, seed = 3, deep = false, spark,
}) {
  const COLS = deep ? 96 : 120
  const ROWS = deep ? 16 : 6
  const CW = deep ? 15 : 12
  const CH = deep ? 10 : 8
  const cells = []
  const sparks = []
  const live = []
  for (let r = 0; r < ROWS; r++) {
    // ease the falloff so the mid-band stays sparse longer (ref look)
    const t = (r + 0.5) / ROWS
    const density = Math.pow(1 - t, deep ? 1.6 : 1)
    for (let c = 0; c < COLS; c++) {
      const h = hash01(c, r, seed)
      if (h < density) {
        cells.push(<rect key={r + '-' + c} x={c * CW} y={r * CH} width={CW} height={CH} />)
      } else if (deep && h < density + 0.02) {
        // cells sitting right on the dissolve threshold flicker in
        // and out — the boundary reads as live, unsettled memory
        live.push(<rect key={'l' + r + '-' + c} className="edge-live"
          x={c * CW} y={r * CH} width={CW} height={CH}
          style={{ '--sd': (hash01(c, r, seed + 1) * 2.4).toFixed(2) + 's' }} />)
      } else if (spark && h > 0.993 && t > 0.2 && t < 0.85) {
        // rare, small: distant signals in the dissolve, not confetti
        sparks.push(<rect key={'s' + r + '-' + c} className="edge-spark"
          x={c * CW + CW * 0.25} y={r * CH + CH * 0.2}
          width={CW * 0.55} height={CH * 0.6} fill={spark}
          style={{ '--sd': (hash01(c, r, seed + 2) * 3.2).toFixed(2) + 's' }} />)
      }
    }
  }
  return (
    <div className={'dither-edge pixel' + (flip ? ' flip' : '') + (deep ? ' deep' : '')}
      aria-hidden="true" style={{ background: to }}>
      <svg viewBox={`0 0 ${COLS * CW} ${ROWS * CH}`} preserveAspectRatio="none">
        <g fill={from}>{cells}</g>
        <g fill={from}>{live}</g>
        {sparks}
      </svg>
    </div>
  )
}

/* ── Sprites — 1-bit creatures of the machine. ── */
const SPRITE_TONES = {
  red: 'var(--red)',
  dim: 'var(--bone-dim)',
  amber: 'var(--amber)',
  trace: 'var(--trace)',
  bone: 'var(--bone)',
}

/* each sprite is rows of a coarse bitmap; '#' = tone, '+' = dim,
   '.' = empty. Cell = 4 svg units. Machine hardware only: data
   packets, punchcards, a chip, a floppy. */
const SPRITES = {
  packet: [
    '#######',
    '#gg.gg#',
    '#######',
    '#.....#',
    '#.###.#',
    '#######',
  ],
  punchcard: [
    '######.',
    '#g.g.##',
    '#.g.g.#',
    '#g.g.g#',
    '#.....#',
    '#######',
  ],
  chip: [
    '.#.#.#.',
    '#######',
    '#gg.gg#',
    '#.....#',
    '#gg.gg#',
    '#######',
    '.#.#.#.',
  ],
  floppy: [
    '######.',
    '#g..g##',
    '#g..g.#',
    '#.....#',
    '#.###.#',
    '#.###.#',
    '#######',
  ],
}

export function Sprite8({ kind = 'packet', tone = 'red', className = '', style }) {
  const c = SPRITE_TONES[tone] || tone
  const rows = SPRITES[kind] || SPRITES.packet
  const w = rows[0].length * 4
  const h = rows.length * 4
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={'sprite-8 sprite ' + className} style={style} aria-hidden="true"
      shapeRendering="crispEdges">
      {rows.map((row, y) => [...row].map((ch, x) => {
        if (ch === '.') return null
        const fill = ch === '+' ? 'rgba(234,230,223,0.35)' : ch === 'g' ? 'var(--obsidian)' : c
        return <rect key={x + '-' + y} x={x * 4} y={y * 4} width="4" height="4" fill={fill} />
      }))}
    </svg>
  )
}

/* ── Debug chip — a corner pad that materializes the build note.
   A flat diagnostic triangle with a blinking test point; no
   curling corners on this machine. ─────────────────────────── */
export function DebugChip({ label = 'BUILD NOTE', note }) {
  const wrapRef = useRef(null)
  return (
    <div className="debug-wrap" ref={wrapRef}>
      <button type="button" className="debug-corner"
        aria-label={label + ' — open'}
        onClick={() => wrapRef.current?.classList.toggle('debugged')}>
        <span className="debug-fold" />
        <span className="debug-led" aria-hidden="true" />
      </button>
      <div className="debug-note" role="note">
        <b>{label}</b>
        <p>{note}</p>
      </div>
    </div>
  )
}

/* ── Radar target — was the ring sun. Concentric squares now;
   the CSS keeps the class names. ───────────────────────────── */
const SUN_TONES = ['#D93A28', '#FF4F3B', '#FF7A3B', '#FFB800', '#FFD46A', '#EAE6DF']
const MOON_TONES = ['#27272A', '#3A3A40', '#6E6B66', '#A5A19A', '#EAE6DF']

export function RadarTarget({ className = '', style, moon = false, recessed = false }) {
  const tones = moon ? MOON_TONES : SUN_TONES
  const step = 52 / (tones.length - 1)
  return (
    <div className={'radar-target ' + (recessed ? 'recessed ' : '') + className} style={style} aria-hidden="true">
      {tones.map((t, i) => (
        <span key={i} style={{ inset: `${(i * step).toFixed(1)}%`, background: t }} />
      ))}
    </div>
  )
}

/* ── Section header ─────────────────────────────────────────
   Plain heading first, because that is what anyone scanning the
   page is actually looking for; `sub` carries the machine name
   for the same section underneath, so the conceit survives
   without standing between a reader and the content. */
export function SectionHeader({ kicker, title, sub, lede, tone = 'mono', number }) {
  return (
    <Reveal as="header" className={'sect-header tone-' + tone}>
      <div className="kicker-row">
        {number && <span className="sect-number">{number}</span>}
        <span className="kicker-tag">{kicker}</span>
      </div>
      <h2 className="sect-title"><span className="title-mark">{title}</span></h2>
      {sub && <p className="sect-sub">{sub}</p>}
      {lede && <p className="sect-lede">{lede}</p>}
    </Reveal>
  )
}

/* ── Fixed CRT overlay: scanlines + phosphor dots (CSS) ─────── */
export function CrtOverlay() {
  return <div className="crt-overlay" aria-hidden="true" />
}
