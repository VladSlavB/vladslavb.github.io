import React, { useEffect, useRef, useState } from 'react'
import { Attachment } from '../../../store'
import Tooltip from '@mui/joy/Tooltip'
import Textarea from '@mui/joy/Textarea'
import IconButton from '@mui/joy/IconButton'
import AddLink from '@mui/icons-material/AddLink'
import CircularProgress from '@mui/joy/CircularProgress'
import Button from '@mui/joy/Button'
import Stack from '@mui/joy/Stack'


type Props = {
  onDone: (_: Attachment) => void
  small?: boolean
}
const AddAttachment: React.FC<Props> = ({onDone, small}) => {
  const [ tooltipOpen, setTooltipOpen ] = useState(false)
  const [ input, setInput ] = useState('')
  const [ loading, setLoading ] = useState(false)
  const tooltipRef = useRef<HTMLFormElement>(null)
  const buttonRef = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        tooltipRef.current?.contains(e.target as any) === false &&
        buttonRef.current?.contains(e.target as any) === false
      ) {
        setTooltipOpen(false)
      }
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [])

  function cleanUp() {
    setLoading(false)
    setInput('')
    setTooltipOpen(false)
  }

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newValue = e.target.value
    setInput(newValue)
    if (isUrlLike(newValue)) {
      setLoading(true)
      const img = new Image()
      img.onload = () => {
        cleanUp()
        onDone({type: 'img', url: newValue})
      }
      img.onerror = () => setLoading(false)
      img.src = newValue
    } else {
      setLoading(false)
    }
  }

  function onSubmit() {
    cleanUp()
    onDone({type: 'text', text: input})
  }

  return (
    <Tooltip
      arrow
      variant='outlined'
      disableHoverListener
      disableFocusListener
      open={tooltipOpen}
      title={
        <Stack gap={1} component='form' ref={tooltipRef}>
          <Textarea
            autoFocus
            value={input}
            onChange={onChange}
            onKeyDown={e => e.ctrlKey && e.code === 'Enter' && onSubmit()}
            placeholder={'Текст или URL картинки'}
            endDecorator={loading ? <CircularProgress /> : undefined}
          />
          {!isUrlLike(input) && input != '' && (
            <Button onClick={onSubmit}>Готово (Ctrl + Enter)</Button>
          )}
        </Stack>
      }
    >
      <IconButton
        ref={buttonRef}
        variant={tooltipOpen ? 'solid' : 'plain'}
        onClick={e => setTooltipOpen(!tooltipOpen)}
        size={small ? 'sm' : undefined}
      >
        <AddLink />
      </IconButton>
    </Tooltip>
  )
}

export default AddAttachment

function isUrlLike(s: string) {
  return s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:image')
}
