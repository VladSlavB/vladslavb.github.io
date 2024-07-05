import React from 'react'
import GameScreen from './screens/GameScreen'
import store from './store'
import { Provider } from 'react-redux'
import AdminScreen from './screens/AdminScreen'
import Audio, { allAudioUrls } from './Audio'


const App: React.FC = () => {
  const showPublicScreen = opener != null
  if (!showPublicScreen) {
    (window as any).store = store
  }
  return (
    <Provider store={showPublicScreen ? opener.store : store}>
      {showPublicScreen ? (
        <GameScreen />
      ) : (
        <AdminScreen />
      )}
      {allAudioUrls.map(url => <Audio src={url} key={url} controls style={{overflow: 'hidden', height: 0}} />)}
    </Provider>
  )
}



export default App
