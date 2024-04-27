import React, { useState } from 'react'
import IconButton from '@mui/joy/IconButton'
import AttachFile from '@mui/icons-material/AttachFile'
import Tooltip from '@mui/joy/Tooltip'
import List from '@mui/joy/List'
import ListItem from '@mui/joy/ListItem'
import ListItemButton from '@mui/joy/ListItemButton'


const NewAttachment: React.FC<{
  size?: 'sm' | 'md' | 'lg'
}> = props => {
  const [ open, setOpen ] = useState(false)
  return (
    <Tooltip 
      placement='right' variant='outlined' arrow
      open={open} onClose={() => setOpen(false)}
      title={
        <List size='sm'>
          <ListItem><ListItemButton>Изображение</ListItemButton></ListItem>
          <ListItem><ListItemButton>Текст</ListItemButton></ListItem>
        </List>
      }
    >
      <IconButton onClick={() => setOpen(true)} size={props.size}>
        <AttachFile />
      </IconButton>
    </Tooltip>
  )
}


export default NewAttachment
