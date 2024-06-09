import { useGameSelector, useSelector } from '../../store'
import styles from './styles.css'
import React from 'react'

const Question: React.FC = () => {
  const question = useSelector(state => (
    state.game.present.currentQuestion >= 0 ? (
      state.questions[state.game.present.currentQuestion].value
    ) : null
  ))
  const textAttachment = useGameSelector(game => (
    game.currentAttachment?.type === 'text' ? (
      game.currentAttachment.text
    ) : null
  ))
  const attachmentShown = useSelector(state => state.visibility.attachment)
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
