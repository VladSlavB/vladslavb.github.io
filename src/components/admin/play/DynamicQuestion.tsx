import React from 'react'
import { DynamicQuestion, DynamicState, openOption, setOptions, switchToQuestion2, useDispatch, useGameSelector } from '../../../store'
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
import NextQuestionButton from './NextQuestionButton'


type WrapperProps = {
  question: DynamicQuestion
}
type Props = WrapperProps & DynamicState
const DynamicQuestion: React.FC<Props> = ({question, options: options1, options2, showSecond, editing}) => {
  const ref = useAutoScroll()
  const dispatch = useDispatch()
  const options = showSecond ? options2 : options1

  return (
    <Card variant='soft' ref={ref}>
      <Grid container columnSpacing={4} rowSpacing={2}>
        <Grid xs={12}>
          <Typography
            level='title-lg'
            flexGrow={1}
            whiteSpace='pre-wrap'
          >{showSecond ? question.value2 : question.value}</Typography>
        </Grid>
        <Grid xs={6}><Typography color='danger' textAlign='center'>Красная команда</Typography></Grid>
        <Grid xs={6}><Typography color='primary' textAlign='center'>Синяя команда</Typography></Grid>
        <OptionsEditor defaultOptions={options1} visible={editing && !showSecond} second={showSecond} />
        <OptionsEditor defaultOptions={options2} visible={editing && showSecond} second={showSecond} />
        {!editing && options.map((option, i) => (
          <Grid xs={6} key={i}>
            <ButtonGroup disabled={option.opened} size='lg' className={styles.optionButton}>
              <Button
                fullWidth
                variant='plain'
                color='neutral'
                onClick={() => dispatch(openOption({index: i, wrong: false, second: showSecond}))}
              >{option.wrong ? <s>{option.value}</s> : option.value}</Button>
              <IconButton
                variant='soft'
                color='danger'
                onClick={() => dispatch(openOption({index: i, wrong: true, second: showSecond}))}
              >
                <Close />
              </IconButton>
            </ButtonGroup>
          </Grid>
        ))}
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
  visible: boolean
  second: boolean
}
const OptionsEditor: React.FC<OptionsEditorProps> = ({defaultOptions, visible, second}) => {
  const [ options, setLocalOptions ] = useImmer(() => defaultOptions.map(option => ({...option, opened: false, wrong: false})))
  const everythingValid = options.every(option => option.value != '')
  const dispatch = useDispatch()
  function onSubmit() {
    dispatch(setOptions({options, second}))
  }

  if (!visible) return null

  return <>
    {options.map((option, i) => (
      <Grid xs={6} key={i}>
        <OptionEdit
          size='lg'
          option={option}
          onEdit={optionEditFunc => setLocalOptions(draft => optionEditFunc(draft[i]))}
          noScore
          noBonus
        />
      </Grid>
    ))}
    <Grid xs={12}>
      <Button onClick={onSubmit} disabled={!everythingValid}>Сохранить</Button>
    </Grid>
  </>
}

const BottomControlsInner: React.FC<DynamicState> = ({options: options1, options2, showSecond}) => {
  const dispatch = useDispatch()
  const options = showSecond ? options2 : options1
  const allOptionsOpened = options.every(option => option.opened)

  return allOptionsOpened ? (
    <Grid xs={12} display='flex' justifyContent='flex-end'>
      {showSecond ? (
        <NextQuestionButton>Следующий вопрос</NextQuestionButton>
      ) : (
        <Button
          variant='solid'
          color='primary'
          onClick={() => dispatch(switchToQuestion2())}
        >Второй вопрос</Button>
      )}
    </Grid>
  ) : null
}

const BottomControls = dynamicWrapper(BottomControlsInner)
