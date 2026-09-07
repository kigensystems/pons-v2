# Pons Complaints Deep Dive

*Compiled for Dallas — X research + earlier pad findings (Sep 2026)*

First frame: Pons doesn’t have a StonkFun-style “this pad is cooked” chorus. It’s the #1 RH pad (~$5B+ vol claimed, $25M+ creator fees), so most X noise is either shill, ecosystem spam, or *specific* product friction. That actually makes the real complaints more useful — they’re from people who still want to use it.

---

## Initial findings (from earlier pad research)

### Across the stock-pair / memestock pads

- **StonkFun ($STONK, Sol):** loudest pain = fills/MEV, indexer/graduation bugs, team `$STONK` resentment, transfer tax. Classic “pad UX + tokenomics betrayal.”
- **Brew (BNB):** frontend jank, dumps while being shilled as “BNB’s Pons,” people begging for “buyback like Pons.” No moat; CN attention wasn’t even on Brew.
- **Pons (RH):** the one others copy *as aspiration* (buybacks, fee share, flywheel). Complaints exist, but they sit under a winner’s vibes — gas, fee UX, access/trust surface, creator-fee plumbing, and “tokens on Pons suck / get rugged” (pad adjacent, not always pad fault).

### What Pons already ships / markets (so complaints = gaps vs that pitch)

- Fixed supply, Uniswap V3, locked LP, ~1% pool fee (often framed 70% creator / 30% protocol; protocol ~80% into `$PONS` treasury/buy-accumulate, big burns ~28–29%).
- Holder fee sharing on v2 tokens.
- CTO form / migrations (e.g. Noxa → Pons).
- Multi-asset fees (stocks, ETH, USDG, cbBTC called out).
- Ozzy (`@MEADGod`) very hands-on in replies (“issa bug”, DM wallet, takes notes for updates).

---

## What people actually complain about on X (clustered)

### 1. Gas / chain cost (loudest “product” complaint right now)

Replies to Ozzy: gas “higher than mainnet,” peaks “tens or hundreds of times” other chains; people saying they *want* to launch on Pons but gas is too high. This is RH/L2 reality hitting the launchpad brand — users blame Pons even when it’s chain economics.

**Improvement angle:** quote gas *before* deploy/swap in UI; batch/sponsor paths for launch; “cheap window” alerts; abstract fees into quote asset so it doesn’t feel like ETH mainnet trauma.

### 2. Creator fee claiming / indexing bugs (recurring, Ozzy admits)

Creators: “not showing any fees,” “no collection,” coin not listed under my account, Ozzy: “issa bug,” “up to 24h… resolved on our end.” Same class as StonkFun’s indexer pain — **trust breaks when money is invisible**.

**Improvement angle:** chain-truth fee dashboard (claimable vs claimed vs pending, tx links); status page for indexer lag; push/email when fees appear; never show `$0` without “indexing…” vs “actually zero volume.”

### 3. Access / malware / VPN hell (month-long credibility bruise)

Ozzy’s own post: month battling VirusTotal; site inaccessible without VPN / redirects to dead ends; Chrome still warning after “cleared.” That’s a *retail death* issue on a Robinhood-adjacent chain.

