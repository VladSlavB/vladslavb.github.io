import { Attachment } from "../../../store"

export type InputBonus = {
  score: string
  attachment?: Attachment
  check?: boolean
}

export type InputOption = {
  value: string
  score: string
  attachment?: Attachment
  bonus?: InputBonus
  checkValue?: boolean
  checkScore?: boolean
}

export type InputQuestion = {
  name: string
  value: string
  value2: string
  options: InputOption[]
  check?: boolean
}
