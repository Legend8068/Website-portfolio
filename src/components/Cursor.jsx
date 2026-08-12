import { useEffect, useRef } from 'react'

/* ============================================================
   CURSOR — the machine's own pointer.

   A 1-bit reticle that reads state instead of decorating it:
   brackets open when there is something to click, clamp shut on
   press, and become a caret over text. Behind it the pointer
   leaves a trail of phosphor pixels that decay in hard steps,
   like a slow monitor failing to keep up with the beam.

   Everything lives on one fixed canvas. A DOM node per trail
   pixel would mean dozens of layers thrashing on every move;
   here the whole thing is a handful of fillRect calls, and the
   canvas only redraws while there is something left to draw.
   ============================================================ */

const CELL = 4            // the raster everything else on this site sits on
const TRAIL_MAX = 64
const TRAIL_LIFE = 0.55   // seconds
const SPAWN_GAP = 7       // px of travel between dropped pixels

/* what the reticle is pointing at */
const HOT = 'a, button, input, textarea, select, summary, [role="button"], [tabindex]:not([tabindex="-1"]), .proc-tile, .tool, .man-toggle, .crun-stage, .nav-tab, .mod-tag'
const TEXTY = 'input:not([type="button"]):not([type="submit"]), textarea'

export function Cursor() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    /* a custom cursor is only ever right for a real pointer — never
       hijack touch, and never on a device that has no cursor to hide */
    const fine = window.matchMedia('(pointer: fine)').matches
    if (!fine) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const root = document.documentElement
    root.classList.add('cursor-custom')

    const tokens = getComputedStyle(root)
    const tone = (n, fb) => (tokens.getPropertyValue(n) || '').trim() || fb
    const BONE = tone('--bone', '#EAE6DF')
    const RED = tone('--red', '#FF4F3B')
    const AMBER = tone('--amber', '#FFB800')

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0, H = 0
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
    }
    resize()

    let x = -999, y = -999          // live pointer
    let lastX = -999, lastY = -999  // last trail drop
    let inside = false
    let pressed = false
    let mode = 'idle'               // idle | hot | text
    let lastTarget = null

    // the bracket opening, eased so state changes read as a movement
    let arm = 9
    let armTarget = 9

    const trail = []
    const snap = (v) => Math.round(v / CELL) * CELL

    const onMove = (e) => {
      x = e.clientX
      y = e.clientY
      inside = true

      // closest() on every move would be wasteful; the answer only
      // changes when the pointer crosses into a different element
      if (e.target !== lastTarget) {
        lastTarget = e.target
        const el = e.target
        mode = el.closest?.(TEXTY) ? 'text' : el.closest?.(HOT) ? 'hot' : 'idle'
      }

      if (reduced) return
      const dx = x - lastX
      const dy = y - lastY
      if (dx * dx + dy * dy >= SPAWN_GAP * SPAWN_GAP) {
        lastX = x
        lastY = y
        const roll = Math.random()
        trail.push({
          x: snap(x + (Math.random() - 0.5) * 6),
          y: snap(y + (Math.random() - 0.5) * 6),
          size: roll > 0.88 ? CELL * 2 : CELL,
          // mostly bone, with the same rare hot pixels the dither
          // edges and the game scatter through everything else
          c: roll > 0.94 ? RED : roll > 0.86 ? AMBER : BONE,
          life: TRAIL_LIFE,
        })
        if (trail.length > TRAIL_MAX) trail.shift()
      }
    }

    const onLeave = () => { inside = false }
    const onDown = () => { pressed = true }
    const onUp = () => { pressed = false }

    let raf = 0
    let last = 0

    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016
      last = now

      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].life -= dt
        if (trail[i].life <= 0) trail.splice(i, 1)
      }

      armTarget = mode === 'hot' ? 15 : mode === 'text' ? 4 : 9
      if (pressed) armTarget -= 3
      arm += (armTarget - arm) * Math.min(1, dt * 18)

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      if (!inside) return

      /* ── the trail ── */
      for (const p of trail) {
        // quantise the fade into four hard steps, so pixels drop out
        // of existence rather than dissolving
        const step = Math.ceil((p.life / TRAIL_LIFE) * 4) / 4
        ctx.globalAlpha = step * 0.5
        ctx.fillStyle = p.c
        ctx.fillRect(p.x, p.y, p.size, p.size)
      }
      ctx.globalAlpha = 1

      /* ── the reticle ── */
      const cx = Math.round(x)
      const cy = Math.round(y)
      const a = Math.round(arm)
      const t = 2                       // stroke thickness
      const len = mode === 'hot' ? 7 : 5 // corner arm length
      const col = pressed ? AMBER : mode === 'hot' ? RED : BONE

      ctx.fillStyle = col

      if (mode === 'text') {
        // a caret, so a text field still says "you can type here"
        ctx.fillRect(cx - 1, cy - 11, t, 22)
        ctx.fillRect(cx - 5, cy - 11, 10, t)
        ctx.fillRect(cx - 5, cy + 9, 10, t)
      } else {
        // four corner brackets, drawn as eight hard rects
        // top-left
        ctx.fillRect(cx - a, cy - a, len, t)
        ctx.fillRect(cx - a, cy - a, t, len)
        // top-right
        ctx.fillRect(cx + a - len, cy - a, len, t)
        ctx.fillRect(cx + a - t, cy - a, t, len)
        // bottom-left
        ctx.fillRect(cx - a, cy + a - t, len, t)
        ctx.fillRect(cx - a, cy + a - len, t, len)
        // bottom-right
        ctx.fillRect(cx + a - len, cy + a - t, len, t)
        ctx.fillRect(cx + a - t, cy + a - len, t, len)

        // the hotspot itself — one pixel, exactly where the click lands
        ctx.fillRect(cx - CELL / 2, cy - CELL / 2, CELL, CELL)
      }
    }

    const start = () => { if (!raf) { last = 0; raf = requestAnimationFrame(frame) } }
    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0 } }

    const onVis = () => { if (document.hidden) stop(); else start() }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    window.addEventListener('blur', onLeave)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVis)
    start()

    return () => {
      stop()
      root.classList.remove('cursor-custom')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('blur', onLeave)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas className="cursor-canvas" ref={ref} aria-hidden="true" />
}
