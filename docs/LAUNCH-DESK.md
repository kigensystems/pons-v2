# Plum — Explore and About

Updated September 7, 2026. Current implementation and handoff; visual inspection is not user design approval.

## Integration and scope

The reviewed `feature/launch-desk` branch was fast-forwarded from `decff68` to `f032924` and pushed to `main`. GitHub returned no pull requests for this repository, including an all-state query, so there was no PR to merge or close. Main was never rebased or force-pushed. The original feature passed build, lint, and all 24 existing tests before integration.

The user subsequently selected **Plum** as the name, asked for refinement of both Explore and About, and clarified that our existing design leads: Shader is a reference, not a template. Generated coin artwork was rejected; it is not used, and further generation is paused.

## Pages and code

- `/`: the existing opening, with Plum naming and links to Explore/About. Only the header, loader name, metadata, and a small navigation stylesheet changed. TV playback, composited lighting, scene artwork, and the retained Three.js implementation are untouched.
- `/explore`: the collection, search, four filter chips, a one-line collection status, and native creation dialog. `/launch` remains an exact-path alias; trailing slashes work. No router dependency was added.
- `/about`: a dark green opening with the existing Macintosh, followed by the story, principles, prototype note, and an Explore link.
- `frontend/src/launch/LaunchPage.tsx` exports `ExplorePage`. The existing directory is retained for continuity with Claude's feature. `PaperChrome.tsx` provides shared navigation/footer; `TokenGrid.tsx` holds the sample collection; `LaunchForm.tsx` owns the creation dialog; `launchModel.ts` contains the illustrative quote calculation.
- `frontend/src/about/` holds the About component and scoped styles. `index.css` is unchanged. No dependency or hosting configuration changes.

## Design decisions

