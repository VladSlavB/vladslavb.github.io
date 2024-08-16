import React, { FormEvent, useCallback, useState } from 'react'
import { useImmer } from 'use-immer'
import { Question, QuestionName, addQuestion, editQuestion, useDispatch, useSelector } from '../../../store'
import Button from '@mui/joy/Button'
import Grid from '@mui/joy/Grid'
import Stack from '@mui/joy/Stack'
import Card from '@mui/joy/Card'
import Textarea from '@mui/joy/Textarea'
import { InputOption, InputQuestion } from './types'
import OptionEdit from './OptionEdit'
import Select from '@mui/joy/Select'
import Option from '@mui/joy/Option'
import { NUM_OPTIONS } from '../../../defaults'
import Typography from '@mui/joy/Typography'


function makeInputQuestion(question: Question): InputQuestion {
  return {
    ...question,
    value2: question.name === QuestionName.dynamic ? question.value2 : '',
    options: question.name !== QuestionName.dynamic ? question.options?.map(option => ({
      ...option,
      score: `${option.score}`,
      bonus: option.bonus != null ? {
        ...option.bonus,
        score: `${option.bonus.score}`,
      } : undefined,
    })) : DEFAULT_OPTIONS
  }
}

const validateQuestionValue = (value: string) => value.trim() !== ''
const validateScore = (score: string) => parseInt(score) > 0

const DEFAULT_OPTIONS = Array<InputOption>(NUM_OPTIONS).fill({
  value: '',
  score: '',
  attachments: [],
})
const DEFAULT_QUESTION: InputQuestion = {
  name: QuestionName.social,
  value: '',
  value2: '',
  options: DEFAULT_OPTIONS,
}
const ALL_NAMES = Object.values(QuestionName)

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
  const noOptions = question.name === QuestionName.dynamic
  const everythingValid = (
    validateQuestionValue(question.value) && (
      noOptions || (
        question.options.every(option => validateQuestionValue(option.value)) &&
        question.options.every(option => (
          validateScore(option.score) && (option.bonus == null || validateScore(option.bonus.score))
        ))
      )
    )
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
    const { name, value, value2, options } = question
    const newQuestion: Question = name === QuestionName.dynamic ? {
      name, value, value2
    } : {
      name, value,
      options: options.map(option => ({
        value: option.value,
        attachments: option.attachments,
        score: parseInt(option.score),
        bonus: option.bonus != null ? {
          score: parseInt(option.bonus.score),
          attachments: option.bonus.attachments
        } : undefined
      }))
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
            <Select
              defaultValue='Народный раунд'
              value={question.name} onChange={(_, value) => {
                setQuestion(draft => {
                  draft.name = value as QuestionName
                })
              }}
            >
              {ALL_NAMES.map(name => <Option value={name}>{name}</Option>)}
            </Select>
          </Grid>
          <Grid xs={12}>
            <Textarea
              value={question.value} onChange={e => {
                setQuestion(draft => {
                  draft.value = e.target.value
                })
              }}
              placeholder='Вопрос' autoFocus
            />
          </Grid>
          {noOptions ? (
            <Grid xs={12}>
              <Textarea
                value={question.value2} onChange={e => {
                  setQuestion(draft => {
                    draft.value2 = e.target.value
                  })
                }}
                placeholder='Второй вопрос (необязательно)'
              />
            </Grid>
          ) : <>
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
          </>}
          <Grid xs={12} display='flex' justifyContent='space-between' alignItems='baseline'>
            <Button type='submit' disabled={!everythingValid}>Сохранить</Button>
            {!everythingValid && <Typography color='neutral' fontSize='sm'>Все поля обязательны</Typography>}
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
