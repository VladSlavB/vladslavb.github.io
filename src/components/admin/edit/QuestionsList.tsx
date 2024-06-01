import styles from './styles.css'
import React, { useEffect } from 'react'
import { finishEditing, startAdding, startEditing, useDispatch, useGameSelector, useSelector } from '../../../store'
import Button from '@mui/joy/Button'
import StaticQuestion from './StaticQuestion'
import QuestionEdit from './QuestionEdit'
import Stack from '@mui/joy/Stack'
import Add from '@mui/icons-material/Add'

const QuestionsList: React.FC = () => {
  const numQuestions = useSelector(state => state.questions.length)
  const editor = useSelector(state => state.editor)
  const gameActive = useGameSelector(game => game.active)
  useEffect(() => {
    if (editor.mode === 'add') {
      window.scrollTo(0, document.body.clientHeight)
    }
  }, [editor.mode])
  const dispatch = useDispatch()
  let className = styles.list
  if (gameActive) {
    className += ' ' + styles.wide
  }

  return (
    <Stack spacing={2} className={className}>
      {Array(numQuestions).fill(0).map((_, index) => (
        (editor.mode === 'edit' && index === editor.index) ? (
          <QuestionEdit editIndex={index} onDone={() => dispatch(finishEditing())} key={index} />
        ) : (
          <StaticQuestion
            index={index} onEdit={() => dispatch(startEditing(index))} key={index}
            canEdit={editor.mode === 'view' && !gameActive}
          />
        )
      ))}
      {editor.mode === 'add' && (
        <QuestionEdit onDone={() => dispatch(finishEditing())} />
      )}
      {editor.mode === 'view' && !gameActive && (
        <Button
          className={styles.add} size='lg' variant='soft' startDecorator={<Add />}
          onClick={() => dispatch(startAdding())}
        >
          Добавить вопрос
        </Button>
      )}
    </Stack>
  )
}

export default QuestionsList
