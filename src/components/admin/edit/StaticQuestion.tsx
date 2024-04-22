import React from 'react'
import { openOption, removeQuestion, useDispatch, useSelector } from '../../../store'
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
  const dispatch = useDispatch()
  const gameActive = useSelector(state => state.game.active)
  const currentQuestion = useSelector(state => state.game.currentQuestion)
  const questionActive = gameActive && currentQuestion === index
  const variant = questionActive ? 'soft' : 'outlined'

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
        {questionActive && <Typography>Кликните на вариант, чтобы открыть его</Typography>}
        <table className={styles.options}>
          <TwoColumns>
            {question.options.map((option, i) => {
              const className = questionActive ? (
                option.opened ? styles.opened : styles.interactive
              ) : undefined
              const onClick = questionActive ? (
                () => dispatch(openOption({questionIndex: index, optionIndex: i}))
              ) : undefined
              return (
                <Box sx={{p: 0.5}} key={i} className={className} onClick={onClick}>
                  <Stack direction='row' spacing={2} alignItems='baseline'>
                    <Typography>{option.value}</Typography>
                    <Typography variant='soft'>{option.score}{option.withBonus && '*'}</Typography>
                  </Stack>
                </Box>
              )
            })}
          </TwoColumns>
        </table>
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
