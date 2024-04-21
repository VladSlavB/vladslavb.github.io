import styles from './styles.css'
import React, { useEffect, useRef, useState } from 'react'
import QuestionsList from '../components/admin/edit/QuestionsList'
import Button from '@mui/joy/Button/Button'
import { finishGame, startGame, useDispatch, useSelector } from '../store'
import ControlPanel from '../components/admin/play/ControlPanel'
import OpenInNew from '@mui/icons-material/OpenInNew'
import Stack from '@mui/joy/Stack'

const GameScreenOpener: React.FC = () => {
  const gameActive = useSelector(state => state.game.active)
  const editorActive = useSelector(state => state.editor.mode !== 'view')
  const [ screenOpen, setScreenOpen ] = useState(false)
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
  let className = styles.panel
  if (gameActive) className += ' ' + styles.contained

  return (
    <div className={className}>
      {gameActive && (
        <ControlPanel />
      )}
      <Stack direction='row' spacing={1}>
        {gameActive && (
          <Button color='danger' size='lg' onClick={() => {
            if (confirm('Точно завершить игру? Все набранные командами очки сбросятся')) {
              setScreenOpen(false)
              dispatch(finishGame())
            }
          }}>
            Завершить игру
          </Button>
        )}
        {!screenOpen && (
          <Button
            disabled={editorActive}
            onClick={() => {
              dispatch(startGame())
              setScreenOpen(true)
            }}
            size='lg' endDecorator={<OpenInNew />}
          >
            Открыть игровое окно
          </Button>
        )}
      </Stack>
    </div>
  )
}

const AdminScreen: React.FC = () => {
  const hasQuestions = useSelector(state => state.questions.length > 0)
  return (
    <div>
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
