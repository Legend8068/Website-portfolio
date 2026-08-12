import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/* ============================================================
   PIXEL BLAST — full-page WebGL background animation.
   Dithered pixel noise driven by FBM + Bayer ordering, with
   interactive click ripples. Renders behind all content as a
   fixed canvas, tinted to match the CRT machine palette.

   Ported from bg-pixel-animation/ into a React lifecycle.
   ============================================================ */

const MAX_CLICKS = 10
const SHAPE_MAP = { square: 0, circle: 1, triangle: 2, diamond: 3 }

const VERTEX_SRC = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`

const FRAGMENT_SRC = `
precision highp float;

uniform vec3  uColor;
uniform vec2  uResolution;
uniform float uTime;
uniform float uPixelSize;
uniform float uScale;
uniform float uDensity;
uniform float uPixelJitter;
uniform int   uEnableRipples;
uniform float uRippleSpeed;
uniform float uRippleThickness;
uniform float uRippleIntensity;
uniform float uEdgeFade;
/* The drifting pattern is allowed to live only ABOVE this line —
   given in canvas pixels down from the top of the viewport, and set
   to the bottom edge of the hero. Below it the field is dark and
   answers nothing but a click, so the pattern belongs to the hero
   and slides off the screen with it instead of thinning out over
   whatever section has come up underneath. 0 disables it entirely. */
uniform float uAmbientCut;

uniform int   uShapeType;
const int SHAPE_SQUARE   = 0;
const int SHAPE_CIRCLE   = 1;
const int SHAPE_TRIANGLE = 2;
const int SHAPE_DIAMOND  = 3;

const int   MAX_CLICKS = 10;

uniform vec2  uClickPos  [MAX_CLICKS];
uniform float uClickTimes[MAX_CLICKS];

out vec4 fragColor;

float Bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2. + a.y * a.y * .75);
}
#define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))
#define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))

#define FBM_OCTAVES     5
#define FBM_LACUNARITY  1.25
#define FBM_GAIN        1.0

float hash11(float n){ return fract(sin(n)*43758.5453); }

