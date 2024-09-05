import React from 'react'
import { DynamicQuestion, DynamicState, openOption, setOptions, showQuestion, startEditing, startEditingDynamicOptions, switchToQuestion2, useDispatch, useGameSelector, useSelector } from '../../../store'
import { useAutoScroll } from '../scroll'
import Card from '@mui/joy/Card'
import Typography from '@mui/joy/Typography'
import Grid from '@mui/joy/Grid'
import OptionEdit from '../edit/OptionEdit'
import { useImmer } from 'use-immer'
import Button from '@mui/joy/Button'
import ButtonGroup from '@mui/joy/ButtonGroup'
import Close from '@mui/icons-material/Close'
import IconButton from '@mui/joy/IconButton'
import styles from './styles.css'
import CurrentAttachments from './CurrentAttachments'
import { hitAnimation } from '../../game/Teams'
import SubtotalThenNextQuestion from './SubtotalThenNextQuestion'
import HeaderWithActions from '../preview/HeaderWithActions'
import AttachmentIcon from '@mui/icons-material/Attachment'


type WrapperProps = {
  question: DynamicQuestion
}
type Props = WrapperProps & DynamicState
const DynamicQuestion: React.FC<Props> = ({question, options: options1, options2, showSecond, editing}) => {
  const ref = useAutoScroll()
  const dispatch = useDispatch()
  const shown = useGameSelector(game => game.questionShown)
  const options = showSecond ? options2 : options1
  const index = useGameSelector(game => game.currentQuestion)
  const editorStateView = useSelector(state => state.editor.mode === 'view')
  const questionShown = useGameSelector(game => game.questionShown)
  const allOptionsOpened = options.every(option => option.opened)

  return (
    <Card variant='soft' ref={ref}>
      <Grid container columnSpacing={4} rowSpacing={2}>
        <Grid xs={12}>
          <HeaderWithActions
            header={showSecond ? question.value2 : question.value}
            onEdit={() => dispatch(startEditing(index))}
            showActions={editorStateView}
            disableDelete
          />
        </Grid>
        {questionShown && <>
          <Grid xs={6}><Typography color='primary' textAlign='center'>Синяя команда</Typography></Grid>
          <Grid xs={6}><Typography color='danger' textAlign='center'>Красная команда</Typography></Grid>
        </>}
        {editing && questionShown && (!showSecond ? (
          <OptionsEditor
            defaultOptions={options1}
            second={showSecond}
          />
        ) : (
          <OptionsEditor
            defaultOptions={options2}
            second={showSecond}
          />
        ))}
        {!editing && options.map((option, i) => (
          <Grid xs={6} key={i}>
            <ButtonGroup disabled={option.opened && shown} size='lg' className={styles.optionButton}>
              <Button
                fullWidth
                variant='plain'
                color='neutral'
                onClick={() => dispatch(openOption({index: i, wrong: false, second: showSecond}))}
                startDecorator={option.attachments.length > 0 ? <AttachmentIcon /> : undefined}
              >{option.wrong ? <s>{option.value}</s> : option.value}</Button>
              <IconButton
                variant='soft'
                color='danger'
                onClick={() => {
                  dispatch(openOption({index: i, wrong: true, second: showSecond}))
                  hitAnimation(i % 2 == 0 ? 'leftTeam' : 'rightTeam')
                }}
              >
                <Close />
              </IconButton>
            </ButtonGroup>
          </Grid>
        ))}
        {!editing && !allOptionsOpened && (
          <Grid xs={12}>
            <Button
              variant='outlined'
              size='sm'
              color='primary'
              onClick={() => dispatch(startEditingDynamicOptions())}
            >Исправить варианты</Button>
          </Grid>
        )}
        <Grid xs={12}><CurrentAttachments /></Grid>
        <BottomControls />
      </Grid>
    </Card>
  )
}

export default dynamicWrapper(DynamicQuestion)

function dynamicWrapper<P>(Component: React.FC<P & DynamicState>): React.FC<P> {
  return props => {
    const q = useGameSelector(state => state.q)
    if (q?.type !== 'dynamic') return null
    return <Component {...props} {...q} />
  }
}

type OptionsEditorProps = {
  defaultOptions: DynamicState['options']
  second: boolean
}
export const OptionsEditor: React.FC<OptionsEditorProps> = ({defaultOptions, second}) => {
  const [ options, setLocalOptions ] = useImmer(defaultOptions)
  const everythingValid = options.every(option => option.value != '')
  const dispatch = useDispatch()
  function onSubmit() {
    dispatch(setOptions({options, second}))
  }

  return <>
    {options.map((option, i) => (
      <Grid xs={6} key={i}>
        <OptionEdit
          size='lg'
          option={option}
          onEdit={optionEditFunc => setLocalOptions(draft => optionEditFunc(draft[i]))}
          noScore
          noBonus
          disabled={option.opened}
        />
      </Grid>
    ))}
    <Grid xs={12}>
      <Button onClick={onSubmit} disabled={!everythingValid}>Сохранить</Button>
    </Grid>
  </>
}

const BottomControlsInner: React.FC<DynamicState> = ({options: options1, options2, showSecond}) => {
  const questionShown = useGameSelector(game => game.questionShown)
  const dispatch = useDispatch()
  const options = showSecond ? options2 : options1
  const allOptionsOpened = options.every(option => option.opened)

  return !questionShown || allOptionsOpened ? (
    <Grid xs={12} display='flex' justifyContent='flex-end'>
      {questionShown ? (
        showSecond ? (
          <SubtotalThenNextQuestion />
        ) : (
          <Button
            variant='solid'
            color='primary'
            onClick={() => dispatch(switchToQuestion2())}
          >Второй вопрос</Button>
        )
      ) : (
        <Button
          variant='solid'
          color='primary'
          onClick={() => dispatch(showQuestion())}
        >Показать вопрос</Button>
      )}
    </Grid>
  ) : null
}

const BottomControls = dynamicWrapper(BottomControlsInner)
