import React from 'react'
import styles from './styles.css'
import { useGameSelector, useSelector } from '../../store'


const Name: React.FC = () => {
  const question = useSelector(state => state.questions[state.game.present.currentQuestion])
  const dynamic = useGameSelector(game => game.dynamicOptions[game.currentQuestion] != null)
  return question != null ? (
    <div className={styles.roundName}>
      {dynamic ? 'Один за всех' : question.name ?? 'Народный раунд'}
    </div>
  ) : null
}

export default Name
