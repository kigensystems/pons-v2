import { useEffect, useRef, useState } from 'react'

const LAUNCH_FEE_ETH = 0.0005
const BASE_TRADE_FEE = 1
const GRADUATION_ETH = 4.2

type Paired = 'ETH' | 'USDG' | 'cbBTC'

export type LaunchedToken = {
  name: string
  ticker: string
  paired: Paired
  totalFee: number
  launchedAt: number
}

type Props = {
  wallet: string | null
  onConnect: () => void
  onClose: () => void
  onLaunch: (token: LaunchedToken) => void
}

export default function LaunchForm({ wallet, onConnect, onClose, onLaunch }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [description, setDescription] = useState('')
  const [imageName, setImageName] = useState('')
  const [xHandle, setXHandle] = useState('')
  const [telegram, setTelegram] = useState('')
  const [paired, setPaired] = useState<Paired>('ETH')
  const [devBuy, setDevBuy] = useState('')
  const [holderShare, setHolderShare] = useState(false)
  const [creatorTax, setCreatorTax] = useState('0')

  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])

  const tax = clamp(Number(creatorTax) || 0, 0, 10)
  const totalFee = BASE_TRADE_FEE + tax
  const devBuyValue = Math.max(Number(devBuy) || 0, 0)
  const due = LAUNCH_FEE_ETH + (paired === 'ETH' ? devBuyValue : 0)
  const ready = Boolean(wallet && name.trim() && ticker.trim())

  return (
    <dialog ref={dialog} className="pad-dialog" onClose={onClose} aria-labelledby="pad-form-title">
      <form
        className="pad-form"
        method="dialog"
        onSubmit={(event) => {
          event.preventDefault()
          if (!ready) return
          onLaunch({ name: name.trim(), ticker: ticker.trim(), paired, totalFee, launchedAt: Date.now() })
        }}
      >
        <div className="pad-form-head">
          <h2 id="pad-form-title">Launch a coin</h2>
          <button type="button" className="pad-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="pad-form-body">
          <div className="pad-fields">
            <label><span>Name</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Token name" maxLength={40} autoFocus /></label>
            <label><span>Ticker</span><input value={ticker} onChange={(event) => setTicker(event.target.value.toUpperCase())} placeholder="SYMBOL" maxLength={12} /></label>
            <label className="pad-wide"><span>Description</span><input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="A short description" maxLength={280} /></label>
            <label className="pad-wide pad-file"><span>Image</span><input type="file" accept="image/*" onChange={(event) => setImageName(event.target.files?.[0]?.name ?? '')} /><span className="pad-file-name">{imageName || 'Choose image'}</span></label>
            <label><span>X</span><span className="pad-prefixed"><em>x.com/</em><input value={xHandle} onChange={(event) => setXHandle(event.target.value)} placeholder="handle" /></span></label>
            <label><span>Telegram</span><span className="pad-prefixed"><em>t.me/</em><input value={telegram} onChange={(event) => setTelegram(event.target.value)} placeholder="community" /></span></label>
            <label><span>Paired asset</span><select value={paired} onChange={(event) => setPaired(event.target.value as Paired)}><option>ETH</option><option>USDG</option><option>cbBTC</option></select></label>
            <label><span>Dev buy ({paired})</span><input type="number" min="0" step="0.001" inputMode="decimal" value={devBuy} onChange={(event) => setDevBuy(event.target.value)} placeholder="0.00" /></label>
            <label><span>Creator tax %</span><input type="number" min="0" max="10" step="0.5" inputMode="decimal" value={creatorTax} onChange={(event) => setCreatorTax(event.target.value)} /></label>
            <label className="pad-check"><input type="checkbox" checked={holderShare} onChange={(event) => setHolderShare(event.target.checked)} /><span>Holder fee sharing</span></label>
          </div>

          <dl className="pad-quote" aria-label="Quote">
            <Line label="Launch fee" value={`${LAUNCH_FEE_ETH} ETH`} />
            <Line label="Dev buy" value={devBuyValue ? `${devBuyValue} ${paired}` : '—'} />
            <Line label="Trade fee" value={`${BASE_TRADE_FEE.toFixed(2)}%`} />
            <Line label="Creator tax" value={`${tax.toFixed(2)}%`} />
            <Line label="Traders pay" value={`${totalFee.toFixed(2)}%`} strong />
            <Line label="Fees go to" value={holderShare ? 'holders' : 'creator'} />
            <Line label="Launch window" value="99% snipe tax, 3s" />
            <Line label="Graduation" value={`${GRADUATION_ETH} ETH`} />
            <Line label="Liquidity" value="locked" />
            <Line label="Due now" value={`${due.toFixed(4)} ETH`} strong />
            <p className="pad-fine">Sample figures from the Pons v2 form, 2026-09-07. Nothing is sent.</p>
          </dl>
        </div>

        <div className="pad-form-foot">
          {wallet ? (
            <button type="submit" className="pad-btn pad-btn--dark" disabled={!ready}>Launch · {due.toFixed(4)} ETH</button>
          ) : (
            <button type="button" className="pad-btn pad-btn--dark" onClick={onConnect}>Connect wallet</button>
          )}
          <span className="pad-fine">{wallet ? 'Adds the coin to the grid. No transaction.' : 'Sample wallet. No provider is wired.'}</span>
        </div>
      </form>
    </dialog>
  )
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="pad-quote-line" data-strong={strong}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
