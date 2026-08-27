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

## Fix round, 2026-08-27

Second pass over the branch after the code review in
`~/day-prep-2026-08-27/tryscent-review/review-fuel05.md`. Six items were fixed. The
scope was the review's F1, F2, F3, F7 and F8 plus one new QA aid. Nothing else was
touched: the men's clips question (Q17), the FUEL_03 merge collision and the home
section limit are all still open and still belong to the team.

### What changed

* **Collection tiles now survive filters, sorts and later pages (F1).**
  `assets/fuel05-ugc.js` does all of its own wiring. It arms on load, on
  `shopify:section:load`, and on every change inside `#ProductGridContainer`, which it
  watches with a MutationObserver. That container element survives both paths that
  rebuild the grid, so one observer covers the theme's infinite scroll appending cells
  to `#product-grid` and `facets.js` replacing the container's whole `innerHTML`. The
  re-scan is safe to run as often as it likes: `arm()` and `initRow()` both stamp the
  root and return early on a second pass, so nothing gets a second IntersectionObserver
  or a second Swiper. The section's stylesheet and script tags moved out of
  `#ProductGridContainer` in `sections/main-collection-product-grid.liquid`, because a
  script tag put back through `innerHTML` never runs, and the file only needs to load
  once now.
* **Tiles render on page one only (F1, second half).** Desktop puts 16 products plus 3
  visible tiles on a page and 19 does not divide by 4, so from page two the grid starts
  mid row and the tiles slide to columns 2, 3, 1 instead of the drawn 3, 4, 2. Putting
  them back would mean either changing how many cells a page emits or moving the tiles
  for desktop only, which then breaks mobile, where 16 plus 2 divides cleanly and the
  columns are already correct. The design draws page one, so page one is what ships.
  The gate is `paginate.current_page == 1`.
* **No video preloads any more (F2).** `snippets/fuel05-ugc-tile.liquid` sets
  `preload="none"` on both branches, with or without a poster. The poster setting still
  works exactly as before. The IntersectionObserver fetches the file when it plays it.
* **The pill prints the price the way the rest of the shop does (F3).**
  `snippets/fuel05-ugc-tile.liquid` now carries the same `Från` rule as
  `snippets/card-product.liquid:268-270`, the theme's own product card: the prefix is
  printed unless the product carries the `onsale` tag. The pill reads
  "Från 129,99 kr", the same string the design draws on that product's card two cells
  away.
* **The product page loads the CSS and the JS once (F7).**
  `snippets/fuel05-ugc-pdp.liquid` takes a new `with_assets` parameter and only the
  desktop render site passes it. A page level counter was tried first and does not
  work: `render` gives a snippet its own scope and `increment` counters do not cross
  it, measured on the preview, both renders came back as pass 0.
* **Video cards answer the keyboard (F8).** The tile carries `tabindex="0"` and
  `assets/fuel05-ugc.js` has a `keydown` handler beside the existing click one, so
  Enter and Space play and pause the card. Focus inside the pill link still belongs to
  the link, the handler steps aside for it.
* **New, a reveal for QA.** `assets/fuel05-ugc.js` adds `ab-f05-ugc` to the html
  element when the address ends in `#f05` and `Shopify.theme.role` is not `main`. It
  lets anyone check the variant on a preview or development theme without Intelligems,
  and it can never fire on the live theme, where the role is `main`.

### Checked, on the preview

Development theme 152118100038 on `globisoft.myshopify.com`, WebKit, real store data,
1440 and 390.

* Best Sellers at 1440 with `#f05`: three desktop tiles, cells 3, 8 and 10 of a four
  column grid, which is row 1 column 3, row 2 column 4 and row 3 column 2, the drawn
  positions. Two mobile tiles hidden. Videos start when scrolled into view and pause
  when they leave. Pill reads "Från 129,99 kr". One stylesheet tag, one script tag.
* Filter applied and then cleared (brand, Tom Ford): the grid re-rendered to 12 visible
  cells and back to 19, and both times all five roots came back armed with none left
  unarmed, the tiles held columns 3, 4 and 2, and the tile in view played again. The
  video's `currentTime` reset on each re-render, which is the proof the elements really
  were replaced and the new ones were picked up.
* Infinite scroll at 1440: the grid grew from 21 cells to 37, the page one tiles stayed
  in place, stayed armed and played again on scroll back, and the appended page brought
  no tiles of its own.
* `?page=2` opened directly: 16 product cells, no tiles, no horizontal scroll.
* Product page at 1440 with `#f05`: the desktop row is present with four cards, exactly
  one `fuel05-ugc.css` link and one `fuel05-ugc.js` script in the DOM, and all four
  videos play once the row is scrolled into view. Zero video requests were made before
  that scroll, 8 after it.
* Best Sellers at 390 with `#f05`: two mobile tiles at cells 2 and 5, row 1 right and
  row 3 left, the drawn positions, desktop tiles hidden, video playing. Product page at
  390: the mobile row is present and playing.
* Keyboard: the tile takes focus, Enter pauses a playing card and Space starts it again.
* Control arm, no hash, both pages, after scrolling the whole page: `ab-f05-ugc` absent,
  zero modules visible, and **zero video requests on the network**. Every `<video>` in
  the control DOM carries `preload="none"`.
* No horizontal scroll on any run, at 1440 or 390, in either arm.

### Found this pass, not ours, not fixed

* The theme's infinite scroll fetches
  `?page=N&section_id=main-collection-product-grid`. That id is the section file name,
  not the id the collection templates use, which is `product-grid`, so Shopify renders
  the section standalone with its schema defaults and no blocks at all. Appended pages
  therefore never carried our tiles, and never carried the theme's own quiz promo card
  either. Pre-existing, and it makes the page one decision above cost nothing in
  practice.
* After any facet filter the theme's own load more stops working. `facets.js` replaces
  `#ProductGridContainer.innerHTML`, and the inline infinite scroll script keeps
  observing the button element that replacement detached. Pre-existing, present in the
  control arm too.
* F9 from the review is unchanged and still open: the pill title clamps to two lines at
  the shipped width, and the price line is now one word longer.

### Not examined this pass

* The live theme, in any way. The QA reveal's `role !== 'main'` guard is read from the
  code and from the development theme reporting `role: "development"`; it was not and
  cannot be exercised against the live theme.
* The home placement, still blocked by the 25 section limit.
* The theme editor, real phones, and widths other than 1440 and 390.
* Whether the sticky bar price mismatch, the `collection-lander-v2` mobile redirect or
  the FUEL_03 collision have moved. All three are still open items for Korana.

### Preview note

`shopify theme dev` came up with both `templates/collection.collection-lander-v1.json`
and `templates/product.tsr-bundle.json` refused, "Type must be defined in schema", for
the fuel05 blocks. The cause is upload order, the templates went up before the section
files that declare those block types. Re-saving the two templates cleared it and the
storefront served 200 from then on. Both files are byte identical to what the branch
already had.
