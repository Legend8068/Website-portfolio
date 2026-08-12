import { useCallback, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { clamp, lerp } from '../lib/util.jsx'
import { CUBELETS, cubeMatrices, FACE_COLORS } from '../lib/cube.js'
import { SignalStroke } from './Trace.jsx'
import { CoreBot } from './CoreBot.jsx'

gsap.registerPlugin(ScrollTrigger)

const FACES = ['front', 'back', 'up', 'down', 'left', 'right']
const isOuter = (c, f) =>
  (f === 'front' && c.z === 1) || (f === 'back' && c.z === -1) ||
  (f === 'up' && c.y === -1) || (f === 'down' && c.y === 1) ||
  (f === 'left' && c.x === -1) || (f === 'right' && c.x === 1)

/* seg — 0→1 progress within [a,b] */
const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1)

/* ============================================================
   KERNEL DIVE — descend through the protection rings.
   Five punched sheets are the CPU privilege rings (USER SPACE
   down to MICROCODE). The scroll drops the camera through them
   to a voxel core that assembles, coheres, then FORKS into the
   nine processes of the operator's process table.
   ============================================================ */


/* ============================================================
   PROCESS TABLE — nine processes forked from one core.
   ============================================================ */
const TILES = [
  { role: 'Part-Time Tutor', org: 'MathVision', year: '2025–NOW', icon: 'cap', featured: true,
    detail: 'Tutor physics and maths one-on-one and in small groups, helping students rebuild core concepts and prepare for exams.' },
  { role: 'Club Treasurer', org: 'Tchoukball Club · SUTD', year: '2025–NOW', icon: 'ledger',
    detail: 'Handling all finance planning as well as general planning for training and welfare purposes.' },
  { role: 'Events & Welfare Director', org: 'Student Government', year: '2025', icon: 'flag',
    detail: 'Planning and executing welfare events for the community including treasure hunts and the SUTD Student Organisation Showcase.' },
  { role: 'Maritime Hackathon', org: 'NUS', year: '2025', icon: 'anchor',
    detail: 'Produced an analytics and dashboard solution for visualising different statistics for maritime companies.' },
  { role: 'CatalystX Startathon', org: 'NTU', year: '2024', icon: 'bulb', featured: true,
    detail: 'Won $200 for the Most Creative Idea for a biofuels startup concept aimed at making sustainable fuels more prevalent in daily life.' },
  { role: 'SIM UOL CSSC Hackathon', org: 'SIM', year: '2024', icon: 'code',
    detail: 'Designed and built a 3 level maze running and combat game within the hackathon timeframe.' },
  { role: 'What The Hack', org: 'SUTD', year: '2025', icon: 'bolt',
    detail: 'Produced a solution combining hardware and software to solve a medical related issue, producing an automated medicine pill box dispenser.' },
  { role: 'Crackerjack Convention', org: 'SUTD', year: '2023', icon: 'cards',
    detail: 'Facilitated the Crackerjack Convention, a multi disciplinary event bringing together innovators, designers, and engineers to collaborate and tackle real world 21st century challenges with creative solutions.' },
  { role: 'Biodiversity Conservation', org: 'ACCB · Cambodia', year: '2023', icon: 'leaf',
    detail: 'Worked with Angkor Centre for Conservation of Biodiversity in Siem Reap for the rehabilitation and conservation of endangered species.' },
]

