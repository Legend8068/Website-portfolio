import { useEffect, useRef } from 'react'

/* ============================================================
   STATION SCENES — the five display panels in /var/builds.

   One drawing language for all of them: everything lands on an
   8-unit raster (640×480 → 80×60 cells), edges are hard, motion
   steps, shadows are 1-bit offsets rather than blurs. Arcs are
   allowed exactly where a hard staircase would read as clumsy —
   radar sweeps and iso-time rings — and nowhere else.

   Every scene is a LIVE MACHINE: it loops for as long as it is
   on screen and parks completely when it isn't. All animation
   is CSS keyed off a `.live` class so a scrolling page never
   pays for a panel nobody is looking at.
   ============================================================ */

const U = 8                    // one drawn pixel, in scene units
const W = 640
const H = 480

/* deterministic hash → 0..1, the same generator the dither edges
   and the game use, so noise is stable across renders */
function hash01(a, b) {
  let h = (a * 374761393 + b * 668265263) | 0
  h = (h ^ (h >> 13)) * 1274126177
  h = h ^ (h >> 16)
  return ((h >>> 0) % 1000) / 1000
}

/* ── live gate ─────────────────────────────────────────────
   One observer for every scene on the page; it only toggles a
   class, so nothing re-renders. */
let sharedObs = null
function observer() {
  if (!sharedObs) {
    sharedObs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('live', e.isIntersecting)),
      { rootMargin: '120px 0px' }
    )
  }
  return sharedObs
}

function useLive() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = observer()
    obs.observe(el)
    return () => obs.unobserve(el)
  }, [])
  return ref
}

function Scene({ name, label, children }) {
  const ref = useLive()
  return (
    <svg
      ref={ref}
      className={`diorama scene ${name}`}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
    >
      {children}
    </svg>
  )
}

/* ── primitives ────────────────────────────────────────────── */

/* a flat raster panel: 1-bit offset shadow, hard edge, corners
   knocked out so it reads as a drawn sprite and not a div */
function Panel({ x, y, w, h, fill = 'var(--obsidian)', edge, cap, className = '', children }) {
  return (
    <g className={className}>
      <rect x={x + U / 2} y={y + U / 2} width={w} height={h} fill="rgba(0,0,0,0.45)" />
      <rect x={x} y={y} width={w} height={h} fill={fill} />
      {edge && <rect x={x} y={y} width={w} height={U / 2} fill={edge} />}
      {cap && <rect x={x} y={y + h - U / 2} width={w} height={U / 2} fill={cap} />}
      {/* chamfer */}
      <rect x={x} y={y} width={U} height={U} fill="var(--obsidian-2)" />
      <rect x={x + w - U} y={y + h - U} width={U} height={U} fill="var(--obsidian-2)" />
      {/* a hairline edge so a panel reads against any backplane, however
          close its fill happens to sit to the ground behind it */}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="var(--slate-3)" strokeWidth="2" />
      {children}
    </g>
  )
}

/* string bitmap → rects, the same idiom as the game's sprites */
function Bmp({ rows, x = 0, y = 0, u = U, pal, className }) {
  const out = []
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const ch = rows[r][c]
      if (ch === '.' || !pal[ch]) continue
      out.push(<rect key={r + '-' + c} x={x + c * u} y={y + r * u} width={u} height={u} fill={pal[ch]} />)
    }
  }
  return <g className={className}>{out}</g>
}

/* the sparse CRT backplane every scene sits on */
function Backplane({ seed = 3, fill = 'var(--obsidian-2)' }) {
  const dots = []
  for (let i = 0; i < 26; i++) {
    const x = Math.floor(hash01(i, seed) * (W / U)) * U
    const y = Math.floor(hash01(i, seed + 40) * (H / U)) * U
    const hot = hash01(i, seed + 80) > 0.85
    dots.push(
      <rect key={i} className={'sc-noise n' + (i % 4)} x={x} y={y} width={U / 2} height={U / 2}
        fill={hot ? 'var(--red)' : 'var(--bone)'} opacity={hot ? 0.3 : 0.16} />
    )
  }
  return (
    <g aria-hidden="true">
      <rect x="0" y="0" width={W} height={H} fill={fill} />
      <g stroke="rgba(234,230,223,0.055)" strokeWidth="1">
        {Array.from({ length: W / 40 - 1 }).map((_, i) => (
          <line key={'v' + i} x1={40 + i * 40} y1="0" x2={40 + i * 40} y2={H} />
        ))}
        {Array.from({ length: H / 40 - 1 }).map((_, i) => (
          <line key={'h' + i} x1="0" y1={40 + i * 40} x2={W} y2={40 + i * 40} />
        ))}
      </g>
      {dots}
    </g>
  )
}

