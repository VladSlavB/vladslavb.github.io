import React from 'react'
import { Team, useGameSelector, useSelector } from '../../../store'
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


const getTeamParams = (team: Team) => ({
  color: team === 'leftTeam' ? 'primary' : 'danger' as 'primary' | 'danger',
  title: team === 'leftTeam' ? 'Синяя команда' : 'Красная команда'
})


const Finale: React.FC = () => {
  const active = useGameSelector(game => game.finaleActive)
  const finale = useSelector(state => state.finale)
  const ref = useAutoScroll(active)
  const teams = ['leftTeam', 'rightTeam'] as Team[]

  return finale != null ? (
    <Card variant={active ? 'soft' : 'outlined'} ref={ref}>
      <HeaderWithActions header='Финальный раунд' dim={!active} />
      <Tabs defaultValue={0}>
        <TabList>
          {teams.map(getTeamParams).map(({color, title}) => <Tab color={color}>{title}</Tab>)}
        </TabList>
        <TabPanel value={0}>
          {answersBlock(finale.questions.map(question => question.value), finale.names.leftTeam, 'leftTeam')}
        </TabPanel>
        <TabPanel value={1}>
          {answersBlock(finale.questions.map(question => question.value), finale.names.rightTeam, 'rightTeam')}
        </TabPanel>
      </Tabs>
    </Card>
  ) : null
}

export default Finale

function answersBlock(questions: string[], names: string[], team: Team) {
  return (
    <Grid container spacing={2}>
      <Grid xs={3} />
      {names.map(name => <Grid xs={3} textAlign='center'>{name}</Grid>)}
      {questions.map(question => <>
        <Grid xs={3}>{question}</Grid>
        {Array(3).fill(0).map((_, i) => (
          <Grid xs={3} key={i}>
            <Stack direction='row' spacing={1}>
              <Input fullWidth />
              <Input className={styles.finaleScoreEdit} placeholder='00' />
            </Stack>
          </Grid>
        ))}
      </>)}
    </Grid>
  )
}
