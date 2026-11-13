import { useEffect, useRef, useState } from 'react'
import { bus } from '../lib/systemBus.jsx'

/* ============================================================
   WARP — how AYUSH.OS travels between subsystems.

   Every in-page jump (nav tab, gauge dot, shell command, chip
   click) runs a BLOCK WIPE: seven columns fall in from above to
   cover the screen, the scroll teleports underneath, then the
   columns keep falling out the bottom to reveal the new sector.
   It's the BlockLoader cascade from my-portfolio/, rethemed to
   the machine — frame-snapped, checker-textured, wordless.

   The crossing itself is silent: sector changes are still written
   to the session log, but nothing is announced on screen.
   ============================================================ */

const BLOCK_COUNT = 7
/* Must stay in step with --fall / --stagger in styles.css: one phase
   runs 280 + 6×80 = 760ms. COVER_MS sits just past the LAST column's
   landing so the jump always happens under full cover. */
const COVER_MS = 775
const UNCOVER_MS = 775

/* module singleton so any component can trigger a warp without
   threading refs through the tree */
let wipeHost = null

export function warpTo(hash) {
  const id = hash.startsWith('#') ? hash.slice(1) : hash
  const el = document.getElementById(id)
  if (!el) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  bus.log('JMP', '#' + id)
  history.replaceState(null, '', '#' + id)
  if (reduced || !wipeHost || wipeHost.busy() || bus.get().panic) {
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
    return
  }
  wipeHost.warp(el, id)
}

function BlockWipe() {
  const [phase, setPhase] = useState(null) // null | 'cover' | 'uncover'
  const busyRef = useRef(false)
  const timers = useRef([])

  useEffect(() => {
    wipeHost = {
      busy: () => busyRef.current,
      warp: (el) => {
        busyRef.current = true
        const top = el.offsetTop
        setPhase('cover')
        timers.current.push(setTimeout(() => {
          // the jump happens while the columns hold the screen
          window.scrollTo({ top, behavior: 'instant' })
          setPhase('uncover')
          timers.current.push(setTimeout(() => {
            setPhase(null)
            busyRef.current = false
          }, UNCOVER_MS))
        }, COVER_MS))
      },
    }
    return () => {
      wipeHost = null
      timers.current.forEach(clearTimeout)
      busyRef.current = false
    }
  }, [])

  /* any plain in-page anchor rides the warp automatically —
     nav tabs, manifest SEE ALSO links, the personnel-file link */
  useEffect(() => {
    const onClick = (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
      const a = e.target.closest('a[href^="#"]')
      if (!a) return
      const hash = a.getAttribute('href')
      if (!hash || hash.length < 2) return
      if (!document.getElementById(hash.slice(1))) return
      e.preventDefault()
      warpTo(hash)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <div className={'block-wipe' + (phase ? ' ' + phase : '')} aria-hidden="true">
      {Array.from({ length: BLOCK_COUNT }).map((_, i) => (
        <i key={i} className="bw-col" style={{ '--i': i }} />
      ))}
    </div>
  )
}

export function Warp() {
  return (
    <>
      <BlockWipe />
    </>
  )
}
