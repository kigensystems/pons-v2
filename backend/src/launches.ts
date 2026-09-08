// Plum registry reads. Membership is the launches table; protocol state and market data are
// attached per token and timestamped separately.
import { getAddress, isAddress, type Address } from 'viem'
import { HttpError } from './http.ts'
import type { Db } from './db.ts'
import type { ChainReader, LaunchedToken } from './chain/client.ts'
import type { createMobula, MarketSnapshot, TokenMarket } from './market/mobula.ts'

export const EXPLORERS: Record<number, string> = { 4663: 'https://robinhoodchain.blockscout.com', 46630: 'https://explorer.testnet.chain.robinhood.com' }

type LaunchRow = {
  chain_id: number; token: string; curve: string; factory: string; creator: string; creator_fee_recipient: string; intent_id: string; tx_hash: string; log_index: number
  block_number: number; block_hash: string; block_time: number; launch_config_id: number; pair_token: string; name: string; symbol: string; logo: string; description: string
  creator_tax_bps: number; buyback_enabled: number; confirmation_state: string; created_at: number; updated_at: number
}

export type LaunchSummary = ReturnType<typeof presentLaunch>

export function presentLaunch(row: LaunchRow) {
  const explorer = EXPLORERS[row.chain_id]
  return {
    chainId: row.chain_id, token: getAddress(row.token), curve: getAddress(row.curve), name: row.name, symbol: row.symbol, logo: row.logo, description: row.description,
    creator: getAddress(row.creator), creatorFeeRecipient: getAddress(row.creator_fee_recipient), creatorTaxBps: row.creator_tax_bps, buybackEnabled: row.buyback_enabled === 1,
    launchConfigId: row.launch_config_id, pairToken: row.pair_token, transactionHash: row.tx_hash, blockNumber: row.block_number, blockTime: row.block_time,
    confirmationState: row.confirmation_state, createdAt: row.created_at,
    explorer: explorer ? { token: `${explorer}/token/${getAddress(row.token)}`, transaction: `${explorer}/tx/${row.tx_hash}` } : null,
  }
}

