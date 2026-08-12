import { useEffect, useRef } from 'react'

/* ============================================================
   MONITOR FRAME — a pixel CRT bezel around any visualization.
   Corner screws, a power LED, and a retro scan overlay: 'radar'
   sweeps a rotating beam, 'scope' drags a vertical trace line.
   Sweeps only run while the monitor is on screen (.live), and
   never under reduced motion or with the ui module unloaded.
   ============================================================ */

/* one shared observer for every monitor on the page */
let sharedObs = null
function getObserver() {
  if (!sharedObs) {
    sharedObs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('live', e.isIntersecting)),
      { rootMargin: '80px 0px' }
    )
  }
  return sharedObs
}

export function MonitorFrame({ title = 'DISPLAY 01', mode = 'none', badge, children, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = getObserver()
    obs.observe(el)
    return () => obs.unobserve(el)
  }, [])

  return (
    <div className={'monitor ' + className} ref={ref}>
      <div className="mon-bar">
        <i className="mon-screw" aria-hidden="true" />
        <span className="mon-title">{title}</span>
        <span className="mon-led" aria-hidden="true" />
        <i className="mon-screw" aria-hidden="true" />
      </div>
      <div className="mon-screen">
        {children}
        {badge && <span className="mon-badge">{badge}</span>}
      </div>
      <div className="mon-foot">
        <i className="mon-screw" aria-hidden="true" />
        <i className="mon-screw" aria-hidden="true" />
      </div>
    </div>
  )
}
