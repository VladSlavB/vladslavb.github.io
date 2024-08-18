import styles from './styles.css'
import React from 'react'
import { finishEditing, startAdding, startAddingFinale, startEditing, startEditingFinale, useDispatch, useSelector } from '../../../store'
import Button from '@mui/joy/Button'
import QuestionEdit from '../edit/QuestionEdit'
import Stack from '@mui/joy/Stack'
import Add from '@mui/icons-material/Add'
import FinaleEdit from '../edit/FinaleEdit'
import StaticFinale from './FinalePreview'
import QuestionPreview from './QuestionPreview'

const QuestionsList: React.FC = () => {
  const numQuestions = useSelector(state => state.questions.length)
  const editor = useSelector(state => state.editor)
  const noFinale = useSelector(state => state.finale == null)
  const dispatch = useDispatch()

  return (
    <Stack spacing={2} className={styles.list}>
      {Array(numQuestions).fill(0).map((_, index) => (
        (editor.mode === 'edit' && index === editor.index) ? (
          <QuestionEdit
            editIndex={index}
            onDone={() => dispatch(finishEditing())}
            key={index}
          />
        ) : (
          <QuestionPreview 
            index={index}
            onEdit={() => dispatch(startEditing(index))}
            key={index}
            canEdit={editor.mode === 'view'}
          />
        )
      ))}
      {editor.mode === 'add' && (
        <QuestionEdit onDone={() => dispatch(finishEditing())} />
      )}
      <div className={styles.bottomButtons}>
        {editor.mode === 'view' && <>
          <Button
            className={styles.add} size='lg' variant='soft' startDecorator={<Add />}
            onClick={() => dispatch(startAdding())}
          >
            Добавить вопрос
          </Button>
          {noFinale && (
            <Button
              startDecorator={<Add />} size='lg' variant='soft'
              onClick={() => dispatch(startAddingFinale())}
            >
              Добавить финальный раунд
            </Button>
          )}
        </>}
      </div>
      {editor.mode !== 'editFinale' && (
        <StaticFinale onEdit={() => dispatch(startEditingFinale())} canEdit={editor.mode === 'view'} />
      )}
      {editor.mode === 'addFinale' && (
        <FinaleEdit onDone={() => dispatch(finishEditing())} />
      )}
      {editor.mode === 'editFinale' && (
        <FinaleEdit onDone={() => dispatch(finishEditing())} edit />
      )}
    </Stack>
  )
}

export default QuestionsList
