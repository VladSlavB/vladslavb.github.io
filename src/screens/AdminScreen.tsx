import styles from './styles.css'
import React from 'react'
import QuestionsListPreview from '../components/admin/preview/QuestionsList'
import QuestionsListControl from '../components/admin/play/QuestionsList'
import { useGameSelector, useSelector } from '../store'
import Typography from '@mui/joy/Typography'
import StickyControls from '../components/admin/play/SticklyControls'
import Audio, { allAudioUrls } from '../Audio'
import ImportExport from '../components/common/ImportExport'


const AdminScreen: React.FC = () => {
  const hasQuestions = useSelector(state => state.questions.length > 0)
  const editorActive = useSelector(state => state.editor.mode !== 'view')
  const gameActive = useGameSelector(game => game.active)
  return (
    <div id='admin'>
      {!hasQuestions && !editorActive && (
        <Typography className={styles.welcome}>
          Это пункт управления игрой. Прежде всего, нужно создать вопросы викторины
        </Typography>
      )}
      {gameActive ? <QuestionsListControl /> : <QuestionsListPreview />}
      {hasQuestions && (
        <StickyControls />
      )}
      {allAudioUrls.map(url => <Audio src={url} key={url} controls style={{overflow: 'hidden', height: 0}} />)}
      <ImportExport />
    </div>
  )
}

export default AdminScreen
