import React from 'react'
import Audio, { backgroundMusic, playFinish, playWrong } from '../../../Audio'
import ButtonGroup from '@mui/joy/ButtonGroup'
import PlayArrow from '@mui/icons-material/PlayArrow'
import Button from '@mui/joy/Button'
import Done from '@mui/icons-material/Done'
import Tooltip from '@mui/joy/Tooltip'
import Stack from '@mui/joy/Stack'
import HeartBroken from '@mui/icons-material/HeartBroken'


const MusicControl: React.FC = () => {
  return (
    <ButtonGroup>
      <Tooltip keepMounted variant='outlined' disableFocusListener placement='top-start' title={
        <Stack gap={2}>
          {backgroundMusic.map(src => (
            <Audio src={src} controls key={src} />
          ))}
        </Stack>
      }>
        <Button><PlayArrow /></Button>
      </Tooltip>
      <Button onClick={playFinish} title='Звук конца раунда'><Done /></Button>
      <Button onClick={playWrong} title='Звук промаха'><HeartBroken /></Button>
    </ButtonGroup>
  )
}

export default MusicControl
