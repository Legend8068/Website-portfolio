import { TECHS, BUILDS, TECH_BY_ID, buildsUsing } from './registry.js'

/* ============================================================
   SHELL — a pure command engine. runCommand() never touches the
   DOM or the bus; it returns lines to print and effects for the
   caller (BootPrompt) to execute. This keeps panic / filter /
   scroll wiring in one place and the parser trivially testable.

   returns { lines: [{t:'cmd'|'out'|'err', s}], effects: [...] }
   effect types: { clear } | { scroll:'#id' } | { open:url }
                 | { filter: techId|null } | { panic: reason }
   ============================================================ */

function out(s) { return { t: 'out', s } }
function err(s) { return { t: 'err', s } }

const HELP = [
  out('available commands:'),
  out('  whoami       who is at the keyboard'),
  out('  manifest     open /etc/ayush.manifest'),
  out('  projects     list deployed builds'),
  out('  stack        show the loaded modules'),
  out('  stack <mod>  filter builds by module (e.g. stack react)'),
  out('  resume       open the résumé PDF'),
  out('  contact      open the transmission channel'),
  out('  sudo hire    (go on)'),
  out('  clear        wipe the console'),
]

const WHOAMI = [
  out('ayush — Computer Science & Design, SUTD (2024-2028).'),
  out('software engineer · designer · builder · Singapore.'),
  out('open to SWE / creative-engineering internships from S26.'),
]

/* AI-flavour lines are stripped when the ai module is unloaded */
const AI_FLAVOUR = [
  out('// hint: the whole page is one machine. try hovering a chip'),
  out('// in MEMORY MAP, or toggling a module in the manifest.'),
]

function projectsLines() {
  const rows = BUILDS.map((b) => {
    const dots = '.'.repeat(Math.max(2, 18 - b.title.length))
    return out(`  ${b.title} ${dots} [${b.state}]`)
  })
  return [out('deployed builds:'), ...rows]
}

function stackLines() {
  const byKind = { ui: [], lang: [], sys: [] }
  TECHS.forEach((t) => { (byKind[t.kind] || byKind.sys).push(t.name) })
  return [
    out('loaded modules:'),
    out('  languages ... ' + byKind.lang.join(' · ')),
    out('  interface ... ' + byKind.ui.join(' · ')),
    out('  systems ..... ' + byKind.sys.join(' · ')),
  ]
}

export function runCommand(raw, sys = {}) {
  const cmd = String(raw || '').trim()
  const lc = cmd.toLowerCase()
  const lines = [{ t: 'cmd', s: cmd }]
  const effects = []

  if (!cmd) return { lines: [], effects }

  // clear
  if (lc === 'clear' || lc === 'cls') {
    return { lines: [], effects: [{ clear: true }] }
  }

  // help
  if (lc === 'help' || lc === '?' || lc === 'man') {
    lines.push(...HELP)
    return { lines, effects }
  }

  if (lc === 'whoami') {
    lines.push(...WHOAMI)
    if (sys.ai !== false) lines.push(...AI_FLAVOUR)
    return { lines, effects }
  }

  if (lc === 'manifest' || lc === 'cat /etc/ayush.manifest') {
    lines.push(out('opening /etc/ayush.manifest ...'))
    effects.push({ scroll: '#manifest' })
    return { lines, effects }
  }

  if (lc === 'projects' || lc === 'ls builds' || lc === 'ls /var/builds') {
    lines.push(...projectsLines())
    effects.push({ scroll: '#builds' })
    return { lines, effects }
  }

  // stack / stack <tech>
  if (lc === 'stack') {
    lines.push(...stackLines())
    return { lines, effects }
  }
  if (lc.startsWith('stack ')) {
    const arg = lc.slice(6).trim().replace(/\s+/g, '-')
    // accept id or name (react, next.js → nextjs, three.js → threejs)
    const norm = arg.replace(/\./g, '').replace('js', 'js')
    const match = TECH_BY_ID[arg] || TECH_BY_ID[norm]
      || TECHS.find((t) => t.name.toLowerCase() === lc.slice(6).trim())
      || TECHS.find((t) => t.name.toLowerCase().replace(/[.\s]/g, '') === norm)
    if (!match) {
      lines.push(err(`stack: unknown module "${lc.slice(6).trim()}"`))
      lines.push(out('valid modules: ' + TECHS.map((t) => t.id).join(', ')))
      return { lines, effects }
    }
    const n = buildsUsing(match.id).length
    lines.push(out(`filter applied: ${match.id} — ${n} build${n === 1 ? '' : 's'} matched`))
    effects.push({ filter: match.id }, { scroll: '#builds' })
    return { lines, effects }
  }

  if (lc === 'resume' || lc === 'cv' || lc === 'cat resume.pdf') {
    lines.push(out('spawning viewer → /Ayush-Singh-Resume.pdf'))
    effects.push({ open: '/Ayush-Singh-Resume.pdf' })
    return { lines, effects }
  }

  if (lc === 'contact' || lc === 'transmit' || lc === 'uplink') {
    lines.push(out('opening transmission channel ...'))
    effects.push({ scroll: '#transmit' })
    return { lines, effects }
  }

  if (lc === 'sudo hire' || lc === 'sudo hire ayush') {
    lines.push(out('[sudo] password for recruiter: ********'))
    lines.push(out('permission granted.'))
    lines.push(out('scheduling interview with ayush ......... done'))
    lines.push(out("(reach him for real with 'contact' — he replies fast.)"))
    effects.push({ scroll: '#transmit' })
    return { lines, effects }
  }

  // the forbidden command
  if (lc === 'sudo rm -rf /' || lc === 'rm -rf /' || lc === 'sudo rm -rf /*') {
    lines.push(out('[sudo] password for recruiter: ********'))
    lines.push(err('rm: removing all subsystems ...'))
    return { lines, effects: [{ panic: 'recruiter ran `sudo rm -rf /`' }] }
  }

  if (lc === 'ls') {
    lines.push(out('boot/  manifest/  kernel/  builds/  memory/  transmit/'))
    return { lines, effects }
  }
  if (lc === 'pwd') {
    lines.push(out('/proc/ayush/boot'))
    return { lines, effects }
  }
  if (lc === 'exit' || lc === 'logout') {
    lines.push(out('nice try — this process does not exit. scroll instead.'))
    return { lines, effects }
  }

  lines.push(err(`command not found: ${cmd.split(' ')[0]}`))
  lines.push(out("type 'help' for the list."))
  return { lines, effects }
}

export const BOOT_HINT = "type 'help' to look around · try 'sudo hire'"
