import styles from './styles.css'
import React, { useEffect, useState } from 'react'
import Button from '@mui/joy/Button/Button'
import ButtonGroup from '@mui/joy/ButtonGroup/ButtonGroup'
import { finishGame, nextQuestion, startGame, useDispatch, useSelector, useGameSelector, deltaScore, plusHealth, Team, selectNextQuestionBonuses } from '../../../store'
import OpenInNew from '@mui/icons-material/OpenInNew'
import UndoIcon from '@mui/icons-material/Undo'
import RedoIcon from '@mui/icons-material/Redo';
import { ActionCreators } from 'redux-undo'
import Favorite from '@mui/icons-material/Favorite'
import { playCorrect, playWrong } from '../../../Audio'
import MusicControl from './MusicControl'
import InstantAttachment from './InstantAttachment'

export let gameWindow: Window | null = null


const StickyControls: React.FC = () => {
  const gameActive = useGameSelector(game => game.active)
  const editorActive = useSelector(state => state.editor.mode !== 'view')
  const [ gameWindowOpen, setGameWindowOpen ] = useState(false)
  const currentQuestion = useGameSelector(game => game.currentQuestion)
  const dispatch = useDispatch()
  const hasPast = useSelector(state => state.game.past.length > 1)
  const hasFuture = useSelector(state => state.game.future.length > 0)
  const leftAlive = useGameSelector(game => game.leftTeam.health > 0)
  const rightAlive = useGameSelector(game => game.rightTeam.health > 0)
  const nextQuestionBonuses = useSelector(selectNextQuestionBonuses)

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

  function addScore(team: Team) {
    dispatch(deltaScore({team, value: 1}))
    playCorrect()
  }

  function subtractScore(team: Team) {
    dispatch(deltaScore({team, value: -1}))
    playWrong()
  }

  function addHealth(team: Team) {
    dispatch(plusHealth(team))
    playCorrect()
  }

  return (
    <div className={styles.panel}>
      {gameWindowOpen ? (
        currentQuestion < 0 ? (
          <Button color='primary' onClick={() => dispatch(nextQuestion(nextQuestionBonuses))}>
            Открыть первый вопрос
          </Button>
        ) : <>
          <ButtonGroup className={styles.outlined}>
            <Button title='Отнять балл у синей команды'
              color='primary' onClick={() => subtractScore('leftTeam')}
            >
              &minus;1
            </Button>
            <Button title='Добавить балл синей команде'
              color='primary' onClick={() => addScore('leftTeam')}
            >
              +1
            </Button>
            <Button title='Добавить жизнь синей команде'
              color='primary' onClick={() => addHealth('leftTeam')} disabled={!leftAlive}
            >
              <Favorite />
            </Button>
            <Button title='Добавить жизнь красной команде'
              color='danger' onClick={() => addHealth('rightTeam')} disabled={!rightAlive}
            >
              <Favorite />
            </Button>
            <Button title='Добавить балл красной команде'
              color='danger' onClick={() => addScore('rightTeam')}
            >
              +1
            </Button>
            <Button title='Отнять балл у красной команды'
              color='danger' onClick={() => subtractScore('rightTeam')}
            >
              &minus;1
            </Button>
          </ButtonGroup>
          <MusicControl />
          <InstantAttachment />
        </>
      ) : (
        <Button
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
        <ButtonGroup className={styles.outlined}>
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
        <Button color='danger' onClick={() => {
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
