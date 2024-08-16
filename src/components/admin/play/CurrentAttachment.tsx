import React from 'react'
import Stack from "@mui/joy/Stack"
import { toggleAttachmentVisibility, useDispatch, useGameSelector, useSelector } from "../../../store"
import { AttachmentComponent } from "./QuestionItem"
import Button from "@mui/joy/Button"
import styles from './styles.css'


const CurrentAttachment: React.FC = () => {
  const dispatch = useDispatch()
  const currentAttachment = useGameSelector(game => game.currentAttachment)
  const attachmentShown = useSelector(state => state.visibility.attachment)

  return currentAttachment ? (
    <Stack direction='row' gap={2} alignItems='center'>
      <AttachmentComponent {...currentAttachment} />
      <VisibilityButton
        variant='soft' size='lg'
        onClick={() => dispatch(toggleAttachmentVisibility())}
        hideText='Скрыть'
        showText='Показать'
        visible={attachmentShown}
      />
    </Stack>
  ) : null
}

export default CurrentAttachment

const VisibilityButton: React.FC<{
  visible: boolean
  showText: string
  hideText: string
} & React.ComponentProps<typeof Button>> = props => {
  let { visible, hideText, showText, className, ...restProps } = props
  if (visible) className += ' ' + styles.hideButton
  return <>
    {visible && <div className={styles.overlay} />}
    <Button className={className} {...restProps}>
      {visible ? hideText : showText}
    </Button>
  </>
}
