import { useEffect, useRef } from 'react'

/* ============================================================
   SIGNAL TRACES — strokes, scatters, the commit ledger and the
   pixel snake. Every mark draws itself in on scroll, frame by
   frame, and is permanent — framebuffers and source control
   agree: no undo.
   ============================================================ */

/* Document-wide filter defs. Mount once in App; every other SVG
   (and CSS filter: url(#…)) references these by id. */
export function TraceFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        {/* reserved for future shared defs — turbulence and mist
           retired with the ink era */}
      </defs>
    </svg>
  )
}

/* ── Brush underline: a single swipe that paints itself in when
   its Reveal ancestor gets `.in`. ─────────────────────────── */
const STROKE_TONES = {
  mono: 'var(--bone)',
  red: 'var(--red)',
  dim: 'var(--bone-dim)',
  amber: 'var(--amber)',
  bone: 'var(--obsidian)',
}

/* `auto` draws on load via CSS animation — for the hero and the
   pinned dive scene, which have no Reveal ancestor to trigger it. */
export function SignalStroke({ tone = 'mono', auto = false, className = '', style }) {
  const c = STROKE_TONES[tone] || tone
  return (
    <svg className={'sig-underline ' + (auto ? 'sig-auto ' : '') + className} style={style} viewBox="0 0 230 26"
      aria-hidden="true" focusable="false" shapeRendering="crispEdges">
      <path className="sig-draw" d="M4 16 H40 V10 H78 V19 H118 V8 H158 V16 H196 V12 H226" pathLength="1"
        fill="none" stroke={c} strokeWidth="6" strokeLinecap="butt" strokeLinejoin="miter"
        style={{ '--dur': '0.9s', '--dd': '0.35s' }} />
    </svg>
  )
}

/* ── The ink ledger: this build's git history painted as a
   signal ledger. Branch strokes draw themselves in; commits
   land as square marks; hover / focus / tap one to read the
   commit. ─────────────────────────────────────────────────── */
const COMMITS = [
  { x: 110, y: 216, hash: '9f21ac', msg: 'init: blank framebuffer', tone: 'var(--bone)' },
  { x: 225, y: 216, hash: 'b7e04d', msg: 'feat: scroll-solved voxel', tone: 'var(--bone)' },
  { x: 330, y: 220, hash: 'd2c518', msg: 'fix: scrub-safe matrix math', tone: 'var(--bone)' },
  { x: 470, y: 216, hash: 'e8a9b0', msg: 'style: scanline pass', tone: 'var(--bone)' },
  { x: 300, y: 133, hash: 'a1b2c3', msg: 'sprite: 1-bit bitmap set', tone: 'var(--bone-3)' },
  { x: 430, y: 124, hash: 'c4d5e6', msg: 'sprite: packet + punchcard', tone: 'var(--bone-3)' },
  { x: 545, y: 130, hash: 'e7f809', msg: 'test: frame budget passed', tone: 'var(--bone-3)' },
  { x: 505, y: 268, hash: '0ddba1', msg: 'hotfix: frame drop cleared', tone: 'var(--red-deep)' },
  { x: 668, y: 214, hash: 'f4d7aa', msg: 'merge: sprite layer aboard', tone: 'var(--bone)', big: true },
  { x: 790, y: 215, hash: 'HEAD', msg: 'ship it — you are here', tone: 'var(--bone)', head: true },
]

function CommitBlot({ c, i }) {
  const d = { '--bd': (0.7 + i * 0.13).toFixed(2) + 's' }
  const d2 = { '--bd': (0.78 + i * 0.13).toFixed(2) + 's' }
  return (
    <g className="ink-commit" tabIndex="0" role="img"
      aria-label={`Commit ${c.hash}: ${c.msg}`}
      onClick={(e) => e.currentTarget.classList.toggle('tipped')}>
      <circle className="blot-hit" cx={c.x} cy={c.y} r="20" fill="transparent" />
      {/* HEAD gets a still wet-ink halo — animating it would
          invalidate every filtered raster in this SVG per frame */}
      {c.head && (
        <rect x={c.x - 13.5} y={c.y - 13.5} width="27" height="27" fill="none"
          stroke={c.tone} strokeWidth="1.5" opacity="0.3" />
      )}
      <rect className="ink-blot" style={d}
        x={c.x - (c.big ? 10 : c.head ? 8.5 : 7)} y={c.y - (c.big ? 10 : c.head ? 8.5 : 7)}
        width={(c.big ? 10 : c.head ? 8.5 : 7) * 2} height={(c.big ? 10 : c.head ? 8.5 : 7) * 2}
        fill={c.tone} />
      <rect className="ink-blot" style={d2} x={c.x + 9} y={c.y - 9} width="4" height="4"
        fill={c.tone} opacity="0.7" />
      <rect className="ink-blot" style={d2} x={c.x - 11} y={c.y + 7} width="3" height="3"
        fill={c.tone} opacity="0.6" />
      <rect className="blot-focus" x={c.x - 13} y={c.y - 13} width="26" height="26" fill="none" strokeWidth="2.5" />
      <g className="commit-tip" transform={`translate(${c.x} ${c.y - 24})`}>
        <rect x="-95" y="-48" width="190" height="42"
          fill="var(--slate)" stroke="var(--slate-3)" strokeWidth="2" />
        <rect x="-95" y="-48" width="4" height="42" fill={c.tone} />
        <text x="-82" y="-32" fontFamily="Fragment Mono" fontWeight="800" fontSize="9.5"
          letterSpacing="1" fill={c.tone}>{c.hash}</text>
        <text x="-82" y="-16" fontFamily="Fragment Mono" fontWeight="600" fontSize="12"
          fill="var(--bone)">{c.msg}</text>
      </g>
    </g>
  )
}

