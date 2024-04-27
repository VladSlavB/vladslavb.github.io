import styles from './styles.css'
import React, { useState } from 'react'
import Stack from '@mui/joy/Stack'
import Input from '@mui/joy/Input'
import IconButton from '@mui/joy/IconButton'
import StarBorder from '@mui/icons-material/StarBorder'
import Star from '@mui/icons-material/Star'
import Typography from '@mui/joy/Typography'
import Close from '@mui/icons-material/Close'
import { InputBonus, InputOption } from "./types"
// import NewAttachment, { AttachmentModalProvider } from './NewAttachment'
import Tooltip from '@mui/joy/Tooltip'
import ButtonGroup from '@mui/joy/ButtonGroup'
import ImageOutlined from '@mui/icons-material/ImageOutlined'
import TextFields from '@mui/icons-material/TextFields'
import Modal from './Modal'
import { Attachment } from '../../../store'
import Chip from '@mui/joy/Chip'


const OptionEdit: React.FC<{
  option: InputOption
  onEdit: (draftFunction: (draft: InputOption) => void) => void
  placeholder?: string
}> = props => {
  const { option, onEdit, placeholder } = props
  const { buttons, modal, attachment } = useAttachments(option, onEdit)
  return (
    <div>
      <Tooltip 
        placement='right' variant='outlined' arrow disableFocusListener
        title={
          <ButtonGroup variant='plain'>
            {...buttons}
            <IconButton onClick={() => onEdit(draft => {
              if (draft.bonus == null) {
                draft.bonus = {score: '1'}
              } else {
                delete draft.bonus
              }
            })}>
              {option.bonus == null ? <StarBorder /> : <Star />}
            </IconButton>
          </ButtonGroup>
        }
      >
        <Stack direction='row'>
          <Input
            value={option.value} onChange={e => onEdit(draft => {
              draft.value = e.target.value
            })}
            onBlur={() => onEdit(draft => {draft.checkValue = true})}
            error={option.checkValue && !validateOptionValue(option.value)}
            type='text' placeholder={placeholder} className={styles.optionText}
          />
            <Input
              className={styles.scoreEdit}
              value={option.score}
              onChange={e => onEdit(draft => {
                draft.score = transformInputScore(e.target.value)
              })}
              onBlur={() => onEdit(draft => {draft.checkScore = true})}
              error={option.checkScore && !validateScore(option.score)}
              placeholder='00'
            />
        </Stack>
      </Tooltip>
      <div className={styles.optionExtra}>
        <div className={styles.attachmentsContainer}>
          {attachment}
        </div>
        <div className={styles.bonusContainer}>
          {option.bonus != null && (
            <BonusEdit
              bonus={option.bonus}
              onEdit={bonusEditFunc => onEdit(draft => bonusEditFunc(draft.bonus!))}
              onDelete={() => onEdit(draft => {delete draft.bonus})}
            />
          )}
        </div>
      </div>
      {modal}
    </div>
  )
}

export default OptionEdit

export const BonusEdit: React.FC<{
  bonus: InputBonus
  onEdit:  (draftFunction: (draft: InputBonus) => void) => void
  onDelete: () => void
}> = props => {
  const { onEdit, onDelete, bonus } = props
  const { buttons, modal, attachment } = useAttachments(bonus, onEdit)

  return <>
    <Tooltip arrow variant='outlined' placement='right' title={
      <ButtonGroup variant='plain'>
        {...buttons}
        <IconButton size='sm' onClick={onDelete}>
          <Close fontSize='small' />
        </IconButton>
      </ButtonGroup>
    }>
      <Stack direction='row' className={styles.bonus}>
        <Typography alignSelf='center' fontSize='small'>Бонус</Typography>
        <Input
          size='sm' className={styles.bonusEdit}
          value={bonus.score}
          onChange={e => onEdit(draft => {
              draft.score = transformInputBonusScore(e.target.value)
          })}
          onBlur={() => onEdit(draft => {draft.check = true})}
          error={bonus.check && !validateScore(bonus.score)}
          placeholder='0'
        />
      </Stack>
    </Tooltip>
    {attachment}
    {modal}
  </>
}

function useAttachments(
  option: {attachment?: Attachment},
  onEdit: (draftFunction: (draft: {attachment?: Attachment}) => void) => void
) {
  const [ modalType, setModalType ] = useState<Attachment['type']>()
  const buttons = [
    <IconButton onClick={() => setModalType('img')}><ImageOutlined /></IconButton>,
    <IconButton onClick={() => setModalType('text')}><TextFields /></IconButton>
  ]
  const modal = (
    <Modal
      initial={option.attachment}
      open={modalType != null} onClose={() => setModalType(undefined)}
      type={modalType}
      onDone={attachment => onEdit(draft => {draft.attachment = attachment})}
    />
  )
  const deleter = (
    <div
      className={styles.close}
      onClick={() => onEdit(draft => {delete draft.attachment})}
    >
      <Close fontSize='small' />
    </div>
  )
  const attachment = option.attachment && (option.attachment.type === 'img' ? (
    <div className={styles.imgWrapper}>
      <img src={option.attachment.url} className={styles.image} />
      {deleter}
    </div>
  ) : (
    <div className={styles.text}>{option.attachment.text}{deleter}</div>
  ))
  return {buttons, modal, attachment}
}

function transformInputScore(value: string) {
  return value.replace(/\D/g, '').substring(0, 2)
}

function transformInputBonusScore(value: string) {
  return value.replace(/\D/g, '').substring(0, 1)
}

const validateOptionValue = (value: string) => value.trim() !== ''
const validateScore = (score: string) => parseInt(score) > 0
