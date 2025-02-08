import styles from './styles.css'
import React from 'react'
import { correctAnswer, correctBonus, useDispatch, useGameSelector, wrongBonus, OrdinaryQuestion, useSelector, areAllOptionsOpened, wrongAnswer, utilizeHealthChance, discardHealthChance, chooseTeam, showQuestion, OrdinaryState, QuestionName, startEditing, isEveryoneDeadSelector } from '../../../store'
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
import CurrentAttachments from './CurrentAttachments'
import HeaderWithActions from '../preview/HeaderWithActions'
import AttachmentIcon from '@mui/icons-material/Attachment'
import { NUM_DRAWS } from '../../../defaults'
import NextQuestionButton from './NextQuestionButton'


type WrapperProps = {
  question: OrdinaryQuestion
}
type Props = WrapperProps & OrdinaryState
const OrdinaryQuestion: React.FC<Props> = ({question, options: optionsState, drawsFinished}) => {
  const currentTeam = useGameSelector(game => game.currentTeam)
  const everyoneDead = useGameSelector(isEveryoneDeadSelector)
  const dispatch = useDispatch()
  const ref = useAutoScroll()
  const shown = useGameSelector(game => game.questionShown)
  const index = useGameSelector(game => game.currentQuestion)
  const editorStateView = useSelector(state => state.editor.mode === 'view')

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

  const healthChanceActive = useGameSelector(game => game.q?.type === 'ordinary' && game.q.healthChance != null)

  return (
    <Card variant='soft' ref={ref}>
      <Stack spacing={2}>
        <HeaderWithActions
          header={question.value}
          onEdit={() => dispatch(startEditing(index))}
          showActions={editorStateView}
          disableDelete
        />
        <Chip variant='outlined' color='primary'>{question.name}</Chip>
        <div className={styles.options}>
          {question.options.map((option, i) => {
            const canClick = (currentTeam != null || everyoneDead) && shown && !optionsState[i].opened && !healthChanceActive
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
                startDecorator={option.attachments.length > 0 ? <AttachmentIcon /> : undefined}
                endDecorator={<>
                  {option.score}
                </>}
              >
                <span className={className}>{option.value}</span>
              </Button>
            )]
            const disabled = (
              optionsState[i].bonus?.opened ||
              !optionsState[i].opened || (
                currentTeam != null && !optionsState[i].bonus?.vacantFor[currentTeam]
              ) ||
              drawsFinished < NUM_DRAWS ||
              healthChanceActive
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
                  style={{whiteSpace: 'nowrap'}}
                  startDecorator={option.bonus.attachments.length > 0 ? <AttachmentIcon /> : undefined}
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

const BottomControlsInner: React.FC<OrdinaryState> = ({drawsFinished, healthChance, drawHalfFinished}) => {
  const dispatch = useDispatch()
  const currentTeam = useGameSelector(game => game.currentTeam)
  const currentQuestion = useGameSelector(game => game.currentQuestion)
  const allOptionsOpened = useGameSelector(areAllOptionsOpened)
  const everyoneDead = useGameSelector(isEveryoneDeadSelector)

  const roundFinished = useGameSelector(game => game.roundFinished)

  const shown = useGameSelector(game => game.questionShown)

  function onFail(punch: boolean = true) {
    if (currentTeam != null) {
      hitAnimation(currentTeam)
    }
    dispatch(wrongAnswer(punch))
  }

  function onHealthChanceClick(utilize: boolean) {
    if (utilize) {
      dispatch(utilizeHealthChance())
    } else {
      dispatch(discardHealthChance())
    }
  }

  const lastAnswerWasWrong = useSelector(state => {
    const previousGame = state.game.past[state.game.past.length - 1]
    const presentGame = state.game.present
    if (previousGame?.currentTeam == null) return false
    return previousGame[previousGame.currentTeam].score === presentGame[previousGame.currentTeam].score
  })

  return (
    <>
      <Stack direction='row' spacing={2} className={styles.gameControl} flexWrap='wrap'>
        {healthChance != null ? <>
          <Typography>
            Оставить команду <Typography color={teamColor(healthChance)}>
              {healthChance === 'leftTeam' ? 'синих' : 'красных'}
            </Typography> в живых, <b>вернув</b> им жизнь?
          </Typography>
          <Button color='success' onClick={() => onHealthChanceClick(true)}>Да</Button>
          <Button color='danger' onClick={() => onHealthChanceClick(false)}>Нет</Button>
        </> : <>
          <Stack direction='row' flexGrow={1} gap={1}>
            {currentTeam != null && !allOptionsOpened && (
              <Button
                size='lg'
                className={styles.wrong}
                color='danger' variant='solid'
                onClick={() => onFail(true)}
                disabled={everyoneDead}
              >
                Промах
              </Button>
            )}
            {currentTeam != null && drawsFinished < NUM_DRAWS && drawHalfFinished && !lastAnswerWasWrong && (
              <Button
                size='lg'
                className={styles.same}
                color='danger' variant='outlined'
                onClick={() => onFail(false)}
                disabled={everyoneDead}
              >
                Ответы совпали
              </Button>
            )}
          </Stack>
          {currentQuestion >= 0 && (shown ? <>
            {drawsFinished < NUM_DRAWS && (
              <Chip color='warning' variant='soft'>Розыгрыш хода...</Chip>
            )}
            {currentTeam == null && drawsFinished < NUM_DRAWS ? (
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
              !allOptionsOpened && currentTeam != null && (
                <Typography color={teamColor(currentTeam)}>
                  Отвечают {currentTeam === 'leftTeam' ? 'синие' : 'красные'}
                </Typography>
              )
            )}
          </> : (
            <Button color='primary' onClick={() => dispatch(showQuestion())}>Показать вопрос</Button>
          ))}
          {roundFinished && <NextQuestionButton />}
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