export function CommitGraph() {
  const MAIN = 'M70 218 C 200 212 340 224 470 216 C 610 208 730 222 850 214'
  const FEAT = 'M225 216 C 262 160 292 136 356 130 C 428 124 500 124 558 134 C 608 143 642 172 668 212'
  const FIX = 'M420 218 C 448 256 476 268 508 268 C 548 268 580 248 610 220'
  return (
    <svg className="commit-ledger" viewBox="0 0 920 330" role="img"
      aria-label="This site's git history drawn as signal strokes: a main branch, a sprite feature branch and a frame-drop hotfix merging back in.">
      {/* the backing strip the history is drawn on */}
      <rect x="0" y="0" width="920" height="330" fill="var(--slate)" />
      <text x="42" y="44" fontFamily="Fragment Mono" fontWeight="800" fontSize="11"
        letterSpacing="3" fill="var(--bone-dim)">GIT LOG · RENDERED DAILY</text>

      {/* branch strokes — drawn in scroll order */}
      <g>
        <path className="sig-draw" d={MAIN} pathLength="1" fill="none" stroke="var(--bone)"
          strokeWidth="7" strokeLinecap="butt" style={{ '--dur': '1.6s', '--dd': '0.45s' }} />
        <path className="sig-draw" d={FEAT} pathLength="1" fill="none" stroke="var(--bone-3)"
          strokeWidth="5" strokeLinecap="butt" style={{ '--dur': '1.2s', '--dd': '1.25s' }} />
        <path className="sig-draw" d={FIX} pathLength="1" fill="none" stroke="var(--red-deep)"
          strokeWidth="4.5" strokeLinecap="butt" style={{ '--dur': '0.9s', '--dd': '1.6s' }} />
      </g>
      {/* dry-brush streaks: dropout along the stroke.
          These carry a repeating dash, so they fade in after the
          stroke lands instead of dash-drawing. */}
      <path className="ink-fade" d={MAIN} pathLength="1" fill="none" stroke="var(--slate)"
        strokeWidth="2" strokeLinecap="round" strokeDasharray="0.012 0.03"
        style={{ '--o': 0.55, '--dd': '2.05s' }} />
      <path className="ink-fade" d={FEAT} pathLength="1" fill="none" stroke="var(--slate)"
        strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.016 0.04"
        style={{ '--o': 0.45, '--dd': '2.45s' }} />

      {/* branch name tags pinned beside the strokes */}
      <g className="ink-tag">
        <g transform="translate(38 190)">
          <polygon points="0,3 52,0 50,21 2,20" fill="var(--obsidian-2)" />
          <text x="10" y="15" fontFamily="Fragment Mono" fontWeight="700" fontSize="10.5"
            fill="var(--obsidian)">main</text>
        </g>
        <g transform="translate(320 86) rotate(-2)">
          <polygon points="0,2 122,0 120,21 3,23" fill="var(--bone-3)" />
          <text x="9" y="15" fontFamily="Fragment Mono" fontWeight="700" fontSize="10"
            fill="var(--obsidian)">feat/sprite-layer</text>
        </g>
        <g transform="translate(440 282) rotate(1.5)">
          <polygon points="0,2 112,0 110,20 2,22" fill="var(--red-deep)" />
          <text x="9" y="14.5" fontFamily="Fragment Mono" fontWeight="700" fontSize="10"
            fill="var(--obsidian)">hotfix/frame-drop</text>
        </g>
        <text x="880" y="312" textAnchor="end" fontFamily="Fragment Mono" fontWeight="700"
          fontSize="10" letterSpacing="2" fill="var(--bone-dim)">10 COMMITS · 3 BRANCHES · NO UNDO</text>
      </g>

      {COMMITS.map((c, i) => <CommitBlot key={c.hash} c={c} i={i} />)}
    </svg>
  )
}

