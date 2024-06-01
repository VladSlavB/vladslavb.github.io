import styles from './styles.css'
import React, { useEffect, useRef } from 'react'
import { Attachment, correctAnswer, correctBonus, removeQuestion, useDispatch, useSelector, useGameSelector, wrongBonus } from '../../../store'
import Card from '@mui/joy/Card'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import Stack from '@mui/joy/Stack'
import ImageOutlined from '@mui/icons-material/ImageOutlined'
import TextFields from '@mui/icons-material/TextFields'
import Edit from '@mui/icons-material/Edit'
import Delete from '@mui/icons-material/Delete'
import QuestionControls from '../play/QuestionControls'
import { rightSound, wrongSound } from '../../../sounds'
import ButtonGroup from '@mui/joy/ButtonGroup'
import Close from '@mui/icons-material/Close'
import IconButton from '@mui/joy/IconButton'
import { hitAnimation } from '../../game/Teams'

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
  const dispatch = useDispatch()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (questionActive && ref.current != null) {
      const gap = 40
      var elementPosition = ref.current.getBoundingClientRect().top;
      var offsetPosition = elementPosition + window.scrollY - gap;
      window.scrollTo({top: offsetPosition, behavior: 'smooth'})
    }
  }, [questionActive])

  function onOptionClick(optionIndex: number) {
    const option = question.options[optionIndex]
    dispatch(correctAnswer({
      index: optionIndex,
      score: option.score,
      best: question.options.every(other => other.score <= option.score),
      attachment: option.attachment,
      bonus: option.bonus,
    }))
    rightSound.play()
  }

  function onBonusClick(optionIndex: number) {
    const option = question.options[optionIndex]
    if (option.bonus != null) {
      dispatch(correctBonus({
        index: optionIndex,
        team: currentTeam,
        score: option.bonus.score,
        attachment: option.bonus.attachment,
      }))
      rightSound.play()
    }
  }

  function onBonusWrong(optionIndex: number) {
    if (currentTeam == null) return
    dispatch(wrongBonus(optionIndex))
    hitAnimation(currentTeam)
    wrongSound.play()
  }

  return (
    <Card variant={questionActive ? 'soft' : 'outlined'} ref={ref}>
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
              const canClick = (currentTeam != null || everyoneDead) && questionActive && !optionsState[i].opened && bonusChance == null
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
              const disabled = !questionActive || optionsState[i].bonus.opened || !optionsState[i].opened || bonusChance != null || (
                currentTeam != null && !optionsState[i].bonus.vacantFor[currentTeam]
              )
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
              return (
                <div key={i}>
                  <ButtonGroup size={size}>
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
