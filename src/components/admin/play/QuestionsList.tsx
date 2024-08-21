import React from 'react'
import { QuestionName, useSelector } from '../../../store'
import styles from './styles.css'
import Stack from '@mui/joy/Stack'
import OrdinaryQuestion from './OrdinaryQuestion'
import QuestionPreview from '../preview/QuestionPreview'
import DynamicQuestion from './DynamicQuestion'


const QuestionsList: React.FC = () => {
  const questions = useSelector(state => state.questions)
  const currentQuestionIndex = useSelector(state => state.game.present.currentQuestion)

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
    </Stack>
  )
}

export default QuestionsList
