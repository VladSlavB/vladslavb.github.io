import styles from './styles.css'
import React, { useRef } from 'react'
import { Option, _selectDynamicReversedOrder, useGameSelector, useSelector } from '../../store'
import Star from '@mui/icons-material/Star'


function transposeIndex(index: number, rows = 5) {
  return Math.floor(index / 2) + (index % 2) * rows
}

const Options: React.FC = () => {
  const dynamic = useGameSelector(game => game.dynamicOptions[game.currentQuestion] != null)
  const reversed = useSelector(_selectDynamicReversedOrder)
  const options = useSelector(state => {
    const qIndex = state.game.present.currentQuestion
    if (qIndex >= state.questions.length || qIndex < 0) return null
    const staticOptions = state.questions[qIndex].options
    if (staticOptions != null) return staticOptions
    let dynamicOptions = state.game.present.dynamicOptions[qIndex] ?? []
    dynamicOptions = [...dynamicOptions]
    for (let i = dynamicOptions.length; i < 12; i++) {
      dynamicOptions.push({value: '', score: 0})
    }
    return dynamicOptions
  })
  const optionsState = useGameSelector(game => game.options)
  if (options != null) {
    const rows = options.length / 2
    const sortedIndices = options.
      map((_, i) => transposeIndex(i, rows)).
      sort((a, b) => (options[b]?.score ?? 0) - (options[a]?.score ?? 0))
    return (
      <div className={styles.options}>
        {options.map((_, index) => {
          if (!dynamic) {
            index = transposeIndex(index, rows)
          } else {
            if (reversed) {
              if (index % 2 === 0) index++; else index--
            }
          }
          const numberLabel = sortedIndices.findIndex(v => v === index) + 1
          return (
            <Option
              {...(options[index] ?? {score: 0, value: ''})}
              opened={optionsState[index].opened}
              key={index}
              bonusOpened={optionsState[index].bonus?.opened ?? false}
              label={rows === 5 ? `${numberLabel}` : '?'}
            />
          )
        })}
      </div>
    )
  }
  return null
}

export default Options

function Option(props: Option & {label: string, opened: boolean, bonusOpened: boolean}) {
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
        <span>{props.label}{props.bonus != null && <Star className={styles.starClosed} />}</span>
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
