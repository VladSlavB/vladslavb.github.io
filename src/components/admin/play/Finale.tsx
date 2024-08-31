import React, { useState } from 'react'
import { FinaleState, Team, hideAllOptions, hideAllQuestions, openFinaleOption, openFinaleQuestion, openFinaleScore, setFinaleOptions, setName, startEditingFinale, useDispatch, useGameSelector, useSelector } from '../../../store'
import HeaderWithActions from '../preview/HeaderWithActions'
import Card from '@mui/joy/Card'
import Grid from '@mui/joy/Grid'
import Input from '@mui/joy/Input'
import styles from './styles.css'
import { useAutoScroll } from '../scroll'
import Tabs from '@mui/joy/Tabs'
import TabList from '@mui/joy/TabList'
import Tab from '@mui/joy/Tab'
import TabPanel from '@mui/joy/TabPanel'
import Button from '@mui/joy/Button'
import ButtonGroup from '@mui/joy/ButtonGroup'
import OptionEdit from '../edit/OptionEdit'
import { useImmer } from 'use-immer'
import CurrentAttachments from './CurrentAttachments'
import IconButton from '@mui/joy/IconButton'
import Check from '@mui/icons-material/Check'
import Stack from '@mui/joy/Stack'


const getTeamParams = (team: Team) => ({
  color: team === 'leftTeam' ? 'primary' : 'danger' as 'primary' | 'danger',
  title: team === 'leftTeam' ? 'Синяя команда' : 'Красная команда'
})


const Finale: React.FC<FinaleState> = ({teamsOrder: teams, names, openedQuestions, options, optionsDone}) => {
  const finale = useSelector(state => state.finale)
  const [ localOptions, setLocalOptions ] = useImmer(() => options.map(optionsOfTeam => optionsOfTeam.map(option => ({
    ...option,
    score: `${option.score === 0 ? '' : option.score}`
  }))))
  const ref = useAutoScroll()
  const dispatch = useDispatch()
  const optionsReady = localOptions.map(optionsOfTeam => optionsOfTeam.every(option => option.value != '' && option.score != ''))

  function answersBlock(teamIndex: number) {
    if (finale == null) return null
    
    return (
      <Grid container spacing={2}>
        <Grid xs={3} />
        {names[teamIndex].map((name, i) => (
          <Grid xs={3} textAlign='center' key={i}>
            {name == '' ? (
              <NameEdit onDone={value => dispatch(setName({teamIndex, index: i, value}))} />
            ) : (
              <b>{name}</b>
            )}
          </Grid>
        ))}
        {finale.questions.map((question, i) => (
          <React.Fragment key={i}>
            <Grid xs={3}>
              <Button
                variant='plain'
                color='neutral'
                className={styles.optionButton}
                disabled={openedQuestions[i]}
                onClick={() => dispatch(openFinaleQuestion(i))}
              >{question.value}</Button>
            </Grid>
            {Array(3).fill(0).map((_, j) => {
              const index = i*3+j
              const option = options[teamIndex][index]
              return (
                <Grid xs={3} key={j}>
                  {optionsDone[teamIndex] ? (
                    <ButtonGroup
                      variant='plain'
                      color='neutral'
                      className={styles.optionButton}
                      size='lg'
                    >
                      <Button
                        fullWidth
                        disabled={option.opened}
                        onClick={() => dispatch(openFinaleOption({teamIndex, index}))}
                      >{option.value}</Button>
                      <Button
                        disabled={option.scoreOpened}
                        onClick={() => dispatch(openFinaleScore({teamIndex, index}))}
                      >{option.score}</Button>
                    </ButtonGroup>
                  ) : (
                    <OptionEdit
                      option={localOptions[teamIndex][index]}
                      onEdit={optionEditFunc => setLocalOptions(draft => optionEditFunc(draft[teamIndex][index]))}
                      placeholder='Ответ...'
                      noBonus
                    />
                  )}
                </Grid>
              )
            })}
          </React.Fragment>
        ))}
        <Grid xs={3}>
          {openedQuestions.every(_ => _) && (
            <Button
              variant='outlined'
              color='neutral'
              onClick={() => dispatch(hideAllQuestions())}
            >Скрыть все вопросы</Button>
          )}
        </Grid>
        <Grid xs={9}>
          {optionsDone[teamIndex] ? (
            options[teamIndex].every(option => option.opened) && (
              <Button
                variant='outlined'
                color='neutral'
                onClick={() => dispatch(hideAllOptions({teamIndex}))}
              >Скрыть ответы этой команды</Button>
            )
          ) : (
            <Button
              onClick={() => dispatch(setFinaleOptions({
                options: localOptions.map(optionsOfTeam => optionsOfTeam.map(option => ({
                  ...option,
                  score: parseInt(option.score !== '' ? option.score : '0')
                }))),
                teamIndex
              }))}
              disabled={!optionsReady[teamIndex]}
            >Сохранить</Button>
          )}
        </Grid>
      </Grid>
    )
  }

  return finale != null ? (
    <Card variant='soft' ref={ref}>
      <HeaderWithActions
        header='Финальный раунд'
        onEdit={() => dispatch(startEditingFinale())}
        showActions
        disableDelete
      />
      <Tabs defaultValue={0} className={styles.tabsContainer}>
        <TabList>
          {teams.map(getTeamParams).map(({color, title}) => (
            <Tab key={title} color={color}>{title}</Tab>
          ))}
        </TabList>
        <TabPanel value={0}>{answersBlock(0)}</TabPanel>
        <TabPanel value={1}>{answersBlock(1)}</TabPanel>
      </Tabs>
      <CurrentAttachments />
    </Card>
  ) : null
}

export function finaleWrapper<P>(Component: React.FC<P & FinaleState>): React.FC<P> {
  return props => {
    const q = useGameSelector(state => state.q)
    if (q?.type !== 'finale') return null
    return <Component {...props} {...q} />
  }
}

export default finaleWrapper(Finale)

type NameEditProps = {
  onDone: (name: string) => void
}
const NameEdit: React.FC<NameEditProps> = ({onDone}) => {
  const [ value, setValue ] = useState('')

  return (
    <Stack
      component='form'
      direction='row'
      onSubmit={e => {
        e.preventDefault()
        onDone(value)
      }
    }>
      <Input
        fullWidth
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder='Имя...'
      />
      <IconButton type='submit' color='primary'><Check /></IconButton>
    </Stack>
  )
}
