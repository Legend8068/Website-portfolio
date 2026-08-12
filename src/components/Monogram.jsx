import { useEffect, useRef } from 'react'
import { clamp } from '../lib/util.jsx'

/* ============================================================
   AS MONOGRAM — the operator's signing mark, ported from the
   old portfolio and rebuilt in the machine's own idiom.

   The framer-motion original became: a rigid bone "A" (the
   structure) and a live CRT-red "S" (the signal), both PLOTTED
   in stepped frames — steps() timing reads as a pixel pen laying
   the stroke down cell by cell. Square caps, hard edges. Amber
   solder-points light at each vertex once the stroke passes. A
   dashed plotter crosshair and an x/y readout track the pointer
   like a plotter bed. Click to re-plot.
   ============================================================ */


const A_PATH = 'M 120 320 L 200 80 L 280 320 M 148 240 L 252 240'
const S_PATH = 'M 260 115 C 240 85, 170 75, 155 110 C 138 150, 220 165, 235 200 C 255 240, 160 265, 155 290 C 148 325, 225 335, 250 305'

export function Monogram() {
  const ref = useRef(null)
  const sRef = useRef(null)
  const hRef = useRef(null)
  const vRef = useRef(null)
  const xRef = useRef(null)
  const yRef = useRef(null)

  useEffect(() => {
    const host = ref.current
    if (!host) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let targetX = 0.5
    let targetY = 0.5
    let currentX = 0.5
    let currentY = 0.5
    let animId = null

    const onMove = (e) => {
      const r = host.getBoundingClientRect()
      targetX = clamp((e.clientX - r.left) / r.width, 0, 1)
      targetY = clamp((e.clientY - r.top) / r.height, 0, 1)
    }

    const onLeave = () => {
      targetX = 0.5
      targetY = 0.5
    }

    const render = () => {
      currentX += (targetX - currentX) * 0.08
      currentY += (targetY - currentY) * 0.08

      const offsetX = (currentX - 0.5) * 26
      const offsetY = (currentY - 0.5) * 26

      if (sRef.current) {
        sRef.current.style.transform = `translate3d(${(offsetX * 0.5).toFixed(2)}px, ${(offsetY * 0.35).toFixed(2)}px, 0)`
      }
      if (hRef.current) {
        hRef.current.style.transform = `translate3d(0, ${offsetY.toFixed(2)}px, 0)`
      }
      if (vRef.current) {
        vRef.current.style.transform = `translate3d(${offsetX.toFixed(2)}px, 0, 0)`
      }
      if (xRef.current) {
        xRef.current.textContent = 'x.' + String(Math.round(currentX * 400)).padStart(3, '0')
      }
      if (yRef.current) {
        yRef.current.textContent = 'y.' + String(Math.round(currentY * 400)).padStart(3, '0')
      }

      animId = requestAnimationFrame(render)
    }

    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerleave', onLeave, { passive: true })
    animId = requestAnimationFrame(render)

    return () => {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      if (animId) cancelAnimationFrame(animId)
    }
  }, [])

  // plot when it first scrolls into view (like the old whileInView)
  useEffect(() => {
    const host = ref.current
    if (!host) return
    const obs = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        host.classList.add('drawn')
        obs.disconnect()
      }
    }, { threshold: 0.35 })
    obs.observe(host)
    return () => obs.disconnect()
  }, [])

  const replot = () => {
    const host = ref.current
    if (!host) return
    host.classList.remove('drawn')
    void host.offsetWidth // reflow to restart the plot
    host.classList.add('drawn')
  }

  return (
    <div className="monogram" ref={ref} onClick={replot} title="click to re-plot">
      <svg className="mono-svg" viewBox="0 0 400 400" role="img"
        aria-label="AS monogram — Ayush Singh signing mark" shapeRendering="geometricPrecision">
        {/* plotter-bed crosshair */}
        <g className="mono-cross">
          <line ref={hRef} className="mono-cx" x1="-40" y1="200" x2="440" y2="200" />
          <line ref={vRef} className="mono-cx" x1="200" y1="-40" x2="200" y2="440" />
        </g>
        <g className="mono-glyphs">
          {/* A — structure, plotted in bone */}
          <path className="mono-a" pathLength="1" d={A_PATH} />
          {/* S — signal, plotted in red, tracks the pointer */}
          <path ref={sRef} className="mono-s" pathLength="1" d={S_PATH} />
        </g>
      </svg>
      {/* plotter-bed coordinate readout */}
      <span className="mono-x" ref={xRef}>x.200</span>
      <span className="mono-y" ref={yRef}>y.200</span>
      {/* pixelised replay button top-right */}
      <button
        type="button"
        className="mono-replay"
        onClick={(e) => {
          e.stopPropagation()
          replot()
        }}
        title="REPLAY ANIMATION"
        aria-label="Replay animation"
      >
        <svg width="26" height="20" viewBox="0 0 13 10" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">
          {[
            '........#....',
            '.....##.##...',
            '...##...###..',
            '...#....##...',
            '..#.......#..',
            '..#.......#..',
            '..#.......#..',
            '...#.....#...',
            '...##...##...',
            '.....###.....',
          ].map((row, r) => 
            row.split('').map((cell, c) => 
              cell === '#' ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" /> : null
            )
          )}
        </svg>
      </button>
    </div>
  )
}
