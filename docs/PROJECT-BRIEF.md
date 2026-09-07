# Project brief

Updated September 7, 2026.

## Current direction

The product is called **Plum**, an independent companion to the Pons launchpad. On September 7 the user expanded scope to an Explore prototype and an About page alongside the opening. Keep the established identity: Apple Garamond page and section titles, Georgia body copy, Instrument Serif editorial details, VT323 terminal labels, warm ivory, dark green atmosphere, and the compact Macintosh. Shader's About section is a reference for treatment, not a template to copy. Logo exploration, API integration, and deployment remain deferred.

Explore is at `/explore` (with `/launch` retained as an alias); About is at `/about`. All token data and fees are illustrative. Keep the six-column desktop and two-column mobile grid. See [Explore and About](LAUNCH-DESK.md) for implementation, settled decisions, and validation. The generated coin artwork was rejected and is not included; further image generation is paused.

About was rewritten on September 7 into a plain-words brief: Plum is a second window on Pons launches, on top of Pons and not instead of it, anonymous, with the Pons complaints research folded into three rules and a short list of what is being built. Its hero keeps a quiet subset of Shader's post-processing in 2D canvas (diffusion, warm bloom, fine grain, vignette) while the copy stays HTML; scanlines, channel split, and lens warp were tried and removed. [Shader About study](SHADER-ABOUT-STUDY.md) records the chain, the values, and what was kept. The user is supplying a better hero image.

Scrolling from the opening now zooms through the Macintosh glass into Explore, reversing on upward scroll. Direct page links remain available. Deliberate scrolling always drives the zoom; reduced motion still pauses TV autoplay. See [Opening to Explore](SCROLL-TRANSITION.md) for behavior and desktop/mobile evidence.

Use an accurate compact Macintosh. The user prefers the original image presentation with a working TV. Keep that direction unless the user changes it. Shader informs atmosphere, lighting, material treatment, composition, and luminous typography; retain our Macintosh and identity.

Latest opening-scene direction: a slightly darker, less defined landscape, with the Macintosh sharing the room's lighting. Subdue the casing and fog, preserve surface contact, and favor localized CRT light and small reflections over a broad color wash.

Read [VISUAL-TARGET.md](VISUAL-TARGET.md) for current screenshots and acceptance criteria. The requested Apple Garamond update and matching comparisons are in [Typography](TYPOGRAPHY.md).

## What exists

- React + TypeScript + Vite in `frontend/`.
- Explore and About use scoped styles, the existing fonts/artwork, and static grain. The opening's naming and navigation now connect all three pages. Its TV, lighting, and renderer are unchanged by this page work.
- Original `macintosh-render.png` with a 640 × 480 canvas TV, four video channels, brief static transitions, Play/Pause, and opt-in sound.
- SVG screen alignment, bloom, color spill, and contact/cast shadows. Filled shadow footprints now sit behind the transparent artwork; foreground haze is behind the assembly to preserve contact edges. These are image composites, not physical lighting.
- TV updates are capped at 30fps. Reduced motion starts paused; hidden tabs stop playback work. Fog is static.
- The loader completes when the artwork loads. Image failure exposes reload; exhausted video failures show NO SIGNAL.
- The purchased Macintosh model, Blender sources, and earlier Three.js implementation remain preserved. The active view does not load that renderer or offer its camera controls.

## Unresolved feedback

The user finds the added light/reflections barely noticeable and the shadows fake. The computer still needs convincing surface contact and better integration with the dreamy environment. Technical validation and past completion messages are not aesthetic approval.

The September 7 contact revision removed the detached keyboard-side shadow strip and placed overlapping, filled footprints beneath the objects. The following atmosphere pass added grading and localized CRT reflections, but the user rejected its impact: "It looks the exact same." The existing preview was verified to have that build; it was not a stale-build issue in the inspected tab.

The latest iteration changes technique: an alpha-masked directional shade crosses the casing into a dark right side while preserving the lit front. The foreground floor and fog fall into deeper darkness. The TV and its localized light remain above this shading. Desktop/mobile comparisons are in the visual target; the iteration awaits user assessment.

The subsequent CRT pass was rejected by the user: the edges and reflections looked low quality. Its painted edge strokes, broad casing wash, fake glass glint, and enlarged bloom copy are now removed. The latest revision retains the brighter exposure curve, adds small highlight diffusion directly to the full-resolution TV inside its glass clip, and masks keyboard spill with the source artwork's luminance so dark gaps/legends stay dark. This is still a 2D approximation awaiting assessment. The directional room treatment remains unchanged.

Prioritize one visible discrepancy, make a small change, inspect it against Shader, and show the difference. Use the existing Pause TV control for comparisons. The proposed timestamp-lock preview was declined as overcomplicated; no code was added. A Blender pre-render was suggested but has not been selected.

## References and preservation

- [Asset provenance](../frontend/public/ASSETS.md)
- [Validation evidence](SCENE-VALIDATION.md)
- [Historical brief](SCENE-HISTORY.md) — superseded decisions; consult only when needed.
- [Other-PC setup](OTHER-PC-SETUP.md)

Preserve original research and desktop assets. Keep purchased sources private; Netlify is the eventual host, with public distribution deferred. Commands and preview instructions are in [AGENTS.md](../AGENTS.md).
