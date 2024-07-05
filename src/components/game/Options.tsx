import styles from './styles.css'
import React, { useRef } from 'react'
import { Option, useGameSelector, useSelector } from '../../store'
import Star from '@mui/icons-material/Star'


function transposeIndex(index: number) {
  return Math.floor(index / 2) + (index % 2) * 5
}

const Options: React.FC = () => {
  const options = useSelector(state => {
    const qIndex = state.game.present.currentQuestion
    if (qIndex >= state.questions.length || qIndex < 0) return null
    const staticOptions = state.questions[qIndex].options
    if (staticOptions != null) return staticOptions
    let dynamicOptions = state.game.present.dynamicOptions[qIndex] ?? []
    dynamicOptions = [...dynamicOptions]
    for (let i = dynamicOptions.length; i < 10; i++) {
      dynamicOptions.push({value: '', score: 0})
    }
    return dynamicOptions
  })
  const optionsState = useGameSelector(game => game.options)
  return options != null ? (
    <div className={styles.options}>
      {options.map((_, i) => {
        const index = transposeIndex(i)
        return (
          <Option
            {...options[index]}
            opened={optionsState[index].opened}
            key={index}
            bonusOpened={optionsState[index].bonus?.opened ?? false}
            index={index}
          />
        )
      })}
    </div>
  ) : null
}

export default Options

function Option(props: Option & {index: number, opened: boolean, bonusOpened: boolean}) {
  let className = styles.optionContainer
  if (props.opened) className += ' ' + styles.opened

  let starClassName = styles.star
  const prevBonusOpened = useRef(true)
  if (props.bonusOpened) {
    starClassName += ' ' + (prevBonusOpened.current ? styles.invisible : styles.opened)
  }
  prevBonusOpened.current = props.bonusOpened
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
