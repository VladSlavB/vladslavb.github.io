import styles from './styles.css'
import Button from '@mui/joy/Button'
import ButtonGroup from '@mui/joy/ButtonGroup'
import React from 'react'
import { nextQuestion, chooseTeam, useDispatch, useSelector, wrongAnswer, openBonus, correctBonus, setBonusChance, showAttachment, hideAttachment, setActiveAttachment } from '../../../store'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'
import Chip from '@mui/joy/Chip'
import Box from '@mui/joy/Box'
import { hitAnimation } from '../../game/Teams'
import { rightSound, wrongSound } from '../../../sounds'
import { AttachmentComponent } from '../edit/StaticQuestion'

function teamColor(team: string) {
  if (team === 'leftTeam') {
    return 'primary'
  } else {
    return 'danger'
  }
}

const ControlPanel: React.FC = () => {
  const dispatch = useDispatch()
  const { currentTeam, currentQuestion, drawFinished, bonusChance } = useSelector(state => state.game)
  const allOptionsOpen = useSelector(state => currentQuestion >= 0 && (
    state.questions[currentQuestion].options.every(option => option.opened)
  ))
  const totalQuestions = useSelector(state => state.questions.length)
  const everyoneDead = currentTeam == null && drawFinished
  const lastQuestion = currentQuestion === totalQuestions - 1

  const currentAttachment = useSelector(state => state.game.currentAttachment)

  function onFail() {
    if (currentTeam != null) {
      hitAnimation(currentTeam)
    }
    dispatch(wrongAnswer())
    wrongSound.play()
  }

  function onChanceClick(success: boolean) {
    if (bonusChance != null) {
      if (success) {
        dispatch(openBonus({questionIndex: currentQuestion, optionIndex: bonusChance.optionIndex}))
        dispatch(correctBonus({team: bonusChance.team, score: bonusChance.score}))
        dispatch(setActiveAttachment(bonusChance.attachment))
        rightSound.play()
      }
      dispatch(setBonusChance(null))
    }
  }

  return (
    <>
      <Stack direction='row' spacing={2} className={styles.gameControl} flexWrap='wrap'>
        {bonusChance == null ? <>
          <Box flexGrow={1}>
            {currentTeam != null && !allOptionsOpen && (
              <Button
                className={styles.wrong}
                color='danger' variant='solid'
                onClick={onFail}
                disabled={everyoneDead}
              >
                Промах
              </Button>
            )}
          </Box>
          {currentQuestion >= 0 && <>
            {!drawFinished && <Chip color='warning' variant='soft'>Розыгрыш хода...</Chip>}
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
                <Typography color={teamColor(currentTeam)}>
                  Отвечают {currentTeam === 'leftTeam' ? 'синие' : 'красные'}
                </Typography>
              )
            )}
          </>}
          {allOptionsOpen && !lastQuestion && (
            <Button
              style={{alignSelf: 'flex-start'}}
              color='primary'
              onClick={() => dispatch(nextQuestion())}
            >
              Следующий вопрос
            </Button>
          )}
        </> : <>
          <Typography>
            Команда <Typography color={teamColor(bonusChance.team)}>
              {bonusChance.team === 'leftTeam' ? 'синих' : 'красных'}
            </Typography> правильно ответила на допвопрос?
          </Typography>
          <Button color='success' onClick={() => onChanceClick(true)}>Да</Button>
          <Button color='danger' onClick={() => onChanceClick(false)}>Нет</Button>
        </>}
      </Stack>
      {currentAttachment && (
        <Stack direction='row' gap={2} alignItems='center'>
          {currentAttachment.show && <div className={styles.overlay} />}
          <AttachmentComponent {...currentAttachment} />
          <Button
            variant='soft'
            onClick={() => dispatch(currentAttachment.show ? hideAttachment() : showAttachment())}
            className={styles.showButton}
          >
            {currentAttachment.show ? 'Скрыть' : 'Показать'}
          </Button>
        </Stack>
      )}
    </>
  )
}

export default ControlPanel
