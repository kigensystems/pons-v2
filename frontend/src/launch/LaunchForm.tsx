import { useEffect, useRef, useState } from 'react'
import { demoQuote, DEMO_LAUNCH_FEE, DEMO_BASE_FEE, type Paired } from './launchModel'

export type LaunchedToken = { id: string; name: string; ticker: string; description: string; image: string; paired: Paired; totalFee: number }
type Props = { wallet: boolean; onConnect: () => void; onClose: () => void; onLaunch: (token: LaunchedToken) => void }

export default function LaunchForm({ wallet, onConnect, onClose, onLaunch }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const nameInput = useRef<HTMLInputElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const reader = useRef<FileReader | null>(null)
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [imageError, setImageError] = useState('')
  const [readingImage, setReadingImage] = useState(false)
  const [paired, setPaired] = useState<Paired>('ETH')
  const [devBuy, setDevBuy] = useState('')
  const [creatorTax, setCreatorTax] = useState('0')

  useEffect(() => {
    const element = dialog.current
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    element?.showModal()
    nameInput.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => { reader.current?.abort(); element?.close(); document.body.style.overflow = overflow; opener?.focus() }
  }, [])

  const quote = demoQuote(Number(creatorTax), Number(devBuy), paired)
  const ready = Boolean(wallet && name.trim() && /^[A-Z0-9]{1,12}$/.test(ticker) && !readingImage && !imageError)

  function readImage(file?: File) {
    reader.current?.abort()
    setImage(''); setImageError(''); setReadingImage(false)
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setImageError('Choose a PNG, JPG, WebP or GIF under 2 MB.'); return
    }
    const next = new FileReader()
    reader.current = next; setReadingImage(true)
    next.onload = () => { setImage(String(next.result)); setReadingImage(false) }
    next.onerror = () => { setImageError('That image could not be read. Try another file.'); setReadingImage(false) }
    next.readAsDataURL(file)
  }

  return <dialog ref={dialog} className="pad-dialog" onCancel={event => { event.preventDefault(); onClose() }} onClose={() => { if (!dialog.current?.open) onClose() }} aria-labelledby="pad-form-title" aria-describedby="pad-form-description">
    <form className="pad-form" onSubmit={event => {
      event.preventDefault()
      if (!ready) return
      onLaunch({ id: crypto.randomUUID(), name: name.trim(), ticker, description: description.trim(), image, paired, totalFee: quote.totalFee })
    }}>
      <div className="pad-form-head"><div><p className="pad-kicker">Plum / The creation desk</p><h2 id="pad-form-title">An idea of your own.</h2></div><button type="button" className="pad-close" onClick={onClose} aria-label="Close creation desk">×</button></div>
      <div className="pad-form-body">
        <div className="pad-fields">
          <p className="pad-fine pad-wide" id="pad-form-description">Make a demo coin. Nothing is published or sent to a chain.</p>
          <label><span>Name</span><input ref={nameInput} required value={name} onChange={event => setName(event.target.value)} placeholder="Your bright idea" maxLength={40} /></label>
          <label><span>Ticker</span><input required value={ticker} onChange={event => setTicker(event.target.value.toUpperCase())} placeholder="SYMBOL" maxLength={12} pattern="[A-Z0-9]{1,12}" title="1 to 12 letters or numbers" /></label>
          <label className="pad-wide"><span>Description <small>(optional)</small></span><textarea value={description} onChange={event => setDescription(event.target.value)} placeholder="A few words about your idea…" maxLength={280} rows={2} /></label>
          <label className="pad-wide pad-file"><span>Coin image <small>(optional)</small></span><input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={event => readImage(event.target.files?.[0])} aria-describedby="pad-upload-help" /><small className="pad-fine" id="pad-upload-help">PNG, JPG, WebP or GIF · Up to 2 MB · Kept in this tab</small></label>
          {image && <div className="pad-wide pad-upload-preview"><img src={image} alt="Your coin preview" onError={() => { setImage(''); setImageError('That file is not a readable image. Try another file.') }} /><button type="button" onClick={() => { setImage(''); if (fileInput.current) fileInput.current.value = '' }}>Remove image</button></div>}
          {imageError && <p className="pad-error pad-wide" role="alert">{imageError}</p>}
          <label><span>Paired asset</span><select value={paired} onChange={event => setPaired(event.target.value as Paired)}><option>ETH</option><option>USDG</option><option>cbBTC</option></select></label>
          <label><span>Initial buy ({paired})</span><input type="number" min="0" max="1000000" step="0.00000001" inputMode="decimal" value={devBuy} onChange={event => setDevBuy(event.target.value)} placeholder="0.00" /></label>
          <label><span>Creator fee (%)</span><input type="number" min="0" max="10" step="0.01" inputMode="decimal" value={creatorTax} onChange={event => setCreatorTax(event.target.value)} /></label>
          <p className="pad-fine">Sample settings.<br />Try a fee from 0 to 10%.</p>
        </div>
        <aside className="pad-quote" aria-label="Illustrative fee quote"><p className="pad-kicker">Your sample quote</p><dl>
          <Line label="Creation fee" value={`${DEMO_LAUNCH_FEE} ETH`} />
          <Line label="Initial buy" value={quote.buy ? `${quote.buy} ${paired}` : 'None'} />
          <Line label="Base trade fee" value={`${DEMO_BASE_FEE.toFixed(2)}%`} />
          <Line label="Creator fee" value={`${quote.tax.toFixed(2)}%`} />
          <Line label="Total trade fee" value={`${quote.totalFee.toFixed(2)}%`} strong />
          <Line label="Network gas" value="Not estimated" />
        </dl><div className="pad-quote-total" aria-live="polite" aria-atomic="true"><span>Illustrative total · excluding gas</span><strong>{quote.total}</strong></div><p className="pad-fine">These are example figures, not current Pons fees. No payment is due. A live launch would need a fresh quote.</p></aside>
      </div>
      <div className="pad-form-foot">{wallet ? <button type="submit" className="pad-btn pad-btn--dark" disabled={!ready}>{readingImage ? 'Reading image…' : 'Add demo coin'} <span aria-hidden="true">↗</span></button> : <button type="button" className="pad-btn pad-btn--dark" onClick={event => { event.preventDefault(); onConnect() }}>Connect demo <span aria-hidden="true">↗</span></button>}<span className="pad-fine">{wallet ? 'Your coin stays for this visit. Leaving Explore or reloading clears it.' : 'Try the flow with a demo connection. No wallet or signature needed.'}</span></div>
    </form>
  </dialog>
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className="pad-quote-line" data-strong={strong}><dt>{label}</dt><dd>{value}</dd></div>
}
