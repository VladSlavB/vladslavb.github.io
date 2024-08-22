import styles from './styles.css'
import React from 'react'
import { correctAnswer, correctBonus, useDispatch, useGameSelector, wrongBonus, OrdinaryQuestion, useSelector, areAllOptionsOpened, wrongAnswer, discardBonusChance, utilizeHealthChance, discardHealthChance, chooseTeam, showQuestion, makeSubtotal, OrdinaryState, QuestionName } from '../../../store'
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
import CurrentAttachments from './CurrentAttachments'
import SubtotalThenNextQuestion from './SubtotalThenNextQuestion'


type WrapperProps = {
  question: OrdinaryQuestion
}
type Props = WrapperProps & OrdinaryState
const OrdinaryQuestion: React.FC<Props> = ({question, bonusChance, options: optionsState, drawFinished}) => {
  const currentTeam = useGameSelector(game => game.currentTeam)
  const everyoneDead = useGameSelector(game => game.leftTeam.health + game.rightTeam.health === 0)
  const dispatch = useDispatch()
  const ref = useAutoScroll()
  const shown = useGameSelector(game => game.questionShown)

  function onOptionClick(optionIndex: number) {
    const option = question.options[optionIndex]
    dispatch(correctAnswer({
      index: optionIndex,
      score: option.score,
      best: question.options.every(other => other.score <= option.score),
      attachments: option.attachments,
      hasBonus: option.bonus != null,
    }))
  }

  function onBonusClick(optionIndex: number) {
    const option = question.options[optionIndex]
    if (option.bonus != null) {
      dispatch(correctBonus({
        index: optionIndex,
        score: option.bonus.score,
        attachments: option.bonus.attachments,
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
            const disabled = (
              optionsState[i].bonus?.opened ||
              !optionsState[i].opened ||
              bonusChance != null || (
                currentTeam != null && !optionsState[i].bonus?.vacantFor[currentTeam]
              ) ||
              !drawFinished
            )
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
            return (
              <div className={styles.gameOption} key={i}>
                <ButtonGroup size={size}>
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

export default ordinaryWrapper(OrdinaryQuestion)

const BottomControlsInner: React.FC<OrdinaryState> = ({drawFinished, bonusChance, healthChance}) => {
  const dispatch = useDispatch()
  const currentTeam = useGameSelector(game => game.currentTeam)
  const currentQuestion = useGameSelector(game => game.currentQuestion)
  const allOptionsOpened = useGameSelector(areAllOptionsOpened)
  const bonusChanceBonus = useSelector(state => {
    const question = state.questions[state.game.present.currentQuestion]
    if (bonusChance != null && question.name !== QuestionName.dynamic) {
      return question.options[bonusChance.optionIndex].bonus
    }
    return null
  })
  const everyoneDead = currentTeam == null && drawFinished

  const roundFinished = useGameSelector(game => game.roundFinished)

  const shown = useGameSelector(game => game.questionShown)

  function onFail() {
    if (currentTeam != null) {
      hitAnimation(currentTeam)
    }
    dispatch(wrongAnswer())
  }

  function onBonusChanceClick(success: boolean) {
    if (bonusChance == null || bonusChanceBonus == null || currentTeam == null) return
    if (success) {
      dispatch(correctBonus({
        index: bonusChance.optionIndex,
        score: bonusChanceBonus.score,
        attachments: bonusChanceBonus.attachments,
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
              !allOptionsOpened && (
                <Typography color={teamColor(currentTeam)}>
                  Отвечают {currentTeam === 'leftTeam' ? 'синие' : 'красные'}
                </Typography>
              )
            )}
          </> : (
            <Button color='primary' onClick={() => dispatch(showQuestion())}>Показать вопрос</Button>
          ))}
          {roundFinished && <SubtotalThenNextQuestion />}
        </>}
      </Stack>
      <CurrentAttachments />
    </>
  )
}

const BottomControls = ordinaryWrapper(BottomControlsInner)

function teamColor(team: string) {
  if (team === 'leftTeam') {
    return 'primary'
  } else {
    return 'danger'
  }
}

function ordinaryWrapper<P>(Component: React.FC<P & OrdinaryState>): React.FC<P> {
  return props => {
    const q = useGameSelector(state => state.q)
    if (q?.type !== 'ordinary') return null
    return <Component {...props} {...q} />
  }
}
