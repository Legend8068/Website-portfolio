import { useEffect, useRef, useState } from 'react'
import { bus, useSystem } from '../lib/systemBus.jsx'
import { PANIC_REGISTERS, SECTION_IDS } from '../lib/registry.js'

/* ============================================================
   KERNEL PANIC — the easter egg. `sudo rm -rf /` in the boot
   prompt (or tampering with kernel_protection in the manifest)
   drops the whole machine: inverse-video flash, a register dump
   built from the real skill addresses, a scanline collapse, and
   a compressed reboot. Scroll position survives. Any key skips.
   ============================================================ */

const REBOOT_LINES = [
  'AYUSH.OS v26.07 — recovery boot',
  'fsck /portfolio ............ clean',
  'restoring session .......... OK',
  'session restored — no recruiters were harmed.',
]

export function KernelPanic() {
  const reason = useSystem((s) => s.panic)
  return reason ? <PanicOverlay reason={reason} /> : null
}

function PanicOverlay({ reason }) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // phases: flash → dump → collapse → reboot
  const [phase, setPhase] = useState(reduced ? 'dump' : 'flash')
  const timers = useRef([])
  const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)) }

  // lock body scroll while panicking
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = '' }
  }, [])

  useEffect(() => {
    if (reduced) return () => {}
    if (phase === 'flash') later(() => setPhase('dump'), 260)
    if (phase === 'dump') later(() => setPhase('collapse'), 4000)
    if (phase === 'collapse') later(() => setPhase('reboot'), 800)
    if (phase === 'reboot') later(() => bus.reboot(), 2100)
    return () => { timers.current.forEach(clearTimeout); timers.current = [] }
  }, [phase, reduced])

  // any key / click skips forward
  useEffect(() => {
    const skip = () => {
      if (reduced) { bus.reboot(); return }
      setPhase((ph) => (ph === 'dump' ? 'collapse' : ph === 'flash' ? 'dump' : ph))
    }
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    return () => {
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
  }, [reduced])

  return (
    <div className={'panic ' + phase} role="alertdialog" aria-live="assertive"
      aria-label="Kernel panic — the system is rebooting. Press any key to skip.">
      {phase === 'flash' && <div className="panic-flash" />}

      {(phase === 'dump' || phase === 'collapse') && (
        <div className={'panic-dump' + (phase === 'collapse' ? ' collapsing' : '')}>
          <div className="panic-noise" aria-hidden="true" />
          <p className="panic-line t" style={{ '--pl': 0 }}>KERNEL PANIC — not syncing: {reason}</p>
          <p className="panic-line" style={{ '--pl': 1 }}>PC: 0xDEAD  SP: 0xC0DE  FLAGS: [ HIRE ]</p>
          <p className="panic-line" style={{ '--pl': 2 }}>&nbsp;</p>
          <div className="panic-regs" style={{ '--pl': 3 }}>
            {PANIC_REGISTERS.map((r) => (
              <span key={r.reg} className="panic-reg">
                {r.reg}: {r.addr} &lt;{r.sym}&gt;
              </span>
            ))}
          </div>
          <p className="panic-line" style={{ '--pl': 4 }}>&nbsp;</p>
          <p className="panic-line" style={{ '--pl': 5 }}>call trace:</p>
          {SECTION_IDS.map((id, i) => (
            <p key={id} className="panic-line trace" style={{ '--pl': 6 + i }}>
              &nbsp;&nbsp;[&lt;{(0xF000 + i * 0x111).toString(16)}&gt;] #{id}+0x{(i * 34).toString(16)}
            </p>
          ))}
          <p className="panic-line" style={{ '--pl': 13 }}>&nbsp;</p>
          <p className="panic-line" style={{ '--pl': 14 }}>dumping core to SESSION.LOG ............ done</p>
          <p className="panic-line dim" style={{ '--pl': 15 }}>
            {reduced ? '[ PRESS ANY KEY TO REBOOT ]' : '[ press any key to skip ]'}
          </p>
        </div>
      )}

      {phase === 'collapse' && <div className="panic-beam" aria-hidden="true" />}

      {phase === 'reboot' && (
        <div className="panic-reboot">
          {REBOOT_LINES.map((l, i) => (
            <p key={i} className="panic-line" style={{ '--pl': i }}>{l}</p>
          ))}
        </div>
      )}
    </div>
  )
}
