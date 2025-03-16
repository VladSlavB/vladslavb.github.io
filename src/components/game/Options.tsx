import styles from './styles.css'
import React, { useRef } from 'react'
import { ArangeOption, Option, optionIsOrdinary, QuestionName, useGameSelector, useSelector } from '../../store'
import Star from '@mui/icons-material/Star'
import { NUM_ARANGE_OPTIONS } from '../../defaults'


function transposeIndex(index: number, rows = 5) {
  return Math.floor(index / 2) + (index % 2) * rows
}

const shuffledIndices = Array.from({length: NUM_ARANGE_OPTIONS}, (_, i) => i + NUM_ARANGE_OPTIONS).map(i => ({i, value: Math.random()})).sort((a, b) => a.value - b.value).map(a => a.i)

const Options: React.FC = () => {
  const options = useSelector(state => {
    const game = state.game.present
    const index = game.currentQuestion
    if (index >= state.questions.length || index < 0) return null
    const question = state.questions[index]
    if (question.name !== QuestionName.dynamic) {
      if (question.name === QuestionName.arange) {
        if (game.q?.type === 'arange' && game.q.currentTeam != null) {
          if (game.q.revealTruth) {
            return question.options.map(scoredOption)
          }
          return [
            ...game.q[game.q.currentTeam].order.map(i => (
              i != null ? scoredOption(question.options[i]) : {value: '', score: -1, attachments: []}
            )),
            ...question.options.map(scoredOption)
          ]
        }
      } else {
        return question.options
      }
    } else {
      if (game.q?.type === 'dynamic') { // always true
        return game.q.options
      }
    }
  })
  const dynamic = useGameSelector(game => game.q?.type === 'dynamic')
  const arange = useGameSelector(game => game.q?.type === 'arange')
  let className = styles.options
  if (dynamic || arange) {
    className += ' ' + styles.dynamic
  }
  const optionsState = useGameSelector(game => {
    if (game.q?.type === 'ordinary') {
      return game.q.options
    } else if (game.q?.type === 'dynamic') {
      return options
    } else if (game.q?.type === 'arange' && game.q.currentTeam != null) {
      if (game.q.revealTruth) {
        return game.q.options
      }
      const order = game.q[game.q.currentTeam].order
      if (!game.q.optionsShown) return Array.from({length: NUM_ARANGE_OPTIONS * 2}, _ => ({opened: false}))
      return [
        ...order.map(i => (
          {opened: i != null}
        )),
        ...options?.map((_, i) => ({opened: !order.includes(i) })) || []
      ]
    }
  })
  if (options != null && optionsState != null) {
    const rows = Math.ceil(options.length / 2)
    const optionNodes = options.map((_, i) => {
      let index = dynamic ? i : arange ? (
        i < NUM_ARANGE_OPTIONS ? transposeIndex(i, NUM_ARANGE_OPTIONS / 2) : shuffledIndices[i - NUM_ARANGE_OPTIONS]
      ) : transposeIndex(i, rows)
      const option = options[index]
      const numberLabel = dynamic || arange ? '?' : `${index + 1}`

      const isMax = !dynamic && !arange && option.score == Math.max(...options.map(o => o.score))
      const optionState = optionsState[index] as {opened: boolean, bonus?: {opened: boolean}}
      return (
        <Option
          {...option}
          opened={optionState.opened}
          key={i}
          bonusOpened={optionState.bonus?.opened ?? false}
          label={numberLabel}
          highlight={isMax}
        />
      )
    })
    if (arange && optionNodes.length > NUM_ARANGE_OPTIONS) {
      optionNodes.splice(NUM_ARANGE_OPTIONS, 0, <div className={styles.sep} />)
    }
    return (
      <div className={className}>
        {optionNodes}
      </div>
    )
  }
  return null
}

function scoredOption(option: Option | ArangeOption) {
  if (optionIsOrdinary(option)) {
    return option
  } else {
    return {
      ...option,
      score: -1,
    }
  }
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
          <span className={scoreClassName}>{props.score === -1 ? '' : props.score}</span>
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
