# Review triage

Written September 2026 after four reviews of the live site at `https://pluminfra.xyz`: this assistant's own pass (desktop 1440 × 900 and mobile 390 × 844 in the user's Chrome, headers by curl, source by grep), a Grok 4.6 transcript that read Crypto Twitter, and two reports from Astra. Every item below carries a status:

- **Verified**: reproduced live or read in source this session, with the file and line.
- **Source-supported**: an external reviewer's claim that matches the code but was not reproduced live.
- **Unverified**: needs a connected wallet or a real launch.
- **Dismissed**: checked and found wrong or overstated.

Work the sections in order. Do not start the second-screen redesign until the decisions in section 1 are made.

## 0. State after the first triage session (uncommitted on `main`)

The user set section 1 aside and asked for bugs, UX and stability first. These landed in the working tree, build and lint clean, 30 tests passing, checked on the dev server in Chrome; **not committed, awaiting the user's review**:

- Creation desk keeps its draft (name, ticker, description, website, fee) in `sessionStorage` across close, the sign-in round trip and a reload; cleared once the launch is included. The image file cannot be kept. `frontend/src/launch/LaunchForm.tsx`.
- Ticker, website and creator-fee fields show a message under the field when invalid, linked by `aria-describedby`; `aria-invalid` only once the field has content.
- Eligibility message names the factory: "The Pons factory does not allow this wallet to launch right now."
- Explore keeps old cards on a failed refresh and says "Showing the last good read from HH:MM" (server read time for a stale feed, this browser's last good read for a lost request); the note is a `role="status"`. `frontend/src/launch/LaunchPage.tsx`.
- Launch notice is visible (a dismissible `pad-notice`) and accurate: the coin appears under Plum coins once it leaves its curve. Explore no longer switches to the empty Plum tab after a launch.
- Cards: "24h" beside the change; the age carries a title and screen-reader text ("Migrated 4m ago" / "Launched 4m ago" per source); address and Chart links have coin-specific names and a 33 px tall hit area with unchanged lettering; the no-match state says how many coins were searched.
- Routes split: `frontend/src/pages.ts` lazy-loads Explore and About, so the opening ships no wallet code (index.html preloads only the runtime and the stylesheet; the entry chunk fell from 413 kB to 214 kB).
- `netlify.toml`: hashed assets immutable for a year, fonts a week, images and videos a day; `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `nosniff`, referrer and permissions policies; the build command deletes `dist/models` so the licensed Macintosh model is not published. `robots.txt` and `sitemap.xml` added under `frontend/public/`.
- The opening h1's accessible name has its space.

Not verified live: the stale label (source and build only; needs a blocked or failing refresh), the desk at 390 px, and the sign-in round trip with a wallet.

### Next session

1. `git pull --ff-only origin main`, then `git status`; the changes above are in the tree. Start the two dev servers (`.claude/launch.json`), open `http://127.0.0.1:5173/explore` in Chrome, and show the user: the desk with an invalid website and fee (messages under the fields), a draft surviving Escape and reopen, a card's "24h" and age title, and the landing's network panel with no `wui-` or `w3m-` chunks. Get the go-ahead, then one commit and push. Netlify deploys on push; afterwards confirm with `curl -sI https://pluminfra.xyz/assets/<any>.js | grep -i cache-control` and `curl -sI https://pluminfra.xyz/models/macintosh-512k.glb` (expect 404).
2. Video channels on demand: `frontend/src/monitorPlayback.ts` creates all four `<video>` elements with `preload = 'auto'` (about 2.2 MB on the opening). Plan: `auto` for channel index 0 only, `none` for the rest; a `warm(index)` helper sets `auto` and calls `load()`; call it for the upcoming channel when the current one starts playing (in `startVideo`'s success branch) and again in `advance()` after `channel = next`, so a channel that fails early cannot cascade into the 8-second stall detector marking the next one failed. Run `npm --prefix frontend test` (playback tests) and watch two full channel changes with the network panel open before showing it.
3. Not-found page for unknown paths (`main.tsx` currently falls back to the opening). A short paper page on `PaperHeader`/`PaperFooter` with a link to Explore and the opening. New UI: show before committing.
4. Remaining P1 items in section 3 that are not section-1 decisions: the CRT's featured coin has no action; a coverage line for the bounded feed; desk progress labels at 390 px (CSS already lets them wrap; check the result).
5. Then section 1 with the user.

## 1. Decisions before any work

1. **Is there a Plum token?** About says "No token of our own, nothing to sell you" ([AboutPage.tsx:42](../frontend/src/about/AboutPage.tsx)). Astra's brief asks where the Plum token fits; the Grok transcript mentions an altar coin. If a token is planned, that line is false and the second screen has its subject. If not, the "prospective holder" framing has no object and the visitor after Enter has nothing to do but read About.
2. **Are the fee cuts real?** About promises a 3% creator-tax cap against Pons's 10%, transfer tax halved, protocol fee cut 35%. The live launch config returns the factory's own terms (`maxCreatorTaxBps` 1000, curve fee 1%, launch fee 0.0005 ETH), the desk takes its cap from the factory ([LaunchForm.tsx:77](../frontend/src/launch/LaunchForm.tsx)), and no code in `backend/src` reduces any fee. Either the routing exists before launch or About retracts the figures. Do not copy the fee line onto Explore or the desk until this is settled; that spreads the claim.
3. **Who walks through Enter?** Grok's second screen serves a creator (the desk). Astra's serves a follower or holder (an introduction). This assistant's serves someone who wants the landing's world to continue (stay inside the Macintosh's screen). Three reviewers, three visitors. Pick one and every layout question below resolves.

## 2. Blockers (P0, all verified)

| Item | Where | Status |
|---|---|---|
| Fee claims contradict the product; desk accepted 9% and printed "Total trade fee 10.00%" | About fee section; [LaunchForm.tsx:77](../frontend/src/launch/LaunchForm.tsx), [routes.ts:78](../backend/src/routes.ts) | Verified |
| `[Name] and [Name] · Plum, [City]` live on About | [AboutPage.tsx:68](../frontend/src/about/AboutPage.tsx) | Verified |
| Purchased Macintosh model publicly downloadable, 4.6 MB, unused by the live scene | `frontend/public/models/macintosh-512k.glb`, served at `/models/` | **Fixed, uncommitted**: build deletes `dist/models`; confirm 404 after deploy |
| "Prototype edition" in the shared footer beside a form that creates real paid tokens | PaperChrome footer | Verified |

## 3. Product and trust (P1)

| Item | Where | Status |
|---|---|---|
| Draft lost on sign-in: Connect closes the desk before opening the wallet, fields are component state | [LaunchForm.tsx](../frontend/src/launch/LaunchForm.tsx) | **Fixed, uncommitted** (sessionStorage draft) |
| Failed refresh keeps old Pons cards with no stale label; "Showing the last good read" keys on the server's `status`, not a client transport failure | [LaunchPage.tsx](../frontend/src/launch/LaunchPage.tsx) | **Fixed, uncommitted**; not yet reproduced live |
| Success notice says "It is now in the collection" but the collection lists migrated coins only | [LaunchPage.tsx](../frontend/src/launch/LaunchPage.tsx) | **Fixed, uncommitted** (notice visible and accurate) |
| "50 migrated on Pons · 0 migrated through Plum" is the first number on Explore | [LaunchPage.tsx:79](../frontend/src/launch/LaunchPage.tsx) | Verified |
| Hero says "what is launching on Pons"; list is graduates only | Explore hero copy | Verified |
| About offers stock pairs; desk and API are ETH only | [AboutPage.tsx:42](../frontend/src/about/AboutPage.tsx), [routes.ts:78](../backend/src/routes.ts) | Verified |
| Creator rate not shown on any card despite "The rate sits on the coin where you can read it" | TokenGrid | Verified |
| Invalid website or fee only sets `aria-invalid`; no message, CTA gated silently | [LaunchForm.tsx](../frontend/src/launch/LaunchForm.tsx) | **Fixed, uncommitted** |
| Eligibility message reads as invite-only; it is the factory's own `canLaunch` | [LaunchForm.tsx](../frontend/src/launch/LaunchForm.tsx) | **Fixed, uncommitted** |
| Cards: percentage has no "24h" label; age has no definition; Pons and Plum ages may use different events | [TokenGrid.tsx](../frontend/src/launch/TokenGrid.tsx) | **Fixed, uncommitted**: 24h label; age titled per source (Pons since migration, Plum since launch; the registry has no graduation time) |
| Feed is a bounded snapshot (about 50 to 60 items) with search over loaded items; no coverage label, so an empty search proves nothing | [LaunchPage.tsx:45](../frontend/src/launch/LaunchPage.tsx), `backend/src/pons.ts` | Verified |
| No detail view; every card exits to Blockscout or DexScreener; CRT's featured coin has no action | Explore | Verified |
| First card about 855 px down on desktop, about 1,135 px on mobile | Explore | Source-supported by Astra; consistent with screenshots |
| "Chart" links 27 × 17 px and addresses 70 × 17 px; card itself is not a link | TokenGrid | **Fixed, uncommitted**: 33 px hit area, coin-specific names |
| 12 px tickers, addresses and ages hard to scan through the grain | `launch.css` | Verified; already an open decision in the brief (darken `--ink-3`) |

## 4. Weight and infrastructure (P2, all verified)

| Item | Measurement | Fix |
|---|---|---|
| Wallet stack ships on the opening | 60 JS files, 2.6 MB decoded, 0.8 MB transferred; Reown modal, Coinbase SDK, swap and onramp controllers; localStorage written before any intent | **Fixed, uncommitted**: `pages.ts` lazy-loads Explore and About |
| All four videos fetched at once | 2.2 MB | Load channels on demand |
| Macintosh PNG | 1.77 MB | Re-encode |
| Hashed assets not cached | `cache-control: public, max-age=0, must-revalidate` on `/assets/*`, fonts, images, videos | **Fixed, uncommitted** in `netlify.toml`; confirm after deploy |
| Every path returns 200 with the SPA, including `/robots.txt` and `/sitemap.xml`; app has no not-found state | curl | `robots.txt` and `sitemap.xml` **added, uncommitted**; not-found page still to do |
| No social preview image; no `og:url` or canonical | `frontend/index.html` | Add |
| No CSP, frame-ancestors or `X-Content-Type-Options` on the frontend (HSTS only); the site frames trivially | curl | **Fixed, uncommitted** in `netlify.toml` |
| Preload warnings for both fonts and the loading mark; fonts are TTF | Chrome console | Scope preloads per page; WOFF2 |

## 5. Polish (P3)

- Nav label "The opening" means nothing to a first visitor.
- The h1's accessible name runs the two lines together. **Fixed, uncommitted.**
- Explore CTA row repeats the header.
- Desk progress labels wrap awkwardly on mobile (Astra).
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

1. Section 1 decisions, with the user.
2. Section 2 in one commit: fee copy fixed or retracted, placeholders removed, model out of `public/`, footer status decided.
3. Draft preservation across sign-in, stale label on client failure, success notice corrected. One commit.
4. Card labels (24h, age definition, coverage line), eligibility wording, visible validation messages.
5. Route splitting and Netlify headers.
6. Only then the second screen, per the decision in section 1.

Two local commits are unpushed at the user's request: `ad3178e` (desk balance line) and `11464a5` (docs). Push when told.

## How each was measured

Desktop and mobile through the Claude in Chrome extension; mobile via a local page framing the site at 390 × 844 because the extension's resize does not change the viewport. Headers by `curl -D -`. Bundle figures from `performance.getEntriesByType('resource')`. Fee behaviour by typing 9 into the desk's creator-fee field and reading the live-terms panel. Live config from `https://pluminfra.xyz/api/launch-config`.
