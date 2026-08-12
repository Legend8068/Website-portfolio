import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Reveal } from '../lib/util.jsx'
import { SectionHeader, DitherEdge } from './Machine.jsx'
import { Monogram } from './Monogram.jsx'
import { ExitSeal } from './Trace.jsx'
import { MonitorFrame } from './MonitorFrame.jsx'
import { PunchcardTape } from './PunchcardTape.jsx'
import { CoreRun } from './CoreRun.jsx'
import { bus } from '../lib/systemBus.jsx'

/* ============================================================
   TRANSMISSION CHANNEL — the uplink console. Three channels
   with live signal bars, the résumé, and the machine's parting
   trick: it has been logging this whole visit, and the visitor
   can take the tape home. DOWNLOAD SESSION.LOG.
   Then the machine hands over the keyboard: CORERUN.
   ============================================================ */

const CHANNELS = [
  { k: 'CH 01 · EMAIL', v: 'ayushsinghsolanki06@gmail.com', href: 'mailto:ayushsinghsolanki06@gmail.com', sig: 5 },
  { k: 'CH 02 · GITHUB', v: 'github.com/Legend8068', href: 'https://github.com/Legend8068', sig: 4 },
  { k: 'CH 03 · LINKEDIN', v: 'linkedin.com/in/ayush-singh0606', href: 'https://www.linkedin.com/in/ayush-singh0606', sig: 4 },
]

/* ── the live tail — mounts only when scrolled near so log
   writes earlier in the visit re-render nothing at all ────── */
function LogTailInner() {
  // subscribe to the version counter — the buffer itself is a stable
  // mutated reference, which useSyncExternalStore would never see change
  useSyncExternalStore(bus.subscribeLog, bus.getLogVersion, bus.getLogVersion)
  const log = bus.getLog()
  const tail = log.slice(-12)
  const bodyRef = useRef(null)
  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [log.length])
  return (
    <div className="logtail-body" ref={bodyRef}>
      {tail.map((e, i) => (
        <p key={log.length - tail.length + i} className="logtail-line">
          <span className="logtail-t">[{bus.stamp(e.t)}]</span>{' '}
          <b className={'logtail-type ' + e.type.toLowerCase()}>{e.type}</b>{' '}
          <span className="logtail-d">{e.detail}</span>
        </p>
      ))}
      <p className="logtail-line cursor-line" aria-hidden="true"><i className="logtail-cursor" /></p>
    </div>
  )
}

function SessionLogTail() {
  const [near, setNear] = useState(false)
  const hostRef = useRef(null)
  useEffect(() => {
    const el = hostRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) { setNear(true); obs.disconnect() } },
      { rootMargin: '600px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <Reveal className="logtail-wrap" delay={1}>
      <div ref={hostRef}>
        <MonitorFrame title="tail -f /var/log/session.log" mode="none" className="logtail-monitor">
          {near ? <LogTailInner /> : <div className="logtail-body" />}
        </MonitorFrame>
        <div className="logtail-actions">
          <p className="logtail-note">
            This machine has been logging your visit — every command, every sector,
            every chip you probed. Take the receipt: a printable PDF of the transcript,
            with my contact details on it.
          </p>
          <button type="button" className="cmd-btn logtail-dl" onClick={() => bus.downloadLog()}>
            DOWNLOAD SESSION RECEIPT · PDF
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v9m0 0 3.5-3.5M8 11 4.5 7.5M3 14h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter"/></svg>
          </button>
        </div>
      </div>
    </Reveal>
  )
}

function SignalBars({ n }) {
  return (
    <span className="sig-bars" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={i <= n ? 'on' : ''} style={{ height: 3 + i * 2 }} />
      ))}
    </span>
  )
}

export function Transmit() {
  return (
    <section id="transmit" className="board board-a transmit-zone">
      <div className="wrap">
        <div className="contact-head">
          <SectionHeader
            number="06"
            kicker="SECTOR 06 · CONTACT"
            title={<>Contact<span className="accent">.</span></>}
            sub="Uplink channel"
            lede="I’m in Singapore, open to software, AI and creative-engineering internships from summer 2026. A project idea, a hackathon team, or just a good question all reach me the same way."
          />

          <Reveal className="punchcard-side" delay={0.8}>
            <PunchcardTape />
          </Reveal>
        </div>

        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(40px, 6vw, 80px)', marginTop: 'clamp(40px, 8vh, 80px)', alignItems: 'center' }}>
          <Reveal delay={1} className="contact-image pop-in" style={{ transformOrigin: 'center bottom' }}>
            <MonitorFrame title="SIGNATURE · AS.key" mode="none">
              <Monogram />
            </MonitorFrame>
          </Reveal>

          <Reveal className="letter-content" delay={1.5}>
            <p className="letter-salute" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--bone)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block', boxShadow: '0 0 8px var(--red)' }} />
              BEGIN TRANSMISSION
            </p>
            <nav className="letter-links" aria-label="Contact links" style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '24px 0' }}>
              {CHANNELS.map((l) => (
                <a key={l.k} href={l.href}
                  onClick={() => bus.log('LINK_OUT', l.href)}
                  className="channel-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    background: 'var(--obsidian)',
                    border: '1px solid var(--line-soft)',
                    textDecoration: 'none',
                    color: 'var(--bone)',
                    boxShadow: 'var(--lift-0)',
                    transition: 'all 0.2s ease',
                  }}
                  {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  <span className="k" style={{ fontSize: '11px', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--red)', minWidth: '120px' }}>{l.k}</span>
                  <span className="v" style={{ fontSize: '14px', flex: 1, color: 'var(--bone)' }}>{l.v}</span>
                  <SignalBars n={l.sig} />
                  <svg viewBox="0 0 16 16" aria-hidden="true" style={{ width: '16px', height: '16px', opacity: 0.6, flexShrink: 0 }}>
                    <path d="M4 12 12 4M6 4h6v6" fill="none" stroke="currentColor"
                      strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
                  </svg>
                </a>
              ))}
            </nav>
            <div className="channel-resume">
              <a className="cmd-btn" href="/Ayush-Singh-Resume.pdf" target="_blank" rel="noopener noreferrer"
                onClick={() => bus.log('RESUME_OPEN', '/Ayush-Singh-Resume.pdf')}>
                Download résumé · PDF
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v9m0 0 3.5-3.5M8 11 4.5 7.5M3 14h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter"/></svg>
              </a>
              <a className="channel-resume-link" href="#proctable">See the full process table →</a>
            </div>
            <p className="letter-sign" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--bone)', marginTop: '32px' }}>END TRANSMISSION — Ayush</p>

          </Reveal>
        </div>

        <SessionLogTail />

        <CoreRun />
      </div>

      {/* the machine powers down: the last board dissolves into
          the void, one red pixel drifting in the falloff */}
      <div className="sunset-footer" aria-hidden="true">
        <DitherEdge deep from="var(--obsidian)" to="var(--void)" seed={23} spark="var(--red)" />
      </div>
    </section>
  )
}
