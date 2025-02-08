import { DynamicQuestion, useGameSelector, useSelector } from '../../store'
import styles from './styles.css'
import React from 'react'

const Question: React.FC = () => {
  const question = useSelector(state => state.questions[state.game.present.currentQuestion])
  const attachment = useSelector(state => state.visibility.attachment)
  const roundStarted = useGameSelector(game => game.roundStarted)
  const questionHidden = useSelector(state => state.visibility.questionHidden)
  const shown = roundStarted && !questionHidden
  let className = styles.question
  if (attachment?.type === 'text') {
    className += ' ' + styles.attachmentShown
  }

  return question != null ? (
    <div className={className}>
      <div>{shown ? question.value : ''}</div>
      <div>{attachment?.type === 'text' && attachment.text}</div>
    </div>
  ) : null
}

export default Question
