import React from 'react'
import NextQuestionButton from './NextQuestionButton'
import Button from '@mui/joy/Button'
import { makeSubtotal, useDispatch, useGameSelector, useSelector } from '../../../store'

const SubtotalThenNextQuestion: React.FC = () => {
  const currentQuestion = useGameSelector(game => game.currentQuestion)
  const totalQuestions = useSelector(state => state.questions.length)
  const lastQuestion = currentQuestion === totalQuestions - 1
  const hasFinale = useSelector(state => state.finale != null)
  const subtotalShown = useGameSelector(game => game.subtotalShown)
  const dispatch = useDispatch()

  return subtotalShown ? (
    (!lastQuestion || hasFinale) ? (
      <NextQuestionButton style={{alignSelf: 'flex-start'}}>Следующий вопрос</NextQuestionButton>
    ) : null
  ) : (
    <Button color='primary' onClick={() => dispatch(makeSubtotal())}>Показать счёт</Button>
  )
}

export default SubtotalThenNextQuestion
