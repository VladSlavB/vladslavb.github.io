import styles from './styles.css'
import React from 'react'
import Stack from '@mui/joy/Stack'
import Input from '@mui/joy/Input'
import IconButton from '@mui/joy/IconButton'
import StarBorder from '@mui/icons-material/StarBorder'
import Star from '@mui/icons-material/Star'
import { InputBonus, InputOption } from './types'
import { Attachment } from '../../../store'
import AddAttachment from './AddAttachment'
import OptionAttachments from '../../common/OptionAttachments'


type NoScoreInputOption = Omit<InputOption, 'score'>
type Props = {
  placeholder?: string
  size?: 'lg'
  noBonus?: boolean
  onBlur?: () => void
  disableScoreAndBonus?: boolean
  disabled?: boolean
} & ({
  option: InputOption
  onEdit: (draftFunction: (draft: InputOption) => void) => void
  noScore?: false
} | {
  option: NoScoreInputOption
  onEdit: (draftFunction: (draft: NoScoreInputOption) => void) => void
  noScore: true
})
const OptionEdit: React.FC<Props> = ({option, onEdit, onBlur, placeholder, size, noScore, noBonus, disableScoreAndBonus, disabled}) => {
  const onBonusEdit = (bonusEditFunc: (draft: InputBonus) => void) => onEdit(draft => bonusEditFunc(draft.bonus!))

  return (
    <Stack gap={1}>
      <Stack direction='row' gap={1}>
        <Input
          size={size}
          value={option.value}
          onChange={e => onEdit(draft => {
            draft.value = e.target.value
          })}
          onBlur={onBlur}
          placeholder={placeholder}
          className={styles.optionText}
          disabled={disabled}
        />
        {!noScore && (
          <Input
            size={size}
            className={styles.scoreEdit}
            value={option.score}
            onChange={e => onEdit(draft => {
              draft.score = transformInputScore(e.target.value)
            })}
            onBlur={onBlur}
            placeholder='00'
            disabled={disableScoreAndBonus || disabled}
          />
        )}
        {option.bonus != null && (
          <Input
            size={size}
            className={styles.bonusEdit}
            value={option.bonus.score}
            onChange={e => onBonusEdit(draft => {
              draft.score = transformInputBonusScore(e.target.value)
            })}
            onBlur={onBlur}
            placeholder='0'
            disabled={disableScoreAndBonus || disabled}
          />
        )}
        <div>
          <AddAttachment
            onDone={attachment => onEdit(draft => pushAttachment(draft.attachments, attachment))}
            size={size}
            disabled={disabled}
          />
          {option.bonus != null && (
            <AddAttachment
              onDone={attachment => onEdit(draft => {
                if (draft.bonus != null) {
                  pushAttachment(draft.bonus.attachments, attachment)
                }
              })}
              bonus
              disabled={disabled}
            />
          )}
          {!noBonus && (
            <IconButton
              onClick={() => onEdit(draft => {
                if (draft.bonus == null) {
                  draft.bonus = {score: '1', attachments: []}
                } else {
                  delete draft.bonus
                }
              })}
              disabled={disableScoreAndBonus}
            >
              {option.bonus == null ? <StarBorder /> : <Star />}
            </IconButton>
          )}
        </div>
      </Stack>
      <OptionAttachments option={option} onEdit={disabled ? undefined : onEdit} />
    </Stack>
  )
}

export default OptionEdit




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
