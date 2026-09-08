import { useEffect, useState } from 'react'
import type { Spotlight } from './api'
import { formatChange, formatUsd, relativeAge } from './launchModel'

type Props = { spotlight: Spotlight | null; error: string | null }

// The Explore hero's CRT: a close crop of the Macintosh screen showing the coin that most recently
// left its curve on Pons. The bezel is a photograph; only the glass emits light. With a picture the
// whole picture sits in the upper glass and a phosphor readout runs beneath it; without one the
// readout is the picture. A null spotlight is still loading; one without a payload has nothing to show.
export default function ExploreMonitor({ spotlight, error }: Props) {
  const coin = spotlight?.payload ?? null
  // A picture that fails to load gets one more try after a pause (the logo host rate-limits bursts)
  // before the readout takes over.
  const [failed, setFailed] = useState<Record<string, number>>({})
  const [attempt, setAttempt] = useState(0)
  const lost = Boolean(error) || spotlight?.status === 'error'
  const signal = coin ? 'coin' : lost ? 'lost' : spotlight === null ? 'warming' : 'idle'
  const failures = coin?.logo ? failed[coin.logo] ?? 0 : 0
  const logo = coin?.logo && failures < 2 ? coin.logo : null
  useEffect(() => {
    if (failures !== 1) return
    const timer = setTimeout(() => setAttempt(value => value + 1), 3000)
    return () => clearTimeout(timer)
  }, [failures])
  return (
    <figure className="pad-crt" data-signal={signal} data-picture={Boolean(logo)}>
      <img className="pad-crt-bezel" src="/images/crt-close.jpg" alt="" width="983" height="780" decoding="async" />
      <div className="pad-crt-glass" aria-hidden="true">
        {coin && logo && <img className="pad-crt-picture" key={`${logo}-${attempt}`} src={logo} alt="" referrerPolicy="no-referrer" onError={() => setFailed(previous => ({ ...previous, [logo]: (previous[logo] ?? 0) + 1 }))} />}
        {coin && <div className="pad-crt-readout" key={`${coin.token}-readout`}>
          {!logo && <b className="pad-crt-name">{coin.name}</b>}
          <span className="pad-crt-line"><b>${coin.symbol}</b><span>MC {formatUsd(coin.marketCapUsd)}</span></span>
          {!logo && <span className="pad-crt-line pad-crt-line--small"><span>{formatChange(coin.priceChange24hPct)} 24h</span><span>{relativeAge(coin.graduatedAt ?? 0)}</span></span>}
        </div>}
        {!coin && <span className="pad-crt-nosignal">No signal</span>}
      </div>
      <figcaption className="pad-crt-caption">
        Recently migrated
        <span className="pad-sr-only">{coin ? `: ${coin.name}, $${coin.symbol}, market cap ${formatUsd(coin.marketCapUsd)}, migrated ${relativeAge(coin.graduatedAt ?? 0)} ago` : lost ? ': the feed is unreachable' : ': nothing yet'}</span>
      </figcaption>
    </figure>
  )
}
