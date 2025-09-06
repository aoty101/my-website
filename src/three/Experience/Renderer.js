import * as THREE from 'three'
import Experience from './Experience.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import finalVertexShader from './shaders/final/vertex.glsl?raw'
import finalFragmentShader from './shaders/final/fragment.glsl?raw'

export default class Renderer {
  constructor(_options = {}) {
    this.experience = new Experience()
    this.canvas = this.experience.canvas
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.camera = this.experience.camera

    this.usePostprocess = false

    this.setInstance()
    this.setPostProcess()
  }

  setInstance() {
    // Renderer
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: false,
      antialias: true,
    })
    this.instance.physicallyCorrectLights = true
    this.instance.outputEncoding = THREE.sRGBEncoding
    this.instance.toneMapping = THREE.CineonToneMapping
    this.instance.toneMappingExposure = 1.75
    this.instance.shadowMap.enabled = true
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap
    this.instance.setClearColor('#010101')
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
  }

  setPostProcess() {
    this.postProcess = {}

    /**
     * Render pass
     */
    this.postProcess.renderPass = new RenderPass(
      this.scene,
      this.camera.instance
    )
    this.postProcess.finalPass = new ShaderPass({
      vertexShader: finalVertexShader,
      fragmentShader: finalFragmentShader,
      uniforms: {
        tDiffuse: { value: null },
      },
    })

    /**
     * Effect composer
     */
    // const RenderTargetClass =
    //   Math.min(this.sizes.pixelRatio, 2) >= 2
    //     ? THREE.WebGLRenderTarget
    //     : THREE.WebGLMultisampleRenderTarget

    const RenderTargetClass = THREE.WebGLRenderTarget
    this.renderTarget = new RenderTargetClass(
      this.sizes.width,
      this.sizes.height,
      {
        generateMipmaps: false,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat,
        encoding: THREE.sRGBEncoding,
      }
    )
    this.postProcess.composer = new EffectComposer(
      this.instance,
      this.renderTarget
    )
    this.postProcess.composer.setSize(this.sizes.width, this.sizes.height)
    this.postProcess.composer.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))

    this.postProcess.composer.addPass(this.postProcess.renderPass)
    this.postProcess.composer.addPass(this.postProcess.finalPass)
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
  }

  update() {
    if (this.usePostprocess) {
      this.postProcess.composer.render()
    } else {
      this.instance.render(this.scene, this.camera.instance)
    }
  }

  destroy() {
    this.instance.renderLists.dispose()
    this.instance.dispose()
    this.renderTarget.dispose()
    this.postProcess.composer.renderTarget1.dispose()
    this.postProcess.composer.renderTarget2.dispose()
  }
}
