import React, { useEffect, useState } from 'react'
import Audio, { backgroundMusic, getIntroAudioRef, playFinish, playIntro, playWrong, stopIntro } from '../../../Audio'
import ButtonGroup from '@mui/joy/ButtonGroup'
import PlaylistIcon from '@mui/icons-material/QueueMusic'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import Button from '@mui/joy/Button'
import Done from '@mui/icons-material/Done'
import Tooltip from '@mui/joy/Tooltip'
import Stack from '@mui/joy/Stack'
import HeartBroken from '@mui/icons-material/HeartBroken'
import styles from './styles.css'
import StopIcon from '@mui/icons-material/Stop'


const MusicControl: React.FC = () => {
  return (
    <ButtonGroup className={styles.outlined}>
      <IntroControl />
      <Tooltip
        keepMounted
        variant='outlined'
        disableFocusListener
        placement='top-start'
        title={
          <Stack gap={2}>
            {backgroundMusic.map(src => (
              <Audio src={src} controls key={src} onPause={e => (e.target as HTMLAudioElement).currentTime = 0} />
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

const IntroControl: React.FC = () => {
  const [ introPlaying, setIntroPlaying ] = useState(false)
  function introOnClick() {
    if (introPlaying) stopIntro(); else playIntro()
    setIntroPlaying(!introPlaying)
  }
  useEffect(() => {
    const interval = setInterval(() => {
      const audio = getIntroAudioRef()
      setIntroPlaying(audio != null && !audio.paused)
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  return (
    <Button onClick={introOnClick} title='Звук заставки'>
      {introPlaying ? <StopIcon /> : <AudiotrackIcon />}
    </Button>
  )
}
