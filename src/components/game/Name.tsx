import React from 'react'
import styles from './styles.css'
import { useSelector } from '../../store'


const Name: React.FC = () => {
  const question = useSelector(state => state.questions[state.game.present.currentQuestion])
  return question != null ? (
    <div className={styles.roundName}>
      {question.name}
    </div>
  ) : null
}

export default Name
