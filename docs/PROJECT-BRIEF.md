# Project brief

Updated September 7, 2026.

## Current direction

The product is called **Plum**, an independent companion to the Pons launchpad. On September 7 the user expanded scope to an Explore prototype and an About page alongside the opening. Keep the established identity: Apple Garamond for titles, body, and tracked-capital labels, ChicagoFLF for on-screen controls, warm ivory, dark green atmosphere, and the compact Macintosh. Tokens, palette, motion budget, and the list of removed decoration are in [DESIGN.md](../DESIGN.md). Shader's About section is a reference for treatment, not a template to copy. The logo is settled (see below); API integration and deployment remain deferred.

Explore is at `/explore` (with `/launch` retained as an alias); About is at `/about`. All token data and fees are illustrative. Keep the six-column desktop and two-column mobile grid. See [Explore and About](LAUNCH-DESK.md) for implementation, settled decisions, and validation. The generated coin artwork was rejected and is not included; further image generation is paused.

About was rewritten on September 7 into a plain-words brief: Plum is a second window on Pons launches, on top of Pons and not instead of it, anonymous, with the Pons complaints research folded into three rules and a short list of what is being built. Its hero keeps a quiet subset of Shader's post-processing in 2D canvas (diffusion, warm bloom, fine grain, vignette) while the copy stays HTML; scanlines, channel split, and lens warp were tried and removed. [Shader About study](SHADER-ABOUT-STUDY.md) records the chain, the values, and what was kept. The user is supplying a better hero image.

The opening is a single non-scrolling scene. An Enter link in the intro navigates to Explore; the scroll-driven zoom was removed on September 7 ([Opening to Explore](SCROLL-TRANSITION.md)).

Use an accurate compact Macintosh. The user prefers the original image presentation with a working TV. Keep that direction unless the user changes it. Shader informs atmosphere, lighting, material treatment, composition, and luminous typography; retain our Macintosh and identity.

Latest opening-scene direction: a slightly darker, less defined landscape, with the Macintosh sharing the room's lighting. Subdue the casing and fog, preserve surface contact, and favor localized CRT light and small reflections over a broad color wash.

Read [VISUAL-TARGET.md](VISUAL-TARGET.md) for current screenshots and acceptance criteria. The requested Apple Garamond update and matching comparisons are in [Typography](TYPOGRAPHY.md).

## Handoff, September 7 evening

Two passes landed on `main` after the user reviewed them in Chrome. The cut pass removed arrows, numbering, placeholder stat cards, decorative captions, and all slogans except the headline pair and the About close. The type pass replaced Georgia, Instrument Serif, and VT323 with Apple Garamond (titles, body, labels) and ChicagoFLF (controls); the user chose tracked Garamond capitals for labels from a six-option comparison. The user's logo, a plum in Apple rainbow bands, is now the mark on every page: `frontend/public/images/plum-mark.png` (256 px, cut from the user's `assets/reference/plum-mark-source.png`; the earlier `plum_retro_exact_02.svg` is a raster in an SVG wrapper, not a vector). The lockup is one wordmark everywhere, after Shader's: mark at cap height beside bold italic Garamond "Plum", 44px on the opening with a phosphor halo, 40px on Explore and About multiplied onto the paper, 32px on mobile. The Explore banner is eight stacked bands in the logo's hues, multiplied onto the paper. The loader is a Shader-style boot screen: the bone-coloured mark (`images/loading-mark.png`, cut from `assets/reference/loading-mark-source.png`) beside a large bold italic "Plum", then "Plum, Website / Version 1.0", the bar, and a copyright line, all on the indigo CRT. The user's three-person photo (`assets/reference/loading-banner-source.png`) was tried in the loader and dropped; it is unused and could serve the About hero.

The TV sound work landed on September 7 evening after review in Chrome: the footer buttons are gone, the glass is the switch, a corner speaker glyph marks the state, and a Chicago cursor label names the action. Two earlier attempts, a subtitle-style caption and a System 1 dialog box, were rejected for covering the footage. The same commit set the site title to "Plum", added Open Graph and Twitter tags, and adopted the user's favicon (`frontend/public/favicon.ico`).

Later on September 7 the Explore hero's Macintosh was replaced by a CRT close-up (`frontend/public/images/crt-close.jpg`, cut from the user's `explore-monitor.png`) whose glass shows the newest coin's logo or initials as emitted light, with NO SIGNAL whenever there is no coin to show. Built on the `claude/explore-monitor-crt-replace-c80916` worktree branch and checked at 1440 × 900 and 390 × 844 with mocked registry data; committed on that branch after the user's review in this session. The figure now also shows on mobile because it is live data; cut it there if it pushes the collection too far down.

