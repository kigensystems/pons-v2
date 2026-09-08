// Typed client for the Plum launch API. Same-origin (Vite proxies /api in development); cookies carry
// the session, so every call sends credentials and no secret ever reaches this bundle.

export type Session = { address: `0x${string}`; chainId: number; expiresAt: number }

export type LaunchConfigResponse = {
  chainId: number
  factory: `0x${string}`
  router: `0x${string}`
  blockNumber: string
  blockHash: `0x${string}`
  observedAt: number
  launchFeeWei: string
  launchEnabled: boolean
  maxCreatorTaxBps: number
  configs: { id: number; supply: string; curveFeeBps: string; enabled: boolean; graduationThreshold: string }[]
  // ETH first (the zero address), then every ERC-20 the factory approves as a quote asset. Raw integers in each asset's decimals.
  pairTokens: PairToken[]
  eligibility: { wallet: string; canLaunch: boolean } | null
}

export type PairToken = { address: `0x${string}`; symbol: string; name: string; decimals: number; phantomQuote: string; graduationThreshold: string }

export type Simulation =
  | { ok: true; gas: string; maxFeePerGas: string; balanceWei: string; requiredWei: string }
  | { ok: false; code: string; reason: string; balanceWei: string | null; requiredWei?: string; shortfallWei?: string }

export type IntentStatus = 'prepared' | 'submitted' | 'included' | 'confirmed' | 'reverted' | 'rejected' | 'expired' | 'unresolved'

export type Intent = {
  id: string
  status: IntentStatus
  failure: string | null
  wallet: `0x${string}`
  chainId: number
  createdAt: number
  expiresAt: number
  transaction: { chainId: number; to: `0x${string}`; data: `0x${string}`; value: string }
  tokenParams: { name: string; symbol: string; logo: string; description: string; creatorTaxBps: number }
  terms: { launchFeeWei: string; pair: { address: `0x${string}`; symbol: string; name: string; decimals: number }; supply: string; curveFeeBps: number; creatorTaxBps: number; totalTradeFeeBps: number; graduationThresholdWei: string; sourceBlock: number; observedAt: number }
  simulation: Simulation | null
  submissions: { transactionHash: `0x${string}`; state: string; detail: string | null }[]
  launch: { token: `0x${string}`; curve: `0x${string}`; transactionHash: `0x${string}`; blockNumber: number; confirmationState: string } | null
}

export type MarketSnapshot = {
  status: 'ok' | 'stale' | 'error' | 'unavailable' | 'unsupported'
  payload: { priceUsd: number | null; marketCapUsd: number | null; volume24hUsd: number | null; priceChange24hPct: number | null } | null
  observedAt: number | null
  retrievedAt: number | null
  error: string | null
}

export type Launch = {
  chainId: number
  token: `0x${string}`
  curve: `0x${string}`
  name: string
  symbol: string
  logo: string
  description: string
  creator: `0x${string}`
  creatorTaxBps: number
  pairToken: string
  transactionHash: `0x${string}`
  blockNumber: number
  blockTime: number
  confirmationState: 'included' | 'confirmed'
  explorer: { token: string; transaction: string } | null
  protocol: { phase: number; phaseName: string; graduated: boolean; onCurve: boolean } | null
  protocolError: string | null
  market: MarketSnapshot | null
}

export type LaunchList = { items: Launch[]; nextCursor: string | null; stats: { total: number; confirmed: number } }

// A coin on Pons as the launch API relays it from Mobula: identity, curve progress and a market
// snapshot. Pons-wide; madeWithPlum says whether it is also in Plum's registry.
export type PonsCoin = {
  chainId: number
  token: `0x${string}`
  name: string
  symbol: string
  logo: string | null
  deployer: `0x${string}` | null
  description: string
  launchedAt: number | null
  graduatedAt: number | null
  bonded: boolean
  bondingPct: number | null
  priceUsd: number | null
  marketCapUsd: number | null
  liquidityUsd: number | null
  volume24hUsd: number | null
  priceChange24hPct: number | null
  holders: number | null
  madeWithPlum: boolean
  creatorTaxBps: number | null
  explorer: string | null
  chart: string | null
}
export type FeedStatus = 'ok' | 'stale' | 'error' | 'unavailable'
export type PonsCoins = { status: FeedStatus; items: PonsCoin[]; retrievedAt: number; error: string | null }
// The newest coin to leave its curve for a pool, confirmed against the factory.
export type Spotlight = { status: FeedStatus; payload: (PonsCoin & { phaseName: string }) | null; observedAt: number | null; retrievedAt: number; error: string | null }

export class ApiError extends Error {
  status: number
  code: string
  constructor(status: number, code: string, message: string) { super(message); this.status = status; this.code = code }
}

async function request<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.json !== undefined) headers.set('Content-Type', 'application/json')
  let response: Response
  try {
    response = await fetch(path, { ...init, headers, credentials: 'same-origin', body: init.json !== undefined ? JSON.stringify(init.json) : init.body })
  } catch {
    throw new ApiError(0, 'offline', 'The launch service could not be reached.')
  }
  const type = response.headers.get('content-type') ?? ''
  const body = type.includes('application/json') ? await response.json().catch(() => null) : null
  if (!response.ok) {
    const error = (body as { error?: { code?: string; message?: string } } | null)?.error
    throw new ApiError(response.status, error?.code ?? 'error', error?.message ?? `Request failed (${response.status})`)
  }
  return body as T
}

export const api = {
  session: () => request<{ session: Session | null }>('/api/auth/session').then(r => r.session),
  challenge: (address: string, chainId: number) => request<{ message: string }>('/api/auth/challenge', { method: 'POST', json: { address, chainId } }),
  verify: (message: string, signature: string) => request<{ session: Session }>('/api/auth/verify', { method: 'POST', json: { message, signature } }).then(r => r.session),
  logout: () => request<{ ok: true }>('/api/auth/logout', { method: 'POST', json: {} }),
  launchConfig: () => request<LaunchConfigResponse>('/api/launch-config'),
  // A file with no recognised extension has an empty type; the API validates the bytes themselves.
  upload: (file: File) => request<{ id: string; url: string }>('/api/uploads', { method: 'POST', body: file, headers: { 'Content-Type': file.type || 'application/octet-stream' } }),
  createIntent: (idempotencyKey: string, body: Record<string, unknown>) => request<Intent>('/api/launch-intents', { method: 'POST', json: body, headers: { 'Idempotency-Key': idempotencyKey } }),
  intent: (id: string) => request<Intent>(`/api/launch-intents/${encodeURIComponent(id)}`),
  submit: (id: string, transactionHash: string) => request<Intent>(`/api/launch-intents/${encodeURIComponent(id)}/submission`, { method: 'POST', json: { transactionHash } }),
  ponsCoins: () => request<PonsCoins>('/api/pons/coins'),
  spotlight: () => request<Spotlight>('/api/pons/spotlight'),
  launches: (params: { search?: string; cursor?: string; limit?: number } = {}) => {
    const query = new URLSearchParams()
    if (params.search) query.set('search', params.search)
    if (params.cursor) query.set('cursor', params.cursor)
    if (params.limit) query.set('limit', String(params.limit))
    const suffix = query.toString()
    return request<LaunchList>(`/api/launches${suffix ? `?${suffix}` : ''}`)
  },
}
