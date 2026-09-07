import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ExplorePage from './launch/LaunchPage.tsx'
import AboutPage from './about/AboutPage.tsx'

const path = window.location.pathname.replace(/\/+$/, '') || '/'
const Page = path === '/explore' || path === '/launch' ? ExplorePage : path === '/about' ? AboutPage : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
