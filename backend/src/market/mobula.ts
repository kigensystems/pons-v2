// Mobula market-data adapter. Registry-scoped, cached in market_snapshots with observed/retrieved
// times, in-flight requests coalesced, 429/transient failures retried with bounded backoff.
// A missing key disables enrichment; the registry stays intact without it.
import { now, type Db } from './../db.ts'
import { getAddress, isAddress, type Address } from 'viem'

export type MarketStatus = 'ok' | 'stale' | 'error' | 'unavailable' | 'unsupported'
export type MarketSnapshot<T = unknown> = { status: MarketStatus; source: 'mobula'; payload: T | null; observedAt: number | null; retrievedAt: number | null; error: string | null }

export type TokenMarket = {
  priceUsd: number | null
  marketCapUsd: number | null
  volume24hUsd: number | null
  priceChange24hPct: number | null
  liquidityUsd: number | null
}

export type Candle = { time: number; open: number; close: number; high: number; low: number; volume: number }

// One pons coin as Mobula's pulse feed reports it: identity, curve progress and a market snapshot.
export type PulseCoin = {
  token: Address; name: string; symbol: string; logo: string | null; deployer: Address | null; description: string
  launchedAt: number | null; graduatedAt: number | null; bonded: boolean; bondingPct: number | null
  priceUsd: number | null; marketCapUsd: number | null; liquidityUsd: number | null; volume24hUsd: number | null; priceChange24hPct: number | null; holders: number | null
}

export type MobulaOptions = {
  apiKey: string | null
  baseUrl: string
  chainId: number
  fetch?: typeof fetch
  detailsTtlSeconds?: number
  candlesTtlSeconds?: number
  now?: () => number
}

const PERIODS = new Set(['1m', '5m', '15m', '1h', '4h', '1d'])

