/* ============================================================
   PIXEL-DROP REVEAL — the signature scroll entrance, ported in
   spirit from the codrops "scrolling-pixels-drop" WebGL demo.

   That demo overlays each <img> with a shader that sweeps a
   horizontal line down the picture; at the sweep front a band of
   grid squares scatters with per-cell randomness, so the image
   DROPS INTO PLACE pixel by pixel instead of fading. Our site has
   no raster images — every panel is CSS/SVG.

   Rather than paint a fake ground rectangle over the element (which
   never matched the real card borders / text and left mismatched
   residue), we reveal the ACTUAL element with an animated clip-path
   that wipes top→bottom, and the 2D canvas only paints the scatter
   of hot bone/red/amber pixels riding the seam. So what materialises
   is the genuine content — the canvas adds nothing but the dust.
   ============================================================ */

let PAL = null
function palette() {
  if (PAL) return PAL
  const cs = getComputedStyle(document.documentElement)
  const g = (n, f) => cs.getPropertyValue(n).trim() || f
  PAL = { bone: g('--bone', '#EAE6DF'), red: g('--red', '#FF4F3B'), amber: g('--amber', '#FFB800') }
  return PAL
}

/* deterministic per-cell noise → [0,1) */
function hash(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

/* Only a light ease. A hard ease-out (cubic) finishes the visible wipe
   barely halfway through the duration and then lets the front crawl —
   so the scatter hung around long after the content had arrived, which
   is what read as the glitchy delay before the pixels vanished. */
const easeOut = (t) => 1 - Math.pow(1 - t, 1.35)

/* …and the leftover scatter fades out over the final stretch, reaching
   zero just BEFORE teardown, so the canvas is always empty when it goes
   (previously it was cut mid-alpha and the pixels popped out). */
const TAIL_FROM = 0.82
const TAIL_TO = 0.97
const tailFade = (tt) =>
  tt <= TAIL_FROM ? 1 : Math.max(0, (TAIL_TO - tt) / (TAIL_TO - TAIL_FROM))

/* Play the reveal over `node`. Returns a cancel() that restores the
   element and tears the canvas down (used on unmount / re-arm). */
export function playPixelReveal(node, { duration = 1700, delay = 0, cell = 11, band = 0.2 } = {}) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const pal = palette()

  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  const s = canvas.style
  s.position = 'fixed'
  s.zIndex = '30'
  s.pointerEvents = 'none'
  s.margin = '0'
  s.imageRendering = 'pixelated'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')

  // reveal the real element via clip-path — remember what to restore
  const prevClip = node.style.clipPath
  const prevWillChange = node.style.willChange
  node.style.willChange = 'clip-path'

  let w = 0, h = 0, cols = 0, rows = 0, cssH = 1
  const cellDev = cell * dpr

  const layout = () => {
    const r = node.getBoundingClientRect()
    cssH = r.height || 1
    s.left = r.left + 'px'
    s.top = r.top + 'px'
    s.width = r.width + 'px'
    s.height = r.height + 'px'
    const nw = Math.max(1, Math.round(r.width * dpr))
    const nh = Math.max(1, Math.round(r.height * dpr))
    if (nw !== w || nh !== h) {
      w = nw; h = nh
      canvas.width = w; canvas.height = h
      cols = Math.ceil(w / cellDev)
      rows = Math.ceil(h / cellDev)
    }
  }
  layout()

  // clip to reveal the top strip down to `front` (0..1 of the height).
  // front < 0 → nothing shown yet; front > 1 → fully shown.
  const applyClip = (front) => {
    const bottomInset = Math.max(0, Math.min(cssH, cssH * (1 - front)))
    node.style.clipPath = `inset(0px 0px ${bottomInset}px 0px)`
  }
  applyClip(-band) // start hidden, no flash

  const start = performance.now() + delay
  let raf = 0
  let done = false

  const restore = () => {
    node.style.clipPath = prevClip
    node.style.willChange = prevWillChange
  }

  const frame = (now) => {
    layout()
    const tt = (now - start) / duration
    const t = easeOut(Math.max(0, Math.min(1, tt)))
    const front = t * (1 + 2 * band) - band
    applyClip(front)

    const tail = tailFade(tt)
    ctx.clearRect(0, 0, w, h)
    // once the scatter has fully faded there is nothing left to paint —
    // drop the canvas early rather than holding an empty one on screen
    if (tail <= 0) {
      done = true
      restore()
      canvas.remove()
      return
    }
    for (let ry = 0; ry < rows; ry++) {
      const cy = (ry + 0.5) / rows
      const y = ry * cellDev
      for (let cx = 0; cx < cols; cx++) {
        const lf = front + (hash(cx + 1, ry + 1) - 0.5) * band * 0.9 // jittered front
        const d = cy - lf // <0 above (revealed) · >0 below (not yet)
        const ad = Math.abs(d)
        if (ad > band || hash(cx + 7.3, ry + 3.1) < 0.42) continue
        // brightest at the seam; over already-revealed content (d<0) it
        // fades fast so it never lingers as residue on the real card/text
        let a = 1 - ad / band
        if (d < 0) a *= 0.35
        a *= (0.55 + 0.45 * hash(cx + 2.2, ry + 9.9)) * tail
        const pick = hash(cx + 5.5, ry + 1.7)
        ctx.fillStyle = pick < 0.07 ? pal.red : pick < 0.13 ? pal.amber : pal.bone
        ctx.globalAlpha = a < 0 ? 0 : a > 1 ? 1 : a
        ctx.fillRect(cx * cellDev, y, cellDev, cellDev)
        ctx.globalAlpha = 1
      }
    }

    if (tt >= 1) {
      done = true
      restore()
      canvas.remove()
      return
    }
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  return () => {
    if (done) return
    cancelAnimationFrame(raf)
    restore()
    canvas.remove()
  }
}
