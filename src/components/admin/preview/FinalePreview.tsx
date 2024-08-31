import React from 'react'
import Card from '@mui/joy/Card'
import { deleteFinale, startEditingFinale, useDispatch, useSelector } from '../../../store'
import HeaderWithActions from './HeaderWithActions'


type Props = {
  canEdit?: boolean
  disableDelete?: boolean
}

const FinalePreview: React.FC<Props> = ({canEdit, disableDelete}) => {
  const finale = useSelector(state => state.finale)
  const dispatch = useDispatch()

  return finale != null ? (
    <Card variant='outlined'>
      <HeaderWithActions
        header='Финальный раунд'
        onEdit={() => dispatch(startEditingFinale())}
        onDelete={() => dispatch(deleteFinale())}
        showActions={canEdit}
        disableDelete={disableDelete}
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
