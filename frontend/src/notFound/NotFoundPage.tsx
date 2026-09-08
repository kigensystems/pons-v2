import { useEffect } from 'react'
import { PaperHeader, PaperFooter } from '../launch/PaperChrome'
import '../launch/launch.css'
import './notFound.css'

export default function NotFoundPage() {
  useEffect(() => { document.title = 'Not found — Plum' }, [])

  return <div className="pad not-found">
    <PaperHeader />
    <main id="paper-main" className="not-found-main">
      <p className="pad-kicker"><span className="pad-dot" aria-hidden="true" />Not found · 404</p>
      <h1>Nothing at this address.</h1>
      <p className="not-found-path">Plum has no page at <code>{window.location.pathname}</code>.</p>
      <div className="not-found-actions">
        <a className="pad-btn pad-btn--dark" href="/explore">Open Explore</a>
        <a className="pad-link" href="/">Back to the opening</a>
      </div>
    </main>
    <PaperFooter />
  </div>
}
