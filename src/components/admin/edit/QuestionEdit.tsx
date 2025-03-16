import React, { FormEvent, useCallback } from 'react'
import { useImmer } from 'use-immer'
import { Question, QuestionName, addQuestion, editQuestion, finishEditing, useDispatch, useGameSelector, useSelector } from '../../../store'
import Button from '@mui/joy/Button'
import Grid from '@mui/joy/Grid'
import Stack from '@mui/joy/Stack'
import Card from '@mui/joy/Card'
import Textarea from '@mui/joy/Textarea'
import { InputOption, InputQuestion } from './types'
import OptionEdit from './OptionEdit'
import Select from '@mui/joy/Select'
import Option from '@mui/joy/Option'
import { NUM_ORDINARY_MIN_OPTIONS, NUM_ORDINARY_MAX_OPTIONS, NUM_ARANGE_OPTIONS } from '../../../defaults'
import TwoColumns from '../../common/TwoColumns'


const DEFAULT_OPTIONS = Array<InputOption>(Math.max(NUM_ORDINARY_MAX_OPTIONS, NUM_ARANGE_OPTIONS)).fill({
  value: '',
  score: '',
  attachments: [],
})

function makeInputQuestion(question: Question, keepNumOptions: boolean): InputQuestion {
  let options = [...DEFAULT_OPTIONS]
  if (question.name !== QuestionName.dynamic) {
    if (question.name === QuestionName.arange) {
      options = question.options.map(option => ({
        ...option,
        score: '',
      }))
    } else {
      if (keepNumOptions) {
        options = DEFAULT_OPTIONS.slice(0, question.options.length)
      }
      for (let i = 0; i < question.options.length; i++) {
        const option = question.options[i]
        options[i] = {
          ...option,
          score: `${option.score}`,
          bonus: option.bonus != null ? {
            ...option.bonus,
            score: `${option.bonus.score}`,
          } : undefined,
        }
      }
    }
  }
  return {
    ...question,
    options,
  }
}

const validateQuestionValue = (value: string) => value.trim() !== ''
const validateScore = (score: string) => parseInt(score) > 0

const DEFAULT_QUESTION: InputQuestion = {
  name: QuestionName.social,
  value: '',
  options: DEFAULT_OPTIONS,
}
const ALL_NAMES = Object.values(QuestionName)

type Props = {
  editIndex?: number
}

const QuestionEdit: React.FC<Props> = ({editIndex}) => {
  const dispatch = useDispatch()

  // Инфа для редактирования вопроса прямо во время игры
  const partiallyEditable = useGameSelector(game => game.currentQuestion === editIndex)
  const options = useGameSelector(game => (
    game.currentQuestion === editIndex && game.q?.type === 'ordinary' ? (
      game.q.options
    ) : undefined
  ))

  const initialState = useSelector<InputQuestion>(state => (
    editIndex != null ? makeInputQuestion(state.questions[editIndex], partiallyEditable) : DEFAULT_QUESTION
  ))
  const [ question, setQuestion ] = useImmer(initialState)
  const numMinOptions = partiallyEditable ? (
    options?.length ?? 0
  ) : (
    question.name === QuestionName.arange ? NUM_ARANGE_OPTIONS : NUM_ORDINARY_MIN_OPTIONS
  )
  const noOptions = question.name === QuestionName.dynamic
  const validOptions = question.options.filter(option => validateQuestionValue(option.value))
  const everythingValid = (
    validateQuestionValue(question.value) && (
      noOptions ? (
        true
      ) : (
        validOptions.length >= numMinOptions && (
        question.name === QuestionName.arange || validOptions.every(option => (
          validateScore(option.score) && (option.bonus == null || validateScore(option.bonus.score))
        )))
      )
    )
  )

  const setAscendingScores = () => setQuestion(draft => {
    let score = 1
    draft.options.forEach(option => {
      if (option.value !== '') {
        option.score = `${score++}`
      }
    })
  })
  const setDescendingScores = () => setQuestion(draft => {
    let score = validOptions.length
    draft.options.forEach(option => {
      if (option.value !== '') {
        option.score = `${score--}`
      }
    })
  })
  const disableScoreButtons = validOptions.length < numMinOptions

  const onSubmit = useCallback((e: FormEvent) => {
    e.preventDefault()
    const { name, value } = question
    const newQuestion: Question = name === QuestionName.dynamic ? {
      name, value,
    } : name === QuestionName.arange ? {
      name, value,
      options: validOptions.slice(0, NUM_ARANGE_OPTIONS).map(option => ({
        value: option.value,
        attachments: option.attachments,
      }))
    } : {
      name, value,
      options: validOptions.map(option => ({
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
    dispatch(finishEditing())
  }, [question])

  return (
    <Card variant='soft' size='sm'>
      <form onSubmit={onSubmit} onReset={() => dispatch(finishEditing())}>
        <Grid container columnSpacing={4} rowSpacing={2}>
          <Grid xs={12}>
            <Select
              defaultValue='Народный раунд'
              value={question.name} onChange={(_, value) => {
                setQuestion(draft => {
                  draft.name = value as QuestionName
                })
              }}
              disabled={partiallyEditable}
            >
              {ALL_NAMES.map(name => <Option value={name}>{name}</Option>)}
            </Select>
          </Grid>
          <Grid xs={12}>
            <Textarea
              value={question.value}
              onChange={e => {
                setQuestion(draft => {
                  draft.value = e.target.value
                })
              }}
              placeholder='Вопрос'
              autoFocus
            />
          </Grid>
          {!noOptions && <>
            <TwoColumns>
              {question.name !== QuestionName.arange ? (
                question.options.map((option, i) => (
                  <OptionEdit
                    option={option}
                    onEdit={optionEditFunc => setQuestion(draft => optionEditFunc(draft.options[i]))}
                    placeholder={`Вариант..`}
                    key={i}
                    disabled={options?.[i].opened}
                    disabledBonus={options?.[i].bonus?.opened}
                    disableScores={partiallyEditable}
                  />
                ))
               ) : (
                question.options.slice(0, NUM_ARANGE_OPTIONS).map((option, i) => (
                  <OptionEdit
                    option={option}
                    onEdit={optionEditFunc => setQuestion(draft => optionEditFunc(draft.options[i]))}
                    placeholder={`Вариант..`}
                    key={i}
                    disabled={options?.[i].opened}
                    noBonus
                    noScore
                  />
                ))
              )}
            </TwoColumns>
            {!partiallyEditable && question.name !== QuestionName.arange && (
              <Grid xs={12}>
                <Stack direction='row' spacing={1}>
                  <Button variant='outlined' color='neutral' onClick={setAscendingScores} size='sm' disabled={disableScoreButtons}>
                    Установить очки {disableScoreButtons ? 'по возрастанию' : <>1 &#10230; {validOptions.length}</>}
                  </Button>
                  <Button variant='outlined' color='neutral' onClick={setDescendingScores} size='sm' disabled={disableScoreButtons}>
                    Установить очки {disableScoreButtons ? 'по убыванию' : <>{validOptions.length} &#10230; 1</>}
                  </Button>
                </Stack>
              </Grid>
            )}
          </>}
          <Grid xs={12} display='flex' justifyContent='space-between' alignItems='baseline'>
            <Button type='submit' disabled={!everythingValid}>Сохранить</Button>
            <Button type='reset' variant='outlined' color='danger'>Отмена</Button>
          </Grid>
        </Grid>
      </form>
    </Card>
  )
}

export default QuestionEdit
