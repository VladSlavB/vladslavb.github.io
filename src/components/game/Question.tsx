import { useGameSelector, useSelector } from '../../store'
import styles from './styles.css'
import React from 'react'

const Question: React.FC = () => {
  const question = useSelector(state => state.questions[state.game.present.currentQuestion])
  // TODO attachment
  const currentAttachment = useSelector(state => state.visibility.instantAttachment)// ?? state.game.present.currentAttachment)
  const attachmentShown = useSelector(state => state.visibility.attachment || state.visibility.instantAttachment != null)
  const shown = useGameSelector(game => game.questionShown)
  let className = styles.question
  if (currentAttachment?.type === 'text' && attachmentShown) {
    className += ' ' + styles.attachmentShown
  }
  // TODO second
  return question != null ? (
    <div className={className}>
      <div>{shown ? question.value : ''}</div>
      <div>{currentAttachment?.type === 'text' && currentAttachment.text}</div>
    </div>
  ) : null
}

export default Question
