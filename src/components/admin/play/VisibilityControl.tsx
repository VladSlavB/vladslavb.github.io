import Button from '@mui/joy/Button'
import React from "react"
import ButtonGroup from "@mui/joy/ButtonGroup"
import { toggleGameScreen, toggleSubtotal } from "../../../store"
import { useDispatch, useSelector } from "../../../store"
import IconButton from "@mui/joy/IconButton"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import styles from "./styles.css"
import InstantAttachment from "./InstantAttachment"


const VisibilityControl = () => {
  return (
    <ButtonGroup>
      <InstantAttachment />
      <GameScreenVisibility />
      <SubtotalVisibility />
    </ButtonGroup>
  )
}

export default VisibilityControl

const GameScreenVisibility: React.FC = () => {
  const dispatch = useDispatch()
  return (
    <Button
      className={styles.outlined}
      onClick={() => dispatch(toggleGameScreen())}
      title='Скрыть весь экран игры'
    >
      <VisibilityOff />
    </Button>
  )
}

const SubtotalVisibility: React.FC = () => {
  const dispatch = useDispatch()
  return (
    <Button
      className={styles.outlined}
      onClick={() => dispatch(toggleSubtotal())}
    >
      Счёт
    </Button>
  )
}