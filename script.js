// utility functions
const elId = id => document.getElementById(id)
const timeToSeconds = ({h, m, s}) => (h * 3600) + (m * 60) + s
const secondsToTime = s => ({ h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60, })

// render counter - 00 : 02 : 01
const counterEl = elId('counter')
const renderCounter = ({h, m, s}) => {
  ;[h, m, s] = [h, m, s].map(c => String(c).padStart(2,'0'))
  counterEl.innerText = `${h} : ${m} : ${s}`
}

// quick timer
Array.from(elId('quick-timer').children).forEach(el => {
  el.addEventListener('click', _ => {
    picker[el.dataset.units].value = el.dataset.value
    picker['submit'].click()
  })
})

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

// app timer
let timer

const tickerEl = elId('ticker')
const tickFn = seconds => {
  renderCounter(secondsToTime(seconds))

  tickerEl.classList.remove('tick')
  void tickerEl.offsetWidth // hack to reset animation
  tickerEl.classList.add('tick')

  // time is up
  if (seconds === 0) {
    elId('audio').play()
    timer = 0
}
  }

picker.addEventListener('submit', event => {
  event.preventDefault()

  const data = new FormData(event.target)
  const time = {}

  for (let [key, value] of data.entries()) {
    time[key] = parseInt(value) || 0
}

  if (timer) timer.stop()

  const s = timeToSeconds(time)
  if (s === 0) return
  
  timer = Timer(timeToSeconds(time), tickFn)
  timer.start()
})

const timeUp = _ => {
  // should be moved elsewhere
  pauseEl.setAttribute('disabled', '')
  pauseEngine()
  audiEl.play()
  console.log('time is up!')
}

elId('reset').addEventListener('click', _ => {
  elId('time-picker').reset()
  stopAudio()

  if (timer) {
    timer.stop()
    timer = undefined
  }
  renderCounter(secondsToTime(0))
})

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
