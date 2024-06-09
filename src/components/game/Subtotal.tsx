import React from 'react'
import { Team, useGameSelector } from '../../store'
import styles from './styles.css'


const Subtotal: React.FC = () => {
  const leftTeam = useGameSelector(game => game.leftTeam)
  const rightTeam = useGameSelector(game => game.rightTeam)
  return <>
    <TeamScore team='leftTeam' wins={leftTeam.wins} cumulativeScore={leftTeam.cumulativeScore} />
    <TeamScore team='rightTeam' wins={rightTeam.wins} cumulativeScore={rightTeam.cumulativeScore} />
  </>
}

export default Subtotal

function TeamScore(props: {team: Team, wins: number, cumulativeScore: number}) {
  return (
    <div className={styles.team + ' ' + styles.subtotal + ' ' + styles[props.team]}>
      <div className={styles.score}>{props.wins}</div>
      <div className={styles.health}>{props.cumulativeScore}</div>
    </div>
  )
}
