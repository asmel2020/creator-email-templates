import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// CSS del builder (autocontenido: fuente Geist inline, scope .ter-theme)
import 'create-email-template/style.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
