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
        <a href="/">Home</a>
        <a className="pad-nav-x" href="https://x.com/PlumInfra" target="_blank" rel="noreferrer" aria-label="Plum on X"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></a>
      </nav>
      <div className="pad-bar-actions">
        {onCreate && <button type="button" className="pad-btn pad-btn--quiet" onClick={onCreate}>+ Create</button>}
        {wallet
          ? wallet.signedIn && wallet.address
            ? <button type="button" className="pad-btn pad-btn--dark" onClick={wallet.onDisconnect} title={wallet.address}>{shortAddress(wallet.address)} · Sign out</button>
            : <>
              {wallet.address && <button type="button" className="pad-btn pad-btn--quiet" onClick={wallet.onDisconnect} disabled={wallet.connecting}>Disconnect</button>}
              <button type="button" className="pad-btn pad-btn--dark" onClick={wallet.onConnect} disabled={wallet.connecting} aria-busy={wallet.connecting} title={wallet.address ?? undefined}>{wallet.connecting ? 'Check your wallet…' : wallet.address ? `Sign in · ${shortAddress(wallet.address)}` : 'Connect wallet'}</button>
            </>
          : <a className="pad-btn pad-btn--dark" href="/explore#paper-main">Explore Collection</a>}
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
