import React from 'react'
import { Team, useGameSelector } from '../../store'
import styles from './styles.css'
import { TeamScoreAndName } from './Teams'

const Subtotal: React.FC = () => {
  const leftTeam = useGameSelector(game => game.leftTeam)
  const rightTeam = useGameSelector(game => game.rightTeam)
  return <>
    <TeamScoreAndName team='leftTeam' className={styles.subtotal} {...leftTeam} score={leftTeam.wins} />
    <TeamScoreAndName team='rightTeam' className={styles.subtotal} {...rightTeam} score={rightTeam.wins} />
  </>
}

export default Subtotal
