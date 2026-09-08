// Launch intents: server-issued, wallet-bound, idempotent records created before the wallet signs.
// A launch enters the registry only when a receipt matches its intent exactly (see chain/verify.ts).
import { randomBytes, randomUUID } from 'node:crypto'
import { getAddress, isAddress, isHex, zeroAddress, type Address, type Hex } from 'viem'
import { HttpError } from './http.ts'
import { now, type Db } from './db.ts'
import type { Config } from './config.ts'
import type { ChainReader } from './chain/client.ts'
import { EMPTY_SOCIALS, encodeLaunchToken, transactionHashOfTerms, type Socials, type TokenParams } from './chain/encode.ts'
import { verifyLaunchReceipt } from './chain/verify.ts'
import type { createUploads } from './uploads.ts'

export type IntentStatus = 'prepared' | 'submitted' | 'included' | 'confirmed' | 'reverted' | 'rejected' | 'expired' | 'unresolved'
export type SubmissionState = 'pending' | 'included' | 'reverted' | 'rejected' | 'dropped' | 'superseded'

export type Terms = {
  launchFeeWei: string
  // The quote asset: ETH at the zero address, or an approved ERC-20. Threshold and phantom quote below are in its decimals.
  pair: { address: Address; symbol: string; name: string; decimals: number }
  supply: string
  curveFeeBps: number
  creatorTaxBps: number
  totalTradeFeeBps: number
  maxCreatorTaxBps: number
  graduationThresholdWei: string
  phantomQuoteWei: string
  sourceBlock: number
  sourceBlockHash: Hex
  observedAt: number
}

export type SimulationRecord =
  | { ok: true; gas: string; maxFeePerGas: string; maxPriorityFeePerGas: string; balanceWei: string; requiredWei: string; shortfallWei: string; simulatedAt: number }
  | { ok: false; code: string; reason: string; balanceWei: string | null; requiredWei?: string; shortfallWei?: string; simulatedAt: number }

type IntentRow = {
  id: string; idempotency_key: string; address: string; chain_id: number; target: string; calldata: string; value_wei: string; params_hash: string; salt: string
  expected_economics: string; launch_config_id: number; pair_token: string; token_params: string; terms: string; simulation: string | null; source_block: number
  status: IntentStatus; failure: string | null; created_at: number; expires_at: number; updated_at: number
}
type SubmissionRow = { tx_hash: string; intent_id: string; state: SubmissionState; detail: string | null; attempts: number; submitted_at: number; updated_at: number }
type LaunchRow = { token: string; curve: string; tx_hash: string; block_number: number; block_hash: string; confirmation_state: string }

const DROP_AFTER_SECONDS = 10 * 60
// A hash the network has not seen is rechecked at growing intervals, so a stream of invented hashes
// cannot turn the worker into an RPC amplifier; a real transaction lands within a few seconds anyway.
const MAX_PENDING_SUBMISSIONS = 3
const UNSEEN = 'Transaction not seen by the network yet'
const recheckDelay = (attempts: number) => Math.min(60, 5 * 2 ** Math.max(0, attempts - 1))
const NAME_MAX = 40
const DESCRIPTION_MAX = 280
const SOCIAL_MAX = 200

function text(value: unknown, field: string, max: number, required = false): string {
  if (value === undefined || value === null) { if (required) throw new HttpError(400, `${field} is required`, 'invalid_' + field); return '' }
  if (typeof value !== 'string') throw new HttpError(400, `${field} must be text`, 'invalid_' + field)
  const trimmed = value.trim()
  if (required && !trimmed) throw new HttpError(400, `${field} is required`, 'invalid_' + field)
  if (trimmed.length > max) throw new HttpError(400, `${field} is longer than ${max} characters`, 'invalid_' + field)
  // oxlint-disable-next-line no-control-regex -- rejecting control characters is the point
  if (/[\u0000-\u001f\u007f]/.test(trimmed)) throw new HttpError(400, `${field} contains control characters`, 'invalid_' + field)
  return trimmed
}

