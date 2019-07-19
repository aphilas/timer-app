
const pickerEl = document.getElementById('time-picker')
const hoursEl = document.getElementById('hours')
const minutesEl = document.getElementById('minutes')
const secondsEl = document.getElementById('seconds')

const pauseEl = document.getElementById('pause')
const resetEl = document.getElementById('reset')

const counterEl = document.getElementById('counter')

const audiEl = document.getElementById('audio')

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

    if (!value) value = 0

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
  state.time.pauseCountDown()

  clearInterval(state.renderInterval)
  state.renderInterval = undefined

  clearTimeout(state.renderTimeout)
  state.renderTimeout = undefined
}

pickerEl.addEventListener('submit', event => {
  event.preventDefault()

  let {hours, minutes, seconds} = _getElValues([hoursEl, minutesEl, secondsEl])
  state.time = new Time({hours, minutes, seconds})
  
  if (state.time.timeStamp === 0) return

  disableControls(false)
  runEngine()
})

const alarm = _ => {
  // should be moved elsewhere
  pauseEl.setAttribute('disabled', '')

  audiEl.play()
  console.log('time is up!')
}

class Time{
  constructor(time) {
    this.timeStamp = Time.timeToSeconds(time)
  }

  currentValue() {
    return this.timeStamp
  }

  /**
   * decrement the timestamp by 1 every second
   */
  countDown() {
    this.countDownInterval = setInterval(_ => {
      if (this.timeStamp <= 0) {
        alarm()

        clearInterval(this.countDownInterval)
        return
      }
    
      this.timeStamp--
    }, 1000)
  }

  pauseCountDown() {
    clearInterval(this.countDownInterval)
    this.countDownInterval = undefined
  }

  getTimeObject() {
    const seconds = this.timeStamp

    return {
      hours: Math.floor(seconds / 3600),
      minutes: Math.floor((seconds % 3600) / 60),
      seconds: seconds % 60,
    }
  }

  static timeToSeconds({hours, minutes, seconds}) {
    return (hours * 3600) + (minutes * 60) + seconds
  }
}

pauseEl.addEventListener('click', event => {
  if (state.time.timeStamp <= 0) return

  if (state.paused) {

    renderCounter()
    runEngine()
    event.target.innerText = 'Pause '
    state.paused = false

  } else {

    pauseEngine()
    event.target.innerText = 'Resume'
    state.paused = true
  }

})

resetEl.addEventListener('click', event => {
  [hoursEl, minutesEl, secondsEl].forEach(el => el.value = '')

  pauseEngine()
  disableControls()

  state.time = undefined
  counterEl.innerText = `00 : 00 : 00`
})







 


