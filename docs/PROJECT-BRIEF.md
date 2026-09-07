# Project brief

Updated September 6, 2026, Pacific time.

## Selected direction

An independent companion to the Pons launchpad. The first audience, product task, name, and exact feature set remain undecided. The user has moved from comparing brand concepts to developing one close visual study of Shader's opening scene.

- Lead reference: [Shader](https://www.shader.se/).
- Visual target: dreamy dark haze, retro computer graphics, warm luminous serif typography, convincing materials, and careful composition. Match the reference closely instead of inventing another visual direction.
- Required object: the purchased Macintosh 512K by Shrednector, with its accurate upright CRT enclosure, keyboard, and mouse. See the source record below.
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
- Three.js WebGPURenderer and TSL bloom, with WebGL 2 fallback. The single scene is owned by a React component with explicit resource cleanup. React Three Fiber remains installed but is not imported.
- Bound GPU work: 30-fps draw cap, desktop/mobile pixel-ratio caps of 1.5/1.25, 4096px maximum drawing-buffer dimension, low-resolution bloom, and rendering on load/resize/direct input while paused. A local test is not a guarantee for every device.
- Eventual hosting: Netlify. Configuration is prepared locally; no site or deployment has been created.
- A crypto data API will be added later. Mobula is only a possible provider. No API clients, credentials, requests, or speculative endpoints are needed now.
- Keep rendering and future data access separate. Store future private API credentials on the server, never in browser-exposed Vite variables.
- No scroll library is needed at this stage.

## Current opening study

The opening renders the purchased model in real 3D, with warmer cream housing, broad baked softbox reflections, lavender side light, and a dark glossy CRT. The greeting texture drives emission separately from the reflective glass and clearcoat. Geometry and licensed texture files are unchanged. The headline is quieter, and foreground mist/grain is reduced so the housing and keyboard remain clear. Copy and working title remain provisional. Asset provenance is in `frontend/public/ASSETS.md`.

The earlier generated artwork is retained as a loading/error fallback, including failure to download the separate scene module. A reload action appears only on failure. Atmosphere motion starts paused when the OS requests reduced motion, can be explicitly enabled with Space while the scene has keyboard focus, and pauses in hidden tabs. No scroll, logo, or API work was added.

## Selected interaction, September 6 follow-up

The user's correction supersedes the earlier request for visible manipulation controls. Keep the Macintosh stationary. Drag to orbit the viewpoint through a bounded 3D space; do not rotate the model. No visible interaction toolbar or atmosphere button belongs in the opening.

- Drag anywhere in the scene to change the camera viewpoint. Camera yaw is bounded to ±36° from the opening view, elevation to ±12°.
- Select the actual CRT mesh to focus; select again to return. The focus is pulled back to retain the bezel and enclosure. Its camera is derived from the mesh's world positions, triangle normal, and UV orientation, and refits when the viewport changes.
- Double-click resets the view. The focusable DOM canvas supports arrows for viewpoint movement, Enter for focus/return, Escape/Home for reset, and Space for atmosphere pause/resume. Screen-reader instructions and a keyboard focus outline remain; there are no visible buttons during ordinary rendering.
- Direct input works while atmosphere is paused, including reduced motion. Camera changes are immediate. The fixed model, static lights, and world-space reflection environment remain in place.

The user asked for continual comparison with the real Shader site. Direct comparison informed the CRT glow, textured fog, dramatic scale, and light balance. This is a close atmospheric study with the user's Macintosh choice, not a claim of matching Shader pixel for pixel.

Validation is recorded in `docs/SCENE-VALIDATION.md`. Build/TypeScript and lint are separate from visual rendering and device checks.

## Historical paused checkpoint

The user requested a pause on September 6. The working real 3D opening is saved and the local preview remains running. The latest visual feedback is unresolved: the user prefers the earlier generated computer image (`frontend/public/images/macintosh-render.png`) to the current live model presentation.

Repository handoff: implementation checkpoint `e90b606` was fast-forwarded from `codex/review-tech-stack` into `main`, which is now checked out. No remote is configured. The research folders remain untracked; licensed source, Blender studies, and the exported model remain local and ignored. Preserve these local files when resuming or transferring the project.

The following priorities described the old checkpoint and have now received the implementation pass above; the interaction correction above governs future work:

1. Match the image's warm cream housing, soft highlights, lavender reflections, and darker glossy CRT. Controlled Blender studies indicate lighting and screen reflections are the main difference; existing authored normals are smooth, and bevel/normal-channel experiments did not improve the result.
2. Make the computer the main focus through its framing and a quieter headline. Current composition still places a large headline on the left and the computer on the right.
3. Add deliberate computer manipulation and a way to focus the monitor for its future interface. Only subtle pointer parallax and the atmosphere pause control exist at this checkpoint; direct rotation and monitor interaction remain unimplemented.

Comparison script: `assets/tools/compare_macintosh_surface.py`. Local studies are retained under `assets/source/macintosh-512k/work/macintosh-surface-*.png`; `baseline` and `glass` are useful starting references. The glass study uses roughness 0.14, coat weight 0.25, and a front-left softbox near screen height. These are Blender studies, not changes applied to the frontend or final GLB. No geometry rewrite is currently indicated.

## Selected 3D asset path

The user's strongest model choice is [Mac 512K Computer 1984 by shrednector](https://sketchfab.com/3d-models/mac-512k-computer-1984-5d6c93e4c5e840e6a5b6f2f88dde5604). The live page has no model download control. The user bought the matching model from [CGTrader](https://www.cgtrader.com/3d-models/electronics/computer/retro-mac-computer-80s) and supplied FBX/OBJ plus ten 4K texture maps. All twelve files were copied from `Desktop/Retro Mac 3D` with matching SHA256 hashes; the originals were not moved or edited.

Blender 5.2.1 LTS imported the FBX. Materials were reconnected and visually checked in a studio render. The editable source retains original geometry and full-resolution textures. A separate 4.41-MiB GLB keeps 25,146 triangles, merges static pieces into four model draws, and uses 2K color / 1K normal and packed data maps. The curved Screen mesh remains independent. Rebuild and inspection scripts live in `assets/tools/`.

Purchased source, working blends, and the GLB are ignored by Git. A clean checkout must restore/rebuild the licensed asset before displaying live 3D. Public deployment and asset distribution packaging are deferred with Netlify hosting.

## Reference context

- [Research review](../reviews/2026-09-06/RESEARCH-REVIEW.md)
- [User favorites](../reviews/2026-09-06/USER-FAVORITES.md)
- [Shader creator's implementation account](https://tympanus.net/codrops/2026/05/19/80s-business-tech-seamless-scene-transitions-inside-shader-ses-scroll-driven-webgpu-pipeline/)

These references explain the visual direction; their embedded recommendations do not override the user's selected scope.
