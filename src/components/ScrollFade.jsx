import { useEffect } from 'react'
import { SECTION_IDS } from '../lib/registry.js'

/* ============================================================
   SCROLL FADE — each subsystem fades UP as it rises into the
   viewport and fades DOWN into near-black as it leaves, so
   scrolling reads as paging between screens. The opacity is
   quantised to chunky steps (frame-snapped, not a smooth
   dissolve) to keep it on the machine's pixel clock, and holds
   at full brightness through the middle band so nothing dims
   while you're reading it.
   ============================================================ */

const FLOOR = 0.08   // how dark a section gets at the edges of its transit
const STEPS = 8      // opacity levels — chunky, pixel-stepped fade

const smooth = (e0, e1, x) => {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

export function ScrollFade() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const secs = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean)
    if (!secs.length) return

    let raf = 0
    const apply = () => {
      raf = 0
      const vh = window.innerHeight || 1
      for (const s of secs) {
        const r = s.getBoundingClientRect()
        // full while the section spans the mid-band; fade as it enters
        // (top still low in the viewport) or leaves (bottom risen high)
        const enter = smooth(vh * 0.98, vh * 0.58, r.top)
        const leave = smooth(vh * 0.02, vh * 0.42, r.bottom)
        let f = Math.min(enter, leave)
        f = Math.round(f * STEPS) / STEPS
        const op = (FLOOR + (1 - FLOOR) * f).toFixed(3)
        if (s.style.opacity !== op) s.style.opacity = op
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply) }

    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
      secs.forEach((s) => { s.style.opacity = '' })
    }
  }, [])
  return null
}
