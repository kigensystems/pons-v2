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

## Initialization status

The repository contains a runnable React shell, TypeScript/build/lint tooling, and the scene libraries. The shell is explicitly a setup placeholder, not the requested finished scene. No 3D model, shaders, camera choreography, or final product copy have been implemented yet.

Initialization checks passed: TypeScript/production build, Oxlint, and a local HTTP response. The static shell was visually inspected at desktop and 390-pixel mobile width, with no browser errors or warnings observed. The configured Netlify output path resolves to the generated build. Netlify deployment, 3D rendering, and performance remain untested.

## Reference context

- [Research review](../reviews/2026-09-06/RESEARCH-REVIEW.md)
- [User favorites](../reviews/2026-09-06/USER-FAVORITES.md)
- [Shader creator's implementation account](https://tympanus.net/codrops/2026/05/19/80s-business-tech-seamless-scene-transitions-inside-shader-ses-scroll-driven-webgpu-pipeline/)

These references explain the visual direction; their embedded recommendations do not override the user's selected scope.
