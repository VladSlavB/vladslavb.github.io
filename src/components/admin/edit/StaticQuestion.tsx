import styles from './styles.css'
import React from 'react'
import { Attachment, correctAnswer, correctBonus, openBonus, openOption, removeQuestion, setActiveAttachment, setBonusChance, useDispatch, useSelector } from '../../../store'
import Card from '@mui/joy/Card'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import Stack from '@mui/joy/Stack'
import ImageOutlined from '@mui/icons-material/ImageOutlined'
import TextFields from '@mui/icons-material/TextFields'
import Edit from '@mui/icons-material/Edit'
import Delete from '@mui/icons-material/Delete'
import ControlPanel from '../play/ControlPanel'
import { rightSound } from '../../../sounds'
import ButtonGroup from '@mui/joy/ButtonGroup'

type Props = {
  index: number
  onEdit: () => void
  canEdit?: boolean
}

const StaticQuestion: React.FC<Props> = ({index, onEdit, canEdit}) => {
  const question = useSelector(state => state.questions[index])
  const gameActive = useSelector(state => state.game.active)
  const currentQuestion = useSelector(state => state.game.currentQuestion)
  const currentTeam = useSelector(state => state.game.currentTeam)
  const everyoneDead = useSelector(state => state.game.leftTeam.health + state.game.rightTeam.health === 0)
  const bonusChance = useSelector(state => state.game.bonusChance)
  const questionActive = gameActive && currentQuestion === index
  const dispatch = useDispatch()

  async function onOptionClick(optionIndex: number) {
    const option = question.options[optionIndex]
    dispatch(openOption({questionIndex: index, optionIndex}))
    dispatch(correctAnswer({
      score: option.score,
      best: question.options.every(other => other.score <= option.score),
      worst: question.options.every(other => other.score > option.score || other == option)
    }))
    dispatch(setActiveAttachment(option.attachment))
    if (currentTeam != null) {
      rightSound.play()
      if (option.bonus != null) {
        dispatch(setBonusChance({
          team: currentTeam,
          optionIndex,
          score: option.bonus.score,
          attachment: option.bonus?.attachment
        }))
      }
    }
  }

  function onBonusClick(optionIndex: number) {
    const option = question.options[optionIndex]
    if (option.bonus != null) {
      dispatch(openBonus({questionIndex: index, optionIndex}))
      if (currentTeam != null) {
        dispatch(correctBonus({team: currentTeam, score: option.bonus.score}))
        rightSound.play()
      }
      dispatch(setActiveAttachment(option.bonus.attachment))
    }
  }

  return (
    <Card variant={questionActive ? 'soft' : 'outlined'}>
      <Stack spacing={2}>
        <div className={styles.header}>
          <Typography
            level='title-lg'
            flexGrow={1}
            whiteSpace='pre-wrap'
            color={gameActive && !questionActive ? 'neutral' : undefined}
          >{question.value}</Typography>
          {canEdit && (
            <div className={styles.actions}>
              <Button onClick={onEdit} variant='plain' size='sm'><Edit /></Button>
              <Button
                onClick={() => {
                  if (confirm(`Удалить вопрос "${question.value}"?`)) {
                    dispatch(removeQuestion(index))
                  }
                }}
                variant='plain' color='danger' size='sm'
              >
                <Delete />
              </Button>
            </div>
          )}
        </div>
        <table className={styles.options}>
          <TwoColumns>
            {question.options.map((option, i) => {
              const canClick = (currentTeam != null || everyoneDead) && questionActive && !option.opened && bonusChance == null
              let className = styles.optionText
              if (!gameActive) className += ' ' + styles.black
              if (questionActive && option.opened) className += ' ' + styles.tiny
              const optionButton = (
                <Button
                  fullWidth
                  key={i} onClick={() => onOptionClick(i)} size='sm'
                  variant='plain'
                  color='neutral'
                  disabled={!canClick}
                  startDecorator={ 
                    questionActive && option.attachment != null ? (
                      option.attachment.type === 'img' ? (
                        <ImageOutlined />
                      ) : (
                        <TextFields />
                      )
                    ) : undefined
                  }
                  endDecorator={<>
                    {option.score}
                  </>}
                >
                  <span className={className}>{option.value}</span>
                </Button>
              )
              const bonusButton = option.bonus != null && (
                <Button
                  variant='soft'
                  size='sm'
                  disabled={!questionActive || option.bonus.opened || !option.opened || bonusChance != null}
                  onClick={() => onBonusClick(i)}
                  startDecorator={ 
                    questionActive && option.bonus.attachment != null ? (
                      option.bonus.attachment.type === 'img' ? (
                        <ImageOutlined />
                      ) : (
                        <TextFields />
                      )
                    ) : undefined
                  }
                >
                  +{option.bonus.score}
                </Button>
              )
              return (
                <div key={i}>
                  {bonusButton ? (
                    <ButtonGroup>
                      {optionButton}
                      {bonusButton}
                    </ButtonGroup>
                  ) : optionButton}
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
          </TwoColumns>
        </table>
        {gameActive && currentQuestion === index && (
          <ControlPanel />
        )}
      </Stack>
    </Card>
  )
}

export default StaticQuestion

function TwoColumns({children}: {children: JSX.Element[]}) {
  const total = children.length
  const half = Math.ceil(total / 2)
  const rows: JSX.Element[][] = []
  for (let i = 0; i < half; i ++) {
    const row = [children[i]]
    if (i + half < total) {
      row.push(children[i + half])
    }
    rows.push(row)
  }
  return (
    <tbody>
      {rows.map((row, i) => (
        <tr key={i}>{row.map((cell, j) => (
          <td key={j}>{cell}</td>
        ))}</tr>
      ))}
    </tbody>
  )
}

export const AttachmentComponent: React.FC<Attachment> = attachment => (
  attachment.type === 'img' ? (
    <div className={styles.imgWrapper}>
      <img src={attachment.url} className={styles.image} />
    </div>
  ) : (
    <Typography className={styles.text}
      level='body-xs' variant='outlined' color='warning'
    >
      {attachment.text}
    </Typography>
  )
)
