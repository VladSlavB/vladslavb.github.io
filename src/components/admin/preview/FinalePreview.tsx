import React from 'react'
import Card from '@mui/joy/Card'
import { deleteFinale, useDispatch, useSelector } from '../../../store'
import HeaderWithActions from './HeaderWithActions'


type Props = {
  onEdit?: () => void
  canEdit?: boolean
}

const FinalePreview: React.FC<Props> = ({onEdit, canEdit}) => {
  const finale = useSelector(state => state.finale)
  const dispatch = useDispatch()

  return finale != null ? (
    <Card variant='outlined'>
      <HeaderWithActions
        header='Финальный раунд'
        onEdit={onEdit}
        onDelete={() => dispatch(deleteFinale())}
        showActions={canEdit}
      />
      <ol>
        {finale.questions.map((question, i) => (
          <li key={i}>{question.value}</li>
        ))}
      </ol>
    </Card>
  ) : null
}

export default FinalePreview
