import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Reveal } from '../lib/util.jsx'
import { SectionHeader, DebugChip } from './Machine.jsx'
import { MonitorFrame } from './MonitorFrame.jsx'
import { MapScene, BoardScene, ShiftScene, ParserScene, MakanScene, MachineScene } from './Scenes.jsx'
import { bus, useSystem } from '../lib/systemBus.jsx'
import { BUILDS, TECH_BY_ID } from '../lib/registry.js'

/* ============================================================
   DEPLOYED BUILDS — /var/builds. Each project is a deployment
   control station: an INCIDENT REPORT states what was wrong
   with the world, a RESOLUTION LOG records what shipped, and
   the loaded modules row is wired into the MEMORY MAP — hover
   a module here and the chip lights up down there (and vice
   versa). `stack <mod>` in the boot prompt filters this list.
   ============================================================ */

/* ── PIXELATED IMAGE REVEAL ───────────────────────────────────
   Ported from Hover-pixel/script.js. A 7×7 grid of blocks floods
   in over the station in random order, the layer underneath is
   swapped at the halfway mark, then the blocks flood back out —
   so the scene dissolves into the real screenshot and back again.

   Same timings as the source (0.3s per half, random stagger,
   GSAP-driven), retinted to the machine: the blocks are the
   board's own darks with a scatter of red/amber/bone hot cells,
   matching the block-wipe language used between sectors.

   Stations without a photo render their scene untouched. */
const PXR_GRID = 7
const PXR_STEP = 0.3

