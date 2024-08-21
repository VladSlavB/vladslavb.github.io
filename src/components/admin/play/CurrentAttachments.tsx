import React from 'react'
import { QuestionName, deleteAttachment, toggleAttachment, useDispatch, useSelector } from '../../../store'
import AttachmentsList from '../../common/AttachmentsList'
import styles from './styles.css'


const CurrentAttachments: React.FC = () => {
  const attachments = useSelector(state => {
    const game = state.game.present
    const question = state.questions[game.currentQuestion]
    const coordinates = game.currentAttachments
    if (coordinates != null) {
      if (question.name !== QuestionName.dynamic) {
        const option = question.options[coordinates.optionIndex]
        if (coordinates.bonus) {
          return option.bonus?.attachments
        } else {
          return option.attachments
        }
      } else if (game.q?.type === 'dynamic') { // always true
        const options = coordinates.secondGroup ? game.q.options2 : game.q.options
        return options[coordinates.optionIndex].attachments
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
