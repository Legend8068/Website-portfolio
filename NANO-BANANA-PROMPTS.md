# Nano Banana Pro — asset prompts for the Strata portfolio

Drop finished files into `src/assets/images/`. Every asset needs a
**transparent background** (or the stated backdrop) and should be generated
at 2x the display size. Keep the light source **top-left** in every prompt —
the whole site's shadows fall down-right.

Shared style suffix (append to every prompt):
> "layered papercraft style, high-grade textured cardstock, razor-sharp cut
> edges, visible paper fiber grain, hard offset drop shadows from a top-left
> studio light, flat colors — deep navy #16213E, warm cream #F5EEDF, coral
> #E4593C, teal #2E8C83, muted gold #C9A227, sky blue #7FA8C9 — no gradients,
> no blur, no text, isolated on transparent background"

## 1. `submarine.png` — depth-gauge mascot (display ~64px, gen 256px)
"A tiny cute papercut submarine seen from the side, cream hull with coral
fin and a round teal porthole window, single gold periscope, three small
paper bubbles rising from its tail" + suffix

## 2. `anglerfish.png` — trench-section easter egg (display ~160px, gen 512px)
"A friendly papercut anglerfish facing left, deep navy layered body with
lighter navy belly sheet, one round cream eye, its lure a glowing warm gold
paper circle on a thin folded stalk" + suffix

## 3. `diver.png` — mid-water accent (display ~200px, gen 640px)
"A papercut scuba diver silhouette swimming downward at a diagonal, layered
in three shades of navy and teal paper, cream air-tank sheet, a trail of
five paper bubbles behind the fins" + suffix

## 4. `coral-reef.png` — shallows footer strip (display ~900px wide, gen 1800px)
"A wide horizontal strip of papercut coral reef: branching coral silhouettes
in coral red, teal and gold layered at three depths, small paper seaweed,
flat bottom edge so it can sit on a shelf" + suffix

## 5. `lighthouse.png` — contact-section beacon (display ~220px, gen 700px)
"A papercut lighthouse on a small paper rock island, cream tower with two
coral horizontal stripes, gold lantern room glowing with cut paper light
rays fanning to the right, tiny navy paper waves at its base" + suffix

## Placement notes
- `submarine.png` → replaces the coral diamond in `.dg-ind` (depth gauge).
- `anglerfish.png` → bottom-left of the Creative (trench) sheet, `sticker-border float-l2`.
- `diver.png` → right side of the Workshop sheet near the Big-O chart.
- `coral-reef.png` → bottom edge of the Projects sheet, behind the wave divider.
- `lighthouse.png` → beside the contact letter, its rays pointing at the links.
