/* ============================================================
   REGISTRY — the single source of truth for the machine.
   Every tech chip, every deployed build, and the manifest all
   read from here so that cross-highlight tokens (data-uses on a
   build, data-tech-id on a chip) can never drift out of sync.

   The `id` field is the token used verbatim in data-attributes
   AND in the generated CSS highlight rules. Never rename an id
   without updating styles.css.
   ============================================================ */

/* ── TECHS ───────────────────────────────────────────────────
   x / y are percentage positions on the motherboard (MEMORY
   MAP). addr is the chip's memory address. kind drives the glyph
   and the manifest focus grouping. */
/* 16 chips, every one named on the résumé. Most are loaded by a build
   below; Next.js, TypeScript and Express.js are capability chips that
   no featured build claims, so they read as "core only" in the probe
   readout rather than pretending a link that isn't there.
   Two columns per side, four above the core's row and four below. */
export const TECHS = [
  /* ── left bank: languages and runtimes ── */
  { id: 'react', name: 'React', addr: '0x01A3', kind: 'ui', pins: 8, x: 12, y: 8, note: 'Component-based UI — the interface layer of every build.' },
  { id: 'nextjs', name: 'Next.js', addr: '0x02F0', kind: 'ui', pins: 8, x: 12, y: 20, note: 'Full-stack React framework — routing, SSR, the works.' },
  { id: 'typescript', name: 'TypeScript', addr: '0x0410', kind: 'lang', pins: 6, x: 30, y: 32, note: 'Static types — the compiler catches it before the user does.' },
  { id: 'javascript', name: 'JavaScript', addr: '0x05C8', kind: 'lang', pins: 6, x: 30, y: 44, note: 'The language of the browser — where interaction lives.' },
  { id: 'python', name: 'Python', addr: '0x06D4', kind: 'lang', pins: 6, x: 30, y: 56, note: 'Scripting, backends, and the glue between services.' },
  { id: 'java', name: 'Java', addr: '0x0840', kind: 'lang', pins: 8, x: 30, y: 68, note: 'The Android runtime — native apps that ship to a phone.' },
  { id: 'nodejs', name: 'Node.js', addr: '0x0722', kind: 'sys', pins: 8, x: 12, y: 80, note: 'JavaScript on the server — one language, both ends.' },
  { id: 'express', name: 'Express.js', addr: '0x0E44', kind: 'sys', pins: 6, x: 12, y: 92, note: 'The thin API layer — routes, middleware, nothing spare.' },
  /* ── right bank: libraries, services and tooling ── */
  { id: 'threejs', name: 'Three.js', addr: '0x0955', kind: 'ui', pins: 8, x: 88, y: 8, note: 'Real-time 3D in the browser — WebGL without the boilerplate.' },
  { id: 'gsap', name: 'GSAP', addr: '0x0B60', kind: 'ui', pins: 6, x: 88, y: 20, note: 'Scroll choreography — the timeline behind this machine.' },
  { id: 'leaflet', name: 'Leaflet', addr: '0x0C2C', kind: 'sys', pins: 6, x: 70, y: 32, note: 'Interactive maps — the canvas for SG-MeetHalfway.' },
  { id: 'telegram-api', name: 'Telegram', addr: '0x0D90', kind: 'sys', pins: 6, x: 70, y: 44, note: 'Bot platform API — chat becomes the interface.' },
  { id: 'firebase', name: 'Firebase', addr: '0x0F18', kind: 'sys', pins: 6, x: 70, y: 56, note: 'Hosted auth and realtime data — a backend without running one.' },
  { id: 'sqlite', name: 'SQLite', addr: '0x1024', kind: 'sys', pins: 6, x: 70, y: 68, note: 'A database in a single file — state that survives a restart.' },
  { id: 'vite', name: 'Vite', addr: '0x11B0', kind: 'sys', pins: 6, x: 88, y: 80, note: 'The dev server and bundler this machine is built on.' },
  { id: 'git', name: 'Git', addr: '0x0A18', kind: 'sys', pins: 6, x: 88, y: 92, note: 'Version control — nothing is erased, only committed.' },
]

export const TECH_BY_ID = Object.fromEntries(TECHS.map((t) => [t.id, t]))

/* ── BUILDS ──────────────────────────────────────────────────
   `uses` tokens MUST be TECHS ids. `incident` / `resolution`
   replace the old problem / solution framing. Diorama is bound
   by slug inside Builds.jsx to avoid coupling data → components. */
