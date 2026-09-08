// The Pons side of Explore: the coins that have left their curve for a pool, newest first, and the
// spotlight, the newest of them, confirmed against the factory before it is shown. Discovery is
// pons-wide; the registry only says which coins Plum made. One snapshot is held in memory.
import type { Address } from 'viem'
import { now, type Db } from './db.ts'
import type { ChainReader } from './chain/client.ts'
import type { createMobula, PulseCoin } from './market/mobula.ts'
import { EXPLORERS } from './launches.ts'

export type FeedStatus = 'ok' | 'stale' | 'error' | 'unavailable'
export type PonsCoin = PulseCoin & { chainId: number; madeWithPlum: boolean; creatorTaxBps: number | null; explorer: string | null; chart: string | null }

// DexScreener indexes Robinhood Chain under this slug; a token page redirects to its pair.
const CHARTS: Record<number, string> = { 4663: 'https://dexscreener.com/robinhood' }
export type PonsCoins = { status: FeedStatus; items: PonsCoin[]; retrievedAt: number; error: string | null }
export type Spotlight = { status: FeedStatus; payload: (PonsCoin & { phaseName: string }) | null; observedAt: number | null; retrievedAt: number; error: string | null }

const CANDIDATES = 5

export function createPons(db: Db, chain: ChainReader, market: ReturnType<typeof createMobula>, factory: Address, options: { ttlSeconds?: number; now?: () => number } = {}) {
  const ttl = options.ttlSeconds ?? 30
  const clock = options.now ?? now
  const plumRow = db.prepare('SELECT creator_tax_bps FROM launches WHERE chain_id = ? AND token = ?')
  const explorer = EXPLORERS[chain.chainId]
  const charts = CHARTS[chain.chainId]
  // Mobula occasionally omits a logo it served before; the last one seen stays with the coin.
  const logos = new Map<string, string>()
  // The creator rate is set at launch and never changes; one factory read per coin, kept for the process.
  const rates = new Map<string, number>()
  let feed: PonsCoins | null = null
  let spot: Spotlight | null = null
  let inflight: Promise<PonsCoins> | null = null
  let spotInflight: Promise<Spotlight> | null = null
  // A factory event asks for a read ahead of the TTL. Mobula indexes a graduation some seconds after
  // the chain does, so the nudge reads now and again later; forced reads keep a minimum spacing.
  let forced = false
  let forcedAt = 0
  let followUps: NodeJS.Timeout[] = []
  const FORCE_GAP_SECONDS = 15
  const FOLLOW_UP_MS = [20_000, 60_000]

  function present(coin: PulseCoin): PonsCoin {
    const key = coin.token.toLowerCase()
    if (coin.logo) logos.set(key, coin.logo)
    const plum = plumRow.get(chain.chainId, key) as { creator_tax_bps: number } | undefined
    return { ...coin, logo: coin.logo ?? logos.get(key) ?? null, chainId: chain.chainId, madeWithPlum: plum !== undefined, creatorTaxBps: plum?.creator_tax_bps ?? rates.get(key) ?? null,
      explorer: explorer ? `${explorer}/token/${coin.token}` : null, chart: charts ? `${charts}/${coin.token}` : null }
  }

  // A failed read keeps the last list, marked stale, rather than emptying the page.
  async function refresh(): Promise<PonsCoins> {
    if (!market.enabled) return { status: 'unavailable', items: [], retrievedAt: clock(), error: 'Market data is not configured' }
    const result = await market.pulse(factory)
    if (!result.ok) return { status: feed?.items.length ? 'stale' : 'error', items: feed?.items ?? [], retrievedAt: clock(), error: result.error }
    const bonded = result.items.filter(coin => coin.bonded)
    // A failed read leaves the rate off that card until the next refresh.
    await Promise.all(bonded.filter(coin => !rates.has(coin.token.toLowerCase())).map(async coin => {
      try { const state = await chain.launchedToken(coin.token); if (state.exists) rates.set(coin.token.toLowerCase(), state.creatorTaxBps) } catch {}
    }))
    const items = bonded.map(present).sort((a, b) => b.graduatedAt! - a.graduatedAt!)
    return { status: 'ok', items, retrievedAt: clock(), error: null }
  }

  function coins(): Promise<PonsCoins> {
    // A read in progress serves every caller; it is at least as fresh as the snapshot.
    if (inflight) return inflight
    if (!forced && feed && feed.status === 'ok' && feed.retrievedAt + ttl > clock()) return Promise.resolve(feed)
    forced = false
    inflight = refresh().then(snapshot => { feed = snapshot; return snapshot }).finally(() => { inflight = null })
    return inflight
  }

  function readAhead() {
    if (clock() - forcedAt < FORCE_GAP_SECONDS) return
    forcedAt = clock(); forced = true
    void coins().catch(() => {})
  }

  function nudge() {
    for (const timer of followUps) clearTimeout(timer)
    followUps = FOLLOW_UP_MS.map(ms => { const timer = setTimeout(readAhead, ms); timer.unref(); return timer })
    readAhead()
  }

  // Newest graduation first; a candidate the factory does not report as graduated is skipped.
  async function confirm(list: PonsCoins): Promise<Spotlight> {
    const keep = (error: string): Spotlight => ({ status: spot?.payload ? 'stale' : list.status === 'unavailable' ? 'unavailable' : 'error', payload: spot?.payload ?? null, observedAt: spot?.observedAt ?? null, retrievedAt: list.retrievedAt, error })
    if (list.status === 'error' || list.status === 'unavailable') return keep(list.error ?? 'Feed unavailable')
    for (const candidate of list.items.slice(0, CANDIDATES)) {
      let state
      try { state = await chain.launchedToken(candidate.token) } catch { return keep('Protocol state is temporarily unavailable') }
      if (!state.exists || state.phase < 2) continue
      return { status: list.status, payload: { ...candidate, deployer: state.deployer, phaseName: state.phaseName }, observedAt: candidate.graduatedAt, retrievedAt: list.retrievedAt, error: list.error }
    }
    return { status: list.status, payload: null, observedAt: null, retrievedAt: list.retrievedAt, error: list.error }
  }

  return {
    coins,
    nudge,
    // Confirmed once per snapshot; every viewer arriving during that read shares it.
    async spotlight(): Promise<Spotlight> {
      const list = await coins()
      if (spot && spot.retrievedAt === list.retrievedAt) return spot
      if (spotInflight) return spotInflight
      spotInflight = confirm(list).then(next => spot = next).finally(() => { spotInflight = null })
      return spotInflight
    },
  }
}
