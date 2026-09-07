# Macintosh opening scene validation

## Grounded image composition — September 7, 2026

- Removed the still artwork's inherited bottom fade, which erased keyboard/mouse contact edges. Added registered SVG shadows at three softness levels beneath the tower, keyboard, and mouse; the broad shadows extend down/right from the artwork's upper-left key. Strengthened the receiving surface slightly and reduced foreground fog wash while retaining rear mist. The SVG shares the artwork/TV viewBox and contain sizing. This is 2D compositing, not newly introduced 3D geometry.
- Compared the actual production render with live Shader. Visually inspected the normal wide browser, 1440 x 900 desktop, and 390 x 844 mobile. Contact edges remain solid, shadows follow the objects at both sizes, and TV playback/glow remain visible. Mobile document width equals its 390px viewport. Evidence: [desktop](screenshots/image-grounding-desktop.jpg), [mobile](screenshots/image-grounding-mobile.jpg).
- Reduced-motion startup retained the paused TV; Play and Pause still changed its visible state. Shadows are static SVG filters with no new update loop, dependencies, or assets. Original artwork and playback code are unchanged. No new GPU timing or physical-phone performance measurements were made.
- Build/TypeScript and Oxlint passed. No new behavioral tests were added for the static visual layers. No deployment.

## Image-based television and reactive CRT light — September 7, 2026

- Corrected the image swap to retain TV playback. The original artwork remains unchanged, while a 640 x 480 2D canvas plays the existing four clips inside an SVG path fitted to the curved glass. The same playback controller is shared with the preserved Three texture adapter; the active image view does not import Three.js or load the GLB.
- Added brighter phosphor color, a blurred 160 x 120 copy of actual video highlights, a soft bezel halo, and masked light across the keyboard. An 8 x 6 video sample at most 5Hz determines bounded light color/intensity, eased between samples. Reflections are an image-compositing illusion, not ray-traced geometry. Dark pictures emit less light; a paused picture retains its frozen light. Original image/model/video files were not edited.
- Compared against the live Shader reference and visually inspected the actual image/TV composite in the wide browser, 1440 x 900 desktop, and 390 x 844 mobile. Video follows the screen angle and rounded edges; brighter content blooms across the glass; keyboard spill follows the footage's hue. Mobile has no horizontal overflow. Evidence: [desktop](screenshots/image-tv-glow-desktop.jpg), [mobile](screenshots/image-tv-glow-mobile.jpg).
- A natural development playback audit traversed 1 -> 2 -> 3 -> 4 -> 1 -> 2. Static transitions lasted approximately 263–269ms at the 30fps update cap against their 240ms configured duration. About 2,020 updates occurred over 67.3 seconds of active playback (approximately 30fps) on this PC. This is a local browser sample, not physical-phone performance validation.
- Pause retained frame count 2023, video time 9.89 seconds, and identical light variables across separated reads. The current reduced-motion preference started with a paused poster. Opt-in sound reached a running AudioContext and the on state, then mute restored off. Speaker output was not separately listening-tested. Hidden-tab pausing follows the existing document visibility handling and is covered at the playback-controller level; a real tab-background transition was not manually re-established.
- Deliberately blocked all four MP4s: the TV settled to a dim NO SIGNAL screen while the original computer and controls remained. Unblocked requests and restored production playback. No ordinary console warnings/errors were captured before the intentional failure check. Browser overrides and request blocking were cleared afterward.
- Build/TypeScript, Oxlint, and all 24 tests passed: the original 19 cases plus supplied-canvas/disposal coverage and four light-estimation cases for black/bright/color/alpha/bounds. The active bundle is approximately 65.3 KB gzip JavaScript, with no Three scene chunk. No deployment.

## Original image comparison — September 7, 2026

