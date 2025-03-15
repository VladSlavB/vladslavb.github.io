import styles from './styles.css'
import React, { useRef } from 'react'
import { Option, QuestionName, useGameSelector, useSelector } from '../../store'
import Star from '@mui/icons-material/Star'
import { NUM_DYNAMIC_OPTIONS } from '../../defaults'


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
        return game.q.options
      }
    }
  })
  const dynamic = useGameSelector(game => game.q?.type === 'dynamic')
  let className = styles.options
  if (dynamic) {
    className += ' ' + styles.dynamic
  }
  const optionsState = useGameSelector(game => (
    game.q?.type === 'ordinary' ? game.q.options : (
      game.q?.type === 'dynamic' ? options : null
    )
  ))
  if (options != null && optionsState != null) {
    const rows = Math.ceil(options.length / 2)
    const optionNodes = options.map((_, i) => {
      let index = dynamic ? i : transposeIndex(i, rows)
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
    })
    if (dynamic) {
      optionNodes.splice(NUM_DYNAMIC_OPTIONS, 0, <div className={styles.sep} />)
    }
    return (
      <div className={className}>
        {optionNodes}
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

  let valueClassName = styles.value, scoreClassName = styles.optionScore
  if (props.score === 0) {
    valueClassName += ' ' + styles.wrong
    scoreClassName += ' ' + styles.wrong
  }

  return (
    <div className={className}>
      <div className={styles.faceDown}>
        <span>{props.label}{props.bonus != null && <Star className={styles.starClosed} />}</span>
      </div>
      <div className={styles.option}>
        {props.opened && <>
          <span className={valueClassName} ref={ref => ref != null && fitOptionText(ref)}><span>{props.value}</span></span>
          {props.bonus != null && (
              <span className={starClassName}><Star className={starClassName} /></span>
            )}
          <span className={scoreClassName}>{props.score}</span>
        </>}
      </div>
    </div>
  )
}

function fitOptionText(node?: HTMLSpanElement) {
  function boxFits(inner: DOMRect, outer: DOMRect) {
    console.log(inner.width, inner.height, outer.width, outer.height)
    return inner.width <= outer.width && inner.height <= outer.height
  }
  if (node == null) return
  const parent = node.parentElement
  if (parent == null) return
  let ems = 1.0
  while (!boxFits(node.getBoundingClientRect(), parent.getBoundingClientRect())) {
    node.style.fontSize = `${ems *= 0.9}em`
    if (ems < 0.2) {
      break
    }
  }
}
