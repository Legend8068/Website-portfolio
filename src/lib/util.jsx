import { useEffect, useRef } from 'react'
import { playPixelReveal } from './pixelReveal.js'

/* ── Math helpers ──────────────────────────────────────────────────────── */
export function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }
export function lerp(a, b, t) { return a + (b - a) * t }
export function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}
export function easeOut(t) { return 1 - Math.pow(1 - t, 3) }
export function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/* useScrollProgress — progress (0..1) of how far we've scrolled through a
   pinned wrapper. The consumer mutates the DOM imperatively for smooth
   sticky-driven cinematic animation.

   We keep the latest onChange in a ref so the effect stays subscribed for
   the life of the component even if the callback identity changes, and we
   call measure() synchronously on scroll (rAF is throttled in some iframe/
   visibility states, and the work per measure is trivial enough to skip
   batching). */
export function useScrollProgress(ref, onChange) {
  const cbRef = useRef(onChange)
  useEffect(() => { cbRef.current = onChange }, [onChange])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight
      const p = total > 0 ? clamp(-r.top / total, 0, 1) : 0
      try { cbRef.current(p) } catch (e) { console.error('useScrollProgress cb error', e) }
    }
    measure()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [ref])
}

/* usePrefersReducedMotion — live media-query check so scroll scenes can
   render their final state instead of animating. */
export function usePrefersReducedMotion() {
  const mq = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null
  const ref = useRef(mq ? mq.matches : false)
  useEffect(() => {
    if (!mq) return
    const onChange = () => { ref.current = mq.matches }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return ref
}

/* Every Reveal registers a re-arm callback here; a single shared scroll
   listener fires them all the moment the page returns to the very top,
   so the pixel-drop plays ONCE per visit to a section and only replays
   after you scroll all the way back up — not on every re-entry. */
const rearmers = new Set()
let topWatcher = false
function watchTop() {
  if (topWatcher || typeof window === 'undefined') return
  topWatcher = true
  let wasTop = window.scrollY <= 2
  window.addEventListener('scroll', () => {
    const atTop = window.scrollY <= 2
    if (atTop && !wasTop) rearmers.forEach((fn) => fn()) // just returned to top
    wasTop = atTop
  }, { passive: true })
}

/* Reveal — panels, cards and section headers DROP INTO PLACE as they
   enter the viewport: an animated clip-path wipes the real element in
   while a pixel-drop canvas (see pixelReveal.js) scatters hot pixels
   along the seam. It plays once; scrolling a section out leaves it
   shown, and it only re-arms (plays again on the next scroll-down) once
   you return to the top of the page. Above-the-fold elements play at
   once on mount; reduced-motion skips the effect and just shows them. */
export function Reveal({ children, delay = 0, as = 'div', className = '', ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) { node.classList.add('in'); return }

    watchTop()
    let cancel = null
    let armed = true

    const trigger = () => {
      if (!armed) return
      armed = false
      if (cancel) cancel()
      node.classList.remove('pending')
      node.classList.add('in') // opacity:1 + unlocks child pop-in transitions
      cancel = playPixelReveal(node, { delay: delay * 90 })
    }
    // re-arm on return-to-top: reset to hidden so it drops in again when
    // scrolled back to; if it happens to be in view, replay immediately
    const rearm = () => {
      if (cancel) { cancel(); cancel = null }
      armed = true
      const r = node.getBoundingClientRect()
      if (r.top < window.innerHeight && r.bottom > 0) trigger()
      else { node.classList.remove('in'); node.classList.add('pending') }
    }
    rearmers.add(rearm)

    const r = node.getBoundingClientRect()
    if (r.top < window.innerHeight && r.bottom > 0) trigger()
    else node.classList.add('pending')

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) trigger()
      },
      { threshold: 0.08, rootMargin: '0px 0px -10% 0px' }
    )
    obs.observe(node)
    return () => { obs.disconnect(); rearmers.delete(rearm); if (cancel) cancel() }
  }, [])
  const Tag = as
  return (
    <Tag ref={ref} className={'reveal ' + className} data-delay={delay} {...rest}>
      {children}
    </Tag>
  )
}
