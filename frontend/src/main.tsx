import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AboutPage, ExplorePage, NotFoundPage } from './pages'

const path = window.location.pathname.replace(/\/+$/, '') || '/'
const Page = path === '/' ? App : path === '/explore' || path === '/launch' ? ExplorePage : path === '/about' ? AboutPage : NotFoundPage

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#eee8d9' }} aria-busy="true" />}>
      <Page />
    </Suspense>
  </StrictMode>,
)
