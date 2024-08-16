import styles from './styles.css'
import React from 'react'
import { Attachment, removeQuestion, useDispatch, useSelector, QuestionName } from '../../../store'
import Card from '@mui/joy/Card'
import Typography from '@mui/joy/Typography'
import Stack from '@mui/joy/Stack'
import HeaderWithActions from './HeaderWithActions'
import Chip from '@mui/joy/Chip'
import { AttachmentsList } from '../edit/OptionEdit'

type Props = {
  index: number
  onEdit: () => void
  canEdit?: boolean
}

const QuestionPreview: React.FC<Props> = ({index, onEdit, canEdit}) => {
  const question = useSelector(state => state.questions[index])
  const dispatch = useDispatch()

  return (
    <Card variant="outlined">
      <Stack>
        <HeaderWithActions
          header={question.value}
          onEdit={onEdit}
          onDelete={() => dispatch(removeQuestion(index))}
          showActions={canEdit}
        />
        {question.name === QuestionName.dynamic && (
          <HeaderWithActions header={question.value2} />
        )}
        <Chip variant='outlined' color='primary' className={styles.chip}>{question.name}</Chip>
        {question.name !== QuestionName.dynamic ? (
          <ul className={styles.previewOptions}>
            {question.options.map(option => {
              const anyAttachments = option.attachments.length > 0 || (option.bonus && option.bonus.attachments.length > 0)
              return (
                <li>
                  <Stack direction='row'>
                    {option.value}
                    <div className={styles.dots} />
                    <b>{option.score}{option.bonus && `+${option.bonus.score}`}</b>
                  </Stack>
                  {anyAttachments && (
                    <Stack direction='row' gap={1} justifyContent='space-between'>
                      <AttachmentsList option={option} />
                      {option.bonus != null && (
                        <AttachmentsList option={option.bonus} />
                      )}
                    </Stack>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          null
        )}
      </Stack>
    </Card>
  )
}

export default QuestionPreview



export const AttachmentComponent: React.FC<Attachment> = attachment => (
  attachment.type === 'img' ? (
    <div className={styles.imgWrapper}>
      <img src={attachment.url} className={styles.image} height={80} />
    </div>
  ) : (
    <Typography className={styles.text}
      level='body-xs' variant='outlined' color='warning'
    >
      {attachment.text}
    </Typography>
  )
)
