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
| `GET /api/health` | Chain and factory the server is configured for, and `client`, the address rate limits count this caller against |
| `POST /api/auth/challenge` | SIWE message bound to the configured origin and chain; nonce expires in 5 minutes |
| `POST /api/auth/verify` | Verifies the signature (ERC-6492 capable through RPC), sets an HttpOnly cookie |
| `GET /api/auth/session`, `POST /api/auth/logout` | Session read and revocation |
| `POST /api/uploads` (raw image bytes), `GET /api/uploads/:id` | Validated, content-addressed logo storage |
| `GET /api/launch-config` | Factory settings pinned to one block, cached 10 s, plus `canLaunch` for the session wallet |
| `POST /api/launch-intents` | Requires `Idempotency-Key`; reads live terms, encodes `launchToken`, simulates from the wallet, stores the intent; 15-minute expiry |
| `POST /api/launch-intents/:id/submission` | Records a candidate hash and reconciles immediately; at most three unsettled hashes per intent (`too_many_submissions`) |
| `GET /api/launch-intents/:id` | `prepared`, `submitted`, `included`, `confirmed`, `reverted`, `rejected`, `expired`, `unresolved` |
| `GET /api/launches`, `/:chainId/:token`, `/:chainId/:token/candles` | Registry only; protocol phase and market data attached with their own status and timestamps. Candle windows snap to sixty periods so one caller cannot make Mobula draw a chart per second; 60 candle requests a minute per address |
| `GET /api/pons/coins` | Pons-wide: the coins that have left their curve, from the `bonded` view of one Mobula pulse call for the configured factory (Mobula returns 50 per view), spam-flagged rows dropped, newest graduation first, with market cap, 24 h change, a DexScreener `chart` link and `madeWithPlum` for registry members. A logo Mobula stops sending is remembered. One snapshot cached 30 s in memory; failures return the last list as `stale` |
| `GET /api/pons/spotlight` | From the same snapshot: the newest coin to leave its curve for a pool, confirmed with `getLaunchedToken` (phase ≥ 2) before it is returned |

Writes require an `Origin` header equal to `PLUM_ORIGIN` and a session. Rate limits are per process and in memory: 1200 requests a minute per client address across every route, 60 a minute for the sign-in routes, 30 a minute per wallet for intents and submissions, 10 a minute per wallet for uploads. Behind the Netlify proxy (`PLUM_TRUST_PROXY=1`) the client address is `x-nf-client-connection-ip`, the header Netlify commits to; `X-Forwarded-For` is the fallback. With `PLUM_PROXY_SECRET` set, every route but `/api/health` also requires Netlify's `x-nf-sign` signature (`verifyProxySignature` in `http.ts`), so those headers cannot be forged by calling the Render hostname directly.

## Under load

Checked September 8 against the real RPC and a proxy-mode instance, without signing anything.

- **Viewers.** Explore reads five routes on load and three every half minute. A thousand page loads (5000 requests, 200 at a time) all answered 200 with a median of 9 ms and a worst case of about a second; Mobula is called once per 30 s snapshot, the spotlight is confirmed once per snapshot, factory settings once per 10 s and fee estimates once per 10 s, each shared by every caller that arrives meanwhile. A failed settings read serves the last value for up to a minute.
- **Creators.** One intent costs three RPC reads (`canLaunch`, `eth_estimateGas`, balance). The provider's compute-units-per-second cap, not credits, is the limit: 100 wallets preparing at the same instant first met Alchemy 429s. Reads now leave through a gate of eight at a time and a 429 backs off 500 ms, 1 s, 2 s, 4 s; the same 100-wallet burst then prepared 100 of 100 in 3.9 s. A read the provider still refuses records `provider_busy` on the intent, and the desk's Edit button prepares a fresh one.
- **Gas.** The gas limit handed to the wallet is the estimate plus a fifth; the quote and the balance check use the same figure.
- **Netlify** ends a proxied request after 26 s, so the transport timeout is 10 s.
- **Abuse, checked September 9.** The worker visits only intents with a submitted hash; prepared intents expire in one SQL statement, so a wallet spamming 30 quotes a minute (the per-wallet cap) cannot push real launches out of the worker's 200-intent pass. A hash the network has not seen is rechecked after 5, 10, 20, 40, then 60 s, and an intent holds at most three unsettled hashes, so invented hashes cannot turn the worker into an RPC amplifier. Candle windows are quantized and metered. The Alchemy key (Free plan, 300 CU/s cap on its billing page) sustained 40 `eth_call`s a second cleanly, with the dashboard meter peaking at 277 CU/s, and refused most of 80 a second; the gate of eight runs at about that rate, so bursts queue rather than fail.
- **Sign-in against the real RPC, September 9.** A scripted wallet ran challenge → signature → verify (ERC-6492 verification through Alchemy) → session cookie → `launch-config` with `canLaunch` true → intent (simulation `insufficient_funds` from an empty wallet, as expected) → three invented hashes accepted, a fourth refused, a cross-origin write refused, logout. The whole sequence took 344 ms.

