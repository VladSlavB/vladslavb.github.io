import styles from './styles.css'
import React from 'react'
import { Option, useSelector } from '../../store'


const Options: React.FC = () => {
  const options = useSelector(state => (
    state.game.currentQuestion >= 0 ? (
      state.questions[state.game.currentQuestion].options
    ) : null
  ))
  return options != null ? (
    <div className={styles.options}>
      {options.map((option, i) => (
        <Option {...option} key={i} />
      ))}
    </div>
  ) : null
}

export default Options

function Option(props: Option) {
  return (
    <div className={styles.option}>
      <span>{props.value}</span>
      <span>{props.score}</span>
    </div>
  )
}
