# Next session: real wallet sign-in and simulation

Prepared September 7, 2026 at the end of the session that built the launch API; updated the same day after the work merged. Technical reference: [LAUNCH-API.md](LAUNCH-API.md). Decisions and evidence: [PLUM-INTEGRATION.md](PLUM-INTEGRATION.md).

**Status:** merged into `main` on September 7, 2026 through [PR #2](https://github.com/kigensystems/pons-v2/pull/2) (merge commit `d099255`). The user has moved on to other parts of the site; the deferred checks below wait for a later session and should start from a fresh `feature/<name>` branch off `origin/main`.

## Where things are

- Everything below is on `main`. The `feature/launch-api` branch and the two worktrees that pointed at it (`launch-api-handoff-docs-945be2`, `plum-integration-api-d69724`) are finished and can be deleted.
- The user reviewed and approved the Explore header, the AppKit picker and the Disconnect path in the browser. The rendered creation desk itself has not been walked through with the user; show it when the launch test happens.
- Credentials: the root `.env` sits in the **main checkout** (`/Users/error/Claude Projects/Code/pons-v2/.env`); a copy sits in the worktree root (Git ignores both). It sets `ALCHEMY_API_KEY`, `MOBULA_API_KEY`, `ROBINHOOD_RPC_URL`, `ROBINHOOD_TESTNET_RPC_URL`, `SESSION_SECRET` and `VITE_REOWN_PROJECT_ID` (the Reown AppKit project id, a public value). No `PLUM_*` variable is set. Never print the file.
- **No pons testnet deployment exists.** Checked September 7: the pons v2 docs, the pons docs root, the Mobula pons almanac, Robinhood's network page and Alchemy's overview list mainnet (4663) addresses only, and the mainnet factory and router have no code on 46630. Creation testing therefore needs a mainnet fork (`anvil --fork-url`, impersonated creator; Foundry is not installed on this Mac) or a real whitelisted mainnet launch. If pons ever publishes testnet addresses, run with `PLUM_CHAIN_ID=46630`, `PLUM_FACTORY_ADDRESS` and `PLUM_ROUTER_ADDRESS`; the backend refuses testnet without them.
- Wallets connect through **Reown AppKit** over wagmi (`frontend/src/launch/appkit.ts`), the same modal pons uses, with the stock look and Plum's ink as accent. Plum's SIWE challenge and verify are unchanged. Header states: Connect wallet → picker; connected but unsigned → Disconnect plus "Sign in · 0x…"; signed in → address plus Sign out (which also disconnects). The creation desk is a top-layer dialog, so it closes while the picker is open and reopens after sign-in.

## Running in the worktree

`npm --prefix backend run dev` reads `../.env` relative to `backend/`, which is the worktree root. Either copy the main checkout's `.env` there (Git ignores it) or run:

```sh
cd backend && node --disable-warning=ExperimentalWarning --env-file="/Users/error/Claude Projects/Code/pons-v2/.env" src/server.ts
```

Add `SESSION_SECRET` (32+ random characters) to that `.env` first. Then `npm --prefix frontend run dev`; Vite proxies `/api` to `127.0.0.1:8787`. The Browser pane config `plum-frontend` in `.claude/launch.json` starts the frontend. Listening sockets and outbound RPC need the Bash sandbox off.

Public read-only fallback that worked this session without keys: `ROBINHOOD_RPC_URL=https://rpc.mainnet.chain.robinhood.com`.

## What the next session must do

1. **Real wallet sign-in: done September 7 with Rabby.** Challenge and verify returned 200, the SIWE message showed domain `127.0.0.1:5173` and chain 4663, and the header showed the address. Account switch could not be tested (the wallet holds one account). **Deferred by the user on September 7:** the chain-switch check (switch the wallet off Robinhood Chain while signed in; the page must drop the session and show the notice) and the real launch test in item 3. Both happen in a later session. The user approved the AppKit picker and the Disconnect path.
2. **Real simulation.** Prepare a launch and read the intent's `simulation` field. Expect either `ok: true` with gas and a required-wei figure or a named failure (`NotWhitelisted`, `insufficient_funds`, `LaunchEconomicsMismatch`, or a raw selector). This is the first `eth_estimateGas` against the encoded `launchToken` payload for a real account; record the result in the docs. Do not sign a mainnet transaction without explicit authorization for that wallet, amount and parameters.
3. **Real mainnet launches, pinned September 7.** The user chose to test creation with a few real tokens rather than a fork. Factory reads that day: gate open, `canLaunch` true for the user's wallet, launch fee 0.0005 ETH, gas price 0.3 gwei. The user's wallet held 0.0000025 ETH on Robinhood Chain, so ETH must be bridged first (0.005 ETH covers several launches). Tokens are permanent and public on pons's Explore; name them as tests. When ready: run backend with `PLUM_LOG_REQUESTS=1`, open the creation desk on Explore, and follow the intent through simulation, signing, `included` and `confirmed`. Foundry (`brew install foundry`, `anvil --fork-url`) remains the route for failure paths such as a closed gate or changed terms.
4. **Mobula against a real token.** The registry only enriches its own launches, so this needs a launch first. Then check `market.status` on `GET /api/launches`, the candles route, and the retry/stale paths against a live key. Compare the normalized fields to the documented response shape and fix the field mapping if Mobula names differ.
5. **Rerun the diagnostic** `node --env-file=.env scripts/check-launch-apis.mjs` from the main checkout for fresh evidence; it replaces the same-day report.

## Known gaps carried forward

- pons custom errors are declared without parameters; revert reasons with arguments surface as a selector only. Ask pons for the ABI JSON.
- The onchain logo URI is `PLUM_PUBLIC_URL/api/uploads/<id>`. Local disk storage is development only; a real launch needs a durable public host or IPFS pin behind the existing `ImageStore` adapter.
- `PLUM_CONFIRMATIONS` defaults to 12; Robinhood's finality depth is undocumented.
- Initial buys are refused by the API until validated; the router ABI is transcribed but unused. Non-ETH pairs are offered and encoded since September 8 (the approved list is folded from the factory's `PairTokenApprovalUpdated` events), but no pair-token launch has been signed with a real wallet.
- Wallet discovery uses `window.ethereum` only; EIP-6963 would handle multiple extensions.
- Rate limits are in-process memory; a multi-instance deployment needs a shared store.
- Session verification for contract wallets goes through RPC (`verifySiweMessage`); only EOA signatures were tested offline.

## Checks that passed at wrap-up

Backend: 23 tests, typecheck, lint. Frontend: build, lint, 28 tests. Live mainnet settings read through the public RPC. Explore and the creation desk rendered at 1440×900 and 375 wide against the running backend. No credential strings in the frontend bundle.
