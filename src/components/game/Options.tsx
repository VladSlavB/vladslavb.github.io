import styles from './styles.css'
import React from 'react'
import { Option, useSelector } from '../../store'


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
  return (
    <div className={className}>
      <div className={styles.faceDown}>
        <span>{props.index + 1}{props.bonus != null && '*'}</span>
      </div>
      <div className={styles.option}>
        {props.opened && <>
          <span>{props.value}</span>
          <span>{props.score}</span>
        </>}
      </div>
    </div>
  )
}
