import styles from './styles.css'
import React, { useState } from 'react'
import { Attachment } from '../../../store'
import ModalJoy from '@mui/joy/Modal'
import ModalDialog from '@mui/joy/ModalDialog'
import FormControl from '@mui/joy/FormControl'
import FormHelperText from '@mui/joy/FormHelperText'
import Input from '@mui/joy/Input'
import Textarea from '@mui/joy/Textarea'
import Button from '@mui/joy/Button'
import DialogContent from '@mui/joy/DialogContent'
import DialogActions from '@mui/joy/DialogActions'
import LinearProgress from '@mui/joy/LinearProgress'

type Props = {
  type?: Attachment['type']
  open: boolean
  onDone: (result: Attachment) => void
  onClose: () => void
}

const Modal: React.FC<Props> = ({open, onClose, type, onDone}) => {
  
  return (
    <ModalJoy open={open} onClose={onClose}>
      <ModalDialog>
        {type === 'img' ? (
          <ImageForm onDone={url => {
            onDone({type: 'img', url})
            onClose()
          }} />
        ) : (
          <TextForm onDone={text => {
            onDone({type: 'text', text})
            onClose()
          }} />
        )}
      </ModalDialog>
    </ModalJoy>
  )
}

export default Modal


const ImageForm: React.FC<{onDone: (url: string) => void}> = props => {
  const [ value, setValue ] = useState('')
  const [ loaded, setLoaded ] = useState(true)
  const [ error, setError ] = useState(true)
  return <>
    <DialogContent>
      <FormControl>
        <Input value={value} onChange={e => {
          if (loaded) {
            setLoaded(false)
            const url = e.target.value
            setValue(url)
            const image = new Image()
            image.onload = () => {setLoaded(true); setError(false)}
            image.onerror = () => {setLoaded(true); setError(true)}
            image.src = url
          }
        }} autoFocus />
        <FormHelperText>Ссылка на изображение</FormHelperText>
        {value != '' && (loaded ? (
        <img src={value} className={error ? undefined : styles.image} />
        ) : <LinearProgress />)}
      </FormControl>
    </DialogContent>
    <DialogActions>
      <Button color='success' disabled={!loaded || error} onClick={() => props.onDone(value)}>Готово</Button>
    </DialogActions>
  </>
}

const TextForm: React.FC<{onDone: (text: string) => void}> = props => {
  const [ value, setValue ] = useState('')
  return <>
    <DialogContent>
      <Textarea value={value} onChange={e => setValue(e.target.value)} autoFocus />
    </DialogContent>
    <DialogActions>
      <Button color='success' disabled={value === ''} onClick={() => props.onDone(value)}>Готово</Button>
    </DialogActions>
  </>
}
