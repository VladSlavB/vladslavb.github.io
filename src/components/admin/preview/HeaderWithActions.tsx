import React from 'react'
import styles from './styles.css'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import Edit from '@mui/icons-material/Edit'
import Delete from '@mui/icons-material/Delete'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Visibility from '@mui/icons-material/Visibility'
import { useDispatch, useSelector, toggleQuestion, useGameSelector } from '../../../store'
import IconButton from '@mui/joy/IconButton'


type Props = {
  header: string
  dim?: boolean
  onEdit?: () => void
  onDelete?: () => void
  showActions?: boolean
  disableDelete?: boolean
}

const HeaderWithActions: React.FC<Props> = ({header, dim, onEdit, onDelete, showActions, disableDelete}) => (
  <div className={styles.header}>
    <QuestionHeader header={header} dim={dim} />
    {showActions && (
      <div className={styles.actions}>
        <Button onClick={onEdit} variant='plain' size='sm'><Edit /></Button>
        {!disableDelete && (
          <Button
            onClick={() => {
              if (confirm(`Удалить "${header}"?`)) {
                onDelete?.()
              }
            }}
            variant='plain' color='danger' size='sm'
          >
            <Delete />
          </Button>
        )}
      </div>
    )}
  </div>
)

export default HeaderWithActions

const QuestionHeader = ({header, dim}: {header: string, dim?: boolean}) => {
  const questionHidden = useSelector(state => state.visibility.questionHidden)
  const roundStarted = useGameSelector(game => game.roundStarted)
  const dispatch = useDispatch()
  return (
    <Typography
      level='title-lg'
      flexGrow={1}
      whiteSpace='pre-wrap'
      color={dim || questionHidden ? 'neutral' : undefined}
    >{header}
      {roundStarted && (
        <IconButton onClick={() => dispatch(toggleQuestion())} size='sm' style={{verticalAlign: 'middle'}}>
          {questionHidden ? <Visibility /> : <VisibilityOff />}
        </IconButton>
      )}
    </Typography>
  )
}
