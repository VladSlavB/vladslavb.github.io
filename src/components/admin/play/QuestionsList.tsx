import React from 'react'
import { QuestionName, useGameSelector, useSelector } from '../../../store'
import styles from './styles.css'
import Stack from '@mui/joy/Stack'
import OrdinaryQuestion from './OrdinaryQuestion'
import QuestionPreview from '../preview/QuestionPreview'
import DynamicQuestion from './DynamicQuestion'
import Finale from './Finale'
import FinalePreview from '../preview/FinalePreview'


const QuestionsList: React.FC = () => {
  const questions = useSelector(state => state.questions)
  const currentQuestionIndex = useGameSelector(game => game.currentQuestion)
  const hasFinale = useSelector(state => state.finale != null)
  const finaleActive = useGameSelector(game => game.finale)

  return (
    <Stack spacing={2} className={styles.list}>
      {questions.map((question, index) => (
        index === currentQuestionIndex ? (
          question.name !== QuestionName.dynamic ? (
            <OrdinaryQuestion question={question} key={index} />
          ) : (
            <DynamicQuestion question={question} key={index} />
          )
        ) : (
          <QuestionPreview index={index} key={index} />
        )
      ))}
      {hasFinale && (
        finaleActive ? <Finale /> : <FinalePreview />
      )}
    </Stack>
  )
}

export default QuestionsList
