/* ============================================================
   NAV — process tabs across the top edge, plus the address
   gauge: a rail down the right that reads the scroll position
   out as a memory address. The labels ARE the story: the page
   boots, assembles, ships, runs, exits clean.
   ============================================================ */

const TABS = [
  { href: '#manifest', label: 'About' },
  { href: '#kernel', label: 'Experience' },
  { href: '#builds', label: 'Projects' },
  { href: '#memory', label: 'Skills' },
  { href: '#transmit', label: 'Contact' },
]

export function Nav() {
  return (
    <header className="nav">
      <a className="nav-brand" href="#boot">
        <span className="brand-mark" aria-hidden="true" />
        Ayush Singh
      </a>
      <nav className="nav-tabs" aria-label="Sections">
        {TABS.map((t) => (
          <a key={t.href} className="nav-tab" href={t.href}>{t.label}</a>
        ))}
      </nav>
    </header>
  )
}

