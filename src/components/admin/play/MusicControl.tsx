import React from 'react'
import Audio, { backgroundMusic, playFinish, playIntro, playWrong } from '../../../Audio'
import ButtonGroup from '@mui/joy/ButtonGroup'
import PlaylistIcon from '@mui/icons-material/QueueMusic'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import Button from '@mui/joy/Button'
import Done from '@mui/icons-material/Done'
import Tooltip from '@mui/joy/Tooltip'
import Stack from '@mui/joy/Stack'
import HeartBroken from '@mui/icons-material/HeartBroken'
import styles from './styles.css'


const MusicControl: React.FC = () => {
  return (
    <ButtonGroup className={styles.outlined}>
      <Button onClick={playIntro} title='Звук заставки'><AudiotrackIcon /></Button>
      <Tooltip
        keepMounted
        variant='outlined'
        disableFocusListener
        placement='top-start'
        title={
          <Stack gap={2}>
            {backgroundMusic.map(src => (
              <Audio src={src} controls key={src} />
            ))}
          </Stack>
        }
      >
        <Button><PlaylistIcon /></Button>
      </Tooltip>
      <Button onClick={playFinish} title='Звук конца раунда'><Done /></Button>
      <Button onClick={playWrong} title='Звук промаха'><HeartBroken /></Button>
    </ButtonGroup>
  )
}

export default MusicControl
