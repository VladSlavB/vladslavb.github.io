import React from 'react'
import Button from '@mui/joy/Button'
import { nextQuestion, openFinale, showQuestion, useDispatch, useSelector } from '../../../store'


type Props = React.ComponentProps<typeof Button>

const NextQuestionButton: React.FC<Props> = props => {
  const lastQuestion = useSelector(state => state.questions.length === state.game.present.currentQuestion + 1)
  const dispatch = useDispatch()
  const hasFinale = useSelector(state => state.finale != null)
  const nxtQuestion = useSelector(state => state.questions.at(state.game.present.currentQuestion + 1))

  return (!lastQuestion || hasFinale) ? (
    <Button
      {...props}
      color='primary'
      onClick={() => {
        dispatch(lastQuestion ? openFinale() : nextQuestion(nxtQuestion))
        dispatch(showQuestion())
      }}
    >
      Следующий вопрос
    </Button>
  ) : null
}

export default NextQuestionButton