/* ── The exit stamp — a square seal pressed onto the letter:
   the program terminated cleanly. ──────────────────────────── */
export function ExitSeal({ text = 'EXIT CODE 0', sub = 'SG · MMXXVI', tone = 'var(--red)', className = '', style }) {
  return (
    <svg className={'exit-seal ' + className} style={style} viewBox="0 0 130 130" aria-hidden="true"
      shapeRendering="crispEdges">
      <g stroke={tone} fill="none">
        <rect x="5" y="5" width="120" height="120" strokeWidth="4" strokeDasharray="14 6" />
        <rect x="19" y="19" width="92" height="92" strokeWidth="2" />
      </g>
      <g fill={tone} fontFamily="'Fragment Mono', monospace">
        <text x="65" y="58" textAnchor="middle" fontWeight="700" fontSize="14" letterSpacing="1">{text}</text>
        <text x="65" y="80" textAnchor="middle" fontSize="10" letterSpacing="2" opacity="0.85">{sub}</text>
        <rect x="59" y="92" width="12" height="12" />
      </g>
    </svg>
  )
}

/* ── Pixel scatters — was the ink splash. Three dispersions of
   square debris: a burst (dense core, falloff), a drip (falling
   column), a spray (diagonal flick). Deterministic, static. ── */
const SPLASH_TONES = {
  mono: '#A5A19A',
  red: 'var(--red)',
  dim: 'var(--bone-dim)',
  amber: 'var(--amber)',
  bone: 'var(--bone)',
}

function scatterHash(a, b, k) {
  let h = (a * 2654435761 + b * 40503 + k * 97) | 0
  h = (h ^ (h >> 15)) * 1103515245
  return (((h ^ (h >> 12)) >>> 0) % 1000) / 1000
}

export function PixelScatter({ kind = 'burst', tone = 'mono', opacity = 0.12, className = '', style }) {
  const c = SPLASH_TONES[tone] || tone
  const op = Math.max(opacity, 0.28)
  const G = 8 // cell size on a 220 canvas
  const cells = []
  const seed = kind === 'burst' ? 1 : kind === 'drip' ? 2 : 3
  for (let gy = 0; gy < 27; gy++) {
    for (let gx = 0; gx < 27; gx++) {
      const x = gx * G + 2, y = gy * G + 2
      let d // density 0..1 for this cell
      if (kind === 'burst') {
        const dx = (gx - 13) / 13, dy = (gy - 13) / 13
        d = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) * 1.5)
      } else if (kind === 'drip') {
        const dx = Math.abs(gx - 13) / 6
        d = gy < 6 ? Math.max(0, 0.9 - dx) : Math.max(0, 0.7 - dx * 1.6 - (gy - 6) * 0.02)
      } else {
        const t = (gx + (26 - gy)) / 52
        const off = Math.abs(gx - (26 - gy)) / 10
        d = Math.max(0, 0.85 - off) * (0.35 + t * 0.65)
      }
      if (scatterHash(gx, gy, seed) < d * 0.55) {
        const big = scatterHash(gy, gx, seed + 7) < 0.2
        cells.push(<rect key={gx + '-' + gy} x={x} y={y} width={big ? G : G / 2} height={big ? G : G / 2} />)
      }
    }
  }
  return (
    <svg className={'pixel-scatter ' + className} style={style} viewBox="0 0 220 220" aria-hidden="true"
      shapeRendering="crispEdges">
      <g fill={c} opacity={op}>{cells}</g>
    </svg>
  )
}

/* ── A phosphor comet over the night field — a stepped pixel
   streak with a square head, keeping the trench sky alive. ─── */
export function PhosphorComet({ className = '', style }) {
  return (
    <svg className={'ink-comet ' + className} style={style} viewBox="0 0 260 120" aria-hidden="true"
      shapeRendering="crispEdges">
      <path d="M250 16 H214 V30 H178 V44 H142 V58 H108 V72 H80 V86 H62"
        fill="none" stroke="var(--bone-dim)" strokeWidth="3" opacity="0.3" />
      <rect x="52" y="90" width="10" height="10" fill="var(--bone-dim)" opacity="0.75" />
      <rect x="68" y="84" width="4" height="4" fill="var(--bone-dim)" opacity="0.5" />
    </svg>
  )
}




