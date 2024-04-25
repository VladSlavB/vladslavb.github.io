import styles from './styles.css'
import React, { FormEvent, useCallback } from 'react'
import { useImmer } from 'use-immer'
import { Option, Question, addQuestion, editQuestion, useDispatch, useSelector } from '../../../store'
import Button from '@mui/joy/Button'
import Grid from '@mui/joy/Grid'
import Stack from '@mui/joy/Stack'
import Input from '@mui/joy/Input'
import Card from '@mui/joy/Card'
import IconButton from '@mui/joy/IconButton'
import AttachFile from '@mui/icons-material/AttachFile'
import Star from '@mui/icons-material/Star'
import StarBorder from '@mui/icons-material/StarBorder'
import Tooltip from '@mui/joy/Tooltip'
import Textarea from '@mui/joy/Textarea'

function clip(x: number, min: number, max: number) {
  return Math.min(Math.max(x, min), max)
}

type InputOption = Option & {check: boolean, checkScore: boolean}

type InputQuestion = Omit<Question, 'options'> & {
  options: InputOption[]
  check: boolean
}

function makeInputQuestion(question: Question): InputQuestion {
  return {
    ...question,
    check: false,
    options: question.options.map(option => ({...option, check: false, checkScore: false}))
  }
}

const validateQuestionValue = (value: string) => value.trim() !== ''
const validateOptionValue = validateQuestionValue
const validateScore = (score: number) => !isNaN(score)

const NUM_OPTIONS = 10
const DEFAULT_QUESTION: InputQuestion = {
  value: 'Question',
  options: Array<InputOption>(NUM_OPTIONS).fill({
    value: 'Option',
    score: NaN,
    withBonus: false,
    check: false,
    checkScore: false,
    opened: false
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
    draft.options.forEach((option, i) => option.score = i + 1)
  })
  const setDescendingScores = () => setQuestion(draft => {
    draft.options.forEach((option, i) => option.score = NUM_OPTIONS - i)
  })

  const onSubmit = useCallback((e: FormEvent) => {
    e.preventDefault()
    if (editIndex == null) {
      dispatch(addQuestion(question))
    } else {
      dispatch(editQuestion({index: editIndex, newQuestion: question}))
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
              <div key={i} className={styles.option}>
                <Input
                  value={option.value} onChange={e => setQuestion(draft => {
                    draft.options[i].value = e.target.value
                    draft.options[i].check = true
                  })}
                  onBlur={() => setQuestion(draft => {draft.options[i].check = true})}
                  error={option.check && !validateOptionValue(option.value)}
                  type='text' placeholder={`Ответ #${i + 1}`} className={styles.optionText}
                />
                <Input
                  className={styles.scoreEdit}
                  value={isNaN(option.score) ? '' : option.score}
                  onChange={e => setQuestion(draft => {
                    draft.options[i].score = clip(parseInt(e.target.value), 1, 99)
                    draft.options[i].checkScore = true
                  })}
                  onBlur={() => setQuestion(draft => {draft.options[i].checkScore = true})}
                  error={option.checkScore && !validateScore(option.score)}
                  type='number' placeholder='0'
                />
                {/* <IconButton tabIndex={-1}><AttachFile /></IconButton> */}
                <Tooltip title='Допбалл' placement='right'>
                  <IconButton tabIndex={-1} onClick={() => setQuestion(draft => {
                    draft.options[i].withBonus = !draft.options[i].withBonus
                  })}>
                    {option.withBonus ? <Star /> : <StarBorder />}
                  </IconButton>
                </Tooltip>
              </div>
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
