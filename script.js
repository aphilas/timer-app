const pickerEl = document.getElementById('time-picker')
const hoursEl = document.getElementById('hours')
const minutesEl = document.getElementById('minutes')
const secondsEl = document.getElementById('seconds')

const pauseEl = document.getElementById('pause')
const resetEl = document.getElementById('reset')

const counterEl = document.getElementById('counter')
const tickerEl = document.getElementById('ticker')
const audiEl = document.getElementById('audio')

const quickTimeEls = document.getElementsByClassName('quick-time')
const startEl = document.getElementById('start')

const state = {
  // time obj ...

  renderInterval: undefined,
  paused: false,
  renderTimeout: undefined,
}

const _getElValues = els => {
  const values = {}

  els.forEach(el => {
    let value = parseInt(el.value)

    if (!value) {
      value = 0
      el.value = 0
    }

    el.value = String(value).padStart('2', '0')

    let key = el.name
    values[key] = value
  })

  return values
}

const renderCounter = _ => {
  let {hours, minutes, seconds} = state.time.getTimeObject()
  let [h, m, s] = [hours, minutes, seconds].map(component => String(component).padStart('2', '0'))
  counterEl.innerText = `${h} : ${m} : ${s}`
}

const runEngine = _ => {
  // start time count down
  state.time.countDown()

  // start rendering counter every second
  state.renderInterval = setInterval(renderCounter, 1000)

  // start ticking animation
  tickerEl.classList.add('ticking')

  /**
   * render until counting is done
   * +1 to show 00 instead of 01 as last value  
  */ 
  state.renderTimeout = setTimeout(_ => clearInterval(state.renderInterval), (state.time.timeStamp + 1) * 1000)
}

const disableControls = (disable = true) => {
  if (!disable) {
    pauseEl.removeAttribute('disabled')
    resetEl.removeAttribute('disabled')
  } else {
    pauseEl.setAttribute('disabled', '')
    resetEl.setAttribute('disabled', '')
  }
}

const pauseEngine = _ => {
  if (state.time) state.time.pauseCountDown()

  // stop ticking
  tickerEl.classList.remove('ticking')

  clearInterval(state.renderInterval)
  state.renderInterval = undefined

  clearTimeout(state.renderTimeout)
  state.renderTimeout = undefined
}

pickerEl.addEventListener('submit', event => {
  event.preventDefault()

  let {hours, minutes, seconds} = _getElValues([hoursEl, minutesEl, secondsEl])
  state.time = new Timer({hours, minutes, seconds})
  
  if (state.time.timeStamp === 0) return

  disableControls(false)
  runEngine()
})

const timeUp = _ => {
  // should be moved elsewhere
  pauseEl.setAttribute('disabled', '')
  pauseEngine()
  audiEl.play()
  console.log('time is up!')
}

class Timer{
  constructor(time) {
    this.timeStamp = Timer.timeToSeconds(time)
  }

  currentValue() {
    return this.timeStamp
  }

elId('pause').addEventListener('click', ({ target }) => {
  stopAudio()

  if (!timer) return 
    
  // if not on pause
  if (!target.dataset.paused) {
    timer.pause()
    target.dataset.paused = true
    target.innerText = 'Resume'
  } else {
    timer.start()
    target.dataset.paused = "" // read as false
    target.innerText = 'Pause '
  }
})

// wrap around inputs
const wrapAround = (el, max) => {
  if (el.value > max) el.value = '00'
  if (el.value < 0) el.value = max
  }

const padZero = str => str.padStart(2, '0')

const handler = ({ target }) => {
  target.value = padZero(target.value)

  switch (target.name) {
    case 's':
    case 'm':
      wrapAround(target, 59)
      break
    case 'h':
      wrapAround(target, 23)
}
  }

Array.from(picker.elements).forEach(el => {

  el.addEventListener('change', handler)
  el.addEventListener('input', handler)
})
