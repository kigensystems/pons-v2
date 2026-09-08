# Review triage

Written September 2026 after four reviews of the live site at `https://pluminfra.xyz`: this assistant's own pass (desktop 1440 × 900 and mobile 390 × 844 in the user's Chrome, headers by curl, source by grep), a Grok 4.6 transcript that read Crypto Twitter, and two reports from Astra. Every item below carries a status:

- **Verified**: reproduced live or read in source this session, with the file and line.
- **Source-supported**: an external reviewer's claim that matches the code but was not reproduced live.
- **Unverified**: needs a connected wallet or a real launch.
- **Dismissed**: checked and found wrong or overstated.

Work the sections in order. Do not start the second-screen redesign until the decisions in section 1 are made.

## 0. State after the triage sessions

The user set section 1 aside and asked for bugs, UX and stability first. The first pass (desk drafts in `sessionStorage`, visible field validation, the factory named in the eligibility message, a stale-read label that also fires on a lost refresh, an accurate visible launch notice, card labels and 33 px link hit areas, lazy-loaded paper pages so the opening ships no wallet code, Netlify cache and security headers, the licensed model deleted from the publish, `robots.txt` and `sitemap.xml`) was shown in Chrome, approved and pushed as `32b949c` on September 7. After the deploy, `/assets/*.js` answered `cache-control: public,max-age=31536000,immutable` and the frame, content-type and referrer headers were live. The model URL no longer served the file but answered 200 with the 1.4 kB SPA shell, because the catch-all redirect answered every path; the second pass below changes that.

Second pass, approved in Chrome and pushed on September 7 (build, lint and 31 tests clean):

