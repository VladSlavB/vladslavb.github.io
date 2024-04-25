import React, { useState } from 'react'
import DialogContent from '@mui/joy/DialogContent'
import DialogActions from '@mui/joy/DialogActions'
import Modal from '@mui/joy/Modal'
import ModalDialog from '@mui/joy/ModalDialog'
import Button from '@mui/joy/Button'


let globalResolve = (_: boolean) => {}
let globalOpenDialog = () => {}

const ConfirmBonusDialog: React.FC = () => {
  const [ open, setOpen ] = useState(false)
  globalOpenDialog = () => setOpen(true)

  return (
    <Modal open={open}>
      <ModalDialog>
        <DialogContent>
          Команда правильно ответила на допвопрос?
        </DialogContent>
        <DialogActions>
          <Button color='success' onClick={() => {
            globalResolve(true)
            setOpen(false)
          }}>
            Да
          </Button>
          <Button color='danger' onClick={() => {
            globalResolve(false)
            setOpen(false)
          }}>
            Нет
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  )
}

export default ConfirmBonusDialog

export function confirmBonusDialog() {
  globalOpenDialog()
  return new Promise<boolean>(resolve => globalResolve = resolve)
}
