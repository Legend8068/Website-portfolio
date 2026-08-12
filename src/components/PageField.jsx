import { useEffect, useRef } from 'react'
import { PixelBlast } from './PixelBlast.jsx'

/* ============================================================
   PAGE FIELD — one interactive pixel field for the whole site.

   This used to be a canvas per section, which meant the pattern
   restarted at every boundary and died completely inside the
   opaque dither band between them: a hard seam the pixels could
   not cross. One fixed, screen-space field has no seams to
   cross, because it never stops — the bands simply pass over a
   pattern that was already continuous underneath.

   Each section still owns a colour. The tint holds steady for
   the whole of a section and only crossfades while the dither
   band between two of them is passing the middle of the screen,
   so the change reads as a deliberate transition rather than an
   endless gradient.

   It also takes six WebGL contexts back down to one.
   ============================================================ */

/* a walk down the machine: the boot accent, quiet steel while
   you read, warming as the work appears, clean for the board,
   and the accent again at the call to action */
const STOPS = [
  ['boot', '#FF4F3B'],
  ['manifest', '#7C7F8A'],
  ['kernel', '#FFB800'],
  ['builds', '#FF4F3B'],
  ['memory', '#EAE6DF'],
  ['transmit', '#D93A28'],
]

const rgb = (hex) => [
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
]
const mix = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]

export function PageField() {
  const hostRef = useRef(null)
  const tintRef = useRef(rgb(STOPS[0][1]))
  /* The drifting pattern belongs to the hero alone, and strictly to the
     part of the screen the hero is actually covering: this is where its
     bottom edge sits, so the pattern ends at the seam and leaves with
     the hero rather than drifting on over the section beneath it. Below
     that line the field shows nothing at all until it is clicked — the
     reading sections stay flat boards, and the pixels are a thing you
     poke at. The field itself never unmounts, so a click lands anywhere
     on the page, dissolve bands included. */
  const ambientCutRef = useRef(0)

  useEffect(() => {
    const stops = STOPS
      .map(([id, hex]) => ({ el: document.getElementById(id), c: rgb(hex) }))
      .filter((s) => s.el)
    if (!stops.length) return

    const hero = document.getElementById('boot')
    const host = hostRef.current
    let queued = false

    const settle = () => {
      queued = false
      const vh = window.innerHeight
      const mid = vh / 2

      /* The pattern reaches exactly as far down the screen as the hero
         does — capped at the viewport, floored at zero once the hero has
         scrolled off and the field goes click-only for the rest of the
         page. */
      if (hero) {
        const b = hero.getBoundingClientRect().bottom
        ambientCutRef.current = Math.min(vh, Math.max(0, b))
      }

      let prev = null
      let next = null

      for (const s of stops) {
        const r = s.el.getBoundingClientRect()
        if (r.top <= mid && r.bottom >= mid) {
          tintRef.current = s.c
          // the hero keeps the field off the portrait; nothing else does
          if (host) host.classList.toggle('at-boot', s.el.id === 'boot')
          return
        }
        if (r.bottom < mid) prev = s
        else if (!next) next = s
      }

      if (host) host.classList.remove('at-boot')
      /* between two sections is exactly the dither band, so this is
         the only place the colour ever moves */
      if (prev && next) {
        const a = prev.el.getBoundingClientRect().bottom
        const b = next.el.getBoundingClientRect().top
        const t = b > a ? Math.min(1, Math.max(0, (mid - a) / (b - a))) : 1
        tintRef.current = mix(prev.c, next.c, t)
      } else if (prev) tintRef.current = prev.c
      else if (next) tintRef.current = next.c
    }

    const onScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(settle)
    }

    settle()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className="page-field" ref={hostRef} aria-hidden="true">
      {/* edgeFade would sit at the viewport edges on a fixed canvas and
          read as a permanent vignette, so it is off here */}
      <PixelBlast tintRef={tintRef} ambientCutRef={ambientCutRef} color={STOPS[0][1]} edgeFade={0} />
    </div>
  )
}
