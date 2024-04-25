import styles from './styles.css'
import React, { useEffect, useRef, useState } from 'react'
import QuestionsList from '../components/admin/edit/QuestionsList'
import Button from '@mui/joy/Button/Button'
import { closeAllOptions, finishGame, nextQuestion, startGame, useDispatch, useSelector } from '../store'
import OpenInNew from '@mui/icons-material/OpenInNew'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'

const GameScreenOpener: React.FC = () => {
  const gameActive = useSelector(state => state.game.active)
  const editorActive = useSelector(state => state.editor.mode !== 'view')
  const [ screenOpen, setScreenOpen ] = useState(false)
  const currentQuestion = useSelector(state => state.game.currentQuestion)
  const dispatch = useDispatch()
  const windowRef = useRef<Window | null>(null)
  useEffect(() => {
    if (screenOpen) {
      const newWindow = open('.', '_blank', 'popup,width=640,height=360')
      onClose(newWindow!, () => setScreenOpen(false))
      windowRef.current = newWindow
    } else {
      windowRef.current?.close()
    }
    return () => windowRef.current?.close()
  }, [screenOpen])

  return <>
    {screenOpen ? (
      currentQuestion < 0 && (
        <Button
          className={styles.leftButton} color='primary' size='lg'
          onClick={() => dispatch(nextQuestion())}
        >
          Открыть первый вопрос
        </Button>
      )
    ) : (
      <Button
        className={styles.leftButton} size='lg'
        disabled={editorActive}
        onClick={() => {
          dispatch(startGame())
          setScreenOpen(true)
        }}
        endDecorator={<OpenInNew />}
      >
        Открыть табло
      </Button>
    )}
    {gameActive && (
      <Button className={styles.rightButton} color='danger' size='lg' onClick={() => {
        if (confirm('Точно завершить игру? Все набранные командами очки сбросятся')) {
          setScreenOpen(false)
          dispatch(finishGame())
          dispatch(closeAllOptions())
        }
      }}>
        Завершить игру
      </Button>
    )}
  </>
}

const AdminScreen: React.FC = () => {
  const hasQuestions = useSelector(state => state.questions.length > 0)
  const editorActive = useSelector(state => state.editor.mode !== 'view')
  return (
    <div>
      {!hasQuestions && !editorActive && (
        <Typography className={styles.welcome}>
          Это пункт управления игрой. Прежде всего, нужно создать вопросы викторины
        </Typography>
      )}
      <QuestionsList />
      {hasQuestions && (
        <GameScreenOpener />
      )}
    </div>
  )
}

export default AdminScreen

function onClose(w: Window, callback: () => void) {
  const timer = setInterval(() => {
    if (w.closed) {
      clearInterval(timer)
      callback()
    }
  })
}