- Video channels on demand. `frontend/src/monitorPlayback.ts` sets `preload` to `auto` for the first channel only and `none` for the rest, and no longer calls `load()` at creation (with `preload = 'none'`, an explicit `load()` opens and aborts a request per channel). `warm(index)` sets `auto` and calls `load()` once; it runs for the upcoming channel when the current one starts playing and for the new channel in `advance()`, so a channel that fails early cannot cascade into the stall detector. Checked in the in-app browser: the opening fetched `channel-04.mp4` alone; 02, 03 and 01 were each fetched once the channel before them started, across two channel changes, no console errors. One new test in `tests/monitorChannels.test.ts`.
- Not-found page. `frontend/src/notFound/NotFoundPage.tsx` and `notFound.css`, lazy-loaded from `pages.ts`; `main.tsx` routes every path other than `/`, `/explore`, `/launch` and `/about` to it. Paper header and footer, the Explore label style for "Not found · 404", a one-line title at the standard title scale, the requested path in the sentence, Open Explore and Back to the opening. Checked at 1440, 375 and 320, no overflow. `netlify.toml` keeps the shell-with-200 redirect only for the three app routes and copies `dist/index.html` to `dist/404.html` at build, so Netlify answers a real 404 for anything else, the model URL included. Confirmed on the domain after the deploy of `c241792`: `/nothing`, `/coins/x` and `/models/macintosh-512k.glb` answer 404 with the 1.45 kB shell, `/about` and `/explore` answer 200.
- The CRT's coin has an action: the caption ends in "$TICKER in the collection", a link to the coin's card (`li` ids `coin-<token>`, `tabIndex -1`). The click switches to Pons coins, clears the search and the Made-by-you filter with `flushSync`, focuses the card and scrolls it to the centre (instant under reduced motion). Checked from the Plum tab in Chrome; the smooth scroll itself could not be watched because Chrome reported the tab hidden and does not animate scrolls there, the instant path moved the page.
- Coverage wording. The hero status reads "50 recent migrations on Pons" and the collection note "The 50 most recent migrations on Pons · Robinhood Chain" (the market API's bonded view, limit 100, newest first); the no-match state already says how many coins were searched.
- Desk progress labels: at 390 the three labels sit on one line; at 320 they wrap to two rows without overflow. No change.

Not verified live: the stale label (needs a blocked or failing refresh) and the sign-in round trip with a wallet.

Third pass, September 8, approved in Chrome:

- Placeholders out: About's "[Name] and [Name] · Plum, [City]" signature line is gone (`AboutPage.tsx`, `about.css`), and the shared footer note is "Not affiliated with Pons or Robinhood." alone (`PaperChrome.tsx`).
- Pair assets on the desk. pons's docs say a pair-token launch is the same single `launchToken` call with the fee as `msg.value` and no balance or approval of the pair asset needed by the creator; only the economics pin differs. The factory publishes no list, so `chain/client.ts` folds every `PairTokenApprovalUpdated` since deployment (58 events, one Alchemy request), names each survivor by ERC-20 `symbol`/`name` and prices it by `pairTokenEconomics`, cached ten minutes. `intents.create` accepts `pairToken`, refuses one the factory does not approve, pins `previewLaunchEconomics(config, pair)` at the settings block, and records the pair's threshold and phantom quote in the terms. `GET /api/launch-config` lists ETH then the 56 approved assets (USDG, cbBTC, TAO, 53 Robinhood stock tokens on September 8). The desk's "Paired with" is `PairPicker.tsx`: a button with the asset's mark and ticker opening a searchable list of the same (ETH, Crypto and dollars, Robinhood stock tokens), keyboard-operable; the terms panel shows "Priced in" with the mark and "Graduates at" in the pair asset. Marks are pons's own SVGs copied into `frontend/public/pairs/` (provenance in `ASSETS.md`) after Robinhood's CDN and Mobula both served one placeholder for every stock token. Backend and frontend suites at 31 each, typecheck, lint and build clean. Not verified: signing a pair-token launch with a real wallet.
- Section 4 leftovers dropped by the user as not worth the time (Macintosh PNG re-encode, social preview image with `og:url` and canonical, per-page font preloads and WOFF2). Measured that session in case it is revisited: WebP at quality 90 with lossless alpha takes the PNG from 1.77 MB to 129 KB; WOFF2 takes the five fonts from 237 KB to 107 KB.

Fourth pass, September 8, shown in Chrome, awaiting the user's go-ahead:

- Pair deploy confirmed on the domain: `GET https://pluminfra.xyz/api/launch-config` lists 57 `pairTokens`, the desk's picker opens with every mark loaded (59 `/pairs/*.svg` images, none broken), no console errors.
- The creator rate on every card. `GET /api/pons/coins` carries `creatorTaxBps`: from the registry row for a Plum coin, otherwise one `getLaunchedToken` read per coin kept in memory for the process (the rate is fixed at launch), `null` while a read fails. The card shows "Creator fee 2%" with the figure in ink, or "No creator fee"; nothing when the rate is unknown. Live rates on September 8 ran from 0 to 10%.
- The card's market row wraps instead of clipping: at 390 a four-digit 24 h change used to run past the card edge ("+5180.9% 2"); the change now drops to its own line under the market cap.
- Hero copy: "Explore the newest migrations on Pons, or start a coin of your own through Plum."
- `--ink-3` darkened one step, `#676a5b` to `#5a5d50`: 5.5:1 on the page paper, 5.9:1 on the card paper, 5.0:1 on the darker paper (was 4.5, 4.9 and 4.1). Tickers, MC labels, card meta rows and field placeholders all use it.
- Backend and frontend suites at 31 each, typecheck, lint and build clean.

### Next session

1. `git pull --ff-only origin main`, `git status`; the tree should be clean apart from scratch images.
2. If the fourth pass was approved and pushed, confirm on the domain that `GET https://pluminfra.xyz/api/pons/coins` items carry `creatorTaxBps` and the cards show the fee line.
3. If a wallet is available: one pair-token launch (fee 0.0005 ETH plus gas) to prove the encoding and the receipt path with a non-zero `pairToken`.
4. Section 5 polish as the user directs; then section 1 with the user.

## 1. Decisions before any work

1. **Is there a Plum token?** About says "No token of our own, nothing to sell you" ([AboutPage.tsx:42](../frontend/src/about/AboutPage.tsx)). Astra's brief asks where the Plum token fits; the Grok transcript mentions an altar coin. If a token is planned, that line is false and the second screen has its subject. If not, the "prospective holder" framing has no object and the visitor after Enter has nothing to do but read About.
2. **Are the fee cuts real?** About promises a 3% creator-tax cap against Pons's 10%, transfer tax halved, protocol fee cut 35%. The live launch config returns the factory's own terms (`maxCreatorTaxBps` 1000, curve fee 1%, launch fee 0.0005 ETH), the desk takes its cap from the factory ([LaunchForm.tsx:77](../frontend/src/launch/LaunchForm.tsx)), and no code in `backend/src` reduces any fee. Either the routing exists before launch or About retracts the figures. Do not copy the fee line onto Explore or the desk until this is settled; that spreads the claim.
3. **Who walks through Enter?** Grok's second screen serves a creator (the desk). Astra's serves a follower or holder (an introduction). This assistant's serves someone who wants the landing's world to continue (stay inside the Macintosh's screen). Three reviewers, three visitors. Pick one and every layout question below resolves.

## 2. Blockers (P0, all verified)

| Item | Where | Status |
|---|---|---|
| Fee claims contradict the product; desk accepted 9% and printed "Total trade fee 10.00%" | About fee section; [LaunchForm.tsx:77](../frontend/src/launch/LaunchForm.tsx), [routes.ts:78](../backend/src/routes.ts) | Verified |
| `[Name] and [Name] · Plum, [City]` live on About | [AboutPage.tsx:68](../frontend/src/about/AboutPage.tsx) | **Fixed, uncommitted**: the signature line is gone |
| Purchased Macintosh model publicly downloadable, 4.6 MB, unused by the live scene | `frontend/public/models/macintosh-512k.glb`, served at `/models/` | **Fixed, deployed**: the build deletes `dist/models`; the URL answers the SPA shell. A real 404 follows the not-found deploy |
| "Prototype edition" in the shared footer beside a form that creates real paid tokens | PaperChrome footer | **Fixed, uncommitted**: the footer note is the affiliation line alone |

## 3. Product and trust (P1)

| Item | Where | Status |
|---|---|---|
| Draft lost on sign-in: Connect closes the desk before opening the wallet, fields are component state | [LaunchForm.tsx](../frontend/src/launch/LaunchForm.tsx) | **Fixed, deployed** (sessionStorage draft) |
| Failed refresh keeps old Pons cards with no stale label; "Showing the last good read" keys on the server's `status`, not a client transport failure | [LaunchPage.tsx](../frontend/src/launch/LaunchPage.tsx) | **Fixed, deployed**; not yet reproduced live |
| Success notice says "It is now in the collection" but the collection lists migrated coins only | [LaunchPage.tsx](../frontend/src/launch/LaunchPage.tsx) | **Fixed, deployed** (notice visible and accurate) |
| "50 migrated on Pons · 0 migrated through Plum" is the first number on Explore | [LaunchPage.tsx:79](../frontend/src/launch/LaunchPage.tsx) | Reworded, uncommitted: "50 recent migrations on Pons"; the Plum count stays |
| Hero says "what is launching on Pons"; list is graduates only | Explore hero copy | **Fixed, uncommitted**: "Explore the newest migrations on Pons" |
| About offers stock pairs; desk and API are ETH only | [AboutPage.tsx:42](../frontend/src/about/AboutPage.tsx), [routes.ts:78](../backend/src/routes.ts) | **Fixed, uncommitted**: the desk offers every pair the factory approves (56 on September 8: USDG, cbBTC, TAO and Robinhood stock tokens), terms and graduation shown in the pair asset; not yet signed with a wallet |
| Creator rate not shown on any card despite "The rate sits on the coin where you can read it" | TokenGrid | **Fixed, uncommitted**: "Creator fee 2%" or "No creator fee" on every card, from the registry or the factory |
| Invalid website or fee only sets `aria-invalid`; no message, CTA gated silently | [LaunchForm.tsx](../frontend/src/launch/LaunchForm.tsx) | **Fixed, deployed** |
| Eligibility message reads as invite-only; it is the factory's own `canLaunch` | [LaunchForm.tsx](../frontend/src/launch/LaunchForm.tsx) | **Fixed, deployed** |
| Cards: percentage has no "24h" label; age has no definition; Pons and Plum ages may use different events | [TokenGrid.tsx](../frontend/src/launch/TokenGrid.tsx) | **Fixed, deployed**: 24h label; age titled per source (Pons since migration, Plum since launch; the registry has no graduation time) |
| Feed is a bounded snapshot (about 50 to 60 items) with search over loaded items; no coverage label, so an empty search proves nothing | [LaunchPage.tsx:45](../frontend/src/launch/LaunchPage.tsx), `backend/src/pons.ts` | **Fixed, uncommitted**: collection note names the count as the most recent migrations; the no-match state says how many were searched |
| No detail view; every card exits to Blockscout or DexScreener; CRT's featured coin has no action | Explore | CRT action **fixed, uncommitted** (caption links to the coin's card); no detail view remains a section-1 question |
| First card about 855 px down on desktop, about 1,135 px on mobile | Explore | Source-supported by Astra; consistent with screenshots |
| "Chart" links 27 × 17 px and addresses 70 × 17 px; card itself is not a link | TokenGrid | **Fixed, deployed**: 33 px hit area, coin-specific names |
| 12 px tickers, addresses and ages hard to scan through the grain | `launch.css` | **Fixed, uncommitted**: `--ink-3` darkened to `#5a5d50`, at least 5:1 on every paper |

## 4. Weight and infrastructure (P2, all verified)

| Item | Measurement | Fix |
|---|---|---|
| Wallet stack ships on the opening | 60 JS files, 2.6 MB decoded, 0.8 MB transferred; Reown modal, Coinbase SDK, swap and onramp controllers; localStorage written before any intent | **Fixed, deployed**: `pages.ts` lazy-loads Explore and About |
| All four videos fetched at once | 2.2 MB | **Fixed, uncommitted**: first channel only; each next one once the current plays |
| Macintosh PNG | 1.77 MB | Dropped by the user, September 8 |
| Hashed assets not cached | `cache-control: public, max-age=0, must-revalidate` on `/assets/*`, fonts, images, videos | **Fixed, deployed**: `/assets/*` immutable for a year |
| Every path returns 200 with the SPA, including `/robots.txt` and `/sitemap.xml`; app has no not-found state | curl | `robots.txt` and `sitemap.xml` deployed; not-found page and real 404 status **fixed, uncommitted** |
| No social preview image; no `og:url` or canonical | `frontend/index.html` | Dropped by the user, September 8 |
| No CSP, frame-ancestors or `X-Content-Type-Options` on the frontend (HSTS only); the site frames trivially | curl | **Fixed, deployed** (`netlify.toml`) |
| Preload warnings for both fonts and the loading mark; fonts are TTF | Chrome console | Dropped by the user, September 8 |

## 5. Polish (P3)

- Nav label "The opening" means nothing to a first visitor.
- The h1's accessible name runs the two lines together. **Fixed, deployed.**
- Explore CTA row repeats the header.
- Desk progress labels wrap awkwardly on mobile (Astra). Checked: one line at 390, two rows at 320, no overflow.
- Domain undercuts the door; no X or Telegram in the chrome (Grok). Morning work, not launch work.
- Case lighting still reads fixed against the screen's light (Astra, and the brief's own unresolved feedback). Visual refinement, not a product priority.

