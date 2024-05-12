import { useSelector } from '../../store'
import styles from './styles.css'
import React from 'react'

const Question: React.FC = () => {
  const question = useSelector(state => (
    state.game.currentQuestion >= 0 ? (
      state.questions[state.game.currentQuestion].value
    ) : null
  ))
  const textAttachment = useSelector(state => (
    state.game.currentAttachment?.type === 'text' && state.game.currentAttachment.show ? (
      state.game.currentAttachment.text
    ) : null
  ))
  return question != null ? (
    <div className={styles.question}>{textAttachment ?? question}</div>
  ) : null
}

export default Question
