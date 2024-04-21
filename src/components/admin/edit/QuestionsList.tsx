import React, { useState } from 'react'
import { useSelector } from '../../../store'
import Button from '@mui/joy/Button'
import StaticQuestion from './StaticQuestion'
import QuestionEdit from './QuestionEdit'
import Stack from '@mui/joy/Stack'
import Add from '@mui/icons-material/Add'

import styles from './styles.css'

type Mode = 
| {action: 'view'}
| {action: 'edit', index: number}
| {action: 'add'}

const QuestionsList: React.FC = () => {
  const numQuestions = useSelector(state => state.questions.length)
  const [ mode, setMode ] = useState<Mode>({action: 'view'})

  return (
    <Stack spacing={2} className={styles.list}>
      {Array(numQuestions).fill(0).map((_, index) => (
        (mode.action === 'edit' && index === mode.index) ? (
          <QuestionEdit editIndex={index} onDone={() => setMode({action: 'view'})} key={index} />
        ) : (
          <StaticQuestion
            index={index} onEdit={() => setMode({action: 'edit', index})} key={index}
            canEdit={mode.action === 'view'}
          />
        )
      ))}
      {mode.action === 'add' && (
        <QuestionEdit onDone={() => setMode({action: 'view'})} />
      )}
      {mode.action === 'view' && (
        <Button
          className={styles.add} size='lg' variant='soft' startDecorator={<Add />}
          onClick={() => setMode({action: 'add'})}
        >
          Добавить вопрос
        </Button>
      )}
    </Stack>
  )
}

export default QuestionsList
