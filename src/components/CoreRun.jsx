import { useCallback, useEffect, useRef, useState } from 'react'
import { Reveal } from '../lib/util.jsx'
import { bus } from '../lib/systemBus.jsx'

/* ============================================================
   CORERUN — /usr/games/corerun
   The offline game, ported to this machine. The desert floor is
   a line of pixel debris, the cacti are bugs and ERROR blocks,
   the pterodactyls are packet drones, and the dino is CoreBot.
   Everything is drawn on a 4-unit raster grid and snapped to
   it, so motion steps the way the rest of the OS does.
   The whole run lands in SESSION.LOG.
   ============================================================ */

/* ── world ─────────────────────────────────────────────────
   Fixed 240-unit height; width follows the element's aspect so
   wide monitors simply see more track. Everything below is in
   world units, one CELL = one drawn pixel. */
const CELL = 4
const WORLD_H = 240
const GROUND_Y = 192          // top of the ground line
const GRAVITY = 2600
const JUMP_V = 790            // apex ≈ 120 units, airtime ≈ 0.61s
const JUMP_CUT = 0.42         // release early → shorter hop
const BASE_SPEED = 300
const SPEED_CAP = 680
const HI_KEY = 'ayush.os.corerun.hi'

/* ── the fairness contract ─────────────────────────────────
   Every obstacle must be clearable from a standing start, so
   spacing is measured in ARRIVAL TIME at the bot, never in
   distance: the same gap in pixels is a different problem at
   300 u/s than at 680, and drones close faster than the floor
   scrolls. The chain of guarantees:

     land   = AIRTIME/2 after the previous obstacle clears
     launch = LEAD before the next one makes contact

   so the next leading edge can never arrive sooner than
   (AIRTIME/2 + LEAD) after the previous trailing edge — that
   sum is SEP_FLOOR and nothing is allowed under it. Difficulty
   ramps by walking SEP from SEP_OPEN down to that floor. */
const AIRTIME = (2 * JUMP_V) / GRAVITY   // 0.585s, a full-height hop
const LEAD = 0.24                        // jump must start this early
const SEP_FLOOR = AIRTIME / 2 + LEAD + 0.10  // ≈0.65s — hard minimum
const SEP_OPEN = 1.5                     // ≈opening pace, very forgiving
const RAMP = 1000                        // score at which difficulty tops out
const DRONE_SF = 1.18                    // drones outrun the floor

/* ── sprites ───────────────────────────────────────────────
   Rows of a coarse bitmap. '.' is empty; every other char is a
   palette key resolved per-sprite at draw time. */
const BOT_HEAD = [
  '.......p.......',
  '......ppp......',
  '.......p.......',
  '....#######....',
  '...#g.....g#...',
  '..#g.......g#..',
  '..#g.w...w.g#..',
  '..#g.......g#..',
  '...#g.www.g#...',
  '....#######....',
]
/* dead: both eyes cross out into 3×3 X's and the mouth goes flat */
const BOT_HEAD_DEAD = [
  '.......p.......',
  '......ppp......',
  '.......p.......',
  '....#######....',
  '...#g.....g#...',
  '..#gx.x.x.xg#..',
  '..#g.x...x.g#..',
  '..#gx.x.x.xg#..',
  '...#gwwwwwg#...',
  '....#######....',
]
/* run cycle: at any moment one leg carries the weight straight
   down while the other is bent with its foot off the floor, and
   the two swap through a neutral passing frame — so the feet
   alternate instead of both scuffing along together */
const BOT_LEGS_RUN = [
  [ // left leg planted, right knee driving up
    '......#.#......',
    '......#..s.....',
    '......s........',
  ],
  [ // passing — weight transferring, both under the hips
    '......#.#......',
    '......#.#......',
    '......s.s......',
  ],
  [ // right leg planted, left knee driving up
    '......#.#......',
    '.....s...#.....',
    '........s......',
  ],
  [ // passing again, closing the cycle
    '......#.#......',
    '......#.#......',
    '......s.s......',
  ],
]
const BOT_LEGS_IDLE = [
  '......#.#......',
  '......#.#......',
  '.....ss.ss.....',
]
const BOT_LEGS_AIR = [
  '.....#...#.....',
  '....##...##....',
  '...............',
]
const BOT_LEGS_DEAD = [
  '.....#...#.....',
  '....#.....#....',
  '...s.......s...',
]

