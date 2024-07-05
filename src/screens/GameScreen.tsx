import Options from '../components/game/Options'
import Question from '../components/game/Question'
import styles from './styles.css'
import background from '../../assets/background.svg'
import React, { useEffect, useState } from 'react'
import Teams from '../components/game/Teams'
import { useSelector } from '../store'
import { useStore } from 'react-redux'
import Subtotal from '../components/game/Subtotal'
import Finale from '../components/game/Finale'

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
  const subtotalShown = useSelector(state => state.visibility.subtotal)
  return (
    <div className={styles.game} style={{backgroundImage: `url(${background})`}}>
      <div className={styles.canvas} style={{
        transform: `scale(${scale})`, marginLeft: left, marginTop: top
      }}>
        <div className={styles.wrapper + (subtotalShown ? ` ${styles.hidden}` : '')}>
          <Question />
          <Options />
          <Teams />

          <Finale />
        </div>
        <div className={styles.wrapper + (!subtotalShown ? ` ${styles.hidden}` : '')}>
          <Subtotal />
        </div>
      </div>
      <Demonstration />
    </div>
  )
}

export default GameScreen

const Demonstration: React.FC = () => {
  const currentAttachment = useSelector(state => state.visibility.instantAttachment ?? state.game.present.currentAttachment)
  const attachmentShown = useSelector(state => state.visibility.attachment || state.visibility.instantAttachment != null)
  console.log(currentAttachment)
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
