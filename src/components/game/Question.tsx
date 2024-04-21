import { useSelector } from '../../store'
import styles from './styles.css'
import React from 'react'

const Question: React.FC = () => {
  const question = useSelector(state => (
    state.game.currentQuestion >= 0 ? (
      state.questions[state.game.currentQuestion].value
    ) : null
  ))
  return question != null ? (
    <div className={styles.question}>{question}</div>
  ) : null
}

export default Question
