import styles from './styles.css'
import Button from '@mui/joy/Button'
import ButtonGroup from '@mui/joy/ButtonGroup'
import React from 'react'
import { nextQuestion, chooseTeam, useDispatch, useSelector } from '../../../store'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'

const ControlPanel: React.FC = () => {
  const dispatch = useDispatch()
  const { currentTeam, currentQuestion, drawFinished } = useSelector(state => state.game)
  const allOptionsOpen = useSelector(state => currentQuestion >= 0 && (
    state.questions[currentQuestion].options.every(option => option.opened)
  ))
  const totalQuestions = useSelector(state => state.questions.length)
  const currentColor = currentTeam === 'leftTeam' ? 'primary' : 'danger'
  const everyoneDead = currentTeam == null && drawFinished
  const lastQuestion = currentQuestion === totalQuestions - 1
  return (
    <Stack direction='row' spacing={2} className={styles.gameControl} flexWrap='wrap'>
      {currentQuestion >= 0 && (
        <>
          {!drawFinished && <Typography variant='soft'>Розыгрыш хода</Typography>}
          {currentTeam == null ? (
            !everyoneDead && (
              <ButtonGroup>
                <Button
                  onClick={() => dispatch(chooseTeam('leftTeam'))}
                  variant='outlined'
                  color='primary'
                >Синие быстрее</Button>
                <Button
                  onClick={() => dispatch(chooseTeam('rightTeam'))}
                  variant='outlined'
                  color='danger'
                >Красные быстрее</Button>
              </ButtonGroup>
            )
          ) : (
            !allOptionsOpen && (
              <Typography color={currentColor}>
                &bull; Отвечают {currentTeam === 'leftTeam' ? 'синие' : 'красные'}
              </Typography>
            )
          )}
        </>
      )}
      {(currentQuestion < 0 || (allOptionsOpen && !lastQuestion)) && (
        <Button
          style={{alignSelf: 'flex-start'}}
          color='primary'
          onClick={() => dispatch(nextQuestion())}
        >
          {currentQuestion >= 0 ? 'Следующий вопрос' : 'Показать первый вопрос'}
        </Button>
      )}
    </Stack>
  )
}

export default ControlPanel