float vnoise(vec3 p){
  vec3 ip = floor(p);
  vec3 fp = fract(p);
  float n000 = hash11(dot(ip + vec3(0.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n100 = hash11(dot(ip + vec3(1.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n010 = hash11(dot(ip + vec3(0.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n110 = hash11(dot(ip + vec3(1.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n001 = hash11(dot(ip + vec3(0.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n101 = hash11(dot(ip + vec3(1.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n011 = hash11(dot(ip + vec3(0.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  float n111 = hash11(dot(ip + vec3(1.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  vec3 w = fp*fp*fp*(fp*(fp*6.0-15.0)+10.0);
  float x00 = mix(n000, n100, w.x);
  float x10 = mix(n010, n110, w.x);
  float x01 = mix(n001, n101, w.x);
  float x11 = mix(n011, n111, w.x);
  float y0  = mix(x00, x10, w.y);
  float y1  = mix(x01, x11, w.y);
  return mix(y0, y1, w.z) * 2.0 - 1.0;
}

float fbm2(vec2 uv, float t){
  vec3 p = vec3(uv * uScale, t);
  float amp = 1.0;
  float freq = 1.0;
  float sum = 1.0;
  for (int i = 0; i < FBM_OCTAVES; ++i){
    sum  += amp * vnoise(p * freq);
    freq *= FBM_LACUNARITY;
    amp  *= FBM_GAIN;
  }
  return sum * 0.5 + 0.5;
}

float maskCircle(vec2 p, float cov){
  float r = sqrt(cov) * .25;
  float d = length(p - 0.5) - r;
  float aa = 0.5 * fwidth(d);
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));
}

float maskTriangle(vec2 p, vec2 id, float cov){
  bool flip = mod(id.x + id.y, 2.0) > 0.5;
  if (flip) p.x = 1.0 - p.x;
  float r = sqrt(cov);
  float d  = p.y - r*(1.0 - p.x);
  float aa = fwidth(d);
  return cov * clamp(0.5 - d/aa, 0.0, 1.0);
}

float maskDiamond(vec2 p, float cov){
  float r = sqrt(cov) * 0.564;
  return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);
}

void main(){
  float pixelSize = uPixelSize;
  vec2 fragCoord = gl_FragCoord.xy - uResolution * .5;
  float aspectRatio = uResolution.x / uResolution.y;

  vec2 pixelId = floor(fragCoord / pixelSize);
  vec2 pixelUV = fract(fragCoord / pixelSize);

  float cellPixelSize = 8.0 * pixelSize;
  vec2 cellId = floor(fragCoord / cellPixelSize);
  vec2 cellCoord = cellId * cellPixelSize;
  vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);

  float base = fbm2(uv, uTime * 0.05);
  base = base * 0.5 - 0.65;

  /* 1 above the cut line, 0 below it, with a short ramp so the pattern
     dies into the seam rather than ending on a ruled edge. */
  float ambient = smoothstep(
    uResolution.y - uAmbientCut - 40.0,
    uResolution.y - uAmbientCut,
    gl_FragCoord.y
  ) * step(1.0, uAmbientCut);

  float feed = base + (uDensity - 0.5) * 0.3;
  /* Pushed below anything the Bayer threshold can lift, so with the
     ambient off nothing shows — but the ripples below come in through
     max(), so a click still writes over this floor. */
  feed = mix(-1.0, feed, ambient);

  float speed     = uRippleSpeed;
  float thickness = uRippleThickness;
  const float dampT     = 1.0;
  const float dampR     = 10.0;

  if (uEnableRipples == 1) {
    for (int i = 0; i < MAX_CLICKS; ++i){
      vec2 pos = uClickPos[i];
      if (pos.x < 0.0) continue;
      float cellPixelSize = 8.0 * pixelSize;
      vec2 cuv = (((pos - uResolution * .5 - cellPixelSize * .5) / (uResolution))) * vec2(aspectRatio, 1.0);
      float t = max(uTime - uClickTimes[i], 0.0);
      float r = distance(uv, cuv);
      float waveR = speed * t;
      float ring  = exp(-pow((r - waveR) / thickness, 2.0));
      float atten = exp(-dampT * t) * exp(-dampR * r);
      feed = max(feed, ring * atten * uRippleIntensity);
    }
  }

  float bayer = Bayer8(fragCoord / uPixelSize) - 0.5;
  float bw = step(0.5, feed + bayer);

  float h = fract(sin(dot(floor(fragCoord / uPixelSize), vec2(127.1, 311.7))) * 43758.5453);
  float jitterScale = 1.0 + (h - 0.5) * uPixelJitter;
  float coverage = bw * jitterScale;

  float M;
  if      (uShapeType == SHAPE_CIRCLE)   M = maskCircle (pixelUV, coverage);
  else if (uShapeType == SHAPE_TRIANGLE) M = maskTriangle(pixelUV, pixelId, coverage);
  else if (uShapeType == SHAPE_DIAMOND)  M = maskDiamond(pixelUV, coverage);
  else                                   M = coverage;

  if (uEdgeFade > 0.0) {
    vec2 norm = gl_FragCoord.xy / uResolution;
    float edge = min(min(norm.x, norm.y), min(1.0 - norm.x, 1.0 - norm.y));
    float fade = smoothstep(0.0, uEdgeFade, edge);
    M *= fade;
  }

  vec3 color = uColor;

  vec3 srgbColor = mix(
    color * 12.92,
    1.055 * pow(color, vec3(1.0 / 2.4)) - 0.055,
    step(0.0031308, color)
  );

  fragColor = vec4(srgbColor, M);
}
`

/* ── defaults tuned for the AYUSH.OS machine aesthetic ────── */
const DEFAULTS = {
  variant: 'square',
  pixelSize: 3,
  color: '#FF4F3B',       // --red (CRT accent)
  patternScale: 2.5,
  patternDensity: 0.7,
  pixelJitter: 0,
  enableRipples: true,
  rippleSpeed: 0.4,
  rippleThickness: 0.12,
  rippleIntensity: 1.0,
  speed: 0.3,
  edgeFade: 0.15,
}

export function PixelBlast({
  variant = DEFAULTS.variant,
  pixelSize = DEFAULTS.pixelSize,
  color = DEFAULTS.color,
  patternScale = DEFAULTS.patternScale,
  patternDensity = DEFAULTS.patternDensity,
  pixelJitter = DEFAULTS.pixelJitter,
  enableRipples = DEFAULTS.enableRipples,
  rippleSpeed = DEFAULTS.rippleSpeed,
  rippleThickness = DEFAULTS.rippleThickness,
  rippleIntensity = DEFAULTS.rippleIntensity,
  speed = DEFAULTS.speed,
  edgeFade = DEFAULTS.edgeFade,
  /* Optional live tint: a ref holding [r,g,b] 0..1, read every frame.
     `color` sits in this effect's dependency list, so driving the hue
     through the prop would rebuild the whole WebGL scene on each
     change — this lets the page recolour the field continuously. */
  tintRef = null,
  /* Optional live ambient cut: a ref holding a CSS-pixel distance down
     from the top of the viewport. The drifting pattern runs only above
     that line; below it the field is dark until clicked. Read every
     frame for the same reason as tintRef — it has to move without
     rebuilding the scene. */
  ambientCutRef = null,
}) {
  const elRef = useRef(null)
  const blastRef = useRef(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    /* respect reduced motion */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const cfg = {
      variant, pixelSize, color, patternScale, patternDensity,
      pixelJitter, enableRipples, rippleSpeed, rippleThickness,
      rippleIntensity, speed, edgeFade,
    }

    /* ── build Three.js scene ── */
    const canvas = document.createElement('canvas')
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

    el.innerHTML = ''
    el.appendChild(renderer.domElement)
    renderer.setClearAlpha(0)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const uniforms = {
      uResolution:      { value: new THREE.Vector2(0, 0) },
      uTime:            { value: 0 },
      uColor:           { value: new THREE.Color(cfg.color) },
      uClickPos:        { value: Array.from({ length: MAX_CLICKS }, () => new THREE.Vector2(-1, -1)) },
      uClickTimes:      { value: new Float32Array(MAX_CLICKS) },
      uShapeType:       { value: SHAPE_MAP[cfg.variant] ?? 0 },
      uPixelSize:       { value: cfg.pixelSize * renderer.getPixelRatio() },
      uScale:           { value: cfg.patternScale },
      uDensity:         { value: cfg.patternDensity },
      uPixelJitter:     { value: cfg.pixelJitter },
      uEnableRipples:   { value: cfg.enableRipples ? 1 : 0 },
      uRippleSpeed:     { value: cfg.rippleSpeed },
      uRippleThickness: { value: cfg.rippleThickness },
      uRippleIntensity: { value: cfg.rippleIntensity },
      uEdgeFade:        { value: cfg.edgeFade },
      uAmbientCut:      { value: 0 },
    }

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SRC,
      fragmentShader: FRAGMENT_SRC,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      glslVersion: THREE.GLSL3,
    })

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
    scene.add(quad)

    const clock = new THREE.Clock()
    let visible = true
    let clickIx = 0
    let raf = 0

    /* ── sizing ── */
    const setSize = () => {
      const w = el.clientWidth || 1
      const h = el.clientHeight || 1
      renderer.setSize(w, h, false)
      uniforms.uResolution.value.set(renderer.domElement.width, renderer.domElement.height)
      uniforms.uPixelSize.value = cfg.pixelSize * renderer.getPixelRatio()
      // no cut supplied means the pattern owns the whole canvas
      if (!ambientCutRef) uniforms.uAmbientCut.value = renderer.domElement.height
    }
    setSize()

    const ro = new ResizeObserver(() => setSize())
    ro.observe(el)

    const io = new IntersectionObserver(
      ([e]) => { visible = e.isIntersecting },
      { threshold: 0.1 },
    )
    io.observe(el)

    /* ── click ripples (listen on window so clicks still reach
       content underneath — the canvas stays pointer-events: none) ── */
    const onDown = (e) => {
      const rect = renderer.domElement.getBoundingClientRect()
      // Only ripple if the click was inside the canvas bounds
      if (e.clientX < rect.left || e.clientX > rect.right || 
          e.clientY < rect.top || e.clientY > rect.bottom) return

      const scaleX = renderer.domElement.width / rect.width
      const scaleY = renderer.domElement.height / rect.height
      const fx = (e.clientX - rect.left) * scaleX
      const fy = (rect.height - (e.clientY - rect.top)) * scaleY
      uniforms.uClickPos.value[clickIx].set(fx, fy)
      uniforms.uClickTimes.value[clickIx] = uniforms.uTime.value
      clickIx = (clickIx + 1) % MAX_CLICKS
    }
    window.addEventListener('pointerdown', onDown, { passive: true })

    /* ── render loop ── */
    const loop = () => {
      if (visible) {
        uniforms.uTime.value = clock.getElapsedTime() * cfg.speed
        const t = tintRef && tintRef.current
        if (t) uniforms.uColor.value.setRGB(t[0], t[1], t[2])
        if (ambientCutRef) {
          const cut = Math.max(0, ambientCutRef.current ?? 0)
          uniforms.uAmbientCut.value = cut * renderer.getPixelRatio()
        }
        renderer.render(scene, camera)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    /* ── store ref for cleanup ── */
    blastRef.current = { renderer, material, quad, ro, io, raf, el, canvas }

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointerdown', onDown)
      quad.geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentElement === el) {
        el.removeChild(renderer.domElement)
      }
      el.innerHTML = ''
      blastRef.current = null
    }
  }, [
    variant, pixelSize, color, patternScale, patternDensity,
    pixelJitter, enableRipples, rippleSpeed, rippleThickness,
    rippleIntensity, speed, edgeFade,
  ])

  return <div className="pixel-blast-bg" ref={elRef} aria-hidden="true" />
}
