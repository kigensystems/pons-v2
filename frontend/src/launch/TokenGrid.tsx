import { useState } from 'react'
import { arrangeCoins, formatChange, formatUsd, relativeAge, shortAddress, type Coin, type Sort } from './launchModel'
import './launchLive.css'

export type Source = 'pons' | 'plum'

type Props = { coins: Coin[]; source: Source; sort: Sort; mine: boolean; loading: boolean; error: string | null; search: string; viewer: string | null; onReset: () => void; onRetry: () => void }

export default function TokenGrid({ coins, source, sort, mine, loading, error, search, viewer, onReset, onRetry }: Props) {
  const [broken, setBroken] = useState<Set<string>>(() => new Set())
  const shown = arrangeCoins(coins, sort)
  const visible = shown.filter(coin => {
    if (mine && (!viewer || coin.creator?.toLowerCase() !== viewer.toLowerCase())) return false
    return `${coin.name} ${coin.symbol} ${coin.token}`.toLowerCase().includes(search.trim().toLowerCase())
  })

  if (error && coins.length === 0) {
    return <div className="pad-empty" role="status"><h3>The collection is out of reach.</h3><p>{error}</p><button type="button" className="pad-btn" onClick={onRetry}>Try again</button></div>
  }
  if (loading && coins.length === 0) return <div className="pad-empty" role="status" aria-busy="true"><h3>Opening the collection…</h3><p>{source === 'pons' ? 'Reading what has migrated on Pons.' : 'Reading Plum launches from the registry.'}</p></div>
  if (shown.length === 0) {
    return source === 'pons'
      ? <div className="pad-empty" role="status"><h3>Nothing has migrated yet.</h3><p>Coins appear here once they leave the curve. The feed refreshes every half minute.</p></div>
      : <div className="pad-empty" role="status"><h3>No Plum coin has migrated yet.</h3><p>Plum coins are the ones created here; they appear once they leave the curve. The first one could be yours.</p></div>
  }
  if (visible.length === 0) return <div className="pad-empty" role="status"><h3>Nothing in this corner. Yet.</h3><p>Try a different name, ticker or address.</p><button type="button" className="pad-btn" onClick={onReset}>Show all coins</button></div>

  return (
    <><p className="pad-sr-only" role="status">{visible.length} {visible.length === 1 ? 'coin' : 'coins'} shown</p><ul className="pad-grid">
      {visible.map(coin => (
        <li key={coin.token} className="pad-card">
          <div className="pad-card-art" style={{ '--hue': coin.hue } as React.CSSProperties} aria-hidden="true">
            {coin.logo && !broken.has(coin.logo)
              ? <img src={coin.logo} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setBroken(previous => new Set(previous).add(coin.logo!))} />
              : <span>{coin.symbol.slice(0, 2)}</span>}
          </div>
          <div className="pad-card-body">
            <div className="pad-card-title"><strong title={coin.name}>{coin.name}</strong><span>${coin.symbol}</span></div>
            {coin.description && <p className="pad-sr-only">{coin.description}</p>}
            <div className="pad-card-row">
              <span className="pad-mc">{formatUsd(coin.marketCapUsd)}<small>MC</small></span>
              <span className="pad-change" data-neg={(coin.priceChange24hPct ?? 0) < 0}>{coin.marketNote ? <small className="pad-market-note">{coin.marketNote}</small> : formatChange(coin.priceChange24hPct)}</span>
            </div>
            <div className="pad-card-meta">
              {coin.explorer ? <a className="pad-card-link" href={coin.explorer} target="_blank" rel="noreferrer" title={coin.token}>{shortAddress(coin.token)}</a> : <span title={coin.token}>{shortAddress(coin.token)}</span>}
              {coin.chart && <a className="pad-card-link" href={coin.chart} target="_blank" rel="noreferrer">Chart</a>}
              {coin.since !== null && <span>{relativeAge(coin.since)}</span>}
              {source === 'pons' && coin.madeWithPlum && <span className="pad-card-plum">Plum</span>}
            </div>
          </div>
        </li>
      ))}
    </ul></>
  )
}
