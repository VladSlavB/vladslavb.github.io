import styles from './styles.css'
import React, { useEffect, useRef } from 'react'
import { Team, useGameSelector } from '../../store'
import textFit from 'textfit'


const Teams: React.FC = () => {
  const leftTeam = useGameSelector(game => game.leftTeam)
  const rightTeam = useGameSelector(game => game.rightTeam)
  const display = useGameSelector(game => game.currentQuestion >= 0 && game.q?.type !== 'finale')
  return display ? <>
    <TeamScoreAndName {...leftTeam} team='leftTeam' />
    <TeamScoreAndName {...rightTeam} team='rightTeam' />
  </> : null
}

export default Teams

export function TeamScoreAndName(props: {score: number, team: Team, name: string, className?: string}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current != null) {
      textFit(ref.current, {maxFontSize: 48})
    }
  }, [props.name])
  let className = styles.team + ' ' + styles[props.team]
  if (props.className != null) {
    className += ' ' + props.className
  }
  return (
    <div className={className} id={props.team}>
      <div className={styles.score}>{props.score}</div>
      <div className={styles.teamName} ref={ref}>
        {props.name}
      </div>
    </div>
  )
}
