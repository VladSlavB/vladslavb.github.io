import React from 'react'
import QuestionsList from '../components/admin/edit/QuestionsList'
import Button from '@mui/joy/Button/Button'

import styles from './styles.css'
import { nextQuestion, toggleCurrentTeam, useDispatch, useSelector } from '../store'


const PublicScreenOpener: React.FC = () => (
  <Button
    onClick={() => open('.', '_blank')}//'popup')}
    size='lg'
    className={styles.start}
  >
    Открыть игровое окно
  </Button>
)

const AdminScreen: React.FC = () => {
  const hasQuestions = useSelector(state => state.questions.length > 0)
  const dispatch = useDispatch()
  return (
    <div>
      <QuestionsList />
      <Button onClick={() => dispatch(toggleCurrentTeam())}>test</Button>
      {hasQuestions && (
        <PublicScreenOpener />
      )}
    </div>
  )
}

export default AdminScreen
