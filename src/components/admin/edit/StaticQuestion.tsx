import styles from './styles.css'
import React from 'react'
import { correctAnswer, openOption, removeQuestion, useDispatch, useSelector } from '../../../store'
import Card from '@mui/joy/Card'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import Stack from '@mui/joy/Stack'
import VisibilityOff from '@mui/icons-material/VisibilityOffOutlined'
import Visibility from '@mui/icons-material/VisibilityOutlined'
import Edit from '@mui/icons-material/Edit'
import Delete from '@mui/icons-material/Delete'
import ControlPanel from '../play/ControlPanel'
import { confirmBonusDialog } from '../play/ConfirmBonusDialog'
import { rightRingtone } from '../../../sounds'

type Props = {
  index: number
  onEdit: () => void
  canEdit?: boolean
}

const StaticQuestion: React.FC<Props> = ({index, onEdit, canEdit}) => {
  const question = useSelector(state => state.questions[index])
  const gameActive = useSelector(state => state.game.active)
  const currentQuestion = useSelector(state => state.game.currentQuestion)
  const currentTeam = useSelector(state => state.game.currentTeam)
  const everyoneDead = useSelector(state => state.game.leftTeam.health + state.game.rightTeam.health === 0)
  const drawFinished = useSelector(state => state.game.drawFinished)
  const questionActive = gameActive && currentQuestion === index
  const dispatch = useDispatch()

  async function onOptionClick(optionIndex: number) {
    const option = question.options[optionIndex]
    dispatch(openOption({questionIndex: index, optionIndex}))
    let score = option.score
    if (drawFinished && option.withBonus && await confirmBonusDialog()) {
      score += 1
    }
    dispatch(correctAnswer({
      score,
      best: question.options.every(other => other.score <= option.score),
      worst: question.options.every(other => other.score > option.score || other == option)
    }))
    rightRingtone.play()
  }

  return (
    <Card variant={questionActive ? 'soft' : 'outlined'}>
      <Stack spacing={2}>
        <div className={styles.header}>
          <Typography
            level='title-lg'
            flexGrow={1}
            whiteSpace='pre-wrap'
            color={gameActive && !questionActive ? 'neutral' : undefined}
          >{question.value}</Typography>
          {canEdit && (
            <div className={styles.actions}>
              <Button onClick={onEdit} variant='plain' size='sm'><Edit /></Button>
              <Button
                onClick={() => {
                  if (confirm(`Удалить вопрос "${question.value}"?`)) {
                    dispatch(removeQuestion(index))
                  }
                }}
                variant='plain' color='danger' size='sm'
              >
                <Delete />
              </Button>
            </div>
          )}
        </div>
        <table className={styles.options}>
          <TwoColumns>
            {question.options.map((option, i) => {
              const canClick = (currentTeam != null || everyoneDead) && questionActive && !option.opened
              let className = styles.optionText
              if (!gameActive) className += ' ' + styles.black
              if (questionActive && option.opened) className += ' ' + styles.tiny
              return (
                <Button
                  fullWidth
                  key={i} onClick={() => onOptionClick(i)} size='sm'
                  variant='plain'
                  color='neutral'
                  disabled={!canClick}
                  startDecorator={
                    questionActive ? (
                      option.opened ? <Visibility /> : <VisibilityOff />
                    ) : undefined
                  }
                  endDecorator={
                    <>{option.score}{option.withBonus && '*'}</>
                  }
                >
                  <span className={className}>{option.value}</span>
                </Button>
              )
            })}
          </TwoColumns>
        </table>
        {gameActive && currentQuestion === index && (
          <ControlPanel />
        )}
      </Stack>
    </Card>
  )
}

export default StaticQuestion

function TwoColumns({children}: {children: JSX.Element[]}) {
  const total = children.length
  const half = Math.ceil(total / 2)
  const rows: JSX.Element[][] = []
  for (let i = 0; i < half; i ++) {
    const row = [children[i]]
    if (i + half < total) {
      row.push(children[i + half])
    }
    rows.push(row)
  }
  return (
    <tbody>
      {rows.map((row, i) => (
        <tr key={i}>{row.map((cell, j) => (
          <td key={j}>{cell}</td>
        ))}</tr>
      ))}
    </tbody>
  )
}
