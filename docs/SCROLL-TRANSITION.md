# Opening to Explore

September 7, 2026. Implemented from the user's request to scroll through the screen as on [live Shader](https://www.shader.se/). Visual inspection is implementation evidence, not user design approval.

The opening zooms uniformly toward the Macintosh glass over 1.35 viewport heights of native scrolling. Opening copy fades first; the actual Explore page appears through a curved mask registered to the existing TV glass. Once the glass covers the viewport, Explore continues in normal document flow. Scrolling up reverses the transition and keeps Explore's in-memory state. This uses the existing flat artwork, not a new 3D camera.

At arrival the URL becomes `/explore` without reloading or adding history entries. Reversing restores `/`. Reloading or visiting `/explore` directly opens the standalone page. `/launch` remains its alias. Opening navigation and the scroll cue can skip directly to Explore; a focus-visible skip link also bypasses the sequence.

Deliberate scrolling always drives the zoom, including when reduced motion is requested. The user rejected the initial implementation that substituted a fade in that case. Reduced-motion TV pausing, hidden-tab pausing, and opt-in audio remain in place. The TV also pauses when covered by Explore. Artwork failure alone uses a short, unscaled fade. Scroll work is scheduled on input/resize, stops in hidden tabs, and becomes a no-op during ordinary Explore scrolling. The covered page is inert.

## Validation

- Reused the production preview at `http://127.0.0.1:4173/`, rebuilt and reloaded. Build, lint, and 30 Node tests pass. Three geometry tests check uniform monotonic zoom, finite output, endpoint clamping, and full viewport coverage in desktop, portrait, and landscape proportions.
- Visually inspected at 1440 × 900 and 390 × 844: opening, curved glass reveal, arrival, and reverse scrolling. No document horizontal overflow. Replaced the initial polygon approximation with curved glass and shortened the crossfade to avoid prolonged TV/Explore overlap.
- Verified `/explore` and `/` at their respective endpoints, the starting transform returns to identity, and direct reload at Explore does not mount the opening.
- Search reduced the collection to one matching coin after arrival. A direct pointer click opened the creation dialog, focused Name, and Escape restored focus. Browser locator auto-centering can move the page back into the transition before clicking the header; this was an automation artifact, not a modal failure.
- Temporarily blocking the Macintosh image verified its reload message and fallback into Explore. All network, cache, viewport, and motion overrides were cleared. The corrected build's zoom was then verified with native scrolling under the browser's existing motion setting.
- No warning/error logs in normal checked flows. Existing playback/audio failure and disposal tests pass. No physical touch-device or screen-reader audit was performed.

## Screenshots

Pairs use matching CSS viewports and paused TV, with unsynchronized footage timestamps. They compare layout and the transition, not lighting. Browser capture raster sizes can differ from CSS dimensions because of scaling and the scrollbar.

| View | Before | Opening | Through the glass | Explore |
| --- | --- | --- | --- | --- |
| Desktop | [Before](screenshots/scroll-before-desktop.jpg) | [Opening](screenshots/scroll-after-desktop.jpg) | [Transition](screenshots/scroll-through-desktop.jpg) | [Arrival](screenshots/scroll-explore-desktop.jpg) |
| Mobile | [Before](screenshots/scroll-before-mobile.jpg) | [Opening](screenshots/scroll-after-mobile.jpg) | [Transition](screenshots/scroll-through-mobile.jpg) | [Arrival](screenshots/scroll-explore-mobile.jpg) |

No new dependencies, external assets, API integration, or deployment.