**Improvement angle:** signed app / IPFS mirror / in-wallet embed; clear “official domains only” banner; phishing education baked into launch flow (see #4).

### 4. Spoofed “institution launched on Pons” rugs

User burned on a token that spoofed a prestige finance X account → “launched on `$pons`” → volume then rug. Ask Ozzy for **proof of** (account/ownership verification). Pad becomes the *stage* for social-engineering rugs.

**Improvement angle:** optional verified-handle bind (already X-handle required on v2 — people hate that too, see #7); “claim this X” challenge; big red “unverified social” badge; don’t let launch UI look like brand endorsement.

### 5. Fee model confusion / double tax / holder-fee “vamps”

- Users can’t tell fee sharing on vs “feeding a random person 3/3 tax.”
- Holder fee sharing tokens looking like **2%** (1% base + 1% rewards) — “bug or intended?”
- Devs raging: holder fee vamps force rugs out of the chart because holders flip in 30s — “revert it.”
- Feature asks: slider for creator / reflections / LP with **total tax including platform** shown upfront.

**Improvement angle:** one tax preview before launch (“you pay X, holders get Y, protocol Z”); presets (degen / hold / CTO); don’t bury that holder-share changes effective tax.

### 6. Can’t buy / sell / pair broken

“why cant buy this,” “cant buy and sell… lots wanna buy,” Rivan pairs buy fails — Ozzy asks “what’s the issue?” Classic pool/router/UI desync.

**Improvement angle:** trade button that fails with *on-chain reason* (no liquidity, wrong pool, paused, wrong quote); pair health checks; “chain says” vs “UI says.”

### 7. Launch UX rigidity

“Why can’t we attach a tweet to v2 tokens? Why does it have to be an X handle? Does everything have to be some crazy project?” Ozzy notes it for an update. Tension: anti-spoof vs friction for shitpost launches.

**Improvement angle:** tweet URL *or* handle; temporary “unverified” launches with caps; progressive verification for fee unlocks.

### 8. CTO / creator-fee custody politics

Wen creator fees for CTO; burn fees for community; “Pons locked creator fee claims” after hacks; communities applying for fee takeover. Pad sits in the middle of dead-dev / hack / CTO drama.

**Improvement angle:** transparent CTO handoff (timelock, public form status, fee freeze rules); “fees locked pending review” explained in UI, not rumor.

### 9. Concentration / slow rugs *on* Pons (pad-adjacent)

Warnings on things like `$perpshood` — 10% + multiple 5%/3% bags = “rug or slow rug.” Not Pons’s contract failing; it’s **discovery with no holder-risk chrome**.

**Improvement angle:** top-holder + cluster warning on token page (Bubblemaps-style); time-to-first-sell; “fresh wallets / same funder” flags — *this* is where a Pons-native complement product actually helps without competing as a pad.

### 10. Competitive fee narrative (quiet but real)

DeFi Edge note: Uniswap pad on RH cheaper (~4x less trading cost) / newer tech / bigger brand — yet Pons still outtrading ~3:1. So the complaint isn’t “Pons is losing,” it’s “I’m overpaying for the social/liquidity venue.” Fragile if UX keeps slipping.

**Improvement angle:** own the premium (“you pay for flow + fee share”) *or* cut effective cost on high-volume pairs; don’t pretend Uniswap isn’t cheaper.

### 11. Noise that looks like complaint but isn’t signal

Spam “`$PONS` SCAM / Turkish group / Ozzy rug anytime” bots blasting Ozzy’s every post with ~0 engagement. Ignore for product; useful only as “reputation attack surface.” Real scam risk users feel is **#3 + #4**, not that template.

### 12. Ecosystem wants (feature requests, not hate)

Customize creator-fee distribution; more flywheel tools (Longshot / Sinjoh / PONSTR-style fee → `$PONS` dividends already exist *around* Pons). People aren’t asking for a rival pad — they’re asking for **controls and clarity on top of Pons**.

---

## How this differs from StonkFun / Brew (why it matters for “ideas”)

| Pain | StonkFun | Brew | Pons |
|---|---|---|---|
| Core vibe | Pad betrayal + MEV | Clone dump while shilled | Winner with sharp edges |
| Indexer / fees invisible | Heavy | Some | Real, Ozzy acknowledges |
| Fills / MEV | Central | Less discussed | Less “bundle fail” talk; more gas + tax confusion |
| Trust / site | Less VT drama | Frontend hate | VT/VPN/Chrome warnings + spoof launches |
| Tokenomics rage | `$STONK` tax | “be like Pons” | Holder-fee vamp + unclear total tax |

So if you’re thinking **improvements / a Pons-native complement** (not a rival pad), X is pointing at: **clarity + chain-truth + anti-spoof + holder risk chrome + gas abstraction** — not “another bonding curve.”

---

## Idea map (tied to complaints, not vibes)

1. **Fee truth panel** — claimable/pending/claimed, tax breakdown, holder-share on/off, effective % before you click. Fixes #2, #5, #8.
2. **Quote-gate / gas preview** — show RH gas + platform fee in the quote asset; optional sponsor/batch for deploys. Fixes #1.
3. **Official surface hardening** — mirrors, domain pin, “only these URLs,” in-wallet. Fixes #3.
4. **Social proof of ownership** — challenge-response for claimed X/brands; unverified badge default. Fixes #4, softens #7.
5. **Trade failure = chain reason** — Fixes #6.
6. **Holder / cluster risk strip on every Pons token page** — Fixes #9; this is the cleanest *product you launch on Pons* story (sell the improvement, token on Pons).
7. **CTO desk UX** — fee lock states, handoff timeline, public queue. Fixes #8.

---

## Bottom line

Pons hate-mail is sparse because they’re winning. The actionable complaints are **gas sticker shock, invisible creator fees, site/phishing trust, fee-math opacity (especially holder share), buy/pair breaks, and no holder-risk UI for rugs that happen *on* the pad.** That’s a clearer product brief than StonkFun’s “everything is on fire.”