Open decisions, in order: darken `--ink-3` one step for 12px labels; then the opening-scene lighting feedback below.

## Opening polish, September 7 night

Four passes on the `claude/landing-page-polish-598bf7` worktree branch, each shown in Chrome at desktop and 390px (through a scratch iframe page, since the extension's resize does not change the viewport): the phosphor glow turned up to one em-scaled token (`--phosphor-fill #f7efe0`, halo `.2em`/`.8em`, fringe unchanged) shared by the h1, wordmark, nav link and Enter cue; the frame cut from nine elements to six (the "A companion to Pons" kicker, "The opening" label and the duplicate Explore nav link removed, so Enter is the only way in); the CRT exposure raised to clip its top fifth to white with stronger halation, so the screen is the brightest object; and the headline pattern settled as one roman voice, with the italic pair kept on the opening only and Explore and About headings set roman (Explore on one line, About broken at the sentence because one line widowed). Channel content itself was not changed; the poster is still channel 04's talking head, and a brighter clip or poster would do more than any further grading. Two more rounds on the user's notes removed the description line and then the About us link (four things in frame: wordmark, headline pair, Enter, Macintosh), rebuilt Enter as an ivory keycap with a drawn return arrow that presses on hover, and redrew the corner glyph as the set's own on-screen display. The first glyph attempt, saturated green pixel blocks with a black drop shadow, was judged worse; the kept version is pale phosphor light: blurred blocks added to the picture with misconvergence and bloom over a soft dimming of the footage, tucked 17px from the top and 22px from the right. The Enter label went through a six-option comparison and a Chicago trial; the user rejected Chicago outright ("Garamond is way better") and Garamond roman 28px stayed. Chicago remains only on the TV cursor label, NO SIGNAL and the boot screen.

## What exists

- React + TypeScript + Vite in `frontend/`.
- Explore and About use scoped styles, the shared type tokens in `index.css`, and static grain. About keeps the existing Macintosh artwork; Explore's hero is the CRT close-up showing the newest coin. The opening's naming and navigation now connect all three pages. Its TV, lighting, and renderer are unchanged by this page work.
- Original `macintosh-render.png` with a 640 × 480 canvas TV, four video channels in the user's priority order (04, 02, 03, 01, looping; the poster is 04's opening frame), brief static transitions, muted autoplay, and opt-in sound. The glass is the only control: a click unmutes, mutes, or (under reduced motion) plays with sound. The picture carries one mark, the set's on-screen display drawn into the canvas as phosphor-green pixel blocks (a speaker crossed while muted, with waves for two seconds when the sound comes on, a play triangle while paused), and a Chicago cursor label follows the pointer over the glass. The footer buttons were removed on September 7.
- SVG screen alignment, bloom, color spill, and contact/cast shadows. Filled shadow footprints now sit behind the transparent artwork; foreground haze is behind the assembly to preserve contact edges. These are image composites, not physical lighting.
- TV updates are capped at 30fps. Reduced motion starts paused; hidden tabs stop playback work. Fog is static.
- The loader completes when the artwork loads, but stays up at least 1.8 s on the first visit of a tab session (skipped for reduced motion and on later visits via a sessionStorage flag). Image failure exposes reload; exhausted video failures show NO SIGNAL.
- The purchased Macintosh model, Blender sources, and earlier Three.js implementation remain preserved. The active view does not load that renderer or offer its camera controls.

## Unresolved feedback

The user finds the added light and reflections barely noticeable and the shadows fake. The computer still needs convincing surface contact and better integration with the dreamy environment. Every pass since is recorded with screenshots and the user's verdict in [VISUAL-TARGET.md](VISUAL-TARGET.md); none is approved. Current technique: alpha-masked directional shade across the casing, darker foreground and fog, brighter exposure curve, small highlight diffusion inside the glass clip, keyboard spill masked by the artwork's luminance.

Prioritize one visible discrepancy, make a small change, inspect it against Shader, and show the difference. A timestamp-lock preview was declined as overcomplicated. A Blender pre-render was suggested but not selected.

## References and preservation

- [Asset provenance](../frontend/public/ASSETS.md)
- [Validation evidence](SCENE-VALIDATION.md)
- [Historical brief](SCENE-HISTORY.md) — superseded decisions; consult only when needed.
- [Other-PC setup](OTHER-PC-SETUP.md)

Preserve original research and desktop assets. Keep purchased sources private; Netlify is the eventual host, with public distribution deferred. Commands and preview instructions are in [AGENTS.md](../AGENTS.md).
