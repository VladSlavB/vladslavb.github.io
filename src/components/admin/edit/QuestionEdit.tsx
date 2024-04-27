import styles from './styles.css'
import React, { FormEvent, useCallback, useState } from 'react'
import { useImmer } from 'use-immer'
import { Attachment, Question, addQuestion, editQuestion, useDispatch, useSelector } from '../../../store'
import Button from '@mui/joy/Button'
import Grid from '@mui/joy/Grid'
import Stack from '@mui/joy/Stack'
import Input from '@mui/joy/Input'
import Card from '@mui/joy/Card'
import IconButton from '@mui/joy/IconButton'
import AttachFile from '@mui/icons-material/AttachFile'
import Textarea from '@mui/joy/Textarea'
import Tooltip from '@mui/joy/Tooltip'
import List from '@mui/joy/List'
import ListItem from '@mui/joy/ListItem'
import ListItemButton from '@mui/joy/ListItemButton'


type InputOption = {
  value: string
  score: string
  attachment?: Attachment
  bonusAttachment?: Attachment
  checkValue: boolean
  checkScore: boolean
}

type InputQuestion = {
  value: string
  options: InputOption[]
  check: boolean
}

function makeInputQuestion(question: Question): InputQuestion {
  return {
    ...question,
    check: false,
    options: question.options.map(option => ({
      ...option,
      score: `${option.score}${option.bonus != null ? `+${option.bonus.score}` : ''}`,
      checkValue: false,
      checkScore: false,
    }))
  }
}

function transformInputScore(value: string) {
  const matches = value.match(/([^\+]*)\+(.*)/)
  if (matches != null) {
    let [ first, second ] = matches.slice(1)
    first = first.replace(/\D/g, '').substring(0, 2)
    second = second.replace(/\D/g, '').substring(0, 1)
    return `${first}+${second}`
  } else {
    return value.replace(/\D/g, '').substring(0, 2)
  }
}

const validateQuestionValue = (value: string) => value.trim() !== ''
const validateOptionValue = validateQuestionValue
const validateScore = (score: string) => /^\d{1,2}(\+\d)?$/.test(score)

const NUM_OPTIONS = 10
const DEFAULT_QUESTION: InputQuestion = {
  value: 'Question',
  options: Array<InputOption>(NUM_OPTIONS).fill({
    value: 'Option',
    score: '',
    checkValue: false,
    checkScore: false,
  }),
  check: false,
}

type Props = {
  editIndex?: number
  onDone?: () => void
}

const QuestionEdit: React.FC<Props> = ({editIndex, onDone}) => {
  const dispatch = useDispatch()
  const initialState = useSelector<InputQuestion>(state => (
    editIndex != null ? makeInputQuestion(state.questions[editIndex]) : DEFAULT_QUESTION
  ))
  const [ question, setQuestion ] = useImmer(initialState)
  const everythingValid = (
    validateQuestionValue(question.value) &&
    question.options.every(option => validateQuestionValue(option.value)) &&
    question.options.every(option => validateScore(option.score))
  )

  const setAscendingScores = () => setQuestion(draft => {
    draft.options.forEach((option, i) => {
      option.score = option.score.replace(/[^\+]*/, `${i + 1}`)
    })
  })
  const setDescendingScores = () => setQuestion(draft => {
    draft.options.forEach((option, i) => {
      option.score = option.score.replace(/[^\+]*/, `${NUM_OPTIONS - i}`)
    })
  })

  const onSubmit = useCallback((e: FormEvent) => {
    e.preventDefault()
    const newQuestion: Question = {
      value: question.value,
      options: question.options.map(option => {
        const matches = option.score.match(/^(\d{1,2})(\+(\d))?$/)!
        const score = parseInt(matches[1])
        const bonus = matches[3] != null ? (
          {score: parseInt(matches[3]), opened: false}
        ) : undefined
        return {
          value: option.value,
          opened: false,
          score,
          bonus
        }
      })
    }
    if (editIndex == null) {
      dispatch(addQuestion(newQuestion))
    } else {
      dispatch(editQuestion({index: editIndex, newQuestion}))
    }
    onDone?.()
  }, [question])

  return (
    <Card variant='soft' size='sm'>
      <form onSubmit={onSubmit} onReset={onDone}>
        <Grid container columnSpacing={4} rowSpacing={2}>
          <Grid xs={12}>
            <Textarea
              value={question.value} onChange={e => {
                setQuestion(draft => {
                  draft.value = e.target.value
                  draft.check = true
                })
              }}
              onBlur={() => setQuestion(draft => {draft.check = true})}
              error={question.check && !validateQuestionValue(question.value)}
              placeholder='Вопрос' autoFocus
            />
          </Grid>
          <TwoColumns>
            {question.options.map((option, i) => (
              <OptionEdit
                option={option}
                onEdit={optionEditFunc => setQuestion(draft => optionEditFunc(draft.options[i]))}
                placeholder={`Ответ #${i + 1}`}
                key={i}
              />
            ))}
          </TwoColumns>
          <Grid xs={12}>
            <Stack direction='row' spacing={1}>
              <Button variant='outlined' color='neutral' onClick={setAscendingScores} size='sm'>
                Установить очки 1 &#10230; {NUM_OPTIONS}
              </Button>
              <Button variant='outlined' color='neutral' onClick={setDescendingScores} size='sm'>
                Установить очки {NUM_OPTIONS} &#10230; 1
              </Button>
            </Stack>
          </Grid>
          <Grid xs={12} display='flex' justifyContent='space-between'>
            <Button type='submit' disabled={!everythingValid}>Сохранить</Button>
            <Button type='reset' variant='outlined' color='danger'>Отмена</Button>
          </Grid>
        </Grid>
      </form>
    </Card>
  )
}