## 6. Checked and dismissed

- **"Factory closed."** The live config reads `launchEnabled: true`. The string at [LaunchForm.tsx:156](../frontend/src/launch/LaunchForm.tsx) renders only when the factory pauses launches.
- **"Eligibility gate feels invite-only."** It is Pons's `canLaunch` for the wallet, not a Plum allowlist. Reword; not a blocker.
- **"Same-breath launch and buy is fake."** About lists it under Then, the desk says "Initial buy: None", the API marks it `unavailable`. Not claimed as Now.
- **"Ship tonight, midday killzone."** Pace pressure from a model reading Crypto Twitter. Ignore.

## 7. Unverified, needs a connected wallet

- Draft loss through the actual sign-in transition (source says yes).
- Rejection, network switching, actual fees charged, receipt reconciliation, post-launch behaviour.
- The desk at 390 px end to end.
- Whether a fresh launch has any destination on the site before migration.

## 8. What held up

No console errors on any page. Native `dialog` with focus on Name, Escape returns focus. Skip link, keyboard focus, TV label state, reduced-motion state, initial-load failure and retry, search, sorting, collection switching and the empty Plum state all worked. HSTS set; API has proper headers; Render closed behind the signed proxy. Mobile layouts for all three pages are clean.

## 9. Suggested session order

Steps 2 to 5 of the original order (blockers, draft and notices, card labels and validation, route splitting and headers) are done except the fee copy, which waits on section 1. What remains, in order: the section 3 items above that need no decision, section 5 polish, then section 1 with the user and only then the second screen.

Everything through `88ddf8a` is pushed and deployed; the third pass follows it.

## How each was measured

Desktop and mobile through the Claude in Chrome extension; mobile via a local page framing the site at 390 × 844 because the extension's resize does not change the viewport. Headers by `curl -D -`. Bundle figures from `performance.getEntriesByType('resource')`. Fee behaviour by typing 9 into the desk's creator-fee field and reading the live-terms panel. Live config from `https://pluminfra.xyz/api/launch-config`.
