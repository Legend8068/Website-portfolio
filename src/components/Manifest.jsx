import { Reveal } from '../lib/util.jsx'
import { SectionHeader } from './Machine.jsx'
import { bus, useSystem } from '../lib/systemBus.jsx'
import { MANIFEST } from '../lib/registry.js'

/* ============================================================
   SYSTEM MANIFEST — /etc/ayush.manifest
   The operator's profile rendered as a line-numbered config
   file. The modules block is LIVE: flipping graphics3d drops
   every visualization to wireframe, ui kills the compositor,
   ai swaps the copy to its deterministic fallback. One row is
   marked "do not touch". Touch it and see.
   ============================================================ */

const MODULE_ROWS = [
  { key: 'ui', comment: 'compositor · scanlines · sprites' },
  { key: 'graphics3d', comment: 'voxel core · dioramas' },
  { key: 'ai', comment: 'copywriter daemon' },
]

function Toggle({ mkey }) {
  const on = useSystem((s) => s.modules[mkey])
  return (
    <button
      type="button"
      className={'man-toggle' + (on ? ' on' : '')}
      role="switch"
      aria-checked={on}
      aria-label={`module ${mkey}`}
      onClick={() => {
        bus.set({ modules: { [mkey]: !on } })
        bus.log('MODULE_TOGGLE', `${mkey}=${!on}`)
      }}
    >
      {on ? 'true' : 'false'}
    </button>
  )
}

/* one numbered line of the config file */
function Ln({ n, indent = 0, children, className = '' }) {
  return (
    <div className={'man-line ' + className}>
      <span className="man-n">{String(n).padStart(2, '0')}</span>
      <span className="man-code" style={indent ? { paddingLeft: indent * 16 } : undefined}>{children}</span>
    </div>
  )
}

const K = ({ children }) => <span className="man-k">{children}</span>
const V = ({ children }) => <span className="man-v">{children}</span>
const C = ({ children }) => <span className="man-c">{children}</span>

export function Manifest() {
  let n = 0
  const ln = () => ++n
  return (
    <section id="manifest" className="board manifest-zone manifest-zone">
      <div className="wrap">
        <SectionHeader
          number="02"
          kicker="SECTOR 02 · ABOUT"
          title={<>About<span className="accent">.</span></>}
          sub="System manifest"
          lede="Computer Science & Design at SUTD, Singapore. The config file below is live — flip a module and the site actually changes."
        />

        <div className="manifest-grid">
          {/* the config file */}
          <Reveal className="man-file notch" delay={1}>
            <div className="man-bar">
              <span className="man-file-title">/etc/ayush.manifest</span>
              <span className="man-file-mode">-rw-r--r-- · root</span>
            </div>
            <div className="man-body">
              <Ln n={ln()}><C># ayush.manifest — system configuration</C></Ln>
              <Ln n={ln()}><K>identity</K>:</Ln>
              <Ln n={ln()} indent={1}><K>name</K>: <V>&quot;{MANIFEST.identity.name}&quot;</V></Ln>
              <Ln n={ln()} indent={1}><K>role</K>: <V>&quot;{MANIFEST.identity.role}&quot;</V></Ln>
              <Ln n={ln()} indent={1}><K>location</K>: <V>&quot;{MANIFEST.identity.location}&quot;</V></Ln>
              <Ln n={ln()}><K>education</K>:</Ln>
              <Ln n={ln()} indent={1}><K>school</K>: <V>&quot;{MANIFEST.education.school} · {MANIFEST.education.programme}&quot;</V></Ln>
              <Ln n={ln()} indent={1}><K>minor</K>: <V>&quot;{MANIFEST.education.minor}&quot;</V></Ln>
              <Ln n={ln()} indent={1}><K>span</K>: <V>{MANIFEST.education.span}</V></Ln>
              <Ln n={ln()}><K>focus</K>:</Ln>
              {MANIFEST.focus.map((f) => (
                <Ln key={f.label} n={ln()} indent={1}>
                  <span className="man-focus" data-focus={f.focus}>- <V>{f.label}</V></span>
                </Ln>
              ))}
              <Ln n={ln()}><K>availability</K>: <V>&quot;{MANIFEST.availability}&quot;</V></Ln>
              <Ln n={ln()}><K>currently</K>: <V>&quot;{MANIFEST.currently}&quot;</V></Ln>
              <Ln n={ln()}><K>modules</K>:  <C># live — click a value</C></Ln>
              {MODULE_ROWS.map((m) => (
                <Ln key={m.key} n={ln()} indent={1}>
                  <K>{m.key}</K>: <Toggle mkey={m.key} />  <C># {m.comment}</C>
                </Ln>
              ))}
              <Ln n={ln()} className="man-forbidden">
                <K>kernel_protection</K>:{' '}
                <button
                  type="button"
                  className="man-toggle on forbidden"
                  aria-label="kernel protection — do not touch"
                  onClick={() => bus.panic('manifest: kernel_protection tampered by visitor')}
                >true</button>
                {'  '}<C># DO NOT touch</C>
              </Ln>
              <Ln n={ln()}><C># EOF</C></Ln>
            </div>
          </Reveal>

          {/* the man page */}
          <Reveal className="man-page" delay={2}>
            <div className="man-page-head" style={{ justifyContent: 'center' }}>
              <span>User Commands</span>
            </div>
            <h3 className="man-page-h">NAME</h3>
            <p className="man-page-p">ayush</p>
            <h3 className="man-page-h">DESCRIPTION</h3>
            <p className="man-page-p tag-ai">
              A Computer Science &amp; Design student in Singapore. I&apos;m passionate about building elegant solutions to complex problems and regularly participate in hackathons to push my skills further.
              <br /><br />
              When I&apos;m not developing, you&apos;ll find me at hackathons, exploring new technologies, or working on creative side projects that blend design and engineering.
            </p>
            <p className="man-page-p tag-noai">
              A Computer Science &amp; Design student in Singapore. I&apos;m passionate about building elegant solutions to complex problems and regularly participate in hackathons to push my skills further.
              <br /><br />
              When I&apos;m not developing, you&apos;ll find me at hackathons, exploring new technologies, or working on creative side projects that blend design and engineering.
            </p>
            <h3 className="man-page-h">SEE ALSO</h3>
            <p className="man-page-p">
              <a href="#builds">builds(7)</a>, <a href="#memory">memmap(5)</a>, <a href="#transmit">uplink(1)</a>
            </p>
            <p className="man-page-sign">— Ayush</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
