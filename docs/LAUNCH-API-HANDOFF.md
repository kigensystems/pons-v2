# Next session: real wallet sign-in and simulation

Prepared September 7, 2026 at the end of the session that built the launch API. Technical reference: [LAUNCH-API.md](LAUNCH-API.md). Decisions and evidence: [PLUM-INTEGRATION.md](PLUM-INTEGRATION.md).

## Where things are

- Branch `feature/launch-api`, pushed to `origin`, based on `main` at `f94d211`. Worktree: `.claude/worktrees/plum-integration-api-d69724`. No PR is open yet; open one to `main` when the wallet flow is verified, rebased first.
- Commits: backend and tests; docs, null-session fix, preview config; frontend wallet flow and registry-backed Explore. The frontend commit was made to preserve the work; the user has not reviewed the rendered creation desk. Show it before opening the PR.
- Credentials: the user added the root `.env` on this Mac during the wrap-up. It sits in the **main checkout** (`/Users/error/Claude Projects/Code/pons-v2/.env`), not in the worktree. It sets `ALCHEMY_API_KEY`, `MOBULA_API_KEY`, `ROBINHOOD_RPC_URL`, `ROBINHOOD_TESTNET_RPC_URL`. It does **not** yet set `SESSION_SECRET` (required by the backend) or any `PLUM_*` variable. Never print the file.
- The user said a **testnet address** exists. It is not in `.env` and was not given in chat. Ask for it, then run testnet with `PLUM_CHAIN_ID=46630`, `PLUM_FACTORY_ADDRESS`, and `PLUM_ROUTER_ADDRESS` set explicitly; the backend refuses to start on testnet without them and never falls back to mainnet addresses. Confirm which contract the address is (factory or router) and check `eth_getCode` at it before relying on it.

## Running in the worktree

`npm --prefix backend run dev` reads `../.env` relative to `backend/`, which is the worktree root. Either copy the main checkout's `.env` there (Git ignores it) or run:

```sh
cd backend && node --disable-warning=ExperimentalWarning --env-file="/Users/error/Claude Projects/Code/pons-v2/.env" src/server.ts
```

Add `SESSION_SECRET` (32+ random characters) to that `.env` first. Then `npm --prefix frontend run dev`; Vite proxies `/api` to `127.0.0.1:8787`. The Browser pane config `plum-frontend` in `.claude/launch.json` starts the frontend. Listening sockets and outbound RPC need the Bash sandbox off.

Public read-only fallback that worked this session without keys: `ROBINHOOD_RPC_URL=https://rpc.mainnet.chain.robinhood.com`.

## What the next session must do

1. **Real wallet sign-in.** Open Explore in a browser with a wallet extension (the Browser pane has none), connect, confirm the SIWE message shows domain `127.0.0.1:5173` and chain 4663 or 46630, sign, and check `GET /api/auth/session` returns the address. Test account switch and chain switch: the page must drop the session and show the notice.
2. **Real simulation.** Prepare a launch and read the intent's `simulation` field. Expect either `ok: true` with gas and a required-wei figure or a named failure (`NotWhitelisted`, `insufficient_funds`, `LaunchEconomicsMismatch`, or a raw selector). This is the first `eth_estimateGas` against the encoded `launchToken` payload for a real account; record the result in the docs. Do not sign a mainnet transaction without explicit authorization for that wallet, amount and parameters.
3. **Testnet or fork creation.** With the testnet addresses, run the full flow end to end on chain 46630 and let the worker take the intent to `included` and `confirmed`. If the testnet deployment is unusable, a Foundry fork of mainnet (`anvil --fork-url`, impersonated creator) is the alternative; Foundry is not installed on this Mac.
4. **Mobula against a real token.** The registry only enriches its own launches, so this needs a launch first. Then check `market.status` on `GET /api/launches`, the candles route, and the retry/stale paths against a live key. Compare the normalized fields to the documented response shape and fix the field mapping if Mobula names differ.
5. **Rerun the diagnostic** `node --env-file=.env scripts/check-launch-apis.mjs` from the main checkout for fresh evidence; it replaces the same-day report.

## Known gaps carried forward

- pons custom errors are declared without parameters; revert reasons with arguments surface as a selector only. Ask pons for the ABI JSON.
- The onchain logo URI is `PLUM_PUBLIC_URL/api/uploads/<id>`. Local disk storage is development only; a real launch needs a durable public host or IPFS pin behind the existing `ImageStore` adapter.
- `PLUM_CONFIRMATIONS` defaults to 12; Robinhood's finality depth is undocumented.
- Initial buys and non-ETH pairs are refused by the API until validated; the router ABI is transcribed but unused.
- Wallet discovery uses `window.ethereum` only; EIP-6963 would handle multiple extensions.
- Rate limits are in-process memory; a multi-instance deployment needs a shared store.
- Session verification for contract wallets goes through RPC (`verifySiweMessage`); only EOA signatures were tested offline.

## Checks that passed at wrap-up

Backend: 23 tests, typecheck, lint. Frontend: build, lint, 28 tests. Live mainnet settings read through the public RPC. Explore and the creation desk rendered at 1440×900 and 375 wide against the running backend. No credential strings in the frontend bundle.
