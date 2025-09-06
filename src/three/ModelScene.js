import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default class ModelScene {
  constructor(canvas) {
    this.canvas = canvas

    // 场景设置
    this.scene = new THREE.Scene()

    // 相机设置
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      1000
    )
    this.camera.position.set(0, 0, 5)

    // 渲染器设置
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    })
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    // 设置透明背景
    this.renderer.setClearColor(0x000000, 0) // 完全透明
    this.scene.background = null // 移除场景背景

    // 控制器设置
    this.controls = new OrbitControls(this.camera, this.canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.enableZoom = true
    this.controls.enablePan = true
    this.controls.autoRotate = false
    this.controls.autoRotateSpeed = 0.5

    // 模型相关
    this.model = null
    this.loader = new GLTFLoader()

    // 动画
    this.clock = new THREE.Clock()

    this.setupLights()
    this.loadModel()
    this.setupEventListeners()
    this.animate()
  }

  setupLights() {
    // 环境光 - 增强亮度以适应透明背景
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8)
    this.scene.add(ambientLight)

    // 主光源 - 增强对比度
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
    directionalLight.position.set(5, 5, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.1
    directionalLight.shadow.camera.far = 50
    directionalLight.shadow.camera.left = -10
    directionalLight.shadow.camera.right = 10
    directionalLight.shadow.camera.top = 10
    directionalLight.shadow.camera.bottom = -10
    this.scene.add(directionalLight)

    // 补充光源 - 增加颜色对比
    const pointLight = new THREE.PointLight(0x4a9eff, 0.8, 100)
    pointLight.position.set(-5, 5, 5)
    this.scene.add(pointLight)

    // 聚光灯 - 增强边缘照明
    const spotLight = new THREE.SpotLight(0xffffff, 1.0, 100, Math.PI / 6, 1)
    spotLight.position.set(0, 10, 0)
    spotLight.target.position.set(0, 0, 0)
    spotLight.castShadow = true
    this.scene.add(spotLight)
    this.scene.add(spotLight.target)

    // 添加边缘光增强轮廓
    const rimLight = new THREE.DirectionalLight(0x4a9eff, 1)
    rimLight.position.set(-5, -5, -5)
    this.scene.add(rimLight)
  }

  loadModel() {
    // 尝试加载GLB模型
    this.loader.load(
      '/models/programmer_desktop_3d_pc.glb',
      (gltf) => {
        // 移除默认模型
        if (this.model) {
          this.scene.remove(this.model)
        }

        this.model = gltf.scene

        // 设置模型属性
        this.model.scale.setScalar(1)
        this.model.position.set(0, 0, 0)

        // 启用阴影
        this.model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true

            // 优化材质
            if (child.material) {
              child.material.metalness = 0.1
              child.material.roughness = 0.8
            }
          }
        })

        this.scene.add(this.model)

        // 调整相机位置以适应模型
        this.fitCameraToModel()
      },
      (progress) => {
        console.log(
          'Loading progress:',
          (progress.loaded / progress.total) * 100 + '%'
        )
      },
      (error) => {
        console.warn('Failed to load model, using default geometry:', error)
      }
    )
  }

  fitCameraToModel() {
    if (!this.model) return

    const box = new THREE.Box3().setFromObject(this.model)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    this.model.position.sub(center)

    const maxDimension = Math.max(size.x, size.y, size.z)
    const aspect = window.innerWidth / window.innerHeight
    const cameraDistance = maxDimension * 0.8

    this.camera.position.set(0, 0, cameraDistance)
    this.camera.lookAt(0, 0, 0)

    if (this.controls) {
      this.controls.target.set(0, 0, 0)
      const currentDistance = this.controls.getDistance()
      this.controls.minDistance = currentDistance * 0.5
      this.controls.maxDistance = currentDistance * 3.0
      this.controls.update()
    }
  }

  setupEventListeners() {
    // 窗口大小调整
    window.addEventListener('resize', () => {
      this.resize()
    })

    // 双击重置视角
    this.canvas.addEventListener('dblclick', () => {
      this.resetCamera()
    })
  }

  resetCamera() {
    if (!this.model) return

    const box = new THREE.Box3().setFromObject(this.model)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())

    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = this.camera.fov * (Math.PI / 180)
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))
    cameraZ *= 1.5

    // 平滑过渡到新位置
    this.animateCameraTo(new THREE.Vector3(cameraZ, cameraZ, cameraZ), center)
  }

  animateCameraTo(position, target) {
    const startPosition = this.camera.position.clone()
    const startTarget = this.controls.target.clone()
    const duration = 1000 // 1秒
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // 使用缓动函数
      const easeProgress = 1 - Math.pow(1 - progress, 3)

      this.camera.position.lerpVectors(startPosition, position, easeProgress)
      this.controls.target.lerpVectors(startTarget, target, easeProgress)
      this.controls.update()

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }

  resize() {
    const width = this.canvas.clientWidth
    const height = this.canvas.clientHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  animate() {
    requestAnimationFrame(() => this.animate())

    const elapsedTime = this.clock.getElapsedTime()

    // 更新控制器
    this.controls.update()

    // 模型旋转动画（可选）
    if (this.model && this.controls.autoRotate) {
      this.model.rotation.y = elapsedTime * 0.5
    }

    // 渲染场景
    this.renderer.render(this.scene, this.camera)
  }

  // 公共方法
  toggleAutoRotate() {
    this.controls.autoRotate = !this.controls.autoRotate
  }

  setAutoRotateSpeed(speed) {
    this.controls.autoRotateSpeed = speed
  }

  dispose() {
    // 清理资源
    this.scene.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => material.dispose())
        } else {
          child.material.dispose()
        }
      }
    })

    this.controls.dispose()
    this.renderer.dispose()

    window.removeEventListener('resize', this.resize)
  }
}
