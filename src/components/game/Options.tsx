import styles from './styles.css'
import React from 'react'
import { Option, useSelector } from '../../store'
import Star from '@mui/icons-material/Star'


function transposeIndex(index: number) {
  return Math.floor(index / 2) + (index % 2) * 5
}

const Options: React.FC = () => {
  const options = useSelector(state => (
    state.game.currentQuestion >= 0 ? (
      state.questions[state.game.currentQuestion].options
    ) : null
  ))
  return options != null ? (
    <div className={styles.options}>
      {options.map((_, i) => (
        <Option {...options[transposeIndex(i)]} key={i} index={transposeIndex(i)} />
      ))}
    </div>
  ) : null
}

export default Options

function Option(props: Option & {index: number}) {
  let className = styles.optionContainer
  if (props.opened) className += ' ' + styles.opened

  let starClassName = styles.star
  if (props.bonus?.opened) {
    starClassName += ' ' + styles.opened
  }
  return (
    <div className={className}>
      <div className={styles.faceDown}>
        <span>{props.index + 1}{props.bonus != null && <Star className={styles.starClosed} />}</span>
      </div>
      <div className={styles.option}>
        {props.opened && <>
          <span className={styles.value}>{props.value}</span>
          {props.bonus != null && (
              <span className={starClassName}><Star className={starClassName} /></span>
            )}
          <span className={styles.optionScore}>{props.score}</span>
        </>}
      </div>
    </div>
  )
}
