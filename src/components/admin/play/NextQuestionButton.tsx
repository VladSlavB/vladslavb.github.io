import React from 'react'
import Button from '@mui/joy/Button'
import { OrdinaryQuestion, nextQuestion, openFinale, useDispatch, useSelector } from '../../../store'


type Props = React.ComponentProps<typeof Button>

const NextQuestionButton: React.FC<Props> = ({children, ...restProps}) => {
  const lastQuestion = useSelector(state => state.questions.length === state.game.present.currentQuestion + 1)
  const dispatch = useDispatch()
  const nxtQuestion = useSelector(state => state.questions.at(state.game.present.currentQuestion + 1))
  const isNextQuestionDynamic = false//useSelector(state => state.questions.at(state.game.present.currentQuestion + 1)?.options == null)
  return (
    <Button
      {...restProps}
      color='primary'
      onClick={() => {
        dispatch(lastQuestion ? openFinale() : nextQuestion(nxtQuestion))
      }}
    >
      {children}
    </Button>
  )
}

export default NextQuestionButton
