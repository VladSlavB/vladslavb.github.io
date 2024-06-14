import React, { FormEvent } from 'react'
import Card from '@mui/joy/Card'
import { setFinale, useDispatch, useSelector } from '../../../store'
import { useImmer } from 'use-immer'
import Input from '@mui/joy/Input'
import Grid from '@mui/joy/Grid'
import Button from '@mui/joy/Button'


const NUM_QUESTIONS = 5
const DEFAULT_QUESTIONS = Array(NUM_QUESTIONS).fill(null).map(_ => ({value: ''}))

type Props = {
  edit?: boolean
  onDone: () => void
}
const FinaleEdit: React.FC<Props> = ({edit, onDone}) => {
  const dispatch = useDispatch()
  const initialState = useSelector(state => edit && state.finale != null ? state.finale : DEFAULT_QUESTIONS)
  const [ questions, setQuestions ] = useImmer(initialState)
  const disabled = questions.some(question => question.value !== '')
  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    dispatch(setFinale(questions))
    onDone?.()
  }

  return (
    <Card variant='soft' size='sm' component='form' onSubmit={onSubmit} onReset={onDone}>
      <Grid container>
        {questions.map((question, i) => (
          <Grid xs={12}>
            <InputField value={question.value} onEdit={newValue => setQuestions(draft => {
              draft[i].value = newValue
            })} />
          </Grid>
        ))}
        <Grid xs={12} display='flex' justifyContent='space-between'>
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
}> = ({value, onEdit}) => (
  <Input value={value} onChange={e => onEdit(e.target.value)} />
)
