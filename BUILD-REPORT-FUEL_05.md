# Build report, FUEL_05 Multiplacement UGC

Branch `test/fuel-05-multiplacement-ugc`. Written 2026-08-27 after the check pass against
a Shopify development theme preview (`shopify theme dev`, theme id 152115904582, store
globisoft.myshopify.com). The live theme was not touched at any point.

## Read this first: two blockers found on real Shopify

1. **The home placement cannot upload as built.** The home template is at Shopify's hard
   limit of 25 sections (13 of them disabled leftovers the client keeps). Our video row
   was built as its own section, number 26, and Shopify rejects the whole template, which
   blocks every FUEL_05 placement from uploading, not just the home one. Fisnik decided
   to hand off as built and let the team choose the fix. Both options and effort
   estimates are in `../tryscent-handoff-2026-08-26/QUESTIONS-FOR-FISNIK.md`. Until one
   is done, hold back `templates/index.json` when pushing (one `--only` per file makes
   this easy) or the push fails.
2. **The client is already running an Intelligems experiment on Best Sellers, mobile.**
   It redirects phone sessions to an alternate template view, `collection-lander-v2`.
   Our tiles live on the assigned template, `collection-lander-v1`. Phone sessions their
   experiment sends to v2 will never see our collection tiles, which pollutes the FUEL_05
   test. Korana must rule: put the tiles in both templates, or end that experiment before
   this test starts. Verified by watching the redirect fire
   (`?view=collection-lander-v2#ig-redirect-session=...`) and by the tiles rendering
   correctly the moment the Intelligems script is kept out.

## What was built

One video card component and one row component, placed three ways: a row between the two
product carousels on the home page, a compact row on the product page (under the gallery
thumbnails on desktop, under the buy area with a "Visa alla" link on mobile), and single
video cards nested inside the Best Sellers product grid (three cells on desktop, two on
mobile, products pushed down, nothing removed).

Hidden by default on every load. Intelligems reveals everything with one class,
`ab-f05-ugc`, on the html element. The theme editor always shows the modules. The first
home card and the first Best Sellers card carry a white product pill (photo, name, price,
plus button) linked to Doftar som... Uomo Born in Roma - No. 360, the exact product the
design draws there; phone cards never show the pill, per the design.

## Files

New:

* `assets/fuel05-ugc.css`, `assets/fuel05-ugc.js`
* `sections/fuel05-ugc-row.liquid` (the home section, the one blocked by the limit)
* `snippets/fuel05-ugc-tile.liquid`, `snippets/fuel05-ugc-pdp.liquid`

Edited:

* `sections/main-product.liquid` and `snippets/product-media-gallery.liquid` (PDP slots)
* `sections/main-collection-product-grid.liquid` (grid tile branch)
* `templates/product.tsr-bundle.json`, `templates/collection.collection-lander-v1.json`,
  `templates/index.json`

## Swapping in the real creator videos

Every video slot is a theme editor setting on its block: pick a file from the shop's
library, or paste a URL, plus an optional poster image. The four placeholders are brand
videos already in the shop's own file library. No video path is in code.

## Check results

**Verified, on the development theme preview (product page and Best Sellers):**

* Test off: no module visible on either page at 390 or 1440, no horizontal scroll, no
  broken images. Product page blank gap flags reproduce identically on the live page
  without our code; the one collection flag not on live was the newsletter popup caught
  mid scan.
* Test on, product page: desktop row renders under the gallery thumbnails (4 tiles,
  slider active, heading exact), mobile row under the buy area with "Visa alla" linking
  to Best Sellers. The wrong device's row is never visible. Videos play while on screen
  and pause off screen, portrait, at both widths. Arrow buttons move the mobile slider.
  Tapping a playing video pauses it, tapping again resumes.
* Test on, Best Sellers desktop: three tiles in the grid, mobile tiles hidden, the first
  tile's pill shows the exact product name, 129,99 kr, working link and loaded photo.
* Test on, Best Sellers mobile, with the client's Intelligems script kept out of the
  browser: two tiles in the grid at the drawn positions, desktop tiles hidden, pill
  hidden, on screen video playing, no overflow, no horizontal scroll.
* Reduced motion (product page): all eight videos stay paused. Editor mode (product
  page): both rows visible for configuration.
* Fuelerate scanners on both pages at both widths: no flag touches a fuel05 element.
* Console errors: none reference our files; all logged errors are third party scripts
  refusing to run against a local address.

**Not examined:**

* The home placement on real Shopify, in any state. Blocked by the section limit; its
  layout file was held back from the preview upload. The home row's look is evidenced
  only by the local page injection photos in the pack
  (`../tryscent-handoff-2026-08-26/qa/` and the fuel05 comparison page).
* Best Sellers mobile with the client's Intelligems experiment running, beyond
  documenting the redirect itself.
* The collection page's load more behaviour with tiles on later pages (known: the theme
  repeats promo cells per page, our tiles inherit that; design only draws page one).
* Real phones, the real theme editor, and a real test order (FUEL_05 adds nothing to the
  cart; the pill's plus button opens the product page, pending Q19).

**Found this pass, not fixed by decision:** the two blockers above. Fisnik chose to hand
off as built; both are documented for the team.

**Found and fixed earlier passes:** the pill was missing its linked product (config
added), the pill showed on phone cards (CSS order fix), and an 11MB comparison page that
would not open (compressed).

## Differences from the design, on purpose

The list lives in `../tryscent-handoff-2026-08-26/QUESTIONS-FOR-FISNIK.md`, items 8 to
19: placeholder videos, push down instead of takeover on the grid, pill plus button
opens the product page, four mobile cards, Visa alla target, no badge, 24px mobile
heading assumption, Figtree instead of Plus Jakarta Sans.
