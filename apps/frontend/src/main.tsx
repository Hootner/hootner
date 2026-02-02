import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from './apollo-client'
import App from './App.tsx'
import './App.css'

import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    const shouldUpdate = window.confirm(
      'An update is available. Reload to update now?'
    )
    if (shouldUpdate) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    // App is cached for offline use.
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
)
