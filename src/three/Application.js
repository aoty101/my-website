import Experience from './Experience/Experience.js'

export default class Application {
  constructor() {
    this.setBlocks()
    this.setExperience()
  }

  setBlocks() {}

  setExperience() {
    this.experience = new Experience({
      targetElement: document.querySelector('.experience'),
    })
  }
}
