import { useEffect, useSyncExternalStore } from 'react'
import { SECTION_IDS, MANIFEST } from './registry.js'
import { buildReceipt } from './receipt.js'

/* ============================================================
   SYSTEM BUS — the machine's nervous system.

   Three channels, deliberately separated so a high-frequency
   write never triggers a page-wide React render:

   1. React channel  (low freq): module toggles, build filter,
      panic flag. Read via useSystem(selector).
   2. DOM channel     (high freq, ZERO renders): tech / build
      highlight is written straight onto <html> data-attributes.
      All illumination is static CSS keyed off those attrs.
   3. Log channel     (append-only): the visitor session log.
      Its own subscriber list so the live tail — and nothing
      else — updates when an event lands.
   ============================================================ */

const BOOT_T = Date.now()

/* ── React channel state ─────────────────────────────────── */
let state = {
  modules: { graphics3d: true, ui: true, ai: true },
  buildFilter: null,
  panic: null, // null | reason string
}
const subs = new Set()
function emit() { subs.forEach((fn) => fn()) }

/* ── Log channel ─────────────────────────────────────────── */
const LOG_CAP = 300
const logBuf = []
let logVersion = 0 // bumped on every write — the snapshot for useSyncExternalStore
const logSubs = new Set()
function emitLog() { logSubs.forEach((fn) => fn()) }

/* stamp: ms since boot as +MM:SS.mmm */
function stamp(t) {
  const s = Math.max(0, t) / 1000
  const mm = Math.floor(s / 60)
  const ss = Math.floor(s % 60)
  const ms = Math.floor((s * 1000) % 1000)
  return `+${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}.${String(ms).padStart(3, '0')}`
}

export const bus = {
  /* React channel */
  get() { return state },
  set(partial) {
    const next = { ...state, ...partial }
    if (partial.modules) next.modules = { ...state.modules, ...partial.modules }
    state = next
    emit()
  },
  subscribe(fn) { subs.add(fn); return () => subs.delete(fn) },

  /* DOM channel — highlight without re-rendering */
  setTechHighlight(id) {
    const root = document.documentElement
    if (id) root.dataset.tech = id
    else delete root.dataset.tech
  },
  setBuildHighlight(slug) {
    const root = document.documentElement
    if (slug) root.dataset.build = slug
    else delete root.dataset.build
  },

  /* Log channel */
  log(type, detail = '') {
    const entry = { t: Date.now() - BOOT_T, type, detail }
    logBuf.push(entry)
    if (logBuf.length > LOG_CAP) logBuf.shift()
    logVersion++
    emitLog()
  },
  getLog() { return logBuf },
  getLogVersion() { return logVersion },
  subscribeLog(fn) { logSubs.add(fn); return () => logSubs.delete(fn) },
  stamp,

  downloadLog() {
    bus.log('DOWNLOAD', 'session receipt')
    const now = new Date()
    const pdf = buildReceipt({
      events: logBuf,
      stampOf: stamp,
      generated: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)} ${
        Intl.DateTimeFormat().resolvedOptions().timeZone || 'local'}`,
      operator: {
        name: 'Ayush Singh',
        role: MANIFEST.identity.role,
        location: MANIFEST.identity.location,
        education: `${MANIFEST.education.school} - ${MANIFEST.education.programme}`,
        available: MANIFEST.availability,
        channels: [
          ['EMAIL', 'ayushsinghsolanki06@gmail.com'],
          ['GITHUB', 'github.com/Legend8068'],
          ['LINKEDIN', 'linkedin.com/in/ayush-singh0606'],
        ],
      },
    })
    // latin1: every byte of the document is already ASCII, so this maps
    // 1:1 and keeps the xref offsets the PDF header promised
    const bytes = new Uint8Array(pdf.length)
    for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'AYUSH-OS-SESSION-RECEIPT.pdf'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  },

  /* panic control */
  panic(reason) {
    if (state.panic) return
    bus.log('PANIC', reason)
    bus.set({ panic: reason })
  },
  reboot() {
    bus.log('REBOOT', 'session restored')
    bus.set({ panic: null })
  },
}

/* ── useSystem — subscribe to a slice of the React channel ─── */
export function useSystem(selector) {
  return useSyncExternalStore(
    bus.subscribe,
    () => selector(state),
    () => selector(state)
  )
}

/* ── section logger — one observer over the 7 subsystems ──── */
function useSectionLogger() {
  useEffect(() => {
    let last = null
    /* a section "enters" when it crosses the middle band of the
       viewport — a ratio threshold would never fire for sections
       taller than ~2 viewports (35% of a 4000px runway can't fit
       on screen), so tall sectors would go unlogged */
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.target.id !== last) {
            last = e.target.id
            bus.log('SECTION_ENTER', e.target.id)
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    const nodes = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean)
    nodes.forEach((n) => obs.observe(n))
    return () => obs.disconnect()
  }, [])
}

/* ── SystemProvider — mirrors React state → <html> dataset so
   CSS can react to module toggles / panic, and mounts the
   section logger. Renders children unchanged. ─────────────── */
export function SystemProvider({ children }) {
  const modules = useSystem((s) => s.modules)
  const panic = useSystem((s) => s.panic)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.graphics3d = modules.graphics3d ? 'on' : 'off'
    root.dataset.ui = modules.ui ? 'on' : 'off'
    root.dataset.ai = modules.ai ? 'on' : 'off'
  }, [modules])

  useEffect(() => {
    document.documentElement.classList.toggle('panicking', !!panic)
  }, [panic])

  useEffect(() => { bus.log('BOOT', 'AYUSH.OS v26.07 online') }, [])
  useSectionLogger()

  return children
}