/* the bar that rolls down every panel — the shared tell that
   these are screens, not drawings */
function Sweep() {
  return <rect className="sc-sweep" x="0" y="-40" width={W} height="36" fill="rgba(234,230,223,0.05)" aria-hidden="true" />
}

const Mono = (p) => <text fontFamily="Fragment Mono" {...p} />

/* an orthogonal leg — transit doesn't run in straight lines */
const legTo = (ox, oy, tx, ty) => `M${ox} ${oy} H${tx} V${ty}`

/* ============================================================
   01 · SG-MEETHALFWAY — the midpoint solver
   A blocky landmass under a rotating survey sweep. Three legs
   march inward to the point that minimises the worst commute,
   and the spread readout cycles as the solver re-solves.
   ============================================================ */

/* The island is a quantised distance field, so its contours nest
   cleanly and its coast comes out ragged without hand-drawing.
   Cells are merged into horizontal runs before they become rects —
   the shape is identical, at a fraction of the node count. */
function islandCells() {
  const cols = W / U
  const rows = H / U
  const cx = 40
  const cy = 33
  const rx = 30
  const ry = 15

  const tierAt = (c, r) => {
    const dx = (c + 0.5 - cx) / rx
    const dy = (r + 0.5 - cy) / ry
    const d = Math.pow(Math.pow(Math.abs(dx), 2.3) + Math.pow(Math.abs(dy), 2.3), 1 / 2.3)
    const ragged = d + (hash01(c, r) - 0.5) * 0.09
    return ragged >= 1 ? -1 : Math.min(3, Math.floor(ragged * 4))
  }

  const tiers = [[], [], [], []]
  for (let r = 0; r < rows; r++) {
    let c = 0
    while (c < cols) {
      const t = tierAt(c, r)
      if (t < 0) { c++; continue }
      let run = 1
      while (c + run < cols && tierAt(c + run, r) === t) run++
      tiers[t].push(
        <rect key={r + '-' + c} x={c * U} y={r * U} width={run * U} height={U} />
      )
      c += run
    }
  }
  return tiers
}

const MAP_ORIGINS = [
  { x: 96, y: 344, l: 'A', tone: 'var(--red)' },
  { x: 536, y: 152, l: 'B', tone: 'var(--amber)' },
  { x: 472, y: 392, l: 'C', tone: 'var(--trace)' },
]
const MID = { x: 320, y: 264 }

