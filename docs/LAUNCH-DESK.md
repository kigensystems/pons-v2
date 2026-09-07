# Launch desk

Added September 7, 2026, Pacific time. First rough shape of the token deployment page.

## What it is

The page where a creator deploys a token through Pons companion. It is modeled on the About Us section of the [Shader site](https://www.shader.se/): cream paper, dark serif headlines, two-column body copy, rainbow stripe dividers, and a dashed "cut along the dotted line" coupon that holds the form. The field list mirrors the [Pons v2 launch form](https://www.ponsfamily.com/launchpad/create) as observed on September 7, 2026. Product framing comes from `reports-examples/pons-complaints-deep-dive.md`: clarity and chain truth on top of Pons, not a rival pad.

## Where it lives

- `frontend/src/launch/LaunchPage.tsx`: masthead, dark hero with the still Macintosh render, about copy, ledger roadmap, footer.
- `frontend/src/launch/LaunchForm.tsx`: the coupon form and the receipt beside it. Receipt values derive from form state.
- `frontend/src/launch/launch.css`: all styles for this page. Nothing in `index.css` changed.
- `frontend/src/main.tsx`: renders this page when the path starts with `/launch`, otherwise the opening scene. No router is installed.

Open `/launch` on the dev server. Promoting it to the root path is a one-line change in `main.tsx`.

## What is real and what is sample

- Form state and the receipt math run locally. Creator tax is clamped to 0 to 10 percent and added to the 1.00 percent base trade fee.
- Launch fee, base trade fee, snipe window, graduation threshold, and locked liquidity are copied from the Pons v2 form on the date above. They are labeled as sample figures on the page.
- The Connect wallet button is disabled. No wallet, chain, API, or Pons contract is connected. Nothing is submitted anywhere.
- The ledger section is a roadmap list, labeled as such. No metric is measured.

## Validation

- `npm --prefix frontend run build` and `npm --prefix frontend run lint` pass.
- Visually inspected in the browser at 1280 wide, at 800 wide, and at the 375 mobile preset. Desktop shows the coupon and sticky receipt side by side. Below 900 wide the layout stacks and the masthead stops being sticky. No horizontal overflow on mobile.
- Typing a name, ticker, creator tax, and enabling holder fee sharing updated the receipt as expected.
- Not checked: reduced motion beyond the transition reset, screen reader flow, and the browser file picker.
