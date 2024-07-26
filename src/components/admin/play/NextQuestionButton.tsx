import React from 'react'
import Button from '@mui/joy/Button'
import { nextQuestion, openFinale, useDispatch, useSelector } from '../../../store'


type Props = React.ComponentProps<typeof Button>

const NextQuestionButton: React.FC<Props> = ({children, ...restProps}) => {
  const lastQuestion = useSelector(state => state.questions.length === state.game.present.currentQuestion + 1)
  const dispatch = useDispatch()
  const nextQuestionBonuses = useSelector(state => {
    const options = state.questions.at(state.game.present.currentQuestion + 1)?.options
    return options?.map(
      option => option.bonus != null
    ) ?? Array<boolean>(options != null ? 10 : 12).fill(false)
  })
  const isNextQuestionDynamic = useSelector(state => state.questions.at(state.game.present.currentQuestion + 1)?.options == null)
  return (
    <Button
      {...restProps}
      color='primary'
      onClick={() => {
        dispatch(lastQuestion ? openFinale() : nextQuestion({
          bonusesMap: nextQuestionBonuses,
          dynamic: isNextQuestionDynamic,
        }))
      }}
    >
      {children}
    </Button>
  )
}

export default NextQuestionButton
