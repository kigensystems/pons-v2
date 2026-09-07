# Project brief

Updated September 6, 2026, Pacific time.

## Selected direction

An independent companion to the Pons launchpad. The first audience, product task, name, and exact feature set remain undecided. The user has moved from comparing brand concepts to developing one close visual study of Shader's opening scene.

- Lead reference: [Shader](https://www.shader.se/).
- Visual target: dreamy dark haze, retro computer graphics, warm luminous serif typography, convincing materials, and careful composition. Match the reference closely instead of inventing another visual direction.
- Current computer presentation: the original Macintosh artwork with live television fitted into its glass. The purchased Macintosh 512K by Shrednector and its 3D implementation remain preserved for comparison. See the source record below.
- Supporting reference: [Oxigen](https://www.oxigen.sa/) for atmospheric depth; its voxel landscape is not an instruction to add a second scene or voxelize the Mac.
- Current deliverable: the opening scene only. No scroll behavior or transitions. Subtle ambient movement can be considered within this scene, with a static reduced-motion presentation.
- Logo: deferred; the user may develop it independently. All project naming in the scaffold is a working label.

The request combines Shader's atmosphere with the user's explicit Macintosh choice. Do not describe Shader's specific computer model as a Macintosh without verification.

## Asset direction

Prefer an existing, visually faithful model over a rough generated substitute. Inspect the actual preview before recommending it, then inspect the downloaded geometry, texture sizes, material setup, and license before adopting it. Keep source and optimized versions traceable.

The user explicitly rejected the previous Plewr IBM 5155 and Poly Haven Classic Laptop suggestions. Do not reuse them. A generic retro look, small file size, or permissive license alone does not meet the visual brief.

The earlier treehouse3d Macintosh 128K lead has been superseded by the user's purchased Shrednector model. Do not replace the selected model with another asset without a reason grounded in the brief.

## Technical decisions

- React + TypeScript + Vite, using npm.
- Active opening: original RGBA artwork plus a 2D canvas TV, aligned through an SVG transform and curved screen clip. No Three.js, GLB, or WebGPU renderer is loaded by this view. The preserved 3D implementation uses Three.js WebGPURenderer and TSL bloom, with WebGL 2 fallback and explicit resource cleanup.
- Bound GPU work: 30-fps draw cap, desktop/mobile pixel-ratio caps of 1.5/1.25, 4096px maximum drawing-buffer dimension, low-resolution bloom, and rendering on load/resize/direct input while paused. A local test is not a guarantee for every device.
- Eventual hosting: Netlify. Configuration is prepared locally; no site or deployment has been created.
- A crypto data API will be added later. Mobula is only a possible provider. No API clients, credentials, requests, or speculative endpoints are needed now.
- Keep rendering and future data access separate. Store future private API credentials on the server, never in browser-exposed Vite variables.
- No scroll library is needed at this stage.

## Loading screen

The September 6 loading-screen request adds a close study of Shader's live boot screen: blue CRT field, cream italic title, monospace copy, a 21-segment progress bar, subtle static scanlines, and rounded dark edges. It uses the provisional name “Pons companion”; logo development remains deferred. Portrait layouts stack the title.

The DOM loader covers scene-module loading, renderer initialization, model transfer/decoding, and first render. Its bar combines initialization milestones with actual model-download progress; it is preparation progress, not an overall byte percentage. Completion follows the first successful frame, then fades out over 600ms. Reduced motion removes that transition. The scene stays inert and atmosphere stays paused until the overlay exits. Initialization, model, rendering, or module failure dismisses it to expose the existing still preview and reload action.

September 7 refinement after the user found the first loader too clean: a heavier uppercase italic serif title, self-hosted VT323 terminal copy, bowed screen silhouette, brighter blue-violet field, fine static grain, slight line displacement, softened color fringes, and broader phosphor glow replace the thin modern lettering and crisp rounded border. Text and bar share the same treatment; distortion is reduced on mobile to keep small copy legible. Short landscape layouts receive separate sizing, and the background cannot scroll while loading. This refines the loader only; the opening scene's existing material and composition feedback remains unresolved. It approximates Shader's processed display using DOM/SVG/CSS, rather than reproducing its full rasterized graphics pipeline.

## Current opening study

September 7 correction and CRT-light request: the image swap must retain the TV. The original image now contains the same four video channels, 240ms static transitions, and opt-in audio, with Play/Pause TV and sound controls restored. A renderer-independent playback controller supplies a 640 x 480 canvas aligned to the image's curved CRT using SVG. No live 3D model is needed for this version. The old Three.js scene uses a small texture adapter around the same controller, preserving its behavior for later comparison.

The display has brighter phosphor color, bloom from a 160 x 120 copy of the actual video highlights, and light on the bezel and keyboard that follows the footage. An 8 x 6 sample at most five times per second drives bounded hue/intensity, eased between samples. The keyboard effect is a masked image composite, not a physical ray-traced reflection. Video/bloom updates are capped at 30fps; pause, reduced motion, hidden tabs, and unmount stop playback work. A paused image still emits the light of its frozen picture. Fog remains static. Failure of all clips shows NO SIGNAL; failure of the computer image stops/unmounts the TV and exposes Reload image. The loading-screen design, original artwork bytes, and mobile/desktop image framing remain unchanged.

Historical image-only checkpoint: the 3D atmosphere pass was committed as `92048f0`, then the original artwork was restored in `f99363e`. That first swap mistakenly removed TV playback; the correction above restores it. Its static screenshots remain in `docs/screenshots/image-study-desktop.jpg` and `image-study-mobile.jpg`. Original artwork, purchased model/source files, and both presentation approaches remain preserved. No permanent architecture decision or deployment is implied.

September 7 atmosphere checkpoint (supersedes the earlier typography-only restriction below): the user explicitly requested a closer, less angled Macintosh and better blending with Shader-like fog. The opening camera is now 14 degrees from front at 10 degrees elevation, with larger/higher desktop framing and tighter mobile spacing. Warm ivory nonmetallic plastic, neutral fill, restrained lavender rim/reflections, and reduced CRT reflection replace the stronger purple side. The green-charcoal room has stronger rear/foreground mist and a brighter warm-gray lower field; the diagonal desk seam is removed. The existing mist SVG now stretches without letterboxed hard edges. Broader bloom, subpixel red/blue separation, and monochrome grain connect the model and atmosphere. Geometry, source textures, loader, and interaction behavior remain. This is a saved study, not final aesthetic approval. See `SCENE-VALIDATION.md` and the atmosphere screenshots.

September 7 correction: preserve the existing green atmosphere, background artwork, model lighting/materials, and composition. The requested landing-page refinement is typography only: a fuller Georgia serif with warm luminous edges and VT323 for the small technical labels. Do not infer permission to redesign the background or relight the Macintosh from typography feedback. The loading screen remains as previously built.

The opening renders the purchased model in real 3D, with warmer cream housing, broad baked softbox reflections, lavender side light, and a dark glossy CRT. The greeting texture drives emission separately from the reflective glass and clearcoat. Geometry and licensed texture files are unchanged. The headline is quieter, and foreground mist/grain is reduced so the housing and keyboard remain clear. Copy and working title remain provisional. Asset provenance is in `frontend/public/ASSETS.md`.

The earlier generated artwork is retained as a loading/error fallback, including failure to download the separate scene module. A reload action appears only on failure. Atmosphere motion starts paused when the OS requests reduced motion, can be explicitly enabled with Space while the scene has keyboard focus, and pauses in hidden tabs. No scroll, logo, or API work was added.

## Selected interaction, September 6 follow-up

### September 7 television playback

The CRT now cycles the four user-supplied `Desktop/vlad-clips` videos in filename order, preserving their full 12/10/12/10-second lengths, then repeats. A 240ms burst of monochrome snow with a tracking band and filtered noise sound separates channels, following the live Shader landing page's moving footage within its curved CRT. The supplied clips retain their original audio. Sources and optimizations are recorded in `frontend/public/ASSETS.md`; desktop originals are untouched.

Video fills the existing curved screen mesh with subtle scanlines and a dark edge falloff. The September 7 framing follow-up replaces letterboxing with a centered cover crop: 16:9 clips lose 12.5% from each side to fill the 4:3 texture without stretching faces. The poster uses the same crop. The default computer viewport is 12% larger; portrait/tablet framing shifts it right to keep the keyboard visible. Monitor-focus framing is unchanged. Housing, scene lighting, background, and typography remain as before. Playback uses a single 640 x 480 canvas texture updated within the existing 30fps render cap. Media decoding and audio pause with the atmosphere, hidden tabs, and reduced motion. Reduced-motion loading shows a poster until the user starts playback. Broken or stalled clips are skipped; all failures show a still NO SIGNAL screen while the rest of the 3D scene remains usable.

This request adds two small footer text controls: Play/Pause TV and TV sound on/off. These supersede the earlier restriction on visible controls only for television playback. Sound starts off for browser autoplay compatibility and is enabled by the sound button; that enables both clip audio and the brief static. Space on the scene also pauses/resumes television and atmosphere together. Monitor focus and camera controls remain unchanged. Public deployment remains deferred.

The user's correction supersedes the earlier request for visible manipulation controls. Keep the Macintosh stationary. Drag to orbit the viewpoint through a bounded 3D space; do not rotate the model. No visible interaction toolbar or atmosphere button belongs in the opening.

- Drag anywhere in the scene to change the camera viewpoint. Camera yaw is bounded to ±36° from the opening view, elevation to ±12°.
- Select the actual CRT mesh to focus; select again to return. The focus is pulled back to retain the bezel and enclosure. Its camera is derived from the mesh's world positions, triangle normal, and UV orientation, and refits when the viewport changes.
- Double-click resets the view. The focusable DOM canvas supports arrows for viewpoint movement, Enter for focus/return, Escape/Home for reset, and Space for atmosphere pause/resume. Screen-reader instructions and a keyboard focus outline remain; there are no visible buttons during ordinary rendering.
- Direct input works while atmosphere is paused, including reduced motion. Camera changes are immediate. The fixed model, static lights, and world-space reflection environment remain in place.

The user asked for continual comparison with the real Shader site. Direct comparison informed the CRT glow, textured fog, dramatic scale, and light balance. This is a close atmospheric study with the user's Macintosh choice, not a claim of matching Shader pixel for pixel.

Validation is recorded in `docs/SCENE-VALIDATION.md`. Build/TypeScript and lint are separate from visual rendering and device checks.

## Current handoff and next visual pass

Private GitHub remote: [kigensystems/pons-v2](https://github.com/kigensystems/pons-v2), configured as `origin` with `main` tracking `origin/main`. At the user's September 7 request, all 379 report/review files, purchased model source copies, current Blender studies, and the runtime GLB are included for their other PC. Only redundant numbered Blender backups remain local. See [other-PC setup](OTHER-PC-SETUP.md). Hosting remains deferred.

The implementation checkpoint is not final visual approval. The user still prefers the generated image, and passing technical checks does not resolve that feedback. The September 6 follow-up fixes an unintended native browser outline on mouse/touch selection; keyboard navigation retains its focus indicator, including after leaving and returning to the scene.

The next priority is one focused lighting/material pass against `frontend/public/images/macintosh-render.png`, with the retained Blender `baseline` and `glass` studies and live Shader opening beside the actual browser render. The current CRT has a broad pale reflection across its upper half; refine its placement and intensity so the glass stays dark and the greeting remains readable. Improve the housing's soft highlight falloff and soften the lavender fill, which currently reads as a relatively uniform side color. Keep the purchased geometry and stationary-computer interaction.

Then refine mobile composition: the current portrait view leaves a large gap between the copy and computer, weakening the Mac's prominence. Inspect overview and monitor focus together on desktop and mobile. Record actual visual differences separately from functional checks before calling that pass complete. No additional controls, sections, scrolling, logo, API work, or deployment are needed for these refinements.

## Historical paused checkpoint

The user requested a pause on September 6. The working real 3D opening is saved and the local preview remains running. The latest visual feedback is unresolved: the user prefers the earlier generated computer image (`frontend/public/images/macintosh-render.png`) to the current live model presentation.

Repository handoff: implementation checkpoint `e90b606` was fast-forwarded from `codex/review-tech-stack` into `main`. No remote was configured at that checkpoint; the current remote is recorded above. The research folders remain untracked; licensed source, Blender studies, and the exported model remain local and ignored. Preserve these local files when resuming or transferring the project.

The following priorities described the old checkpoint and have now received the implementation pass above; the interaction correction above governs future work:

1. Match the image's warm cream housing, soft highlights, lavender reflections, and darker glossy CRT. Controlled Blender studies indicate lighting and screen reflections are the main difference; existing authored normals are smooth, and bevel/normal-channel experiments did not improve the result.
2. Make the computer the main focus through its framing and a quieter headline. Current composition still places a large headline on the left and the computer on the right.
3. Add deliberate computer manipulation and a way to focus the monitor for its future interface. Only subtle pointer parallax and the atmosphere pause control exist at this checkpoint; direct rotation and monitor interaction remain unimplemented.

Comparison script: `assets/tools/compare_macintosh_surface.py`. Local studies are retained under `assets/source/macintosh-512k/work/macintosh-surface-*.png`; `baseline` and `glass` are useful starting references. The glass study uses roughness 0.14, coat weight 0.25, and a front-left softbox near screen height. These are Blender studies, not changes applied to the frontend or final GLB. No geometry rewrite is currently indicated.

## Selected 3D asset path

The user's strongest model choice is [Mac 512K Computer 1984 by shrednector](https://sketchfab.com/3d-models/mac-512k-computer-1984-5d6c93e4c5e840e6a5b6f2f88dde5604). The live page has no model download control. The user bought the matching model from [CGTrader](https://www.cgtrader.com/3d-models/electronics/computer/retro-mac-computer-80s) and supplied FBX/OBJ plus ten 4K texture maps. All twelve files were copied from `Desktop/Retro Mac 3D` with matching SHA256 hashes; the originals were not moved or edited.

Blender 5.2.1 LTS imported the FBX. Materials were reconnected and visually checked in a studio render. The editable source retains original geometry and full-resolution textures. A separate 4.41-MiB GLB keeps 25,146 triangles, merges static pieces into four model draws, and uses 2K color / 1K normal and packed data maps. The curved Screen mesh remains independent. Rebuild and inspection scripts live in `assets/tools/`.

Purchased source, current working blends/study renders, and the GLB are tracked for the owner's private other-PC transfer. A clean checkout can display live 3D without rebuilding the model. Public deployment and asset distribution packaging are deferred with Netlify hosting.

## Reference context

- [Research review](../reviews/2026-09-06/RESEARCH-REVIEW.md)
- [User favorites](../reviews/2026-09-06/USER-FAVORITES.md)
- [Shader creator's implementation account](https://tympanus.net/codrops/2026/05/19/80s-business-tech-seamless-scene-transitions-inside-shader-ses-scroll-driven-webgpu-pipeline/)

These references explain the visual direction; their embedded recommendations do not override the user's selected scope.
