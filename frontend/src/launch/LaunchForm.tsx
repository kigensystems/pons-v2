import { useId, useState } from 'react'

const LAUNCH_FEE_ETH = 0.0005
const BASE_TRADE_FEE = 1
const GRADUATION_ETH = 4.2

type Paired = 'ETH' | 'USDG' | 'cbBTC'

export default function LaunchForm() {
  const id = useId()
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [description, setDescription] = useState('')
  const [imageName, setImageName] = useState('')
  const [xHandle, setXHandle] = useState('')
  const [telegram, setTelegram] = useState('')
  const [paired, setPaired] = useState<Paired>('ETH')
  const [devBuy, setDevBuy] = useState('')
  const [holderShare, setHolderShare] = useState(false)
  const [creatorWallet, setCreatorWallet] = useState('')
  const [creatorTax, setCreatorTax] = useState('0')

  const tax = clamp(Number(creatorTax) || 0, 0, 10)
  const totalFee = BASE_TRADE_FEE + tax
  const devBuyValue = Math.max(Number(devBuy) || 0, 0)
  const due = LAUNCH_FEE_ETH + (paired === 'ETH' ? devBuyValue : 0)

  return (
    <section className="launch-desk" id="deploy" aria-labelledby={`${id}-title`}>
      <form className="launch-coupon" onSubmit={(event) => event.preventDefault()}>
        <span className="launch-scissors" aria-hidden="true">✂</span>
        <h2 id={`${id}-title`}>Act now! Launch a token.</h2>
        <p className="launch-coupon-note">
          Fill in along the dotted line. The receipt updates as you type. Connect a wallet to send it to Pons.
        </p>

        <div className="launch-grid">
          <label>
            <span>Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Token name" maxLength={40} />
          </label>
          <label>
            <span>Ticker</span>
            <input value={ticker} onChange={(event) => setTicker(event.target.value.toUpperCase())} placeholder="SYMBOL" maxLength={12} />
          </label>
          <label className="launch-span">
            <span>Description</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="A short description of the token" rows={3} maxLength={280} />
          </label>
          <label className="launch-span launch-file">
            <span>Token image</span>
            <input type="file" accept="image/*" onChange={(event) => setImageName(event.target.files?.[0]?.name ?? '')} />
            <span className="launch-file-name">{imageName || 'Choose image'}</span>
          </label>
          <label>
            <span>X profile</span>
            <span className="launch-prefixed"><em>x.com/</em><input value={xHandle} onChange={(event) => setXHandle(event.target.value)} placeholder="handle" /></span>
          </label>
          <label>
            <span>Telegram</span>
            <span className="launch-prefixed"><em>t.me/</em><input value={telegram} onChange={(event) => setTelegram(event.target.value)} placeholder="community" /></span>
          </label>
          <label>
            <span>Paired asset</span>
            <select value={paired} onChange={(event) => setPaired(event.target.value as Paired)}>
              <option>ETH</option>
              <option>USDG</option>
              <option>cbBTC</option>
            </select>
          </label>
          <label>
            <span>Developer buy ({paired})</span>
            <input type="number" min="0" step="0.001" inputMode="decimal" value={devBuy} onChange={(event) => setDevBuy(event.target.value)} placeholder="0.00" />
          </label>
        </div>

        <details className="launch-advanced">
          <summary>Advanced</summary>
          <div className="launch-grid">
            <label className="launch-span launch-check">
              <input type="checkbox" checked={holderShare} onChange={(event) => setHolderShare(event.target.checked)} />
              <span>
                <strong>Holder fee sharing</strong>
                <small>Route this launch's creator fees to holders, split pro-rata. Changes where the creator share on the receipt goes.</small>
              </span>
            </label>
            <label className="launch-span">
              <span>Creator wallet</span>
              <input value={creatorWallet} onChange={(event) => setCreatorWallet(event.target.value)} placeholder="0x… leave blank to use the connected wallet" spellCheck={false} />
            </label>
            <label>
              <span>Creator tax (%)</span>
              <input type="number" min="0" max="10" step="0.5" inputMode="decimal" value={creatorTax} onChange={(event) => setCreatorTax(event.target.value)} />
            </label>
          </div>
        </details>

        <div className="launch-actions">
          <button type="button" className="launch-button" disabled title="Wallet connection is not wired yet">☎ Connect wallet</button>
          <span className="launch-actions-note">Sample build. No wallet, chain, or Pons connection yet.</span>
        </div>
      </form>

      <aside className="launch-receipt" aria-label="Launch receipt preview">
        <div className="launch-receipt-head">
          <div className="launch-receipt-image" aria-hidden="true">{ticker ? ticker.slice(0, 3) : '▣'}</div>
          <div>
            <strong>{name || 'Your token'}</strong>
            <span>{ticker ? `$${ticker}` : 'ticker'}</span>
          </div>
        </div>
        <dl className="launch-receipt-lines">
          <Line label="Launch fee" value={`${LAUNCH_FEE_ETH} ETH`} />
          <Line label="Developer buy" value={devBuyValue ? `${devBuyValue} ${paired}` : 'none'} />
          <Line label="Paired with" value={paired} />
          <Line label="Base trade fee" value={`${BASE_TRADE_FEE.toFixed(2)}%`} />
          <Line label="Creator tax" value={`${tax.toFixed(2)}%`} />
          <Line label="Traders pay in total" value={`${totalFee.toFixed(2)}%`} strong />
          <Line label="Creator fees go to" value={holderShare ? 'holders, pro-rata' : creatorWallet ? shorten(creatorWallet) : 'connected wallet'} />
          <Line label="Launch window" value="99% snipe tax, 3s" />
          <Line label="Graduation" value={`${GRADUATION_ETH} ETH raised`} />
          <Line label="Liquidity" value="locked" />
        </dl>
        <div className="launch-receipt-total">
          <span>Due at launch</span>
          <strong>{due.toFixed(4)} ETH</strong>
        </div>
        <p className="launch-fineprint">
          Sample figures copied from the Pons v2 launch form on September 7, 2026. Verify against Pons before launching; nothing here reads the chain yet.
        </p>
      </aside>
    </section>
  )
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="launch-line" data-strong={strong}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function shorten(address: string) {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address
}
