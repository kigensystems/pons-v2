# Apple Garamond

September 7, 2026. Requested font update; screenshots document implementation, not user design approval.

Apple Garamond replaces Georgia and Instrument Serif across the opening, loader title, Explore, About, navigation, editorial copy, cards and form controls. The shared `--font-serif` token supplies the family; regular, italic, bold and bold italic are self-hosted. VT323 terminal labels remain. Existing font sizes, line heights, colors, glow, spacing and page behavior are retained. Earlier Instrument Serif files and licenses remain in the repository.

[Asset provenance and license status](../frontend/public/ASSETS.md#apple-garamond--september-7-2026) records the download, embedded copyright, unchanged source bytes and unverified public-use rights. Public deployment remains deferred.

## Validation

- Production build/TypeScript, lint and whitespace checks passed. No dependency changes or behavioral code edits; behavioral tests were not rerun for this font-only change.
- Rebuilt and reloaded the existing production preview at `http://127.0.0.1:4173/`. Browser font loading checks confirmed all four Apple Garamond faces loaded, and computed headings use the new family.
- Compared all three pages before/after at 1440 × 900 and 390 × 844 at normal size; revisited live Shader for the existing luminous typography reference. The new narrower letterforms are visibly distinct. Headlines, body copy and navigation fit. Desktop and mobile card grids and creation forms at both sizes were inspected; focus remained visible and closing the dialog returned focus to Create.
- Existing paused TV state retained for opening captures; the same visible picture is shown in each pair. No new lighting, playback or performance claims.
- Browser-exported JPEG raster dimensions reflect scrollbar/display scaling; CSS viewports match within each before/after pair.

## Comparisons

| Page | Desktop before / after | Mobile before / after |
| --- | --- | --- |
| Opening | [Before](screenshots/garamond-before-opening-desktop.jpg) · [After](screenshots/garamond-after-opening-desktop.jpg) | [Before](screenshots/garamond-before-opening-mobile.jpg) · [After](screenshots/garamond-after-opening-mobile.jpg) |
| Explore | [Before](screenshots/garamond-before-explore-desktop.jpg) · [After](screenshots/garamond-after-explore-desktop.jpg) | [Before](screenshots/garamond-before-explore-mobile.jpg) · [After](screenshots/garamond-after-explore-mobile.jpg) |
| About | [Before](screenshots/garamond-before-about-desktop.jpg) · [After](screenshots/garamond-after-about-desktop.jpg) | [Before](screenshots/garamond-before-about-mobile.jpg) · [After](screenshots/garamond-after-about-mobile.jpg) |

[Mobile creation form](screenshots/garamond-create-mobile.jpg).
