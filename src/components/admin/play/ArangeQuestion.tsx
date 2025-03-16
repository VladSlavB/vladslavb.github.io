import React, { useState } from 'react'
import { ArangeOption, ArangeQuestion, ArangeState, chooseAranger, openArangeOption, openDynamicOption, setOptions, setProposedIndex, showOptions, startEditing, startEditingDynamicOptions, startRound, startTruthReveal, useDispatch, useGameSelector, useSelector } from '../../../store'
import { useAutoScroll } from '../scroll'
import Card from '@mui/joy/Card'
import Typography from '@mui/joy/Typography'
import Grid from '@mui/joy/Grid'
import Button from '@mui/joy/Button'
import ButtonGroup from '@mui/joy/ButtonGroup'
import IconButton from '@mui/joy/IconButton'
import styles from './styles.css'
import CurrentAttachments from './CurrentAttachments'
import { hitAnimation } from '../../game/Teams'
import NextQuestionButton from './NextQuestionButton'
import HeaderWithActions from '../preview/HeaderWithActions'
import Stack from '@mui/joy/Stack'
import Sheet from '@mui/joy/Sheet'
import Undo from '@mui/icons-material/Undo'
import DragIndicator from '@mui/icons-material/DragIndicator'
import TwoColumns from '../../common/TwoColumns'


type WrapperProps = {
  question: ArangeQuestion
}
type Props = WrapperProps & ArangeState
const ArangeQuestion: React.FC<Props> = ({question, currentTeam, optionsShown, leftTeam, rightTeam, revealTruth, options: optionsState}) => {
  const ref = useAutoScroll()
  const dispatch = useDispatch()
  const index = useGameSelector(game => game.currentQuestion)
  const editorStateView = useSelector(state => state.editor.mode === 'view')
  const roundStarted = useGameSelector(game => game.roundStarted)
  const currentOrder = currentTeam == 'leftTeam' ? leftTeam.order : rightTeam.order

  return (
    <Card variant='soft' ref={ref}>
      <Grid container columnSpacing={4} rowSpacing={2}>
        <Grid xs={12}>
          <HeaderWithActions
            header={question.value}
            onEdit={() => dispatch(startEditing(index))}
            showActions={editorStateView}
            disableDelete
          />
        </Grid>
        {!revealTruth ? (
          optionsShown && roundStarted ? <OptionsAranger order={currentOrder} options={question.options} /> : null
        ) : (
          <Grid xs={12}>
            <div className={styles.options}>
              {question.options.map((option, i) => (
                <Button
                  key={i}
                  fullWidth
                  variant='plain'
                  color='neutral'
                  onClick={() => dispatch(openArangeOption({index: i}))}
                  size='lg'
                  disabled={optionsState[i].opened}
                >
                  {i + 1}. {option.value}
                </Button>
              ))}
            </div>
          </Grid>
        )}
        <Grid xs={12}><CurrentAttachments /></Grid>
        <BottomControls />
      </Grid>
    </Card>
  )
}

