import React from 'react'
import { QuestionName, toggleAttachment, useDispatch, useSelector } from '../../../store'
import AttachmentsList from '../../common/AttachmentsList'
import styles from './styles.css'


const CurrentAttachments: React.FC = () => {
  const attachments = useSelector(state => {
    const game = state.game.present
    const coordinates = game.currentAttachments
    if (coordinates != null) {
      if (state.finale != null && game.finale && game.q?.type === 'finale' && coordinates?.teamIndex != null) {
        return game.q.options[coordinates.teamIndex][coordinates.optionIndex].attachments
      } else {
        const question = state.questions[game.currentQuestion]
        if (question.name !== QuestionName.dynamic) {
          const option = question.options[coordinates.optionIndex]
          if (coordinates.bonus) {
            return option.bonus?.attachments
          } else {
            return option.attachments
          }
        } else if (game.q?.type === 'dynamic') { // always true
          const options = game.q.options
          return options[coordinates.optionIndex].attachments
        }
      }
    }
  })
  const dispatch = useDispatch()

  if (!attachments?.length) return null
  return (
    <div>
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
