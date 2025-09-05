<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

// Note: Requires dependencies: three, gsap
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import gsap from 'gsap'

const containerRef = ref(null)

let renderer
let scene
let camera
let animationId
let resizeObserver

let group
let logoMesh
let particles
let gltfModel
let loader

// Parameters
const params = {
  backgroundColor: 0x0c0f14,
  gradientTop: new THREE.Color('#0c0f14'),
  gradientBottom: new THREE.Color('#18212b'),
  parallaxIntensity: 0.6,
  particleCount: 800,
  initialCameraZ: 8,
  targetCameraZ: 3.2,
  convergenceRadius: 3.0,
  modelScale: 1.0,
}

function createGradientBackground(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, width)
  canvas.height = Math.max(1, height)
  const ctx = canvas.getContext('2d')
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
  grad.addColorStop(0, '#0c0f14')
  grad.addColorStop(1, '#18212b')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  return new THREE.CanvasTexture(canvas)
}

async function loadGLTFModel() {
  return new Promise((resolve, reject) => {
    if (!loader) {
      loader = new GLTFLoader()
    }

    loader.load(
      '/models/狼毒.glb',
      (gltf) => {
        const model = gltf.scene
        model.scale.setScalar(params.modelScale)
        model.position.set(0, 0, 0)

        // 优化模型材质
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
            if (child.material) {
              child.material.metalness = 0.6
              child.material.roughness = 0.25
              child.material.color.setHex(0x9ad1ff)
            }
          }
        })

        resolve(model)
      },
      undefined,
      (error) => {
        console.error('Error loading GLTF model:', error)
        reject(error)
      }
    )
  })
}

