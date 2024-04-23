import styles from './styles.css'
import heart from '../../../assets/heart.svg'
import React from 'react'
import { useSelector } from '../../store'


const Teams: React.FC = () => {
  const leftTeam = useSelector(state => state.game.leftTeam)
  const rightTeam = useSelector(state => state.game.rightTeam)
  const display = useSelector(state => state.game.currentQuestion >= 0)
  return display ? <>
    <Team {...leftTeam} side='left' />
    <Team {...rightTeam} side='right' />
  </> : null
}

export default Teams

function Team(props: {health: number, score: number, side: 'left' | 'right'}) {
  return (
    <div className={styles.team + ' ' + styles[props.side]}>
      <div className={styles.score}>{props.score}</div>
      <div className={styles.health}>
        {Array.from(Array(3)).map((_, i) => {
          let className = styles.heartholder
          if (i < props.health) className += ' ' + styles.holds
          return (
            <div className={className}>
              <img src={heart} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
