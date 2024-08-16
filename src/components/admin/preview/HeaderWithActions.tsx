import React from 'react'
import styles from './styles.css'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import Edit from '@mui/icons-material/Edit'
import Delete from '@mui/icons-material/Delete'


type Props = {
  header: string
  dim?: boolean
  onEdit?: () => void
  onDelete?: () => void
  showActions?: boolean
}

const HeaderWithActions: React.FC<Props> = ({header, dim, onEdit, onDelete, showActions}) => (
  <div className={styles.header}>
    <Typography
      level='title-lg'
      flexGrow={1}
      whiteSpace='pre-wrap'
      color={dim ? 'neutral' : undefined}
    >{header}</Typography>
    {showActions && (
      <div className={styles.actions}>
        <Button onClick={onEdit} variant='plain' size='sm'><Edit /></Button>
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
      </div>
    )}
  </div>
)

export default HeaderWithActions
