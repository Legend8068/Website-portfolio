/* ============================================================
   SESSION RECEIPT — the visit, printed.

   Writes a real PDF by hand rather than pulling in a generator:
   the whole document is a few hundred bytes of operators, and a
   library would have cost ~300KB of bundle for one button on a
   site whose entire claim is that nothing here came from a kit.

   Everything is ASCII by construction. The xref table stores
   byte offsets, so a single multi-byte character anywhere in the
   file would shift every offset after it and produce a PDF that
   readers reject — `ascii()` below is load-bearing, not tidying.
   ============================================================ */

import { BUILD_BY_SLUG, TECH_BY_ID } from './registry.js'

const PAGE_W = 595
const PAGE_H = 842
const M = 44                      // page margin
const FOOT = 58                   // reserved footer band

/* the site's palette, in PDF's 0..1 RGB */
const C = {
  bg: [0.094, 0.094, 0.102],       // --obsidian
  bone: [0.918, 0.902, 0.875],     // --bone
  dim: [0.647, 0.631, 0.604],      // --bone-dim
  faint: [0.431, 0.420, 0.400],    // --bone-faint
  red: [1.0, 0.310, 0.231],        // --red
  amber: [1.0, 0.722, 0.0],        // --amber
  rule: [0.227, 0.227, 0.251],     // --slate-3
}

const CW = 0.6                     // Courier advance, in em
const fmt = (n) => String(Math.round(n * 100) / 100)
const width = (s, size) => s.length * size * CW

/* fold the typography this site actually uses down to Latin-1,
   then drop anything still outside the printable range */
function ascii(v) {
  return String(v)
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/·/g, '.')
    .replace(/…/g, '...')
    .replace(/é/g, 'e')
    .replace(/Δ/g, 'd')
    .replace(/[^\x20-\x7E]/g, '')
}
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
const trunc = (s, n) => (s.length > n ? s.slice(0, n - 3) + '...' : s)

/* the section a visitor sees, not the DOM id it happens to have */
const SECTION_NAME = {
  boot: 'the home screen',
  manifest: 'About',
  kernel: 'Experience',
  builds: 'Projects',
  memory: 'Skills',
  transmit: 'Contact',
}
const MODULE_NAME = { ui: 'the compositor', graphics3d: '3D graphics', ai: 'the AI copy' }

/* Turn one log line into a sentence. The transcript used to lean on a
   DETAIL column to make sense; with that gone the event has to say what
   the visitor actually did, so slugs and ids get resolved to the names
   they carry on screen. */
export function describe(e) {
  const d = String(e.detail || '')
  switch (e.type) {
    case 'BOOT': return 'Booted AYUSH.OS'
    case 'SECTION_ENTER': return `Viewed ${SECTION_NAME[d] || d}`
    case 'CMD': return `Ran command "${trunc(d, 30)}"`
    case 'BUILD_OPEN': return `Opened project ${BUILD_BY_SLUG[d]?.title || d}`
    case 'FILTER_SET': return d === 'null'
      ? 'Cleared the project filter'
      : `Filtered projects by ${TECH_BY_ID[d]?.name || d}`
    case 'MODULE_TOGGLE': {
      const [k, v] = d.split('=')
      return `${v === 'true' ? 'Enabled' : 'Disabled'} ${MODULE_NAME[k] || k}`
    }
    case 'GAME_START': return 'Started CoreRun'
    case 'GAME_OVER': {
      const m = d.match(/score\s+(\d+)/i)
      const hit = d.match(/·\s*([a-z]+)\s*·/i)
      return `Played CoreRun${m ? ` - scored ${parseInt(m[1], 10)}` : ''}${hit ? ` (hit a ${hit[1]})` : ''}`
    }
    case 'LINK_OUT': {
      if (d.startsWith('mailto:')) return 'Opened the email link'
      if (d.includes('github')) return 'Opened GitHub'
      if (d.includes('linkedin')) return 'Opened LinkedIn'
      return `Followed a link to ${trunc(d.replace(/^https?:\/\//, ''), 34)}`
    }
    case 'RESUME_OPEN': return 'Opened the resume PDF'
    case 'DOWNLOAD': return 'Downloaded this receipt'
    case 'PANIC': return `Triggered a kernel panic (${trunc(d, 28)})`
    case 'REBOOT': return 'Rebooted after the panic'
    default: return `${e.type}${d ? ' - ' + trunc(d, 34) : ''}`
  }
}

function newPage() {
  const ops = []
  const api = {
    ops,
    rect(x, y, w, h, c) {
      ops.push(`${c.join(' ')} rg`, `${fmt(x)} ${fmt(PAGE_H - y - h)} ${fmt(w)} ${fmt(h)} re f`)
    },
    line(x1, y1, x2, y2, c, w = 0.6, dash = null) {
      ops.push(`${c.join(' ')} RG`, `${fmt(w)} w`, dash ? `[${dash}] 0 d` : '[] 0 d',
        `${fmt(x1)} ${fmt(PAGE_H - y1)} m ${fmt(x2)} ${fmt(PAGE_H - y2)} l S`)
    },
    text(str, x, y, { size = 8.5, font = 'F1', c = C.bone, tc = 0 } = {}) {
      ops.push('BT', `/${font} ${fmt(size)} Tf`, `${c.join(' ')} rg`, `${fmt(tc)} Tc`,
        `1 0 0 1 ${fmt(x)} ${fmt(PAGE_H - y)} Tm`, `(${esc(ascii(str))}) Tj`, 'ET')
    },
    right(str, x, y, o = {}) {
      const s = ascii(str)
      const tc = o.tc || 0
      api.text(s, x - (width(s, o.size || 8.5) + tc * s.length), y, o)
    },
  }
  return api
}

