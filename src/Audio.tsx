import React, { useEffect, useRef } from 'react'
import correct from '../assets/correct.wav'
import wrong from '../assets/wrong.wav'
import intro from '../assets/intro.mp3'
import finish from '../assets/finish.mp3'
import background1 from '../assets/background1.mp3'
import background2 from '../assets/background2.mp3'
import background3 from '../assets/background3.mp3'
import background4 from '../assets/background4.mp3'


const audioByUrl: Record<string, React.RefObject<HTMLAudioElement>> = {}

const Audio: React.FC<React.ComponentProps<'audio'>> = props => {
  const ref = useRef<HTMLAudioElement>(null)
  const src = props.src ?? ''
  useEffect(() => {
    audioByUrl[src] = ref
    return () => {delete audioByUrl[src]}
  }, [src])
  return (
    <audio ref={ref} {...props} preload='auto' />
  )
}

export default Audio


function play(src: string) {
  const audio = audioByUrl[src].current
  if (audio != null) {
    audio.currentTime = 0
    audio.play()
  }
}

export const allAudioUrls = [correct, wrong, intro, finish]
export const backgroundMusic = [background1, background2, background3, background4]

export const playCorrect = () => play(correct)
export const playWrong = () => play(wrong)
export const playIntro = () => play(intro)
export const playFinish = () => {
  [...backgroundMusic, intro].forEach(url => {
    const audio = audioByUrl[url]?.current
    if (audio != null) {
      audio.pause()
      audio.currentTime = 0
    }
  })
  play(finish)
}
