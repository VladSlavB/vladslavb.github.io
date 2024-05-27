import styles from './styles.css'
import heart from '../../../assets/heart.svg'
import React from 'react'
import { useGameSelector } from '../../store'
import { gameWindow } from '../admin/play/SticklyControls'


const Teams: React.FC = () => {
  const leftTeam = useGameSelector(game => game.leftTeam)
  const rightTeam = useGameSelector(game => game.rightTeam)
  const display = useGameSelector(game => game.currentQuestion >= 0)
  return display ? <>
    <Team {...leftTeam} team='leftTeam' />
    <Team {...rightTeam} team='rightTeam' />
  </> : null
}

export default Teams

function Team(props: {health: number, score: number, team: 'leftTeam' | 'rightTeam'}) {
  return (
    <div className={styles.team + ' ' + styles[props.team]} id={props.team}>
      <div className={styles.score}>{props.score}</div>
      <div className={styles.health}>
        {Array.from(Array(3)).map((_, i) => {
          let className = styles.heartholder
          if (i < props.health) className += ' ' + styles.holds
          return (
            <div className={styles.wrapper}>
              <div className={className}>
                <img src={heart} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function hitAnimation(team: 'leftTeam' | 'rightTeam') {
  const element = gameWindow?.document.getElementById(team)
  element?.classList.add(styles.hit)
  setTimeout(() => element?.classList.remove(styles.hit), 1000)
}
