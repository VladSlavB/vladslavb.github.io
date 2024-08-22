import { DynamicQuestion, useGameSelector, useSelector } from '../../store'
import styles from './styles.css'
import React from 'react'

const Question: React.FC = () => {
  const question = useSelector(state => state.questions[state.game.present.currentQuestion])
  const attachment = useSelector(state => state.visibility.attachment)
  const shown = useGameSelector(game => game.questionShown)
  let className = styles.question
  if (attachment?.type === 'text') {
    className += ' ' + styles.attachmentShown
  }
  const maybeSecondQuestion = useSelector(state => {
    const game = state.game.present
    if (game.q?.type === 'dynamic' && game.q.showSecond) {
      return (state.questions[game.currentQuestion] as DynamicQuestion).value2
    }
  })

  return question != null ? (
    <div className={className}>
      <div>{shown ? (maybeSecondQuestion ?? question.value) : ''}</div>
      <div>{attachment?.type === 'text' && attachment.text}</div>
    </div>
  ) : null
}

export default Question
