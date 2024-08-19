import styles from './styles.css'
import React, { useRef } from 'react'
import { Option, QuestionName, useGameSelector, useSelector } from '../../store'
import Star from '@mui/icons-material/Star'


function transposeIndex(index: number, rows = 5) {
  return Math.floor(index / 2) + (index % 2) * rows
}

const Options: React.FC = () => {
  const options = useSelector(state => {
    const qIndex = state.game.present.currentQuestion
    if (qIndex >= state.questions.length || qIndex < 0) return null
    const question = state.questions[qIndex]
    if (question.name != QuestionName.dynamic) {
      return question.options
    }
    // let dynamicOptions = state.game.present.dynamicOptions[qIndex] ?? []
    // dynamicOptions = [...dynamicOptions]
    // for (let i = dynamicOptions.length; i < 12; i++) {
    //   dynamicOptions.push({value: '', score: 0})
    // }
    // return dynamicOptions
  })
  let className = styles.options
  // if (dynamic) className += ' ' + styles.dense
  const optionsState = useGameSelector(game => (
    game.q?.type === 'ordinary' || game.q?.type === 'dynamic' ? (
      game.q.options
    ) : null
  ))
  if (options != null && optionsState != null) {
    const rows = options.length / 2
    return (
      <div className={className}>
        {options.map((_, i) => {
          let index = i
          index = transposeIndex(index, rows)
          const numberLabel = index + 1
          const isMax = options[index]?.score == Math.max(...options.map(o => o?.score ?? 0))
          return (
            <Option
              {...(options[index] ?? {score: 0, value: ''})}
              opened={optionsState[index].opened}
              key={i}
              // bonusOpened={optionsState[index].bonus?.opened ?? false} // TODO bonus
              bonusOpened={false}
              label={rows === 5 ? `${numberLabel}` : '?'}
              highlight={isMax}
              attachments={[]}
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
