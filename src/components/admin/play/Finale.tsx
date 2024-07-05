import React, { useEffect, useRef, useState } from 'react'
import { Team, addFinaleAnswer, closeAllAnswers, openFinaleAnswer, openFinaleScore, toggleFinaleAnswerVisibility, toggleFinaleQuestion, toggleFinaleScoreVisibility, useDispatch, useGameSelector, useSelector } from '../../../store'
import HeaderWithActions from '../edit/HeaderWithActions'
import Card from '@mui/joy/Card'
import Grid from '@mui/joy/Grid'
import Input from '@mui/joy/Input'
import styles from './styles.css'
import Stack from '@mui/joy/Stack'
import { useAutoScroll } from '../scroll'
import Tabs from '@mui/joy/Tabs'
import TabList from '@mui/joy/TabList'
import Tab from '@mui/joy/Tab'
import TabPanel from '@mui/joy/TabPanel'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import ButtonGroup from '@mui/joy/ButtonGroup'
import IconButton from '@mui/joy/IconButton'
import { transformInputScore } from '../edit/OptionEdit'


const getTeamParams = (team: Team) => ({
  color: team === 'leftTeam' ? 'primary' : 'danger' as 'primary' | 'danger',
  title: team === 'leftTeam' ? 'Синяя команда' : 'Красная команда'
})


const Finale: React.FC = () => {
  const active = useGameSelector(game => game.finale.active)
  const finale = useSelector(state => state.finale)
  const openedQuestions = useGameSelector(game => game.finale.openedQuestions)
  const ref = useAutoScroll(active)
  const teams = useGameSelector(game => game.finale.teamsOrder)
  const dispatch = useDispatch()

  function calcIndex(team: Team, question: number, player: number) {
    if (finale === null) return -1
    let idx = teams.indexOf(team)
    idx *= finale.names[team].length
    idx += player
    idx *= finale.questions.length
    idx += question
    return idx
  }

  function answersBlock(team: Team) {
    if (finale == null) return null
    const names = finale.names[team]
    return (
      <Grid container spacing={2}>
        <Grid xs={3} />
        {names.map((name, i) => (
          <Grid xs={3} textAlign='center' key={i}>
            <Typography color={active ? undefined : 'neutral'}>{name}</Typography>
          </Grid>
        ))}
        {finale.questions.map((question, i) => (
          <React.Fragment key={i}>
            <Grid xs={3}>
              <Button
                disabled={!active}
                color='primary'
                variant={openedQuestions[i] ? 'outlined': 'solid'}
                onClick={() => dispatch(toggleFinaleQuestion(i))}
              >{question.value}</Button>
            </Grid>
            {names.map((_, j) => (
              <Grid xs={3} key={j}>
                <AnswerWithScore index={calcIndex(team, i, j)} />
              </Grid>
            ))}
          </React.Fragment>
        ))}
      </Grid>
    )
  }

  return finale != null ? (
    <Card variant={active ? 'soft' : 'outlined'} ref={ref}>
      <HeaderWithActions header='Финальный раунд' dim={!active} />
      <Tabs defaultValue={0} className={styles.tabsContainer}>
        <TabList>
          {teams.map(getTeamParams).map(({color, title}) => (
            <Tab key={title} color={color} disabled={!active}>{title}</Tab>
          ))}
        </TabList>
        <TabPanel value={0}>{answersBlock(teams[0])}</TabPanel>
        <TabPanel value={1}>{answersBlock(teams[1])}</TabPanel>
      </Tabs>
      <Stack direction='row'>
        <Button
          onClick={() => dispatch(closeAllAnswers())}
          variant='outlined' color='neutral' size='sm'
          disabled={!active}
        >Скрыть все вопросы и ответы, оставив очки</Button>
      </Stack>
    </Card>
  ) : null
}

export default Finale


type AnswerProps = {
  index: number
}

const AnswerWithScore: React.FC<AnswerProps> = ({index}) => {
  const [ answer, setAnswer ] = useState('')
  const [ score, setScore ] = useState('')
  const fixedAnswer = useGameSelector(game => game.finale.answers.at(index))
  const fixedScore = useGameSelector(game => game.finale.scores.at(index))
  const disabled = useGameSelector(game => game.finale.answers.length < index || !game.finale.active)
  const dispatch = useDispatch()
  function validate() {
    return answer !== '' && score !== ''
  }
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!disabled) {
      ref.current?.querySelector('input')?.focus()
    }
  }, [disabled])

  return fixedScore != null && fixedAnswer != null ? (
    <Stack direction='row' spacing={1}>
      <ButtonGroup
        className={styles.finaleButtonGroup}
        buttonFlex={1}
      >
        <Button
          onClick={() => dispatch(
            !fixedAnswer.opened ? openFinaleAnswer(index) : toggleFinaleAnswerVisibility(index)
          )}
          color={fixedAnswer.opened ? 'neutral' : 'primary'}
          variant={fixedAnswer.opened && !fixedAnswer.hidden ? 'outlined' : 'solid'}
        >
          {fixedAnswer.value}
        </Button>
        <IconButton
          onClick={() => dispatch(
            !fixedScore.opened ? openFinaleScore(index) : toggleFinaleScoreVisibility(index)
          )}
          color={fixedScore.opened ? 'neutral' : 'primary'}
          variant={fixedScore.opened && !fixedScore.hidden ? 'outlined' : 'solid'}
        >
          {fixedScore.value}
        </IconButton>
      </ButtonGroup>
    </Stack>
  ) : (
    <Stack direction='row' spacing={1} component='form' onSubmit={e => {
      e.preventDefault()
      if (validate()) {
        dispatch(addFinaleAnswer({answer, score: parseInt(score)}))
      }
    }}>
      <Input
        ref={ref}
        value={answer}
        fullWidth
        disabled={disabled}
        onChange={e => setAnswer(e.target.value)}
        placeholder='Ответ...'
      />
      <Input
        value={score}
        disabled={disabled}
        className={styles.finaleScoreEdit}
        placeholder='00'
        onChange={e => setScore(transformInputScore(e.target.value))}
      />
      <button type='submit' style={{display: 'none'}} />
    </Stack>
  )
}
