## Product Search & Inventory Lookup (mobile-first)

A single-page app at `/` with a search box, live typeahead dropdown, and a detail card. No database — data comes from a placeholder Power Automate webhook, with mock data used as a fallback until the real URL is set.

### Screens / behavior
- Centered column, `max-w-[480px]`, generous touch targets, sticky search header.
- Typing ≥1 character triggers a debounced (300ms) search; a small spinner shows inside the input's right edge while in flight.
- Dropdown lists matches: product description (bold) plus MPN and brand as secondary line. Empty state ("No matches") and error state ("Couldn't reach the catalog — showing offline results").
- Selecting a row closes the dropdown, fills the input with the product name, and renders the Product Card.
- Product Card fields: ProductDesc (large/bold heading), brand badge, MPN, Price List2021 (currency-formatted), Lotsize, Quantity 01-ST, Quantity 01plus03. Quantities shown as two stat tiles; the rest as a labeled key/value list. Stock badge (In stock / Low / Out) derived from `01-ST`.
- Click-outside and Escape close the dropdown; arrow keys + Enter navigate results.

### Technical details
- `src/lib/products.ts` — `Product` type, the 3-row mock array, and a local filter helper (matches MPN, ProductDesc, Product No.).
- `src/lib/search-api.ts` — `searchProducts(query, signal)` doing `fetch(WEBHOOK_URL, { method: 'POST', body: JSON.stringify({ searchQuery: query }) })`. Constant `WEBHOOK_URL = "YOUR_POWER_AUTOMATE_WEBHOOK_URL"` at the top with a comment explaining where to paste the real URL. When the URL is still the placeholder (or the request fails), it resolves with the filtered mock array after a short simulated delay, so the UI is fully usable now. Response normalization tolerates either a bare array or `{ value: [...] }`.
- `src/hooks/use-debounced-value.ts` — 300ms debounce; in-flight requests aborted via `AbortController` so stale responses can't overwrite newer ones.
- `src/routes/index.tsx` — replaces the placeholder index page; holds query/results/selected state and composes `SearchBar`, `ResultsDropdown`, `ProductCard` components under `src/components/`.
- Styling with existing Tailwind v4 semantic tokens; add a small industrial-leaning accent palette + type scale to `src/styles.css` (no hardcoded color utilities).
- Route `head()` with an app-specific title/description/og tags.
