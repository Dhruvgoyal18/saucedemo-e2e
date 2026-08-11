# SauceDemo E2E Test Suite

End-to-end UI tests for [saucedemo.com](https://www.saucedemo.com) covering login, inventory, cart, and checkout, built with Playwright + TypeScript using the Page Object Model.

## Tech stack

- TypeScript
- [Playwright Test](https://playwright.dev/)
- Page Object Model (`src/pages/`)

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm install
npx playwright install chromium
```

## Running the tests

```bash
npm test              # runs headless by default (playwright.config.ts)
npm run test:headless # force headless
npm run test:headed   # force a visible browser window
```

Headed/headless mode is controlled by the `HEADLESS` environment variable (`playwright.config.ts` treats anything except the literal string `false` as headless). You can also set it directly instead of using the npm scripts:

```bash
HEADLESS=false npx playwright test      # bash/macOS/Linux
$env:HEADLESS="false"; npx playwright test   # PowerShell
```

Other useful invocations:

```bash
npx playwright test tests/login.spec.ts        # run one file
npx playwright test -g "locked out"            # run tests matching a name
npx playwright test --headed --workers=1       # debug visually, serially
```

## Test report

Every run produces:

- `reports/html-report/` — HTML report with a pass/fail summary (`npm run report` opens it)
- `reports/test-results/` — per-test screenshots (on failure), videos (on failure), and traces (on retry)

## Project structure

```
src/pages/            Page objects — one class per page/step
  LoginPage.ts
  InventoryPage.ts
  ProductDetailPage.ts
  CartPage.ts
  CheckoutPage.ts      CheckoutStepOnePage, CheckoutStepTwoPage, CheckoutCompletePage
tests/                 Specs, grouped by flow, each with a base describe block
                        and an "- edge cases" describe block
  login.spec.ts
  inventory.spec.ts
  cart.spec.ts
  checkout.spec.ts
playwright.config.ts
tsconfig.json
```

### Page object design notes

- Locators prefer `[data-test="..."]` attributes (or ARIA roles) over CSS classes/text, matching the selectors saucedemo exposes for test automation.
- Methods that move **forward** in a flow (e.g. `CartPage.proceedToCheckout()`, `InventoryPage.openProduct()`) return the next page object, so tests can chain naturally.
- Methods that move **backward** (Cancel, Back, Continue Shopping) return `void`; the test instantiates a fresh page object afterward if it needs to assert on the page landed on. This avoids circular imports between page object files.

## Test coverage

**Login** (`login.spec.ts`)
- Valid login redirects to inventory
- Invalid credentials show an error
- *Edge cases:* missing username / missing password / both missing, `locked_out_user`, username case-sensitivity, dismissing the error banner, direct URL access to `/inventory.html` while logged out

**Inventory** (`inventory.spec.ts`)
- All products displayed, sort by name (A–Z) and price (low–high), product detail page shows matching info
- *Edge cases:* sort by name (Z–A) and price (high–low), add/remove button state toggling, cart badge hidden when empty, badge clears after removing the only item, back-navigation from detail page preserves the list

**Cart** (`cart.spec.ts`)
- Add multiple products updates the badge, removing one updates it, cart page lists exactly what was added
- *Edge cases:* item quantity is always 1, "Continue Shopping" navigation, removing an item from the cart page itself (not just inventory)

**Checkout** (`checkout.spec.ts`)
- Full happy path through order confirmation, missing-field validation
- *Edge cases:* each required field (first name / last name / postal code) validated individually, Cancel from the info step and the overview step, subtotal + tax = total arithmetic check, cart is emptied and badge cleared after order completion

## Configuration

`playwright.config.ts`:
- `baseURL`: `https://www.saucedemo.com`
- `retries: 1` (one automatic retry on failure, with trace capture on that retry)
- `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`
- Reporters: `list` (console) + `html` (written to `reports/html-report`)