- At the user's request, first committed and pushed the 3D atmosphere checkpoint (`92048f0`), then replaced the active renderer with the original, unedited 1536 x 1024 image. Retained the revised fog and type. Camera/TV controls are absent, all fog animations are paused, and the previous 3D/media implementation remains in source.
- Inspected actual production desktop at 1440 x 900 and the normal wide window, plus 390 x 844 mobile. Artwork, keyboard, mouse, and copy are visible; mobile scroll width equals its 390px viewport. Evidence: [desktop](screenshots/image-study-desktop.jpg), [mobile](screenshots/image-study-mobile.jpg). This image has softer baked shading than the model checkpoint; no claim of matching Shader exactly.
- The image loads at its native 1536px width and dismisses the loader. Verified no canvas/video elements, no scene-module/GLB/MP4 resource requests, and all four CSS atmosphere animations paused. The production build contains only the React shell (~61.6 KB gzip JavaScript), with no Three.js scene chunk. The existing PNG itself remains 1.77 MB.
- Deliberately blocked the image request: the loader dismissed, the broken artwork was hidden, and the visible error offered Reload image. Removed request blocking and verified keyboard retry restored the artwork. Temporary browser overrides were cleared after inspection.
- Build/TypeScript and Oxlint passed. The 19 existing media/framing tests passed at the preceding 3D checkpoint; those modules are unchanged and not loaded by this image view. No new tests were added for the reversible artwork switch. No deployment.

## Softer atmosphere checkpoint — September 7, 2026

