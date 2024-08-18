import styles from './styles.css'
import React, { useState } from 'react'
import { Attachment, correctAnswer, correctBonus, useDispatch, useGameSelector, wrongBonus, addOptionDynamically, OrdinaryQuestion, useSelector, areAllOptionsOpened, wrongAnswer, discardBonusChance, utilizeHealthChance, discardHealthChance, chooseTeam, showQuestion, makeSubtotal } from '../../../store'
import Card from '@mui/joy/Card'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import Stack from '@mui/joy/Stack'
import ButtonGroup from '@mui/joy/ButtonGroup'
import Close from '@mui/icons-material/Close'
import IconButton from '@mui/joy/IconButton'
import { hitAnimation } from '../../game/Teams'
import { useAutoScroll } from '../scroll'
import Chip from '@mui/joy/Chip'
import Box from '@mui/joy/Box'
import NextQuestionButton from './NextQuestionButton'


type Props = {
  question: OrdinaryQuestion
}
const OrdinaryQuestion: React.FC<Props> = ({question}) => {
  const currentTeam = useGameSelector(game => game.currentTeam)
  const everyoneDead = useGameSelector(game => game.leftTeam.health + game.rightTeam.health === 0)
  const bonusChance = useGameSelector(game => game.bonusChance)
  const optionsState = useGameSelector(game => game.options)
  const drawFinished = useGameSelector(game => game.drawFinished)
  const dispatch = useDispatch()
  const ref = useAutoScroll()
  const shown = useGameSelector(game => game.questionShown)

  function onOptionClick(optionIndex: number) {
    const option = question.options[optionIndex]
    dispatch(correctAnswer({
      index: optionIndex,
      score: option.score,
      best: question.options.every(other => other.score <= option.score),
      attachment: option.attachments[0], // TODO multiple attachments
      hasBonus: option.bonus != null,
    }))
  }

  function onBonusClick(optionIndex: number) {
    const option = question.options[optionIndex]
    if (option.bonus != null) {
      dispatch(correctBonus({
        index: optionIndex,
        score: option.bonus.score,
        attachment: option.bonus.attachments[0], // TODO multiple attachments
      }))
    }
  }

  function onBonusWrong(optionIndex: number) {
    if (currentTeam == null) return
    dispatch(wrongBonus(optionIndex))
    hitAnimation(currentTeam)
  }

  return (
    <Card variant='soft' ref={ref}>
      <Stack spacing={2}>
        <Typography
          level='title-lg'
          flexGrow={1}
          whiteSpace='pre-wrap'
        >{question.value}</Typography>
        <Chip variant='outlined' color='primary'>{question.name}</Chip>
        <div className={styles.options}>
            {question.options.map((option, i) => {
              const canClick = (currentTeam != null || everyoneDead) && shown && !optionsState[i].opened && bonusChance == null
              let className = styles.optionText
              if (optionsState[i].opened) className += ' ' + styles.tiny
              const size = 'lg'
              const buttons = [(
                <Button fullWidth
                  key='option'
                  variant='plain'
                  color='neutral'
                  onClick={() => onOptionClick(i)}
                  size={size}
                  disabled={!canClick}
                  // startDecorator={attachmentIcon(option.attachments[0])}
                  // TODO multiple attachments
                  endDecorator={<>
                    {option.score}
                  </>}
                >
                  <span className={className}>{option.value}</span>
                </Button>
              )]
              const disabled = optionsState[i].bonus?.opened || !optionsState[i].opened || bonusChance != null || (
                currentTeam != null && !optionsState[i].bonus?.vacantFor[currentTeam]
              ) || !drawFinished
              if (option.bonus != null) {
                buttons.push(
                  <Button
                    key='bonus'
                    title='Правильный ответ на звёздочку'
                    variant='soft'
                    disabled={disabled}
                    size={size}
                    onClick={() => onBonusClick(i)}
                    // TODO multiple attachments
                    // startDecorator={attachmentIcon(option.bonus.attachments[0])}
                  >
                    +{option.bonus.score}
                  </Button>
                )
              }
              if (option.bonus != null && !disabled && currentTeam != null) {
                buttons.push(
                  <IconButton
                    key='bonus-wrong'
                    title='Неправильный ответ на звёздочку'
                    variant='soft' color='danger'
                    onClick={() => onBonusWrong(i)}
                  >
                    <Close />
                  </IconButton>
                )
              }
              const buttonGroupClassName = styles.gameOption
              return (
                <div key={i}>
                  <ButtonGroup size={size} className={buttonGroupClassName}>
                    {buttons}
                  </ButtonGroup>
                </div>
              )
            })}
        </div>
        <BottomControls />
      </Stack>
    </Card>
  )
}

export default OrdinaryQuestion

const BottomControls: React.FC = () => {
  const dispatch = useDispatch()
  const currentTeam = useGameSelector(game => game.currentTeam)
  const currentQuestion = useGameSelector(game => game.currentQuestion)
  const drawFinished = useGameSelector(game => game.drawFinished)
  const bonusChance = useGameSelector(game => game.bonusChance)
  const allOptionsOpened = useGameSelector(areAllOptionsOpened)
  const bonusInChance = useSelector(state => {
    const game = state.game.present
    if (game.bonusChance != null) {
      return (state.questions.at(game.currentQuestion) as OrdinaryQuestion).options[game.bonusChance?.optionIndex].bonus
    }
    return null
  })
  const totalQuestions = useSelector(state => state.questions.length)
  const everyoneDead = currentTeam == null && drawFinished
  const lastQuestion = currentQuestion === totalQuestions - 1

  const healthChance = useGameSelector(game => game.healthChance)

  const subtotalShown = useGameSelector(game => game.subtotalShown)
  const roundFinished = useGameSelector(game => game.roundFinished)

  const hasFinale = useSelector(state => state.finale != null)
  const shown = useGameSelector(game => game.questionShown)

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
        attachment: bonusInChance.attachments[0], // TODO multiple attachments
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
          {currentQuestion >= 0 && (shown ? <>
            {!drawFinished && (
              <Chip color='warning' variant='soft'>Розыгрыш хода...</Chip>
            )}
            {currentTeam == null ? (
              !everyoneDead && (
                <ButtonGroup>
                  <Button
                    onClick={() => dispatch(chooseTeam({team: 'leftTeam'}))}
                    variant='outlined'
                    color='primary'
                    size='lg'
                  >Синие быстрее</Button>
                  <Button
                    onClick={() => dispatch(chooseTeam({team: 'rightTeam'}))}
                    variant='outlined'
                    color='danger'
                    size='lg'
                  >Красные быстрее</Button>
                </ButtonGroup>
              )
            ) : (
              !allOptionsOpened && (
                <Typography color={teamColor(currentTeam)}>
                  Отвечают {currentTeam === 'leftTeam' ? 'синие' : 'красные'}
                </Typography>
              )
            )}
          </> : (
            <Button color='primary' onClick={() => dispatch(showQuestion())}>Показать вопрос</Button>
          ))}
          {roundFinished && (subtotalShown ? (
            (!lastQuestion || hasFinale) && (
              <NextQuestionButton style={{alignSelf: 'flex-start'}}>Следующий вопрос</NextQuestionButton>
            )
          ) : (
            <Button color='primary' onClick={() => dispatch(makeSubtotal())}>Показать счёт</Button>
          ))}
        </>}
      </Stack>
      
      {/* <CurrentAttachment /> */}
    </>
  )
}

function teamColor(team: string) {
  if (team === 'leftTeam') {
    return 'primary'
  } else {
    return 'danger'
  }
}
