import styles from './styles.css'
import React from 'react'
import Stack from '@mui/joy/Stack'
import Input from '@mui/joy/Input'
import IconButton from '@mui/joy/IconButton'
import StarBorder from '@mui/icons-material/StarBorder'
import Typography from '@mui/joy/Typography'
import Close from '@mui/icons-material/Close'
import { InputOption } from "./types"
import NewAttachment from './NewAttachment'


const OptionEdit: React.FC<{
  option: InputOption
  onEdit: (draftFunction: (draft: InputOption) => void) => void
  placeholder?: string
}> = props => {
  const { option, onEdit, placeholder } = props
  return (
    <div>
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
        <NewAttachment />
        {option.bonus == null && (
          <IconButton onClick={() => onEdit(draft => {
            draft.bonus = {score: '1'}
          })}>
            <StarBorder />
          </IconButton>
        )}
      </Stack>
      <div className={styles.optionExtra}>
        <div className={styles.attachments}></div>
        <div className={styles.bonus}>
          {option.bonus != null && (
            <Stack direction='row'>
              <Typography alignSelf='center' fontSize='small'>Бонус</Typography>
              <Input
                size='sm' className={styles.bonusEdit}
                value={option.bonus.score}
                onChange={e => onEdit(draft => {
                  if (draft.bonus != null) {
                    draft.bonus.score = transformInputBonusScore(e.target.value)
                  }
                })}
                onBlur={() => onEdit(draft => {
                  if (draft.bonus != null) {
                    draft.bonus.check = true
                  }
                })}
                error={option.bonus.check && !validateScore(option.bonus.score)}
                placeholder='0'
              />
              <NewAttachment size='sm' />
              <IconButton size='sm' onClick={() => onEdit(draft => {delete draft.bonus})}>
                <Close fontSize='small' />
              </IconButton>
            </Stack>
          )}
        </div>
      </div>
    </div>
  )
}

export default OptionEdit

function transformInputScore(value: string) {
  return value.replace(/\D/g, '').substring(0, 2)
}

function transformInputBonusScore(value: string) {
  return value.replace(/\D/g, '').substring(0, 1)
}

const validateOptionValue = (value: string) => value.trim() !== ''
const validateScore = (score: string) => parseInt(score) > 0
