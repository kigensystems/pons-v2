# Opening scene assets

## Reuse in Plum's Explore and About pages

The initial September 7 Explore/About implementation reused the existing Macintosh artwork and self-hosted Instrument Serif and VT323 fonts described below. The later Apple Garamond update now applies only to page and section titles; the earlier body and supporting fonts are restored. The artwork file is unchanged; About used CSS grading over a dark green background until September 7 night, when its picture became the photograph recorded below. Explore's hero used the same artwork with sepia grading and multiply blending until September 7, when it was replaced by the CRT close-up recorded below. Paper grain and the muted color rule are authored CSS/SVG effects. No additional third-party assets were adopted. The generated coin illustration trial was rejected and is not included in the application.

## Monitor channels

The active image-based opening and preserved 3D scene share the same renderer-independent playback controller. The image version fits its 640 x 480 canvas into the artwork's glass with an SVG clip/transform. An exposure curve and small highlight diffusion are applied directly to that canvas's SVG rendering, clipped inside the glass. An 8 x 6 sampled average drives keyboard light; a luminance mask derived at runtime from the unchanged artwork preserves dark key gaps and legends. The earlier 160 x 120 bloom copy, painted edge glow, and casing wash were removed following user feedback. These are runtime composites; no source video or computer-image pixels were rewritten.

- Files: `videos/channels/channel-01.mp4` through `channel-04.mp4`, and `videos/channels/channel-poster.jpg`.
- Source: four user-supplied MP4 clips from the desktop `vlad-clips` folder, supplied for this local opening-scene study on September 7, 2026. The desktop originals are unchanged.
- Author, original publication source, license, attribution requirements, and redistribution rights were not supplied and remain unknown. No public-use license is asserted. Public deployment and distribution remain deferred.
- All originals contain 1920 × 1080 H.264 video and AAC audio. The table preserves their filename order and measured original durations.

| Runtime file | User-supplied source filename | Original duration | Runtime duration | Runtime bytes |
| --- | --- | ---: | ---: | ---: |
| `channel-01.mp4` | `0cocnhGklPs-19m00s-19m12s.mp4` | 12.000 s | 12.000 s | 727,922 |
| `channel-02.mp4` | `KJ_dtGyqNP8-52m30s-52m40s.mp4` | 10.010 s | 10.000 s | 524,526 |
| `channel-03.mp4` | `sDTqwDeOBPI-13m43s-13m55s.mp4` | 12.012 s | 12.000 s | 539,644 |
| `channel-04.mp4` | `vlad-02m25s-02m35s.mp4` | 10.010 s | 10.000 s | 413,997 |