const BUG = [
  [
    '..a...a..',
    '...bbb...',
    '..bebeb..',
    '.bbbbbbb.',
    '.b.bbb.b.',
    'l.bbbbb.l',
    '.l.....l.',
  ],
  [
    '..a...a..',
    '...bbb...',
    '..bebeb..',
    '.bbbbbbb.',
    '.b.bbb.b.',
    '.lbbbbbl.',
    'l.......l',
  ],
]

const ROACH = [
  [
    '...a.....a...',
    '....a...a....',
    '.....bbb.....',
    '....bebeb....',
    '...bbbbbbb...',
    '..bbbbbbbbb..',
    '.bbbbbbbbbbb.',
    '.b.bbbbbbb.b.',
    'l..bbbbbbb..l',
    '.l.l.....l.l.',
  ],
  [
    '...a.....a...',
    '....a...a....',
    '.....bbb.....',
    '....bebeb....',
    '...bbbbbbb...',
    '..bbbbbbbbb..',
    '.bbbbbbbbbbb.',
    '.b.bbbbbbb.b.',
    '.l.bbbbbbb.l.',
    'l..l.....l..l',
  ],
]

const DRONE = [
  [
    'ww.......ww',
    '.ww.....ww.',
    '..ppppppp..',
    '..pd.d.dp..',
    '..ppppppp..',
    '...........',
  ],
  [
    '...........',
    '..ppppppp..',
    '..pd.d.dp..',
    '..ppppppp..',
    '.ww.....ww.',
    'ww.......ww',
  ],
]

/* ── helpers ───────────────────────────────────────────────── */
const snap = (v) => Math.round(v / CELL) * CELL
const rand = (a, b) => a + Math.random() * (b - a)

/* deterministic hash → 0..1, same generator the dither edges use,
   so the background noise is stable frame to frame */
function hash01(a, b) {
  let h = (a * 374761393 + b * 668265263) | 0
  h = (h ^ (h >> 13)) * 1274126177
  h = h ^ (h >> 16)
  return ((h >>> 0) % 1000) / 1000
}

function readTokens(el) {
  const cs = getComputedStyle(el)
  const g = (n, fb) => (cs.getPropertyValue(n) || '').trim() || fb
  return {
    bone: g('--bone', '#EAE6DF'),
    boneDim: g('--bone-dim', '#A5A19A'),
    boneFaint: g('--bone-faint', '#6E6B66'),
    red: g('--red', '#FF4F3B'),
    redDeep: g('--red-deep', '#D93A28'),
    amber: g('--amber', '#FFB800'),
    amberDeep: g('--amber-deep', '#C79000'),
    obsidian: g('--obsidian-2', '#141416'),
    slate: g('--slate-3', '#3A3A40'),
    trace: g('--trace', '#7C7F8A'),
    traceDim: g('--trace-dim', '#4A4C55'),
  }
}

function blit(ctx, rows, x, y, palette) {
  const ox = snap(x)
  const oy = snap(y)
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r]
    for (let c = 0; c < row.length; c++) {
      const ch = row[c]
      if (ch === '.') continue
      const fill = palette[ch]
      if (!fill) continue
      ctx.fillStyle = fill
      ctx.fillRect(ox + c * CELL, oy + r * CELL, CELL, CELL)
    }
  }
}

/* two faces, same pair the rest of the OS uses: Bitram carries the
   numerals, Fragment Mono carries the system labels */
const MONO = '"Fragment Mono", ui-monospace, SFMono-Regular, Menlo, monospace'
const DISPLAY = '"Bitram", ' + MONO

function text(ctx, str, x, y, { size = 11, color = '#EAE6DF', align = 'left', weight = 600, face = 'mono' } = {}) {
  ctx.font = `${weight} ${size}px ${face === 'display' ? DISPLAY : MONO}`
  ctx.textAlign = align
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = color
  ctx.fillText(str, x, y)
}

const pad5 = (n) => String(Math.max(0, Math.floor(n))).padStart(5, '0')

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

/* ── the replay glyph — a loop arrow drawn on the same 4-unit
   raster as every sprite in the game, so it reads as part of
   the machine rather than an icon set ─────────────────────── */
const REPLAY = [
  '........#....',
  '.....##.##...',
  '...##...###..',
  '...#....##...',
  '..#.......#..',
  '..#.......#..',
  '..#.......#..',
  '...#.....#...',
  '...##...##...',
  '.....###.....',
]

function ReplayGlyph() {
  const cells = []
  for (let r = 0; r < REPLAY.length; r++) {
    for (let c = 0; c < REPLAY[r].length; c++) {
      if (REPLAY[r][c] === '#') {
        cells.push(<rect key={r + '-' + c} x={c * 4} y={r * 4} width="4" height="4" />)
      }
    }
  }
  return (
    <svg className="crun-replay" viewBox="0 0 52 40" shapeRendering="crispEdges" aria-hidden="true">
      <g fill="currentColor">{cells}</g>
    </svg>
  )
}