- Compared live Shader, the supplied screenshot, the original generated Macintosh image, and rendered production desktop/mobile views. Reduced opening yaw/elevation to 14/10 degrees, softened ivory housing and lavender fill, reduced glass reflection, enlarged/repositioned the desktop scene, and tightened mobile spacing. Stronger layered mist exposed letterboxing in the original SVG; `preserveAspectRatio="none"` removes those hard fog boundaries. No purchased geometry or textures changed.
- Grain now covers DOM and canvas, while broader bloom and a subpixel RGB offset run in the existing 3D composition pass. Shader's creator confirms grain, bloom, chromatic aberration, and canvas UI sharing the final graphics pipeline; the article does not establish its fog method. Our approach remains a layered approximation. [Creator's account](https://tympanus.net/codrops/2026/05/19/80s-business-tech-seamless-scene-transitions-inside-shader-ses-scroll-driven-webgpu-pipeline/).
- Visually inspected 1440 x 900 desktop, the normal wide browser, and 390 x 844 mobile, including overview, monitor focus/return, and keyboard focus. Keyboard/mouse remain visible and mobile has no horizontal overflow. Evidence: [desktop](screenshots/atmosphere-desktop.jpg), [mobile](screenshots/atmosphere-mobile.jpg).
- Production WebGPU and forced WebGL2 reached ready with no captured ordinary warnings/errors. The current reduced-motion preference started paused; explicit Play TV resumed video. Pause froze development frame count at 359 across separated reads. Hidden-tab behavior and asset-error recovery were unchanged and not manually retested.
- Fresh development WebGPU samples at 1440 x 900 / pixel ratio 1 varied from 9.1 to 26.6 fps. This does not establish sustained 30 fps or a controlled before/after result. Existing frame/pixel-ratio caps, 35% bloom resolution, and 1024px shadow map remain. Physical-phone performance is unverified.
- Node 24.19.0: build/TypeScript, Oxlint, all 19 existing tests, and diff whitespace checks pass. Existing large scene-chunk advisory remains (~260 KB gzip). No dependencies, new tests, or deployment.

## Landing-page typography and private transfer — September 7, 2026

- Final scope follows the user's correction: typography only. The green room, fog artwork, lights/materials, camera layout, and scene code match the preceding committed version. The fuller serif and luminous text edges were compared against the live Shader reference; small technical labels use the already bundled VT323. No new font download or runtime dependency.
- Visually inspected the production build at 1440 × 900 and 390 × 844. Confirmed text fits, the original green scene is restored, and live 3D loads. Screenshots: [desktop](screenshots/landing-font-desktop.jpg), [mobile](screenshots/landing-font-mobile.jpg). Build/TypeScript and lint pass. The existing six framing tests passed during this work; they do not validate typography. No new GPU performance claim is made for this CSS-only result.
- For the authorized private other-PC transfer, staged all 379 report/review files plus 12 original model source copies, 20 current working/study files, and the runtime GLB. Verified all 412 staged file blobs against their local bytes (201,648,170 bytes / 192.31 MiB). Git attributes preserve these original bytes across operating systems. The two redundant numbered Blender backups remain ignored. All 12 source-manifest hashes/sizes and the GLB structural inspector passed. See [setup instructions](OTHER-PC-SETUP.md).

## Retro loading-screen refinement — September 7, 2026

- Compared the live Shader loader and hero against our production loader. Specific differences: heavier italic display type and terminal lettering, bowed rather than straight screen edges, irregular grain over the whole picture, brighter blue midtones, soft color fringes, and broad glow around cream elements. The creator's [implementation account](https://tympanus.net/codrops/2026/05/19/80s-business-tech-seamless-scene-transitions-inside-shader-ses-scroll-driven-webgpu-pipeline/) corroborates post-processing the complete UI. Our DOM/SVG treatment remains an approximation; the title is cleaner than Shader's raster graphics.
- Iterated from overly coarse noise to fine static grain, reduced mobile displacement/blur, and enlarged terminal copy. Checked desktop, 390 × 844 portrait, and 600 × 400 compact landscape. Fixed title/copy overlap risk in short mobile layouts and removed the underlying page scrollbar while the loader covers it. Screenshots: [desktop](screenshots/loading-retro-desktop.jpg), [mobile](screenshots/loading-retro-mobile.jpg).
- Held the actual GLB request for visual inspection, preserving milestone progress and inert behavior. Released it under reduced motion: progress advanced, the scene reached ready, the overlay and inert attribute cleared, and atmosphere remained paused. Cleared interception, media, and viewport overrides afterward. The loading lifecycle, first-frame readiness, failure callbacks, and GPU scene are unchanged. Filters/noise are static and introduce no animation loop. Device GPU cost and physical-phone behavior were not newly measured.
- Production build/TypeScript, lint, and diff whitespace checks passed. Loader shell is about 62.32 KB gzip; scene remains 258.16 KB gzip with its existing large-chunk warning. VT323 is an unchanged 153,116-byte self-hosted font with its OFL license retained. No new JavaScript dependency.

## Loading screen — September 6 request

- Visually inspected Shader's live blue CRT loading screen and compared it with the local production loader at the default desktop viewport (2015 × 1027) and an emulated 390 × 844 portrait viewport. Retained its simple title/copy/bar/footer composition; used the provisional project title and existing font instead of Shader's logo. Portrait title wraps into two lines. Static scanlines and subtle color separation avoid an additional animation loop.
- Held the actual model request to inspect the loader. It stayed at the renderer milestone (18), with the underlying scene inert; releasing the request produced real download progress (41 observed), then a ready scene with no overlay or inert attribute. Inspected the loaded mobile scene as well.
- Production WebGPU and forced WebGL2 both reached ready. Reduced-motion loading completed with the atmosphere paused; a no-preference WebGL2 check resumed atmosphere after exit and Enter focused the monitor. Browser keyboard interaction established that the overlay no longer blocked the scene.
- Blocked the GLB, inspected the mobile still/error state, removed blocking, and activated Reload 3D scene with Enter: live rendering recovered. Independently blocked the lazy scene module and confirmed its error boundary dismissed the overlay and released inert, exposing the still/reload UI. Temporary interception, blocking, cache, viewport, and motion overrides were cleared after testing.
- Build/TypeScript, lint, all six existing framing tests, and diff whitespace checks passed. Framing tests do not cover loader behavior; the lifecycle checks above were performed in Chrome. Scene chunk remains approximately 258.16 KB gzip with the existing large-chunk warning. No new dependencies, scene shaders, licensed assets, or per-frame work were added. Physical-phone and new GPU timing measurements were not performed.

## Current correction — September 6, 2026 pointer focus follow-up

The user reported a white rectangular outline after clicking the computer. Reproduced in Chrome: the canvas had `data-input="pointer"` and matched `:focus-visible`, so excluding the custom keyboard rule still allowed the browser's native `outline: auto` to appear. The canvas now explicitly suppresses its default outline; the custom keyboard rule still applies. Clearing input modality on blur also restores the keyboard indicator when returning after mouse use.

### Automated validation

- Fresh build/TypeScript, Oxlint, all six existing geometry/framing tests, and `git diff --check` passed. The geometry tests do not validate CSS focus behavior; that was checked in the browser below.
- Scene output is 258.08 KB gzip / 934.61 KB uncompressed. The existing bundle-size warning remains.

### Visual and interaction validation

- Inspected loaded desktop (1440 × 900) and mobile (390 × 844) scenes on WebGPU in development and WebGL2 in the freshly built production preview. Confirmed the reported backend in each case.
- Mouse click, keyboard navigation back into the scene after a click/blur, and a subsequent mouse click were exercised. Pointer outline computed to `none`; keyboard re-entry retained the warm focus indicator. Screenshots confirmed the visual result.
- Touching the actual CRT entered monitor focus without an outline on both backends. Escape returned to the computer, with a keyboard indicator; the next mouse click removed it. These actions worked with the atmosphere paused under reduced motion. Mobile had no horizontal overflow.
- Revisited the live Shader opening and generated reference beside the local render. This correction does not complete the visual brief. The broad pale CRT reflection, relatively uniform lavender side lighting, and large mobile gap above the computer are recorded as next-pass priorities in `PROJECT-BRIEF.md`.
- This was a focused outline/accessibility regression check. The hidden-tab, download-failure, GPU timing, and unchanged-model checks below are from the preceding implementation pass, not new measurements. Physical-phone testing remains outstanding.

## Preceding implementation pass — September 6, 2026 follow-up

Local development and local production preview only. The user's final interaction direction supersedes the earlier visible controls: the computer stays stationary, dragging changes the camera viewpoint, and the ordinary opening has no visible toolbar or pause button. Focus was pulled back to show the bezel and enclosure.

### Automated validation

- `npm --prefix frontend run build`: passed TypeScript and Vite production compilation.
- `npm --prefix frontend run lint`: passed Oxlint.
- `npm --prefix frontend test`: six Node tests passed. They cover actual curved vertices, translated/rotated/nonuniform and mirrored transforms, exported UV orientation, portrait/landscape refitting, depth, and invalid geometry/viewport inputs. No new dependency was added.
- `git diff --check`: passed.
- Production output: shell 61.47 KB gzip, scene 258.06 KB gzip, CSS 2.84 KB gzip. The existing scene-chunk size warning remains (934.52 KB uncompressed); it was not suppressed.

### Visual and interaction validation

- Revisited the live [Shader opening](https://www.shader.se/) and visually compared it with the generated image and retained Blender `baseline`/`glass` studies. Inspected actual loaded canvas renders rather than only the loading still. The cream/lavender treatment, dark glass reflections, quieter type, and reduced foreground mist were iterated in Chrome. The result remains a lighting/material study of the purchased asset, not an exact recreation of the generated image.
- Inspected 1440 × 900 desktop and 390 × 844 mobile views, plus the normal wide desktop window. Checked whole-computer framing, the pulled-back monitor view, readable text, keyboard focus, and no horizontal overflow.
- Confirmed both WebGPU and forced WebGL2 in the **production build** using the renderer's reported backend. Inspected desktop views on both and mobile views during development/production checks. Ordinary production rendering returned no browser warnings/errors before intentional download-failure tests.
- With reduced motion enabled, the opening starts paused. Arrow keys and touch dragging changed the camera; the model's full world transform remained unchanged. Paused direct input advanced frame counts, then stopped drawing when idle. Yaw clamps at ±36°, elevation at ±12°; the keyboard positive-yaw clamp was exercised.
- Touch selection hit the actual CRT, entered monitor view, and Escape returned to the computer. Focus after a changed viewpoint remained aligned to the screen; viewport resizing refit it. Screen geometry includes the real approximately 4.9° tilt, and its exported UVs place V=0 at the top. The final focus fit uses at most 46% of each viewport axis in normalized screen bounds, retaining space around the CRT.
- Verified reset cancels an in-progress mouse drag. Screen-reader instructions and keyboard equivalents live in the DOM canvas. Enter toggles monitor focus, Escape/Home reset, and Space explicitly pauses/resumes atmosphere. The original claim that pointer input never showed an outline was incorrect: the later user-reported case exposed Chrome's native focus ring. See the correction below.
- A real hidden-tab check reported `document.hidden: true`, motion paused, and frame count **1165** unchanged across separated reads; showing it again resumed frames. The test browser's focus-emulation override was temporarily disabled for this check, then restored.
- Deliberately blocked the production lazy scene module: the error boundary retained the still, displayed a readable message, and keyboard activation of **Reload 3D scene** restored live 3D after unblocking. Repeated this with the GLB request blocked; the scene's own fallback/reload path recovered too. Failure screenshots were inspected on mobile. All request blocking was removed afterward.

### Rendering boundaries

- Fixed a canvas intrinsic-size/percentage-height feedback loop discovered during fresh inspection. The canvas now occupies a definite absolute viewport, and drawing-buffer dimensions are capped at 4096px in addition to the 1.5 desktop / 1.25 mobile pixel-ratio limits. Confirmed the mobile cap under emulated device pixel ratio 3.
- Ambient and input-driven draws share a 30-fps ceiling; idle paused and hidden scenes do not loop. Static softbox reflections are baked once into a 128px PMREM. Bloom remains at 35% resolution and the shadow map at 1024px. The purchased model remains four primitives / 25,146 triangles; no geometry or texture files were rewritten.
- Foreground WebGPU development metadata sampled approximately 30 fps (30.1 in one two-second interval). A foreground WebGL2 mobile-viewport sample recorded 2,005 frames in 66.83 seconds, approximately **30.0 fps**. An occluded WebGL2 tab first read approximately 1 fps; that was browser throttling and was not used as the foreground sample.
- These are local desktop-GPU observations with emulated mobile viewports. Physical-phone performance, battery use, network conditions, and comparative WebGPU efficiency remain unverified.

### Reproduce and preserve

- Develop: `npm --prefix frontend run dev` at `http://127.0.0.1:5173/`.
- Production: build, then `npm --prefix frontend run preview`. `?renderer=webgl` explicitly selects the fallback on either server.
- Drag changes viewpoint; selecting the monitor focuses it and selecting again returns. Double-click resets. Keyboard behavior is described above.
- Licensed GLB, purchased originals, and Blender studies remain local and ignored. `reports-examples/` and `reviews/` remain untouched and untracked. No remote was configured during this implementation pass; the later GitHub remote is recorded in `PROJECT-BRIEF.md`. No deployment, extra sections, scroll behavior, logo, or API integration was added.

## Earlier checkpoint — historical checks

September 6, 2026, Pacific time. Local development only; no deployment.

## Assets and Blender

- Copied all twelve files from `Desktop/Retro Mac 3D` into the project. SHA256 verification before and after processing confirmed that every desktop original and project source copy remained unchanged.
- Blender 5.2.1 imported the FBX, reconnected the supplied textures, and saved an editable full-resolution source blend.
- The Blender studio render was visually inspected for silhouette, keys/legends, vents, floppy slot, cables, and texture placement.
- `node assets/tools/inspect_macintosh_glb.mjs` passed: GLB 2.0, 25,146 triangles, four model primitives, three materials, normalized independent Screen UVs, no required extensions, and texture dimensions within the 2K limit. Export: 4,623,224 bytes.

## Browser and visual checks

- Real model rendered with both the WebGPU backend and explicitly forced WebGL2 backend in Chrome. Renderer and ready state were read from the canvas's development metadata, and screenshots were inspected.
- Desktop views at 1440 × 900 and 2015 × 1027; mobile at 390 × 844. Checked readable headings/controls, model framing, and no horizontal overflow.
- Fixed a focus-induced internal scroll after viewport resizing: the opening now uses `overflow: clip`, keeping the header at the top.
- Compared against the live Shader opening and adjusted CRT emission, bloom, textured fog, light contrast, and object scale.
- Keyboard activation toggled both the CSS atmosphere and canvas rendering state; a visible keyboard focus outline was verified.
- The OS reduced-motion setting starts the scene paused. Users can explicitly resume it. Hidden-tab pausing is implemented using the visibility event.
- A deliberately blocked GLB request showed the still image and a readable retry message. Request blocking was then removed and the model restored.
- No browser warnings or errors were observed during ordinary rendering on either backend. The deliberately blocked request produced the expected test error.

## Build and performance boundaries

- `npm --prefix frontend run build`: passed TypeScript and production compilation.
- `npm --prefix frontend run lint`: passed Oxlint.
- Scene code is split from the React shell. Build output: approximately 61 KB gzip for the shell, 255 KB gzip for the GPU scene module, and 2.8 KB gzip CSS. Vite reports its standard warning for the 927 KB uncompressed scene chunk; this was not suppressed.
- Configured limits: 30-fps ambient rendering, pixel ratio at most 1.5 desktop / 1.25 mobile, bloom at 35% resolution, 1024px shadow map, and render-on-change when paused.
- A foreground Chrome WebGL2 mobile-viewport sample measured 29.9 fps against the 30-fps cap. An earlier occluded-browser sample was throttled to about 1 fps; this was a browser visibility/focus condition, not an equivalent benchmark.
- These checks establish local rendering and behavior. They do not establish battery life, performance on physical mobile devices, network loading performance, or a speed advantage of WebGPU over WebGL2.

## Reproduction and remaining work

- Local preview: `npm --prefix frontend run dev`.
- Force fallback in development: `http://127.0.0.1:5173/?renderer=webgl`.
- Regenerate licensed GLB: `blender --background --python assets/tools/prepare_macintosh.py` (requires the copied purchased source).
- Source files, working Blender files, and the web model remain local and excluded from Git. Restore/regenerate them on a fresh checkout.
- Netlify deployment, public asset packaging, final product copy, name/logo, and API integration are deferred.
## September 7 — television channel cycle

- Revisited the live Shader landing page and visually confirmed changing footage inside its curved CRT. Compared the local monitor in desktop overview/focus and 390 x 844 mobile overview/focus. Inspected a paused static texture after it reached the rendered screen: monochrome snow, scanlines, and a moving horizontal tracking band. No horizontal overflow at the mobile size. Existing screen reflections and mobile composition are otherwise unchanged.
- All four user-supplied clips were optimized to 768 x 432 H.264/yuv420p, 30fps, AAC80k, fast-start MP4, totaling 2,206,089 bytes. Full FFmpeg decode checks passed; sources and mapping are in `frontend/public/ASSETS.md`. Desktop originals were not edited.
- Chrome WebGPU and forced WebGL2 rendered the videos. A complete repeated WebGL2 cycle with sound enabled traversed 2 -> 3 -> 4 -> 1 -> 2 without failed clips; sampled static phases lasted 263–267ms against the 240ms setting and 30fps drawing cap. Foreground samples were approximately 29.7–30.0fps. Added completion detection at the final media frame after live Chrome sometimes reached duration without dispatching `ended`.
- The actual OS reduced-motion preference was enabled: initial poster and paused controls were verified, then explicit Play TV resumed playback. Pause freezes video and static; the mute control toggled correctly and opt-in resumed the AudioContext to `running`. Automated tests verify scheduled noise duration, mute races, and immediate stop on pause. Speaker output, subjective sound balance, and physical mobile/Safari behavior have not been independently listening-tested. Hidden-tab pausing is wired through the existing visibility path and covered at the controller level; attempted browser focus switching did not make `document.hidden` true, so an actual background-tab transition was not established in this run.
- Blocking all four MP4 requests in Chrome produced the still NO SIGNAL screen while the 3D scene stayed ready. Removed request blocking and restored viewport/motion emulation after checks.
- `npm --prefix frontend run build`, `npm --prefix frontend run lint`, `npm --prefix frontend test`, and `git diff --check` passed. There are 19 tests: 13 channel/media lifecycle cases plus the 6 existing camera tests. Vite's existing large scene-chunk advisory remains (scene module ~260KB gzip). No dependencies added and no deployment performed.
## September 7 — closer video fit and larger default computer

- Changed picture/poster fitting from contain to cover: a centered 4:3 crop fills the CRT without letterbox bars or face stretching. The 16:9 source loses 12.5% on each side. Existing clip files and 640 x 480 texture resolution are retained; this is a framing change, not additional source detail.
- Enlarged the default scene viewport by 12% in both dimensions. Mobile/tablet use an offset enlarged viewport after the first centered enlargement clipped the keyboard at the left edge. Monitor-focus viewport and camera fit stay unchanged.
- Revisited live Shader and inspected the rebuilt production preview in desktop overview/focus and 390 x 844 mobile overview/focus. Video fills the curved glass; the default keyboard and mouse stay visible; mobile has no horizontal page overflow. Reduced-motion poster uses the same crop. Build, lint, all 19 existing tests, and diff whitespace checks passed. No new behavior tests were needed for these framing-only edits.
- Performance was rechecked with a fresh development server after the existing server served stale scene modules. A same-session desktop WebGPU comparison returned 9.9fps enlarged, 10.4fps at the original size, then 20.8fps after restoring enlargement. These variable samples do not establish a sustained frame rate or a regression caused by the size change. Temporary CSS and viewport overrides were restored; the configured 30fps and pixel-ratio caps remain intact.