export function MapScene() {
  const tiers = islandCells()
  // inner tiers read hotter, and every tone clears the backplane
  const shades = ['var(--slate-3)', 'var(--slate-2)', 'var(--slate)', 'var(--slate-deep)']
  return (
    <Scene name="sc-map" label="A raster survey map: three transit legs converging on the fairest meeting point">
      <Backplane seed={3} fill="var(--board-2)" />

      {/* the landmass, four nested signal tiers */}
      {tiers.map((cells, i) => (
        <g key={i} className={'sc-tier t' + i} fill={shades[i]}>{cells}</g>
      ))}

      {/* the three legs, permanently marching inward */}
      <g fill="none" strokeLinecap="butt">
        {MAP_ORIGINS.map((o, i) => (
          <path key={'s' + o.l} d={legTo(o.x + 4, o.y + 5, MID.x + 4, MID.y + 5)}
            stroke="rgba(0,0,0,0.4)" strokeWidth="6" />
        ))}
        {MAP_ORIGINS.map((o) => (
          <path key={o.l} d={legTo(o.x, o.y, MID.x, MID.y)} stroke={o.tone} strokeWidth="6" opacity="0.85" />
        ))}
        {MAP_ORIGINS.map((o, i) => (
          <path key={'d' + o.l} className={'sc-ants a' + (i + 1)} d={legTo(o.x, o.y, MID.x, MID.y)}
            stroke="var(--obsidian-2)" strokeWidth="2" strokeDasharray="8 16" />
        ))}
      </g>

      {/* origin blips */}
      {MAP_ORIGINS.map((o, i) => (
        <g key={o.l} className={'sc-blip b' + (i + 1)}>
          <rect x={o.x - 24} y={o.y - 24} width="48" height="48" fill="none" stroke={o.tone} strokeWidth="2" opacity="0.5" className="sc-blip-ring" />
          <rect x={o.x + 2} y={o.y + 2} width="24" height="24" fill="rgba(0,0,0,0.5)" transform={`translate(${-14},${-14})`} />
          <rect x={o.x - 12} y={o.y - 12} width="24" height="24" fill="var(--obsidian)" stroke={o.tone} strokeWidth="3" />
          <Mono x={o.x} y={o.y + 5} textAnchor="middle" fontWeight="700" fontSize="13" fill="var(--bone)">{o.l}</Mono>
        </g>
      ))}

      {/* the solution: a static crosshair */}
      <g className="sc-cross">
        <rect x={MID.x - 4} y={MID.y - 40} width="8" height="80" fill="var(--red)" />
        <rect x={MID.x - 40} y={MID.y - 4} width="80" height="8" fill="var(--red)" />
        <rect x={MID.x - 12} y={MID.y - 12} width="24" height="24" fill="var(--obsidian-2)" />
        <rect x={MID.x - 4} y={MID.y - 4} width="8" height="8" fill="var(--bone)" />
      </g>

      {/* the solver readout, re-solving forever */}
      <Panel x={32} y={32} w={232} h={64} fill="var(--slate-deep)" edge="var(--red)">
        <Mono x={52} y={62} fontSize="10.5" letterSpacing="2.4" fill="var(--bone-faint)">WORST-CASE COMMUTE</Mono>
        <g className="sc-cycle">
          <Mono className="cy c0" x={52} y={84} fontWeight="700" fontSize="17" fill="var(--amber)">Δ 04 MIN</Mono>
          <Mono className="cy c1" x={52} y={84} fontWeight="700" fontSize="17" fill="var(--amber)">Δ 02 MIN</Mono>
          <Mono className="cy c2" x={52} y={84} fontWeight="700" fontSize="17" fill="var(--amber)">Δ 01 MIN</Mono>
        </g>
        <rect className="sc-solve" x={168} y={70} width="72" height="10" fill="var(--red)" />
        <rect x={168} y={70} width="72" height="10" fill="none" stroke="var(--slate-3)" strokeWidth="2" />
      </Panel>

      <Mono x={W - 32} y={H - 28} textAnchor="end" fontSize="10" letterSpacing="2.4" fill="var(--bone-faint)">
        TRANSIT-WEIGHTED · NOT GEOMETRIC
      </Mono>
    </Scene>
  )
}

/* ============================================================
   02 · WORLD CUP TRACKER — the live board
   Three feeds land out of order; the board reconciles them into
   one state. The clock ticks, the feed scrolls, and the table
   re-sorts itself in place, forever.
   ============================================================ */

const TABLE = [
  { t: 'ARG', p: '3', pts: '7' },
  { t: 'BRA', p: '3', pts: '6' },
  { t: 'NED', p: '3', pts: '3' },
  { t: 'JPN', p: '3', pts: '1' },
]

