import right from '../assets/right.wav'
import wrong from '../assets/wrong.wav'

class Track {
  audio: HTMLAudioElement

  constructor(url: string) {
    this.audio = document.createElement('audio')
    this.audio.style.height = '0'
    this.audio.style.overflow = 'hidden'
    this.audio.preload = 'auto'
    this.audio.controls = true
    this.audio.src = url
    document.body.appendChild(this.audio)
  }

  play() {
    this.audio.currentTime = 0
    this.audio.play()
  }
}

export const rightRingtone = new Track(right)
export const wrongRingtone = new Track(wrong)
