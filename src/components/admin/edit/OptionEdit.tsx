import styles from './styles.css'
import React from 'react'
import Stack from '@mui/joy/Stack'
import Input from '@mui/joy/Input'
import IconButton from '@mui/joy/IconButton'
import StarBorder from '@mui/icons-material/StarBorder'
import Star from '@mui/icons-material/Star'
import Typography from '@mui/joy/Typography'
import Close from '@mui/icons-material/Close'
import { InputBonus, InputOption } from './types'
import { Attachment } from '../../../store'
import AddAttachment from './AddAttachment'


const OptionEdit: React.FC<{
  option: InputOption
  onEdit: (draftFunction: (draft: InputOption) => void) => void
  placeholder?: string
}> = props => {
  const { option, onEdit, placeholder } = props
  const onBonusEdit = (bonusEditFunc: (draft: InputBonus) => void) => onEdit(draft => bonusEditFunc(draft.bonus!))
  const anyAttachments = option.attachments.length > 0 || (option.bonus && option.bonus.attachments.length > 0)

  return (
    <Stack gap={1}>
      <Stack direction='row' gap={1}>
        <Input
          value={option.value} onChange={e => onEdit(draft => {
            draft.value = e.target.value
          })}
          type='text' placeholder={placeholder} className={styles.optionText}
        />
        <Input
          className={styles.scoreEdit}
          value={option.score}
          onChange={e => onEdit(draft => {
            draft.score = transformInputScore(e.target.value)
          })}
          placeholder='00'
        />
        {option.bonus != null && (
          <Input
            className={styles.bonusEdit}
            value={option.bonus.score}
            onChange={e => onBonusEdit(draft => {
                draft.score = transformInputBonusScore(e.target.value)
            })}
            placeholder='0'
          />
        )}
        <div>
        <AddAttachment onDone={attachment => onEdit(draft => pushAttachment(draft.attachments, attachment))} />
        {option.bonus != null && (
          <AddAttachment
            onDone={attachment => onEdit(draft => {
              if (draft.bonus != null) {
                pushAttachment(draft.bonus.attachments, attachment)
              }
            })}
            small
          />
        )}
        <IconButton onClick={() => onEdit(draft => {
          if (draft.bonus == null) {
            draft.bonus = {score: '1', attachments: []}
          } else {
            delete draft.bonus
          }
        })}>
          {option.bonus == null ? <StarBorder /> : <Star />}
        </IconButton>
        </div>
      </Stack>
      {anyAttachments && (
        <Stack direction='row' gap={1} justifyContent='space-between'>
          <AttachmentsList option={option} onEdit={onEdit} />
          {option.bonus != null && (
            <AttachmentsList option={option.bonus} onEdit={onBonusEdit} />
          )}
        </Stack>
      )}
    </Stack>
  )
}

export default OptionEdit


type AttachmentsListProps = {
  option: {attachments: Attachment[]}
  onEdit?: (draftFunction: (draft: {attachments: Attachment[]}) => void) => void
}
export const AttachmentsList: React.FC<AttachmentsListProps> = ({option, onEdit}) => {
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

export function transformInputScore(value: string) {
  return value.replace(/\D/g, '').substring(0, 2)
}

function transformInputBonusScore(value: string) {
  return transformInputScore(value)
}

function pushAttachment(attachments: Attachment[], attachment: Attachment) {
  if (attachment.type === 'img') {
    attachments.push(attachment)
  } else {
    const targetIndex = attachments.findIndex(a => a.type === 'text') + 1
    attachments.splice(targetIndex, 0, attachment)
  }
}
