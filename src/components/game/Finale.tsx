import React from 'react'
import { FinaleState, Team, useGameSelector, useSelector } from '../../store'
import styles from './styles.css'
import { finaleWrapper } from '../admin/play/Finale'
import textFit from 'textfit'


const Finale: React.FC<FinaleState> = ({teamsOrder, names, openedQuestions, options}) => {
  const staticFinale = useSelector(state => state.finale)
  const team1 = teamsOrder[0]
  const team2 = teamsOrder[1]
  const team1Score = useGameSelector(game => game[team1].score)
  const team2Score = useGameSelector(game => game[team2].score)
  function teamStyle(team: Team) {
    return team === 'leftTeam' ? styles.blue : styles.red
  }
  
  return <>
    <div className={styles.finaleName}>{'Вспомни всё\nФинал'}</div>
    <div className={styles.finaleQuestions}>
      {staticFinale?.questions.map((question, i) => (
        <Question text={question.value} opened={openedQuestions[i]} index={i} />
      ))}
    </div>
    <div className={styles.finaleScore + ' ' + teamStyle(team1)}>{team1Score}</div>
    <div className={styles.finaleScore + ' ' + styles.second + ' ' + teamStyle(team2)}>{team2Score}</div>
    <div className={styles.finaleTeam}>
      {names[0].map(name => (
        <div
          className={styles.name + ' ' + teamStyle(team1)}
          ref={ref => ref != null && textFit(ref, {maxFontSize: 29})}
        >{name}</div>
      ))}
      <div className={styles.cells}>
        {options[0].map(option => <AnswerWithScore {...option} />)}
      </div>
    </div>
    <div className={styles.finaleTeam + ' ' + styles.second}>
      {names[1].map(name => (
        <div className={styles.name + ' ' + teamStyle(team2)}>{name}</div>
      ))}
      <div className={styles.cells}>
        {options[1].map(option => <AnswerWithScore {...option} />)}
      </div>
    </div>
  </>
}

export default finaleWrapper(Finale)


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
  value: string
  score: number
  opened: boolean
  scoreOpened: boolean
}
const AnswerWithScore: React.FC<AnswerWithScoreProps> = ({value, score, opened, scoreOpened}) => {
  let className = styles.finaleCell
  if (opened || scoreOpened) {
    className += ' ' + styles.opened
  }
  let scoreClassName = styles.cellScore
  if (scoreOpened) {
    scoreClassName += ' ' + styles.opened
  }

  return (
    <div className={className}>
      <div className={styles.empty} />
      <div className={styles.content}>
        {opened && <div className={styles.cellValue}>{value}</div>}
        {score != null && (
          <div className={scoreClassName}>{score}</div>
        )}
      </div>
    </div>
  )
}
