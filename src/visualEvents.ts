import styles from './components/game/styles.css'

const visuals = {
    gameWindow: null as Window | null
}

export default visuals

export function hitAnimation(team: 'leftTeam' | 'rightTeam') {
  const element = visuals.gameWindow?.document.getElementById(team)
  element?.classList.add(styles.hit)
  setTimeout(() => element?.classList.remove(styles.hit), 1000)
}
