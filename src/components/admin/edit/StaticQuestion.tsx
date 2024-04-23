import React from 'react'
import {
  correctAnswer, openOption, removeQuestion, useDispatch, useSelector, wrongAnswer
} from '../../../store'
import Card from '@mui/joy/Card'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import Stack from '@mui/joy/Stack'
import Box from '@mui/joy/Box'

import styles from './styles.css'

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
  const allOptionsOpen = useSelector(state => currentQuestion >= 0 && (
    state.questions[currentQuestion].options.every(option => option.opened)
  ))
  const questionActive = gameActive && currentQuestion === index
  const variant = questionActive ? 'soft' : 'outlined'
  const canClick = (currentTeam != null || everyoneDead) && questionActive
  const dispatch = useDispatch()

  function onOptionClick(optionIndex: number) {
    const option = question.options[optionIndex]
    dispatch(openOption({questionIndex: index, optionIndex}))
    dispatch(correctAnswer({
      score: option.score,
      best: question.options.every(other => other.score <= option.score),
      worst: question.options.every(other => other.score > option.score || other == option)
    }))
  }

  return (
    <Card variant={variant}>
      <Stack spacing={2}>
        <div className={styles.header}>
          <Typography level='title-lg' className={styles.title}>{question.value}</Typography>
          {canEdit && (
            <>
              <Button onClick={onEdit} variant='outlined' className={styles.action}>Редактировать</Button>
              <Button
                onClick={() => dispatch(removeQuestion(index))}
                variant='outlined' color='danger' className={styles.action}
              >
                Удалить
              </Button>
            </>
          )}
        </div>
        {canClick && <Typography>Кликните на вариант, чтобы открыть его</Typography>}
        <table className={styles.options}>
          <TwoColumns>
            {question.options.map((option, i) => {
              const className = questionActive ? (
                option.opened ? styles.opened : styles.interactive
              ) : undefined
              const onClick = canClick && !option.opened ? () => onOptionClick(i) : undefined
              return (
                <Box sx={{p: 0.5}} key={i} className={className} onClick={onClick}>
                  <Stack direction='row' spacing={2} alignItems='baseline' justifyContent='space-between'>
                    <Typography>{option.value}</Typography>
                    <Typography className={styles.score}>{option.score}{option.withBonus && '*'}</Typography>
                  </Stack>
                </Box>
              )
            })}
          </TwoColumns>
        </table>
        {currentTeam != null && currentQuestion === index && !allOptionsOpen && (
          <Button
            className={styles.wrong}
            color='danger' variant='outlined'
            onClick={() => dispatch(wrongAnswer())}
            disabled={everyoneDead}
          >
            Промах
          </Button>
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
