import styles from './styles.css'
import React, { useState } from 'react'
import { Attachment, correctAnswer, correctBonus, removeQuestion, useDispatch, useSelector, useGameSelector, wrongBonus, Option, addOptionDynamically, _selectDynamicReversedOrder } from '../../../store'
import Card from '@mui/joy/Card'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import Stack from '@mui/joy/Stack'
import ImageOutlined from '@mui/icons-material/ImageOutlined'
import TextFields from '@mui/icons-material/TextFields'
import QuestionControls from '../play/QuestionControls'
import ButtonGroup from '@mui/joy/ButtonGroup'
import Close from '@mui/icons-material/Close'
import IconButton from '@mui/joy/IconButton'
import { hitAnimation } from '../../game/Teams'
import HeaderWithActions from './HeaderWithActions'
import { useAutoScroll } from '../scroll'
import { transformInputScore } from './OptionEdit'
import Input from '@mui/joy/Input'
import Chip from '@mui/joy/Chip'

type Props = {
  index: number
  onEdit: () => void
  canEdit?: boolean
}

const StaticQuestion: React.FC<Props> = ({index, onEdit, canEdit}) => {
  const question = useSelector(state => state.questions[index])
  const gameActive = useSelector(state => state.game.present.active)
  const currentQuestion = useSelector(state => state.game.present.currentQuestion)
  const currentTeam = useGameSelector(game => game.currentTeam)
  const everyoneDead = useGameSelector(game => game.leftTeam.health + game.rightTeam.health === 0)
  const bonusChance = useGameSelector(game => game.bonusChance)
  const questionActive = gameActive && currentQuestion === index
  const optionsState = useGameSelector(game => game.options)
  const drawFinished = useGameSelector(game => game.drawFinished)
  const dispatch = useDispatch()
  const ref = useAutoScroll(questionActive)
  const dynamicOptions = useGameSelector(game => game.dynamicOptions[game.currentQuestion]) as (Option | null)[] | null
  const reversed = useSelector(_selectDynamicReversedOrder)
  const shown = useGameSelector(game => game.questionShown)

  function onOptionClick(optionIndex: number) {
    if (question.options == null) return
    const option = question.options[optionIndex]
    dispatch(correctAnswer({
      index: optionIndex,
      score: option.score,
      best: question.options.every(other => other.score <= option.score),
      attachment: option.attachment,
      hasBonus: option.bonus != null,
    }))
  }

  function onBonusClick(optionIndex: number) {
    if (question.options == null) return
    const option = question.options[optionIndex]
    if (option.bonus != null) {
      dispatch(correctBonus({
        index: optionIndex,
        score: option.bonus.score,
        attachment: option.bonus.attachment,
      }))
    }
  }

  function onBonusWrong(optionIndex: number) {
    if (currentTeam == null) return
    dispatch(wrongBonus(optionIndex))
    hitAnimation(currentTeam)
  }

  return (
    <Card variant={questionActive ? 'soft' : 'outlined'} ref={ref}>
      <Stack spacing={2}>
        <HeaderWithActions
          header={question.value}
          dim={gameActive && !questionActive}
          onEdit={onEdit}
          onDelete={() => dispatch(removeQuestion(index))}
          showActions={canEdit}
        />
        {question.options == null ? (
          <Chip variant='outlined' color='primary'>Вспомнить всё</Chip>
        ) : (
          <Chip variant='outlined' color='primary'>{question.name ?? 'Народный раунд'}</Chip>
        )}
        <table className={styles.options}>
          <TwoColumns
            nRows={question.options != null ? 5 : 6}
            transpose={dynamicOptions != null}
            reverse={reversed}
          >
            {(question.options ?? dynamicOptions ?? []).map((option, i) => {
              if (option == null) {
                return <Button disabled variant='plain' key={i} size='lg'></Button>
              }
              const canClick = (currentTeam != null || everyoneDead) && questionActive && shown && !optionsState[i].opened && bonusChance == null
              let className = styles.optionText
              if (!gameActive) className += ' ' + styles.black
              if (questionActive && optionsState[i].opened) className += ' ' + styles.tiny
              const size = gameActive ? 'lg' : 'sm'
              const buttons = [(
                <Button fullWidth
                  key='option'
                  variant='plain'
                  color='neutral'
                  onClick={() => onOptionClick(i)}
                  size={size}
                  disabled={!canClick}
                  startDecorator={questionActive && attachmentIcon(option.attachment)}
                  endDecorator={<>
                    {option.score}
                  </>}
                >
                  <span className={className}>{option.value}</span>
                </Button>
              )]
              const disabled = !questionActive || optionsState[i].bonus?.opened || !optionsState[i].opened || bonusChance != null || (
                currentTeam != null && !optionsState[i].bonus?.vacantFor[currentTeam]
              ) || !drawFinished
              if (option.bonus != null) {
                buttons.push(
                  <Button
                    key='bonus'
                    title='Правильный ответ на звёздочку'
                    variant='soft'
                    disabled={disabled}
                    size={size}
                    onClick={() => onBonusClick(i)}
                    startDecorator={questionActive && attachmentIcon(option.bonus.attachment)}
                  >
                    +{option.bonus.score}
                  </Button>
                )
              }
              if (option.bonus != null && !disabled && currentTeam != null) {
                buttons.push(
                  <IconButton
                    key='bonus-wrong'
                    title='Неправильный ответ на звёздочку'
                    variant='soft' color='danger'
                    onClick={() => onBonusWrong(i)}
                  >
                    <Close />
                  </IconButton>
                )
              }
              const buttonGroupClassName = gameActive ? styles.gameOption : undefined
              return (
                <div key={i}>
                  <ButtonGroup size={size} className={buttonGroupClassName}>
                    {buttons}
                  </ButtonGroup>
                  {!gameActive && (
                    <div className={styles.optionExtra + ' ' + styles.pad}>
                      <div className={styles.attachmentsContainer}>
                        {option.attachment != null && <AttachmentComponent {...option.attachment} />}
                      </div>
                      <div className={styles.bonusContainer + ' ' + styles.bonusBack}>
                        {option.bonus?.attachment != null && <AttachmentComponent {...option.bonus.attachment} />}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {question.options == null && gameActive && currentQuestion === index && drawFinished && (
              <NewOption />
            )}
          </TwoColumns>
        </table>
        {gameActive && currentQuestion === index && (
          <QuestionControls />
        )}
      </Stack>
    </Card>
  )
}

export default StaticQuestion

type TwoColumnsProps = {
  children: React.ReactNode[]
  nRows: number
  transpose: boolean
  reverse: boolean
}
const TwoColumns: React.FC<TwoColumnsProps> = ({children, nRows, transpose, reverse}) => {
  children = children.filter(child => !!child)
  children = children.flat()
  const total = children.length
  const rows: React.ReactNode[][] = []
  if (transpose) {
    for (let i = 0; i < Math.min(nRows, Math.ceil(total / 2)); i++) {
      const row = [children[i * 2], children[i * 2 + 1]]
      if (reverse) {
        row.reverse()
      }
      rows.push(row)
    }
  } else {
    for (let i = 0; i < Math.min(nRows, total); i++) {
      const row = [children[i]]
      if (i + nRows < total) {
        row.push(children[i + nRows])
      } else {
        row.push(null)
      }
      rows.push(row)
    }
  }
  return (
    <tbody>
      {rows.map((row, i) => (
        <tr key={i}>{row.map((cell, j) => (
          <td key={j} width='50%'>{cell}</td>
        ))}</tr>
      ))}
    </tbody>
  )
}

export const AttachmentComponent: React.FC<Attachment> = attachment => (
  attachment.type === 'img' ? (
    <div className={styles.imgWrapper}>
      <img src={attachment.url} className={styles.image} height={80} />
    </div>
  ) : (
    <Typography className={styles.text}
      level='body-xs' variant='outlined' color='warning'
    >
      {attachment.text}
    </Typography>
  )
)

function attachmentIcon(attachment?: Attachment | null) {
  return attachment != null ? (
    attachment.type === 'img' ? (
      <ImageOutlined fontSize='small' />
    ) : (
      <TextFields fontSize='small' />
    )
  ) : undefined
}

const NewOption: React.FC = () => {
  const [ value, setValue ] = useState('')
  const [ score, setScore ] = useState('5')
  const dispatch = useDispatch()

  return (
    <Stack className={styles.dynamicForm} direction='row' component='form' gap={1} onSubmit={e => {
      e.preventDefault()
      if (value != '' && score != '') {
        dispatch(addOptionDynamically({value, score: parseInt(score)}))
      }
    }}>
      <Input
        style={{flex: 1}}
        autoFocus
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder='Ответ...'
      />
      {/* <Input
        value={score}
        placeholder='00'
        onChange={e => setScore(transformInputScore(e.target.value))}
        className={styles.scoreEdit}
      /> */}
      <button type='submit' style={{display: 'none'}} />
    </Stack>
  )
}