## Membership rule as implemented

A launch is recorded only when a submitted hash resolves to a receipt whose sender, target, exact input, value and chain equal the intent, whose status is success, whose block matches a fresh canonical read, and which carries exactly one factory `TokenLaunched` event with the intent wallet as deployer. Tests cover forged senders, unrelated targets, altered input, wrong value, wrong chain, reverts, missing or duplicate events, deployer mismatch and stale block hashes.

Registry rows move from `included` to `confirmed` after `PLUM_CONFIRMATIONS` blocks (default 12) if the block hash still matches; a changed hash retracts the row and re-verifies from the pending submission. That depth is a policy setting, not a documented Robinhood finality guarantee.

## Verified

- September 8, later: the calldata the API encodes ran through `eth_estimateGas` against the deployed factory from real deployer wallets (a balance override for the unfunded one): 3,519,122 gas, about 0.00125 ETH at the fee cap of the moment, plus the 0.0005 ETH fee, so a launch needs roughly 0.002 ETH. The same call with the fee one wei short reverts. Robinhood's node reports a short balance as "exceeds the balance", now mapped to `insufficient_funds`. The load figures are under "Under load".
- September 8: `GET /api/pons/spotlight` returned live graduations (LEAD INDEX, Shopify Token, Ponzi Miners, Compute Token, each within minutes of graduating) with Mobula's logo and a factory phase of `PoolCreated`; `GET /api/pons/coins` listed the 50 most recent graduations with logos and DexScreener links (DexScreener indexes Robinhood Chain as `robinhood`); 25 backend tests pass.
- September 7: 23 backend tests and 28 frontend tests pass; backend typecheck and both lints are clean.
- The backend read live mainnet settings through the public Robinhood RPC at block 56,862,125: fee 0.0005 ETH, gate open, config 0 enabled, the same economics hash as the September 7 evidence. This exercised the ABI tuple decoding against deployed code.
- Explore renders the registry's honest empty state and the creation desk's live terms in the browser.

## Not verified

- No launch was signed or mined with a real wallet, so the receipt path (event decoding, the confirmation worker, Mobula enrichment of a Plum token) is proven only by tests. The browser wallet path (AppKit → injected wallet → `personal_sign` → `eth_sendTransaction`) has not been driven with a real extension in this checkout's Chrome profile, which has no wallet installed; the picker opens and lists WalletConnect and the injected options. If recording a sent hash with Plum fails, the desk keeps the hash and retries the record, never the transaction.
- pons custom errors are declared without parameters because their signatures are unpublished; an unknown revert is reported with its selector.
- The logo URI written onchain points at `PLUM_PUBLIC_URL`. For a real launch that must be a durable public host or an IPFS pin; the local disk adapter is development only.
- `verifySiweMessage` for contract wallets depends on RPC; it was tested through Alchemy with an EOA (September 9), not with a contract wallet.
- Mobula normalization is based on the documented field names and a fake server; no live Mobula call was made. The root `.env` arrived at the end of the session in the main checkout; see [LAUNCH-API-HANDOFF.md](LAUNCH-API-HANDOFF.md).
- Initial buys, pair tokens other than ETH and the router path are encoded in the ABI but refused by the API until validated on a fork or a real launch. pons publishes no testnet deployment.

## Recommended next steps

1. Deferred checks in [LAUNCH-API-HANDOFF.md](LAUNCH-API-HANDOFF.md): the chain-switch session drop, then a few real mainnet launches (fee 0.0005 ETH each on September 7) to confirm `launchToken` encoding, the fee value, event decoding, the confirmation worker and Mobula enrichment against a real token.
2. Optional: a mainnet fork (Foundry `anvil --fork-url`) for failure paths such as a closed gate or changed terms.
3. Deploy per [DEPLOY.md](DEPLOY.md) (Netlify plus Render); IPFS pinning for logos remains open.
