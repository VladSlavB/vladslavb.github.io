import right from '../assets/right.wav'
import wrong from '../assets/wrong.wav'

class Sound {
  audio: HTMLAudioElement

  constructor(url: string) {
    const audio = document.createElement('audio')
    audio.style.height = '0'
    audio.style.overflow = 'hidden'
    audio.style.display = 'block'
    audio.preload = 'auto'
    audio.controls = true
    audio.src = url
    document.body.appendChild(audio)
    this.audio = audio
  }

  play() {
    this.audio.currentTime = 0
    this.audio.play()
  }
}

export const rightSound = new Sound(right)
export const wrongSound = new Sound(wrong)
