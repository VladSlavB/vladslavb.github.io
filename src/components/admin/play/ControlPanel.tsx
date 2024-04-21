import styles from './styles.css'
import Button from '@mui/joy/Button'
import React from 'react'
import { nextQuestion, previousQuestion, useDispatch, useSelector } from '../../../store'
import Stack from '@mui/joy/Stack'

const ControlPanel: React.FC = () => {
  const dispatch = useDispatch()
  const questionIndex = useSelector(state => state.game.currentQuestion)
  const totalQuestions = useSelector(state => state.questions.length)
  return (
    <Stack direction='row' spacing={1} className={styles.gameControl}>
      <Button
        onClick={() => dispatch(previousQuestion())}
        variant='outlined' disabled={questionIndex === -1}
      >
        Предыдущий вопрос
      </Button>
      <Button
        onClick={() => dispatch(nextQuestion())}
        disabled={questionIndex === totalQuestions - 1}
      >
        {questionIndex >= 0 ? 'Следующий вопрос' : 'Показать первый вопрос'}
      </Button>
    </Stack>
  )
}

export default ControlPanel
