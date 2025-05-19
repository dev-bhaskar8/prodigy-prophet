import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Log environment loading status
if (import.meta.env.VITE_OPENROUTER_API_KEY) {
  console.log('OpenRouter API key configuration found')
} else {
  console.warn('⚠️ OpenRouter API key not found. Please set VITE_OPENROUTER_API_KEY in your environment.env file and rename it to .env')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
