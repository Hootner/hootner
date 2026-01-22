import React from 'react';
import Dashboard from './components/Dashboard';
import { PlaylistManager } from './components/PlaylistManager';
import './App.css';

function App() {
  return (
    <div className="App">
      <Dashboard />
      <PlaylistManager />
    </div>
  );
}

export default App;