export const BUILDS = [
  {
    slug: 'sg-meethalfway',
    num: '01', title: 'SG-MeetHalfway', tag: 'SPATIAL · SOCIAL', year: '2026',
    state: 'LIVE', mode: 'radar',
    summary: 'A web app that computes a fair meeting point for a group, weighted by real transit time.',
    incident: 'A geometric centre is unfair — it ignores that trains do not run in straight lines. Some friend always eats the whole commute.',
    resolution: 'Weight every leg by real transit time from routing APIs, then search for the point that minimises the group’s worst commute.',
    uses: ['react', 'leaflet', 'javascript', 'git'],
    link: 'https://sg-meet-halfway.vercel.app/',
    photo: '/builds/sg-meethalfway.png',
  },
  {
    slug: 'worldcup',
    num: '02', title: 'World Cup Tracker', tag: 'REALTIME · SPORT', year: '2026',
    state: 'LIVE', mode: 'scope',
    summary: 'A live match tracker for the 2026 FIFA World Cup — real-time scores, standings and fixtures in one interface.',
    incident: 'Following a tournament means juggling three tabs: the score here, the group table there, the next kick-off somewhere else. By the time the picture assembles, the moment has passed.',
    resolution: 'Poll the feeds on a timer and reconcile them into a single state, so scores, standings and fixtures all update in place with no refresh.',
    uses: ['react', 'javascript', 'nodejs', 'git'],
    link: 'https://wc2026tracker-seven.vercel.app/',
    photo: '/builds/worldcup.png',
  },
  {
    slug: 'genai-detect',
    num: '03', title: 'Detecting GenAI Text', tag: 'MACHINE LEARNING', year: '2026',
    state: 'SHIPPED', mode: 'scope',
    summary: 'A human-versus-machine text classifier for 50.007 Machine Learning — logistic regression, PCA and KNN written from scratch, then a classical-ML run at the Kaggle leaderboard. No deep learning, no LLMs.',
    incident: 'Our internal tests showed high accuracy, but the actual leaderboard scores were much lower. Even after building many complex models, the gap remained because the training data and testing data were fundamentally different. This meant we could not trust our own progress metrics.',
    resolution: 'We changed our strategy to analyze writing style instead of the topic. We also built a custom testing system that accurately mirrored the final grading environment. This allowed us to properly evaluate our models and ultimately secure a strong final score.',
    uses: ['python', 'git'],
    /* the deck is the deliverable — served straight out of /builds */
    link: '/builds/detecting-genai-text-slides.pdf',
    linkLabel: 'Open the slides',
    photo: '/builds/genai-detect.png',
  },
  {
    slug: 'makanmates',
    num: '04', title: 'MakanMates', tag: 'ANDROID · SOCIAL', year: '2026',
    state: 'SHIPPED', mode: 'radar',
    summary: 'An Android app that recommends food spots for a group, weighting everyone’s location by real transit time so the pick is fair.',
    incident: 'Deciding where to eat as a group defaults to whoever shouts loudest, and someone always ends up travelling twice as far as everybody else for it.',
    resolution: 'Compute transit weighted travel times across every group member’s location to rank fair food venues, shipped as a native Android app for one tap decisions on the way out the door.',
    uses: ['java', 'firebase', 'git'],
    /* no live deployment yet — the link is a recorded walkthrough */
    link: '/builds/makanmates-demo.mp4',
    linkLabel: 'Watch the demo',
    photo: '/builds/makanmates.svg',
    /* A4-portrait artwork — fill the frame from the top edge rather
       than letterboxing it down to a sliver */
    photoFit: 'top',
  },
  {
    slug: 'ayush-os',
    num: '05', title: 'AYUSH.OS', tag: 'THIS MACHINE', year: '2026',
    state: 'LIVE', mode: 'scope',
    summary: 'The system you are inside right now — a portfolio built as a working pixel operating system.',
    incident: 'A portfolio that just lists skills is forgettable. A recruiter closes the tab and remembers nothing.',
    resolution: 'Build the portfolio itself as an interconnected machine: a real shell, live module toggles, a motherboard memory map, and a session log you can download.',
    uses: ['react', 'gsap', 'javascript', 'threejs', 'vite', 'git'],
  },
  {
    slug: 'taskbot',
    num: '06', title: 'Telegram Task Bot', tag: 'AUTOMATION', year: '2026',
    state: 'WIP', mode: 'scope',
    summary: 'A Telegram bot that parses free-text chat messages into scheduled reminders and tasks.',
    incident: 'Switching to a separate task app creates friction. The task gets forgotten in the gap between chat and calendar.',
    resolution: 'Parse intent and time out of free text ("next fri", "EOD"), hand it to a persistent job queue so reminders survive restarts and time-zones.',
    uses: ['python', 'telegram-api', 'sqlite', 'git'],
  },
]

export const BUILD_BY_SLUG = Object.fromEntries(BUILDS.map((b) => [b.slug, b]))

/* which builds use a given tech id — powers chip → build highlight */
export function buildsUsing(techId) {
  return BUILDS.filter((b) => b.uses.includes(techId)).map((b) => b.slug)
}

/* ── MANIFEST — /etc/ayush.manifest rows ─────────────────────
   focus items carry a `focus` id that matches a TECHS kind so a
   tech highlight can light the relevant focus line. */
export const MANIFEST = {
  identity: {
    name: 'ayush',
    role: 'software engineer · designer · builder',
    location: 'Singapore',
    est: 2005,
  },
  education: {
    school: 'SUTD',
    programme: 'Computer Science & Design',
    minor: 'Design & Artificial Intelligence',
    span: '2024-2028',
  },
  focus: [
    { label: 'intelligent interfaces', focus: 'ui' },
    { label: 'creative frontend & motion', focus: 'ui' },
    { label: 'generative & systems programming', focus: 'sys' },
  ],
  availability: 'SWE / creative-engineering internships · S26+',
}

/* ── PANIC_REGISTERS — real skills masquerading as CPU state ── */
export const PANIC_REGISTERS = TECHS.map((t, i) => ({
  reg: 'R' + i.toString().padStart(2, '0'),
  addr: t.addr,
  sym: t.id,
}))

/* the 7 subsystem ids, in scroll order — used by the section
   logger, the panic stack trace, and the bus trace route. */
export const SECTION_IDS = [
  'boot', 'manifest', 'kernel', 'builds', 'memory', 'transmit',
]
