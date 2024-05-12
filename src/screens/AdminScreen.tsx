import styles from './styles.css'
import React, { useEffect, useState } from 'react'
import QuestionsList from '../components/admin/edit/QuestionsList'
import Button from '@mui/joy/Button/Button'
import { closeAllOptions, finishGame, nextQuestion, startGame, useDispatch, useSelector } from '../store'
import OpenInNew from '@mui/icons-material/OpenInNew'
import Typography from '@mui/joy/Typography'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import { introSound } from '../sounds'

export let gameWindow: Window | null = null

const GameScreenOpener: React.FC = () => {
  const gameActive = useSelector(state => state.game.active)
  const editorActive = useSelector(state => state.editor.mode !== 'view')
  const [ gameWindowOpen, setGameWindowOpen ] = useState(false)
  const currentQuestion = useSelector(state => state.game.currentQuestion)
  const dispatch = useDispatch()

  function openGameWindow() {
    gameWindow = open('.', '_blank', 'popup,width=640,height=360')
    if (gameWindow != null) {
      setGameWindowOpen(true)
      onClose(gameWindow, () => setGameWindowOpen(false))
    } else {
      alert('Не удалось открыть игровое коно')
    }
  }
  function closeGameWindow() {
    gameWindow?.close()
    setGameWindowOpen(false)
  }
  // on unmount
  useEffect(() => () => gameWindow?.close(), [])

  return <>
    {gameWindowOpen ? (
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
          openGameWindow()
        }}
        endDecorator={<OpenInNew />}
      >
        Открыть табло
      </Button>
    )}
    {gameActive && (
      <Button className={styles.rightButton} color='danger' size='lg' onClick={() => {
        if (confirm('Точно завершить игру? Все набранные командами очки сбросятся')) {
          closeGameWindow()
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
  const gameActive = useSelector(state => state.game.active)
  return (
    <div>
      {!hasQuestions && !editorActive && (
        <Typography className={styles.welcome}>
          Это пункт управления игрой. Прежде всего, нужно создать вопросы викторины
        </Typography>
      )}
      {gameActive && (
        <div className={styles.musicButtonWrapper}>
          <Button
            startDecorator={<AudiotrackIcon />}
            variant='soft'
            size='lg'
            onClick={() => introSound.play()}
          >
            Заставка
          </Button>
        </div>
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
