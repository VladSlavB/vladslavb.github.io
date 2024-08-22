import styles from './styles.css'
import React, { useRef } from 'react'
import { Option, QuestionName, useGameSelector, useSelector } from '../../store'
import Star from '@mui/icons-material/Star'


function transposeIndex(index: number, rows = 5) {
  return Math.floor(index / 2) + (index % 2) * rows
}

const Options: React.FC = () => {
  const options = useSelector(state => {
    const index = state.game.present.currentQuestion
    if (index >= state.questions.length || index < 0) return null
    const question = state.questions[index]
    if (question.name !== QuestionName.dynamic) {
      return question.options
    } else {
      const game = state.game.present
      if (game.q?.type === 'dynamic') { // always true
        return [...game.q.options, ...game.q.options2]
      }
    }
  })
  const dynamic = useGameSelector(game => game.q?.type === 'dynamic')
  let className = styles.options
  if (dynamic) className += ' ' + styles.dense
  const optionsState = useGameSelector(game => (
    game.q?.type === 'ordinary' ? game.q.options : (
      game.q?.type === 'dynamic' ? options : null
    )
  ))
  if (options != null && optionsState != null) {
    const rows = options.length / 2
    return (
      <div className={className}>
        {options.map((_, i) => {
          let index = i
          if (!dynamic) {
            index = transposeIndex(index, rows)
          }
          const numberLabel = dynamic ? '?' : `${index + 1}`
          const isMax = !dynamic && options[index]?.score == Math.max(...options.map(o => o?.score ?? 0))
          const optionState = optionsState[index] as {opened: boolean, bonus?: {opened: boolean}}
          return (
            <Option
              {...(options[index] ?? {score: 0, value: ''})}
              opened={optionState.opened}
              key={i}
              bonusOpened={optionState.bonus?.opened ?? false}
              label={numberLabel}
              highlight={isMax}
            />
          )
        })}
      </div>
    )
  }
  return null
}

export default Options

function Option(props: Option & {label: string, opened: boolean, bonusOpened: boolean, highlight: boolean}) {
  let className = styles.optionContainer
  if (props.opened) className += ' ' + styles.opened
  if (props.highlight) className += ' ' + styles.highlighted

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
