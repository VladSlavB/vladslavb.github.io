import styles from './styles.css'
import heart from '../../../assets/heart.svg'
import React from 'react'
import { useSelector } from '../../store'
import { gameWindow } from '../../screens/AdminScreen'


const Teams: React.FC = () => {
  const leftTeam = useSelector(state => state.game.leftTeam)
  const rightTeam = useSelector(state => state.game.rightTeam)
  const display = useSelector(state => state.game.currentQuestion >= 0)
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
