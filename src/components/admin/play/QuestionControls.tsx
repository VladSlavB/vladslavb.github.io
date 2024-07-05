import styles from './styles.css'
import Button from '@mui/joy/Button'
import ButtonGroup from '@mui/joy/ButtonGroup'
import React from 'react'
import { nextQuestion, chooseTeam, useDispatch, useSelector, wrongAnswer, correctBonus, discardBonusChance, useGameSelector, toggleAttachmentVisibility, utilizeHealthChance, discardHealthChance, selectNextQuestionBonuses, areAllOptionsOpened, toggleSubtotalVisibility, openFinale } from '../../../store'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'
import Chip from '@mui/joy/Chip'
import Box from '@mui/joy/Box'
import { hitAnimation } from '../../game/Teams'
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
  const allOptionsOpened = useGameSelector(areAllOptionsOpened)
  const bonusInChance = useSelector(state => {
    const game = state.game.present
    if (game.bonusChance != null) {
      return state.questions.at(game.currentQuestion)?.options?.[game.bonusChance?.optionIndex].bonus
    }
    return null
  })
  const totalQuestions = useSelector(state => state.questions.length)
  const everyoneDead = currentTeam == null && drawFinished
  const lastQuestion = currentQuestion === totalQuestions - 1

  const currentAttachment = useGameSelector(game => game.currentAttachment)

  const attachmentShown = useSelector(state => state.visibility.attachment)
  const healthChance = useGameSelector(game => game.healthChance)
  const nextQuestionBonuses = useSelector(selectNextQuestionBonuses)

  const subtotalShown = useSelector(state => state.visibility.subtotal)

  const hasFinale = useSelector(state => state.finale != null)
  const dynamic = useSelector(state => state.questions[state.game.present.currentQuestion].options == null)

  function onFail() {
    if (currentTeam != null) {
      hitAnimation(currentTeam)
    }
    dispatch(wrongAnswer())
  }

  function onBonusChanceClick(success: boolean) {
    if (bonusChance == null || bonusInChance == null || currentTeam == null) return
    if (success) {
      dispatch(correctBonus({
        index: bonusChance.optionIndex,
        score: bonusInChance.score,
        attachment: bonusInChance.attachment,
      }))
    } else {
      dispatch(discardBonusChance())
      hitAnimation(currentTeam)
    }
  }

  function onHealthChanceClick(utilize: boolean) {
    if (utilize) {
      dispatch(utilizeHealthChance())
    } else {
      dispatch(discardHealthChance())
    }
  }

  return (
    <>
      <Stack direction='row' spacing={2} className={styles.gameControl} flexWrap='wrap'>
        {bonusChance != null && currentTeam != null ? <>
          <Typography>
            Команда <Typography color={teamColor(currentTeam)}>
              {currentTeam === 'leftTeam' ? 'синих' : 'красных'}
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
            {currentTeam != null && !allOptionsOpened && (
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
            {!drawFinished && (
              <Chip color='warning' variant='soft'>
                {dynamic ? 'Кто будет ходить первым?' : 'Розыгрыш хода...'}
              </Chip>
            )}
            {currentTeam == null ? (
              !everyoneDead && (
                <ButtonGroup>
                  <Button
                    onClick={() => dispatch(chooseTeam({team: 'leftTeam', finishDraw: dynamic}))}
                    variant='outlined'
                    color='primary'
                    size='lg'
                  >Синие{!dynamic && ' быстрее'}</Button>
                  <Button
                    onClick={() => dispatch(chooseTeam({team: 'rightTeam', finishDraw: dynamic}))}
                    variant='outlined'
                    color='danger'
                    size='lg'
                  >Красные{!dynamic && ' быстрее'}</Button>
                </ButtonGroup>
              )
            ) : (
              !allOptionsOpened && (
                <Typography color={teamColor(currentTeam)}>
                  Отвечают {currentTeam === 'leftTeam' ? 'синие' : 'красные'}
                </Typography>
              )
            )}
          </>}
          {(allOptionsOpened || everyoneDead) && (!lastQuestion || hasFinale) && <>
            <VisibilityButton
              variant='soft'
              visible={subtotalShown}
              hideText='Скрыть счёт'
              showText='Показать счёт'
              onClick = {() => dispatch(toggleSubtotalVisibility())}
            />
            <Button
              style={{alignSelf: 'flex-start', zIndex: subtotalShown ? 101 : 0}}
              color='primary'
              onClick={() => {
                if (subtotalShown) {
                  dispatch(toggleSubtotalVisibility())
                }
                dispatch(lastQuestion ? openFinale() : nextQuestion(nextQuestionBonuses))
              }}
            >
              Следующий вопрос
            </Button>
          </>}
        </>}
      </Stack>
      {currentAttachment && (
        <Stack direction='row' gap={2} alignItems='center'>
          <AttachmentComponent {...currentAttachment} />
          <VisibilityButton
            variant='soft' size='lg'
            onClick={() => dispatch(toggleAttachmentVisibility())}
            hideText='Скрыть'
            showText='Показать'
            visible={attachmentShown}
          />
        </Stack>
      )}
    </>
  )
}

export default QuestionControls

const VisibilityButton: React.FC<{
  visible: boolean
  showText: string
  hideText: string
} & React.ComponentProps<typeof Button>> = props => {
  let { visible, hideText, showText, className, ...restProps } = props
  if (visible) className += ' ' + styles.hideButton
  return <>
    {visible && <div className={styles.overlay} />}
    <Button className={className} {...restProps}>
      {visible ? hideText : showText}
    </Button>
  </>
}