export function BoardScene() {
  return (
    <Scene name="sc-board" label="A live match board reconciling three feeds into one state">
      <Backplane seed={5} />

      {/* the in-play scoreline */}
      <Panel x={40} y={40} w={560} h={136} fill="var(--slate)" edge="var(--red)">
        <Mono x={72} y={100} fontWeight="700" fontSize="32" fill="var(--bone)">ARG</Mono>
        <Mono x={568} y={100} textAnchor="end" fontWeight="700" fontSize="32" fill="var(--bone)">BRA</Mono>
        <text x={320} y={104} textAnchor="middle" fontFamily="Bitram, Fragment Mono" fontWeight="700"
          fontSize="40" fill="var(--amber)">2 – 1</text>
        <rect className="sc-live-dot" x={248} y={126} width="12" height="12" fill="var(--red)" />
        <Mono x={270} y={137} fontWeight="600" fontSize="12.5" letterSpacing="2" fill="var(--bone-dim)">LIVE</Mono>
        {/* the clock, ticking */}
        <g className="sc-cycle">
          <Mono className="cy c0" x={332} y={137} fontWeight="600" fontSize="12.5" letterSpacing="2" fill="var(--bone-dim)">· 74&apos;</Mono>
          <Mono className="cy c1" x={332} y={137} fontWeight="600" fontSize="12.5" letterSpacing="2" fill="var(--bone-dim)">· 75&apos;</Mono>
          <Mono className="cy c2" x={332} y={137} fontWeight="600" fontSize="12.5" letterSpacing="2" fill="var(--bone-dim)">· 76&apos;</Mono>
        </g>
        <Mono x={72} y={162} fontSize="10.5" letterSpacing="2.2" fill="var(--bone-faint)">GROUP STAGE · MATCH 0x1F</Mono>
      </Panel>

      {/* standings */}
      <Panel x={40} y={208} w={344} h={232} fill="var(--slate-deep)">
        <Mono x={64} y={240} fontWeight="600" fontSize="10.5" letterSpacing="2.6" fill="var(--bone-dim)">STANDINGS</Mono>
        {TABLE.map((row, i) => (
          <g key={row.t}>
            {i === 0 && <rect x={56} y={252 + i * 44} width="312" height="36" fill="var(--slate-2)" />}
            <Mono x={72} y={277 + i * 44} fontSize="15" fill={i === 0 ? 'var(--amber)' : 'var(--bone)'}>{row.t}</Mono>
            <Mono x={248} y={277 + i * 44} fontSize="12.5" fill="var(--bone-faint)">{row.p}</Mono>
            <text x={340} y={277 + i * 44} textAnchor="end" fontFamily="Bitram, Fragment Mono" fontWeight="700"
              fontSize="15" fill={i === 0 ? 'var(--amber)' : 'var(--bone-dim)'}>{row.pts}</text>
          </g>
        ))}
      </Panel>

      {/* the feed: packets arriving out of order, scrolling up */}
      <Panel x={408} y={208} w={192} h={232} fill="var(--slate-deep)">
        <Mono x={432} y={240} fontWeight="600" fontSize="10.5" letterSpacing="2.6" fill="var(--bone-dim)">FEED</Mono>
        <clipPath id="feedClip"><rect x={424} y={252} width="160" height="140" /></clipPath>
        <g clipPath="url(#feedClip)">
          <g className="sc-feed">
            {/* the pattern repeats every 4 rows and the scroll shifts by
                exactly 4 rows, so the loop has no seam */}
            {Array.from({ length: 12 }).map((_, i) => (
              <g key={i}>
                <rect x={424} y={252 + i * 28} width={128 - (i % 4) * 28} height="14"
                  fill={i % 4 === 0 ? 'var(--trace)' : 'var(--slate-3)'} />
                <rect x={560} y={252 + i * 28} width="14" height="14"
                  fill={i % 4 === 0 ? 'var(--amber)' : 'var(--slate-3)'} />
              </g>
            ))}
          </g>
        </g>
        <Mono x={432} y={418} fontSize="9.5" letterSpacing="1.6" fill="var(--bone-faint)">NO RELOAD</Mono>
      </Panel>

      {/* the reconcile trace: feed → table */}
      <path className="sc-pulse" d="M408 320 H392 V300 H384" fill="none"
        stroke="var(--amber)" strokeWidth="3" strokeDasharray="10 14" />
    </Scene>
  )
}

/* ============================================================
   03 · TELEGRAM TASK BOT — the parser
   One free-text line goes in; three tokens are pulled out of it
   and clocked through the parser, and a scheduled job drops out
   the bottom. Then it does it again.
   ============================================================ */

const TOKENS = [
  { k: 'INTENT', v: 'remind', tone: 'var(--red)' },
  { k: 'DATE', v: 'friday', tone: 'var(--amber)' },
  { k: 'TIME', v: '18:00', tone: 'var(--trace)' },
]

const CARDS = [
  { t: 'SUBMIT REPORT', p: 'FRI · 18:00', tone: 'var(--red)' },
  { t: 'TEAM STANDUP', p: 'DAILY · 09:30', tone: 'var(--bone-dim)' },
  { t: 'PAY INVOICE', p: 'MON · EOD', tone: 'var(--amber)' },
]

