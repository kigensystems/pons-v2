# Plum design system

The written point of view. Read before any visual work; the `frontend-design` skill takes this as the brief. Direction and open feedback live in `docs/PROJECT-BRIEF.md`; acceptance criteria in `docs/VISUAL-TARGET.md`.

## Identity

Plum is a quiet second window on Pons launches. The world is a compact Macintosh on a desk at night: warm ivory plastic, a CRT that is the only light source, dark green room, paper documents. Everything is lit, printed, or typed. Nothing is a SaaS dashboard.

Signature element: the working Macintosh TV and the light it throws. Every page borrows from it (phosphor glow on titles, tracked Garamond labels, paper texture); no page competes with it.

Wordmark: the rainbow plum mark at cap height beside bold italic Garamond "Plum", the same lockup on every page (44px opening, 40px paper, 32px mobile). On the opening it glows; on paper it multiplies into the grain. The mark's colours appear elsewhere only as the Explore banner's printed bands.

## Palette

Opening (`index.css`): room `#10120f`, fog radial `#262d27 → #151c18 → #0b100d`, casing `#ead9ad` / `#ece2bb`, phosphor fill `--phosphor-fill #f7efe0`, glow token `--phosphor-glow` (blue-left, orange-right fringe, then a `.2em` and `.8em` warm halo). One treatment in em units: the h1, wordmark and Enter cue carry the same halo scaled to their size.

About (`about.css`): the Explore paper tokens. Its only colour of its own is muted moss `#677457` on the close's italic word. The dark green ground, moss haze and phosphor h1 left with the letter rewrite on September 7 night.

Explore (`launch.css`): `--paper #eee8d9`, `--paper-2 #f6f0e3`, `--paper-3 #e5decd`, `--ink #2e342a`, `--ink-2 #575d50`, `--line #39433435`, `--up #416343`, `--down #945442`, `--plum #73596f`.

New colors derive from these. No pure white, no pure black, no purple gradients, no terracotta.

## Type

Two families, three roles. Tokens live in `index.css`.

