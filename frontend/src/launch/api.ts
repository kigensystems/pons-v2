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
  eligibility: { wallet: string; canLaunch: boolean } | null
}

export type Simulation =
  | { ok: true; gas: string; maxFeePerGas: string; balanceWei: string; requiredWei: string }
  | { ok: false; code: string; reason: string; balanceWei: string | null }

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
  terms: { launchFeeWei: string; supply: string; curveFeeBps: number; creatorTaxBps: number; totalTradeFeeBps: number; sourceBlock: number; observedAt: number }
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
  upload: (file: File) => request<{ id: string; url: string }>('/api/uploads', { method: 'POST', body: file, headers: { 'Content-Type': file.type } }),
  createIntent: (idempotencyKey: string, body: Record<string, unknown>) => request<Intent>('/api/launch-intents', { method: 'POST', json: body, headers: { 'Idempotency-Key': idempotencyKey } }),
  intent: (id: string) => request<Intent>(`/api/launch-intents/${encodeURIComponent(id)}`),
  submit: (id: string, transactionHash: string) => request<Intent>(`/api/launch-intents/${encodeURIComponent(id)}/submission`, { method: 'POST', json: { transactionHash } }),
  launches: (params: { search?: string; cursor?: string; limit?: number } = {}) => {
    const query = new URLSearchParams()
    if (params.search) query.set('search', params.search)
    if (params.cursor) query.set('cursor', params.cursor)
    if (params.limit) query.set('limit', String(params.limit))
    const suffix = query.toString()
    return request<LaunchList>(`/api/launches${suffix ? `?${suffix}` : ''}`)
  },
}
