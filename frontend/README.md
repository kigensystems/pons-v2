# Frontend

React + TypeScript + Vite. The current scene uses the purchased Macintosh 512K GLB, Three.js WebGPURenderer, TSL bloom, an emissive canvas-texture CRT, and CSS/SVG mist. Three initializes inside a React component; React Three Fiber is installed but not needed by this single-scene implementation.

Use Node.js 24. Run `npm ci`, then `npm run dev` from this directory. Run `npm run build` for TypeScript checks and production output, `npm run lint` for Oxlint, and `npm run preview` to serve the production build locally.

The atmosphere button pauses/resumes all ambient animation. Reduced motion starts paused; the user can explicitly enable it. Hidden tabs pause animation. The scene has responsive desktop/mobile compositions and an artwork failure message. No scroll sections, API calls, or product workflows are implemented.

See the [project brief](../docs/PROJECT-BRIEF.md) before extending the scene and [asset record](public/ASSETS.md) for source/license details. Source files and the licensed GLB are local and ignored by Git. Restore/regenerate the asset following `../assets/source/macintosh-512k/README.md` on a clean checkout. The still artwork appears during loading and if 3D fails.

GPU work is capped at 30 frames per second for ambient motion, with pixel ratio capped at 1.5 desktop / 1.25 mobile and low-resolution bloom. Paused/reduced-motion/hidden scenes render only when needed (initial load or resize). The GPU module is loaded separately from the React shell. Development-only `/?renderer=webgl` forces the WebGL2 backend for fallback testing; default uses WebGPU where available. These are resource controls, not a cross-device performance guarantee.
