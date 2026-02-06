import Dashboard from './components/Dashboard'
import { GraphQLDemo } from './components/GraphQLDemo'
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'
import './App.css'

function App() {
  return (
    <div className="App flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-grow ml-16 lg:ml-64">
        <main className="flex-grow">
          <GraphQLDemo />
          <Dashboard />
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default App
