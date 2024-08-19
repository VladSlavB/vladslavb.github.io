import React from 'react'
import { Team, useGameSelector, useSelector } from '../../store'
import styles from './styles.css'


const NUM_CELLS = 15

const Finale: React.FC = () => {
  const gameFinale = useGameSelector(game => game.finale)
  const staticFinale = useSelector(state => state.finale)
  const team1 = gameFinale.teamsOrder[0]
  const team2 = gameFinale.teamsOrder[1]
  const team1Score = useGameSelector(game => game[team1].score)
  const team2Score = useGameSelector(game => game[team2].score)
  function teamStyle(team: Team) {
    return team === 'leftTeam' ? styles.blue : styles.red
  }
  
  return gameFinale.active ? <>
    <div className={styles.finaleName}>{'Вспомни всё\nФинал'}</div>
    <div className={styles.finaleQuestions}>
      {staticFinale?.questions.map((question, i) => (
        <Question text={question.value} opened={gameFinale.openedQuestions[i]} index={i} />
      ))}
    </div>
    <div className={styles.finaleScore + ' ' + teamStyle(team1)}>{team1Score}</div>
    <div className={styles.finaleScore + ' ' + styles.second + ' ' + teamStyle(team2)}>{team2Score}</div>
    <div className={styles.finaleTeam}>
      {gameFinale.names[0].map(name => (
        <div className={styles.name + ' ' + teamStyle(team1)}>{name}</div>
      ))}
      <div className={styles.cells}>
        {Array(NUM_CELLS).fill(0).map((_, i) => <AnswerWithScore index={i} />)}
      </div>
    </div>
    <div className={styles.finaleTeam + ' ' + styles.second}>
      {gameFinale.names[1].map(name => (
        <div className={styles.name + ' ' + teamStyle(team2)}>{name}</div>
      ))}
      <div className={styles.cells}>
        {Array(NUM_CELLS).fill(0).map((_, i) => <AnswerWithScore index={NUM_CELLS + i} />)}
      </div>
    </div>
  </> : null
}

export default Finale


type QuestionProps = {
  opened: boolean
  text: string
  index: number
}
const Question: React.FC<QuestionProps> = ({opened, text, index}) => {
  let className = styles.finaleQuestion
  if (opened) className += ' ' + styles.opened
  return (
    <div className={className}>
      <div className={styles.closed}><span>{index + 1}</span></div>
      <div>{text}</div>
    </div>
  )
}

type AnswerWithScoreProps = {
  index: number
}
const AnswerWithScore: React.FC<AnswerWithScoreProps> = ({index}) => {
  const answer = useGameSelector(game => game.finale.answers.at(index))
  const score = useGameSelector(game => game.finale.scores.at(index))

  const displayAnswer = answer?.opened && !answer?.hidden
  const displayScore = score?.opened && !score?.hidden
  let className = styles.finaleCell
  if (displayAnswer || displayScore) {
    className += ' ' + styles.opened
  }
  let scoreClassName = styles.cellScore
  if (displayScore) {
    scoreClassName += ' ' + styles.opened
  }

  return (
    <div className={className}>
      <div className={styles.empty} />
      <div className={styles.content}>
        {displayAnswer && <div className={styles.cellValue}>{answer.value}</div>}
        {score != null && (
          <div className={scoreClassName}>{score.value}</div>
        )}
      </div>
    </div>
  )
}
