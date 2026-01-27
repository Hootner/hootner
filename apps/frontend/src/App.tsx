import Dashboard from './components/Dashboard'
import PlaylistManager from '@ui-components/media/PlaylistManager'
import { GraphQLDemo } from './components/GraphQLDemo'
import { AlgorithmMarketplace } from '@ui-components/AlgorithmMarketplace'
import './App.css'

function App() {
  return (
    <div className="App">
      <GraphQLDemo />
      <Dashboard />
      <PlaylistManager />
      <div style={{ marginTop: 24 }}>
        <AlgorithmMarketplace />
      </div>
    </div>
  )
}

export default App
