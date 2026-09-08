import { shortAddress } from './launchModel'

// address is the connected account; signedIn says whether Plum holds a session for it.
export type WalletControl = { address: string | null; signedIn: boolean; connecting: boolean; onConnect: () => void; onDisconnect: () => void }

export function PaperHeader({ page, wallet, onCreate }: { page?: 'explore' | 'about'; wallet?: WalletControl; onCreate?: () => void }) {
  return <>
    <a className="pad-skip" href="#paper-main">Skip to content</a>
    <header className="pad-bar">
      <a className="pad-brand" href="/" aria-label="Plum — opening"><img className="plum-mark" src="/images/plum-mark.png" alt="" width="256" height="256" decoding="async" />Plum<span className="pad-brand-period">.</span></a>
      <nav className="pad-nav" aria-label="Primary">
        <a href="/explore" aria-current={page === 'explore' ? 'page' : undefined}>Explore</a>
        <a href="/about" aria-current={page === 'about' ? 'page' : undefined}>About us</a>
        <a href="/">The opening</a>
      </nav>
      <div className="pad-bar-actions">
        {onCreate ? <button type="button" className="pad-btn pad-btn--quiet" onClick={onCreate}>+ Create</button> : <span className="pad-header-note">An independent companion.</span>}
        {wallet
          ? wallet.signedIn && wallet.address
            ? <button type="button" className="pad-btn pad-btn--dark" onClick={wallet.onDisconnect} title={wallet.address}>{shortAddress(wallet.address)} · Sign out</button>
            : <>
              {wallet.address && <button type="button" className="pad-btn pad-btn--quiet" onClick={wallet.onDisconnect} disabled={wallet.connecting}>Disconnect</button>}
              <button type="button" className="pad-btn pad-btn--dark" onClick={wallet.onConnect} disabled={wallet.connecting} aria-busy={wallet.connecting} title={wallet.address ?? undefined}>{wallet.connecting ? 'Check your wallet…' : wallet.address ? `Sign in · ${shortAddress(wallet.address)}` : 'Connect wallet'}</button>
            </>
          : <a className="pad-btn pad-btn--dark" href="/explore">Explore coins</a>}
      </div>
    </header>
  </>
}

export function PaperFooter() {
  return <footer className="pad-footer">
    <div><a className="pad-brand" href="/"><img className="plum-mark" src="/images/plum-mark.png" alt="" width="256" height="256" decoding="async" />Plum<span className="pad-brand-period">.</span></a><p>A familiar feeling. A new window.</p></div>
    <a className="pad-back-top" href="#paper-main">Back to top ↑</a>
  </footer>
}
