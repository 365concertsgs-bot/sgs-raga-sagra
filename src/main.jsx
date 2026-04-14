import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Cache busting timestamp - Force Vercel rebuild
const BUILD_TIME = '2026-04-14T' + new Date().toISOString().slice(11, 19)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)