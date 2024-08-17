import React from 'react'
import Typography from '@mui/joy/Typography'
import Close from '@mui/icons-material/Close'
import { Attachment } from '../../store'
import styles from './styles.css'


type Props = {
  option: {attachments: Attachment[]}
  onEdit?: (draftFunction: (draft: {attachments: Attachment[]}) => void) => void
}
const AttachmentsList: React.FC<Props> = ({option, onEdit}) => {
  return (
    <div>
      {option.attachments.map((attachment, i) => {
        const deleter = onEdit && (
          <div
            className={styles.close}
            onClick={() => onEdit(draft => {draft.attachments.splice(i, 1)})}
          >
            <Close fontSize='small' />
          </div>
        )
        return (
          attachment.type === 'img' ? (
            <div className={styles.imgWrapper}>
              <img src={attachment.url} className={styles.image} height={80} />
              {deleter}
            </div>
          ) : (
            <Typography
              className={styles.text}
              level='body-xs' variant='outlined' color='warning'
            >
              {attachment.text}
              {deleter}
            </Typography>
          )
        )
      })}
    </div>
  )
}

export default AttachmentsList
