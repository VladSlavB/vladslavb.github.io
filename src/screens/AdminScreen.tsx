import styles from './styles.css'
import React from 'react'
import QuestionsListPreview from '../components/admin/preview/QuestionsList'
import QuestionsListControl from '../components/admin/play/QuestionsList'
import { hideAll, useDispatch, useGameSelector, useSelector } from '../store'
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
          Это пункт управления игрой.<br />Начните с составления вопросов
        </Typography>
      )}
      {gameActive ? <QuestionsListControl /> : <QuestionsListPreview />}
      {hasQuestions && (
        <StickyControls />
      )}
      {allAudioUrls.map(url => <Audio src={url} key={url} controls style={{overflow: 'hidden', height: 0}} />)}
      <ImportExport />
      <Overlay />
    </div>
  )
}

export default AdminScreen


const Overlay = () => {
  const showOverlay = useSelector(state => (
    state.visibility.attachment != null ||
    state.visibility.subtotalVisible ||
    !state.visibility.gameScreenVisible
  ))
  const dispatch = useDispatch()

  return showOverlay ? <div className={styles.overlay} onClick={() => dispatch(hideAll())} /> : null
}