function socialsOf(value: unknown): Socials {
  if (value === undefined || value === null) return EMPTY_SOCIALS
  if (typeof value !== 'object') throw new HttpError(400, 'socials must be an object', 'invalid_socials')
  const out = { ...EMPTY_SOCIALS }
  for (const key of Object.keys(EMPTY_SOCIALS) as (keyof Socials)[]) {
    const entry = text((value as Record<string, unknown>)[key], `socials.${key}`, SOCIAL_MAX)
    if (!entry) continue
    let url: URL
    try { url = new URL(entry) } catch { throw new HttpError(400, `socials.${key} must be an https URL`, 'invalid_socials') }
    if (url.protocol !== 'https:') throw new HttpError(400, `socials.${key} must be an https URL`, 'invalid_socials')
    out[key] = entry
  }
  return out
}

export function createIntents(db: Db, config: Config, chain: ChainReader, uploads: ReturnType<typeof createUploads>) {
  const selectById = db.prepare('SELECT * FROM launch_intents WHERE id = ?')
  const selectByKey = db.prepare('SELECT * FROM launch_intents WHERE address = ? AND idempotency_key = ?')
  const insert = db.prepare(`INSERT INTO launch_intents (id, idempotency_key, address, chain_id, target, calldata, value_wei, params_hash, salt, expected_economics,
    launch_config_id, pair_token, token_params, terms, simulation, source_block, status, failure, created_at, expires_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'prepared', NULL, ?, ?, ?)`)
  const setStatus = db.prepare('UPDATE launch_intents SET status = ?, failure = ?, updated_at = ? WHERE id = ?')
  const selectSubmissions = db.prepare('SELECT * FROM submissions WHERE intent_id = ? ORDER BY submitted_at ASC')
  const selectSubmission = db.prepare('SELECT * FROM submissions WHERE tx_hash = ?')
  const insertSubmission = db.prepare("INSERT INTO submissions (tx_hash, intent_id, state, detail, attempts, submitted_at, updated_at) VALUES (?, ?, 'pending', NULL, 0, ?, ?)")
  const setSubmission = db.prepare('UPDATE submissions SET state = ?, detail = ?, attempts = attempts + 1, updated_at = ? WHERE tx_hash = ?')
  // Prepared intents expire in one statement; the worker only visits intents with a transaction to check.
  const expirePrepared = db.prepare("UPDATE launch_intents SET status = 'expired', failure = 'No transaction was submitted before the intent expired', updated_at = ? WHERE status = 'prepared' AND expires_at < ?")
  const selectActive = db.prepare("SELECT id FROM launch_intents WHERE status = 'submitted' ORDER BY created_at ASC LIMIT 200")
  const countPending = db.prepare("SELECT COUNT(*) AS n FROM submissions WHERE intent_id = ? AND state = 'pending'")
  const selectLaunch = db.prepare('SELECT token, curve, tx_hash, block_number, block_hash, confirmation_state FROM launches WHERE intent_id = ?')
  const selectIncluded = db.prepare("SELECT intent_id, block_number, block_hash FROM launches WHERE confirmation_state = 'included' LIMIT 200")
  const insertLaunch = db.prepare(`INSERT INTO launches (chain_id, token, curve, factory, creator, creator_fee_recipient, intent_id, tx_hash, log_index, block_number, block_hash, block_time,
    launch_config_id, pair_token, name, symbol, logo, description, creator_tax_bps, buyback_enabled, confirmation_state, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'included', ?, ?)`)
  const setLaunchState = db.prepare('UPDATE launches SET confirmation_state = ?, updated_at = ? WHERE intent_id = ?')
  const deleteLaunch = db.prepare('DELETE FROM launches WHERE intent_id = ?')

  const load = (id: string) => selectById.get(id) as IntentRow | undefined

  function present(row: IntentRow) {
    const submissions = (selectSubmissions.all(row.id) as SubmissionRow[]).map(s => ({ transactionHash: s.tx_hash, state: s.state, detail: s.detail, submittedAt: s.submitted_at, updatedAt: s.updated_at }))
    const launch = selectLaunch.get(row.id) as LaunchRow | undefined
    return {
      id: row.id, status: row.status, failure: row.failure, wallet: row.address, chainId: row.chain_id,
      createdAt: row.created_at, expiresAt: row.expires_at, updatedAt: row.updated_at,
      transaction: { chainId: row.chain_id, to: row.target, data: row.calldata, value: row.value_wei },
      tokenParams: JSON.parse(row.token_params) as TokenParams,
      launchConfigId: row.launch_config_id, pairToken: row.pair_token, paramsHash: row.params_hash,
      terms: JSON.parse(row.terms) as Terms,
      simulation: row.simulation ? JSON.parse(row.simulation) as SimulationRecord : null,
      submissions,
      launch: launch ? { token: launch.token, curve: launch.curve, transactionHash: launch.tx_hash, blockNumber: launch.block_number, blockHash: launch.block_hash, confirmationState: launch.confirmation_state } : null,
    }
  }

  // The gas limit sent to the wallet is the estimate plus a fifth: the launch deploys contracts, and
  // an estimate taken one block can fall short in the next. The quote and the balance check use the
  // same buffered figure, so what the wallet locks is what the desk showed.
  const GAS_BUFFER_PCT = 20n

  async function simulate(address: Address, tx: { to: Address; data: Hex; value: bigint }): Promise<SimulationRecord> {
    const [result, balance] = await Promise.all([chain.simulate({ account: address, ...tx }), chain.balance(address).catch(() => null)])
    if (!result.ok) return { ok: false, code: result.code, reason: result.reason, balanceWei: balance === null ? null : balance.toString(), simulatedAt: now() }
    result.gas = result.gas + (result.gas * GAS_BUFFER_PCT) / 100n
    const required = tx.value + result.gas * result.maxFeePerGas
    const shortfall = balance === null ? 0n : required > balance ? required - balance : 0n
    if (shortfall > 0n) return { ok: false, code: 'insufficient_funds', reason: 'Wallet balance cannot cover the creation fee plus gas', balanceWei: balance!.toString(), requiredWei: required.toString(), shortfallWei: shortfall.toString(), simulatedAt: now() }
    return { ok: true, gas: result.gas.toString(), maxFeePerGas: result.maxFeePerGas.toString(), maxPriorityFeePerGas: result.maxPriorityFeePerGas.toString(),
      balanceWei: balance === null ? '' : balance.toString(), requiredWei: required.toString(), shortfallWei: '0', simulatedAt: now() }
  }

  async function reconcileIntent(id: string): Promise<void> {
    const row = load(id)
    if (!row) return
    if (row.status === 'prepared') {
      if (row.expires_at < now()) setStatus.run('expired', 'No transaction was submitted before the intent expired', now(), id)
      return
    }
    if (row.status !== 'submitted') return
    const submissions = (selectSubmissions.all(id) as SubmissionRow[]).filter(s => s.state === 'pending')
    if (submissions.length === 0) {
      const all = selectSubmissions.all(id) as SubmissionRow[]
      const failure = all.every(s => s.state === 'dropped') ? 'Submitted transaction was not found on the network' : all.find(s => s.state === 'reverted') ? 'Transaction reverted' : (all.find(s => s.state === 'rejected')?.detail ?? 'Submission did not match the intent')
      const status: IntentStatus = all.every(s => s.state === 'dropped') ? 'unresolved' : all.some(s => s.state === 'reverted') ? 'reverted' : 'rejected'
      setStatus.run(status, failure, now(), id)
      return
    }
    const intent = { address: getAddress(row.address), chainId: row.chain_id, target: getAddress(row.target), calldata: row.calldata as Hex, valueWei: BigInt(row.value_wei) }
    for (const submission of submissions) {
      const hash = submission.tx_hash as Hex
      if (submission.attempts > 0 && submission.detail === UNSEEN && submission.updated_at + recheckDelay(submission.attempts) > now()) continue
      const receipt = await chain.receipt(hash)
      if (!receipt) {
        const tx = await chain.transaction(hash)
        if (!tx && submission.submitted_at + DROP_AFTER_SECONDS < now()) setSubmission.run('dropped', 'Transaction not found after the waiting period', now(), hash)
        else setSubmission.run('pending', tx ? null : UNSEEN, now(), hash)
        continue
      }
      const [tx, block] = await Promise.all([chain.transaction(hash), chain.blockByNumber(receipt.blockNumber)])
      if (!tx || !block) { setSubmission.run('pending', 'Receipt seen; waiting for transaction and block', now(), hash); continue }
      const result = verifyLaunchReceipt({ factory: getAddress(config.factory), intent, tx, receipt, block })
      if (!result.ok) {
        if (result.code === 'block_mismatch') { setSubmission.run('pending', result.reason, now(), hash); continue }
        setSubmission.run(result.code === 'reverted' ? 'reverted' : 'rejected', result.reason, now(), hash)
        continue
      }
      const params = JSON.parse(row.token_params) as TokenParams
      db.exec('BEGIN')
      try {
        insertLaunch.run(row.chain_id, result.token.toLowerCase(), result.curve.toLowerCase(), config.factory.toLowerCase(), row.address, params.creatorFeeRecipient, row.id, hash, result.logIndex,
          Number(result.blockNumber), result.blockHash, Number(result.blockTime), Number(result.launchConfigId), result.pairToken.toLowerCase(),
          params.name, params.symbol, params.logo, params.description, params.creatorTaxBps, params.buybackEnabled ? 1 : 0, now(), now())
        setSubmission.run('included', null, now(), hash)
        for (const other of submissions) if (other.tx_hash !== hash) setSubmission.run('superseded', 'Another submission for this intent was included', now(), other.tx_hash)
        setStatus.run('included', null, now(), id)
        db.exec('COMMIT')
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
      return
    }
    // Every pending submission was resolved without inclusion: settle the intent on the next pass.
    if ((selectSubmissions.all(id) as SubmissionRow[]).every(s => s.state !== 'pending')) await reconcileIntent(id)
  }

  async function confirmLaunches(): Promise<void> {
    const included = selectIncluded.all() as { intent_id: string; block_number: number; block_hash: string }[]
    if (included.length === 0) return
    const latest = await chain.latestBlock()
    for (const launch of included) {
      if (latest.number - BigInt(launch.block_number) < BigInt(config.confirmations)) continue
      const block = await chain.blockByNumber(BigInt(launch.block_number))
      if (block && block.hash.toLowerCase() === launch.block_hash.toLowerCase()) {
        setLaunchState.run('confirmed', now(), launch.intent_id)
        setStatus.run('confirmed', null, now(), launch.intent_id)
      } else {
        // Reorganized: drop the registry row and re-verify the submission from the current chain.
        db.exec('BEGIN')
        try {
          deleteLaunch.run(launch.intent_id)
          for (const s of selectSubmissions.all(launch.intent_id) as SubmissionRow[]) if (s.state === 'included' || s.state === 'superseded') setSubmission.run('pending', 'Block reorganized; re-verifying', now(), s.tx_hash)
          setStatus.run('submitted', null, now(), launch.intent_id)
          db.exec('COMMIT')
        } catch (error) { db.exec('ROLLBACK'); throw error }
      }
    }
  }

  let running = false
  async function reconcileAll(): Promise<void> {
    if (running) return
    running = true
    try {
      expirePrepared.run(now(), now())
      for (const { id } of selectActive.all() as { id: string }[]) {
        try { await reconcileIntent(id) } catch (error) { console.error('reconcile', id, error instanceof Error ? error.message.slice(0, 200) : error) }
      }
      await confirmLaunches()
    } catch (error) {
      console.error('confirm', error instanceof Error ? error.message.slice(0, 200) : error)
    } finally { running = false }
  }

  return {
    present,
    get(id: string, address: Address) {
      const row = load(id)
      if (!row || getAddress(row.address) !== getAddress(address)) throw new HttpError(404, 'Intent not found', 'not_found')
      return present(row)
    },

    async create(address: Address, idempotencyKey: string, body: Record<string, unknown>) {
      if (!idempotencyKey || idempotencyKey.length > 128) throw new HttpError(400, 'Idempotency-Key header is required (1-128 characters)', 'missing_idempotency_key')
      const existing = selectByKey.get(address, idempotencyKey) as IntentRow | undefined
      if (existing) return { intent: present(existing), created: false }

      const name = text(body.name, 'name', NAME_MAX, true)
      const symbol = text(body.symbol, 'symbol', 12, true)
      if (!/^[A-Z0-9]{1,12}$/.test(symbol)) throw new HttpError(400, 'symbol must be 1-12 upper-case letters or digits', 'invalid_symbol')
      const description = text(body.description, 'description', DESCRIPTION_MAX)
      const socials = socialsOf(body.socials)
      const pairTokenRaw = body.pairToken === undefined || body.pairToken === null ? zeroAddress : body.pairToken
      if (typeof pairTokenRaw !== 'string' || !isAddress(pairTokenRaw)) throw new HttpError(400, 'pairToken must be an address (the zero address for ETH)', 'invalid_pair')
      const pairToken = getAddress(pairTokenRaw)
      if (body.initialBuyWei !== undefined && body.initialBuyWei !== '0') throw new HttpError(400, 'Initial buys are not available yet', 'unsupported_initial_buy')
      const buybackEnabled = body.buybackEnabled === undefined ? false : body.buybackEnabled
      if (typeof buybackEnabled !== 'boolean') throw new HttpError(400, 'buybackEnabled must be a boolean', 'invalid_buyback')
      const launchConfigId = body.launchConfigId === undefined ? 0 : body.launchConfigId
      if (!Number.isInteger(launchConfigId) || (launchConfigId as number) < 0) throw new HttpError(400, 'launchConfigId must be a non-negative integer', 'invalid_config')
      const creatorTaxBps = body.creatorTaxBps === undefined ? 0 : body.creatorTaxBps
      if (!Number.isInteger(creatorTaxBps) || (creatorTaxBps as number) < 0) throw new HttpError(400, 'creatorTaxBps must be a non-negative integer', 'invalid_creator_tax')
      let logo = ''
      if (body.logoUploadId !== undefined && body.logoUploadId !== null && body.logoUploadId !== '') {
        if (typeof body.logoUploadId !== 'string') throw new HttpError(400, 'logoUploadId must be a string', 'invalid_logo')
        const upload = uploads.lookup(body.logoUploadId)
        if (!upload || !uploads.ownedBy(upload.id, getAddress(address))) throw new HttpError(400, 'logoUploadId is not one of your uploads', 'invalid_logo')
        logo = uploads.urlFor(upload.id)
      }
      const feeRecipient = body.creatorFeeRecipient === undefined ? address : body.creatorFeeRecipient
      if (typeof feeRecipient !== 'string' || !isAddress(feeRecipient) || feeRecipient === zeroAddress) throw new HttpError(400, 'creatorFeeRecipient must be a non-zero address', 'invalid_fee_recipient')

      const settings = await chain.launchSettings()
      if (!settings.launchEnabled) throw new HttpError(409, 'Public launches are closed on the factory right now', 'launch_disabled')
      const launchConfig = settings.configs[launchConfigId as number]
      if (!launchConfig || !launchConfig.enabled) throw new HttpError(409, 'That launch configuration is not enabled', 'config_disabled')
      if ((creatorTaxBps as number) > settings.maxCreatorTaxBps) throw new HttpError(400, `creatorTaxBps exceeds the factory maximum of ${settings.maxCreatorTaxBps}`, 'creator_tax_too_high')
      if (!(await chain.canLaunch(address, settings.blockNumber))) throw new HttpError(409, 'This wallet is not eligible to launch on the factory right now', 'not_eligible')

      // An ERC-20 pair prices the whole launch in that asset: its own threshold and phantom quote, and its own
      // economics pin read at the same block as the rest of the terms. The creation fee stays in ETH.
      let pair: Terms['pair'] = { address: zeroAddress, symbol: 'ETH', name: 'Ether', decimals: 18 }
      let economics = { expected: launchConfig.expectedEconomicsEth, graduationThreshold: launchConfig.graduationThreshold, phantomQuote: launchConfig.phantomQuote }
      if (pairToken !== zeroAddress) {
        const approved = (await chain.pairTokens()).items.find(item => item.address.toLowerCase() === pairToken.toLowerCase())
        if (!approved) throw new HttpError(400, 'That pair asset is not approved on the factory', 'unsupported_pair')
        pair = { address: pairToken, symbol: approved.symbol, name: approved.name, decimals: approved.decimals }
        economics = { expected: await chain.launchEconomics(BigInt(launchConfigId as number), pairToken, settings.blockNumber), graduationThreshold: approved.graduationThreshold, phantomQuote: approved.phantomQuote }
      }

      const params: TokenParams = {
        name, symbol, logo, description, socials,
        creatorFeeRecipient: getAddress(feeRecipient), creatorTaxBps: creatorTaxBps as number, buybackEnabled,
        expectedEconomics: economics.expected, salt: `0x${randomBytes(32).toString('hex')}`,
      }
      const tx = encodeLaunchToken({ chainId: config.chainId, factory: config.factory, params, launchConfigId: BigInt(launchConfigId as number), pairToken, launchFee: settings.launchFeeWei })
      const terms: Terms = {
        launchFeeWei: settings.launchFeeWei.toString(), pair, supply: launchConfig.supply.toString(), curveFeeBps: Number(launchConfig.curveFeeBps), creatorTaxBps: params.creatorTaxBps,
        totalTradeFeeBps: Number(launchConfig.curveFeeBps) + params.creatorTaxBps, maxCreatorTaxBps: settings.maxCreatorTaxBps,
        graduationThresholdWei: economics.graduationThreshold.toString(), phantomQuoteWei: economics.phantomQuote.toString(),
        sourceBlock: Number(settings.blockNumber), sourceBlockHash: settings.blockHash, observedAt: settings.observedAt,
      }
      const simulation = await simulate(address, tx)
      const id = randomUUID()
      const created = now()
      try {
        insert.run(id, idempotencyKey, getAddress(address), config.chainId, tx.to, tx.data, tx.value.toString(), transactionHashOfTerms(tx), params.salt, params.expectedEconomics,
          launchConfigId as number, pairToken.toLowerCase(), JSON.stringify(params), JSON.stringify(terms), JSON.stringify(simulation), Number(settings.blockNumber), created, created + config.intentTtlSeconds, created)
      } catch (error) {
        // A concurrent request with the same key won the race; return its intent.
        const raced = selectByKey.get(address, idempotencyKey) as IntentRow | undefined
        if (raced) return { intent: present(raced), created: false }
        throw error
      }
      return { intent: present(load(id)!), created: true }
    },

    async submit(id: string, address: Address, body: Record<string, unknown>) {
      const row = load(id)
      if (!row || getAddress(row.address) !== getAddress(address)) throw new HttpError(404, 'Intent not found', 'not_found')
      const hash = body.transactionHash
      if (typeof hash !== 'string' || !isHex(hash) || hash.length !== 66) throw new HttpError(400, 'transactionHash must be a 32-byte hex hash', 'invalid_hash')
      const lower = hash.toLowerCase() as Hex
      const existing = selectSubmission.get(lower) as SubmissionRow | undefined
      if (existing && existing.intent_id !== id) throw new HttpError(409, 'That transaction hash belongs to another intent', 'hash_taken')
      if (!existing) {
        if (row.status !== 'prepared' && row.status !== 'submitted') throw new HttpError(409, `Intent is ${row.status} and cannot accept a submission`, 'intent_closed')
        if (row.expires_at < now()) { setStatus.run('expired', 'No transaction was submitted before the intent expired', now(), id); throw new HttpError(409, 'Intent expired before submission', 'intent_expired') }
        if ((countPending.get(id) as { n: number }).n >= MAX_PENDING_SUBMISSIONS) throw new HttpError(409, `An intent tracks at most ${MAX_PENDING_SUBMISSIONS} unsettled transactions`, 'too_many_submissions')
        insertSubmission.run(lower, id, now(), now())
        setStatus.run('submitted', null, now(), id)
      }
      try { await reconcileIntent(id) } catch (error) { console.error('reconcile', id, error instanceof Error ? error.message.slice(0, 200) : error) }
      return present(load(id)!)
    },

    reconcileIntent,
    reconcileAll,
    startWorker(intervalMs: number) {
      const timer = setInterval(() => { void reconcileAll() }, intervalMs)
      timer.unref()
      void reconcileAll()
      return () => clearInterval(timer)
    },
  }
}