export function ParserScene() {
  return (
    <Scene name="sc-parser" label="A chat line being parsed into tokens and clocked out as scheduled jobs">
      <Backplane seed={7} />

      {/* the incoming line */}
      <Panel x={32} y={40} w={392} h={80} fill="var(--slate-deep)" edge="var(--trace)">
        <Mono x={56} y={78} fontSize="13" fill="var(--bone)">&quot;remind me to submit the</Mono>
        <Mono x={56} y={100} fontSize="13" fill="var(--bone)">report friday 6pm&quot;</Mono>
      </Panel>
      {/* the bubble tail, stepped */}
      <g fill="var(--slate-deep)">
        <rect x={72} y={120} width="24" height="8" />
        <rect x={72} y={128} width="16" height="8" />
        <rect x={72} y={136} width="8" height="8" />
      </g>

      {/* tokens pulled out of the line and clocked into the parser */}
      {TOKENS.map((t, i) => (
        <g key={t.k} className={'sc-token k' + (i + 1)}>
          <rect x={104} y={152} width="112" height="30" fill="rgba(0,0,0,0.45)" transform="translate(4,5)" />
          <rect x={104} y={152} width="112" height="30" fill="var(--slate)" />
          <rect x={104} y={152} width="112" height="4" fill={t.tone} />
          <Mono x={112} y={174} fontWeight="600" fontSize="11" letterSpacing="1.2" fill="var(--bone)">
            {t.k}
          </Mono>
        </g>
      ))}

      {/* the bus into the parser */}
      <path className="sc-ants a1" d="M216 168 H288 V216" fill="none"
        stroke="var(--trace)" strokeWidth="4" strokeDasharray="10 12" />

      {/* the parser itself */}
      <Panel x={216} y={216} w={296} h={112} fill="var(--slate)">
        <rect x={236} y={236} width="72" height="72" fill="var(--obsidian-2)" />
        {/* the stepping register — the machine actually clocking */}
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} className={'sc-reg g' + i}
            x={244 + (i % 3) * 24} y={244 + Math.floor(i / 3) * 24}
            width="16" height="16" fill="var(--amber)" />
        ))}
        <Mono x={328} y={258} fontWeight="600" fontSize="11" letterSpacing="1.6" fill="var(--bone-2)">INTENT + DATE</Mono>
        <Mono x={328} y={278} fontWeight="600" fontSize="11" letterSpacing="1.6" fill="var(--bone-faint)">PARSER · STAGE 02</Mono>
        <rect x={328} y={290} width="152" height="12" fill="var(--obsidian-2)" />
        <rect className="sc-meter" x={328} y={290} width="152" height="12" fill="var(--red)" />
      </Panel>

      {/* out to the queue */}
      <path className="sc-ants a2" d="M364 328 V360" fill="none"
        stroke="var(--trace)" strokeWidth="4" strokeDasharray="10 12" />

      {/* scheduled jobs, emitted in rotation */}
      {CARDS.map((c, i) => (
        <g key={c.t} className={'sc-card c' + (i + 1)}>
          <Panel x={40 + i * 192} y={368} w={168} h={80} fill="var(--slate-deep)" edge={c.tone}>
            <Mono x={56 + i * 192} y={404} fontWeight="600" fontSize="12.5" fill="var(--bone)">{c.t}</Mono>
            <Mono x={56 + i * 192} y={426} fontSize="10.5" letterSpacing="1" fill="var(--bone-dim)">{c.p}</Mono>
          </Panel>
        </g>
      ))}

      <Mono x={W - 32} y={36} textAnchor="end" fontSize="10" letterSpacing="2.4" fill="var(--bone-faint)">
        CHAT IS THE INTERFACE
      </Mono>
      <Sweep />
    </Scene>
  )
}

/* ============================================================
   04 · MAKANMATES — the fair-food radar
   The same fairness maths as station 01, but shipped native, so
   the whole scene lives inside a handset. Iso-time rings pulse
   outward from the venue; the legs are equal by construction.
   ============================================================ */

/* the handset sits right; the matrix that justifies its answer
   sits left, so the frame carries the idea and not just a device */
const MK_PINS = [
  { x: 396, y: 196, l: 'A' },
  { x: 548, y: 216, l: 'B' },
  { x: 452, y: 348, l: 'C' },
]
const MK_HOME = { x: 468, y: 268 }

