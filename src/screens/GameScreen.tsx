import Options from '../components/game/Options'
import Question from '../components/game/Question'
import styles from './styles.css'
import background from '../../assets/background.svg'
import React, { useEffect, useState } from 'react'
import Teams from '../components/game/Teams'
import { useGameSelector, useSelector } from '../store'
import { useStore } from 'react-redux'

const CANVAS_W = 1920, CANVAS_H = 1080

const GameScreen: React.FC = () => {
  const [ { scale, left, top }, setTransform ] = useState({scale: 0, left: 0, top: 0})
  const store = useStore()
  useEffect(() => {
    adaptSize()
    window.addEventListener('resize', adaptSize)
    const interval = setInterval(() => {
      if (opener?.store != store) {
        close()
      }
    }, 500)
    return () => {
      window.removeEventListener('resize', adaptSize)
      clearInterval(interval)
    }
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
      <Demonstration />
    </div>
  )
}

export default GameScreen

const Demonstration: React.FC = () => {
  const currentAttachment = useGameSelector(game => game.currentAttachment)
  const attachmentShown = useSelector(state => state.attachmentVisible)
  let className = styles.imgModal
  if (currentAttachment?.type === 'img' && attachmentShown) {
    className += ' ' + styles.shown
  }
  return (
    <div className={className}>
      {currentAttachment?.type === 'img' ? (
        <img src={currentAttachment.url} className={styles.img} />
      ) : <span />}
    </div>
  )
}
