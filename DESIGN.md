# Plum design system

The written point of view. Read before any visual work; the `frontend-design` skill takes this as the brief. Direction and open feedback live in `docs/PROJECT-BRIEF.md`; acceptance criteria in `docs/VISUAL-TARGET.md`.

## Identity

Plum is a quiet second window on Pons launches. The world is a compact Macintosh on a desk at night: warm ivory plastic, a CRT that is the only light source, dark green room, paper documents. Everything is lit, printed, or typed. Nothing is a SaaS dashboard.

Signature element: the working Macintosh TV and the light it throws. Every page borrows from it (phosphor glow on titles, tracked Garamond labels, paper texture); no page competes with it.

Wordmark: the rainbow plum mark at cap height beside bold italic Garamond "Plum", the same lockup on every page (44px opening, 40px paper, 32px mobile). On the opening it glows; on paper it multiplies into the grain. The mark's colours appear elsewhere only as the Explore banner's printed bands.

## Palette

Opening (`index.css`): room `#10120f`, fog radial `#262d27 → #151c18 → #0b100d`, casing `#ead9ad` / `#ece2bb`, phosphor fill `--phosphor-fill #f7efe0`, glow token `--phosphor-glow` (blue-left, orange-right fringe, then a `.2em` and `.8em` warm halo). One treatment in em units: the h1, wordmark and Enter cue carry the same halo scaled to their size.

About (`about.css`): ground `#17221b`, deep `#060d09`, moss haze `#69705a` / `#263b2b`, copy `#eae6d4`, accent moss `#bbc4a6` / `#c2c9a0`, muted `#677457`.

Explore (`launch.css`): `--paper #eee8d9`, `--paper-2 #f6f0e3`, `--paper-3 #e5decd`, `--ink #2e342a`, `--ink-2 #575d50`, `--line #39433435`, `--up #416343`, `--down #945442`, `--plum #73596f`.

New colors derive from these. No pure white, no pure black, no purple gradients, no terracotta.

## Type

Two families, three roles. Tokens live in `index.css`.

- `--font-title` and `--font-body`: Apple Garamond. Titles 400 weight, tight tracking (`-.035em`), `clamp(42px, 4vw, 76px)`. One roman voice: the opening's two-line italic pair is the only italic heading; Explore and About headings are roman, one line where they fit. Body 16–18px / 1.6; Garamond's small x-height needs one to two px more than Georgia did.
- Labels (kickers, section labels, notes, tickers, card meta): Apple Garamond 12px, uppercase, `.14em` tracking. Print-style small caps, the way Apple set labels in the 1990s.
- `--font-ui`: ChicagoFLF, the Mac's 1984–1997 screen face. Only on the opening scene's TV cursor label and the loader. Mixed case, no tracking, 13–14px. The user dislikes it for anything they read (Enter in Chicago tried and rejected September 7; Explore's readout, badges, Back to top and status code moved to Garamond September 8). When small Garamond is the problem, set it bold, at least 12px, with tracking, and give phosphor text a soft halo rather than the chromatic fringe.
- Never Inter, Roboto, Space Grotesk, or system sans in visible UI. Instrument Serif and VT323 were retired September 7, 2026.

## Layout

- Viewports checked: 1440 × 900 and 390 × 844; 320px must not overflow.
- Opening: single non-scrolling scene with four things in frame: wordmark, headline pair, the Enter key, and the Macintosh. Enter is the only way out; there is no nav, kicker, description, or footer label. About is reached from Explore. The screen is the brightest object in the room: the CRT exposure clips its top fifth to white before halation. The TV plays muted on its own; the glass is its only control. The TV's own on-screen display in the CRT's top-right corner (a character-generator speaker, softened and added to the picture as pale phosphor light with misconverged fringes over a soft dimming of the footage, crossed while muted, with its waves for a moment when the sound comes on, a play triangle while paused) is the only mark on the picture, and a Chicago cursor label names the action while the pointer is over the glass. No page-level TV buttons.
- Explore: six-column card grid on desktop, two on mobile, paper surfaces, hairline `--line` rules, radius 3px or none. Only coins that have left their curve are listed, in two collections (Pons coins, Plum coins), sorted by newest or market cap.
- Explore's one emitted-light surface is the hero CRT close-up. Its glass shows the coin that most recently left its curve on Pons: the whole picture in the upper glass, never cropped, with a bold Garamond phosphor readout (`#f2e7d6`) of ticker and market cap in the band beneath, or the readout alone when there is no picture; never decoration; the bezel photograph multiplies onto the paper like everything else.
- About: full-bleed hero surface, then prose columns with a 1200px measure.

## Motion budget

Two moments per page at most. Allowed: the boot screen's 1.8 s hold on a session's first visit, the TV picture and its glow, static transitions between channels, the About hero's diffusion/bloom/grain/vignette. Refused: scroll-driven zooms (removed September 7), section fade-and-slide, card hover lifts, scanlines, channel split, lens warp, particles. `prefers-reduced-motion` pauses the TV and removes transitions. TV work is capped at 30fps and stops in hidden tabs.

## Copy

Plain words, user nouns, sentence case. Buttons name the action. Token data and fees are illustrative and say so. No "unlock", "elevate", or launch-industry hype.

Removed on September 7, 2026 and not to return: arrows on links and buttons (↓ and ↑ stay where they point at something), section and page numbering, issue numbers, placeholder stat cards, decorative captions and footers (including the opening's "A companion to Pons" kicker and "The opening" label), and every slogan except the headline pair "A familiar feeling. A new window." and the About close "See it clearly."

## Quality floor

Visible focus rings, keyboard-complete dialogs, AA contrast on paper and on the dark ground, no horizontal overflow, image and video failure states (reload, NO SIGNAL).

## Review

Before showing work, list violations of this file. Fix them before adding any new aesthetic idea. Then remove one thing.