const BOWL = [
  '.......###',
  '....###..#',
  '.###...##.',
  '.....##...',
  '...##.....',
  '..........',
  '##########',
  '.########.',
  '..######..',
  '...####...',
  '....##....',
]

/* three commutes that start wildly unequal and settle level —
   the fairness search, made literal */
/* the three settle on exactly 108 units — 180×0.6, 90×1.2, 144×0.75 —
   so "equalised" is literally true and not just nearly */
const MK_LEGS = [
  { l: 'A', from: 180, tone: 'var(--red)' },
  { l: 'B', from: 90, tone: 'var(--amber)' },
  { l: 'C', from: 144, tone: 'var(--trace)' },
]

export function MakanScene() {
  return (
    <Scene name="sc-makan" label="An Android handset resolving three friends' locations to one equally reachable food venue">
      <Backplane seed={11} />

      {/* the transit matrix — bars converge on a common length */}
      <Panel x={32} y={96} w={272} h={288} fill="var(--slate-deep)">
        <Mono x={56} y={130} fontWeight="600" fontSize="10.5" letterSpacing="2.4" fill="var(--bone-dim)">TRANSIT MATRIX</Mono>
        {MK_LEGS.map((leg, i) => (
          <g key={leg.l}>
            <Mono x={56} y={186 + i * 56} fontWeight="700" fontSize="13" fill="var(--bone)">{leg.l}</Mono>
            <rect x={80} y={172 + i * 56} width={196} height="16" fill="var(--obsidian-2)" />
            <rect className={'sc-bar q' + i} x={80} y={172 + i * 56} width={leg.from} height="16" fill={leg.tone} />
          </g>
        ))}
        <rect x={56} y={332} width="220" height="2" fill="var(--slate-3)" />
        <Mono x={56} y={362} fontWeight="700" fontSize="13" letterSpacing="1.6" fill="var(--amber)">EQUALISED · Δ 02 MIN</Mono>
      </Panel>

      {/* the handset */}
      <Panel x={336} y={40} w={264} h={400} fill="var(--slate-deep)">
        <rect x={352} y={56} width="232" height="24" fill="var(--obsidian-2)" />
        <rect className="sc-live-dot" x={360} y={64} width="8" height="8" fill="var(--red)" />
        <Mono x={376} y={73} fontSize="9.5" letterSpacing="1.6" fill="var(--bone-faint)">MAKANMATES</Mono>
        <Mono x={576} y={73} textAnchor="end" fontSize="9.5" letterSpacing="1.6" fill="var(--bone-faint)">ANDROID</Mono>
        <rect x={352} y={88} width="232" height="320" fill="var(--obsidian)" />
        <rect x={452} y={420} width="32" height="8" fill="var(--slate-3)" />
      </Panel>

      {/* the three legs — equal length by construction */}
      <g fill="none" strokeLinecap="butt">
        {MK_PINS.map((p, i) => (
          <path key={i} d={legTo(p.x, p.y, MK_HOME.x, MK_HOME.y)}
            stroke="var(--slate-3)" strokeWidth="5" />
        ))}
        {MK_PINS.map((p, i) => (
          <path key={'a' + i} className={'sc-ants a' + (i + 1)} d={legTo(p.x, p.y, MK_HOME.x, MK_HOME.y)}
            stroke="var(--amber)" strokeWidth="5" strokeDasharray="6 22" />
        ))}
      </g>

      {/* the friends */}
      {MK_PINS.map((p) => (
        <g key={p.l}>
          <rect x={p.x - 14} y={p.y - 14} width="28" height="28" fill="var(--slate)" />
          <rect x={p.x - 14} y={p.y - 14} width="28" height="28" fill="none" stroke="var(--bone-faint)" strokeWidth="2" />
          <Mono x={p.x} y={p.y + 5} textAnchor="middle" fontWeight="700" fontSize="12" fill="var(--bone)">{p.l}</Mono>
        </g>
      ))}



      {/* the fair venue */}
      <g className="sc-venue">
        <rect x={MK_HOME.x - 28} y={MK_HOME.y - 24} width="56" height="56" fill="rgba(0,0,0,0.5)" transform="translate(4,5)" />
        <rect x={MK_HOME.x - 28} y={MK_HOME.y - 24} width="56" height="56" fill="var(--red)" />
        <Bmp rows={BOWL} x={MK_HOME.x - 20} y={MK_HOME.y - 18} u={4} pal={{ '#': 'var(--obsidian-2)' }} />
      </g>

    </Scene>
  )
}

