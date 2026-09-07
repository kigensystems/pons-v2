# Project brief

Updated September 7, 2026.

## Current direction

Build only the opening scene for a separate companion to the Pons launchpad. Product name and features remain undecided. Logo, extra sections, scroll transitions, API integration, and deployment are deferred.

Use an accurate compact Macintosh. The user prefers the original image presentation with a working TV. Keep that direction unless the user changes it. Shader informs atmosphere, lighting, material treatment, composition, and luminous typography; retain our Macintosh and identity.

Latest direction: a slightly darker, less defined landscape, with the Macintosh sharing the room's lighting. Subdue the casing and fog, preserve surface contact, and favor localized CRT light and small reflections over a broad color wash.

Read [VISUAL-TARGET.md](VISUAL-TARGET.md) for current screenshots and acceptance criteria.

## What exists

- React + TypeScript + Vite in `frontend/`.
- Original `macintosh-render.png` with a 640 × 480 canvas TV, four video channels, brief static transitions, Play/Pause, and opt-in sound.
- SVG screen alignment, bloom, color spill, and contact/cast shadows. Filled shadow footprints now sit behind the transparent artwork; foreground haze is behind the assembly to preserve contact edges. These are image composites, not physical lighting.
- TV updates are capped at 30fps. Reduced motion starts paused; hidden tabs stop playback work. Fog is static.
- The loader completes when the artwork loads. Image failure exposes reload; exhausted video failures show NO SIGNAL.
- The purchased Macintosh model, Blender sources, and earlier Three.js implementation remain preserved. The active view does not load that renderer or offer its camera controls.

## Unresolved feedback

The user finds the added light/reflections barely noticeable and the shadows fake. The computer still needs convincing surface contact and better integration with the dreamy environment. Technical validation and past completion messages are not aesthetic approval.

The September 7 contact revision removed the detached keyboard-side shadow strip and placed overlapping, filled footprints beneath the objects. The following atmosphere pass darkens the floor and casing, reduces the purple baked tint, and adds CRT edge falloff, a soft glass reflection, inner-bezel light, and a smaller rear-keyboard spill. Desktop and mobile comparisons are in the visual target. This is an inspected iteration awaiting user assessment, not aesthetic approval.

Prioritize one visible discrepancy, make a small change, inspect it against Shader, and show the difference. Use the existing Pause TV control for comparisons. The proposed timestamp-lock preview was declined as overcomplicated; no code was added. A Blender pre-render was suggested but has not been selected.

## References and preservation

- [Asset provenance](../frontend/public/ASSETS.md)
- [Validation evidence](SCENE-VALIDATION.md)
- [Historical brief](SCENE-HISTORY.md) — superseded decisions; consult only when needed.
- [Other-PC setup](OTHER-PC-SETUP.md)

Preserve original research and desktop assets. Keep purchased sources private; Netlify is the eventual host, with public distribution deferred. Commands and preview instructions are in [AGENTS.md](../AGENTS.md).
