// Server-only configuration. Every value comes from the process environment; nothing here is
// bundled into the frontend. Missing or malformed values fail at startup with a named variable.
import { isAddress, type Address } from 'viem'

export const CHAIN_IDS = { mainnet: 4663, testnet: 46630 } as const

// Published pons v2 mainnet addresses. No testnet deployment is known, so a testnet run must
// supply PLUM_FACTORY_ADDRESS and PLUM_ROUTER_ADDRESS explicitly; there is no mainnet fallback.
const MAINNET_FACTORY: Address = '0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e'
const MAINNET_ROUTER: Address = '0xe33E9E479dF8802cb0866d5d05258bEc4cF62948'

export type Config = {
  chainId: number
  rpcUrl: string
  factory: Address
  router: Address
  host: string
  port: number
  origin: string
  publicUrl: string
  sessionSecret: string
  sessionTtlSeconds: number
  intentTtlSeconds: number
  confirmations: number
  dbPath: string
  uploadDir: string
  mobulaApiKey: string | null
  mobulaBaseUrl: string
  reconcileIntervalMs: number
}

export class ConfigError extends Error {}

function read(env: NodeJS.ProcessEnv, key: string): string | undefined {
  const value = env[key]?.trim()
  return value ? value : undefined
}

function integer(env: NodeJS.ProcessEnv, key: string, fallback: number, min = 0): number {
  const raw = read(env, key)
  if (raw === undefined) return fallback
  const value = Number(raw)
  if (!Number.isInteger(value) || value < min) throw new ConfigError(`${key} must be an integer >= ${min}`)
  return value
}

function address(env: NodeJS.ProcessEnv, key: string, fallback?: Address): Address {
  const raw = read(env, key)
  if (raw === undefined) {
    if (fallback) return fallback
    throw new ConfigError(`${key} is required for chain ${read(env, 'PLUM_CHAIN_ID')}`)
  }
  if (!isAddress(raw)) throw new ConfigError(`${key} is not a valid address`)
  return raw
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const chainId = integer(env, 'PLUM_CHAIN_ID', CHAIN_IDS.mainnet, 1)
  const mainnet = chainId === CHAIN_IDS.mainnet
  if (!mainnet && chainId !== CHAIN_IDS.testnet) throw new ConfigError('PLUM_CHAIN_ID must be 4663 (mainnet) or 46630 (testnet)')

  const rpcKey = mainnet ? 'ROBINHOOD_RPC_URL' : 'ROBINHOOD_TESTNET_RPC_URL'
  const rpcUrl = read(env, rpcKey)
  if (!rpcUrl) throw new ConfigError(`${rpcKey} is required`)
  let parsedRpc: URL
  try { parsedRpc = new URL(rpcUrl) } catch { throw new ConfigError(`${rpcKey} is not a URL`) }
  if (parsedRpc.protocol !== 'https:' && parsedRpc.hostname !== '127.0.0.1' && parsedRpc.hostname !== 'localhost') {
    throw new ConfigError(`${rpcKey} must use https (or a local fork on 127.0.0.1)`)
  }

  const sessionSecret = read(env, 'SESSION_SECRET')
  if (!sessionSecret || sessionSecret.length < 32) throw new ConfigError('SESSION_SECRET must be at least 32 characters')

  const origin = read(env, 'PLUM_ORIGIN') ?? 'http://127.0.0.1:5173'
  try { new URL(origin) } catch { throw new ConfigError('PLUM_ORIGIN is not a URL') }
  const publicUrl = (read(env, 'PLUM_PUBLIC_URL') ?? origin).replace(/\/+$/, '')

  return {
    chainId,
    rpcUrl,
    factory: address(env, 'PLUM_FACTORY_ADDRESS', mainnet ? MAINNET_FACTORY : undefined),
    router: address(env, 'PLUM_ROUTER_ADDRESS', mainnet ? MAINNET_ROUTER : undefined),
    // Loopback for development; a container sets PLUM_HOST=0.0.0.0 so the platform can reach it.
    host: read(env, 'PLUM_HOST') ?? '127.0.0.1',
    port: integer(env, 'PLUM_API_PORT', 8787, 1),
    origin,
    publicUrl,
    sessionSecret,
    sessionTtlSeconds: integer(env, 'PLUM_SESSION_TTL_SECONDS', 24 * 60 * 60, 60),
    intentTtlSeconds: integer(env, 'PLUM_INTENT_TTL_SECONDS', 15 * 60, 60),
    // Robinhood Chain finality is not documented as a fixed depth; this is a configurable policy, not a guarantee.
    confirmations: integer(env, 'PLUM_CONFIRMATIONS', 12, 1),
    dbPath: read(env, 'PLUM_DB_PATH') ?? new URL('../data/plum.sqlite', import.meta.url).pathname,
    uploadDir: read(env, 'PLUM_UPLOAD_DIR') ?? new URL('../data/uploads', import.meta.url).pathname,
    mobulaApiKey: read(env, 'MOBULA_API_KEY') ?? null,
    mobulaBaseUrl: read(env, 'MOBULA_BASE_URL') ?? 'https://api.mobula.io',
    reconcileIntervalMs: integer(env, 'PLUM_RECONCILE_INTERVAL_MS', 5000, 500),
  }
}
