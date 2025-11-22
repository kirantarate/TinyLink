import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CreateLink from './components/CreateLink'
import AllLinks from './components/AllLinks'

function App() {
  const [currentView, setCurrentView] = useState('allLinks')

  return (
    <>
      {currentView === 'createLink' ? (
        <CreateLink onNavigateToAllLinks={() => setCurrentView('allLinks')} />
      ) : (
        <AllLinks onNavigateToCreate={() => setCurrentView('createLink')} />
      )}
    </>
  )
}

export default App
