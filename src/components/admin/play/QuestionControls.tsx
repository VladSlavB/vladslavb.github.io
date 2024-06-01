import styles from './styles.css'
import Button from '@mui/joy/Button'
import ButtonGroup from '@mui/joy/ButtonGroup'
import React from 'react'
import { nextQuestion, chooseTeam, useDispatch, useSelector, wrongAnswer, correctBonus, discardBonusChance, useGameSelector, toggleAttachmentVisibility, utilizeHealthChance, discardHealthChance } from '../../../store'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'
import Chip from '@mui/joy/Chip'
import Box from '@mui/joy/Box'
import { hitAnimation } from '../../game/Teams'
import { finishSound, rightSound, wrongSound } from '../../../sounds'
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
      return game.options.every((option, i) => (
        option.opened && (currentOptions[i].bonus == null || option.bonus.opened)
      ))
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
  const almostEveryoneDead = useGameSelector(game => game.leftTeam.health + game.rightTeam.health === 0)

  const currentAttachment = useGameSelector(game => game.currentAttachment)

  const attachmentShown = useSelector(state => state.attachmentVisible)
  const healthChance = useGameSelector(game => game.healthChance)

  function onFail() {
    if (currentTeam != null) {
      hitAnimation(currentTeam)
    }
    dispatch(wrongAnswer())
    wrongSound.play()
  }

  function onBonusChanceClick(success: boolean) {
    if (bonusChance == null || bonusInChance == null) return
    if (success) {
      dispatch(correctBonus({
        index: bonusChance.optionIndex,
        team: bonusChance.team,
        score: bonusInChance.score,
        attachment: bonusInChance.attachment,
      }))
      rightSound.play()
    } else {
      dispatch(discardBonusChance())
      hitAnimation(bonusChance.team)
      wrongSound.play()
    }
  }

  function onHealthChanceClick(utilize: boolean) {
    if (utilize) {
      dispatch(utilizeHealthChance())
    } else {
      dispatch(discardHealthChance())
      if (almostEveryoneDead) {
        // now completely dead
        finishSound.play()
      }
    }
  }

  return (
    <>
      <Stack direction='row' spacing={2} className={styles.gameControl} flexWrap='wrap'>
        {bonusChance != null ? <>
          <Typography>
            Команда <Typography color={teamColor(bonusChance.team)}>
              {bonusChance.team === 'leftTeam' ? 'синих' : 'красных'}
            </Typography> правильно ответила на допвопрос?
          </Typography>
          <Button color='success' onClick={() => onBonusChanceClick(true)}>Да</Button>
          <Button color='danger' onClick={() => onBonusChanceClick(false)}>Нет</Button>
        </> : healthChance != null ? <>
          <Typography>
            Оставить команду <Typography color={teamColor(healthChance)}>
              {healthChance === 'leftTeam' ? 'синих' : 'красных'}
            </Typography> в живых, <b>вернув</b> им жизнь?
          </Typography>
          <Button color='success' onClick={() => onHealthChanceClick(true)}>Да</Button>
          <Button color='danger' onClick={() => onHealthChanceClick(false)}>Нет</Button>
        </> : <>
          <Box flexGrow={1}>
            {currentTeam != null && !questionComplete && (
              <Button
                size='lg'
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
                    size='lg'
                  >Синие быстрее</Button>
                  <Button
                    onClick={() => dispatch(chooseTeam('rightTeam'))}
                    variant='outlined'
                    color='danger'
                    size='lg'
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
        </>}
      </Stack>
      {currentAttachment && (
        <Stack direction='row' gap={2} alignItems='center'>
          {attachmentShown && <div className={styles.overlay} />}
          <AttachmentComponent {...currentAttachment} />
          <Button
            variant='soft' size='lg'
            onClick={() => dispatch(toggleAttachmentVisibility())}
            className={attachmentShown ? styles.hideButton : undefined}
          >
            {attachmentShown ? 'Скрыть' : 'Показать'}
          </Button>
        </Stack>
      )}
    </>
  )
}

export default QuestionControls
