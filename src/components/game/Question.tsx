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
    state.game.currentAttachment?.type === 'text' ? (
      state.game.currentAttachment.text
    ) : null
  ))
  const attachmentShown = useSelector(state => state.game.currentAttachment?.show ?? false)
  let className = styles.question
  if (textAttachment != null && attachmentShown) {
    className += ' ' + styles.attachmentShown
  }
  return question != null ? (
    <div className={className}>
      <div>{question}</div>
      <div>{textAttachment}</div>
    </div>
  ) : null
}

export default Question