function createParticles() {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(params.particleCount * 3)
  const colors = new Float32Array(params.particleCount * 3)
  const color = new THREE.Color()

  // 粒子从随机位置开始，准备汇聚到中心
  for (let i = 0; i < params.particleCount; i += 1) {
    const i3 = i * 3
    // 在更大的范围内随机分布粒子
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = params.convergenceRadius * (0.8 + Math.random() * 0.4)

    positions[i3 + 0] = r * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = r * Math.cos(phi)

    // soft blue to white
    color.setHSL(0.56 + Math.random() * 0.02, 0.7, 0.6 + Math.random() * 0.3)
    colors[i3 + 0] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.04,
    vertexColors: true,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  return new THREE.Points(geometry, material)
}

async function init() {
  const container = containerRef.value
  if (!container) return

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)

  // Scene
  scene = new THREE.Scene()

  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  )
  camera.position.set(0, 0, params.initialCameraZ)
  if (camera) scene.add(camera)

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.6)
  const dir = new THREE.DirectionalLight(0xffffff, 1.2)
  dir.position.set(3, 4, 5)
  dir.castShadow = true
  dir.shadow.mapSize.width = 2048
  dir.shadow.mapSize.height = 2048
  if (ambient) scene.add(ambient)
  if (dir) scene.add(dir)

  // Background plane with gradient
  const bgTexture = createGradientBackground(
    container.clientWidth,
    container.clientHeight
  )
  const bgMaterial = new THREE.MeshBasicMaterial({
    map: bgTexture,
    depthWrite: false,
  })
  const bgGeometry = new THREE.PlaneGeometry(20, 20)
  const backgroundPlane = new THREE.Mesh(bgGeometry, bgMaterial)
  backgroundPlane.position.z = -5
  scene.add(backgroundPlane)

  // Group and content
  group = new THREE.Group()
  if (group) scene.add(group)

  // 加载GLB模型
  try {
    gltfModel = await loadGLTFModel()
    if (gltfModel) {
      gltfModel.visible = false // 初始隐藏模型
      group.add(gltfModel)
    }
  } catch (error) {
    console.error('Failed to load GLTF model:', error)
  }

  particles = createParticles()
  if (particles) group.add(particles)

  // 粒子汇聚动画时间线
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  // 粒子从随机位置汇聚到中心
  const positions = particles.geometry.getAttribute('position')
  const fromPositions = positions.array.slice(0)
  const toPositions = positions.array.slice(0)

  // 设置目标位置为原点（模型位置）
  for (let i = 0; i < params.particleCount; i += 1) {
    const i3 = i * 3
    toPositions[i3 + 0] = 0
    toPositions[i3 + 1] = 0
    toPositions[i3 + 2] = 0
  }

  const tweenState = { t: 0 }
  tl.fromTo(
    tweenState,
    { t: 0 },
    {
      t: 1,
      duration: 2.0,
      onUpdate() {
        const t = tweenState.t
        for (let i = 0; i < fromPositions.length; i += 1) {
          positions.array[i] =
            fromPositions[i] + (toPositions[i] - fromPositions[i]) * t
        }
        positions.needsUpdate = true
      },
    }
  )

  // 粒子透明度动画
  tl.to(particles.material, { opacity: 1, duration: 0.8 }, 0.2)
  tl.to(particles.material, { opacity: 0, duration: 0.6 }, 1.4)

  // 模型出现动画
  if (gltfModel) {
    tl.fromTo(
      gltfModel.scale,
      { x: 0.1, y: 0.1, z: 0.1 },
      {
        x: params.modelScale,
        y: params.modelScale,
        z: params.modelScale,
        duration: 1.0,
      },
      1.6
    )
    tl.fromTo(
      gltfModel.rotation,
      { x: -0.3, y: 0.5, z: 0 },
      { x: 0, y: 0, z: 0, duration: 1.0 },
      1.6
    )
    tl.to(gltfModel, { visible: true, duration: 0.1 }, 1.6)
  }

  // Parallax
  const parallaxTarget = { x: 0, y: 0 }
  function onPointerMove(e) {
    const rect = container.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    parallaxTarget.x = (x - 0.5) * params.parallaxIntensity
    parallaxTarget.y = (y - 0.5) * params.parallaxIntensity
  }
  container.addEventListener('pointermove', onPointerMove)

  // Scroll-triggered camera dolly (walk-in)
  function onWheel(e) {
    const delta = Math.sign(e.deltaY)
    const targetZ = delta > 0 ? params.targetCameraZ : params.initialCameraZ
    gsap.to(camera.position, { z: targetZ, duration: 1.0, ease: 'power2.out' })
  }
  container.addEventListener('wheel', onWheel, { passive: true })

  // Resize
  function onResize() {
    const w = container.clientWidth
    const h = container.clientHeight
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    // Refresh gradient background texture on resize
    const tex = createGradientBackground(w, h)
    backgroundPlane.material.map?.dispose?.()
    backgroundPlane.material.map = tex
    backgroundPlane.material.needsUpdate = true
  }
  window.addEventListener('resize', onResize)

  // Resize observer to handle container-based layout changes
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(container)
  }

  // Animate
  const clock = new THREE.Clock()
  function animate() {
    const elapsed = clock.getElapsedTime()

    // 模型持续旋转
    if (gltfModel && gltfModel.visible) {
      gltfModel.rotation.y += 0.005
    }

    // 视差效果
    group.position.x += (parallaxTarget.x - group.position.x) * 0.04
    group.position.y += (-parallaxTarget.y - group.position.y) * 0.04

    // 粒子微动效果
    if (particles) {
      particles.rotation.y = Math.sin(elapsed * 0.2) * 0.1
    }

    renderer.render(scene, camera)
    animationId = requestAnimationFrame(animate)
  }
  animate()

  // Cleanup
  return () => {
    container.removeEventListener('pointermove', onPointerMove)
    container.removeEventListener('wheel', onWheel)
    window.removeEventListener('resize', onResize)
    if (resizeObserver) resizeObserver.disconnect()
    cancelAnimationFrame(animationId)
    renderer?.dispose?.()
    backgroundPlane.geometry.dispose()
    bgMaterial.map?.dispose?.()
    bgMaterial.dispose()
    particles?.geometry?.dispose?.()
    particles?.material?.dispose?.()

    // 清理GLB模型
    if (gltfModel) {
      gltfModel.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose?.())
          } else {
            child.material.dispose?.()
          }
        }
      })
    }

    scene.clear()
    container.removeChild(renderer.domElement)
  }
}

let cleanup
onMounted(() => {
  cleanup = init()
})

onUnmounted(() => {
  if (cleanup) cleanup()
})
</script>

<template>
  <div ref="containerRef" class="scene-container">
    <!-- WebGL canvas will be injected here -->
    <div class="overlay">
      <div class="brand">Z</div>
      <div class="hint">Scroll to enter · Move mouse to explore</div>
    </div>
  </div>
</template>

<style scoped>
.scene-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(
    1200px 800px at 50% 40%,
    rgba(32, 49, 66, 0.35),
    rgba(12, 15, 20, 0) 70%
  );
}
.scene-container canvas {
  position: absolute;
  inset: 0;
}
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  color: #e8f3ff;
  text-align: center;
}
.brand {
  font-size: 64px;
  font-weight: 800;
  letter-spacing: 4px;
  text-shadow: 0 8px 32px rgba(58, 156, 255, 0.35);
}
.hint {
  margin-top: 8px;
  font-size: 14px;
  opacity: 0.7;
}
</style>
