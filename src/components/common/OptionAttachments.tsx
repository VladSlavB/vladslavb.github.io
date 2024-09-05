import React from 'react'
import { Attachment } from '../../store'
import AttachmentsList from './AttachmentsList'
import Stack from '@mui/joy/Stack'


type Attachful = {
  attachments: Attachment[]
  bonus?: {
    attachments: Attachment[]
  }
}

type Props = {
  option: Attachful
  onEdit?: (draftFunction: (draft: Attachful) => void) => void
  disabled?: boolean
  disabledBonus?: boolean
}
const OptionAttachments: React.FC<Props> = ({option, onEdit, disabled, disabledBonus}) => {
  const anyAttachments = option.attachments.length > 0 || (option.bonus && option.bonus.attachments.length > 0)
  const onBonusEdit = onEdit != null ? (
    (bonusEditFunc: (draft: {attachments: Attachment[]}) => void) => onEdit(draft => bonusEditFunc(draft.bonus!))
  ) : undefined

  return anyAttachments ? (
    <Stack direction='row' gap={1} justifyContent='space-between'>
      <AttachmentsList option={option} onEdit={onEdit} disabled={disabled} />
      {option.bonus != null && (
        <AttachmentsList option={option.bonus} onEdit={onBonusEdit} disabled={disabledBonus} />
      )}
    </Stack>
  ) : null
}

export default OptionAttachments
