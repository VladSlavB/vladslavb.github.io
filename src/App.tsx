import React from 'react'
import PublicScreen from './screens/PublicScreen'
import store from './store'
import { Provider } from 'react-redux'
import AdminScreen from './screens/AdminScreen'


const App: React.FC = () => {
  const showPublicScreen = opener != null
  if (!showPublicScreen) {
    (window as any).store = store
  }
  return (
    <Provider store={showPublicScreen ? opener.store : store}>
      {showPublicScreen ? (
        <PublicScreen />
      ) : (
        <AdminScreen />
      )}
    </Provider>
  )
}

export default App
