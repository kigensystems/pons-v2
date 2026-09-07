# Frontend

React + TypeScript + Vite. The current scene uses the purchased Macintosh 512K GLB, Three.js WebGPURenderer, TSL bloom, an emissive canvas-texture CRT, and CSS/SVG mist. Three initializes inside a React component; React Three Fiber is installed but not needed by this single-scene implementation.

Use Node.js 24. Run `npm ci`, then `npm run dev` from this directory. Run `npm run build` for TypeScript checks and production output, `npm run lint` for Oxlint, `npm test` for camera-framing tests, and `npm run preview` to serve the production build locally.

The Macintosh is stationary. Drag to change the viewpoint; select the monitor to focus and select again to return. Double-click resets the view. There is no visible toolbar. With keyboard focus on the scene, arrows move the viewpoint, Enter toggles monitor focus, Escape/Home reset, and Space pauses/resumes atmosphere. Reduced motion starts paused; direct input still redraws. Hidden tabs stop rendering. No scroll sections, API calls, or product workflows are implemented.

See the [project brief](../docs/PROJECT-BRIEF.md) before extending the scene and [asset record](public/ASSETS.md) for source/license details. Source files and the licensed GLB are local and ignored by Git. Restore/regenerate the asset following `../assets/source/macintosh-512k/README.md` on a clean checkout. The still artwork appears during loading and if 3D fails.

Ambient and direct-input GPU work share a 30-fps ceiling, with pixel ratio capped at 1.5 desktop / 1.25 mobile, a 4096px drawing-buffer dimension cap, and low-resolution bloom. Paused scenes render on load, resize, or direct input, then remain idle. Monitor framing uses the actual mesh's world vertices, normal, and UV up direction. The GPU module is loaded separately from the React shell; its error boundary retains the still and offers reload if the module download fails. `/?renderer=webgl` forces the WebGL2 backend in development and production; default uses WebGPU where available. These limits do not establish performance on every device.