const OptionsAranger: React.FC<{order: (number | null)[], options: ArangeOption[]}> = ({order, options}) => {
  const vacantOptions = options.map((option, i) => !order.includes(i) ? option : null)
  const placedOptions = order.map(i => i != null ? options[i] : null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const dispatch = useDispatch()
  return <>
    <Grid xs={6}>
      <Stack flexGrow={1} spacing={1}>
        {vacantOptions.map((option, i) => option != null ? (
          <Sheet
            className={styles.arangeOption + ' ' + styles.draggable}
            variant={draggedIndex === i ? 'soft' : 'plain'}
            color='neutral'
            key={i}
            draggable={true}
            onDragStart={e => {
              e.dataTransfer.dropEffect = 'move'
              setDraggedIndex(i)
            }}
            onDragEnd={() => setDraggedIndex(null)}
          >
            <Stack direction='row' justifyContent='space-between' alignItems='center'>
              <Typography>{option.value}</Typography>
              <DragIndicator fontSize='small' />
            </Stack>
          </Sheet>
        ) : (
          <div key={i} className={styles.arangeOption + ' ' + styles.empty}>&nbsp;</div>
        ))}
      </Stack>
    </Grid>
    <Grid xs={6}>
      <Stack flexGrow={1} spacing={1}>
        {placedOptions.map((option, i) => option != null ? (
          <Sheet key={i} variant='plain' color='neutral' className={styles.arangeOption}>
            <Stack direction='row' justifyContent='space-between' alignItems='center'>
              <Typography>{i + 1}. {option.value}</Typography>
              <IconButton sx={{m: -1}} onClick={() => dispatch(setProposedIndex({indexKey: i, indexValue: null}))}>
                <Undo />
              </IconButton>
            </Stack>
          </Sheet>
        ) : (
          <div
            key={i}
            className={styles.dropArea + (hoveredIndex == i ? ' ' + styles.hovered : '')}
            onDragOver={e => {
              e.preventDefault()
              setHoveredIndex(i)
            }}
            onDragLeave={() => setHoveredIndex(null)}
            onDrop={e => {
              dispatch(setProposedIndex({indexKey: i, indexValue: draggedIndex}))
              setHoveredIndex(null)
              setDraggedIndex(null)
            }}>{i + 1}</div>
        ))}
      </Stack>
    </Grid>
  </>
}

export default arangeWrapper(ArangeQuestion)

function arangeWrapper<P>(Component: React.FC<P & ArangeState>): React.FC<P> {
  return props => {
    const q = useGameSelector(state => state.q)
    if (q?.type !== 'arange') return null
    return <Component {...props} {...q} />
  }
}

const BottomControlsInner: React.FC<ArangeState> = ({optionsShown, currentTeam, revealTruth, leftTeam, rightTeam, options}) => {
  const roundStarted = useGameSelector(game => game.roundStarted)
  const dispatch = useDispatch()
  const leftTeamFinished = leftTeam.order.every(i => i != null)
  const rightTeamFinished = rightTeam.order.every(i => i != null)
  const currentFinished = currentTeam == 'leftTeam' ? leftTeamFinished : rightTeamFinished
  const bothFinished = leftTeamFinished && rightTeamFinished
  const allOptionsOpened = options.every(option => option.opened)
  console.log(allOptionsOpened)

  return (
    <Grid xs={12} display='flex' justifyContent='space-between' alignItems='center'>
      {currentTeam != null && !revealTruth ? (
        <Typography color={currentTeam == 'leftTeam' ? 'primary' : 'danger'}>
          Ходят {currentTeam == 'leftTeam' ? 'синие' : 'красные'}
        </Typography>
      ) : <span />}
      {currentTeam == null ? (
        <Stack direction='row' spacing={2} alignItems='center'>
          <Typography>Кто первый ходит?</Typography>
          <ButtonGroup>
            <Button
              variant='outlined'
              color='primary'
              onClick={() => dispatch(chooseAranger({team: 'leftTeam'}))}
            >Синие</Button>
            <Button
              variant='outlined'
              color='danger'
              onClick={() => dispatch(chooseAranger({team: 'rightTeam'}))}
            >Красные</Button>
          </ButtonGroup>
        </Stack>
      ) : !optionsShown ? (
        <Button
          variant='solid'
          color='primary'
          onClick={() => dispatch(showOptions())}
        >Показать ячейки</Button>
      ) : !roundStarted ? (
        <Button
          variant='solid'
          color='primary'
          onClick={() => dispatch(startRound())}
        >Показать вопрос</Button>
      ) : revealTruth ? (
        allOptionsOpened ? (
          <NextQuestionButton />
        ) : null
      ) : bothFinished ? (
        <Button
          variant='solid'
          color='primary'
          onClick={() => dispatch(startTruthReveal())}
        >Показать правильный порядок</Button>
      ) : currentFinished ? (
        <Button
          variant='solid'
          color='primary'
          onClick={() => dispatch(chooseAranger({team: currentTeam == 'leftTeam' ? 'rightTeam' : 'leftTeam'}))}
        >Ход следующей команды</Button>
      ) : null}
    </Grid>
  )
}

const BottomControls = arangeWrapper(BottomControlsInner)
