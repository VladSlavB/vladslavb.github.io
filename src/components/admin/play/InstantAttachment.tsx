import React from 'react'
import { deleteAttachment, showAttachment, useDispatch, useSelector } from '../../../store'
import AddAttachment from '../edit/AddAttachment'
import IconButton from '@mui/joy/IconButton'
import Close from '@mui/icons-material/Close'


const InstantAttachment: React.FC = () => {
  const shown = useSelector(state => state.visibility.attachment != null)
  const dispatch = useDispatch()
  return shown ? (
    <IconButton onClick={() => dispatch(deleteAttachment())}><Close /></IconButton>
  ) : (
    <AddAttachment onDone={attachment => dispatch(showAttachment(attachment))} />
  )
}

export default InstantAttachment