/* ── obstacle factory ──────────────────────────────────────
   Everything returns { kind, x, y, w, h, hit } where hit is the
   forgiving box; sprites draw from x,y. */
function makeObstacle(score) {
  const roll = Math.random()
  const x = 0 // placed by queueObstacle once its arrival time is known

  const canDrone = score > 320
  const canRoach = score > 560
  const canCluster3 = score > 220

  // weights shift as the run gets longer
  if (canDrone && roll > 0.72) {
    const tier = score > 620 ? Math.floor(rand(0, 3)) : Math.floor(rand(0, 2))
    // bottom-of-sprite height above the bus: must-jump, must-jump, must-NOT-jump
    const alt = [10, 42, 72][tier]
    const h = DRONE[0].length * CELL // 24
    const w = DRONE[0][0].length * CELL // 44
    const y = GROUND_Y - alt - h
    return {
      kind: 'drone', sf: DRONE_SF, x, y, w, h, tier,
      // wings are decorative — the packet body is the lethal part
      hit: { dx: 8, dy: 6, w: w - 16, h: h - 12 },
      trail: [],
    }
  }

  if (roll > 0.5) {
    // the wall obstacles — plain words on purpose, so anyone
    // reading over a recruiter's shoulder knows what they are
    const tall = score > 180 && Math.random() > 0.55
    const w = tall ? 44 : 64
    const h = tall ? 56 : 28
    return {
      kind: 'block', sf: 1, x, y: GROUND_Y - h, w, h, tall,
      label: tall ? ['CRASH'] : ['ERROR'],
      glitch: 0, glitchT: rand(0.2, 0.8), seed: Math.floor(Math.random() * 9999),
      hit: { dx: 4, dy: 4, w: w - 8, h: h - 6 },
    }
  }

  if (canRoach && roll > 0.34) {
    const w = ROACH[0][0].length * CELL // 52
    const h = ROACH[0].length * CELL // 40
    return {
      kind: 'roach', sf: 1, x, y: GROUND_Y - h, w, h,
      hit: { dx: 6, dy: 8, w: w - 12, h: h - 10 },
    }
  }

  // bug cluster
  const n = 1 + Math.floor(Math.random() * (canCluster3 ? 3 : 2))
  const bw = BUG[0][0].length * CELL // 36
  const h = BUG[0].length * CELL // 28
  const step = bw - 4
  return {
    kind: 'bug', sf: 1, x, y: GROUND_Y - h, w: step * (n - 1) + bw, h, n,
    hit: { dx: 5, dy: 8, w: step * (n - 1) + bw - 10, h: h - 12 },
  }
}

/* how hard the run is right now, 0 → 1 */
const difficulty = (score) => Math.min(1, score / RAMP)

/* seconds until an obstacle's trailing edge clears the bot's back */
const tTrail = (o, botX, v) => (o.x + o.w - (botX + 10)) / (v * o.sf)

/* Place the next obstacle so its arrival is at least SEP seconds
   after the previous one has finished passing. Because the gap is
   solved in time and then converted back to distance using THIS
   obstacle's own speed factor, a fast drone lands exactly as far
   behind as a slow bug would — the player always gets the same
   window, whatever is coming. */
function queueObstacle(g, v) {
  const o = makeObstacle(g.score)
  const d = difficulty(g.score)
  const sep = SEP_OPEN - (SEP_OPEN - SEP_FLOOR) * d
  const spread = (0.95 - 0.6 * d) * Math.random()

  const prev = g.obstacles[g.obstacles.length - 1]
  // a tall CRASH wall can only be taken with a full-height jump,
  // so the bot needs the whole airtime back before the next one
  const extra = prev && prev.kind === 'block' && prev.tall ? 0.14 : 0
  const arrive = prev
    ? tTrail(prev, g.botX, v) + sep + spread + extra
    : 2.2 // the opening obstacle always gets a long runway

  o.x = g.botX + 50 + arrive * v * o.sf
  // never pop into an occupied screen; pushing it right only ever
  // increases the separation, so the contract still holds
  o.x = Math.max(o.x, g.worldW + 30)
  g.obstacles.push(o)
}