export default QuestionEdit


const NewAttachment: React.FC<{withBonus?: boolean}> = props => {
  const [ open, setOpen ] = useState(false)
  return (
    <Tooltip 
      placement='right' variant='outlined'
      open={open} onClose={() => setOpen(false)}
      title={
        <List size='sm'>
          <Tooltip placement='right' variant='outlined' title={
            <List size='sm'>
              <ListItem><ListItemButton>Изображение</ListItemButton></ListItem>
              <ListItem><ListItemButton>Текст</ListItemButton></ListItem>
            </List>
          }>
            <ListItem><ListItemButton>Прикрепить к основному ответу</ListItemButton></ListItem>
          </Tooltip>
          <Tooltip placement='right' variant='outlined' title={
            <List size='sm'>
              <ListItem><ListItemButton>Изображение</ListItemButton></ListItem>
              <ListItem><ListItemButton>Текст</ListItemButton></ListItem>
            </List>
          }>
            <ListItem><ListItemButton>Прикрепить к бонусу</ListItemButton></ListItem>
          </Tooltip>
        </List>
      }
    >
      <IconButton onClick={() => setOpen(true)}><AttachFile /></IconButton>
    </Tooltip>
  )
}

const OptionEdit: React.FC<{
  option: InputOption
  onEdit: (draftFunction: (draft: InputOption) => void) => void
  placeholder?: string
}> = props => {
  const { option, onEdit, placeholder } = props
  return (
    <div className={styles.option}>
      <Input
        value={option.value} onChange={e => onEdit(draft => {
          draft.value = e.target.value
        })}
        onBlur={() => onEdit(draft => {draft.checkValue = true})}
        error={option.checkValue && !validateOptionValue(option.value)}
        type='text' placeholder={placeholder} className={styles.optionText}
      />
      <Input
        className={styles.scoreEdit}
        value={option.score}
        onChange={e => onEdit(draft => {
          draft.score = transformInputScore(e.target.value)
        })}
        onBlur={() => onEdit(draft => {draft.checkScore = true})}
        error={option.checkScore && !validateScore(option.score)}
        placeholder='00+0'
      />
      <NewAttachment />
    </div>
  )
}

function TwoColumns({children}: {children: JSX.Element[]}) {
  const total = children.length
  const half = Math.floor(total / 2)
  return (
    <>
      <Grid xs={6}>
        <Stack spacing={1}>
          {children.slice(0, half)}
        </Stack>
      </Grid>
      <Grid xs={6}>
        <Stack spacing={1}>
          {children.slice(half, total)}
        </Stack>
      </Grid>
    </>
  )
}
