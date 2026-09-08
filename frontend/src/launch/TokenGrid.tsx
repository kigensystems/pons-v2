import { useState } from 'react'
import { arrangeCoins, formatChange, formatUsd, relativeAge, shortAddress, type Coin, type Sort } from './launchModel'
import './launchLive.css'

type Props = { coins: Coin[]; sort: Sort; mine: boolean; loading: boolean; error: string | null; viewer: string | null; onReset: () => void; onRetry: () => void }

export default function TokenGrid({ coins, sort, mine, loading, error, viewer, onReset, onRetry }: Props) {
  const [broken, setBroken] = useState<Set<string>>(() => new Set())
  const shown = arrangeCoins(coins, sort)
  const visible = mine ? shown.filter(coin => viewer && coin.creator?.toLowerCase() === viewer.toLowerCase()) : shown

  if (error && coins.length === 0) {
    return <div className="pad-empty" role="status"><h3>The collection is out of reach.</h3><p>{error}</p><button type="button" className="pad-btn" onClick={onRetry}>Try again</button></div>
  }
  if (loading && coins.length === 0) return <div className="pad-empty" role="status" aria-busy="true"><h3>Opening the collection…</h3><p>Reading what has migrated on Pons.</p></div>
  if (shown.length === 0) return <div className="pad-empty" role="status"><h3>Nothing has migrated yet.</h3><p>Coins appear here once they leave the curve. The feed refreshes every half minute.</p></div>
  if (visible.length === 0) return <div className="pad-empty" role="status"><h3>None of these are yours. Yet.</h3><p>Coins you make through Plum appear here once they leave the curve.</p><button type="button" className="pad-btn" onClick={onReset}>Show all coins</button></div>

  return (
    <><p className="pad-sr-only" role="status">{visible.length} {visible.length === 1 ? 'coin' : 'coins'} shown</p><ul className="pad-grid">
      {visible.map((coin, index) => (
        <li key={coin.token} id={`coin-${coin.token}`} className="pad-card" tabIndex={-1}>
          <div className="pad-card-art" data-tint={['paper', 'moss', 'plum'][index % 3]} aria-hidden="true">
            {coin.logo && !broken.has(coin.logo)
              ? <img src={coin.logo} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setBroken(previous => new Set(previous).add(coin.logo!))} />
              : <span>{coin.symbol.slice(0, 2)}</span>}
          </div>
          <div className="pad-card-body">
            <div className="pad-card-title"><strong title={coin.name}>{coin.name}</strong><span>${coin.symbol}</span></div>
            {coin.description && <p className="pad-sr-only">{coin.description}</p>}
            <div className="pad-card-row">
              <span className="pad-mc">{formatUsd(coin.marketCapUsd)}<small>MC</small></span>
              <span className="pad-change" data-neg={(coin.priceChange24hPct ?? 0) < 0}>{coin.marketNote ? <small className="pad-market-note">{coin.marketNote}</small> : <>{formatChange(coin.priceChange24hPct)}<small>24h</small></>}</span>
            </div>
            {coin.creatorTaxBps !== null && <p className="pad-card-fee">{coin.creatorTaxBps === 0 ? 'No creator fee' : <>Creator fee <b>{Number((coin.creatorTaxBps / 100).toFixed(2))}%</b></>}</p>}
            <div className="pad-card-meta">
              {coin.explorer ? <a className="pad-card-link" href={coin.explorer} target="_blank" rel="noreferrer" title={coin.token} aria-label={`${shortAddress(coin.token)} on Blockscout`}>{shortAddress(coin.token)}</a> : <span title={coin.token}>{shortAddress(coin.token)}</span>}
              {coin.chart && <a className="pad-card-link" href={coin.chart} target="_blank" rel="noreferrer" aria-label={`Chart for $${coin.symbol}`}>Chart</a>}
              {coin.since !== null && <AgeLabel event="Migrated" age={relativeAge(coin.since)} />}
              {coin.madeWithPlum && <span className="pad-card-plum">Plum</span>}
            </div>
          </div>
        </li>
      ))}
    </ul></>
  )
}

// The card shows "4m"; the title and screen readers get "Migrated 4m ago" so the number has a meaning.
function AgeLabel({ event, age }: { event: string; age: string }) {
  const when = age === 'now' ? 'just now' : `${age} ago`
  return <span title={`${event} ${when}`}><span className="pad-sr-only">{event.toLowerCase()} </span>{age}<span className="pad-sr-only">{age === 'now' ? '' : ' ago'}</span></span>
}