function TileIcon({ kind }) {
  const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'square', strokeLinejoin: 'miter' }
  switch (kind) {
    case 'cap': return <svg viewBox="0 0 24 24" {...P}><path d="M2 9.5 12 5l10 4.5-10 4.5L2 9.5Z"/><path d="M6.5 11.5v4.2c0 1.2 2.5 2.6 5.5 2.6s5.5-1.4 5.5-2.6v-4.2"/><path d="M22 9.5v5"/></svg>
    case 'ledger': return <svg viewBox="0 0 24 24" {...P}><rect x="5" y="3.5" width="14" height="17"/><path d="M9 3.5v17M12.5 8h3.5M12.5 11.5h3.5"/></svg>
    case 'flag': return <svg viewBox="0 0 24 24" {...P}><path d="M6 21V4"/><path d="M6 5h11l-2.5 3.5L17 12H6"/></svg>
    case 'anchor': return <svg viewBox="0 0 24 24" {...P}><circle cx="12" cy="5.5" r="2.2"/><path d="M12 7.7V20M5 13c0 4 3.5 7 7 7s7-3 7-7"/><path d="M9 10h6"/></svg>
    case 'bulb': return <svg viewBox="0 0 24 24" {...P}><path d="M8.5 15.5a5.6 5.6 0 1 1 7 0c-.9.8-1.3 1.5-1.4 2.5h-4.2c-.1-1-.5-1.7-1.4-2.5Z"/><path d="M10 20.5h4"/></svg>
    case 'code': return <svg viewBox="0 0 24 24" {...P}><path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13 5.5l-2.5 13"/></svg>
    case 'bolt': return <svg viewBox="0 0 24 24" {...P}><path d="M13 3 5.5 13.5H11L10 21l7.8-11H12.4L13 3Z"/></svg>
    case 'cards': return <svg viewBox="0 0 24 24" {...P}><rect x="4" y="6" width="9" height="13" transform="rotate(-8 8.5 12.5)"/><rect x="11" y="5" width="9" height="13" transform="rotate(9 15.5 11.5)"/></svg>
    case 'leaf': return <svg viewBox="0 0 24 24" {...P}><path d="M5 19C5 9.5 10.5 4.5 19.5 4.5 19.5 14 14 19 5 19Z"/><path d="M5 19c3-5.5 7-9.5 11-12"/></svg>
    default: return null
  }
}

/* ── the dive's timeline, in one place so the order is provable ──
   The scan must FINISH before the solve starts, the solve before the
   cube flattens, and the cube must be perfectly face-on before the
   flat tiles fade up on top of it — otherwise the 3D→2D handoff
   shows a seam. Every stage below is strictly ordered. */
/* The cube owns the first CUBE_END of the runway and the rest PANS the
   process table upward inside the pin — the grid is now taller than one
   screen, so the bottom row is reached by scrolling on, without ever
   leaving the section. Every cube stage is written as its original
   fraction and scaled by s(), so lengthening the runway for the pan
   leaves the cube's pacing exactly as it was. */
const CUBE_END = 0.82
const s = (v) => +(v * CUBE_END).toFixed(4)
const T = {
  scan:   [s(0.03), s(0.34)],   // raster sweep, bottom-right → top-left
  solve:  [s(0.38), s(0.58)],   // ... then the quarter-turns
  drift:  [s(0.05), s(0.56)],   // scale up + settle out of the tilt
  faceOn: [s(0.58), s(0.66)],   // square to camera — flat by then
  appear: [s(0.66), s(0.695)],  // tiles fade up ON the flat face
  swap:   s(0.70),              // cube hides, fully occluded by tiles
  fly:    [s(0.70), s(0.86)],   // voxels fly to their slots, still square
  unfold: [s(0.88), s(0.945)],  // ONLY THEN do they unfold into cards
  copy:   [s(0.95), s(0.995)],  // ... and only then does the copy pixel in
  head:   [s(0.90), s(0.97)],   // the section heading
  bot:    [s(0.90), s(0.98)],   // the core bot takes its seat
  pan:    [CUBE_END, 1],        // ... then the table pans to its foot
}

/* the machine's five-frame pixel materialise, reused for the card copy */
const DITHER = ['var(--dm1)', 'var(--dm2)', 'var(--dm3)', 'var(--dm4)']

