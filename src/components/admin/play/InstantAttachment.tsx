import React, { useState } from 'react'
import ButtonGroup from '@mui/joy/ButtonGroup'
import { useDispatch } from '../../../store'
import Button from '@mui/joy/Button'
import ImageOutlined from '@mui/icons-material/ImageOutlined'
import TextFields from '@mui/icons-material/TextFields'
import styles from './styles.css'


const InstantAttachment: React.FC = () => {
  // TODO
  return null
  // const [ modalType, setModalType ] = useState<'img' | 'text' | undefined>(undefined)
  // const dispatch = useDispatch()
  // return <>
  //   <ButtonGroup className={styles.outlined}>
  //     <Button onClick={() => setModalType('img')}><ImageOutlined /></Button>
  //     <Button onClick={() => setModalType('text')}><TextFields /></Button>
  //   </ButtonGroup>
  //   <Modal
  //     open={modalType != null} onClose={() => {
  //       setModalType(undefined)
  //       dispatch(deleteInstantAttachment())
  //     }}
  //     type={modalType}
  //     showMode
  //     onDone={attachment => dispatch(toggleInstantAttachment(attachment))}
  //   />
  // </>
}

export default InstantAttachment
