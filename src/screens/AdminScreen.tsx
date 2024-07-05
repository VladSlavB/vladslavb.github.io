import styles from './styles.css'
import React from 'react'
import QuestionsList from '../components/admin/edit/QuestionsList'
import Button from '@mui/joy/Button/Button'
import { useSelector } from '../store'
import Typography from '@mui/joy/Typography'
import AudiotrackIcon from '@mui/icons-material/PlayArrow'
import StickyControls from '../components/admin/play/SticklyControls'
import { playIntro } from '../Audio'


const AdminScreen: React.FC = () => {
  const hasQuestions = useSelector(state => state.questions.length > 0)
  const editorActive = useSelector(state => state.editor.mode !== 'view')
  const gameActive = useSelector(state => state.game.present.active)
  return (
    <div id='admin'>
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
            onClick={playIntro}
          >
            Заставка
          </Button>
        </div>
      )}
      <QuestionsList />
      {hasQuestions && (
        <StickyControls />
      )}
    </div>
  )
}

export default AdminScreen
