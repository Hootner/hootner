import Dashboard from './components/Dashboard'
import { PlaylistManager } from './components/PlaylistManager'
import { GraphQLDemo } from './components/GraphQLDemo'
import AlgorithmMarketplace from './components/AlgorithmMarketplace'
import './App.css'

function App() {
  return (
    <div className="App">
      <GraphQLDemo />
      <Dashboard />
      <PlaylistManager />
      <AlgorithmMarketplace />
    </div>
  )
}

export default App
