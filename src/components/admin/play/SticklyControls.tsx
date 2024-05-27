import styles from './styles.css'
import React, { useEffect, useState } from 'react'
import Button from '@mui/joy/Button/Button'
import ButtonGroup from '@mui/joy/ButtonGroup/ButtonGroup'
import { finishGame, nextQuestion, startGame, useDispatch, useSelector, useGameSelector } from '../../../store'
import OpenInNew from '@mui/icons-material/OpenInNew'
import UndoIcon from '@mui/icons-material/Undo'
import RedoIcon from '@mui/icons-material/Redo';
import { ActionCreators } from 'redux-undo'

export let gameWindow: Window | null = null


const StickyControls: React.FC = () => {
  const gameActive = useGameSelector(game => game.active)
  const editorActive = useSelector(state => state.editor.mode !== 'view')
  const [ gameWindowOpen, setGameWindowOpen ] = useState(false)
  const currentQuestion = useGameSelector(game => game.currentQuestion)
  const dispatch = useDispatch()
  const hasPast = useSelector(state => state.game.past.length > 1)
  const hasFuture = useSelector(state => state.game.future.length > 0)

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

  return (
    <div className={styles.panel}>
      {gameWindowOpen ? (
        currentQuestion < 0 && (
          <Button
            color='primary' size='lg'
            onClick={() => dispatch(nextQuestion())}
          >
            Открыть первый вопрос
          </Button>
        )
      ) : (
        <Button
          size='lg'
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
      <div className={styles.spacer} />
      {gameActive && <>
        <ButtonGroup className={styles.historyActions} size='lg'>
            <Button
              startDecorator={<UndoIcon />}
              onClick={() => dispatch(ActionCreators.undo())}
              disabled={!hasPast}
            >
              Отменить
            </Button>
            <Button
              onClick={() => dispatch(ActionCreators.redo())}
              disabled={!hasFuture}
            >
              <RedoIcon />
            </Button>
          </ButtonGroup>
        <Button color='danger' size='lg' onClick={() => {
          if (confirm('Точно завершить игру? Все набранные командами очки сбросятся')) {
            closeGameWindow()
            dispatch(finishGame())
            dispatch(ActionCreators.clearHistory())
          }
        }}>
          Завершить игру
        </Button>
      </>}
    </div>
  )
}

export default StickyControls


function onClose(w: Window, callback: () => void) {
  const timer = setInterval(() => {
    if (w.closed) {
      clearInterval(timer)
      callback()
    }
  })
}
