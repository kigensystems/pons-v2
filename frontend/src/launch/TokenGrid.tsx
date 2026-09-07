import type { LaunchedToken } from './LaunchForm'

export type Filter = 'all' | 'graduated' | 'curve' | 'stocks'

type Card = {
  ticker: string
  name: string
  mc: string
  change: string
  age: string
  paired: string
  progress: number
  graduated: boolean
  address: string
  hue: number
}

// Placeholder cards. Shapes follow the Pons explore grid; every value is invented.
const SAMPLE: Card[] = [
  { ticker: 'SAMPLE', name: 'Sample Token', mc: '$1.20M', change: '+4.2%', age: '3d', paired: 'ETH', progress: 100, graduated: true, address: '0x0000…0001', hue: 28 },
  { ticker: 'PLCHLD', name: 'Placeholder', mc: '$840.0K', change: '−1.1%', age: '5d', paired: 'ETH', progress: 100, graduated: true, address: '0x0000…0002', hue: 200 },
  { ticker: 'DEMO', name: 'Demo Coin', mc: '$412.5K', change: '+12.8%', age: '1d', paired: 'USDG', progress: 100, graduated: true, address: '0x0000…0003', hue: 120 },
  { ticker: 'PAPER', name: 'Paper Stock', mc: '$390.2K', change: '+0.4%', age: '2d', paired: 'HOOD', progress: 100, graduated: true, address: '0x0000…0004', hue: 300 },
  { ticker: 'CREAM', name: 'Cream Ledger', mc: '$221.7K', change: '−6.3%', age: '4d', paired: 'ETH', progress: 100, graduated: true, address: '0x0000…0005', hue: 48 },
  { ticker: 'TEST', name: 'Test Pair', mc: '$96.2K', change: '+31.0%', age: '2h', paired: 'ETH', progress: 68, graduated: false, address: '0x0000…0006', hue: 10 },
  { ticker: 'MOCK', name: 'Mock Launch', mc: '$41.7K', change: '+8.9%', age: '40m', paired: 'cbBTC', progress: 41, graduated: false, address: '0x0000…0007', hue: 260 },
  { ticker: 'STUB', name: 'Stub Asset', mc: '$18.3K', change: '−2.2%', age: '12m', paired: 'ETH', progress: 22, graduated: false, address: '0x0000…0008', hue: 170 },
  { ticker: 'FIXT', name: 'Fixture', mc: '$9.9K', change: '+0.9%', age: '4m', paired: 'AAPL', progress: 9, graduated: false, address: '0x0000…0009', hue: 80 },
  { ticker: 'DUMMY', name: 'Dummy Row', mc: '$5.1K', change: '0.0%', age: 'now', paired: 'ETH', progress: 3, graduated: false, address: '0x0000…0010', hue: 330 },
]

const STOCK_PAIRS = new Set(['HOOD', 'AAPL', 'TSLA', 'NVDA'])

export default function TokenGrid({ launched, filter }: { launched: LaunchedToken[]; filter: Filter }) {
  const cards: Card[] = [
    ...launched.map((token, index) => ({
      ticker: token.ticker,
      name: token.name,
      mc: '—',
      change: 'queued',
      age: 'now',
      paired: token.paired,
      progress: 0,
      graduated: false,
      address: 'pending',
      hue: (index * 67) % 360,
    })),
    ...SAMPLE,
  ]
  const visible = cards.filter((card) => {
    if (filter === 'graduated' && !card.graduated) return false
    if (filter === 'curve' && card.graduated) return false
    if (filter === 'stocks' && !STOCK_PAIRS.has(card.paired)) return false
    return true
  })

  if (visible.length === 0) return <p className="pad-empty">No coins match.</p>

  return (
    <ul className="pad-grid">
      {visible.map((card) => (
        <li key={`${card.ticker}-${card.address}`} className="pad-card" data-graduated={card.graduated}>
          <div className="pad-card-art" style={{ '--hue': card.hue } as React.CSSProperties} aria-hidden="true">
            <span>{card.ticker.slice(0, 2)}</span>
            <b className="pad-badge">{card.graduated ? 'Graduated' : card.address === 'pending' ? 'Queued' : `${card.progress}%`}</b>
          </div>
          <div className="pad-card-body">
            <div className="pad-card-title"><strong>{card.name}</strong><span>${card.ticker}</span></div>
            <div className="pad-card-row"><span className="pad-mc">{card.mc}<small>MC</small></span><span className="pad-change" data-neg={card.change.startsWith('−')}>{card.change}</span></div>
            {!card.graduated && (
              <div className="pad-progress" role="progressbar" aria-valuenow={card.progress} aria-valuemin={0} aria-valuemax={100} aria-label="Curve progress">
                <span style={{ width: `${card.progress}%` }} />
              </div>
            )}
            <div className="pad-card-meta"><span>{card.address}</span><span>{card.paired}</span><span>{card.age}</span></div>
          </div>
        </li>
      ))}
    </ul>
  )
}
