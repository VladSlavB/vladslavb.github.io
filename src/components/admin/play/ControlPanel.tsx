import styles from './styles.css'
import Button from '@mui/joy/Button'
import ButtonGroup from '@mui/joy/ButtonGroup'
import React from 'react'
import { nextQuestion, chooseTeam, useDispatch, useSelector, wrongAnswer } from '../../../store'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'
import Box from '@mui/joy/Box'

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
      <Box flexGrow={1}>
        {currentTeam != null && !allOptionsOpen && (
          <Button
            className={styles.wrong}
            color='danger' variant='outlined'
            onClick={() => dispatch(wrongAnswer())}
            disabled={everyoneDead}
          >
            Промах
          </Button>
        )}
      </Box>
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
                Отвечают {currentTeam === 'leftTeam' ? 'синие' : 'красные'}
              </Typography>
            )
          )}
        </>
      )}
      {allOptionsOpen && !lastQuestion && (
        <Button
          style={{alignSelf: 'flex-start'}}
          color='primary'
          onClick={() => dispatch(nextQuestion())}
        >
          Следующий вопрос
        </Button>
      )}
    </Stack>
  )
}

export default ControlPanel
