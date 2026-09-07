# Next session: integrate Plum launches

Prepared September 7, 2026. The user deferred implementation to the next session. This handoff adds no live integration or deployment.

## Start here

- Repository: `C:\Users\Still_yesterday\Desktop\Pons v2`; remote `kigensystems/pons-v2`.
- Integration baseline: `main` at `3a11bb2`, pushed to `origin/main`. The working tree was clean before writing this handoff. Inspect current state again before editing; other sessions also work here.
- Read [AGENTS.md](../AGENTS.md), [project brief](PROJECT-BRIEF.md), [visual target](VISUAL-TARGET.md), then the [detailed API report](PLUM-INTEGRATION.md). The report is the technical reference; this file is the execution checklist.
- Existing scope text still says API integration is deferred. The user has selected it as the next session's work. When resuming that request, align the project scope with it; do not treat the old prototype restriction as a reason to request the same authorization again.
- Continue committing to `main` and pushing normally. Never rebase or force-push `main`. Preserve unrelated edits. Publication, third-party messages, paid upgrades and real onchain transactions are not authorized by this handoff.

## Decisions already made

**Explore displays only launches created through Plum.** Its membership source is our backend registry, not a global pons feed or Mobula discovery response.

1. Authenticate the creator wallet and record a server-issued launch intent before submission. Bind wallet, chain, target, canonical parameters, salt, metadata, quoted terms, expiry and idempotency key.
2. Independently verify the confirmed transaction and factory event against that intent, including forwarded creator attribution when using a router.
3. Store the resulting token/curve, transaction and block identity in the Plum registry.
4. Query the registry for Explore; use Mobula to enrich those tokens with market data. Preserve confirmed listings when market data is delayed or unavailable.

Do not admit arbitrary submitted hashes, infer membership from a ticker or creator wallet, or include every token from the shared pons factory. This registry proves participation in our backend workflow, not which browser UI was physically used. Stronger onchain attribution would require a separately assessed protocol marker/router.

Use **Alchemy RPC**, **pons v2 contracts**, and **Mobula as the initial replaceable market-data adapter**. No new data-provider subscription is needed to start. Wallet signing stays with the user; no backend private key or custody is planned. Start with ETH-only creation, then validate the atomic initial-buy path. USDG/cbBTC remain sample choices until approved asset addresses and economics are checked.

## Credentials and verified evidence

The ignored repository-root `.env` already contains `MOBULA_API_KEY`, `ALCHEMY_API_KEY`, `ROBINHOOD_RPC_URL` and `ROBINHOOD_TESTNET_RPC_URL`. The user supplied these for reuse; do not ask them to paste the keys again on this machine. Never print the file, expose secrets through `VITE_` variables, or commit credential values. The [.env.example](../.env.example) is blank. A different checkout/machine will need a secure local provision because `.env` is intentionally not pushed.

The [sanitized RPC evidence](api-evidence/alchemy-rpc-2026-09-07.json) records September 7 checks:

- Mainnet **4663** and testnet **46630** both passed HTTP reads and short live WebSocket subscriptions.
- At mainnet block **56,821,996**, creation fee was **0.0005 ETH**, config 0 was enabled, base curve fee was **1%**, and the creator-tax cap was **10%**.
- Both `launchEnabled()` and `canLaunch` for an arbitrary probe address returned true. This corrected the docs' earlier closed-launch claim. These are dated observations, not constants or approval of the user's eventual transaction.
- Published mainnet factory/router addresses had deployed code. Those same addresses had **no code on testnet**. Actual pons testnet addresses or a suitable local fork are still required for realistic creation tests.
- Earlier Mobula checks recognized the current factory and `pons-v2`, and returned the reference legacy PONS token. Fresh v2 launch latency, candles, graduation continuity and streaming entitlement remain untested.

Recheck mutable contract state when implementing, using the [read-only diagnostic](../scripts/check-launch-apis.mjs):

```sh
node --env-file=.env scripts/check-launch-apis.mjs
```

The script saves a dated report and replaces that day's file on rerun. Preserve the prior evidence in Git history and describe new observations accurately. An open gate is not a successful launch simulation or completed contract audit.

## What exists and what to build

The frontend remains a demo. Relevant entry points are `frontend/src/launch/LaunchPage.tsx`, `LaunchForm.tsx`, `TokenGrid.tsx`, and `launchModel.ts`. No wallet connector, backend, persistent registry or runtime API adapter has been implemented. The detailed report specifies proposed backend routes and record fields; database, backend framework and image-storage hosting remain open implementation choices.

Implement in this order:

1. Choose the smallest durable backend/storage approach appropriate to the existing React/Vite app. Add server-only provider configuration, narrow adapters and clear configuration errors. Avoid unrelated infrastructure or frontend refactoring.
2. Add wallet/network connection and fresh launch-configuration reads. Prepare transactions with integer amounts and a proper ABI client; replace sample fee calculations in the real flow.
3. Add authenticated intents, durable image upload, idempotency, registry persistence and receipt reconciliation. Wire Explore to registry membership with an honest empty state; keep demo fixtures separate from real launches.
4. Build ETH-only creation through simulation and explicit wallet review. Handle rejection, changed terms, insufficient funds, pending/replaced/reverted transactions and recovery after restarts. Use a confirmed test environment; never silently fall back to mainnet.
5. Add Mobula enrichment with shared caching, timestamps, stale/error states and bounded retries. Verify v2 data against known receipts before presenting it as reliable.
6. Validate initial-buy routing, slippage and creator/recipient attribution before enabling it. Prepare a concrete production-readiness review; a real launch needs explicit wallet/funds/parameter authorization.

## Preserve and validate

Keep the name **Plum**, our grain/paper treatment, Apple Garamond titles, Georgia body copy, Instrument Serif details and VT323 labels. Preserve the six-column desktop/two-column mobile grid, opening-to-Explore scroll transition, Macintosh artwork, TV controls, opt-in sound, rendering bounds and existing playback safeguards. Shader is a reference; generated images were rejected. No logo exploration or redesign is requested.

Prior build/lint and diagnostic checks passed. After implementation, run build/lint and meaningful behavior tests for intent verification, forged/unrelated receipts, duplicate submissions, integer amounts, wallet/network changes, provider outages and recovery. Verify secrets are absent from the frontend bundle. Use the existing production preview at `http://127.0.0.1:4173/` for desktop/mobile interaction checks, following AGENTS.md. Report automated checks and visual inspection separately.

Finish the next session with implemented scope, evidence, outstanding dependencies and concrete next steps. Keep the API report current as decisions become implementation. Do not describe a prototype, simulation, successful RPC read or provider metadata entry as a completed live launch.
