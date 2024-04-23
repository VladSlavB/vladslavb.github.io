import styles from './styles.css'
import Button from '@mui/joy/Button'
import React from 'react'
import { minusHealth, nextQuestion, previousQuestion, toggleCurrentTeam, useDispatch, useSelector } from '../../../store'
import Stack from '@mui/joy/Stack'
import Switch from '@mui/joy/Switch'
import Typography from '@mui/joy/Typography'

const ControlPanel: React.FC = () => {
  const dispatch = useDispatch()
  const questionIndex = useSelector(state => state.game.currentQuestion)
  const totalQuestions = useSelector(state => state.questions.length)
  const currentTeam = useSelector(state => state.game.currentTeam)
  const currentColor = currentTeam === 'leftTeam' ? 'primary' : 'danger'
  const currentTeamHealth = useSelector(state => state.game[state.game.currentTeam].health)
  return (
    <Stack direction='row' spacing={2} className={styles.gameControl} flexWrap='wrap'>
      {/* <Button
        onClick={() => dispatch(previousQuestion())}
        variant='outlined' disabled={questionIndex === -1}
      >
        Предыдущий вопрос
      </Button> */}
      <Button
        color='primary'
        onClick={() => dispatch(nextQuestion())}
        disabled={questionIndex === totalQuestions - 1}
      >
        {questionIndex >= 0 ? 'Следующий вопрос' : 'Показать первый вопрос'}
      </Button>
      <Typography component='label' className={styles.toggle} startDecorator={
        <Switch
          color={currentColor} checked={currentTeam === 'rightTeam'}
          onChange={() => dispatch(toggleCurrentTeam())}
        />
      }>
        Ход {currentTeam === 'leftTeam' ? 'синих' : 'красных'}
      </Typography>
      <Button
        color='danger' variant='outlined'
        onClick={() => dispatch(minusHealth())}
        disabled={currentTeamHealth == 0}
      >
        Промах
      </Button>
    </Stack>
  )
}

export default ControlPanel
