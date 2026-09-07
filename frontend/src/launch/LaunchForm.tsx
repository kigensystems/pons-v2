import { useEffect, useRef, useState } from 'react'
import { api, ApiError, type Intent, type LaunchConfigResponse, type Session } from './api'
import { describeIntent, formatBps, formatEth, gasAllowanceWei, isSettled, shortAddress } from './launchModel'
import { sendPreparedTransaction, WalletError } from './wallet'
import './launchLive.css'

type Props = { session: Session | null; config: LaunchConfigResponse | null; connecting: boolean; connected: boolean; onConnect: () => void; onClose: () => void; onLaunched: (intent: Intent) => void }
type Stage = 'form' | 'preparing' | 'review' | 'signing' | 'tracking'

const POLL_MS = 3000
const ZERO = '0x0000000000000000000000000000000000000000'
const nowSeconds = () => Math.floor(Date.now() / 1000)

export default function LaunchForm({ session, config, connecting, connected, onConnect, onClose, onLaunched }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const nameInput = useRef<HTMLInputElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [imageError, setImageError] = useState('')
  const [creatorTax, setCreatorTax] = useState('0')
  const [stage, setStage] = useState<Stage>('form')
  const [intent, setIntent] = useState<Intent | null>(null)
  const [problem, setProblem] = useState('')
  const [now, setNow] = useState(nowSeconds)
  const notified = useRef(false)

  useEffect(() => {
    const element = dialog.current
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    element?.showModal()
    nameInput.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => { element?.close(); document.body.style.overflow = overflow; opener?.focus() }
  }, [])

  useEffect(() => {
    if (!preview) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  // Poll a submitted intent until it settles.
  useEffect(() => {
    if (stage !== 'tracking' || !intent || isSettled(intent) && intent.status !== 'included') return
    if (intent.status === 'confirmed') return
    const timer = setTimeout(async () => {
      try { setIntent(await api.intent(intent.id)) } catch (failure) { if (failure instanceof ApiError && failure.status === 401) setProblem('Your session ended. Sign in again to keep following this launch.') }
    }, POLL_MS)
    return () => clearTimeout(timer)
  }, [stage, intent])

  useEffect(() => {
    if (intent && (intent.status === 'included' || intent.status === 'confirmed') && !notified.current) { notified.current = true; onLaunched(intent) }
  }, [intent, onLaunched])

  // Keep the quote countdown honest while a prepared intent is on screen.
  useEffect(() => {
    if (stage !== 'review') return
    const timer = setInterval(() => setNow(nowSeconds()), 15_000)
    return () => clearInterval(timer)
  }, [stage])

  // Dropped session or wallet change invalidates anything prepared but unsigned.
  if (!session && (stage === 'review' || stage === 'preparing')) {
    setStage('form'); setIntent(null); setProblem('Your wallet changed. Connect again and prepare a fresh quote.')
  }

  const taxBps = Math.round(Number(creatorTax) * 100)
  const maxTax = config?.maxCreatorTaxBps ?? 1000
  const taxValid = Number.isFinite(Number(creatorTax)) && taxBps >= 0 && taxBps <= maxTax
  const websiteValid = !website.trim() || /^https:\/\/\S+$/.test(website.trim())
  const gateOpen = Boolean(config?.launchEnabled && config.configs[0]?.enabled)
  const eligible = config?.eligibility?.canLaunch ?? true
  const ready = Boolean(session && config && gateOpen && eligible && name.trim() && /^[A-Z0-9]{1,12}$/.test(ticker) && taxValid && websiteValid && !imageError)

  function chooseImage(next?: File) {
    setFile(null); setPreview(''); setImageError('')
    if (!next) return
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(next.type) || next.size > 2 * 1024 * 1024) { setImageError('Choose a PNG, JPG, WebP or GIF under 2 MB.'); return }
    setFile(next); setPreview(URL.createObjectURL(next))
  }

  async function prepare() {
    if (!ready) return
    setStage('preparing'); setProblem('')
    try {
      const upload = file ? await api.upload(file) : null
      const body: Record<string, unknown> = { name: name.trim(), symbol: ticker, description: description.trim(), creatorTaxBps: taxBps, launchConfigId: 0, pairToken: ZERO, initialBuyWei: '0' }
      if (upload) body.logoUploadId = upload.id
      if (website.trim()) body.socials = { website: website.trim() }
      setIntent(await api.createIntent(crypto.randomUUID(), body))
      setNow(nowSeconds())
      setStage('review')
    } catch (failure) {
      setStage('form')
      setProblem(failure instanceof Error ? failure.message : 'The launch could not be prepared.')
    }
  }

  async function sign() {
    if (!intent || !session) return
    setStage('signing'); setProblem('')
    try {
      const gas = intent.simulation?.ok ? intent.simulation.gas : undefined
      const hash = await sendPreparedTransaction(session, intent.transaction, gas)
      setStage('tracking')
      setIntent(await api.submit(intent.id, hash))
    } catch (failure) {
      setStage('review')
      setProblem(failure instanceof WalletError || failure instanceof Error ? failure.message : 'The transaction was not sent.')
    }
  }

  const expiresIn = intent ? Math.max(0, intent.expiresAt - now) : 0
  const gasWei = gasAllowanceWei(intent?.simulation ?? null)
  const status = intent ? describeIntent(intent.status, intent.failure) : null
  const busy = stage === 'preparing' || stage === 'signing'
  const explorer = intent?.launch && config ? `${config.chainId === 4663 ? 'https://robinhoodchain.blockscout.com' : 'https://explorer.testnet.chain.robinhood.com'}/token/${intent.launch.token}` : null

  return <dialog ref={dialog} className="pad-dialog" onCancel={event => { event.preventDefault(); if (!busy) onClose() }} onClose={() => { if (!dialog.current?.open) onClose() }} aria-labelledby="pad-form-title" aria-describedby="pad-form-description">
    <form className="pad-form" onSubmit={event => { event.preventDefault(); if (stage === 'form') void prepare(); else if (stage === 'review') void sign() }}>
      <div className="pad-form-head"><div><p className="pad-kicker">Plum / The creation desk</p><h2 id="pad-form-title">An idea of your own.</h2></div><button type="button" className="pad-close" onClick={onClose} aria-label="Close creation desk" disabled={busy}>×</button></div>
      <div className="pad-form-body">
        <div className="pad-fields">
          <ol className="pad-steps pad-wide" aria-label="Progress">
            <li aria-current={stage === 'form' || stage === 'preparing' ? 'step' : undefined}>Describe</li>
            <li aria-current={stage === 'review' || stage === 'signing' ? 'step' : undefined}>Review and sign</li>
            <li aria-current={stage === 'tracking' ? 'step' : undefined}>Onchain</li>
          </ol>
          <p className="pad-fine pad-wide" id="pad-form-description">
            {stage === 'tracking' ? 'Your transaction is on Robinhood Chain. Plum verifies it against the quote you signed.' : 'Creates a real token on Robinhood Chain through Pons. You pay the creation fee and gas from your wallet.'}
          </p>
          {problem && <p className="pad-error pad-wide" role="alert">{problem}</p>}
          {config && !gateOpen && <p className="pad-error pad-wide" role="alert">Public launches are closed on the factory right now.</p>}
          {config && !eligible && <p className="pad-error pad-wide" role="alert">This wallet is not eligible to launch right now.</p>}

          {(stage === 'form' || stage === 'preparing') && <>
            <label><span>Name</span><input ref={nameInput} required value={name} onChange={event => setName(event.target.value)} placeholder="Your bright idea" maxLength={40} disabled={busy} /></label>
            <label><span>Ticker</span><input required value={ticker} onChange={event => setTicker(event.target.value.toUpperCase())} placeholder="SYMBOL" maxLength={12} pattern="[A-Z0-9]{1,12}" title="1 to 12 letters or numbers" disabled={busy} /></label>
            <label className="pad-wide"><span>Description <small>(optional)</small></span><textarea value={description} onChange={event => setDescription(event.target.value)} placeholder="A few words about your idea…" maxLength={280} rows={2} disabled={busy} /></label>
            <label className="pad-wide pad-file"><span>Coin image <small>(optional)</small></span><input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={event => chooseImage(event.target.files?.[0])} aria-describedby="pad-upload-help" disabled={busy} /><small className="pad-fine" id="pad-upload-help">PNG, JPG, WebP or GIF · Up to 2 MB · Stored by Plum and linked from the token</small></label>
            {preview && <div className="pad-wide pad-upload-preview"><img src={preview} alt="Your coin preview" /><button type="button" onClick={() => { chooseImage(); if (fileInput.current) fileInput.current.value = '' }}>Remove image</button></div>}
            {imageError && <p className="pad-error pad-wide" role="alert">{imageError}</p>}
            <label><span>Website <small>(optional)</small></span><input type="url" value={website} onChange={event => setWebsite(event.target.value)} placeholder="https://" disabled={busy} aria-invalid={!websiteValid} /></label>
            <label><span>Creator fee (%)</span><input type="number" min="0" max={maxTax / 100} step="0.01" inputMode="decimal" value={creatorTax} onChange={event => setCreatorTax(event.target.value)} disabled={busy} aria-invalid={!taxValid} /></label>
            <p className="pad-fine pad-wide">Paired with ETH. Initial buys and other pairs arrive once they are validated. The creator fee is fixed at launch and cannot be raised later.</p>
          </>}

          {(stage === 'review' || stage === 'signing') && intent && <div className="pad-review pad-wide">
            <div className="pad-review-card">
              {intent.tokenParams.logo ? <img src={intent.tokenParams.logo} alt="" /> : <div className="pad-review-mark" aria-hidden="true">{intent.tokenParams.symbol.slice(0, 2)}</div>}
              <div><strong>{intent.tokenParams.name}</strong><span>${intent.tokenParams.symbol} · paired with ETH</span>{intent.tokenParams.description && <p>{intent.tokenParams.description}</p>}</div>
            </div>
            <p className="pad-fine">Terms were read from the factory at block {intent.terms.sourceBlock.toLocaleString('en-US')}. This quote expires in {Math.ceil(expiresIn / 60)} min; the wallet will show the same recipient, value and data.</p>
            {intent.simulation && !intent.simulation.ok && <p className="pad-error" role="alert">Simulation failed: {intent.simulation.reason}</p>}
          </div>}

          {stage === 'tracking' && intent && status && <div className="pad-status pad-wide" data-tone={status.tone} role="status" aria-live="polite">
            <strong>{status.tone === 'active' && <span className="pad-pulse" aria-hidden="true" />} {status.label}</strong>
            <p>{status.detail}</p>
            {intent.launch && <p>Token <code>{intent.launch.token}</code>{explorer && <> · <a href={explorer} target="_blank" rel="noreferrer">View on Blockscout ↗</a></>}</p>}
            {intent.submissions.at(-1) && <p className="pad-fine">Transaction <code>{shortAddress(intent.submissions.at(-1)!.transactionHash)}</code></p>}
          </div>}
        </div>

        <aside className="pad-quote" aria-label="Launch terms"><p className="pad-kicker">{intent ? 'Your terms' : 'Live terms'}</p><dl>
          <Line label="Creation fee" value={config ? `${formatEth(config.launchFeeWei)} ETH` : '…'} />
          <Line label="Network gas" value={gasWei !== null ? `≤ ${formatEth(gasWei)} ETH` : intent ? 'Not estimated' : 'Estimated after review'} note={gasWei !== null ? 'allowance at the current fee cap' : undefined} />
          <Line label="Initial buy" value="None" />
          <Line label="Base trade fee" value={config?.configs[0] ? formatBps(Number(config.configs[0].curveFeeBps)) : '…'} />
          <Line label="Creator fee" value={taxValid ? formatBps(taxBps) : '—'} />
          <Line label="Total trade fee" value={config?.configs[0] && taxValid ? formatBps(Number(config.configs[0].curveFeeBps) + taxBps) : '—'} strong />
        </dl><div className="pad-quote-total" aria-live="polite" aria-atomic="true"><span>{gasWei !== null ? 'Up to, including gas' : 'Creation fee · excluding gas'}</span><strong>{config ? `${formatEth(BigInt(config.launchFeeWei) + (gasWei ?? 0n))} ETH` : '…'}</strong></div>
        <p className="pad-fine">{intent?.simulation?.ok ? `Wallet balance ${formatEth(intent.simulation.balanceWei)} ETH.` : config ? `Read at block ${Number(config.blockNumber).toLocaleString('en-US')}. Gas is estimated for your wallet during review.` : 'Reading the factory…'}</p></aside>
      </div>
      <div className="pad-form-foot">
        {!session
          ? <button type="button" className="pad-btn pad-btn--dark" onClick={onConnect} disabled={connecting}>{connecting ? 'Check your wallet…' : connected ? 'Sign in' : 'Connect wallet'} <span aria-hidden="true">↗</span></button>
          : stage === 'form' || stage === 'preparing'
            ? <button type="submit" className="pad-btn pad-btn--dark" disabled={!ready || busy}>{stage === 'preparing' ? 'Preparing…' : 'Review the launch'} <span aria-hidden="true">↗</span></button>
            : stage === 'review' || stage === 'signing'
              ? <>
                <button type="submit" className="pad-btn pad-btn--dark" disabled={busy || expiresIn === 0 || Boolean(intent?.simulation && !intent.simulation.ok)}>{stage === 'signing' ? 'Confirm in your wallet…' : 'Sign in wallet'} <span aria-hidden="true">↗</span></button>
                <button type="button" className="pad-btn pad-btn--quiet" disabled={busy} onClick={() => { setStage('form'); setIntent(null); setProblem('') }}>Edit</button>
              </>
              : <button type="button" className="pad-btn pad-btn--dark" onClick={onClose}>{intent && isSettled(intent) ? 'Done' : 'Keep browsing'} <span aria-hidden="true">↗</span></button>}
        <span className="pad-fine">
          {!session ? 'Signing in is a free message signature. Nothing is sent to the chain until you confirm a transaction.'
            : stage === 'review' ? 'Your wallet shows the exact transaction. Plum only learns the hash.'
            : stage === 'tracking' ? 'You can close this window; the launch keeps settling on its own.'
            : 'Fees are read live from the Pons factory.'}
        </span>
      </div>
    </form>
  </dialog>
}

function Line({ label, value, note, strong }: { label: string; value: string; note?: string; strong?: boolean }) {
  return <div className="pad-quote-line" data-strong={strong}><dt>{label}</dt><dd>{value}{note && <small>{note}</small>}</dd></div>
}
