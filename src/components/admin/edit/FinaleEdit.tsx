import React, { FormEvent } from 'react'
import Card from '@mui/joy/Card'
import { Team, setFinale, useDispatch, useSelector } from '../../../store'
import { useImmer } from 'use-immer'
import Input from '@mui/joy/Input'
import Grid from '@mui/joy/Grid'
import Button from '@mui/joy/Button'
import styles from './styles.css'
import Typography from '@mui/joy/Typography'


const NUM_QUESTIONS = 5
const NUM_PLAYERS = 3
const DEFAULT = {
  questions: Array<{value: string}>(NUM_QUESTIONS).fill({value: ''}),
  names: {
    leftTeam: Array<string>(NUM_PLAYERS).fill(''),
    rightTeam: Array<string>(NUM_PLAYERS).fill(''),
  },
}

type Props = {
  edit?: boolean
  onDone: () => void
}
const FinaleEdit: React.FC<Props> = ({edit, onDone}) => {
  const dispatch = useDispatch()
  const initialState = useSelector(state => edit && state.finale != null ? state.finale : DEFAULT)
  const [ state, setState ] = useImmer(initialState)
  const disabled = (
    state.questions.some(question => question.value === '') ||
    state.names.leftTeam.some(name => name === '') ||
    state.names.rightTeam.some(name => name === '')
  )
  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    dispatch(setFinale(state))
    onDone?.()
  }
  function inputNames(team: Team) {
    const color = team === 'leftTeam' ? 'primary' : 'danger'
    const adjective = team === 'leftTeam' ? 'Синяя' : 'Красная'
    return <>
      <Grid xs={3} alignSelf='center' textAlign='right'>
        <Typography color={color}>{adjective} команда</Typography>
      </Grid>
      {state.names[team].map((name, i) => (
        <Grid xs={3} key={i}>
          <Input
            value={name}
            onChange={e => setState(draft => {
              draft.names[team][i] = e.target.value
            })}
            placeholder={`Имя #${i + 1}`}
          />
        </Grid>
      ))}
    </>
  }

  return (
    <Card variant='soft' size='sm' component='form' onSubmit={onSubmit} onReset={onDone}>
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
        {inputNames('leftTeam')}
        {inputNames('rightTeam')}
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
