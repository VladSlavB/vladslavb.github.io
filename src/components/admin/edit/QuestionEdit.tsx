import React, { FormEvent, useCallback } from 'react'
import { useImmer } from 'use-immer'
import { Question, addQuestion, editQuestion, useDispatch, useSelector } from '../../../store'
import Button from '@mui/joy/Button'
import Grid from '@mui/joy/Grid'
import Stack from '@mui/joy/Stack'
import Card from '@mui/joy/Card'
import Textarea from '@mui/joy/Textarea'
import { InputOption, InputQuestion } from './types'
import OptionEdit from './OptionEdit'


function makeInputQuestion(question: Question): InputQuestion {
  return {
    ...question,
    options: question.options.map(option => ({
      ...option,
      score: `${option.score}`,
      bonus: option.bonus != null ? {
        ...option.bonus,
        score: `${option.bonus.score}`,
      } : undefined,
    }))
  }
}

const validateQuestionValue = (value: string) => value.trim() !== ''
const validateScore = (score: string) => parseInt(score) > 0

const NUM_OPTIONS = 10
const DEFAULT_QUESTION: InputQuestion = {
  value: 'Question',
  options: Array<InputOption>(NUM_OPTIONS).fill({
    value: 'Option',
    score: '',
  }),
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
    question.options.every(option => (
      validateScore(option.score) && (option.bonus == null || validateScore(option.bonus.score))
    ))
  )

  const setAscendingScores = () => setQuestion(draft => {
    draft.options.forEach((option, i) => {
      option.score = `${i + 1}`
    })
  })
  const setDescendingScores = () => setQuestion(draft => {
    draft.options.forEach((option, i) => {
      option.score = `${NUM_OPTIONS - i}`
    })
  })

  const onSubmit = useCallback((e: FormEvent) => {
    e.preventDefault()
    const newQuestion: Question = {
      value: question.value,
      options: question.options.map(option => {
        return {
          value: option.value,
          attachment: option.attachment,
          opened: false,
          score: parseInt(option.score),
          bonus: option.bonus != null ? {
            score: parseInt(option.bonus.score),
            opened: false,
            attachment: option.bonus.attachment
          } : undefined
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
