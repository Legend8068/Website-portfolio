import { useRef, useState } from 'react'
import { Reveal } from '../lib/util.jsx'
import { SectionHeader } from './Machine.jsx'
import { CommitGraph } from './Trace.jsx'
import { MonitorFrame } from './MonitorFrame.jsx'
import { CoreBot } from './CoreBot.jsx'
import { warpTo } from './Warp.jsx'
import { bus } from '../lib/systemBus.jsx'
import { TECHS, BUILD_BY_SLUG, buildsUsing } from '../lib/registry.js'

/* ============================================================
   MEMORY MAP — the motherboard. Every technology is a chip
   soldered onto the board at a real address, wired to the
   AYUSH CORE socket by copper traces. Hover a chip: its trace
   goes live and every DEPLOYED BUILD that links it lights up.
   Click a chip: the build list filters to it. No card grid
   survives down here.
   ============================================================ */

const BOARD_W = 1200
const BOARD_H = 640
const CORE = { x: 600, y: 320, s: 84 }

/* ROUTES — every chip owns a private lane (the x of its vertical
   run) and a private pin on the core socket, so no two traces ever
   share a segment. Previously all six chips per side collapsed onto
   one bend line, which stacked the traces and drove that line
   straight through the chips sitting on it.

   The lanes NEST: the chip furthest from the core's row takes the
   innermost lane and the socket pin nearest the corner. That is the
   ordering which makes an orthogonal fan-in cross-free — an outer
   chip's approach always clears under the verticals inside it.
   Above/below pairs may share a lane x because their vertical spans
   never overlap. Every lane also sits clear of every chip body. */
const ROUTE = {
  /* left bank — four above the core's row, four below */
  react:      { lane: 45.5, pin: 44.0 },
  nextjs:     { lane: 44.0, pin: 45.6 },
  typescript: { lane: 42.5, pin: 47.2 },
  javascript: { lane: 41.0, pin: 48.8 },
  python:     { lane: 41.0, pin: 51.2 },
  java:       { lane: 42.5, pin: 52.8 },
  nodejs:     { lane: 44.0, pin: 54.4 },
  express:    { lane: 45.5, pin: 56.0 },
  /* right bank — mirrored */
  threejs:    { lane: 54.5, pin: 44.0 },
  gsap:       { lane: 56.0, pin: 45.6 },
  leaflet:    { lane: 57.5, pin: 47.2 },
  'telegram-api': { lane: 59.0, pin: 48.8 },
  firebase:   { lane: 59.0, pin: 51.2 },
  sqlite:     { lane: 57.5, pin: 52.8 },
  vite:       { lane: 56.0, pin: 54.4 },
  git:        { lane: 54.5, pin: 56.0 },
}

/* orthogonal trace from a chip to its own socket pin: horizontal
   out to the lane, vertical along it, then a short run into the
   core edge. Deterministic, crisp, no curves. */
function tracePath(t) {
  const px = (t.x / 100) * BOARD_W
  const py = (t.y / 100) * BOARD_H
  const r = ROUTE[t.id]
  const lx = (r.lane / 100) * BOARD_W
  const pinY = (r.pin / 100) * BOARD_H
  const edge = px < CORE.x ? CORE.x - CORE.s / 2 : CORE.x + CORE.s / 2
  return {
    d: `M ${px} ${py} H ${lx} V ${pinY} H ${edge}`,
    via: { x: lx, y: py },
    via2: { x: lx, y: pinY },
  }
}

function Chip({ t, onHover }) {
  const inBuilds = buildsUsing(t.id)
  return (
    <button
      type="button"
      className="mem-chip"
      data-tech-id={t.id}
      data-in-builds={inBuilds.join(' ')}
      style={{ left: t.x + '%', top: t.y + '%' }}
      onMouseEnter={() => { bus.setTechHighlight(t.id); onHover(t) }}
      onMouseLeave={() => { bus.setTechHighlight(null); onHover(null) }}
      onFocus={() => { bus.setTechHighlight(t.id); onHover(t) }}
      onBlur={() => { bus.setTechHighlight(null); onHover(null) }}
      onClick={() => {
        bus.set({ buildFilter: t.id })
        bus.log('FILTER_SET', t.id)
        warpTo('#builds')
      }}
      aria-label={`${t.name} at address ${t.addr} — used in ${inBuilds.length} build${inBuilds.length === 1 ? '' : 's'}`}
    >
      <span className="chip-pins top" aria-hidden="true"><i /><i /><i /><i /></span>
      <span className="chip-body">
        <i className="chip-led" aria-hidden="true" />
        <b className="chip-name">{t.name}</b>
        <span className="chip-addr">{t.addr}</span>
      </span>
      <span className="chip-pins bot" aria-hidden="true"><i /><i /><i /><i /></span>
    </button>
  )
}

