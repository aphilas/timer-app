// utility functions
const elId = id => document.getElementById(id)
const timeToSeconds = ({h, m, s}) => (h * 3600) + (m * 60) + s
const secondsToTime = s => ({ h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60, })

const pauseEl = document.getElementById('pause')
const resetEl = document.getElementById('reset')

const counterEl = document.getElementById('counter')
const tickerEl = document.getElementById('ticker')
const audiEl = document.getElementById('audio')

// 'global'
const picker = elId('time-picker')

// params - delay in seconds, cb fn every tick
const Timer = (delay, fn) => {
  let timer

  const clearTimer = _ => {
    if (timer) {
      clearTimeout(timer)
      timer = 0
}
    }

  const tick = _ => {
    delay -= 1
    timer = setTimeout(tick, 1000)
    fn(delay) // tick fn
    if (delay <= 0) clearTimer()
}

  return {
    start() {
      if ((delay <= 0) || timer) return
      timer = setTimeout(tick, 1000)
      return
    },
    pause: _ => {
      clearTimer()
      return
    },
    stop() { 
      clearTimer() 
      delay = 0
      return
    },
}
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
