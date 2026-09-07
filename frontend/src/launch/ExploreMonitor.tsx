import type { Launch } from './api'
import { relativeAge } from './launchModel'

type Props = { launch: Launch | null; loading: boolean; error: string | null }

// The Explore hero's CRT: a close crop of the Macintosh screen showing the newest coin the way a
// card does. The bezel is a photograph; only the glass emits light.
export default function ExploreMonitor({ launch, loading, error }: Props) {
  const signal = launch ? 'coin' : error ? 'lost' : loading ? 'warming' : 'idle'
  return (
    <figure className="pad-crt" data-signal={signal}>
      <img className="pad-crt-bezel" src="/images/crt-close.jpg" alt="" width="983" height="780" decoding="async" />
      <div className="pad-crt-glass" aria-hidden="true">
        {launch && (launch.logo
          ? <img className="pad-crt-logo" key={launch.token} src={launch.logo} alt="" />
          : <span className="pad-crt-initials" key={launch.token}>{launch.symbol.slice(0, 2)}</span>)}
        {!launch && <span className="pad-crt-nosignal">NO SIGNAL</span>}
      </div>
      <figcaption className="pad-crt-caption">
        {launch
          ? <>On screen: <strong>{launch.name}</strong> · ${launch.symbol} · {relativeAge(launch.blockTime)}</>
          : error ? 'The screen is dark until the registry answers.' : loading ? 'Warming up' : 'Nothing on screen yet.'}
      </figcaption>
    </figure>
  )
}