/* Big-O side panel — complexity curves on the scope */
function BigOStreams() {
  const curves = [
    { d: 'M40 240 L560 240', label: 'O(1)', tone: 'var(--bone-dim)', cls: 's1' },
    { d: 'M40 236 C160 220 320 208 560 196', label: 'O(log n)', tone: 'var(--trace)', cls: 's2' },
    { d: 'M40 232 L560 130', label: 'O(n)', tone: 'var(--amber)', cls: 's3' },
    { d: 'M40 228 C200 210 400 150 560 74', label: 'O(n log n)', tone: 'var(--red)', cls: 's4' },
    { d: 'M40 224 C260 200 460 120 520 24', label: 'O(n²)', tone: 'var(--slate-3)', cls: 's5' },
  ]
  return (
    <svg className="bigo" viewBox="0 0 640 280" role="img"
      aria-label="Signal traces plotting algorithmic growth curves from O of 1 to O of n squared">
      <g stroke="var(--line-soft)" strokeWidth="1">
        <path d="M40 250 h520" /><path d="M40 250 V20" />
      </g>
      <text x="562" y="254" fontFamily="Fragment Mono" fontSize="10" fill="var(--bone-dim)" letterSpacing="1">n →</text>
      <text x="26" y="18" fontFamily="Fragment Mono" fontSize="10" fill="var(--bone-dim)" letterSpacing="1">t</text>
      {curves.map((c) => (
        <g key={c.label} className={'bigo-stream ' + c.cls}>
          <path className="bigo-path" d={c.d} fill="none" stroke={c.tone} strokeWidth="4.5" strokeLinecap="butt" />
          <path className="bigo-fold" d={c.d} fill="none" stroke="var(--obsidian-2)" strokeWidth="1"
            strokeDasharray="1 12" opacity="0.4" />
        </g>
      ))}
      {curves.map((c, i) => (
        <text key={c.label} className={'bigo-label ' + c.cls}
          x="572" y={[244, 198, 132, 76, 30][i]}
          fontFamily="Fragment Mono" fontWeight="700" fontSize="12" fill={c.tone}>{c.label}</text>
      ))}
    </svg>
  )
}

export function MemoryMap() {
  const [hovered, setHovered] = useState(null)
  const hoverLog = useRef({})
  const onHover = (t) => {
    setHovered(t)
    if (t) {
      const now = Date.now()
      if (!hoverLog.current[t.id] || now - hoverLog.current[t.id] > 30000) {
        hoverLog.current[t.id] = now
        bus.log('CHIP_HOVER', t.id)
      }
    }
  }

  return (
    <section id="memory" className="board board-b memory-zone">

      <div className="wrap">
        <SectionHeader
          number="05"
          kicker="SECTOR 05 · SKILLS"
          title={<>Skills<span className="accent">.</span></>}
          sub="Memory map"
          lede="What I build with, laid out as a circuit board. Hover a chip to see which projects use it."
        />

        <Reveal className="mobo-wrap" delay={1}>
          {/* the same bot that sits on the process table, but ducked in
              behind this board's top-right corner. It is a sibling of
              .mobo rather than a child so the board's own surface is
              what cuts it off — see .core-bot-perch */}
          <div className="core-bot-perch mem-core-bot">
            <CoreBot />
          </div>

          <div className="mobo">
            {/* copper underlay: traces + socket */}
            <svg className="mobo-svg" viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
              preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
              {TECHS.map((t) => {
                const { d, via, via2 } = tracePath(t)
                return (
                  <g key={t.id} className="mobo-trace-g" data-tech-id={t.id}>
                    <path className="mobo-trace" data-tech-id={t.id} d={d}
                      fill="none" stroke="var(--copper-2)" strokeWidth="3" strokeDasharray="8 8" />
                    <rect x={via.x - 3} y={via.y - 3} width="6" height="6" fill="var(--trace-dim)" />
                    <rect x={via2.x - 3} y={via2.y - 3} width="6" height="6" fill="var(--trace-dim)" />
                  </g>
                )
              })}
              {/* the core socket */}
              <g className="mobo-core">
                <rect x={CORE.x - CORE.s / 2} y={CORE.y - CORE.s / 2} width={CORE.s} height={CORE.s}
                  fill="var(--slate)" stroke="var(--slate-3)" strokeWidth="3" />
                <rect x={CORE.x - CORE.s / 2 + 10} y={CORE.y - CORE.s / 2 + 10}
                  width={CORE.s - 20} height={CORE.s - 20}
                  fill="var(--obsidian-2)" stroke="var(--copper-2)" strokeWidth="2" />
                <text x={CORE.x} y={CORE.y - 2} textAnchor="middle"
                  fontFamily="Fragment Mono" fontWeight="700" fontSize="12"
                  letterSpacing="1.5" fill="var(--bone)">AYUSH</text>
                <text x={CORE.x} y={CORE.y + 13} textAnchor="middle"
                  fontFamily="Fragment Mono" fontWeight="700" fontSize="10"
                  letterSpacing="2" fill="var(--red)">CORE</text>
                <text x={CORE.x} y={CORE.y + CORE.s / 2 + 18} textAnchor="middle"
                  fontFamily="Fragment Mono" fontSize="10" letterSpacing="1"
                  fill="var(--bone-faint)">0x0000</text>
              </g>
            </svg>

            {/* the chips ride on top */}
            {TECHS.map((t) => <Chip key={t.id} t={t} onHover={onHover} />)}
          </div>

          {/* readout strip under the board */}
          <div className="mobo-readout" aria-live="polite">
            {hovered ? (
              <>
                <b>{hovered.name}</b> @ {hovered.addr} — {hovered.note}{' '}
                <span className="mobo-readout-builds">
                  linked: {buildsUsing(hovered.id).map((s) => BUILD_BY_SLUG[s].title).join(' · ') || 'core only'}
                </span>
              </>
            ) : (
              <span className="mobo-readout-idle">hover a chip to probe it · click to filter the builds</span>
            )}
          </div>
        </Reveal>


      </div>
    </section>
  )
}
