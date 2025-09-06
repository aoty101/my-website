export const flexible = (window, document) => {
  const docEl = document.documentElement
  const dpr = window.devicePixelRatio || 1
  // adjust body font size
  function setBodyFontSize() {
    if (document.body) {
      document.body.style.fontSize = `${12 * dpr}px`
    } else {
      document.addEventListener('DOMContentLoaded', setBodyFontSize)
    }
  }
  setBodyFontSize()
  // set 1rem = viewWidth / 10
  function setRemUnit() {
    const baseSize = 192
    let scale
    if (docEl.clientWidth / docEl.clientHeight > 16 / 9) {
      scale = docEl.clientHeight / 1080
    } else {
      scale = docEl.clientWidth / 1920
    }
    docEl.style.fontSize = `${baseSize * scale}px`
  }

  setRemUnit()
  // reset rem unit on page resize
  window.addEventListener('resize', setRemUnit)
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      setRemUnit()
    }
  })

  // detect 0.5px supports
  if (dpr >= 2) {
    const fakeBody = document.createElement('body')
    const testElement = document.createElement('div')
    testElement.style.border = '.5px solid transparent'
    fakeBody.appendChild(testElement)
    docEl.appendChild(fakeBody)
    if (testElement.offsetHeight === 1) {
      docEl.classList.add('hairlines')
    }
    docEl.removeChild(fakeBody)
  }
}
