import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import LaunchPage from './launch/LaunchPage.tsx'

const Page = window.location.pathname.startsWith('/launch') ? LaunchPage : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
