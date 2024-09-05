import React from 'react'
import Typography from '@mui/joy/Typography'
import Close from '@mui/icons-material/Close'
import { Attachment } from '../../store'
import styles from './styles.css'


type Props = {
  option: {attachments: Attachment[]}
  onEdit?: (draftFunction: (draft: {attachments: Attachment[]}) => void) => void
  onClick?: (attachment: Attachment) => void
  disabled?: boolean
}
const AttachmentsList: React.FC<Props> = ({option, onEdit, onClick, disabled}) => {
  return (
    <div className={onClick != null ? styles.clickable : undefined}>
      {option.attachments.map((attachment, i) => {
        const deleter = !disabled && onEdit && (
          <div
            className={styles.close}
            onClick={() => onEdit(draft => {draft.attachments.splice(i, 1)})}
          >
            <Close fontSize='small' />
          </div>
        )
        return (
          attachment.type === 'img' ? (
            <div className={styles.imgWrapper} key={i}>
              <img src={attachment.url} className={styles.image} onClick={() => onClick?.(attachment)} />
              {deleter}
            </div>
          ) : (
            <span>
              <Typography
                className={styles.text}
                level='body-xs' variant='outlined' color='warning'
                key={i}
                onClick={() => onClick?.(attachment)}
              >
                {attachment.text}
                {deleter}
              </Typography>
            </span>
          )
        )
      })}
    </div>
  )
}

export default AttachmentsList
