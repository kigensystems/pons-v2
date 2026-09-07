import type { Launch } from './api'
import { formatChange, formatUsd, launchBadge, relativeAge, shortAddress } from './launchModel'
import './launchLive.css'

export type Filter = 'all' | 'graduated' | 'curve' | 'mine'

type Props = { launches: Launch[]; loading: boolean; error: string | null; filter: Filter; search: string; viewer: string | null; onReset: () => void; onRetry: () => void }

export default function TokenGrid({ launches, loading, error, filter, search, viewer, onReset, onRetry }: Props) {
  const visible = launches.filter(launch => {
    if (filter === 'graduated' && !launch.protocol?.graduated) return false
    if (filter === 'curve' && (launch.protocol ? !launch.protocol.onCurve : false)) return false
    if (filter === 'mine' && (!viewer || launch.creator.toLowerCase() !== viewer.toLowerCase())) return false
    return `${launch.name} ${launch.symbol} ${launch.token}`.toLowerCase().includes(search.trim().toLowerCase())
  })

  if (error && launches.length === 0) {
    return <div className="pad-empty" role="status"><h3>The collection is out of reach.</h3><p>{error}</p><button type="button" className="pad-btn" onClick={onRetry}>Try again ↗</button></div>
  }
  if (loading && launches.length === 0) return <div className="pad-empty" role="status" aria-busy="true"><h3>Opening the collection…</h3><p>Reading Plum launches from the registry.</p></div>
  if (launches.length === 0) {
    return <div className="pad-empty" role="status"><h3>Nothing launched through Plum yet.</h3><p>Explore only lists coins created here. The first one could be yours.</p></div>
  }
  if (visible.length === 0) return <div className="pad-empty" role="status"><h3>Nothing in this corner. Yet.</h3><p>Try a different name, ticker, address or filter.</p><button type="button" className="pad-btn" onClick={onReset}>Show all coins ↗</button></div>

  return (
    <><p className="pad-sr-only" role="status">{visible.length} {visible.length === 1 ? 'coin' : 'coins'} shown</p><ul className="pad-grid">
      {visible.map((launch, index) => {
        const badge = launchBadge(launch)
        const market = launch.market?.payload ?? null
        const marketNote = launch.market ? { ok: '', stale: 'stale', error: 'unavailable', unavailable: 'no market data', unsupported: 'not indexed yet' }[launch.market.status] : 'no market data'
        return (
          <li key={launch.token} className="pad-card" data-graduated={Boolean(launch.protocol?.graduated)} data-confirming={launch.confirmationState === 'included'}>
            <div className="pad-card-art" style={{ '--hue': (index * 67 + launch.blockNumber) % 360 } as React.CSSProperties} aria-hidden="true">
              {launch.logo ? <img src={launch.logo} alt="" loading="lazy" /> : <span>{launch.symbol.slice(0, 2)}</span>}
              <b className="pad-badge">{badge}</b>
            </div>
            <div className="pad-card-body">
              <div className="pad-card-title"><strong title={launch.name}>{launch.name}</strong><span>${launch.symbol}</span></div>
              {launch.description && <p className="pad-sr-only">{launch.description}</p>}
              <div className="pad-card-row">
                <span className="pad-mc">{formatUsd(market?.marketCapUsd)}<small>MC</small></span>
                <span className="pad-change" data-neg={(market?.priceChange24hPct ?? 0) < 0}>{marketNote ? <small className="pad-market-note">{marketNote}</small> : formatChange(market?.priceChange24hPct)}</span>
              </div>
              <span className="pad-sr-only">{badge}{launch.protocolError ? `, ${launch.protocolError}` : ''}</span>
              <div className="pad-card-meta">
                {launch.explorer ? <a className="pad-card-link" href={launch.explorer.token} target="_blank" rel="noreferrer" title={launch.token}>{shortAddress(launch.token)} ↗</a> : <span title={launch.token}>{shortAddress(launch.token)}</span>}
                <span>{launch.pairToken === '0x0000000000000000000000000000000000000000' ? 'ETH' : shortAddress(launch.pairToken)}</span>
                <span>{relativeAge(launch.blockTime)}</span>
              </div>
            </div>
          </li>
        )
      })}
    </ul></>
  )
}
