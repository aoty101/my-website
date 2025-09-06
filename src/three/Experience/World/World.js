import Experience from '../Experience.js'
import Gradient from '../Gradient.js'
import Smoke from '../Smoke.js'
import Particles from '../Particles.js'
import Vignette from '../Vignette.js'

export default class World {
  constructor() {
    this.experience = new Experience()
    this.config = this.experience.config
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.resources.on('ready', () => {
      this.setParticles()
      this.setGradient()
      this.setSmoke()
      this.setVignette()
    })
  }

  setGradient() {
    this.gradient = new Gradient()
  }

  setSmoke() {
    this.smoke = new Smoke()
  }

  setParticles() {
    this.particles = new Particles()
  }

  setVignette() {
    this.vignette = new Vignette()
  }

  resize() {
    if (this.smoke) this.smoke.resize()
  }

  update() {
    if (this.gradient) this.gradient.update()

    if (this.smoke) this.smoke.update()

    if (this.particles) this.particles.update()
  }
}
