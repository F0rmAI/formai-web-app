/**
 * Browser entry point: loads fonts and global styles and mounts the app.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/plus-jakarta-sans'
import '@material-symbols/font-400/rounded.css'
import './global.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