/* ── the machine ───────────────────────────────────────────── */
function createGame() {
  return {
    phase: 'idle',      // idle | run | over
    t: 0,
    worldW: 960,
    botX: 80,
    scroll: 0,
    speed: BASE_SPEED,
    score: 0,
    hi: 0,
    botY: 0,            // height above the bus
    botV: 0,
    holding: false,
    obstacles: [],
    shake: 0,
    flash: 0,
    hiFlash: 0,
    parts: [],
    deathT: 0,
  }
}

function resetRun(g) {
  g.phase = 'run'
  g.scroll = 0
  g.speed = BASE_SPEED
  g.score = 0
  g.botY = 0
  g.botV = 0
  g.obstacles = []
  g.shake = 0
  g.flash = 0
  g.parts = []
  g.deathT = 0
}

export function CoreRun() {
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const [phase, setPhase] = useState('idle')
  const [result, setResult] = useState({ score: 0, hi: 0 })
  const [hi, setHi] = useState(0)
  const [touch, setTouch] = useState(false)

  if (!gameRef.current) gameRef.current = createGame()

  /* stored high score */
  useEffect(() => {
    let saved = 0
    try { saved = parseInt(localStorage.getItem(HI_KEY) || '0', 10) || 0 } catch (e) { saved = 0 }
    gameRef.current.hi = saved
    setHi(saved)
    setTouch(window.matchMedia('(hover: none)').matches)
  }, [])

  /* ── input ─────────────────────────────────────────────── */
  const press = useCallback(() => {
    const g = gameRef.current
    if (g.phase === 'idle') {
      resetRun(g)
      setPhase('run')
      bus.log('GAME_START', 'corerun — CoreBot on the bus')
      return
    }
    if (g.phase === 'over') {
      // a short lockout so the death keypress doesn't instantly restart
      if (g.deathT < 0.45) return
      resetRun(g)
      setPhase('run')
      bus.log('GAME_START', 'corerun — respawn')
      return
    }
    g.holding = true
    if (g.botY <= 0.01) {
      g.botV = JUMP_V
      g.botY = 0.01
    }
  }, [])

  const release = useCallback(() => {
    const g = gameRef.current
    g.holding = false
    if (g.botV > 0) g.botV *= JUMP_CUT
  }, [])

  const onKeyDown = useCallback((e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault()
      if (e.repeat) return
      press()
    }
  }, [press])

  const onKeyUp = useCallback((e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') release()
  }, [release])

  /* while a run is live the keys work even if focus drifts — a run can
     only ever begin from a focused/tapped stage, so this never steals
     the spacebar from someone who is merely scrolling past */
  useEffect(() => {
    if (phase !== 'run') return
    const d = (e) => {
      if (document.activeElement === stageRef.current) return
      onKeyDown(e)
    }
    const u = (e) => {
      if (document.activeElement === stageRef.current) return
      onKeyUp(e)
    }
    window.addEventListener('keydown', d)
    window.addEventListener('keyup', u)
    return () => {
      window.removeEventListener('keydown', d)
      window.removeEventListener('keyup', u)
    }
  }, [phase, onKeyDown, onKeyUp])

  /* ── loop ──────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    if (!canvas || !stage) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const g = gameRef.current
    const tokens = readTokens(document.documentElement)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let cssW = 0
    let cssH = 0
    let raf = 0
    let last = 0
    let visible = false

    const measure = () => {
      const r = stage.getBoundingClientRect()
      if (!r.width || !r.height) return
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      cssW = r.width
      cssH = r.height
      canvas.width = Math.round(cssW * dpr)
      canvas.height = Math.round(cssH * dpr)
      g.worldW = Math.round((WORLD_H * cssW) / cssH)
      g.botX = Math.max(52, Math.min(110, Math.round(g.worldW * 0.09)))
    }

    /* ── palettes ────────────────────────────────────────── */
    const botPal = {
      '#': tokens.amber, g: tokens.obsidian, w: tokens.bone,
      s: tokens.bone, p: tokens.bone, x: tokens.red,
    }
    const botDeadPal = { ...botPal, '#': tokens.redDeep, w: tokens.boneDim, s: tokens.redDeep }
    const bugPal = { b: tokens.redDeep, e: tokens.amber, a: tokens.red, l: tokens.red }
    const dronePal = { p: tokens.red, d: tokens.amber, w: tokens.trace }

    /* ── background: sparse CRT grid + noise ─────────────── */
    function drawBackground(g) {
      ctx.fillStyle = tokens.obsidian
      ctx.fillRect(0, 0, g.worldW, WORLD_H)

      const par = snap(g.scroll * 0.28)
      ctx.fillStyle = 'rgba(234, 230, 223, 0.035)'
      // verticals
      for (let x = -(par % 48); x < g.worldW; x += 48) {
        ctx.fillRect(snap(x), 0, 1, GROUND_Y)
      }
      // horizontals
      for (let y = 24; y < GROUND_Y; y += 32) {
        ctx.fillRect(0, y, g.worldW, 1)
      }

      // sparse phosphor noise, drifting slower still
      const npar = g.scroll * 0.12
      for (let i = 0; i < 26; i++) {
        const seed = hash01(i, 7)
        const x = ((seed * 2400 - npar) % (g.worldW + 60) + g.worldW + 60) % (g.worldW + 60) - 30
        const y = 14 + hash01(i, 11) * (GROUND_Y - 40)
        const tw = Math.sin(g.t * 1.6 + i * 1.7)
        if (tw < -0.2) continue
        ctx.fillStyle = hash01(i, 13) > 0.86
          ? `rgba(255, 79, 59, ${0.10 + tw * 0.14})`
          : `rgba(234, 230, 223, ${0.05 + tw * 0.09})`
        ctx.fillRect(snap(x), snap(y), CELL / 2, CELL / 2)
      }
    }

    /* ── the ground ──────────────────────────────────────────
       A hard line with pixel debris scattered on and under it.
       Every chip is keyed to its absolute world index, so the
       whole floor scrolls at exactly the pace of the run and
       never repeats a visible tile. */
    function drawGround(g) {
      const w = g.worldW
      ctx.fillStyle = tokens.traceDim
      ctx.fillRect(0, GROUND_Y, w, 2)
      ctx.fillStyle = tokens.amberDeep
      ctx.fillRect(0, GROUND_Y, w, 1)

      const S = 16
      const i0 = Math.floor(g.scroll / S) - 1
      const i1 = i0 + Math.ceil(w / S) + 3
      for (let i = i0; i <= i1; i++) {
        const x = snap(i * S - g.scroll)

        // bumps riding the line itself
        const h1 = hash01(i, 31)
        if (h1 < 0.13) {
          ctx.fillStyle = tokens.amberDeep
          ctx.fillRect(x, GROUND_Y - CELL, h1 < 0.045 ? CELL * 2 : CELL, CELL)
        }

        // chips and dashes in the gravel below
        const h2 = hash01(i, 47)
        if (h2 < 0.34) {
          const dy = GROUND_Y + CELL + Math.floor(hash01(i, 53) * 5) * CELL
          const long = hash01(i, 59) > 0.74
          ctx.fillStyle = h2 < 0.07 ? tokens.trace : 'rgba(124, 127, 138, 0.42)'
          ctx.fillRect(x + (i % 3) * CELL, dy, long ? CELL * 3 : CELL, CELL)
        }

        // the rare hot pixel — something down there is still live
        if (hash01(i, 67) < 0.035) {
          ctx.fillStyle = tokens.redDeep
          ctx.fillRect(x + CELL, GROUND_Y + CELL * 3, CELL, CELL)
        }
      }
    }

    /* ── obstacles ───────────────────────────────────────── */
    function drawObstacle(g, o) {
      const frame = Math.floor(g.t * 11) % 2

      if (o.kind === 'bug') {
        const step = BUG[0][0].length * CELL - 4
        for (let i = 0; i < o.n; i++) {
          blit(ctx, BUG[(frame + i) % 2], o.x + i * step, o.y, bugPal)
        }
        return
      }

      if (o.kind === 'roach') {
        blit(ctx, ROACH[frame], o.x, o.y, bugPal)
        return
      }

      if (o.kind === 'drone') {
        // phosphor trail
        for (let i = 0; i < o.trail.length; i++) {
          const p = o.trail[i]
          ctx.fillStyle = `rgba(255, 79, 59, ${0.05 + (i / o.trail.length) * 0.16})`
          ctx.fillRect(snap(p.x) + 8, snap(p.y) + 10, 12, 4)
        }
        blit(ctx, DRONE[Math.floor(g.t * 8) % 2], o.x, o.y, dronePal)
        return
      }

      // the wall blocks
      const x = snap(o.x)
      const y = snap(o.y)
      const rows = o.h / CELL

      ctx.fillStyle = tokens.slate
      ctx.fillRect(x, y, o.w, o.h)
      ctx.fillStyle = tokens.redDeep
      ctx.fillRect(x, y, o.w, CELL)
      ctx.fillRect(x, y + o.h - CELL, o.w, CELL)
      ctx.fillRect(x, y, CELL, o.h)
      ctx.fillRect(x + o.w - CELL, y, CELL, o.h)
      // chamfer the corners so it reads as a drawn sprite, not a div
      ctx.fillStyle = tokens.obsidian
      ctx.fillRect(x, y, CELL, CELL)
      ctx.fillRect(x + o.w - CELL, y, CELL, CELL)
      ctx.fillRect(x, y + o.h - CELL, CELL, CELL)
      ctx.fillRect(x + o.w - CELL, y + o.h - CELL, CELL, CELL)

      const cx = x + o.w / 2
      const ty = y + o.h / 2 + 4
      text(ctx, o.label[0], cx, ty, {
        size: o.tall ? 11 : 12, color: tokens.bone, align: 'center', weight: 700,
      })

      /* ── the corruption fit ───────────────────────────────
         When a block glitches it doesn't slide, it comes apart:
         whole scanlines tear off in opposite directions, a bar
         of the block inverts to hot red, and loose pixels boil
         out of the surface. Every value is hashed off the burst
         seed and a stepped frame counter, so the noise re-rolls
         in hard 60ms jumps instead of sliding — corruption, not
         a transition. */
      if (o.glitch > 0) {
        const f = Math.floor(o.glitch * 17)   // steps the whole burst
        const sd = o.seed

        // 1 · torn scanlines: bands of the block shifted sideways
        for (let k = 0; k < 3; k++) {
          const r = 1 + Math.floor(hash01(sd + k, f) * (rows - 2))
          const tall = 1 + Math.floor(hash01(sd + k, f + 71) * 2)
          const shift = (Math.floor(hash01(sd + k, f + 13) * 5) - 2) * CELL
          const by = y + r * CELL
          const bh = Math.min(tall * CELL, y + o.h - CELL - by)
          if (bh <= 0) continue
          // the band lifts out, leaving the gap behind it empty
          ctx.fillStyle = tokens.obsidian
          ctx.fillRect(x + CELL, by, o.w - CELL * 2, bh)
          ctx.fillStyle = hash01(sd + k, f + 29) > 0.62 ? tokens.red : tokens.slate
          ctx.fillRect(x + CELL + shift, by, o.w - CELL * 2, bh)
        }

        // 2 · one bar inverts to hot phosphor
        if (hash01(sd, f + 5) > 0.45) {
          const r = 1 + Math.floor(hash01(sd, f + 41) * (rows - 2))
          ctx.fillStyle = tokens.amber
          ctx.fillRect(x + CELL, y + r * CELL, o.w - CELL * 2, CELL)
        }

        // 3 · loose pixels boiling off the surface
        const cols = o.w / CELL
        for (let k = 0; k < 10; k++) {
          const gx = Math.floor(hash01(sd + k * 7, f + 3) * cols)
          const gy = Math.floor(hash01(sd + k * 7, f + 97) * rows)
          ctx.fillStyle = hash01(sd + k, f + 61) > 0.5 ? tokens.red : tokens.bone
          ctx.fillRect(x + gx * CELL, y + gy * CELL, CELL, CELL)
        }
      }
    }

    /* ── the operator ────────────────────────────────────── */
    function drawBot(g) {
      const dead = g.phase === 'over'
      const h = (BOT_HEAD.length + 3) * CELL
      const x = g.botX
      const y = GROUND_Y - h - g.botY
      const pal = dead ? botDeadPal : botPal

      // contact shadow, stepped — only while grounded
      if (!dead && g.botY < 60) {
        const k = 1 - g.botY / 60
        ctx.fillStyle = `rgba(0, 0, 0, ${0.42 * k})`
        ctx.fillRect(snap(x) + 12, GROUND_Y + 2, 36, CELL)
        ctx.fillStyle = `rgba(0, 0, 0, ${0.2 * k})`
        ctx.fillRect(snap(x) + 18, GROUND_Y + 2 + CELL, 24, CELL)
      }

      // the antenna never blanks — it pulses between bone and amber,
      // so the silhouette stays whole at every frame
      const head = dead
        ? pal
        : { ...pal, p: Math.floor(g.t * 1.6) % 2 ? tokens.amber : tokens.bone }
      blit(ctx, dead ? BOT_HEAD_DEAD : BOT_HEAD, x, y, head)

      let legs
      if (dead) legs = BOT_LEGS_DEAD
      else if (g.phase === 'idle') legs = BOT_LEGS_IDLE
      else if (g.botY > 0.01) legs = BOT_LEGS_AIR
      else {
        // the stride is driven by distance, not by the clock, so the
        // legs turn over faster exactly as the world speeds up
        legs = BOT_LEGS_RUN[Math.floor(g.scroll / 26) % 4]
      }
      blit(ctx, legs, x, y + BOT_HEAD.length * CELL, pal)
    }

    function botHit(g) {
      const h = (BOT_HEAD.length + 3) * CELL
      const y = GROUND_Y - h - g.botY
      return { x: g.botX + 10, y: y + 14, w: 40, h: h - 16 }
    }

    /* ── HUD ─────────────────────────────────────────────── */
    function drawHud(g) {
      const w = g.worldW
      if (g.hi > 0) {
        // beating it is the only announcement — the counter flashes amber
        const hiBlink = g.hiFlash > 0 && Math.floor(g.hiFlash * 6) % 2 === 0
        text(ctx, 'HI ' + pad5(g.hi), w - 104, 27, {
          size: 15, face: 'display', align: 'right', weight: 700,
          color: hiBlink ? tokens.amber : tokens.boneFaint,
        })
      }
      // the score blinks for a beat every 100 points
      const blink = g.flash > 0 && Math.floor(g.flash * 9) % 2 === 0
      text(ctx, pad5(g.score), w - 14, 27, {
        size: 17, face: 'display', align: 'right', weight: 700,
        color: blink ? tokens.amber : tokens.bone,
      })
    }

    /* ── update ──────────────────────────────────────────── */
    function update(g, dt) {
      g.t += dt
      if (g.flash > 0) g.flash = Math.max(0, g.flash - dt)
      if (g.hiFlash > 0) g.hiFlash = Math.max(0, g.hiFlash - dt)
      if (g.shake > 0) g.shake = Math.max(0, g.shake - dt * 3)

      // the floor holds perfectly still until the run starts — a
      // drifting ground under a standing bot reads as a treadmill
      if (g.phase === 'idle') return

      if (g.phase === 'over') {
        g.deathT += dt
        // screen space: +y is down, so gravity adds to vy
        for (const p of g.parts) {
          p.vy += 1500 * dt
          p.x += p.vx * dt
          p.y += p.vy * dt
          p.life -= dt
        }
        g.parts = g.parts.filter((p) => p.life > 0 && p.y < GROUND_Y + 8)
        return
      }

      /* running — the pace climbs smoothly the whole way up rather
         than notching, so nothing ever jumps under the player */
      g.speed = BASE_SPEED + (SPEED_CAP - BASE_SPEED) * difficulty(g.score)
      // narrower viewports see less track, so ease the pace to keep
      // the reaction window honest
      const wScale = Math.max(0.76, Math.min(1, g.worldW / 960))
      const v = g.speed * wScale
      g.scroll += v * dt

      const before = Math.floor(g.score / 100)
      g.score += (v * dt) / 6
      if (Math.floor(g.score / 100) > before) {
        g.flash = 0.7
      }

      // physics
      if (g.botY > 0 || g.botV > 0) {
        g.botV -= GRAVITY * dt
        g.botY += g.botV * dt
        if (g.botY <= 0) { g.botY = 0; g.botV = 0 }
      }

      // keep exactly one obstacle queued off-screen; its position is
      // solved against the one in front of it, so the track can never
      // assemble a pair the player has no time to answer
      const last = g.obstacles[g.obstacles.length - 1]
      if (!last || last.x < g.worldW - 20) queueObstacle(g, v)

      // move + collide
      const hb = botHit(g)
      for (const o of g.obstacles) {
        o.x -= v * o.sf * dt
        if (o.kind === 'drone') {
          o.trail.push({ x: o.x, y: o.y })
          if (o.trail.length > 5) o.trail.shift()
        }
        if (o.kind === 'block') {
          o.glitchT -= dt
          if (o.glitch > 0) o.glitch -= dt
          else if (o.glitchT <= 0) {
            o.glitchT = rand(0.5, 1.6)
            o.glitch = rand(0.14, 0.26)
            o.seed = Math.floor(Math.random() * 9999)
          }
        }
        const ob = { x: o.x + o.hit.dx, y: o.y + o.hit.dy, w: o.hit.w, h: o.hit.h }
        if (overlap(hb, ob)) die(g, o)
      }
      g.obstacles = g.obstacles.filter((o) => o.x + o.w > -60)
    }

    function die(g, o) {
      if (g.phase !== 'run') return
      g.phase = 'over'
      g.deathT = 0
      g.shake = reduced ? 0 : 1
      const score = Math.floor(g.score)
      const best = score > g.hi
      if (best) {
        g.hi = score
        g.hiFlash = 2.6
        try { localStorage.setItem(HI_KEY, String(score)) } catch (e) { /* private mode */ }
      }
      // a burst of hot pixels off the impact point
      if (!reduced) {
        const cx = g.botX + 30
        const cy = GROUND_Y - 30 - g.botY
        for (let i = 0; i < 16; i++) {
          g.parts.push({
            x: cx, y: cy,
            vx: rand(-180, 220), vy: rand(-400, -90),
            life: rand(0.45, 1),
            c: i % 3 === 0 ? tokens.amber : tokens.red,
          })
        }
      }
      setHi(g.hi)
      setResult({ score, hi: g.hi })
      setPhase('over')
      bus.log('GAME_OVER', `corerun · ${o.kind} · score ${pad5(score)}${best ? ' · NEW HI' : ''}`)
    }

    /* ── frame ───────────────────────────────────────────── */
    function draw(g) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      const s = (cssH / WORLD_H) * dpr
      const shakeX = g.shake > 0 ? Math.round(rand(-3, 3)) : 0
      const shakeY = g.shake > 0 ? Math.round(rand(-2, 2)) : 0
      ctx.setTransform(s, 0, 0, s, shakeX * s, shakeY * s)

      drawBackground(g)
      drawGround(g)
      for (const o of g.obstacles) drawObstacle(g, o)
      drawBot(g)
      for (const p of g.parts) {
        ctx.fillStyle = p.c
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6))
        ctx.fillRect(snap(p.x), snap(p.y), CELL, CELL)
        ctx.globalAlpha = 1
      }
      drawHud(g)
    }

    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      if (!last) last = now
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!cssW) measure()
      update(g, dt)
      draw(g)
    }

    const start = () => {
      if (raf) return
      last = 0
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      if (!raf) return
      cancelAnimationFrame(raf)
      raf = 0
    }

    /* canvas never triggers a font fetch on its own — ask for Bitram
       explicitly so the score isn't drawn in the fallback face */
    if (document.fonts && document.fonts.load) {
      document.fonts.load('700 17px Bitram').catch(() => {})
    }

    measure()
    const ro = new ResizeObserver(() => measure())
    ro.observe(stage)

    /* paint from the first frame — the idle scene shouldn't wait on an
       observer callback — then let the observer park the loop whenever
       the board scrolls away */
    visible = true
    if (!document.hidden) start()

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting)
        if (visible && !document.hidden) start()
        else stop()
      },
      { rootMargin: '60px 0px' }
    )
    io.observe(stage)

    const onVis = () => {
      if (document.hidden) stop()
      else if (visible) start()
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  const onPointerDown = (e) => {
    e.preventDefault()
    stageRef.current?.focus()
    press()
  }

  return (
    <Reveal className="crun-wrap" delay={1}>
      <div
        className={'crun-stage phase-' + phase}
        ref={stageRef}
        tabIndex={0}
        role="application"
        aria-label="CoreRun — a side-scrolling jump game. Press space, arrow up, or W to jump CoreBot over the bugs."
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onPointerDown={onPointerDown}
        onPointerUp={release}
        onBlur={release}
      >
        <canvas ref={canvasRef} className="crun-canvas" />

        {phase === 'idle' && (
          <div className="crun-overlay crun-idle">
            <p className="crun-cmd">$ ./corerun</p>
            <p className="crun-copy">
              CoreBot is idling on the line. Something in memory is moving.
            </p>
            <p className="crun-prompt">
              {touch ? '[ TAP TO EXECUTE ]' : '[ PRESS SPACE · ↑ · W TO EXECUTE ]'}
            </p>
          </div>
        )}

        {/* death is a pause, not a curtain: no scrim, the frozen
            frame stays readable underneath */}
        {phase === 'over' && (
          <div className="crun-overlay crun-dead">
            <p className="crun-halt">PROCESS TERMINATED</p>
            <ReplayGlyph />
          </div>
        )}
      </div>

      <p className="crun-sr" aria-live="polite">
        {phase === 'over' ? `Process terminated. Score ${Math.floor(result.score)}. High score ${result.hi}. Press space to play again.` : ''}
      </p>

      <div className="crun-legend">
        <span className="crun-leg"><b>JUMP</b> SPACE / ↑ / W · hold for height</span>
        <span className="crun-leg"><b>HAZARDS</b> bugs · error blocks · packet drones</span>
        <span className="crun-leg"><b>HI</b> {pad5(hi)}</span>
        <span className="crun-leg crun-leg-note">every run is written to SESSION.LOG</span>
      </div>
    </Reveal>
  )
}
