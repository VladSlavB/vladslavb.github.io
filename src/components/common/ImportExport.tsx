import React from 'react'
import { useSelector } from '../../store'
import IconButton from '@mui/joy/IconButton'
import Download from '@mui/icons-material/Download'
import Upload from '@mui/icons-material/Upload'
import styles from './styles.css'


const ImportExport: React.FC = () => {
  const hasQuestions = useSelector(state => state.questions.length > 0)

  return (
    <div className={styles.importexport}>
      {hasQuestions ? (
        <IconButton size='sm' onClick={download}><Download /></IconButton>
      ) : (
        <IconButton size='sm' onClick={importState}><Upload /></IconButton>
      )}
    </div>
  )
}

export default ImportExport

function download() {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(localStorage.vladslav));
  element.setAttribute('download', 'game-state.json');
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function importState() {
  const element = document.createElement('input')
  element.type = 'file'
  element.accept = '.json'
  element.onchange = async () => {
    const file = element.files?.[0]
    const importedState = await file?.text()
    try {
      JSON.parse(importedState ?? '<>')
      localStorage.vladslav = importedState
      location.reload()
    } catch {
      alert('Неправильный файл')
    }
  }
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}
