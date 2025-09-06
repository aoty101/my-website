import Experience from './Experience/Experience.js'

export default class Application {
  constructor() {
    this.setExperience()
  }

  setExperience() {
    this.experience = new Experience(document.querySelector('.experience'))
  }
}