The user clarified Apple Garamond for titles only; see [Typography](TYPOGRAPHY.md#current-titles-only) for the current treatment, comparisons and font provenance.

Retain the six-column desktop card layout and two-column mobile layout. Give it calmer spacing, clear name/ticker hierarchy, square muted placeholder art, and comfortable search/filter controls. The hero figure is a close crop of the Macintosh CRT (`frontend/public/images/crt-close.jpg`) showing the newest coin the way a card does: its logo, or two-letter initials in phosphor Garamond, over dark glass, with a ChicagoFLF NO SIGNAL whenever there is no coin to show (empty collection, loading, or registry unreachable) and a caption naming the coin. It is live data, so it also shows on mobile, replacing the earlier decorative Macintosh that mobile omitted.

Use self-hosted Apple Garamond for titles, body, and tracked-capital labels, and ChicagoFLF for controls (superseding the earlier Georgia, Instrument Serif, and VT323 roles on September 7), with warm paper, green ink, restrained plum accents, and a thin muted color rule. Static grain, very faint scanlines, and restrained color fringing support the material without distorting controls. About's asymmetric Macintosh scene connects to our existing opening; its editorial layout and copy are original. The [live Shader About reference](https://www.shader.se/#about-us) and the repository's [user favorites](../reviews/2026-09-06/USER-FAVORITES.md) informed the review.

The first rendered pass was revised to compact Explore's hero, improve small-label legibility using our existing terminal font, and focus the Name field when the dialog opens. The final cross-page comparison aligned the main headlines and Plum name with the opening's Georgia treatment. Desktop and mobile were inspected at normal size. Existing artwork/fonts are reused without file edits; [provenance](../frontend/public/ASSETS.md) records the CSS treatment.

## Prototype behavior

- Future live Explore membership is limited to launches created through **Plum**, per the user's September 7 clarification. Provider recommendations and the proposed verified launch registry are in [Plum integration direction](PLUM-INTEGRATION.md); the current grid is still sample data.
- All ten coins, prices, changes, curve states, addresses, and statistics are examples. No live market requests, wallet provider, signing, trading, deployment, fee claiming, or chain integration exists.
- Search matches name, ticker, or displayed sample address, ignoring case and surrounding whitespace. Filters and search combine; empty results offer a working reset.
- Connect enables a clearly labeled local demo state. Connecting does not submit a completed form. Add demo coin is a separate action.
- Name and alphanumeric ticker are required; description and local image are optional. Images accept PNG/JPG/WebP/GIF up to 2 MB, with a preview and validation errors. Nothing is uploaded to a service.
- Added coins use unique IDs so repeated tickers coexist. They appear first as **Your demo**, with no invented market values or deployed state. Creation resets filters/search so the result is visible. Demo entries are excluded from the sample curve filter.
- The illustrative quote preserves both currencies for non-ETH initial buys. For example, 25 USDG plus the sample creation fee displays `0.0005 ETH + 25 USDG`. Gas is explicitly not estimated. The numbers are not represented as current Pons fees.
- Demo entries and the connection live only in component memory. Leaving Explore or reloading clears them. Unsupported social/holder-sharing fields and unverified liquidity/graduation claims from the scaffold were removed.
- Native modal behavior, explicit initial focus, Escape dismissal, focus restoration, scroll locking, visible focus rings, and result announcements support keyboard use. Textures are static; reduced motion removes transitions. Neither new page starts a TV or render loop.

## Validation

- Build and lint pass without warnings. All 27 Node tests pass, including three new tests covering mixed-currency totals, tiny buys, and non-finite/bounded inputs.
- Existing production preview at `http://127.0.0.1:4173/` reused throughout, rebuilt and reloaded after edits.
- Desktop at 1440 × 900 and mobile at 390 × 844: both pages, editorial content, footer, grid, and creation dialog inspected. Additional 320px-width checks found no document overflow on either page.
- Filters return 10 All / 5 Graduated / 5 On the curve / 2 Stocks. Case/whitespace search, empty state, reset, and result counts checked in the browser.
- Desktop and mobile demo creation checked. Verified connection keeps a populated form open before explicit submission, duplicate symbols remain separate, counters update, Escape dismisses, and focus returns to the opening button. Forward/backward keyboard movement inside the form checked; this is not a screen-reader audit.
- Reduced-motion emulation reports zero button transition duration, and the override was cleared afterward. No browser warning/error logs were reported during the checked flows.
- **Not verified end to end:** selecting a local image through the file picker. The Chrome extension returned `Not allowed` when setting the chosen file; its documentation points to the file-URL permission. The application validation/preview code is present, but no successful picker test is claimed. No real wallet/chain test applies to this prototype.

## Screenshots

The Explore before/after pairs use matching CSS viewports (1440 × 900 and 390 × 844). The browser exports JPEG captures with slightly different raster dimensions after scrollbar and display scaling; these are normal-size visual comparisons, not pixel-diff inputs. About is newly created, so its screenshots document the implementation rather than a prior-page comparison.

| View | Before | Current |
| --- | --- | --- |
| Explore desktop | [Scaffold](screenshots/explore-before-desktop.jpg) | [Opening view](screenshots/explore-after-desktop.jpg) · [Grid](screenshots/explore-grid-desktop.jpg) |
| Explore mobile | [Scaffold](screenshots/explore-before-mobile.jpg) | [Opening view](screenshots/explore-after-mobile.jpg) · [Grid](screenshots/explore-grid-mobile.jpg) |
| About desktop | New page | [Opening view](screenshots/about-after-desktop.jpg) · [Story](screenshots/about-story-desktop.jpg) |
| About mobile | New page | [Opening view](screenshots/about-after-mobile.jpg) · [Story](screenshots/about-story-mobile.jpg) |
| Create | Revised dialog | [Desktop](screenshots/create-desktop.jpg) · [Mobile](screenshots/create-mobile.jpg) |
| Opening | Naming and navigation only | [Desktop](screenshots/plum-opening-desktop.jpg) · [Mobile](screenshots/plum-opening-mobile.jpg) |

No deployment was performed. Work continues on `main`. The About page was rewritten on September 7; see [Shader About study](SHADER-ABOUT-STUDY.md) for the treatment it ports.
