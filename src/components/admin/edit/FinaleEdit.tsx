import React, { FormEvent } from 'react'
import Card from '@mui/joy/Card'
import { finishEditing, setFinale, useDispatch, useSelector } from '../../../store'
import { useImmer } from 'use-immer'
import Input from '@mui/joy/Input'
import Grid from '@mui/joy/Grid'
import Button from '@mui/joy/Button'
import styles from './styles.css'


const NUM_QUESTIONS = 5
const DEFAULT = {
  questions: Array<{value: string}>(NUM_QUESTIONS).fill({value: ''}),
}

type Props = {
  edit?: boolean
}
const FinaleEdit: React.FC<Props> = ({edit}) => {
  const dispatch = useDispatch()
  const initialState = useSelector(state => edit && state.finale != null ? state.finale : DEFAULT)
  const [ state, setState ] = useImmer(initialState)
  const disabled = state.questions.some(question => question.value === '')
  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    dispatch(setFinale(state))
    dispatch(finishEditing())
  }

  return (
    <Card variant='soft' size='sm' component='form' onSubmit={onSubmit} onReset={() => dispatch(finishEditing())}>
      <Grid container spacing={1}>
        {state.questions.map((question, i) => (
          <Grid xs={12} key={i}>
            <InputField
              value={question.value}
              onEdit={newValue => setState(draft => {
                draft.questions[i].value = newValue
              })}
              index={i}
            />
          </Grid>
        ))}
        <Grid className={styles.finaleButtons}>
          <Button type='submit' disabled={disabled}>Сохранить</Button>
          <Button type='reset' variant='outlined' color='danger'>Отмена</Button>
        </Grid>
      </Grid>
    </Card>
  )
}

export default FinaleEdit

const InputField: React.FC<{
  value: string
  onEdit: (newValue: string) => void
  index: number
}> = ({value, onEdit, index}) => (
  <Input
    value={value}
    onChange={e => onEdit(e.target.value)}
    autoFocus={index === 0}
    placeholder={`Вопрос #${index + 1}`}
  />
)