- `--font-title` and `--font-body`: Apple Garamond. Titles 400 weight, tight tracking (`-.035em`), `clamp(42px, 4vw, 76px)`. One roman voice: the opening's two-line italic pair is the only italic heading; Explore and About headings are roman, one line where they fit; the About close "See it clearly." carries the one italic word on paper, at the user's direction. Body 16–18px / 1.6, and 20–22px for About's standfirst, lede and paragraphs, with list bodies at 18; Garamond's small x-height needs one to two px more than Georgia did.
- Labels (kickers, section labels, notes, tickers, card meta): Apple Garamond 12px, uppercase, `.14em` tracking. Print-style small caps, the way Apple set labels in the 1990s.
- `--font-ui`: ChicagoFLF, the Mac's 1984–1997 screen face. Only on the opening scene's TV cursor label and the loader. Mixed case, no tracking, 13–14px. The user dislikes it for anything they read (Enter in Chicago tried and rejected September 7; Explore's readout, badges, Back to top and status code moved to Garamond September 8). When small Garamond is the problem, set it bold, at least 12px, with tracking, and give phosphor text a soft halo rather than the chromatic fringe.
- Never Inter, Roboto, Space Grotesk, or system sans in visible UI. Instrument Serif and VT323 were retired September 7, 2026.

## Layout

- Viewports checked: 1440 × 900 and 390 × 844; 320px must not overflow.
- Opening: single non-scrolling scene with four things in frame: wordmark, headline pair, the Enter key, and the Macintosh. Enter is the only way out; there is no nav, kicker, description, or footer label. About is reached from Explore. The screen is the brightest object in the room: the CRT exposure clips its top fifth to white before halation. The TV plays muted on its own; the glass is its only control. The TV's own on-screen display in the CRT's top-right corner (a character-generator speaker, softened and added to the picture as pale phosphor light with misconverged fringes over a soft dimming of the footage, crossed while muted, with its waves for a moment when the sound comes on, a play triangle while paused) is the only mark on the picture, and a Chicago cursor label names the action while the pointer is over the glass. No page-level TV buttons.
- Explore (since September 8, from the user's `handoff/2a-the-window.html`): the window after Enter. Above the fold is the opening's own room (its haze, mist, grain and vignette layers) with the Macintosh artwork, the glowing wordmark and an underlined "About us" beside it, the headline "A second window on Pons.", one paragraph ending "Same Pons. Better terms.", "Create a coin" as a keycap in the Macintosh's plastic, and a single ↓ at the foot of the window. No paper header, no kicker, no status line. The wallet sits at the masthead's right in the same phosphor as About us: "Connect wallet"; connected but unsigned → the short address, Disconnect and Sign in; signed in → the short address and Sign out. On phones it wraps to its own row under the wordmark. The desk's form foot also carries "Switch wallet · 0x…" while signed in. Below, on paper after the stripe rule: "The collection.", the two sort chips (and "Made by you" when signed in), then the six-column grid, two on mobile. One collection: every coin that has left its curve on Pons, Plum's own badged "Plum". No search, no tabs, no note line; a stale-read notice appears only when a refresh fails. Card art tints cycle paper, moss and plum. On the phone the copy comes first, then a close crop of the Macintosh with the glass filling the width.
- Explore's one emitted-light surface is the Macintosh's glass, drawn the way the opening draws its TV (`ExploreMonitor.tsx`, geometry in `screenGeometry.ts`): clipped to the glass traced in the artwork's coordinates, extended to the bezel's lip on the right and below, lifted and haloed by the opening's exposure filter, the casing shaded into the room, light spilling onto the bezel recess and the keys. It shows the fees channel: "Less to launch / vs Pons", the creator fee capped at 3%, transfer fee −50%, protocol fee −35% (the stack About prints), then the creation fee and block number read live from the factory, with Live or Paused. Warming up and No signal are its other states. The CRT close-up photograph is no longer used.
- About: the three-person photograph full bleed under the header, multiplied onto the paper, then short sections in the 1200px measure built to scan: the title at headline scale (`clamp(54px, 7.4vw, 108px)`) and standfirst, the Explore stripe rule once, the three fees as headings over large figures (the Pons value struck in `--down` where there is one), two short paragraphs, the rules in three columns, the desk in four (Now / Next / Then / Later), the close, a one-line signature, small print. No kickers, no dividers, no callout boxes, no dark ground, no second Macintosh.

## Motion budget

Two moments per page at most. Allowed: the boot screen's 1.8 s hold on a session's first visit, the TV picture and its glow, static transitions between channels, the About photograph's breathing bloom, grain and vignette. Refused: scroll-driven zooms (removed September 7), section fade-and-slide, card hover lifts, scanlines, channel split, lens warp, particles. `prefers-reduced-motion` pauses the TV and removes transitions. TV work is capped at 30fps and stops in hidden tabs.

## Copy

Plain words, user nouns, sentence case. Buttons name the action. Token data and fees are illustrative and say so. No "unlock", "elevate", or launch-industry hype.

Removed on September 7, 2026 and not to return: arrows on links and buttons (↓ and ↑ stay where they point at something), section and page numbering, issue numbers, placeholder stat cards, decorative captions and footers (including the opening's "A companion to Pons" kicker and "The opening" label), and every slogan except the headline pair "A familiar feeling. A new window.", Explore's closing tag "Same Pons. Better terms." and the About close "See it clearly."

## Quality floor

Visible focus rings, keyboard-complete dialogs, AA contrast on paper and on the dark ground, no horizontal overflow, image and video failure states (reload, NO SIGNAL).

## Review

Before showing work, list violations of this file. Fix them before adding any new aesthetic idea. Then remove one thing.
