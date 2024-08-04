import styles from './styles.css'
import React from 'react'
import QuestionsList from '../components/admin/edit/QuestionsList'
import { useSelector } from '../store'
import Typography from '@mui/joy/Typography'
import StickyControls from '../components/admin/play/SticklyControls'
import Audio, { allAudioUrls } from '../Audio'


const AdminScreen: React.FC = () => {
  const hasQuestions = useSelector(state => state.questions.length > 0)
  const editorActive = useSelector(state => state.editor.mode !== 'view')
  return (
    <div id='admin'>
      {!hasQuestions && !editorActive && (
        <Typography className={styles.welcome}>
          Это пункт управления игрой. Прежде всего, нужно создать вопросы викторины
        </Typography>
      )}
      <QuestionsList />
      {hasQuestions && (
        <StickyControls />
      )}
      {allAudioUrls.map(url => <Audio src={url} key={url} controls style={{overflow: 'hidden', height: 0}} />)}
    </div>
  )
}

export default AdminScreen
