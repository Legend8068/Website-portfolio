/* ============================================================
   CUBE — deterministic voxel-core state for the kernel dive.

   The cube is 27 cubelets on a {-1,0,1}³ lattice. Sticker colors
   are fixed to each cubelet (solved layout). A scramble is a list
   of quarter-turns pre-applied in full; the solve is the inverse
   list animated by scroll progress. Because every frame recomputes
   each cubelet's matrix from scratch given progress q ∈ [0,1],
   the animation is scrub-safe in both directions.
   ============================================================ */

/* ── mat4 helpers (column-major, CSS matrix3d order) ───────── */
function mat4Identity() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
}
function mat4Multiply(a, b) {
  // returns a * b (b applied first)
  const out = new Array(16)
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        a[r] * b[c * 4] +
        a[4 + r] * b[c * 4 + 1] +
        a[8 + r] * b[c * 4 + 2] +
        a[12 + r] * b[c * 4 + 3]
    }
  }
  return out
}
function mat4Rotation(axis, deg) {
  const rad = (deg * Math.PI) / 180
  const c = Math.cos(rad), s = Math.sin(rad)
  if (axis === 'x') return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]
  if (axis === 'y') return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]
  return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] // z
}
function mat4Translation(x, y, z) {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]
}

/* Rotate an integer lattice position 90° * turns about an axis.
   Uses screen-space handedness (y down, z toward viewer) so that
   the logical tracking matches the CSS visual rotation. */
function rotatePos([x, y, z], axis, deg) {
  // quarter turns only; deg is ±90 (or multiples)
  let turns = Math.round(deg / 90) % 4
  if (turns < 0) turns += 4
  let p = [x, y, z]
  for (let i = 0; i < turns; i++) {
    const [px, py, pz] = p
    if (axis === 'x') p = [px, -pz, py]
    else if (axis === 'y') p = [pz, py, -px]
    else p = [-py, px, pz]
  }
  return p
}

/* ── move sequences ─────────────────────────────────────────
   A move: { axis: 'x'|'y'|'z', layer: -1|0|1, deg: ±90 }
   SCRAMBLE is applied instantly (progress-independent);
   SOLVE = inverses of SCRAMBLE in reverse order, animated. */
const SCRAMBLE = [
  { axis: 'y', layer: 1, deg: 90 },
  { axis: 'x', layer: 1, deg: -90 },
  { axis: 'z', layer: -1, deg: 90 },
]
export const SOLVE = [...SCRAMBLE]
  .reverse()
  .map((m) => ({ ...m, deg: -m.deg }))

export const CUBELETS = []
for (let z = 1; z >= -1; z--) {
  for (let y = -1; y <= 1; y++) {
    for (let x = -1; x <= 1; x++) {
      CUBELETS.push({ x, y, z, id: `${x}${y}${z}` })
    }
  }
}

/* cubeMatrices(q, spacing) — q ∈ [0,1] across the whole solve.
   Returns array of CSS matrix3d strings, one per cubelet in
   CUBELETS order. spacing = cubelet pitch in px. */
export function cubeMatrices(q, spacing) {
  const perMove = 1 / SOLVE.length
  return CUBELETS.map((c) => {
    let pos = [c.x, c.y, c.z]
    let m = mat4Translation(pos[0] * spacing, pos[1] * spacing, pos[2] * spacing)

    // scramble: fully applied, instant
    for (const mv of SCRAMBLE) {
      if (pos[mvAxisIndex(mv.axis)] === mv.layer) {
        m = mat4Multiply(mat4Rotation(mv.axis, mv.deg), m)
        pos = rotatePos(pos, mv.axis, mv.deg)
      }
    }

    // solve: animated by q
    for (let i = 0; i < SOLVE.length; i++) {
      const mv = SOLVE[i]
      const local = Math.min(Math.max((q - i * perMove) / perMove, 0), 1)
      if (local <= 0) break
      // ease each turn so it snaps like a real cube twist
      const eased = local < 1 ? easeTurn(local) : 1
      const inSlice = pos[mvAxisIndex(mv.axis)] === mv.layer
      if (inSlice) {
        m = mat4Multiply(mat4Rotation(mv.axis, mv.deg * eased), m)
      }
      if (local >= 1) {
        if (inSlice) pos = rotatePos(pos, mv.axis, mv.deg)
      } else break
    }
    return `matrix3d(${m.map((v) => v.toFixed(5)).join(',')})`
  })
}

function mvAxisIndex(axis) {
  return axis === 'x' ? 0 : axis === 'y' ? 1 : 2
}
function easeTurn(t) {
  // easeInOutQuad — reads as a deliberate hand-turn
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

/* Sticker palette — solved faces of the voxel. Inner (hidden)
   faces read as obsidian machine housing. */
export const FACE_COLORS = {
  front: 'var(--red)',
  back: 'var(--trace)',
  up: 'var(--bone)',
  down: 'var(--slate-3)',
  right: 'var(--bone-dim)',
  left: 'var(--amber)',
}
