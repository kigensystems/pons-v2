# PONS infrastructure website references

Observation date: 2026-09-06 (America/Los_Angeles). Run: extend, then synthesize and package.

Question: Which visually strong websites for launched utility/infrastructure tokens offer useful design principles for a professional PONS infrastructure concept?

Scope assumption: references across crypto; PONS means the launchpad on Robinhood Chain. The user asks for launched projects, so inclusion is a documented token launch, not a price, return, or market-cap threshold. This is a curated design comparison, not an exhaustive claim to identify the world's best sites. Current websites are not necessarily their original launch websites.

Discovery: public web search and the official project/launch sources below. Frozen, identity-deduplicated queue of five; no substitutions for unavailable sites. Compare hero art direction, information hierarchy, concrete product presentation, evidence, and relevance to PONS. Stop after five outcomes and one checkpoint. No token transactions, account connections, forms, or downloads from sites.

| Project | Token identity / chain | Inclusion evidence | Website |
|---|---|---|---|
| Celestia | TIA / native Celestia | [Mainnet deployed October 31, 2023](https://blog.celestia.org/celestia-mainnet-is-live/); [TIA genesis role](https://blog.celestia.org/genesis-drop/) | https://celestia.org/ |
| LayerZero | ZRO / Ethereum 0x6985884C4392D348587B19cb9eAAf157F13271cd | [Official retrospective records launch and unlocked supply](https://layerzero.network/blog/the-zro-token); [exchange's June 20, 2024 listing](https://support.poloniex.com/hc/en-us/articles/24305852047895-New-Listing-Layerzero-ZRO) | https://layerzero.network/ |
| Wormhole | W / native multichain SPL and ERC-20 | [Official April 25, 2024 notice confirms W available on Solana and four EVM networks](https://wormhole.com/blog/w-is-now-natively-multichain-on-ethereum-and-layer-2s) | https://wormhole.com/ |
| Aethir | ATH / Ethereum 0xbe0Ed4138121EcFC5c0E56B40517da27E6c5226B | [Mainnet and ATH live June 12, 2024](https://ecosystem.aethir.com/blog-posts/aethirs-mainnet-launch-claim-stake-ath) | https://aethir.com/ |
| io.net | IO / Solana, io.net project | [Binance June 11, 2024 listing announcement](https://www.binance.com/en/support/announcement/detail/6556e3b5aae54c76adb0fd267b105a15) | https://io.net/ |

Existing evidence: general runs contain the August 31 atomic v2/v3 cat comparisons; none of these five candidates was found there. Historical cat evidence is outside this comparison. Existing modified guides, recorder, tests, stitching code and journals are preserved; new journal entries are appended only.

PONS context (separate from the visual sample): https://ponslaunchpad.com/ and its linked public create page describe fixed-supply launches, wallet-submitted transactions, discovery and graduation. https://docs.ponsfamily.com/ redirected to https://docs.ponsfamily.com/blocked?country=GB; no bypass attempted. API/SDK/contracts and technical integration support remain unverified. Public metrics and product claims are not independently audited.

Artifacts: [Design findings](design-findings.md), [capture manifest](capture-manifest.jsonl), and screenshots in this directory. Mechanical launch qualification is recorded in the recorder's required `successSignal` field; this does not mean commercial success was established.

Capture method: `segments/<project>/index.json` records actual scroll positions for Celestia, LayerZero, Wormhole and Aethir. [The task-local stitch script](../../../../work/2026-09-06-pons-infrastructure-design/stitch.py) normalizes browser-transport scaling and preserves earlier pixels in overlaps. io.net uses a limited browser full-page artifact because the DOM geometry interface returned zeros; its filename does not imply use of this custom stitch script. See the report for visual defects. Failed Celestia attempts are task-local scratch, not selected evidence.

Validation: recorder `validate --require-checkpoint` passed with five candidates, five analyzed, one checkpoint and zero captured-but-unjournaled. `git diff --check` passed. The comparison board was visually inspected; the long-page capture limitations are retained explicitly. Research is saved locally without committing or pushing. Existing unrelated modifications remain in place.
