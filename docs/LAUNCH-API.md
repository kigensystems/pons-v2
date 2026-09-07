# Plum launch API

Updated September 7, 2026. What was implemented from the [integration report](PLUM-INTEGRATION.md), how it runs, and what remains unverified. No token was deployed and no transaction was signed while building this.

## Layout

| Path | Role |
| --- | --- |
| `backend/src/server.ts` | `node:http` server, error envelope, global rate limit, worker start |
| `backend/src/config.ts` | Environment loading with named errors; testnet needs explicit factory/router addresses |
| `backend/src/chain/abi.ts` | pons v2 fragments transcribed from the docs snapshot: three-argument `launchToken`, getters, `TokenLaunched`, router `launchAndBuy` |
| `backend/src/chain/client.ts` | viem adapter: pinned settings reads, eligibility, gas/fee simulation, receipts, protocol state, SIWE verification |
| `backend/src/chain/encode.ts` | Pure calldata construction and the terms hash |
| `backend/src/chain/verify.ts` | Pure receipt verification against a stored intent |
| `backend/src/auth.ts` | EIP-4361 challenge/verify, hashed session cookie |
| `backend/src/uploads.ts` | Magic-byte image validation, content-addressed local store behind an adapter |
| `backend/src/intents.ts` | Idempotent intents, submission tracking, reconciliation and confirmation worker |
| `backend/src/launches.ts` | Registry queries with protocol state and market snapshots |
| `backend/src/market/mobula.ts` | Cached, coalesced, retrying Mobula adapter; disabled without a key |
| `backend/src/db.ts` | SQLite schema via `node:sqlite` (WAL, uniqueness constraints) |
| `frontend/src/launch/api.ts`, `wallet.ts`, `useSession.ts` | Typed API client, injected-wallet access through viem, session hook |
| `frontend/src/launch/LaunchForm.tsx`, `TokenGrid.tsx`, `LaunchPage.tsx` | Describe → review → sign → track flow; registry-backed Explore |

Shared files touched: `frontend/package.json` (adds `viem`), `frontend/vite.config.ts` (one proxy line so `/api` reaches the backend in development), `.env.example`, `.gitignore`.

## Running it

From the repository root:

```sh
npm --prefix backend ci
npm --prefix backend run dev      # reads ../.env, listens on 127.0.0.1:8787
npm --prefix frontend run dev     # proxies /api to the backend
```

Required in `.env`: `ROBINHOOD_RPC_URL` (or `ROBINHOOD_TESTNET_RPC_URL` with `PLUM_CHAIN_ID=46630`) and `SESSION_SECRET`. `MOBULA_API_KEY` enables market enrichment; without it cards show "no market data". The other `PLUM_*` variables are documented in `.env.example`.

Checks: `npm --prefix backend test`, `typecheck`, `lint`; frontend `build`, `lint`, `test`. The HTTP end-to-end test binds a local port, so it needs the sandbox off in Claude sessions.

## Routes

| Route | Behaviour |
| --- | --- |
| `GET /api/health` | Chain and factory the server is configured for |
| `POST /api/auth/challenge` | SIWE message bound to the configured origin and chain; nonce expires in 5 minutes |
| `POST /api/auth/verify` | Verifies the signature (ERC-6492 capable through RPC), sets an HttpOnly cookie |
| `GET /api/auth/session`, `POST /api/auth/logout` | Session read and revocation |
| `POST /api/uploads` (raw image bytes), `GET /api/uploads/:id` | Validated, content-addressed logo storage |
| `GET /api/launch-config` | Factory settings pinned to one block, cached 10 s, plus `canLaunch` for the session wallet |
| `POST /api/launch-intents` | Requires `Idempotency-Key`; reads live terms, encodes `launchToken`, simulates from the wallet, stores the intent; 15-minute expiry |
| `POST /api/launch-intents/:id/submission` | Records a candidate hash and reconciles immediately |
| `GET /api/launch-intents/:id` | `prepared`, `submitted`, `included`, `confirmed`, `reverted`, `rejected`, `expired`, `unresolved` |
| `GET /api/launches`, `/:chainId/:token`, `/:chainId/:token/candles` | Registry only; protocol phase and market data attached with their own status and timestamps |

Writes require an `Origin` header equal to `PLUM_ORIGIN` and a session. Rate limits are per process and in memory.

## Membership rule as implemented

A launch is recorded only when a submitted hash resolves to a receipt whose sender, target, exact input, value and chain equal the intent, whose status is success, whose block matches a fresh canonical read, and which carries exactly one factory `TokenLaunched` event with the intent wallet as deployer. Tests cover forged senders, unrelated targets, altered input, wrong value, wrong chain, reverts, missing or duplicate events, deployer mismatch and stale block hashes.

Registry rows move from `included` to `confirmed` after `PLUM_CONFIRMATIONS` blocks (default 12) if the block hash still matches; a changed hash retracts the row and re-verifies from the pending submission. That depth is a policy setting, not a documented Robinhood finality guarantee.

## Verified in this session

- 23 backend tests and 28 frontend tests pass; backend typecheck and both lints are clean.
- The backend read live mainnet settings through the public Robinhood RPC at block 56,862,125: fee 0.0005 ETH, gate open, config 0 enabled, the same economics hash as the September 7 evidence. This exercised the ABI tuple decoding against deployed code.
- Explore renders the registry's honest empty state and the creation desk's live terms in the browser.

## Not verified

- No launch was simulated, signed or mined with a real wallet. `eth_estimateGas` against the encoded payload has not run for a real account.
- pons custom errors are declared without parameters because their signatures are unpublished; an unknown revert is reported with its selector.
- The logo URI written onchain points at `PLUM_PUBLIC_URL`. For a real launch that must be a durable public host or an IPFS pin; the local disk adapter is development only.
- `verifySiweMessage` for contract wallets depends on RPC and was only tested with an EOA offline.
- Mobula normalization is based on the documented field names and a fake server; no live Mobula call was made. The root `.env` arrived at the end of the session in the main checkout; see [LAUNCH-API-HANDOFF.md](LAUNCH-API-HANDOFF.md).
- Initial buys, pair tokens other than ETH and the router path are encoded in the ABI but refused by the API until validated on a fork or testnet.

## Recommended next steps

1. Follow [LAUNCH-API-HANDOFF.md](LAUNCH-API-HANDOFF.md): real wallet sign-in and intent simulation on the dev server, then the testnet addresses.
2. Run one creation on a mainnet fork (Foundry `anvil --fork-url`) with an impersonated account to confirm `launchToken` encoding, the fee value and the event decoding before any real launch.
3. Decide hosting for the backend and uploads (a small Node host plus persistent disk or object storage; IPFS pinning for logos).
4. Add EIP-6963 wallet discovery if users have several extensions installed; the current connector uses `window.ethereum`.
