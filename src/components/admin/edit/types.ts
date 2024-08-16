import { Attachment, QuestionName } from "../../../store"

export type InputBonus = {
  score: string
  attachments: Attachment[]
}

export type InputOption = {
  value: string
  score: string
  attachments: Attachment[]
  bonus?: InputBonus
}

export type InputQuestion = {
  name: QuestionName
  value: string
  value2: string
  options: InputOption[]
}