/* page furniture every sheet carries */
function chrome(p) {
  p.rect(0, 0, PAGE_W, PAGE_H, C.bg)
  p.rect(0, 0, PAGE_W, 5, C.red)              // the accent bar, top edge
}

function footer(p, n, total) {
  const y = PAGE_H - 40
  p.line(M, y - 14, PAGE_W - M, y - 14, C.rule, 0.6, '2 3')
  p.text('END OF LOG . EXIT CODE 0', M, y, { size: 7, c: C.faint, tc: 1.4 })
  p.right(`PAGE ${n} / ${total}`, PAGE_W - M, y, { size: 7, c: C.faint, tc: 1.4 })
}

/* a KEY  value row, monospace so the columns line up for free */
function row(p, y, key, val, o = {}) {
  p.text(key, M, y, { size: 7.5, c: C.faint, tc: 1.2 })
  p.text(trunc(String(val), 58), M + 104, y, { size: 8.5, c: o.c || C.bone })
  return y + 15
}

function sectionRule(p, y, label) {
  p.line(M, y, PAGE_W - M, y, C.rule, 0.6)
  p.text(label, M, y + 15, { size: 7, c: C.amber, tc: 2 })
  return y + 30
}

export function buildReceipt({ events, stampOf, generated, operator }) {
  /* ── flow the transcript across as many sheets as it needs ── */
  const ROW_H = 13.6
  const pages = []
  let p = newPage()
  chrome(p)
  pages.push(p)

  let y = 66

  // masthead
  p.text('AYUSH.OS', M, y, { size: 19, font: 'F2', c: C.bone })
  p.rect(PAGE_W - M - 46, y - 8, 8, 8, C.red)
  p.right('v26.07', PAGE_W - M, y, { size: 8, c: C.dim })
  y += 15
  p.text('SESSION RECEIPT', M, y, { size: 7, c: C.faint, tc: 2.6 })
  y += 30

  y = sectionRule(p, y, 'OPERATOR')
  y = row(p, y, 'NAME', operator.name)
  y = row(p, y, 'ROLE', operator.role)
  y = row(p, y, 'LOCATION', operator.location)
  y = row(p, y, 'EDUCATION', operator.education)
  y = row(p, y, 'AVAILABLE', operator.available, { c: C.amber })
  y += 12

  y = sectionRule(p, y, 'CHANNELS')
  for (const [k, v] of operator.channels) y = row(p, y, k, v)
  y = row(p, y, 'GENERATED', generated, { c: C.dim })
  y += 12

  // the count lives on the rule instead of in a block of its own
  y = sectionRule(p, y, 'SESSION TRANSCRIPT')
  p.right(`${events.length} EVENTS`, PAGE_W - M, y - 15, { size: 7, c: C.faint, tc: 1.4 })
  y -= 4
  p.text('TIME', M, y, { size: 6.5, c: C.faint, tc: 1.2 })
  p.text('EVENT', M + 104, y, { size: 6.5, c: C.faint, tc: 1.2 })
  y += 7
  p.line(M, y, PAGE_W - M, y, C.rule, 0.6)
  y += 15

  events.forEach((e) => {
    if (y > PAGE_H - FOOT - ROW_H) {
      p = newPage()
      chrome(p)
      pages.push(p)
      y = 66
      p.text('SESSION TRANSCRIPT . CONTINUED', M, y, { size: 7, c: C.amber, tc: 2 })
      y += 9
      p.line(M, y, PAGE_W - M, y, C.rule, 0.6)
      y += 17
    }
    p.text(stampOf(e.t), M, y, { size: 7.5, c: C.faint })
    p.text(trunc(describe(e), 62), M + 104, y, {
      size: 8, c: e.type === 'PANIC' ? C.red : C.bone,
    })
    y += ROW_H
  })

  pages.forEach((pg, i) => footer(pg, i + 1, pages.length))

  /* ── assemble the file ── */
  const objs = []
  const add = (body) => objs.push(body) // returns new length; ids are 1-based

  add('<< /Type /Catalog /Pages 2 0 R >>')                 // 1
  add('')                                                   // 2 — Pages, patched below
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>')      // 3
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>') // 4

  const kids = []
  for (const pg of pages) {
    const stream = pg.ops.join('\n')
    const contentId = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)
    const pageId = add(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`
    )
    kids.push(`${pageId} 0 R`)
  }
  objs[1] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pages.length} >>`

  let out = '%PDF-1.4\n'
  const offsets = []
  objs.forEach((body, i) => {
    offsets.push(out.length)
    out += `${i + 1} 0 obj\n${body}\nendobj\n`
  })
  const xref = out.length
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`
  for (const off of offsets) out += String(off).padStart(10, '0') + ' 00000 n \n'
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`

  return out
}