- Optimization: FFmpeg/libx264, 768 × 432 preserving 16:9 proportions, 30 fps, CRF 24, slow preset, `yuv420p`, AAC audio at 80 kbit/s, and MP4 fast-start metadata. Original frame rates were 30, 30000/1001, 60000/1001, and 30000/1001 fps respectively; the small duration differences above follow frame-rate normalization. The audio tracks are retained in the derivatives; runtime playback controls determine whether they are audible.
- Reproduction: `ffmpeg -i INPUT -map 0:v:0 -map 0:a:0? -vf "scale=768:-2,fps=30" -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -c:a aac -b:a 80k -movflags +faststart OUTPUT`.
- Play order: channel-04, then 02, 03, 01 (the user's priority, set in `src/monitorPlayback.ts`), not file order.
- Poster: opening frame of `channel-04.mp4`, the first channel shown, taken with macOS Quick Look (`qlmanage -t -s 768`) and saved by sips as a 768 × 432 JPEG at quality 85 (75,013 bytes) on September 7, 2026. It replaced the earlier channel-01 frame when the play order changed.
- Media validation: FFprobe confirmed H.264/yuv420p, AAC, 768 × 432, and 30 fps for each derivative. FFmpeg decoded every complete derivative without reported errors. Browser playback and the screen presentation require separate runtime validation.

## Live Macintosh 512K

- File: `models/macintosh-512k.glb` (licensed export tracked in this private repository for the owner's other-PC use; the Netlify build command removes `dist/models`, so it is not published).
- Author: Shrednector / Shane Deptula.
- Purchased source: [Mac Computer 1984](https://www.cgtrader.com/3d-models/electronics/computer/retro-mac-computer-80s), supplied by the user as FBX/OBJ and ten texture files.
- Listing license: Royalty Free License (no AI). Model files were used locally for Blender processing and application rendering. They were not uploaded to an image generator or shared as source assets. The listing/source record is in `assets/source/macintosh-512k/README.md`; no license document was included in the supplied folder.
- Blender import and PBR reconnect: `assets/tools/prepare_macintosh.py`. Preserves the source and writes a separate web derivative.
- Web optimization: static meshes merged to four draws, 2K JPEG base color maps, 1K lossless normal and packed AO/roughness/metallic maps. Original geometry retained: 25,146 triangles, 4,623,224-byte GLB.
- CRT screen: separate `Screen` mesh with normalized UVs. Its runtime material uses an authored canvas texture for emission, with independent dark reflective glass and clearcoat. Runtime softboxes are baked into a small environment map; licensed source geometry and maps are unchanged.
- Keep licensed source files out of public asset folders. Public deployment and distribution packaging remain deferred with Netlify hosting.

## Plum mark

- File: `images/plum-mark.png`, 256 × 256, RGBA, 99,446 bytes.
- Source: the user's own logo render, `assets/reference/plum-mark-source.png` (1254 × 1254), centre-cropped to 1000 px and downscaled with sips on September 7, 2026. The glow is baked into the pixels; pages add a CSS halo on dark ground and multiply it on paper.
- Authored for this project by the user. No third-party mark or Shader asset was copied.

## Loader mark

- File: `images/loading-mark.png`, 320 × 320, RGBA, 149,353 bytes.
- Source: the user's bone-coloured render of the mark with cyan and pink fringe, `assets/reference/loading-mark-source.png` (1254 × 1254), centre-cropped to 1000 px and downscaled with sips on September 7, 2026. Used only on the boot screen. Authored for this project by the user.

## CRT close-up (Explore)

- File: `images/crt-close.jpg`, 983 × 780, sRGB JPEG (quality 84), 151,703 bytes.
- Source: the user's `explore-monitor.png` (1448 × 1086 RGB render of a compact Macintosh front on a checkerboard), supplied at the repository root on September 7, 2026 and kept there untracked. Cropped with sips to the screen and bezel (offset 232, 62 from the top left) and re-encoded as JPEG; no other pixel edits.
- Author, generator, and license were not supplied and remain unknown. No public-use license is asserted; public deployment remains deferred.
- Use: the Explore hero. The bezel multiplies onto the paper; the newest coin's logo or initials are drawn over the glass in CSS. Nothing in the file itself changes at runtime.

## About photograph

- File: `images/about-banner.jpg`, 1800 × 600, sRGB JPEG (quality 82), 231,316 bytes.
- Source: the user's three-person photograph, `assets/reference/loading-banner-source.png` (2172 × 724; the same bytes as the `banner.png` the user placed at the repository root on September 7, 2026). Downscaled and re-encoded with sips on September 7, 2026; no crop or other pixel edit.
- Author, generator, and license were not supplied and remain unknown. No public-use license is asserted; public deployment remains deferred.
- Use: the About page's picture, full bleed under the header, multiplied onto the paper with a CSS bloom, canvas grain and a vignette. Mobile shows a 16:9 centre crop through `object-fit`.

## Macintosh artwork

- File: `images/macintosh-render.png`, 1536 × 1024, RGBA, 1,770,883 bytes.
- Source: generated with OpenAI image generation on September 6, 2026, Pacific time, for this project. Copied without pixel edits from the generated output; original retained outside the repository.
- Direction: detailed compact 1984-era beige Macintosh with keyboard, mouse, blank curved CRT, warm key light, lavender rim light, transparent background.
- The September 7 image comparison uses this unchanged file as the opening's main artwork. It also remains the fallback in the preserved live-model implementation. It is rendered artwork, not a downloaded or reconstructed 3D model. Small object details are illustrative and are not a dimensional reference. Do not describe it as an exact historical replica.
- No third-party model or model license was used to produce this asset. No third-party license is asserted for the generated image. Apple/Macintosh marks depicted on the object are not the product's branding.

## Typography

### Apple Garamond — September 7, 2026

- Current title family for page and section headings across the opening, Explore and About, plus the loader title. The user clarified titles only; Georgia body copy/navigation/Plum naming, Instrument Serif editorial details/cards and VT323 terminal labels are restored.
- Files: `fonts/AppleGaramond.ttf` (47,476 bytes), `fonts/AppleGaramond-Italic.ttf` (46,560 bytes), `fonts/AppleGaramond-Bold.ttf` (47,264 bytes), `fonts/AppleGaramond-BoldItalic.ttf` (45,724 bytes). Regular and italic at 400; bold and bold italic at 700. Self-hosted with `font-display: swap`; regular is preloaded.
- Source: [DaFont Apple Garamond listing](https://www.dafont.com/apple-garamond.font), [six-font ZIP](https://dl.dafont.com/dl/?f=apple_garamond), retrieved September 7, 2026. Four faces copied byte-for-byte; no conversion, subsetting, outline, metadata or naming modifications. Light faces were not adopted.
- Attribution: embedded copyright names Bitstream Inc. (1991); individual designer not identified in the files. Exact copyright: "Copyright 1991 as an unpublished work by Bitstream Inc.  All rights reserved.  Confidential."
- License: the downloaded archive contains no license document and the listing supplies no usage grant. Public web use and redistribution rights remain unverified; no open license is claimed. Font metadata's `fsType = 0` is a technical embedding flag, not evidence of a license. This is the existing private/local prototype; public deployment remains deferred.

### Supporting fonts

- Files: `fonts/InstrumentSerif-Regular.ttf`, `fonts/InstrumentSerif-Italic.ttf`.
- Author: The Instrument Serif Project Authors.
- Source: [Google Fonts repository](https://github.com/google/fonts/tree/main/ofl/instrumentserif), downloaded September 6, 2026, Pacific time, unchanged.
- License: SIL Open Font License 1.1; accompanying copyright and license are preserved in `fonts/OFL.txt`.
- Self-hosted. The page makes no Google Fonts network requests.

- Loading-screen terminal copy: `fonts/VT323-Regular.ttf`, by The VT323 Project Authors (Peter Hull). Source: [Google Fonts VT323 directory](https://github.com/google/fonts/tree/main/ofl/vt323), downloaded unchanged for the September 6 loading-screen refinement (153,116 bytes). SIL Open Font License 1.1; copyright and redistribution terms retained in `fonts/VT323-OFL.txt`. Self-hosted and preloaded. The loader's heavier italic title now uses the bundled Apple Garamond Bold Italic face; no Shader font or logo was copied.

## Procedural graphics

`images/mist.svg`, the inline grain filter, CRT content, softbox environment, and the small Macintosh line drawing are authored in this repository. The mist filter is static; the preserved scene can animate layer transforms rather than regenerating noise every frame. The active image comparison keeps all atmosphere motion paused and exposes no animation controls. The preserved 3D implementation supports reduced motion and keyboard playback.

### ChicagoFLF — September 7, 2026

- Control face for the Enter key, TV controls, Back to top, card badges, status code, and the loader copy, replacing VT323. Token `--font-ui` in `src/index.css`. Kickers and labels use Apple Garamond in tracked capitals.
- File: `fonts/ChicagoFLF.ttf` (50,472 bytes, SHA-256 `b442111f37639e27572d9df0c5190e7480e6a7b01ec768aea47a154efab8d50d`), with the package README as `fonts/ChicagoFLF-README.txt`.
- Author: Robin Casady (Casady & Greene), after Susan Kare's Chicago for Apple; version 2.0 metadata and Unicode repositioning by the Open Font Library uploader.
- License: public domain, per the designer's statement reproduced in the README. Source: [Open Font Library](https://fontlibrary.org/en/font/chicagoflf), `chicagoflf.zip`, retrieved September 7, 2026, unchanged.
- Same day, after approval: Instrument Serif and VT323 files and their OFL texts removed from `fonts/`. Their provenance entries below are historical.

## Favicon

- `favicon.ico`: supplied by the user on September 7, 2026 (16 × 16 and 32 × 32, 32-bit). Placed unchanged; linked from `index.html`.
