import { shortAddress } from './launchModel'

export type WalletControl = { address: string | null; connecting: boolean; available: boolean; onConnect: () => void; onDisconnect: () => void }

export function PaperHeader({ page, wallet, onCreate }: { page: 'explore' | 'about'; wallet?: WalletControl; onCreate?: () => void }) {
  return <>
    <a className="pad-skip" href="#paper-main">Skip to content</a>
    <header className="pad-bar">
      <a className="pad-brand" href="/" aria-label="Plum — opening">Plum<span className="pad-brand-period">.</span></a>
      <nav className="pad-nav" aria-label="Primary">
        <a href="/explore" aria-current={page === 'explore' ? 'page' : undefined}>Explore</a>
        <a href="/about" aria-current={page === 'about' ? 'page' : undefined}>About us</a>
        <a href="/">The opening <span aria-hidden="true">↗</span></a>
      </nav>
      <div className="pad-bar-actions">
        {onCreate ? <button type="button" className="pad-btn pad-btn--quiet" onClick={onCreate}>+ Create</button> : <span className="pad-header-note">An independent companion.</span>}
        {wallet
          ? wallet.address
            ? <button type="button" className="pad-btn pad-btn--dark" onClick={wallet.onDisconnect} title={wallet.address}>{shortAddress(wallet.address)} · Sign out</button>
            : <button type="button" className="pad-btn pad-btn--dark" onClick={wallet.onConnect} disabled={wallet.connecting} aria-busy={wallet.connecting}>{wallet.connecting ? 'Check your wallet…' : wallet.available ? 'Connect wallet' : 'No wallet found'}</button>
          : <a className="pad-btn pad-btn--dark" href="/explore">Explore coins <span aria-hidden="true">↗</span></a>}
      </div>
    </header>
  </>
}

export function PaperFooter() {
  return <footer className="pad-footer">
    <div><a className="pad-brand" href="/">Plum<span className="pad-brand-period">.</span></a><p>A familiar feeling. A new window.</p></div>
    <div className="pad-footer-note"><span>Independent by design. Curious by nature.</span><p>Prototype edition · 2026<br />Not affiliated with Pons or Robinhood.</p></div>
    <a className="pad-back-top" href="#paper-main">Back to top ↑</a>
  </footer>
}
