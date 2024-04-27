import React from 'react'
import GameScreen from './screens/GameScreen'
import store from './store'
import { Provider } from 'react-redux'
import AdminScreen from './screens/AdminScreen'
import ConfirmBonusDialog from './components/admin/play/ConfirmBonusDialog'


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
      <ConfirmBonusDialog />
    </Provider>
  )
}



export default App
