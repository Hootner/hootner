import Dashboard from './components/Dashboard'
import { PlaylistManager } from './components/PlaylistManager'
import { GraphQLDemo } from './components/GraphQLDemo'
import './App.css'

function App() {
  return (
    <div className="App">
      <GraphQLDemo />
      <Dashboard />
      <PlaylistManager />
    </div>
  )
}

export default App