export function createMobula(db: Db, options: MobulaOptions) {
  const fetchImpl = options.fetch ?? fetch
  const clock = options.now ?? now
  const detailsTtl = options.detailsTtlSeconds ?? 60
  const candlesTtl = options.candlesTtlSeconds ?? 60
  const inflight = new Map<string, Promise<MarketSnapshot>>()
  const upsert = db.prepare(`INSERT INTO market_snapshots (chain_id, token, kind, source, status, payload, observed_at, retrieved_at, error)
    VALUES (?, ?, ?, 'mobula', ?, ?, ?, ?, ?)
    ON CONFLICT (chain_id, token, kind) DO UPDATE SET status = excluded.status, payload = excluded.payload, observed_at = excluded.observed_at, retrieved_at = excluded.retrieved_at, error = excluded.error`)
  const select = db.prepare('SELECT status, payload, observed_at, retrieved_at, error FROM market_snapshots WHERE chain_id = ? AND token = ? AND kind = ?')

  function cached<T>(token: string, kind: string): MarketSnapshot<T> | null {
    const row = select.get(options.chainId, token, kind) as { status: MarketStatus; payload: string | null; observed_at: number | null; retrieved_at: number; error: string | null } | undefined
    if (!row) return null
    return { status: row.status, source: 'mobula', payload: row.payload ? JSON.parse(row.payload) as T : null, observedAt: row.observed_at, retrievedAt: row.retrieved_at, error: row.error }
  }

  async function request(path: string, params: Record<string, string>): Promise<{ ok: true; body: unknown } | { ok: false; status: number | null; error: string }> {
    const url = new URL(path, options.baseUrl)
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
    let delay = 500
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetchImpl(url, { headers: { Authorization: options.apiKey! }, signal: AbortSignal.timeout(10_000) })
        if (response.ok) return { ok: true, body: await response.json() }
        if (response.status === 429 || response.status >= 500) {
          if (attempt < 2) { await new Promise(r => setTimeout(r, delay)); delay *= 2; continue }
        }
        return { ok: false, status: response.status, error: `Mobula responded ${response.status}` }
      } catch (error) {
        if (attempt < 2) { await new Promise(r => setTimeout(r, delay)); delay *= 2; continue }
        return { ok: false, status: null, error: error instanceof Error && error.name === 'TimeoutError' ? 'Mobula request timed out' : 'Mobula request failed' }
      }
    }
    return { ok: false, status: null, error: 'Mobula request failed' }
  }

  // Serve fresh cache, otherwise refresh; on failure keep the last payload marked stale.
  async function refresh<T>(token: string, kind: string, ttl: number, load: () => Promise<{ ok: true; payload: T; observedAt: number | null } | { ok: false; status: number | null; error: string }>): Promise<MarketSnapshot<T>> {
    const previous = cached<T>(token, kind)
    if (previous && previous.retrievedAt !== null && previous.retrievedAt + ttl > clock() && previous.status === 'ok') return previous
    if (!options.apiKey) return { status: 'unavailable', source: 'mobula', payload: previous?.payload ?? null, observedAt: previous?.observedAt ?? null, retrievedAt: previous?.retrievedAt ?? null, error: 'Market data is not configured' }
    const key = `${kind}:${token}`
    const pending = inflight.get(key)
    if (pending) return pending as Promise<MarketSnapshot<T>>
    const job = (async (): Promise<MarketSnapshot<T>> => {
      const result = await load()
      const retrievedAt = clock()
      let snapshot: MarketSnapshot<T>
      if (result.ok) snapshot = { status: 'ok', source: 'mobula', payload: result.payload, observedAt: result.observedAt, retrievedAt, error: null }
      else if (result.status === 404) snapshot = { status: 'unsupported', source: 'mobula', payload: null, observedAt: null, retrievedAt, error: 'Token not indexed yet' }
      else snapshot = { status: previous?.payload ? 'stale' : 'error', source: 'mobula', payload: previous?.payload ?? null, observedAt: previous?.observedAt ?? null, retrievedAt, error: result.error }
      upsert.run(options.chainId, token, kind, snapshot.status, snapshot.payload === null ? null : JSON.stringify(snapshot.payload), snapshot.observedAt, retrievedAt, snapshot.error)
      return snapshot
    })().finally(() => inflight.delete(key))
    inflight.set(key, job as Promise<MarketSnapshot>)
    return job
  }

  const num = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null
  const text = (value: unknown): string => typeof value === 'string' ? value.trim().slice(0, 80) : ''
  // Mobula timestamps arrive as ISO strings or epoch numbers; both become unix seconds.
  const seconds = (value: unknown): number | null => {
    const ms = typeof value === 'string' ? Date.parse(value) : typeof value === 'number' ? (value > 1e12 ? value : value * 1000) : NaN
    return Number.isFinite(ms) ? Math.floor(ms / 1000) : null
  }

  return {
    enabled: Boolean(options.apiKey),
    cachedDetails(token: Address) { return cached<TokenMarket>(token.toLowerCase(), 'details') },
    details(token: Address): Promise<MarketSnapshot<TokenMarket>> {
      return refresh<TokenMarket>(token.toLowerCase(), 'details', detailsTtl, async () => {
        const result = await request('/api/2/token/details', { chainId: String(options.chainId), address: token })
        if (!result.ok) return result
        const data = ((result.body as { data?: Record<string, unknown> })?.data ?? result.body) as Record<string, unknown>
        if (!data || typeof data !== 'object') return { ok: false, status: null, error: 'Unexpected Mobula shape' }
        const observed = num(data.lastUpdated ?? data.last_updated ?? data.timestamp)
        return { ok: true, observedAt: observed ? Math.floor(observed > 1e12 ? observed / 1000 : observed) : null, payload: {
          priceUsd: num(data.price ?? data.priceUSD),
          marketCapUsd: num(data.market_cap ?? data.marketCap),
          volume24hUsd: num(data.volume ?? data.volume_24h ?? data.volume24h),
          priceChange24hPct: num(data.price_change_24h ?? data.priceChange24h),
          liquidityUsd: num(data.liquidity),
        } }
      })
    },
    // Every pons coin Mobula lists for the configured factory: the new, bonding and bonded views of one
    // pulse call, deduplicated, spam-flagged rows dropped. Discovery only; not cached here.
    async pulse(factory: Address, limit = 100): Promise<{ ok: true; items: PulseCoin[] } | { ok: false; error: string }> {
      if (!options.apiKey) return { ok: false, error: 'Market data is not configured' }
      const result = await request('/api/2/pulse', { chainId: `evm:${options.chainId}`, poolTypes: 'pons-v2', assetMode: 'true', limit: String(limit) })
      if (!result.ok) return { ok: false, error: result.error }
      const body = result.body as Record<string, { data?: unknown } | undefined> | null
      const views = ['bonded', 'bonding', 'new'].map(view => body?.[view]?.data).filter(Array.isArray)
      if (views.length === 0) return { ok: false, error: 'Unexpected Mobula shape' }
      const items = new Map<string, PulseCoin>()
      for (const row of views.flat()) {
        const r = row as Record<string, unknown>
        if (typeof r.address !== 'string' || !isAddress(r.address) || r.is_spam === true) continue
        if (typeof r.preBondingFactory !== 'string' || r.preBondingFactory.toLowerCase() !== factory.toLowerCase()) continue
        const key = r.address.toLowerCase()
        if (items.has(key)) continue
        const graduatedAt = seconds(r.bonded_at)
        items.set(key, { token: getAddress(r.address), name: text(r.name), symbol: text(r.symbol), logo: typeof r.logo === 'string' && r.logo.startsWith('https://') ? r.logo : null,
          deployer: typeof r.deployer === 'string' && isAddress(r.deployer) ? getAddress(r.deployer) : null, description: typeof r.description === 'string' ? r.description.trim().slice(0, 280) : '',
          launchedAt: seconds(r.createdAt), graduatedAt, bonded: r.bonded === true && graduatedAt !== null, bondingPct: num(r.bondingPercentage),
          priceUsd: num(r.price), marketCapUsd: num(r.marketCap), liquidityUsd: num(r.liquidity), volume24hUsd: num(r.volume_24h), priceChange24hPct: num(r.price_change_24h), holders: num(r.holdersCount) })
      }
      return { ok: true, items: [...items.values()] }
    },
    async candles(token: Address, period: string, from: number, to: number): Promise<MarketSnapshot<Candle[]>> {
      if (!PERIODS.has(period)) throw new Error('Unsupported period')
      const kind = `candles:${period}:${from}:${to}`
      return refresh<Candle[]>(token.toLowerCase(), kind, candlesTtl, async () => {
        const result = await request('/api/2/token/ohlcv-history', { chainId: String(options.chainId), address: token, period, from: String(from * 1000), to: String(to * 1000), usd: 'true' })
        if (!result.ok) return result
        const body = result.body as { data?: unknown }
        const rows = Array.isArray(body?.data) ? body.data : Array.isArray(result.body) ? result.body as unknown[] : null
        if (!rows) return { ok: false, status: null, error: 'Unexpected Mobula shape' }
        const candles: Candle[] = []
        for (const row of rows) {
          const r = row as Record<string, unknown>
          const time = num(r.time ?? r.timestamp)
          if (time === null) continue
          candles.push({ time: Math.floor(time > 1e12 ? time / 1000 : time), open: num(r.open) ?? 0, close: num(r.close) ?? 0, high: num(r.high) ?? 0, low: num(r.low) ?? 0, volume: num(r.volume) ?? 0 })
        }
        return { ok: true, observedAt: candles.at(-1)?.time ?? null, payload: candles }
      })
    },
  }
}
