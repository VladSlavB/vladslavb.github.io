import React from 'react'

import { useSelector, useStore } from '../store'

import styles from './PublicScreen.css'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'


const PublicScreen: React.FC = () => {
  const store = useStore()
  return (
    <div className={styles.game}>
      <iframe src='/assets/img.svg' width='100%' height='100%'
        onLoad={e => {
          const svgDoc = (e.target as HTMLIFrameElement).contentDocument!
          createRoot(svgDoc.querySelector('#react-root') as SVGGElement).render(
            <Provider store={store}>
              <Inner />
            </Provider>
          )
        }}
      />
    </div>
  )
}

export default PublicScreen

function Inner() {
  const name = useSelector(state => state.game.currentTeam)
  return (
    <text fill="black" x="960" y="200" dominant-baseline="middle" text-anchor="middle">
      {name}
    </text>
  )
}
