# Launchpad page

Added September 7, 2026, Pacific time. First rough shape of the main page: a launchpad where a creator connects a wallet, launches a coin through Pons, and browses coins below.

## References

- Aesthetic: the About Us section of the [Shader site](https://www.shader.se/). Cream paper, dark serif headlines, small serif body, rainbow stripe rules, paper grain and faint scanlines, hard offset shadows.
- Layout: [StonkFun](https://www.stonkfun.xyz/), the [Pons explore page](https://www.ponsfamily.com/launchpad), and [Snowball Capital](https://snowballcapital.fun/). Compact top bar with search and connect, short hero with stat tiles, filter chips, dense card grid.
- Launch fields: the [Pons v2 launch form](https://www.ponsfamily.com/launchpad/create) as observed on September 7, 2026.

## Where it lives

- `frontend/src/launch/LaunchPage.tsx`: top bar, hero with stat tiles, explore section with filter chips, short how-it-works, footer. Holds sample wallet, launched coins, filter, and search state.
- `frontend/src/launch/LaunchForm.tsx`: the Create dialog. Compact two-column fields, a quote panel, and a Connect or Launch footer.
- `frontend/src/launch/TokenGrid.tsx`: card grid with ten placeholder coins. Sample launches appear first as queued. Filters: all, graduated, on the curve, stocks. Search matches name, ticker, or address.
- `frontend/src/launch/launch.css`: all styles for this page. Nothing in `index.css` changed. Headings set their own color because the opening scene's global `h1` rule paints cream.
- `frontend/src/main.tsx`: renders this page when the path starts with `/launch`, otherwise the opening scene. No router is installed.

Open `/launch` on the dev server. Promoting it to the root path is a one-line change in `main.tsx`.

## What is real and what is sample

- Connect toggles a sample address labeled as such. No wallet provider is wired.
- Create opens a native dialog. Launch needs the sample wallet, a name, and a ticker. It adds a queued card to the grid and closes. Nothing leaves the browser.
- The quote runs locally. Creator tax is clamped to 0 to 10 percent and added to the 1.00 percent base trade fee. Launch fee, trade fee, snipe window, graduation, and locked liquidity are copied from the Pons v2 form on the date above and labeled sample.
- Every card and stat tile is invented placeholder data and labeled as such. Card art is a generated tint with the ticker initials; no images are used.

## Validation

- `npm --prefix frontend run build` and `npm --prefix frontend run lint` pass.
- Visually inspected at 1280 wide, at the pane's 573 wide size, and at the 375 mobile preset. Six cards per row at 1280, two at 375. No horizontal overflow at 375.
- Create, fill name, ticker, and 2.5 percent creator tax: the quote shows 3.50 percent traders pay. Connect then Launch closed the dialog, added a queued card first in the grid, and moved the coins-launched tile to 1. Graduated and Stocks filters reduce the grid as expected.
- The browser pane's screenshots do not capture the dialog's top layer, so the dialog was checked through the DOM, not by eye.
- Not checked: reduced motion beyond the transition reset, screen reader flow, the browser file picker.