export function KernelDive() {
  const runwayRef = useRef(null)
  const pinRef = useRef(null)
  const stageRef = useRef(null)
  const floatRef = useRef(null)
  const cubeRef = useRef(null)
  const cubeletRefs = useRef([])
  const botRailRef = useRef(null)
  const stageNameRef = useRef(null)
  const expLayerRef = useRef(null)
  const expHeadRef = useRef(null)
  const expGridRef = useRef(null)
  const botRef = useRef(null)
  const tileRefs = useRef([])
  const geom = useRef({ pitch: 60, tile: 56, persp: 1000, cx: 0, cy: 0, grid: [] })

  /* ── sizing + grid measurement ─────────────────────────── */
  const measure = useCallback(() => {
    const pin = pinRef.current, stage = stageRef.current, cube = cubeRef.current
    if (!pin || !stage || !cube) return
    const pr = pin.getBoundingClientRect()
    const minDim = Math.min(pr.width, pr.height)
    const tile = Math.round(clamp(minDim * 0.15, 42, 104))
    const gap = Math.max(4, Math.round(tile * 0.075))
    const pitch = tile + gap
    const persp = pitch * 5.4
    stage.style.perspective = persp + 'px'
    cube.style.setProperty('--tile', tile + 'px')
    const grid = tileRefs.current.map((el) => {
      el.style.transform = 'none'
      const r = el.getBoundingClientRect()
      return {
        x: r.left + r.width / 2 - pr.left,
        y: r.top + r.height / 2 - pr.top,
        w: r.width, h: r.height,
      }
    })
    const cr = cube.getBoundingClientRect()
    const cx = cr.left - pr.left
    const cy = cr.top - pr.top
    stage.style.perspectiveOrigin = `${cx}px ${cy}px`

    /* how far the table overflows one screen — the distance the pan
       has to travel so the last row clears the bottom edge */
    let panMax = 0
    const layer = expLayerRef.current
    if (layer) {
      const prev = layer.style.transform
      layer.style.transform = 'none'
      panMax = Math.max(0, layer.scrollHeight - pr.height)
      layer.style.transform = prev
    }
    geom.current = { pitch, tile, persp, cx, cy, grid, panMax }
  }, [])

  /* ── the descent, drawn from scroll progress ───────────── */
  const draw = useCallback((p) => {
    const { pitch, tile, persp, cx, cy, grid } = geom.current

    // 1. SCAN: a raster line travels bottom-right → top-left across the
    //    lattice. A voxel is nothing until the line reaches it, flares
    //    hot for one beat as the line crosses, then stands solid behind
    //    it. No dithering — the sweep is the whole effect, and it runs
    //    to completion before a single turn happens.
    const scan = seg(p, T.scan[0], T.scan[1])
    const q = seg(p, T.solve[0], T.solve[1])
    const mats = cubeMatrices(q, pitch)
    const BAND = 0.13                      // width of the hot leading edge
    cubeletRefs.current.forEach((el, i) => {
      if (!el) return
      const c = CUBELETS[i]
      el.style.transform = mats[i]
      // +x is screen-right, +y is screen-down, so (x + y) = +2 is the
      // bottom-right corner — first to wake — and −2 the top-left, last.
      // Nearer voxels (z = +1) lead their diagonal so the line wraps
      // around the volume instead of cutting it flat.
      const rank = ((2 - (c.x + c.y)) + (1 - c.z) * 0.3) / 4.6
      const d = scan - rank * (1 - BAND)
      // 0 hidden · 1 hot (the line is on it) · 2 solid
      const level = d <= 0 ? '0' : d < BAND ? '1' : '2'
      if (el.dataset.av !== level) el.dataset.av = level
    })

    // SWAP: the instant the flat, face-on cube is fully covered by the
    //   nine opaque tiles. Their skin is pixel-identical to the cube's
    //   front stickers, so the takeover is imperceptible — from here the
    //   3D face IS the 2D tiles, and it flows apart into the grid. The
    //   cube never dissolves; it is simply hidden while occluded.
    const SWAP = T.swap
    const drift = seg(p, T.drift[0], T.drift[1])
    const faceOn = seg(p, T.faceOn[0], T.faceOn[1])
    const rx = lerp(-26, -13, drift) * (1 - faceOn)
    const ry = lerp(-34, -17, drift) * (1 - faceOn)
    const k = lerp(0.42, 1, seg(p, 0.06, T.drift[1])) * lerp(1, 1.12, faceOn)
    if (cubeRef.current) {
      cubeRef.current.style.transform = `scale3d(${k.toFixed(4)},${k.toFixed(4)},${k.toFixed(4)}) rotateX(${rx}deg) rotateY(${ry}deg)`
    }
    if (floatRef.current) {
      floatRef.current.style.setProperty('--bob', String(1 - drift))
      // The cube is hidden ONLY once the tiles above it are fully opaque
      // and pixel-aligned to its flat face. Nothing cross-fades: the swap
      // happens entirely behind cover, so there is no seam to catch.
      floatRef.current.style.visibility = p >= SWAP ? 'hidden' : ''
    }

    // 4. FLOW INTO 2D: the tiles fade up over the still-opaque flat face
    //    (identical skin → no visible change), then flow outward from the
    //    tight face cluster to their process-grid slots as the cube hides.
    const appear = seg(p, T.appear[0], T.appear[1])
    const fly = seg(p, T.fly[0], T.fly[1])
    // one clock for every card, started only after the last one lands
    const u = seg(p, T.unfold[0], T.unfold[1])
    const unfold = u * u * (3 - 2 * u)
    const copyP = seg(p, T.copy[0], T.copy[1])
    const zPlane = pitch + tile / 2
    const kT = 1.12
    const f = persp / (persp - kT * zPlane)
    const srcSize = kT * tile * f
    tileRefs.current.forEach((el, i) => {
      if (!el || !grid[i]) return
      const col = (i % 3) - 1
      const row = Math.floor(i / 3) - 1
      const sx = cx + kT * col * pitch * f
      const sy = cy + kT * row * pitch * f
      const g = grid[i]
      const ti = clamp((fly - i * 0.03) / (1 - 8 * 0.03), 0, 1)
      const e = ti < 1 ? 1 - Math.pow(1 - ti, 3) : 1
      const dx = (sx - g.x) * (1 - e)
      const dy = (sy - g.y) * (1 - e)
      /* The card is NOT scaled to the cube face — a 379×238 cell squashed
         into a square voxel distorts every glyph and instantly reads as a
         different section. Instead the card keeps its true proportions and
         its INNER panel travels as a square exactly the size of the voxel
         it replaced, only growing out to fill the cell once the flight has
         all but settled. Uniform, undistorted, seamless. */
      // a whisper of settle-rotation — flow into place, not a tumble
      const rot = (((i * 37) % 7) - 3) * (1 - e) * 0.5
      el.style.opacity = String(appear)
      el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`

      /* The inner panel IS the voxel: a square of exactly srcSize that
         rides along undistorted. It unfolds on a SINGLE GLOBAL clock that
         starts only once every tile has landed — unfolding per-tile meant
         early arrivals ballooned to full height while their neighbours
         were still in transit, and the grown cards overlapped the ones
         behind them. Nothing changes size while anything is still moving. */
      const inner = el.querySelector('.tile-inner')
      if (inner) {
        if (unfold >= 1) {
          // hand control back to CSS (inset:0) so hover behaves normally
          inner.style.left = inner.style.top = inner.style.width = inner.style.height = ''
        } else {
          const w = lerp(srcSize, g.w, unfold)
          const h = lerp(srcSize, g.h, unfold)
          inner.style.left = ((g.w - w) / 2).toFixed(1) + 'px'
          inner.style.top = ((g.h - h) / 2).toFixed(1) + 'px'
          inner.style.width = w.toFixed(1) + 'px'
          inner.style.height = h.toFixed(1) + 'px'
        }
      }
      // the red voxel skin melts off exactly as the card unfolds
      const sticker = el.querySelector('.tile-sticker')
      if (sticker) sticker.style.opacity = String(1 - unfold)

      /* the copy materialises last, in the machine's five held frames */
      const copy = el.querySelector('.tile-copy')
      if (copy) {
        const lvl = Math.round(copyP * 5)
        copy.style.opacity = lvl === 0 ? '0' : '1'
        const m = lvl >= 5 ? 'none' : DITHER[lvl - 1]
        if (copy.style.maskImage !== m) {
          copy.style.webkitMaskImage = m
          copy.style.maskImage = m
        }
      }
    })
    if (expLayerRef.current) {
      // the table is a taller-than-screen panel now: once the tiles have
      // landed, PAN it up so the bottom row can be scrolled to inside the pin
      const pan = seg(p, T.pan[0], T.pan[1])
      const shift = (geom.current.panMax || 0) * pan
      expLayerRef.current.style.transform = `translateY(${(-shift).toFixed(1)}px)`
      expLayerRef.current.style.pointerEvents = p > T.fly[0] ? 'auto' : 'none'
    }
    if (expHeadRef.current) {
      const h = seg(p, T.head[0], T.head[1])
      expHeadRef.current.style.opacity = String(h)
      expHeadRef.current.style.transform = `translateY(${18 * (1 - h)}px)`
    }
    if (botRef.current) {
      const b = seg(p, T.bot[0], T.bot[1])
      botRef.current.style.opacity = String(b)
      botRef.current.style.transform = `translateY(${14 * (1 - b)}px)`
    }

    // 5. rails
    const stageName =
      p < T.solve[0] ? 'RASTERIZING' :
      p < T.faceOn[0] ? 'SCHEDULING' :
      p < T.swap ? 'COHERENT' :
      p < T.fly[1] ? 'FLOWING' : 'PROC TABLE'
    if (stageNameRef.current && stageNameRef.current.textContent !== stageName) {
      stageNameRef.current.textContent = stageName
    }
    if (botRailRef.current) botRailRef.current.style.setProperty('--p', p.toFixed(4))
  }, [])

  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    measure()
    if (reduced) {
      runwayRef.current?.classList.add('reduced')
      draw(1)
      return
    }
    draw(0)

    const proxy = { p: 0 }
    const tween = gsap.to(proxy, {
      p: 1,
      ease: 'none',
      onUpdate: () => draw(proxy.p),
      scrollTrigger: {
        trigger: runwayRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.55,
      },
    })
    const onResize = () => { measure(); draw(proxy.p) }
    window.addEventListener('resize', onResize)

    const onPointer = (e) => {
      if (proxy.p > 0.45) return
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      if (stageRef.current) {
        stageRef.current.style.transform = `rotateY(${nx * 4}deg) rotateX(${-ny * 3}deg)`
      }
    }
    const fine = window.matchMedia('(pointer: fine)').matches
    if (fine) window.addEventListener('pointermove', onPointer, { passive: true })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      window.removeEventListener('resize', onResize)
      if (fine) window.removeEventListener('pointermove', onPointer)
    }
  }, [measure, draw])

  return (
    <section id="kernel" className="hero-runway" ref={runwayRef}>
      <div className="hero-pin" ref={pinRef}>

        {/* the deep: what waits at ring 0 */}
        <div className="ap-field" aria-hidden="true">
        </div>

        {/* the core, down inside the rings */}
        <div className="cube-stage" ref={stageRef} aria-hidden="true">
          <div className="cube-float" ref={floatRef}>
            <div className="cube" ref={cubeRef}>
              {CUBELETS.map((c, i) => (
                <div key={c.id} className="cubelet" ref={(el) => { cubeletRefs.current[i] = el }}>
                  {FACES.map((fc) => (
                    <div key={fc} className={'cf ' + fc + (isOuter(c, fc) ? ' sticker' : '')}
                      style={isOuter(c, fc) ? { '--sticker': FACE_COLORS[fc] } : undefined} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* the process table: experiences forked into rows */}
        <div className="proc-layer" ref={expLayerRef}>
          <div className="proc-head" ref={expHeadRef}>
            <span className="kicker-tag">SECTOR 03 · EXPERIENCE</span>
            <h2>Experience<span className="accent">.</span></h2>
            <p className="sect-sub">Process table</p>
            <SignalStroke auto tone="amber" className="proc-ink" />
            <p>Hackathons, competitions and the roles that taught me most. Click any tile to open it.</p>
          </div>
          <div className="proc-grid" id="proctable" ref={expGridRef} style={{ position: 'relative' }}>
            {/* perched on the table's top-right corner — see the
                .proc-core-bot-anchor rule for how the seat line is
                pinned to the grid edge */}
            <div ref={botRef} className="core-bot-perch proc-core-bot-anchor">
              <CoreBot />
            </div>
            {[0, 1, 2].map((r) => (
              <div key={r} className={'proc-row d' + (r + 1)}>
                {TILES.slice(r * 3, r * 3 + 3).map((t, c) => {
                  const i = r * 3 + c
                  return (
                    <article
                      key={t.role}
                      className={'proc-tile' + (t.featured ? ' featured' : '')}
                      ref={(el) => { tileRefs.current[i] = el }}
                      tabIndex={0}
                      onClick={(e) => e.currentTarget.classList.toggle('open')}
                    >
                      <div className="tile-inner notch-br">
                        {/* the copy is masked in as one block, after the
                            card has finished unfolding */}
                        <div className="tile-copy">
                          <span className="tile-icon"><TileIcon kind={t.icon} /></span>
                          <h3 className="tile-role">{t.role}</h3>
                          <p className="tile-org">{t.org} · {t.year}</p>
                          <div className="tile-detail"><p>{t.detail}</p></div>
                        </div>
                        <span className="tile-sticker" aria-hidden="true" />
                      </div>
                    </article>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
