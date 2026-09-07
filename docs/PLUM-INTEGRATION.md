# Plum integration direction

September 7, 2026. Provider recommendation and future implementation requirements, not a completed chain integration or deployment.

## Explore membership

The user clarified that Explore must contain launches created through **Plum**, rather than all pons launches. The current grid remains a visual prototype with sample data.

Use a Plum launch registry as the membership source. Proposed flow:

1. Authenticate the creator wallet and issue a one-use launch intent bound to the wallet, chain, factory, launch parameters and salt before signing the transaction.
2. Verify the successful receipt server-side against that intent, including the expected contract/event, token, curve and initiating creator. Resolve the initiating wallet correctly for forwarded launches.
3. Store the token address, chain ID, transaction hash, block/hash, event index, creator and intent ID. Reconcile pending transactions, replacements and reorganizations.
4. Query this registry for Explore and enrich only its tokens with market data. Preserve newly confirmed entries while a data provider catches up; represent missing market data explicitly.

Do not admit arbitrary submitted transaction hashes or infer membership from ticker, creator wallet alone, or the shared pons factory. The documented `TokenLaunched` event contains no website identifier. This registry defines membership in our launch workflow; it does not cryptographically prove which browser UI was used. Stronger independent onchain attribution would require a supported partner identifier or compatible dedicated router, verified with pons before designing it. See the [pons v2 contract and event documentation](https://docs.ponsfamily.com/v2).

## Provider recommendation

- **RPC: Alchemy as the initial default.** Robinhood explicitly recommends it and documents HTTPS and WebSocket endpoints. Mainnet uses chain 4663 and ETH gas. Provision `https://robinhood-mainnet.g.alchemy.com/v2/{API_KEY}` through the provider dashboard. This is a support/fit recommendation, not a measured claim of lowest latency. The public Robinhood RPC is rate-limited and not recommended for production. [Robinhood network configuration](https://docs.robinhood.com/chain/connecting/)
- **Market enrichment: start with Mobula, behind a replaceable adapter.** Its documented Robinhood APIs cover token data, trades, candles and discovery. [Coverage](https://docs.mobula.io/blockchains/robinhood)
- **Comparison candidate: Codex's market-data API.** Its supported-network list includes Robinhood 4663 and describes GraphQL token, pair, wallet and event data. Specific v2 launch/curve coverage and latency remain untested. This is the external data provider, unrelated to the Codex development app. [Network support](https://docs.codex.io/networks)
- **Broader data alternative: Allium.** It documents Robinhood mainnet historical data, real-time APIs, DEX trades and pricing. Consider it if custom analytics or historical coverage becomes the deciding need; no subscription or benchmark has been run. [Mainnet coverage](https://www.allium.so/blog/supporting-robinhood-chain-at-launch/)

Use RPC/receipts and protocol state for confirmed deployment and lifecycle, the Plum registry for membership, and market providers for enrichment. Avoid acquiring several subscriptions before a concrete data gap exists.

## Bounded Mobula checks

Three read-only production HTTP requests were made using the locally saved key. No transaction, webhook, stream, rebuild, or account setting was submitted.

- `GET /api/1/system-metadata?factories=true&poolTypes=true&chainId=evm%3A4663&name=pons` returned HTTP 200. It returned factories outside the requested chain/name, so those filters cannot be assumed to apply in this response. A follow-up repeated the request and inspected the result with local filtering: 457 factories overall, 55 on Robinhood, with the documented v2 factory `0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e` present and pool type `pons-v2` listed.
- `GET /api/2/token/details?chainId=evm%3A4663&address=0x39dBED3a2bd333467115dE45665cC57F813C4571` returned the reference PONS token, matching chain/address and source `pons`, with price data. This was a legacy-token access/identity check, not verification of v2 trading or price accuracy. [Reference token](https://docs.ponsfamily.com/)
- The initial sandbox network attempt failed before an HTTP response; the authorized network checks succeeded. No credential values were printed or written into this report.

Factory registration demonstrates recognition, not complete decoder or stream coverage. Before choosing a production market-data provider, compare known v2 launch receipts against time to first token response, pre-graduation trades/candles, graduation continuity, post-graduation prices, reconnect recovery and the account's actual limits. Mobula's [pons guide](https://docs.mobula.io/almanac/robinhood-launchpads/pons) currently describes the earlier V3-pool architecture; use pons's own v2 contracts as the integration authority.

## Local configuration and remaining work

The supplied Mobula credential is stored as `MOBULA_API_KEY` in the ignored repository-root `.env`. The tracked [template](../.env.example) contains no credentials. There is no backend consuming it yet. Never expose it through Vite variables, browser code, public assets, screenshots or source control.

The RPC endpoint is not provisioned. Wallet connection, durable image storage, backend launch-intent/registry logic, contract simulation, transaction handling and live market adapters remain to be implemented. No visual layout changes are required by this recommendation.

At the time of review, [pons v2 docs](https://docs.ponsfamily.com/v2) say public launches are closed and audits are unfinished. Check live `canLaunch(wallet)` before offering creation; test-network access and integration support are available through the contact listed there. No contact or deployment was performed.