export function createLaunches(db: Db, chain: ChainReader, market: ReturnType<typeof createMobula>) {
  const selectPage = db.prepare(`SELECT * FROM launches WHERE chain_id = ? AND (? = '' OR name LIKE ? ESCAPE '\\' OR symbol LIKE ? ESCAPE '\\' OR token = ?)
    AND (block_number < ? OR (block_number = ? AND log_index < ?)) ORDER BY block_number DESC, log_index DESC LIMIT ?`)
  const selectOne = db.prepare('SELECT * FROM launches WHERE chain_id = ? AND token = ?')
  const counts = db.prepare("SELECT COUNT(*) AS total, SUM(confirmation_state = 'confirmed') AS confirmed FROM launches WHERE chain_id = ?")
  const stateCache = new Map<string, { value: LaunchedToken; until: number }>()
  const stateInflight = new Map<string, Promise<{ state: LaunchedToken | null; error: string | null }>>()

  // One factory read per token per half minute, shared by every list request that arrives meanwhile.
  function protocolState(token: Address): Promise<{ state: LaunchedToken | null; error: string | null }> {
    const key = token.toLowerCase()
    const hit = stateCache.get(key)
    if (hit && hit.until > Date.now()) return Promise.resolve({ state: hit.value, error: null })
    const pending = stateInflight.get(key)
    if (pending) return pending
    const job = chain.launchedToken(token)
      .then(value => { stateCache.set(key, { value, until: Date.now() + 30_000 }); return { state: value, error: null } })
      .catch(() => ({ state: hit?.value ?? null, error: 'Protocol state is temporarily unavailable' }))
      .finally(() => stateInflight.delete(key))
    stateInflight.set(key, job)
    return job
  }

  return {
    stats() {
      const row = counts.get(chain.chainId) as { total: number; confirmed: number | null }
      return { total: row.total, confirmed: row.confirmed ?? 0 }
    },

    async list(query: { search?: string; cursor?: string; limit?: string }) {
      const limit = Math.min(60, Math.max(1, Number(query.limit ?? 24) || 24))
      const search = (query.search ?? '').trim().slice(0, 64)
      let afterBlock = Number.MAX_SAFE_INTEGER
      let afterIndex = Number.MAX_SAFE_INTEGER
      if (query.cursor) {
        const match = /^(\d+):(\d+)$/.exec(query.cursor)
        if (!match) throw new HttpError(400, 'cursor is malformed', 'bad_cursor')
        afterBlock = Number(match[1]); afterIndex = Number(match[2])
      }
      const like = `%${search.replace(/[\\%_]/g, c => '\\' + c)}%`
      const tokenMatch = isAddress(search) ? search.toLowerCase() : ''
      const rows = selectPage.all(chain.chainId, search, like, like, tokenMatch, afterBlock, afterBlock, afterIndex, limit + 1) as LaunchRow[]
      const page = rows.slice(0, limit)
      const items = await Promise.all(page.map(async row => {
        const summary = presentLaunch(row)
        const [protocol, marketSnapshot] = await Promise.all([protocolState(summary.token), market.enabled ? market.details(summary.token) : Promise.resolve(null)])
        return { ...summary, protocol: protocol.state ? phaseOf(protocol.state) : null, protocolError: protocol.error, market: marketSnapshot }
      }))
      const last = page.at(-1)
      return { items, nextCursor: rows.length > limit && last ? `${last.block_number}:${last.log_index}` : null, stats: this.stats() }
    },

    async get(chainId: number, token: string) {
      if (chainId !== chain.chainId) throw new HttpError(404, 'Unknown chain', 'not_found')
      if (!isAddress(token)) throw new HttpError(400, 'token must be an address', 'bad_address')
      const row = selectOne.get(chainId, token.toLowerCase()) as LaunchRow | undefined
      if (!row) throw new HttpError(404, 'Not a Plum launch', 'not_found')
      const summary = presentLaunch(row)
      const [protocol, marketSnapshot] = await Promise.all([protocolState(summary.token), market.details(summary.token)])
      return { ...summary, protocol: protocol.state ? { ...phaseOf(protocol.state), creatorTaxBps: protocol.state.creatorTaxBps, buybackEnabled: protocol.state.buybackEnabled, graduationThresholdWei: protocol.state.graduationThreshold.toString() } : null,
        protocolError: protocol.error, market: marketSnapshot as MarketSnapshot<TokenMarket> }
    },

    async candles(chainId: number, token: string, query: { period?: string; from?: string; to?: string }) {
      if (chainId !== chain.chainId) throw new HttpError(404, 'Unknown chain', 'not_found')
      if (!isAddress(token)) throw new HttpError(400, 'token must be an address', 'bad_address')
      const row = selectOne.get(chainId, token.toLowerCase()) as LaunchRow | undefined
      if (!row) throw new HttpError(404, 'Not a Plum launch', 'not_found')
      const period = query.period ?? '1h'
      if (!['1m', '5m', '15m', '1h', '4h', '1d'].includes(period)) throw new HttpError(400, 'period must be one of 1m, 5m, 15m, 1h, 4h, 1d', 'bad_period')
      // Windows snap to the period so the cache key space per token is small and one caller cannot
      // make Mobula draw a fresh chart for every second of the day.
      const step = { '1m': 60, '5m': 300, '15m': 900, '1h': 3600, '4h': 14_400, '1d': 86_400 }[period]! * 60
      const snap = (value: number) => Math.floor(value / step) * step
      const requestedTo = query.to ? Number(query.to) : Math.floor(Date.now() / 1000)
      const requestedFrom = query.from ? Number(query.from) : requestedTo - 7 * 24 * 3600
      if (!Number.isInteger(requestedFrom) || !Number.isInteger(requestedTo) || requestedFrom < row.block_time - 3600 || requestedTo <= requestedFrom || requestedTo - requestedFrom > 90 * 24 * 3600) {
        throw new HttpError(400, 'from/to must be unix seconds within 90 days, after the launch', 'bad_range')
      }
      const from = snap(requestedFrom)
      const to = snap(requestedTo) + step
      return market.candles(getAddress(row.token), period, from, to)
    },
  }
}

function phaseOf(state: LaunchedToken) {
  return { exists: state.exists, phase: state.phase, phaseName: state.phaseName, graduated: state.phase >= 2, onCurve: state.phase === 0 }
}
