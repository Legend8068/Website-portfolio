import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { useSystem } from '../lib/systemBus.jsx'

/* ============================================================
   PARTICLE FACE — the operator, rasterized into phosphor dust.

   Ported from Bruno Imbrizi's interactive-particles demo
   (three.js + glslify + webpack) into this app's stack: modern
   three, the glslify simplex noise inlined, GSAP v3, and rethemed
   to the machine — HARD SQUARE particles (no soft circles) tinted
   bone with red/amber accent pixels, lit by the source image's
   luminance. Every bright pixel of the portrait becomes one GL
   point; the mouse shoves them out of the plane and they settle
   back. Drop your own high-contrast face-on-black PNG at
   /public/face-particles.png and it just works.
   ============================================================ */

const FACE_SRC = '/face-particles.png' // TEMP: demo sample — swap for your own face

/* — inlined Ashima 2D simplex noise (replaces the glslify pragma) — */
const NOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));
  vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
  i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m; m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0;
  vec3 h=abs(x)-0.5;
  vec3 ox=floor(x+0.5);
  vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g;
  g.x=a0.x*x0.x+h.x*x0.y;
  g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}`

const VERT = `
precision highp float;
attribute float pindex;
attribute vec3 position;
attribute vec3 offset;
attribute vec2 uv;
attribute float angle;
attribute vec3 acolor;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uRandom;
uniform float uDepth;
uniform float uSize;
uniform float uEnergy;
uniform vec2 uTextureSize;
uniform sampler2D uTexture;
uniform sampler2D uTouch;
uniform float uForm;
uniform vec2 uViewport;   // visible half-extent, in texture units
uniform float uFaceOffset; // where the portrait rests, right of centre
varying vec2 vPUv;
varying vec3 vColor;
varying float vTransit;
${NOISE}
float random(float n){ return fract(sin(n)*43758.5453123); }

/* One lap of a rectangular bus circuit, walked as a perimeter
   parameter in [0,1). Hard right-angle corners only — the pixels
   turn the way a trace turns, never on an arc. */
vec2 circuitPos(float t, vec2 hs) {
  float w = hs.x * 2.0;
  float h = hs.y * 2.0;
  float d = fract(t) * (2.0 * (w + h));
  if (d < w) return vec2(-hs.x + d, -hs.y);   // left → right, along the bottom
  d -= w;
  if (d < h) return vec2(hs.x, -hs.y + d);    // up the right side
  d -= h;
  if (d < w) return vec2(hs.x - d, hs.y);     // right → left, along the top
  d -= w;
  return vec2(-hs.x, hs.y - d);               // down the left side
}

