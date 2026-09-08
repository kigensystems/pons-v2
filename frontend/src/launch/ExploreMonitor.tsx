import { useId } from 'react'
import type { LaunchConfigResponse } from './api'
import { formatEth } from './launchModel'
import { BEZEL_PATH, BEZEL_PICTURE_TRANSFORM, CRT_EXPOSURE } from '../screenGeometry'

type Props = { config: LaunchConfigResponse | null; error: string | null }

// The stack Plum states against Pons v2, the same figures About prints. The creation fee and the block are read from the factory.
const CUTS = [
  { label: 'Creator fee', note: 'capped · cannot rise', value: '3%' },
  { label: 'Transfer fee', value: '−50%' },
  { label: 'Protocol fee', value: '−35%' },
]
const blockLabel = (block: string) => block.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

// The Macintosh's glass on Explore, tuned to the fees channel: what a launch costs through Plum, printed once, here,
// as phosphor. Drawn the way the opening draws its TV: in the artwork's own coordinates, clipped to the curved glass,
// lifted and haloed by the same exposure, with the casing shaded into the room and the light spilling onto the bezel
// and the keys. A null config is still warming up; an error is no signal.
export default function ExploreMonitor({ config, error }: Props) {
  const id = useId()
  const signal = config ? 'fees' : error ? 'lost' : 'warming'
  return (
    <svg className="pad-tv" viewBox="0 0 1536 1024" data-signal={signal}>
      <defs>
        <mask id={`${id}-artwork`} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024" style={{ maskType: 'alpha' }}>
          <image href="/images/macintosh-render.png" width="1536" height="1024" />
        </mask>
        <linearGradient id={`${id}-room-shadow`} gradientUnits="userSpaceOnUse" x1="490" y1="170" x2="1190" y2="560">
          <stop offset="0" stopColor="#080e0c" stopOpacity="0" />
          <stop offset=".35" stopColor="#080e0c" stopOpacity=".12" />
          <stop offset=".7" stopColor="#080e0c" stopOpacity=".5" />
          <stop offset="1" stopColor="#080e0c" stopOpacity=".68" />
        </linearGradient>
        <clipPath id={`${id}-glass`}><path d={BEZEL_PATH} /></clipPath>
        <clipPath id={`${id}-keyboard`}><path d="M 350 630 L 949 738 L 911 901 L 112 803 Z" /></clipPath>
        <filter id={`${id}-exposure`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feComponentTransfer result="exposed">
            <feFuncR type="table" tableValues={CRT_EXPOSURE} />
            <feFuncG type="table" tableValues={CRT_EXPOSURE} />
            <feFuncB type="table" tableValues={CRT_EXPOSURE} />
          </feComponentTransfer>
          <feComponentTransfer in="exposed" result="highlights">
            <feFuncR type="linear" slope="2" intercept="-1" />
            <feFuncG type="linear" slope="2" intercept="-1" />
            <feFuncB type="linear" slope="2" intercept="-1" />
          </feComponentTransfer>
          <feGaussianBlur in="highlights" stdDeviation="1.6" />
          <feComponentTransfer result="halation"><feFuncA type="linear" slope=".32" /></feComponentTransfer>
          <feBlend in="exposed" in2="halation" mode="screen" />
        </filter>
        {/* A short light falloff onto the recess, with a softer bounce beneath it. */}
        <filter id={`${id}-spill`} x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="7" /></filter>
        <filter id={`${id}-glass-edge`} x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2" /></filter>
        <filter id={`${id}-key-planes`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0 0 0 0 .05 .2 .55 .85 1 1 1" />
            <feFuncG type="table" tableValues="0 0 0 0 .05 .2 .55 .85 1 1 1" />
            <feFuncB type="table" tableValues="0 0 0 0 .05 .2 .55 .85 1 1 1" />
          </feComponentTransfer>
        </filter>
        <mask id={`${id}-key-receiver`} maskUnits="userSpaceOnUse" x="112" y="630" width="840" height="271" style={{ maskType: 'luminance' }}>
          <image href="/images/macintosh-render.png" width="1536" height="1024" filter={`url(#${id}-key-planes)`} />
        </mask>
        <radialGradient id={`${id}-reflection`}>
          <stop offset="0" stopColor="#e9dcc0" stopOpacity="1" />
          <stop offset=".45" stopColor="#e9dcc0" stopOpacity=".65" />
          <stop offset="1" stopColor="#e9dcc0" stopOpacity="0" />
        </radialGradient>
        {/* The tube at rest: dark phosphor, lighter where the beam lands, with the glass curving away at the edges. */}
        <radialGradient id={`${id}-tube`} cx=".48" cy=".46" r=".62">
          <stop offset="0" stopColor="#343e31" />
          <stop offset=".55" stopColor="#1c251c" />
          <stop offset="1" stopColor="#0a0e0b" />
        </radialGradient>
        <radialGradient id={`${id}-glass-shade`} r=".7">
          <stop offset=".45" stopColor="#080c10" stopOpacity="0" />
          <stop offset=".8" stopColor="#080c10" stopOpacity=".12" />
          <stop offset="1" stopColor="#080c10" stopOpacity=".55" />
        </radialGradient>
      </defs>
      {/* Shade the artwork's silhouette into the room; the lit screen is added above it. */}
      <rect width="1536" height="1024" fill={`url(#${id}-room-shadow)`} mask={`url(#${id}-artwork)`} aria-hidden="true" />
      <g className="pad-tv-light" aria-hidden="true">
        <path d={BEZEL_PATH} fill="none" stroke="#ede7cb" strokeWidth="12" filter={`url(#${id}-spill)`} />
        <g clipPath={`url(#${id}-keyboard)`} mask={`url(#${id}-key-receiver)`}>
          <ellipse cx="632" cy="708" rx="230" ry="70" transform="rotate(10 632 708)" fill={`url(#${id}-reflection)`} />
        </g>
      </g>
      <g clipPath={`url(#${id}-glass)`}>
        <rect x="550" y="125" width="410" height="345" fill={`url(#${id}-tube)`} />
        {/* Reuse the tube's baked reflection, registered to the artwork, so its curvature
            and surface stay continuous with the bezel instead of laying a flat sheen over it. */}
        <image href="/images/macintosh-render.png" width="1536" height="1024" opacity=".24" style={{ mixBlendMode: 'screen' }} aria-hidden="true" />
        <g filter={`url(#${id}-exposure)`}>
          <foreignObject width="640" height="480" transform={BEZEL_PICTURE_TRANSFORM}>
            <div className="pad-channel" role="group" aria-label="Launch fees through Plum">
              {config
                ? <>
                  <div className="pad-channel-head"><b>Less to launch</b><span>vs Pons</span></div>
                  <dl className="pad-channel-rows">
                    {CUTS.map(cut => <div key={cut.label}><dt>{cut.label}{cut.note && <small>{cut.note}</small>}</dt><dd>{cut.value}</dd></div>)}
                    <div><dt>Creation fee<small>read from the factory</small></dt><dd>{formatEth(config.launchFeeWei, 4)} ETH</dd></div>
                  </dl>
                  <div className="pad-channel-foot"><span>Block {blockLabel(config.blockNumber)}</span><span>{config.launchEnabled ? 'Live' : 'Paused'}</span></div>
                </>
                : <span className="pad-channel-nosignal">{signal === 'lost' ? 'No signal' : 'Warming up'}</span>}
            </div>
          </foreignObject>
        </g>
        {/* Contact shadow where the glass tucks under the casing, contained inside the glass. */}
        <rect x="550" y="125" width="410" height="345" fill={`url(#${id}-glass-shade)`} aria-hidden="true" />
        <path d={BEZEL_PATH} fill="none" stroke="#030705" strokeWidth="8" strokeOpacity=".8" filter={`url(#${id}-glass-edge)`} aria-hidden="true" />
      </g>
    </svg>
  )
}
