# Project brief

Updated September 6, 2026, Pacific time.

## Selected direction

An independent companion to the Pons launchpad. The first audience, product task, name, and exact feature set remain undecided. The user has moved from comparing brand concepts to developing one close visual study of Shader's opening scene.

- Lead reference: [Shader](https://www.shader.se/).
- Visual target: dreamy dark haze, retro computer graphics, warm luminous serif typography, convincing materials, and careful composition. Match the reference closely instead of inventing another visual direction.
- Required object: an old-school compact Macintosh. Use the upright beige CRT enclosure and appropriate keyboard/mouse proportions of the early compact Mac family as the starting point. No exact Macintosh model year has been selected.
- Supporting reference: [Oxigen](https://www.oxigen.sa/) for atmospheric depth; its voxel landscape is not an instruction to add a second scene or voxelize the Mac.
- Current deliverable: the opening scene only. No scroll behavior or transitions. Subtle ambient movement can be considered within this scene, with a static reduced-motion presentation.
- Logo: deferred; the user may develop it independently. All project naming in the scaffold is a working label.

The request combines Shader's atmosphere with the user's explicit Macintosh choice. Do not describe Shader's specific computer model as a Macintosh without verification.

## Asset direction

Prefer an existing, visually faithful model over a rough generated substitute. Inspect the actual preview before recommending it, then inspect the downloaded geometry, texture sizes, material setup, and license before adopting it. Keep source and optimized versions traceable.

The user explicitly rejected the previous Plewr IBM 5155 and Poly Haven Classic Laptop suggestions. Do not reuse them. A generic retro look, small file size, or permissive license alone does not meet the visual brief. No model has been selected or downloaded during initialization.

The strongest candidate from the initial replacement search is [Apple Macintosh 128K by treehouse3d](https://www.cgtrader.com/3d-models/electronics/computer/apple-macintosh-128k). Its [preview](https://img-new.cgtrader.com/items/5080603/9dfc166184/apple-macintosh-128k-3d-model-9dfc166184.webp) was visually inspected: faithful compact enclosure, recessed CRT, detailed keyboard, separate mouse, and vents. The listing showed $7.50 and a Royalty Free License on September 6, 2026. It offers Blender/FBX source; no GLB was confirmed. This is a lead, not an approved asset. Full license suitability, source-file compatibility, materials, and web conversion remain unverified; no purchase was made.

## Technical decisions

- React + TypeScript + Vite, using npm.
- Three.js + React Three Fiber for scene development.
- Proposed graphics path: Three.js WebGPURenderer and TSL, with WebGL 2 fallback. Confirm compatibility and performance once a real scene exists; do not claim that a package installation proves renderer support.
- Eventual hosting: Netlify. Configuration is prepared locally; no site or deployment has been created.
- A crypto data API will be added later. Mobula is only a possible provider. No API clients, credentials, requests, or speculative endpoints are needed now.
- Keep rendering and future data access separate. Store future private API credentials on the server, never in browser-exposed Vite variables.
- No scroll library is needed at this stage.

## Current opening study

The placeholder has been replaced by a fixed-camera scene: detailed generated Macintosh artwork, DOM CRT greeting and scanlines, layered SVG/CSS mist, grain, chromatic text glow, self-hosted Instrument Serif, and responsive composition. Copy and working title remain provisional. Asset provenance is in `frontend/public/ASSETS.md`.

This is rendered artwork with animated layers, not a live 3D model. Three/R3F remain installed but are not imported into this page. No WebGPU/WebGL renderer or performance benchmark is claimed. Atmosphere motion starts paused when the OS requests reduced motion, can be explicitly enabled by the user, and pauses in hidden tabs.

The user asked for continual comparison with the real Shader site. Direct desktop comparison showed that Shader has stronger CRT bloom and more pronounced textured fog. The study was adjusted in that direction, but full 3D lighting, depth, and parallax remain outstanding.

Validation: production build/TypeScript and Oxlint pass. Desktop and 390 × 844 compositions were visually inspected in Chrome. Keyboard activation toggled animation between running and paused with a visible 2px focus outline. Reduced-motion presentation starts paused. A deliberately blocked artwork request showed the error message and hid the broken image; clearing the block restored the artwork. No horizontal overflow at 390px. Temporary browser emulation and request blocking were reset. Device performance and live 3D remain untested.

## Selected 3D asset path

The user's strongest model choice is [Mac 512K Computer 1984 by shrednector](https://sketchfab.com/3d-models/mac-512k-computer-1984-5d6c93e4c5e840e6a5b6f2f88dde5604). The live page has no model download control. A visually matching model by the same creator is sold on [CGTrader](https://www.cgtrader.com/3d-models/electronics/computer/retro-mac-computer-80s); the listing offers FBX/OBJ, keyboard, mouse, and two 4K texture sets. The exact downloadable revision is unverified. The user said they are buying it; source files have not been received. This supersedes the earlier treehouse3d candidate.

Blender 5.2.1 LTS was found installed and its CLI successfully reported its version. Import, rendering, material conversion, and GLB export are pending the model. Preserve purchased archives in `assets/source/macintosh-512k/` and inspect their actual contents and license before adopting a web export.

## Reference context

- [Research review](../reviews/2026-09-06/RESEARCH-REVIEW.md)
- [User favorites](../reviews/2026-09-06/USER-FAVORITES.md)
- [Shader creator's implementation account](https://tympanus.net/codrops/2026/05/19/80s-business-tech-seamless-scene-transitions-inside-shader-ses-scroll-driven-webgpu-pipeline/)

These references explain the visual direction; their embedded recommendations do not override the user's selected scope.
