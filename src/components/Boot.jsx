import { useEffect, useRef, useState, useCallback } from 'react'
import { warpTo } from './Warp.jsx'
import { bus, useSystem } from '../lib/systemBus.jsx'
import { runCommand, BOOT_HINT } from '../lib/shell.js'
import { ParticleFace } from './ParticleFace.jsx'
import { CoreBot } from './CoreBot.jsx'

/* ============================================================
   BOOT SEQUENCE — the machine powers on. Startup diagnostics
   scroll past, then the operator's name renders as a system
   launch event, and finally a REAL prompt hands control to the
   visitor. help / projects / stack <mod> / resume / sudo hire /
   sudo rm -rf / ... every command does something.
   ============================================================ */

const NAME = 'AYUSH.SINGH'

/* ── the interactive prompt ─────────────────────────────── */
function BootPrompt() {
  const aiOn = useSystem((s) => s.modules.ai)
  const [lines, setLines] = useState([])
  const [value, setValue] = useState('')
  const bodyRef = useRef(null)
  const inputRef = useRef(null)

  // keep scrolled to the latest line
  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  // global "/" focuses the prompt (unless already typing somewhere)
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || '').toLowerCase()
      if (e.key === '/' && tag !== 'input' && tag !== 'textarea') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const exec = useCallback((raw) => {
    const { lines: outLines, effects } = runCommand(raw, { ai: aiOn })
    if (raw.trim()) bus.log('CMD', raw.trim())
    let cleared = false
    for (const fx of effects) {
      if (fx.clear) { setLines([]); cleared = true }
      else if (fx.scroll) warpTo(fx.scroll)
      else if (fx.open) { bus.log('RESUME_OPEN', fx.open); window.open(fx.open, '_blank', 'noopener') }
      else if (fx.filter !== undefined) { bus.set({ buildFilter: fx.filter }); bus.log('FILTER_SET', fx.filter || 'null') }
      else if (fx.panic) bus.panic(fx.panic)
    }
    if (!cleared && outLines.length) setLines((prev) => [...prev, ...outLines].slice(-60))
  }, [aiOn])

  const onSubmit = (e) => {
    e.preventDefault()
    exec(value)
    setValue('')
  }

  return (
    <div className="prompt" onClick={() => inputRef.current?.focus()}>
      <div className="prompt-bar">
        <span className="prompt-led" /><span className="prompt-led amber" /><span className="prompt-led" />
        <span className="prompt-title">ayush@os:/proc/ayush/boot</span>
        <span className="prompt-tty">TTY·00</span>
      </div>
      <div className="prompt-body" ref={bodyRef} aria-live="polite">
        <p className="prompt-line out dim">{BOOT_HINT}</p>
        {lines.map((l, i) => (
          <p key={i} className={'prompt-line ' + l.t}>
            {l.t === 'cmd' && <b className="prompt-ps1">$&nbsp;</b>}
            {l.s}
          </p>
        ))}
        <form className="prompt-line input" onSubmit={onSubmit}>
          <b className="prompt-ps1">$&nbsp;</b>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') e.currentTarget.blur()
              if (e.key === 'Enter') { e.preventDefault(); exec(value); setValue('') }
            }}
            aria-label="System command input"
            placeholder="type a command — 'help'"
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
          />
        </form>
      </div>
    </div>
  )
}



export function Boot() {
  const rootRef = useRef(null)
  const skyRef = useRef(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      root.classList.add('reduced-boot')
      setIsReady(true)
    } else {
      if (window.PRELOADER_DONE) {
        setIsReady(true)
      } else {
        const onDone = () => setIsReady(true)
        window.addEventListener('preloader-done', onDone)
        return () => window.removeEventListener('preloader-done', onDone)
      }
    }
  }, [])



  return (
    <section id="boot" className={`boot-screen pcb-ground ${isReady ? 'is-ready' : ''}`} ref={rootRef}>
      {/* the operator, rasterized to phosphor dust — now the hero's own
          background: right-anchored, bleeding off the edge, boxless */}
      <ParticleFace />

      <div className="hero-rail top">
        <span><i className="pulse-dot" />1.35°N · 103.81°E · SINGAPORE</span>
      </div>

      <div className="boot-stage">
      <div className="boot-center">
        <CoreBot />

        <h1 className="hero-name boot-name" aria-label={NAME}>
          {NAME.split('').map((ch, i) => (
            <span key={i} aria-hidden="true"
              className={'rl' + (ch === '.' ? ' accent' : '')}
              style={{ '--i': i }}>{ch}</span>
          ))}
          <span className="name-cursor" aria-hidden="true" />
        </h1>

        <p className="hero-sub">
          <span>SOFTWARE ENGINEER</span><i className="dot" /><span>DESIGNER</span><i className="dot" /><span>BUILDER</span>
        </p>
        <p className="hero-tagline">
          <span className="tag-ai">Rendered in pixels. Powered by code.</span>
          <span className="tag-noai">Deterministic build. No model in the loop.</span>
        </p>

        <BootPrompt />
      </div>
      </div>
    </section>
  )
}
