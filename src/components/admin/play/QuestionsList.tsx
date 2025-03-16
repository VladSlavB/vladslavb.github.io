import React, { useState } from 'react'
import { QuestionName, setTeamsNames, Team, useDispatch, useGameSelector, useSelector } from '../../../store'
import styles from './styles.css'
import Stack from '@mui/joy/Stack'
import OrdinaryQuestion from './OrdinaryQuestion'
import QuestionPreview from '../preview/QuestionPreview'
import DynamicQuestion from './DynamicQuestion'
import Finale from './Finale'
import FinalePreview from '../preview/FinalePreview'
import QuestionEdit from '../edit/QuestionEdit'
import FinaleEdit from '../edit/FinaleEdit'
import Input from '@mui/joy/Input'
import Button from '@mui/joy/Button'
import Textarea from '@mui/joy/Textarea'
import ArangeQuestion from './ArangeQuestion'


const QuestionsList: React.FC = () => {
  const questions = useSelector(state => state.questions)
  const editState = useSelector(state => state.editor)
  const currentQuestionIndex = useGameSelector(game => game.currentQuestion)
  const hasFinale = useSelector(state => state.finale != null)
  const finaleActive = useGameSelector(game => game.finale)

  return (
    <Stack spacing={2} className={styles.list}>
      <TeamsNamesChanger />
      {questions.map((question, index) => {
        const isEdited = editState.mode === 'edit' && editState.index === index
        return (
          isEdited ? (
            <QuestionEdit editIndex={index} key={index} />
          ) : (
            index === currentQuestionIndex ? (
              question.name === QuestionName.dynamic ? (
                <DynamicQuestion question={question} key={index} />
              ) : question.name === QuestionName.arange ? (
                <ArangeQuestion question={question} key={index} />
              ) : (
                <OrdinaryQuestion question={question} key={index} />
              )
            ) : (
              <QuestionPreview
                index={index}
                key={index}
                canEdit={index > currentQuestionIndex && editState.mode === 'view'}
                disableDelete
              />
            )
          )
        )
      })}
      {hasFinale && (
        editState.mode === 'editFinale' ? (
          <FinaleEdit edit />
        ) : (
          finaleActive ? (
            <Finale />
          ) : (
            <FinalePreview canEdit={editState.mode === 'view'} disableDelete />
          )
        )
      )}
    </Stack>
  )
}

export default QuestionsList

const TeamsNamesChanger: React.FC = () => {
  const dispatch = useDispatch()
  const initialTeamsNames = useGameSelector(game => ({
    leftTeam: game.leftTeam.name,
    rightTeam: game.rightTeam.name,
  }))
  const [teamsNames, setTeamNames] = useState(initialTeamsNames)

  function teamNameChanger(team: Team) {
    return (
      <Textarea
        sx={{flexGrow: 1}}
        placeholder={`Название ${team === 'leftTeam' ? 'синих' : 'красных'}`}
        value={teamsNames[team]}
        color={team === 'leftTeam' ? 'primary' : 'danger'}
        onChange={e => setTeamNames({...teamsNames, [team]: e.target.value})}
      />
    )
  }
  return (
    <Stack direction='row' spacing={2} alignItems='flex-start'>
      {teamNameChanger('leftTeam')}
      {teamNameChanger('rightTeam')}
      <Button onClick={() => dispatch(setTeamsNames(teamsNames))}>
        Сохранить
      </Button>
    </Stack>
  )
}
