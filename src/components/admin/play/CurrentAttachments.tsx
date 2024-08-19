import React from 'react'
import { QuestionName, deleteAttachment, toggleAttachment, useDispatch, useGameSelector, useSelector } from '../../../store'
import AttachmentsList from '../../common/AttachmentsList'
import styles from './styles.css'


const CurrentAttachments: React.FC = () => {
  const attachments = useSelector(state => {
    const question = state.questions[state.game.present.currentQuestion]
    if (question.name !== QuestionName.dynamic) {
      const coordinates = state.game.present.currentAttachments
      if (coordinates != null) {
        const option = question.options[coordinates.optionIndex]
        if (coordinates.bonus) {
          return option.bonus?.attachments
        } else {
          return option.attachments
        }
      }
    }
  })
  const dispatch = useDispatch()
  const showOverlay = useSelector(state => state.visibility.attachment != null)

  if (!attachments?.length) return null
  return (
    <div>
      {showOverlay && <div className={styles.overlay} onClick={() => dispatch(deleteAttachment())} />}
      <div className={styles.attachments}>
        <AttachmentsList
          option={{attachments}}
          onClick={attachment => dispatch(toggleAttachment(attachment))}
        />
      </div>
    </div>
  )
}

export default CurrentAttachments
