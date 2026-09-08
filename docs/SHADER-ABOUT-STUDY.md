# Shader About section: treatment study

Studied September 7, 2026 at [shader.se/#about-us](https://www.shader.se/#about-us) in Chrome at 1440 × 900 and 390 × 844, plus the shipped JavaScript. Reference only; Plum keeps its own identity. Values below are read from Shader's bundle, not estimated from screenshots.

## How the page is built

Everything on screen, including the running text, is one full-window WebGL canvas. The DOM copy exists only in visually hidden sections for accessibility. Scrolling moves a hidden scroll container and the renderer reads its progress. Because the whole frame passes through one post-processing chain, text, photos, and 3D scenes all share the same grain, bloom, and lens behaviour. That shared treatment is what makes it read as a monitor rather than a web page with a filter on it.

## The post-processing chain, in order

1. **Bloom**: 7-level blur of pixels above a luminance threshold, added back. Intensity is 1.5 × the section value plus a slow three-sine flicker (amplitude 0.03 × section value), so bright areas breathe slightly. A warm bias adds bloom × (1, 0.8, 0) × 0.1, so glow leans yellow.
2. **Motion blur** (desktop only): previous-frame accumulation, strength 1.3 × section value, framerate-compensated.
3. **Gamma**: colour raised to `pow` (1.25 to 1.9 depending on section), which deepens midtones.
4. **Sepia**: the classic 0.393/0.769/0.189 matrix, mixed by section value (0.17 to 0.81).
5. **Brightness, then contrast** around 0.5.
6. **Chromatic aberration**: vertical only. Offset = 0.001 × 2 × (distance from centre)² × strength, halved where UI text is present so type stays readable while edges fringe. Fades out in the outer 0.5% of the frame.
7. **Lens distortion**: barrel warp of the UI layer, 0.16 on most sections, with an optional dark border.
8. **Vignette**: `radius − length(uv − 0.5)` through `smoothstep(−s, s)`, mixed by intensity.
9. **Noise**: Gaussian (σ 0.7) of a per-pixel hash offset by time × velocity. Multiplied by (1 − colour), so grain lives in shadows and stays off the paper. Final scale 0.037 × section value × device pixel ratio, × 0.65 on mobile.

## Section values that matter for About

| Setting | Office reveal (dark, cubicles) | About body (paper, team photo) |
| --- | --- | --- |
| Noise intensity / velocity | 1.48 / 1 | 1 / 0.05 |
| Sepia | 0.81 | 0.40 |
| Bloom intensity / threshold / smoothing | 1.36 / 0.55 / 0.20 | 0.10 / 0.30 / 0.65 |
| Saturation | 0.56 | 1 |
| Motion blur | 0.5 | 0 |
| Gamma (`pow`) | 1.34 | 1.25 |
| Chromatic aberration | 2.5 | 0.8 |
| Lens distortion | 0.16 | 0.16 |
| Vignette radius / smoothness / intensity | 0.5 / 0.83 / 0.45 | 0.79 / 0.13 / 0 |

Reading: the dark reveal is loud (heavy grain, strong fringe, deep vignette, motion blur) and the reading section is nearly clean. Grain velocity drops to 0.05 so the paper texture is almost static while you read. Bloom stays on at 0.1 so photo highlights still lift. Transitions between sections interpolate every value over a scroll distance, so the "monitor" never snaps.

## Layout and type

- Section opens with a 3D office pass, then a full-width vintage team photo in a teal room, then a very large centred serif headline (STIX Two Text, about 120px at 1440), then three justified body columns with a cut-out photo of a team member leaning on a computer.
- A rainbow rule (six flat colour bands, Apple II palette) separates blocks.
- Client logos are set in a grid with cut-out photos pointing at them from both sides.
- Mobile stacks everything and keeps the same effects at 65% grain.

## What transfers to Plum, and what does not

Kept, after the user's review on September 7 ("grain, blur, dreamy retro vintage, nothing crazy"):

- Fine gaussian grain over the dark hero, screen-blended so it stays in the shadows, low amplitude, drifting at 24fps from one device-resolution tile. It fades out where the paper begins.
- A soft diffusion pass on the Macintosh and a warm bloom of its highlights that breathes on Shader's three-sine curve. The bloom layer overhangs the image so the halo is not cut flat.
- A light vignette. The existing headline glow stays.

Revised September 7 night, when About became a letter under the three-person photograph on paper: the diffusion pass, the bloom overhang and the headline glow went with the dark ground and the Macintosh. What remains, contained in the photograph, is the grain canvas, a bloom made in CSS (the same picture blurred, highlights kept, screened over, breathing on one slow keyframe rather than three sines) and the vignette.

Tried and removed at the user's request:

- Scanlines. The `.pad` scanline overlay is switched off on About.
- The vertical channel split on the Macintosh, drawn in strips, which read as CRT lines.
- The SVG displacement lens over the whole hero, with its rounded tube corners.
- Six cycling grain frames at 9fps, which strobed.

Does not transfer:

- WebGL rendering of the page text. Plum's About is HTML and should stay HTML. The effects above can be approximated with a canvas or SVG filter layer over the hero and CSS on the rest.
- STIX at 120px. The user finds Shader's type too large; Plum keeps Apple Garamond at the current scale.
- Team-photo staging and rainbow rules. Plum's material is the Macintosh and warm paper.
