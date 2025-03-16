import styles from './styles.css'
import React, { useCallback } from 'react'
import { openOrdinaryOption, correctBonus, useDispatch, useGameSelector, wrongBonus, OrdinaryQuestion, useSelector, OrdinaryState, startEditing, startRound, selectOptionWithVacantBonus, toggleGuess, Team } from '../../../store'
import Card from '@mui/joy/Card'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import Stack from '@mui/joy/Stack'
import Close from '@mui/icons-material/Close'
import IconButton from '@mui/joy/IconButton'
import Checkbox from '@mui/joy/Checkbox'
import { useAutoScroll } from '../scroll'
import Chip from '@mui/joy/Chip'
import CurrentAttachments from './CurrentAttachments'
import HeaderWithActions from '../preview/HeaderWithActions'
import NextQuestionButton from './NextQuestionButton'
import Check from '@mui/icons-material/Check'
import Sheet from '@mui/joy/Sheet'


type WrapperProps = {
  question: OrdinaryQuestion
}
type Props = WrapperProps & OrdinaryState
const OrdinaryQuestion: React.FC<Props> = ({question, options: optionsState}) => {
  const dispatch = useDispatch()
  const ref = useAutoScroll()
  const roundStarted = useGameSelector(game => game.roundStarted)
  const index = useGameSelector(game => game.currentQuestion)
  const editorStateView = useSelector(state => state.editor.mode === 'view')
  const optionWithVacantBonus = useGameSelector(selectOptionWithVacantBonus)

  function onOptionOpen(optionIndex: number) {
    const option = question.options[optionIndex]
    dispatch(openOrdinaryOption({
      index: optionIndex,
      score: option.score,
    }))
  }

  function checkboxForTeam(team: Team, index: number) {
    return (
      <div className={styles.checkboxWrapper}>
        <Checkbox
          overlay
          color={teamColor(team)}
          checked={optionsState[index].guessedBy[team]}
          onChange={() => dispatch(toggleGuess({team, index}))}
        />
      </div>
    )
  }
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
            const canClick = roundStarted && !optionsState[i].opened && optionWithVacantBonus == null
            let className = styles.optionText
            if (optionsState[i].opened) className += ' ' + styles.tiny
            let score = `${option.score}`
            if (option.bonus != null) {
              score += `+${option.bonus.score}`
            }
            return (
              <Stack className={styles.gameOption} key={i} direction='row'>
                <Button
                  fullWidth
                  key='option'
                  variant='plain'
                  color='neutral'
                  onClick={() => onOptionOpen(i)}
                  size='lg'
                  disabled={!canClick}
                  // endDecorator={<span className={styles.score}>{score}</span>}
                >
                  <span className={className}>{i + 1}. {option.value}</span>
                </Button>
                {canClick && (
                  <>
                    {checkboxForTeam('leftTeam', i)}
                    {checkboxForTeam('rightTeam', i)}
                  </>
                )}
              </Stack>
            )
          })}
        </div>
        <BottomControls question={question} />
      </Stack>
    </Card>
  )
}

export default ordinaryWrapper(OrdinaryQuestion)

const BottomControlsInner: React.FC<OrdinaryState & {question: OrdinaryQuestion}> = ({question, options: optionsState}) => {
  const dispatch = useDispatch()

  const roundFinished = useGameSelector(game => game.roundFinished)
  const roundStarted = useGameSelector(game => game.roundStarted)

  const optionWithVacantBonus = useSelector(state => {
    const option = selectOptionWithVacantBonus(state.game.present)
    if (option == null) return null
    const index = optionsState.indexOf(option)
    return {
      ...option,
      bonus: question.options[index].bonus!,
    }
  })
  const bonusChance = useCallback((team: Team) => {
    const score = optionWithVacantBonus?.bonus.score ?? 0 // always > 0
    console.log('bonusChance', optionWithVacantBonus)
    return (
      <Sheet variant='outlined' color={teamColor(team)} sx={{p: 1}}>
        <Typography fontSize='sm' color={teamColor(team)}>{team === 'leftTeam' ? 'Синие' : 'Красные'}</Typography>
        <Stack direction='row' sx={{m: -1, mt: 0}}>
          <IconButton color='success' onClick={() => dispatch(correctBonus({score, team}))}>
            <Check />
          </IconButton>
          <IconButton color='danger' onClick={() => {
            dispatch(wrongBonus({team}))
          }}>
            <Close />
          </IconButton>
        </Stack>
      </Sheet>
    )
  }, [optionWithVacantBonus])

  return (
    <>
      <Stack direction='row' spacing={2} className={styles.gameControl} flexWrap='wrap'>
        {<>
          {(roundStarted ? null : (
            <Button color='primary' onClick={() => dispatch(startRound())}>Показать вопрос</Button>
          ))}
          {roundFinished && <NextQuestionButton />}
          {optionWithVacantBonus != null && (
            <>
              {!optionWithVacantBonus.guessedBy.leftTeam && !optionWithVacantBonus.guessedBy.rightTeam ? (
                <Button color='primary' onClick={() => dispatch(correctBonus({
                  score: optionWithVacantBonus.bonus.score,
                }))}>Открыть звёздочку</Button>
              ) : (
                <>
                  <Typography>Ответ на звёздочку:</Typography>
                  &nbsp;
                  {optionWithVacantBonus.guessedBy.leftTeam && (
                    bonusChance('leftTeam')
                  )}
                  {optionWithVacantBonus.guessedBy.rightTeam && (
                    bonusChance('rightTeam')
                  )}
                </>
              )}
            </>
          )}
        </>}
      </Stack>
      <CurrentAttachments />
    </>
  )
}

const BottomControls = ordinaryWrapper(BottomControlsInner)

function teamColor(team: Team) {
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