void main(){
  vPUv = offset.xy / uTextureSize;
  vColor = acolor;
  vec4 colA = texture2D(uTexture, vPUv);
  float grey = colA.r*0.21 + colA.g*0.71 + colA.b*0.07;
  /* ---- where this pixel finally belongs, in the face ---- */
  vec3 face = offset;
  face.xy += vec2(random(pindex)-0.5, random(offset.x+pindex)-0.5) * uRandom;
  float rndz = (random(pindex) + snoise(vec2(pindex*0.1, uTime*0.1)));
  // the eyes get an extra hold-still: this portrait's eye/brow band sits
  // at v ~0.565 (found empirically for /face-particles.png — retune if
  // the source photo changes), and reads busiest at rest since that's
  // where the eye is drawn to. Ambient noise there is damped to 35% of
  // whatever uEnergy would otherwise allow, on top of the usual easing.
  float eyeDist = abs(vPUv.y - 0.565);
  float eyeMask = 1.0 - smoothstep(0.028, 0.075, eyeDist);
  float eyeDamp = mix(1.0, 0.35, eyeMask);
  // ambient breathing — ties to uEnergy, so the face sits still and
  // reads clearly at rest, and only stirs once the cursor is actually
  // on it. Touch displacement below is untouched: that reaction stays
  // instant and local no matter the ambient state.
  face.z += rndz * (random(pindex)*2.0*uDepth) * mix(0.1, 1.0, uEnergy) * eyeDamp;
  face.xy -= uTextureSize * 0.5;
  // the portrait settles right of centre; only the FINAL position carries
  // this, so the run below still has the whole canvas to travel
  face.x += uFaceOffset;

  /* ---- the arrival: river → a spiralling run of the bus → the face ----
     Every pixel walks the same rectangular spiral, winding inward over
     a couple of laps. A per-pixel lag staggers it along the path and a
     per-pixel lane widens or narrows its orbit, so the crowd reads as a
     broad ribbon of data sweeping the board rather than a single wire.
     uForm drives the whole journey 0 → 1. */
  float lag = random(pindex + 7.77);
  float p = clamp(uForm * 1.42 - lag * 0.42, 0.0, 1.0);

  /* The circuit is sized off the VISIBLE canvas, not the portrait — the
     portrait is tall and narrow, so sizing the loop to it threw the top
     and bottom runs off-screen while leaving the sides empty.

     The rectangle tightens on the SHARED clock (uForm), never on each
     pixel's own progress: drive it per-pixel and pixels at different
     stages sit on different-sized rectangles, which smears the whole
     thing into a full-screen wash instead of a ribbon. Sharing the
     track is what keeps it legible as one band sweeping the board. */
  float lane = 0.88 + random(pindex * 9.13) * 0.18;
  vec2 hs = mix(uViewport * 0.94, uTextureSize * 0.30, uForm * uForm) * lane;

  float entry = (random(pindex * 1.37) - 0.5) * 0.05;
  vec2 loop = circuitPos(entry + p * 1.7, hs);
  loop += vec2(random(pindex*3.1) - 0.5, random(pindex*5.3) - 0.5) * 22.0;

  // pouring in from off-screen left before it reaches the circuit
  vec2 river = vec2(-uViewport.x * 2.4, (random(pindex*2.7) - 0.5) * uViewport.y * 1.6);
  vec2 streamXY = mix(river, loop, smoothstep(0.0, 0.22, p));

  // then peel off the trace and take up position in the portrait
  float land = smoothstep(0.68, 1.0, p);
  vTransit = 1.0 - land;

  vec3 displaced;
  displaced.xy = mix(streamXY, face.xy, land);
  displaced.z  = mix(rndz * 130.0, face.z, land);

  float t = texture2D(uTouch, vPUv).r;
  displaced.z += t * 22.0 * rndz;
  displaced.x += cos(angle) * t * 22.0 * rndz;
  displaced.y += sin(angle) * t * 22.0 * rndz;
  float psize = (snoise(vec2(uTime, pindex) * 0.5) * mix(0.1, 1.0, uEnergy) * eyeDamp + 2.0);
  // in transit every pixel carries the same weight; only once it lands
  // does the portrait's own luminance decide how big it sits
  psize *= mix(0.85, max(grey, 0.2), land);
  psize *= uSize;
  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  mvPosition.xyz += position * psize;
  gl_Position = projectionMatrix * mvPosition;
}`

const FRAG = `
precision highp float;
varying vec2 vPUv;
varying vec3 vColor;
varying float vTransit;
uniform sampler2D uTexture;
void main(){
  vec4 colA = texture2D(uTexture, vPUv);
  float grey = colA.r*0.21 + colA.g*0.71 + colA.b*0.07;
  // hard square particle, tinted to the palette, lit by face luminance
  vec3 c = vColor * (0.16 + grey * 1.1);
  // a pixel still travelling the bus runs hot — it hasn't taken on the
  // portrait's shading yet, so the stream reads bright against the board
  c = mix(c, vColor * 1.45, vTransit * 0.7);
  gl_FragColor = vec4(c, 1.0);
}`

/* CSS var → normalized rgb triple */
function cssRgb(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
  const m = v.replace('#', '')
  const n = parseInt(m.length === 3 ? m.replace(/(.)/g, '$1$1') : m, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/* — touch force field (canvas trail → data texture), ported — */
function makeTouch() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const texture = new THREE.Texture(canvas)
  const trail = []
  const maxAge = 90
  const radius = 0.12
  const easeOutSine = (t) => Math.sin((t * Math.PI) / 2)
  const clear = () => { ctx.fillStyle = 'black'; ctx.fillRect(0, 0, size, size) }
  clear()
  return {
    texture,
    addTouch(p) {
      let force = 0
      const last = trail[trail.length - 1]
      if (last) {
        const dx = last.x - p.x, dy = last.y - p.y
        force = Math.min((dx * dx + dy * dy) * 10000, 1)
      }
      trail.push({ x: p.x, y: p.y, age: 0, force })
    },
    update() {
      clear()
      for (let i = trail.length - 1; i >= 0; i--) {
        const pt = trail[i]
        pt.age++
        if (pt.age > maxAge) { trail.splice(i, 1); continue }
        const x = pt.x * size, y = (1 - pt.y) * size
        const a = pt.age / maxAge
        let intensity = a < 0.3 ? easeOutSine(a / 0.3) : easeOutSine(1 - (a - 0.3) / 0.7)
        intensity *= pt.force
        const r = size * radius * intensity
        const grd = ctx.createRadialGradient(x, y, r * 0.25, x, y, r)
        grd.addColorStop(0, 'rgba(255,255,255,0.2)')
        grd.addColorStop(1, 'rgba(0,0,0,0.0)')
        ctx.beginPath(); ctx.fillStyle = grd; ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
      }
      texture.needsUpdate = true
    },
  }
}

export function ParticleFace() {
  const hostRef = useRef(null)
  const graphics3d = useSystem((s) => s.modules.graphics3d)
  const pausedRef = useRef(false)

  // module toggle: graphics3d off → hide + pause (the face is 3D)
  useEffect(() => { pausedRef.current = !graphics3d }, [graphics3d])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /* The face is the loader, so it owns the moment the page is allowed
       to move. Idempotent, and called from every exit — success, reduced
       motion, a hidden host, or a texture that never arrives — because a
       visitor must never be left staring at a hero that refuses to appear. */
    const handOver = () => {
      if (window.PRELOADER_DONE) return
      window.PRELOADER_DONE = true
      document.documentElement.classList.remove('booting')
      window.dispatchEvent(new Event('preloader-done'))
    }

    // Below 900px, and whenever the compositor is unloaded, the portrait
    // is display:none. Build it regardless — the viewport can widen later
    // and a one-shot bail here would leave the hero permanently empty —
    // but never make anyone wait on a loader they cannot see.
    if (getComputedStyle(host).display === 'none') handOver()

    let W = host.clientWidth || 1, H = host.clientHeight || 1
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, W / H, 1, 10000)
    camera.position.z = 300
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.setSize(W, H)
    host.appendChild(renderer.domElement)

    let fovHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
    const clock = new THREE.Clock(true)
    const container = new THREE.Object3D()
    scene.add(container)

    const raycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    const touch = makeTouch()

    let mesh = null, hitArea = null, imgW = 1, imgH = 1
    let raf = 0, disposed = false, visible = true
    // true only while the pointer is actually over the raycasted face
    // plane — not just inside the container's bounding box
    let hovering = false
    const IDLE_ENERGY = 0.12

    const bone = cssRgb('--bone', '#EAE6DF')
    const red = cssRgb('--red', '#FF4F3B')
    const amber = cssRgb('--amber', '#FFB800')

    const build = (texture) => {
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      imgW = texture.image.width
      imgH = texture.image.height
      const numPoints = imgW * imgH

      // read luminance to discard dark pixels (the black background)
      const threshold = 34
      const cv = document.createElement('canvas')
      cv.width = imgW; cv.height = imgH
      const c = cv.getContext('2d')
      c.scale(1, -1)
      c.drawImage(texture.image, 0, 0, imgW, imgH * -1)
      const data = c.getImageData(0, 0, imgW, imgH).data

      let numVisible = 0
      for (let i = 0; i < numPoints; i++) if (data[i * 4] > threshold) numVisible++

      const uniforms = {
        uTime: { value: 0 },
        uRandom: { value: 1.0 },
        uDepth: { value: 2.0 },
        uSize: { value: 0.0 },
        // starts lively so the intro assembly still has motion; eases
        // down to the idle baseline once the cursor isn't on the face
        uEnergy: { value: 1.0 },
        // 0 = still pouring in off-screen, 1 = fully formed portrait
        uForm: { value: 0 },
        // visible half-extent in texture units, kept current by applyScale
        uViewport: { value: new THREE.Vector2(imgW * 0.8, imgH * 0.55) },
        uFaceOffset: { value: 0 },
        uTextureSize: { value: new THREE.Vector2(imgW, imgH) },
        uTexture: { value: texture },
        uTouch: { value: touch.texture },
      }
      const material = new THREE.RawShaderMaterial({
        uniforms, vertexShader: VERT, fragmentShader: FRAG,
        depthTest: false, transparent: true,
      })

      const geometry = new THREE.InstancedBufferGeometry()
      const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3)
      positions.setXYZ(0, -0.5, 0.5, 0); positions.setXYZ(1, 0.5, 0.5, 0)
      positions.setXYZ(2, -0.5, -0.5, 0); positions.setXYZ(3, 0.5, -0.5, 0)
      geometry.setAttribute('position', positions)
      const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2)
      uvs.setXY(0, 0, 0); uvs.setXY(1, 1, 0); uvs.setXY(2, 0, 1); uvs.setXY(3, 1, 1)
      geometry.setAttribute('uv', uvs)
      geometry.setIndex(new THREE.BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1))

      const indices = new Uint16Array(numVisible)
      const offsets = new Float32Array(numVisible * 3)
      const angles = new Float32Array(numVisible)
      const colors = new Float32Array(numVisible * 3)
      for (let i = 0, j = 0; i < numPoints; i++) {
        if (data[i * 4] <= threshold) continue
        offsets[j * 3] = i % imgW
        offsets[j * 3 + 1] = Math.floor(i / imgW)
        indices[j] = i
        angles[j] = Math.random() * Math.PI
        // theme tint: mostly bone, a scatter of red + amber hot pixels
        const h = (i * 2654435761) % 100
        const tone = h < 7 ? red : h < 11 ? amber : bone
        colors[j * 3] = tone[0]; colors[j * 3 + 1] = tone[1]; colors[j * 3 + 2] = tone[2]
        j++
      }
      geometry.setAttribute('pindex', new THREE.InstancedBufferAttribute(indices, 1, false))
      geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsets, 3, false))
      geometry.setAttribute('angle', new THREE.InstancedBufferAttribute(angles, 1, false))
      geometry.setAttribute('acolor', new THREE.InstancedBufferAttribute(colors, 3, false))

      mesh = new THREE.Mesh(geometry, material)
      container.add(mesh)

      const hitGeo = new THREE.PlaneGeometry(imgW, imgH, 1, 1)
      const hitMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, depthTest: false })
      hitMat.visible = false
      hitArea = new THREE.Mesh(hitGeo, hitMat)
      container.add(hitArea)

      applyScale()

      if (reduced) {
        // static formed state, no animation, no touch
        uniforms.uSize.value = 1.4
        uniforms.uRandom.value = 1.6
        uniforms.uDepth.value = 3.0
        uniforms.uForm.value = 1
        renderer.render(scene, camera)
        handOver()
        return
      }

      uniforms.uRandom.value = 2.0
      uniforms.uDepth.value = 4.0
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      document.addEventListener('mouseout', onDocLeave)
      if (!raf) loop()

      /* A backgrounded tab freezes rAF, so the formation would sit at
         frame zero and only replay once the visitor came back — long
         after the hero had already been handed over. Present the
         finished portrait instead; nobody watches a loader they
         weren't looking at. */
      if (document.hidden) {
        uniforms.uSize.value = 1.5
        uniforms.uForm.value = 1
        renderer.render(scene, camera)
        handOver()
        return
      }

      renderer.render(scene, camera)
      // the pixels pour in, run their lap of the circuit and settle into
      // the portrait; only when the last one lands does the page move
      gsap.fromTo(uniforms.uSize, { value: 0 }, { value: 1.5, duration: 0.5, ease: 'power2.out' })
      gsap.fromTo(uniforms.uForm, { value: 0 },
        { value: 1, duration: 3.4, ease: 'power1.inOut', onComplete: handOver })
    }

    const applyScale = () => {
      // fit the portrait inside the panel (works for any source aspect —
      // the landscape TEMP or a portrait face), with a little margin
      const fovWidth = fovHeight * camera.aspect
      const scale = Math.min(fovWidth / imgW, fovHeight / imgH) * 0.92

      /* The canvas now spans the whole hero, so the portrait has to be
         placed inside it rather than just centred. Reproduce exactly the
         box it used to live in — min(780px, 62%) wide, pushed 4% past the
         right edge — and offset the face to that box's centre. */
      const boxW = Math.min(780, W * 0.62)
      const offsetCss = (W * 1.04 - boxW / 2) - W / 2
      const faceOffset = (offsetCss * (fovWidth / W)) / scale

      if (mesh) {
        mesh.scale.set(scale, scale, 1)
        // how much room the pixels actually have on screen, expressed in
        // texture units so the shader can size the circuit against it —
        // this is what keeps the run filling the canvas at any viewport
        mesh.material.uniforms.uViewport.value.set(
          fovWidth / (2 * scale),
          fovHeight / (2 * scale)
        )
        mesh.material.uniforms.uFaceOffset.value = faceOffset
      }
      // the hover plane has to sit where the portrait actually ends up,
      // not where the canvas happens to be centred
      if (hitArea) {
        hitArea.scale.set(scale, scale, 1)
        hitArea.position.x = faceOffset * scale
      }
    }

    const onPointerMove = (e) => {
      if (!hitArea) return
      const rect = renderer.domElement.getBoundingClientRect()
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(ndc, camera)
      const hits = raycaster.intersectObject(hitArea)
      hovering = hits.length > 0
      if (hits.length && hits[0].uv) touch.addTouch(hits[0].uv)
    }
    // belt-and-braces: if the cursor leaves the document entirely
    // without a final move over the face, don't leave it stuck "live"
    const onDocLeave = (e) => { if (!e.relatedTarget) hovering = false }

    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (pausedRef.current || !visible) return
      const delta = clock.getDelta()
      if (mesh) {
        touch.update()
        const u = mesh.material.uniforms
        u.uTime.value += delta
        // ease toward hover (lively) or idle (calm) — fast to wake up,
        // slower to settle back down so it doesn't feel like a switch
        const target = hovering ? 1 : IDLE_ENERGY
        const rate = hovering ? 5 : 1.8
        u.uEnergy.value += (target - u.uEnergy.value) * Math.min(1, delta * rate)
      }
      renderer.render(scene, camera)
    }

    // pause the loop when the hero scrolls out of view
    const io = new IntersectionObserver(
      (ents) => { visible = ents.some((en) => en.isIntersecting) },
      { threshold: 0 }
    )
    io.observe(host)

    const ro = new ResizeObserver(() => {
      W = host.clientWidth || 1; H = host.clientHeight || 1
      camera.aspect = W / H
      camera.updateProjectionMatrix()
      fovHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
      renderer.setSize(W, H)
      applyScale()
      if (reduced) renderer.render(scene, camera)
    })
    ro.observe(host)

    // if the portrait can't be fetched there is no loader to wait on
    new THREE.TextureLoader().load(
      FACE_SRC,
      (tex) => { if (!disposed) build(tex) },
      undefined,
      () => handOver()
    )

    return () => {
      disposed = true
      if (raf) cancelAnimationFrame(raf)
      io.disconnect(); ro.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('mouseout', onDocLeave)
      if (mesh) { mesh.geometry.dispose(); mesh.material.dispose() }
      if (hitArea) { hitArea.geometry.dispose(); hitArea.material.dispose() }
      renderer.dispose()
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div className={'particle-face' + (graphics3d ? '' : ' gfx-off')} ref={hostRef} aria-hidden="true">
      <span className="pf-frame" aria-hidden="true" />
      <span className="pf-off">GRAPHICS3D · OFFLINE</span>
    </div>
  )
}
