# Macintosh 512K source files

The purchased FBX, OBJ, and ten texture PNGs were copied into `original/` from `Desktop/Retro Mac 3D`. All twelve SHA256 hashes matched. The desktop originals remain in place and untouched. Licensed files and receipts are excluded from Git; do not place credentials here.

- Selected reference: [Mac 512K Computer 1984 on Sketchfab](https://sketchfab.com/3d-models/mac-512k-computer-1984-5d6c93e4c5e840e6a5b6f2f88dde5604).
- Creator: Shrednector / Shane Deptula.
- Matching sale listing: [Mac Computer 1984 on CGTrader](https://www.cgtrader.com/3d-models/electronics/computer/retro-mac-computer-80s).
- Purchased files were provided and imported on September 6, 2026, Pacific time.
- Listing: FBX/OBJ, keyboard and mouse, two 4K texture sets, 13,364 polygons. These are seller specifications, pending file inspection. Sketchfab reports 25.1K triangles.
- Live listing displayed Royalty Free License (no AI), with $4.03 sale / $5.75 regular price. Preserve the actual purchase license with the source. Exact purchased revision and terms for web embedding still need inspection.

Outputs:

- `work/macintosh-512k-source.blend`: editable source with original mesh separation and packed 4K textures.
- `work/macintosh-512k-web-preview.blend`: optimized derivative and studio render setup.
- `work/macintosh-512k-material-check.png`: inspected Blender material render.
- `frontend/public/models/macintosh-512k.glb` from the repository root: 4,623,224 bytes, 25,146 triangles, four model draws, three materials. 2K base colors; 1K lossless normal and packed AO/roughness/metallic maps. No geometry decimation.
- `source-manifest.json`: original/copy hashes.

Rebuild using Blender 5.2.1: `blender --background --python assets/tools/prepare_macintosh.py` from the repository root. Validate with `node assets/tools/inspect_macintosh_glb.mjs`. Scripts are tracked; licensed source and web binaries remain local. A clean clone needs the purchased files copied into `original/` and the GLB regenerated before it can display the live model.
