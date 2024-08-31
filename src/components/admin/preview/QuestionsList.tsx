import styles from './styles.css'
import React from 'react'
import { finishEditing, startAdding, startAddingFinale, startEditingFinale, useDispatch, useSelector } from '../../../store'
import Button from '@mui/joy/Button'
import QuestionEdit from '../edit/QuestionEdit'
import Stack from '@mui/joy/Stack'
import Add from '@mui/icons-material/Add'
import FinaleEdit from '../edit/FinaleEdit'
import FinalePreview from './FinalePreview'
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
            key={index}
          />
        ) : (
          <QuestionPreview 
            index={index}
            key={index}
            canEdit={editor.mode === 'view'}
          />
        )
      ))}
      {editor.mode === 'add' && (
        <QuestionEdit />
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
        <FinalePreview canEdit={editor.mode === 'view'} />
      )}
      {editor.mode === 'addFinale' && (
        <FinaleEdit />
      )}
      {editor.mode === 'editFinale' && (
        <FinaleEdit edit />
      )}
    </Stack>
  )
}

export default QuestionsList
