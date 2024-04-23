import Options from '../components/game/Options'
import Question from '../components/game/Question'
import styles from './styles.css'
import background from '../../assets/background.svg'
import React, { useEffect, useState } from 'react'
import Teams from '../components/game/Teams'

const CANVAS_W = 1920, CANVAS_H = 1080

console.log(background)

const GameScreen: React.FC = () => {
  const [ { scale, left, top }, setTransform ] = useState({scale: 0, left: 0, top: 0})
  useEffect(() => {
    adaptSize()
    window.addEventListener('resize', adaptSize)
    return () => window.removeEventListener('resize', adaptSize)
  }, [])
  function adaptSize() {
    const windowW = document.body.clientWidth
    const windowH = document.body.clientHeight
    const scale = Math.min(windowW / CANVAS_W, windowH / CANVAS_H)
    const top = Math.max(0, windowH - CANVAS_H * windowW / CANVAS_W) / 2
    const left = Math.max(0, windowW - CANVAS_W * windowH / CANVAS_H) / 2
    setTransform({scale, left, top})
  }
  return (
    <div className={styles.game} style={{backgroundImage: `url(${background})`}}>
      <div className={styles.canvas} style={{
        transform: `scale(${scale})`, marginLeft: left, marginTop: top
      }}>
        <Question />
        <Options />
        <Teams />
      </div>
    </div>
  )
}

export default GameScreen
