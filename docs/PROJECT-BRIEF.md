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

Two passes landed on `main` after the user reviewed them in Chrome. The cut pass removed arrows, numbering, placeholder stat cards, decorative captions, and all slogans except the headline pair and the About close. The type pass replaced Georgia, Instrument Serif, and VT323 with Apple Garamond (titles, body, labels) and ChicagoFLF (controls); the user chose tracked Garamond capitals for labels from a six-option comparison. The user's logo, a plum in Apple rainbow bands, is now the mark on every page: `frontend/public/images/plum-mark.png` (256 px, cut from the user's `assets/reference/plum-mark-source.png`; the earlier `plum_retro_exact_02.svg` is a raster in an SVG wrapper, not a vector). The lockup is one wordmark everywhere, after Shader's: mark at cap height beside bold italic Garamond "Plum", 44px on the opening with a phosphor halo, 40px on Explore and About multiplied onto the paper, 32px on mobile. The Explore banner is eight stacked bands in the logo's hues, multiplied onto the paper. The loader still shows "Plum" alone.

Open decisions, in order: the headline pattern (proposal: keep the two-line italic pair on the opening only, plain single-line headings elsewhere; see the About and Explore lines proposed in session); whether the loader's title takes the mark too; the loader's indigo palette versus a rainbow boot screen; darken `--ink-3` one step for 12px labels; then the opening-scene lighting feedback below.

## What exists

- React + TypeScript + Vite in `frontend/`.
- Explore and About use scoped styles, the shared type tokens in `index.css`, the existing artwork, and static grain. The opening's naming and navigation now connect all three pages. Its TV, lighting, and renderer are unchanged by this page work.
- Original `macintosh-render.png` with a 640 × 480 canvas TV, four video channels, brief static transitions, Play/Pause, and opt-in sound.
- SVG screen alignment, bloom, color spill, and contact/cast shadows. Filled shadow footprints now sit behind the transparent artwork; foreground haze is behind the assembly to preserve contact edges. These are image composites, not physical lighting.
- TV updates are capped at 30fps. Reduced motion starts paused; hidden tabs stop playback work. Fog is static.
- The loader completes when the artwork loads. Image failure exposes reload; exhausted video failures show NO SIGNAL.
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
