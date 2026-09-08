# Plum launch API

Updated September 8, 2026. What was implemented from the [integration report](PLUM-INTEGRATION.md), how it runs, and what remains unverified. No token was deployed and no transaction was signed while building this.

## Layout

| Path | Role |
| --- | --- |
| `backend/src/server.ts` | `node:http` server, error envelope, global rate limit, worker start |
| `backend/src/config.ts` | Environment loading with named errors; testnet needs explicit factory/router addresses |
| `frontend/src/launch/appkit.ts` | Reown AppKit over wagmi: wallet picker, QR sign-in, network switching; sign-in itself stays in `wallet.ts` |
| `backend/src/chain/abi.ts` | pons v2 fragments transcribed from the docs snapshot: three-argument `launchToken`, getters, `TokenLaunched`, router `launchAndBuy` |
| `backend/src/chain/client.ts` | viem adapter: pinned settings reads, eligibility, gas/fee simulation, receipts, protocol state, SIWE verification |
| `backend/src/chain/encode.ts` | Pure calldata construction and the terms hash |
| `backend/src/chain/verify.ts` | Pure receipt verification against a stored intent |
| `backend/src/auth.ts` | EIP-4361 challenge/verify, hashed session cookie |
| `backend/src/uploads.ts` | Magic-byte image validation, content-addressed local store behind an adapter |
| `backend/src/intents.ts` | Idempotent intents, submission tracking, reconciliation and confirmation worker |
| `backend/src/launches.ts` | Registry queries with protocol state and market snapshots |
| `backend/src/pons.ts` | The Pons side of Explore: every coin Mobula lists for the factory, and the spotlight (newest graduation, confirmed against the factory); Plum's own coins flagged |
| `backend/src/market/mobula.ts` | Cached, coalesced, retrying Mobula adapter; the pons-wide pulse feed; disabled without a key |
| `backend/src/db.ts` | SQLite schema via `node:sqlite` (WAL, uniqueness constraints) |
| `frontend/src/launch/api.ts`, `wallet.ts`, `useSession.ts` | Typed API client, injected-wallet access through viem, session hook |
| `frontend/src/launch/LaunchForm.tsx`, `TokenGrid.tsx`, `LaunchPage.tsx`, `ExploreMonitor.tsx` | Describe → review → sign → track flow; registry-backed Explore; the CRT showing the latest graduation |

Shared files touched: `frontend/package.json` (adds `viem`), `frontend/vite.config.ts` (one proxy line so `/api` reaches the backend in development), `.env.example`, `.gitignore`.

## Running it

From the repository root:

```sh
npm --prefix backend ci
npm --prefix backend run dev      # reads ../.env, listens on 127.0.0.1:8787
npm --prefix frontend run dev     # proxies /api to the backend
```

Required in `.env`: `ROBINHOOD_RPC_URL` (or `ROBINHOOD_TESTNET_RPC_URL` with `PLUM_CHAIN_ID=46630`), `SESSION_SECRET`, and `VITE_REOWN_PROJECT_ID` for the wallet picker (Vite reads the repository-root `.env`; only `VITE_` names reach the browser). `MOBULA_API_KEY` enables market enrichment, the Pons coins collection and the CRT spotlight; without it Plum cards show "no market data", Pons coins are empty and the CRT reads NO SIGNAL. `PLUM_HOST` (default `127.0.0.1`) and `PLUM_TRUST_PROXY` exist for containers; see [DEPLOY.md](DEPLOY.md). The other `PLUM_*` variables are documented in `.env.example`.

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
| `GET /api/pons/coins` | Pons-wide: the coins that have left their curve, from the `bonded` view of one Mobula pulse call for the configured factory (Mobula returns 50 per view), spam-flagged rows dropped, newest graduation first, with market cap, 24 h change, a DexScreener `chart` link and `madeWithPlum` for registry members. A logo Mobula stops sending is remembered. One snapshot cached 30 s in memory; failures return the last list as `stale` |
| `GET /api/pons/spotlight` | From the same snapshot: the newest coin to leave its curve for a pool, confirmed with `getLaunchedToken` (phase ≥ 2) before it is returned |

Writes require an `Origin` header equal to `PLUM_ORIGIN` and a session. Rate limits are per process and in memory.

## Membership rule as implemented

A launch is recorded only when a submitted hash resolves to a receipt whose sender, target, exact input, value and chain equal the intent, whose status is success, whose block matches a fresh canonical read, and which carries exactly one factory `TokenLaunched` event with the intent wallet as deployer. Tests cover forged senders, unrelated targets, altered input, wrong value, wrong chain, reverts, missing or duplicate events, deployer mismatch and stale block hashes.

Registry rows move from `included` to `confirmed` after `PLUM_CONFIRMATIONS` blocks (default 12) if the block hash still matches; a changed hash retracts the row and re-verifies from the pending submission. That depth is a policy setting, not a documented Robinhood finality guarantee.

## Verified

- September 8: `GET /api/pons/spotlight` returned live graduations (LEAD INDEX, Shopify Token, Ponzi Miners, Compute Token, each within minutes of graduating) with Mobula's logo and a factory phase of `PoolCreated`; `GET /api/pons/coins` listed the 50 most recent graduations with logos and DexScreener links (DexScreener indexes Robinhood Chain as `robinhood`); 25 backend tests pass.
- September 7: 23 backend tests and 28 frontend tests pass; backend typecheck and both lints are clean.
- The backend read live mainnet settings through the public Robinhood RPC at block 56,862,125: fee 0.0005 ETH, gate open, config 0 enabled, the same economics hash as the September 7 evidence. This exercised the ABI tuple decoding against deployed code.
- Explore renders the registry's honest empty state and the creation desk's live terms in the browser.

## Not verified

- No launch was simulated, signed or mined with a real wallet. `eth_estimateGas` against the encoded payload has not run for a real account.
- pons custom errors are declared without parameters because their signatures are unpublished; an unknown revert is reported with its selector.
- The logo URI written onchain points at `PLUM_PUBLIC_URL`. For a real launch that must be a durable public host or an IPFS pin; the local disk adapter is development only.
- `verifySiweMessage` for contract wallets depends on RPC and was only tested with an EOA offline.
- Mobula normalization is based on the documented field names and a fake server; no live Mobula call was made. The root `.env` arrived at the end of the session in the main checkout; see [LAUNCH-API-HANDOFF.md](LAUNCH-API-HANDOFF.md).
- Initial buys, pair tokens other than ETH and the router path are encoded in the ABI but refused by the API until validated on a fork or a real launch. pons publishes no testnet deployment.

## Recommended next steps

1. Deferred checks in [LAUNCH-API-HANDOFF.md](LAUNCH-API-HANDOFF.md): the chain-switch session drop, then a few real mainnet launches (fee 0.0005 ETH each on September 7) to confirm `launchToken` encoding, the fee value, event decoding, the confirmation worker and Mobula enrichment against a real token.
2. Optional: a mainnet fork (Foundry `anvil --fork-url`) for failure paths such as a closed gate or changed terms.
3. Deploy per [DEPLOY.md](DEPLOY.md) (Netlify plus Render); IPFS pinning for logos remains open.