/* ============================================================
   05 · AYUSH.OS — this machine
   The station that points at itself: a terminal typing its own
   source, with CoreBot sitting on the sill watching it compile.
   ============================================================ */

const CODE = [
  [[0, 56, 'var(--red)'], [64, 88, 'var(--bone-dim)'], [160, 24, 'var(--amber)']],
  [[16, 40, 'var(--amber)'], [64, 72, 'var(--bone-3)'], [144, 96, 'var(--trace)']],
  [[16, 104, 'var(--bone-dim)'], [128, 48, 'var(--red)']],
  [[32, 72, 'var(--trace)'], [112, 128, 'var(--bone-dim)']],
  [[16, 48, 'var(--red)'], [72, 64, 'var(--amber)'], [144, 72, 'var(--bone-3)']],
  [[0, 32, 'var(--bone-dim)']],
]

const COREBOT = [
  '....#####....',
  '...#ggggg#...',
  '..#g.....g#..',
  '..#g.w.w.g#..',
  '..#g.....g#..',
  '...#g.w.g#...',
  '....#####....',
  '.....#.#.....',
  '.....w.w.....',
]

export function MachineScene() {
  return (
    <Scene name="sc-machine" label="A terminal window typing out its own source while CoreBot watches">
      <Backplane seed={13} />

      {/* the window */}
      <Panel x={64} y={56} w={512} h={344} fill="var(--obsidian)">
        {/* title bar */}
        <rect x={64} y={56} width="512" height="40" fill="var(--slate)" />
        <rect x={80} y={70} width="12" height="12" fill="var(--red)" />
        <rect x={100} y={70} width="12" height="12" fill="var(--amber)" />
        <rect x={120} y={70} width="12" height="12" fill="var(--trace)" />
        <Mono x={148} y={81} fontSize="11" letterSpacing="1.6" fill="var(--bone-dim)">ayush@os: ~/src/App.jsx</Mono>
        <Mono x={556} y={81} textAnchor="end" fontSize="10" letterSpacing="1.6" fill="var(--bone-faint)">TTY·00</Mono>

        {/* gutter */}
        <rect x={64} y={96} width="48" height="304" fill="var(--obsidian-2)" />
        {CODE.map((_, i) => (
          <Mono key={i} x={96} y={136 + i * 40} textAnchor="end" fontSize="11" fill="var(--bone-faint)">
            {String(i + 1).padStart(2, '0')}
          </Mono>
        ))}

        {/* the source, typing itself in */}
        {CODE.map((line, i) => (
          <g key={i} className={'sc-line l' + i}>
            {line.map(([dx, w, tone], j) => (
              <rect key={j} x={136 + dx} y={126 + i * 40} width={w} height="14" fill={tone} />
            ))}
          </g>
        ))}
        {/* the block cursor, parked at the end of the last line */}
        <rect className="sc-caret" x={168} y={126 + 5 * 40} width="12" height="14" fill="var(--bone)" />

        {/* the compile bar */}
        {/* stops short of the sill so it never runs under CoreBot */}
        <rect x={136} y={368} width="288" height="10" fill="var(--obsidian-2)" />
        <rect className="sc-meter" x={136} y={368} width="288" height="10" fill="var(--amber)" />
      </Panel>

      {/* CoreBot on the sill */}
      <g className="sc-bot">
        <Bmp rows={COREBOT} x={476} y={328} u={8}
          pal={{ '#': 'var(--amber)', g: 'var(--obsidian-2)', w: 'var(--bone)' }} />
        <rect className="sc-antenna" x={524} y={320} width="8" height="8" fill="var(--bone)" />
      </g>

      <Mono x={64} y={444} fontSize="10" letterSpacing="2.4" fill="var(--bone-faint)">
        NO UI KIT · NO TEMPLATE · HAND-PLACED
      </Mono>
      <Mono x={576} y={444} textAnchor="end" fontSize="10" letterSpacing="2" fill="var(--bone-faint)">
        60 Hz
      </Mono>
    </Scene>
  )
}
