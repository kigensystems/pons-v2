# Opening scene assets

## Live Macintosh 512K

- File: `models/macintosh-512k.glb` (licensed local export; excluded from Git).
- Author: Shrednector / Shane Deptula.
- Purchased source: [Mac Computer 1984](https://www.cgtrader.com/3d-models/electronics/computer/retro-mac-computer-80s), supplied by the user as FBX/OBJ and ten texture files.
- Listing license: Royalty Free License (no AI). Model files were used locally for Blender processing and application rendering. They were not uploaded to an image generator or shared as source assets. The listing/source record is in `assets/source/macintosh-512k/README.md`; no license document was included in the supplied folder.
- Blender import and PBR reconnect: `assets/tools/prepare_macintosh.py`. Preserves the source and writes a separate web derivative.
- Web optimization: static meshes merged to four draws, 2K JPEG base color maps, 1K lossless normal and packed AO/roughness/metallic maps. Original geometry retained: 25,146 triangles, 4,623,224-byte GLB.
- CRT screen: separate `Screen` mesh with normalized UVs, replaced at runtime with an authored canvas texture and emissive material.
- Keep licensed source files out of public asset folders. Public deployment and distribution packaging remain deferred with Netlify hosting.

## Macintosh artwork

- File: `images/macintosh-render.png`, 1536 × 1024, RGBA, 1,770,883 bytes.
- Source: generated with OpenAI image generation on September 6, 2026, Pacific time, for this project. Copied without pixel edits from the generated output; original retained outside the repository.
- Direction: detailed compact 1984-era beige Macintosh with keyboard, mouse, blank curved CRT, warm key light, lavender rim light, transparent background.
- This is the loading/error fallback for the live model. It is rendered artwork, not a downloaded or reconstructed 3D model. Small object details are illustrative and are not a dimensional reference. Do not describe it as an exact historical replica.
- No third-party model or model license was used to produce this asset. No third-party license is asserted for the generated image. Apple/Macintosh marks depicted on the object are not the product's branding.

## Typography

- Files: `fonts/InstrumentSerif-Regular.ttf`, `fonts/InstrumentSerif-Italic.ttf`.
- Author: The Instrument Serif Project Authors.
- Source: [Google Fonts repository](https://github.com/google/fonts/tree/main/ofl/instrumentserif), downloaded September 6, 2026, Pacific time, unchanged.
- License: SIL Open Font License 1.1; accompanying copyright and license are preserved in `fonts/OFL.txt`.
- Self-hosted. The page makes no Google Fonts network requests.

## Procedural graphics

`images/mist.svg`, the inline grain filter, CRT overlays, and the small Macintosh line drawing are authored in this repository. The mist filter is static; CSS animates layer transforms rather than regenerating noise every frame. Motion starts paused for reduced-motion users and can be explicitly enabled with the atmosphere button.
