import styles from './styles.css'
import Button from '@mui/joy/Button'
import ButtonGroup from '@mui/joy/ButtonGroup'
import React from 'react'
import { nextQuestion, chooseTeam, useDispatch, useSelector, wrongAnswer, correctBonus, discardChance, useGameSelector, toggleAttachmentVisibility } from '../../../store'
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

const QuestionControls: React.FC = () => {
  const dispatch = useDispatch()
  const currentTeam = useGameSelector(game => game.currentTeam)
  const currentQuestion = useGameSelector(game => game.currentQuestion)
  const drawFinished = useGameSelector(game => game.drawFinished)
  const bonusChance = useGameSelector(game => game.bonusChance)
  const questionComplete = useSelector(state => {
    const game = state.game.present
    if (game.currentQuestion >= 0) {
      const currentOptions = state.questions[game.currentQuestion].options
      return game.openedOptions.every(_ => _) && (
        game.openedBonuses.every((open, i) => open || currentOptions[i].bonus == null)
      )
    }
    return false
  })
  const bonusInChance = useSelector(state => {
    const game = state.game.present
    if (game.bonusChance != null) {
      return state.questions[game.currentQuestion]?.options[game.bonusChance?.optionIndex].bonus
    }
    return null
  })
  const totalQuestions = useSelector(state => state.questions.length)
  const everyoneDead = currentTeam == null && drawFinished
  const lastQuestion = currentQuestion === totalQuestions - 1

  const currentAttachment = useGameSelector(game => game.currentAttachment)

  const attachmentShown = useSelector(state => state.attachmentVisible)

  function onFail() {
    if (currentTeam != null) {
      hitAnimation(currentTeam)
    }
    dispatch(wrongAnswer())
    wrongSound.play()
  }

  function onChanceClick(success: boolean) {
    if (bonusChance != null && bonusInChance != null) {
      if (success) {
        dispatch(correctBonus({
          index: bonusChance.optionIndex,
          team: bonusChance.team,
          score: bonusInChance.score,
          attachment: bonusInChance.attachment,
        }))
        rightSound.play()
      } else {
        dispatch(discardChance())
      }
    }
  }

  return (
    <>
      <Stack direction='row' spacing={2} className={styles.gameControl} flexWrap='wrap'>
        {bonusChance == null ? <>
          <Box flexGrow={1}>
            {currentTeam != null && !questionComplete && (
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
              !questionComplete && (
                <Typography color={teamColor(currentTeam)}>
                  Отвечают {currentTeam === 'leftTeam' ? 'синие' : 'красные'}
                </Typography>
              )
            )}
          </>}
          {questionComplete && !lastQuestion && (
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
          {attachmentShown && <div className={styles.overlay} />}
          <AttachmentComponent {...currentAttachment} />
          <Button
            variant='soft'
            onClick={() => dispatch(toggleAttachmentVisibility())}
            className={styles.showButton}
          >
            {attachmentShown ? 'Скрыть' : 'Показать'}
          </Button>
        </Stack>
      )}
    </>
  )
}

export default QuestionControls
