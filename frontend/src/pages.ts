import { lazy } from 'react'

// The paper pages, and the wallet code they carry, load only when a visitor goes there; the opening stays light.
export const ExplorePage = lazy(() => import('./launch/LaunchPage.tsx'))
export const AboutPage = lazy(() => import('./about/AboutPage.tsx'))
export const NotFoundPage = lazy(() => import('./notFound/NotFoundPage.tsx'))
