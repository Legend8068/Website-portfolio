import { Nav } from './components/Nav.jsx'
import { Boot } from './components/Boot.jsx'
import { KernelDive } from './components/KernelDive.jsx'
import { Manifest } from './components/Manifest.jsx'
import { Builds } from './components/Builds.jsx'
import { MemoryMap } from './components/MemoryMap.jsx'
import { Transmit } from './components/Transmit.jsx'
import { KernelPanic } from './components/KernelPanic.jsx'
import { Warp } from './components/Warp.jsx'
import { CrtOverlay, DitherEdge } from './components/Machine.jsx'
import { Cursor } from './components/Cursor.jsx'
import { PageField } from './components/PageField.jsx'
import { TraceFilters } from './components/Trace.jsx'
import { SystemProvider } from './lib/systemBus.jsx'

/* ============================================================
   AYUSH.OS — one machine, seven subsystems.
   BOOT → MANIFEST → KERNEL → /BUILDS → MEMMAP → DAEMONS → UPLINK
   Between them: nothing but deep Bayer dissolves. Each ground
   is flat; the seam is the only texture (the reference edge).
   A few spark pixels ride the falloff like distant signals.
   ============================================================ */

export default function App() {
  return (
    <SystemProvider>
      <TraceFilters />
      <PageField />
      <Nav />
      <main>
        <Boot />
        <DitherEdge deep from="var(--obsidian)" to="var(--obsidian-2)" seed={3} />
        <Manifest />
        <DitherEdge deep flip from="var(--obsidian-2)" to="var(--obsidian-3)" seed={5} />
        <KernelDive />
        <DitherEdge deep from="var(--obsidian-3)" to="var(--board-2)" seed={7} spark="var(--red)" />
        <Builds />
        <DitherEdge deep flip from="var(--board-2)" to="var(--board-3)" seed={11} />
        <MemoryMap />
        <DitherEdge deep from="var(--board-3)" to="var(--obsidian)" seed={13} spark="var(--amber)" />
        <Transmit />
      </main>
      <CrtOverlay />
      <Cursor />
      <Warp />
      <KernelPanic />
    </SystemProvider>
  )
}