function PixelReveal({ photo, photoFit, title, children }) {
  const hostRef = useRef(null)
  const cellsRef = useRef([])
  const activeRef = useRef(null)
  const onRef = useRef(false)
  const callRef = useRef(null)
  const [near, setNear] = useState(false)

  /* lazy: the screenshot isn't fetched until the station is close */
  useEffect(() => {
    const el = hostRef.current
    if (!el || !photo) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setNear(true); io.disconnect() }
    }, { rootMargin: '500px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [photo])

  useEffect(() => {
    const el = hostRef.current
    const active = activeRef.current
    if (!el || !photo || !active) return
    const cells = cellsRef.current.filter(Boolean)
    if (!cells.length) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const stagger = PXR_STEP / cells.length

    const run = (activate) => {
      onRef.current = activate
      if (reduced) {                       // no dissolve — just swap
        active.style.display = activate ? 'block' : 'none'
        return
      }
      gsap.killTweensOf(cells)
      callRef.current?.kill()
      gsap.set(cells, { display: 'none' })
      // flood in
      gsap.to(cells, { display: 'block', duration: 0, stagger: { each: stagger, from: 'random' } })
      // swap the layer while the blocks cover it
      callRef.current = gsap.delayedCall(PXR_STEP, () => {
        active.style.display = activate ? 'block' : 'none'
      })
      // flood back out
      gsap.to(cells, {
        display: 'none', duration: 0, delay: PXR_STEP,
        stagger: { each: stagger, from: 'random' },
      })
    }

    const coarse = window.matchMedia('(pointer: coarse)').matches
    const enter = () => { if (!onRef.current) run(true) }
    const leave = () => { if (onRef.current) run(false) }
    const tap = () => run(!onRef.current)

    if (coarse) el.addEventListener('click', tap)
    else {
      el.addEventListener('mouseenter', enter)
      el.addEventListener('mouseleave', leave)
    }
    return () => {
      el.removeEventListener('click', tap)
      el.removeEventListener('mouseenter', enter)
      el.removeEventListener('mouseleave', leave)
      gsap.killTweensOf(cells)
      callRef.current?.kill()
    }
  }, [photo, near])

  if (!photo) return children

  const step = 100 / PXR_GRID
  return (
    <div className="pxr" ref={hostRef} data-fit={photoFit || 'contain'}>
      {children}
      <div className="pxr-active" ref={activeRef} aria-hidden="true">
        {near && (
          <img className="pxr-img" src={photo} alt={`${title} — screenshot`}
            loading="lazy" decoding="async" />
        )}
      </div>
      <div className="pxr-grid" aria-hidden="true">
        {Array.from({ length: PXR_GRID * PXR_GRID }).map((_, i) => (
          <i key={i} ref={(el) => { cellsRef.current[i] = el }} className="pxr-px"
            style={{
              left: `${(i % PXR_GRID) * step}%`, top: `${Math.floor(i / PXR_GRID) * step}%`,
              width: `${step}%`, height: `${step}%`,
            }} />
        ))}
      </div>
    </div>
  )
}

const DIORAMAS = {
  'sg-meethalfway': MapScene,
  'worldcup': BoardScene,
  'genai-detect': ShiftScene,
  'taskbot': ParserScene,
  'makanmates': MakanScene,
  'ayush-os': MachineScene,
}

const BUILD_NOTES = {
  'sg-meethalfway': 'A geometric centre is unfair — it ignores that trains don’t run in straight lines. I weight every leg by real transit time from routing APIs, then search for the point that minimises the group’s worst commute.',
  'taskbot': 'Free-text dates are the hard part — “next fri”, “in 2 weeks”, “EOD”. I parse intent and time out of the message, then hand it to a persistent job queue so reminders survive restarts and time-zones.',
  'genai-detect': 'The corpus is 62.5% machine-generated, so “always machine” scores 62.5% accuracy and catches zero humans — Macro-F1 is the only metric that notices. The rest was distribution shift: an adversarial validator that tries to tell train from test, and a split reweighted by whatever it latched onto.',
  'ayush-os': 'Everything here is hand-placed: no UI kit, no template. The cross-highlighting runs on data-attributes and static CSS so a hover costs zero React renders.',
  'worldcup': 'Three feeds disagree constantly — a goal lands in the score before it lands in the table. I reconcile them into one state and render from that, so nothing on screen contradicts itself mid-match.',
  'makanmates': 'The hard part is mobile latency and offline reliability. Transit lookups are slow, so results cache locally and the UI always has a recommendation ready on the spot.',
}

function ModuleTag({ techId, selected }) {
  const t = TECH_BY_ID[techId]
  if (!t) return null
  return (
    <button
      type="button"
      className={'mod-chip' + (selected ? ' sel' : '')}
      data-tech-id={techId}
      aria-pressed={selected}
      onMouseEnter={() => bus.setTechHighlight(techId)}
      onMouseLeave={() => bus.setTechHighlight(null)}
      onFocus={() => bus.setTechHighlight(techId)}
      onBlur={() => bus.setTechHighlight(null)}
      onClick={() => bus.toggleTech(techId)}
      title={`${t.name} @ ${t.addr} — click to ${selected ? 'deselect' : 'select'}`}
    >
      {t.name} <i className="mod-addr">{t.addr}</i>
    </button>
  )
}

function FilterBar() {
  const sel = useSystem((s) => s.techFilter)
  if (!sel.length) return null
  const n = BUILDS.filter((b) => b.uses.some((u) => sel.includes(u))).length
  return (
    <div className="build-filter" role="status">
      <span className="build-filter-k">FILTER</span>
      {sel.map((id) => (
        <button key={id} type="button" className="build-filter-pill"
          onClick={() => bus.toggleTech(id)}
          title={`Remove ${TECH_BY_ID[id]?.name || id} from the filter`}>
          {id} <i aria-hidden="true">×</i>
        </button>
      ))}
      <span className="build-filter-n">{n}/{BUILDS.length} builds</span>
      <button type="button" className="build-filter-clear"
        onClick={() => bus.clearTechFilter()}>
        [ CLEAR ]
      </button>
    </div>
  )
}

function BuildStation({ b, idx }) {
  const sel = useSystem((s) => s.techFilter)
  const seen = useRef(false)
  const Diorama = DIORAMAS[b.slug]
  const filtered = sel.length > 0 && !b.uses.some((u) => sel.includes(u))
  return (
    <Reveal as="article"
      className={'project build-station' + (idx % 2 ? ' rev' : '') + (filtered ? ' filtered-out' : '')}
      data-uses={b.uses.join(' ')}
      data-slug={b.slug}
      delay={1}
      onMouseEnter={() => {
        bus.setBuildHighlight(b.slug)
        if (!seen.current) { seen.current = true; bus.log('BUILD_OPEN', b.slug) }
      }}
      onMouseLeave={() => bus.setBuildHighlight(null)}
    >
      <div className="project-text">
        <div className="project-meta">
          <span className="project-num">{b.num}</span>
          <span className="project-tag">{b.tag}</span>
          <span className="project-year">{b.year}</span>
        </div>
        <h3 className="project-title">{b.title}</h3>
        <p className="project-summary">{b.summary}</p>
        <dl className="project-facts">
          <div className="fact incident">
            <dt>INCIDENT REPORT</dt>
            <dd><i className="log-pre">&gt; incident #{b.num} · </i>{b.incident}</dd>
          </div>
          <div className="fact resolution">
            <dt>RESOLUTION LOG</dt>
            <dd><i className="log-pre">&gt; resolved · </i>{b.resolution}</dd>
          </div>
        </dl>
        <div className="project-foot">
          <div className="mod-row">
            <span className="mod-row-k">LOADED MODULES</span>
            {b.uses.map((u) => (
              <ModuleTag key={u} techId={u} selected={sel.includes(u)} />
            ))}
          </div>
          <span className="state">{b.state}</span>
        </div>
        {b.link && (
          <a className="cmd-btn" href={b.link} target="_blank" rel="noopener noreferrer"
            onClick={() => bus.log('LINK_OUT', b.link)}>
            {b.linkLabel || 'Open live deployment'}
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M6 4h6v6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter"/></svg>
          </a>
        )}
      </div>
      <div className="project-scene">
        <MonitorFrame title={`STATION 0${idx + 1} · ${b.slug}`} mode={b.mode}>
          <PixelReveal photo={b.photo} photoFit={b.photoFit} title={b.title}><Diorama /></PixelReveal>
        </MonitorFrame>
        {BUILD_NOTES[b.slug] && <DebugChip label={'BUILD NOTE · ' + b.num} note={BUILD_NOTES[b.slug]} />}
        <span className="filter-stamp" aria-hidden="true">SKIPPED</span>
      </div>
    </Reveal>
  )
}

/* the table only mounts its first page of stations — the rest are
   loaded on request, so a visitor who isn't reading projects scrolls
   straight on to Skills instead of past three more screens of them */
const SHOWN = 3

export function Builds() {
  const [expanded, setExpanded] = useState(false)
  const sel = useSystem((s) => s.techFilter)
  const filter = sel.length > 0
  /* a filter is an explicit request to see every match, so it opens
     the rest of the list on its own */
  const open = expanded || filter
  const rest = BUILDS.length - SHOWN
  const visible = open ? BUILDS : BUILDS.slice(0, SHOWN)

  return (
    <section id="builds" className="board board-a builds-zone">

      <div className="wrap">
        <SectionHeader
          number="04"
          kicker="SECTOR 04 · PROJECTS"
          title={<>Projects<span className="accent">.</span></>}
          sub="Deployed builds"
          lede="Six things I’ve designed and shipped, each one starting with the problem it solves. Hover any technology tag and it lights up in Skills below."
        />
        <FilterBar />
        <div className="project-list" id="build-list">
          {visible.map((b, idx) => <BuildStation key={b.slug} b={b} idx={idx} />)}
        </div>
        {rest > 0 && !filter && (
          <div className="build-more">
            <button
              type="button"
              className={'build-more-btn' + (expanded ? ' up' : '')}
              aria-expanded={expanded}
              aria-controls="build-list"
              title={expanded ? 'Unmount the remaining builds' : `Mount ${rest} more builds`}
              onClick={() => {
                const next = !expanded
                setExpanded(next)
                bus.log('BUILDS', next ? 'mount remaining ' + rest : 'unmount remaining ' + rest)
                if (!next) {
                  document.getElementById('builds')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
            >
              <span className="build-more-sr">
                {expanded ? 'Unmount the remaining builds' : `Mount ${rest} more builds`}
              </span>
              {/* the machine's own chevron: hard mitred strokes, no curve */}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 8.5 12 16.5 20 8.5" fill="none" stroke="currentColor"
                  strokeWidth="2.6" strokeLinecap="square" strokeLinejoin="miter" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
