# Build report, FUEL_03 PDP Pair Scent module

Branch `test/fuel-03-pair-scent-module`. Written 2026-08-27 after the full check pass
against a Shopify development theme preview (`shopify theme dev`, theme id 152115904582,
store globisoft.myshopify.com). The live theme was not touched at any point.

## What was built

One "pair it with" card on the five highest traffic perfume product pages. The card
shows a photo of one partner perfume, a reason line, an "Inspirerad av" line and an
outline add to cart button that adds the partner's 100 ml size through the theme's own
cart machinery, so the cart drawer opens on add and errors show inline.

Hidden by default on every load. Intelligems reveals it by putting a class on the html
element: `ab-f03-pair-v1` shows the card directly under the buy area, `ab-f03-pair-v2`
shows it lower down, under the gallery thumbnails on desktop and after the bundle promo
card on mobile. The theme editor always shows the cards so they can be configured.

## Files

New:

* `assets/fuel03-pair-scent.css`
* `snippets/fuel03-pair-scent.liquid`

Edited:

* `sections/main-product.liquid` (two block cases plus schema entries)
* `snippets/product-media-gallery.liquid` (v2 desktop slot inside the sticky gallery)
* `templates/product.tsr-bundle.json` (five Pair Scent blocks plus the v2 slot)

There is no `assets/fuel03-pair-scent.js`. Nothing needed it: the add to cart runs on
the theme's existing product form element.

## Settings the strategist can change in the theme editor

Each of the five Pair Scent blocks has: page product, pair product, pair name, reason
line, inspired by line. Retargeting a pair needs no deploy.

## Check results, from the development theme preview

**Verified:**

* All five product pages, at 390 and 1440, in three states each: test off, variant 1,
  variant 2. 30 combinations, all photographed (`../tryscent-handoff-2026-08-26/qa/fuel03/`).
* Copy against the design, letter for letter, on all five pages at both widths: top line
  `Matcha doften med`, the pair name with its real long dash, the reason line, the
  `Inspirerad av` line, button text `Lägg i kundvagnen` with the design's stray trailing
  space trimmed. 10 of 10 exact.
* Test off state: all card slots hidden. At 390 the preview page height equals the live
  page height to the pixel (13460). At 1440 every theme section matches the live height
  exactly, including the product section (1435 on both); the one difference on the page,
  182px, sits inside the third party reviews widget, which renders differently against a
  local address and contains none of our code.
* The five card slots render on every page and the four empty ones add zero space:
  the measured gap around the card area equals card height plus its own 24px margins on
  every page at both widths.
* Real add to cart clicks, variant 1, all five pages at 1440: correct partner product,
  100ML size, cart drawer opened, an `Inspired By` line item property carrying the
  shop's own inspiration data. 5 of 5. Variant 2 spot checks: desktop slot on page one,
  mobile slot on page two, both added the correct product. Cart emptied after each check.
* Variant separation: v1 card never visible in v2 state and the other way round; the v2
  mobile and desktop slots never visible at the wrong width. Checked on all 30
  combinations.
* Editor reveal: with the editor class present all three slots show, so the strategist
  can see and configure them.
* No horizontal scroll, no element bleeding past the viewport, no broken images, and no
  text under 12px in the card, on any page at either width.
* Fuelerate scanners (`render-lint`, `geometry-lint`) on all five pages at both widths:
  every blank gap flag reproduces at the same offset on the live page without our code,
  and no geometry flag touches a fuel03 element. Flags judged inherited, list in
  `../tryscent-handoff-2026-08-26/qa/fuel03/` alongside the screenshots.
* Console errors: none reference our files. All logged errors are third party widgets
  refusing to run against 127.0.0.1 (chat widget frame, storefront analytics, CORS to
  the CDN); the same scripts run clean on the live domain.

**Not examined:**

* A real test order in the Shopify admin. Needs an admin login, planned for the QA theme
  stage with Fisnik.
* Safari and Chrome on real phones. All checks ran in WebKit, the Safari engine, at
  exact viewport sizes.
* The theme editor itself (the reveal class was applied manually; the editor was not
  opened, to keep this laptop's footprint minimal).
* Behaviour with Intelligems actually loaded; the class was applied by hand the way
  Intelligems does it.

**Found and fixed this pass:** nothing. Two earlier fixes from the build stage stand:
the v2 desktop card was moved inside the sticky gallery after a screenshot showed it
sliding over the thumbnails, and the shop's newsletter popup had to be dismissed for
click tests.

## Differences from the design, on purpose

1. Figtree instead of Plus Jakarta Sans: the shop loads only Figtree. Same sizes and
   weights as drawn.
2. Sentence case instead of the desktop mock's capitalise every word, per the brief's
   own recommendation.
3. The button adds the 100 ml size, matching what the buy box preselects. Final policy
   sits with Korana.
4. At 390 the longest `Inspirerad av` lines shorten with three dots: Jean Paul Gaultier
   Le Male (page five) and YSL Black Opium in the variant 2 mobile slot. The design's
   own style rule (one line, ellipsis) does this; shorter copy is the fix if wanted.

## Open questions

In `../tryscent-handoff-2026-08-26/QUESTIONS-FOR-FISNIK.md` and the pack's
`06-OPEN-QUESTIONS.md`, mostly for Korana: size policy, price display, post add
behaviour, capitalisation.

## Known conditions, 2026-08-27

Four things about this branch that are true today, are not defects to fix on their own, and
have to be in front of whoever launches it. Everything below was traced in the branch's own
files; no browser was involved, the `shopify theme dev` preview's token has expired and
every storefront page it serves now answers 401.

### 1. The card puts up to three extra `/cart/add` forms on the page, in both arms

`snippets/fuel03-pair-scent.liquid:102-116` renders a `<product-form>` wrapping
`{% form 'product', pair_product %}`, with a hidden variant input and a
`properties[Inspired By]` input, and a `button name="add"`. Three slots render that markup
on each of the five test pages: v1 at `sections/main-product.liquid:237`, v2 mobile at
`:241`, v2 desktop at `snippets/product-media-gallery.liquid:248`. The hiding is CSS only,
`assets/fuel03-pair-scent.css:2` hides them all and the `ab-f03-pair-*` classes reveal one,
so **all three exist in the DOM for control shoppers too**.

The one that matters is the v2 desktop slot. The media gallery is emitted at
`sections/main-product.liquid:79`, before the buy box column at `:81`, so on those five
pages the first `form[action*="/cart/add"]` and the first `button[name="add"]` in the
document are a hidden pair card, not the buy box, in both arms.

Traced and currently safe on this template:

* `sections/floating-atc.liquid:47` resolves through `.cta_product_from_submit_btn`, a class
  the real buy button carries (`snippets/reactive-variant-selector.liquid:94`) and the card's
  button does not (`snippets/fuel03-pair-scent.liquid:108`). Floating ATC is the bar that is
  actually on this template.
* `sections/sticky-atc.liquid:373` does fall through to a bare
  `document.querySelector('button[name="add"]')`, but `sticky-atc` does not appear anywhere
  in `templates/product.tsr-bundle.json`.
* `assets/product-info.js:504` is `get productForm() { return this.querySelector('product-form'); }`
  and `<product-info>` spans `sections/main-product.liquid:1` to `:1115`, so it contains the
  media gallery. On these five pages that getter now returns the v2 desktop card instead of
  the buy box. Nothing reads it today, because this template has neither a variant picker
  nor a quantity selector, which are the only two paths into it. It becomes a live bug the
  day anyone adds either one to this template: the buy box's sold out state would be written
  onto the card's button while the buy box kept looking available.

What cannot be traced from the repo is the app layer, Insureful, Selleasy, Kite, AReviews,
and the GA4 and Meta add to cart listeners. If any of them binds to the first cart form or
the first add button it finds, it binds to a hidden card and stops firing from the real buy
box, on the five highest traffic pages, for control traffic as well. That is the check the
real test order below is for.

### 2. A sold out 100 ml silently takes a page out of the test, and one product takes out two

`snippets/fuel03-pair-scent.liquid:42-48` walks the pair product's variants and picks the
first whose downcased title contains `100`; `:57` then gates the whole card on
`pair_variant.available`. If that 100 ml is out of stock the card disappears even when the
50 ml and the 30 ml are in stock. The fallback at `:41`,
`selected_or_first_available_variant`, only applies when **no** variant title contains `100`
at all, which is not the same thing.

Two of the five pairs point at the same partner product, `bergamot-pepper-ambroxan`:
`fuel03_pair_1` on the `lavender-mint-vanilla-50-ml-1-7-fl-oz` page and `fuel03_pair_4` on
the `magic-perfume-no-206m` page. One stockout on that single product therefore quietly
turns two of the five test pages back into control pages. There is no error, nothing in the
console, and nothing in the screenshots; the numbers for those pages just go soft.

Two things follow. Stock on the four partner products must be checked before launch and
again during the run: `bergamot-pepper-ambroxan`, `black-berry-vanilla-musk`,
`pineapple-smoke-vanilla-50-ml-1-7-fl-oz`, `lavender-mint-vanilla-50-ml-1-7-fl-oz`. And the
behaviour itself is a decision, not a bug: fall back to the next available size, or keep
hiding the card. That is Korana's call, and it is the same call as Q7.

### 3. Two product decisions are still open, both with Korana

* **Q7, which size the button adds.** It always adds the 100 ml, including on the
  `lavender-mint-vanilla-50-ml-1-7-fl-oz` page, where the page's own product is a 50 ml.
  This matches what the buy box preselects, and it is what the QA run recorded on all five
  pages, but it changes the money the test measures, so it is hers.
* **Q8, the card shows no price.** There is no price slot in the design, and the card sits
  next to an add to cart button that puts a bottle in the cart. Beyond the user experience
  question, adding a priced item from a card that displays no price is a Swedish price
  marking question, which is why it is not something to settle here.

### 4. The real test order is still owed

Rule B2 says anything that adds, removes or modifies an input inside a
`form[action*="/cart/add"]` is a functional change, and functional changes need one real
test order placed and read in the Shopify admin. FUEL_03 adds a second bottle to the cart,
so it is squarely inside that rule. The order has not been placed. It needs admin access to
the store, which this laptop does not have, and it is the check that would also settle the
app layer question in item 1: place the order, then read the order in the admin and confirm
the line item, its `Inspired By` property, and that the apps and the analytics events fired
from the real buy box.

## Fix round 2, 2026-08-27

Two markup defects came out of a storefront sweep of the QA theme. Both are fixed on this
branch. The design, the copy, the reveal classes and the hidden by default behaviour are
all unchanged.

* **The card slots no longer print anything on pages outside the test.** The three wrapper
  divs used to sit at the call sites, so they were printed on every product page in the
  shop even when the snippet inside them had nothing to show. That left one empty
  `fuel03-pair-scent` div on every product page, and seven of them on every bundle page
  that is not one of the five. The wrapper now lives inside
  `snippets/fuel03-pair-scent.liquid` behind the same conditions as the card, so a page
  with no matching Pair Scent block gets zero bytes of our markup. The five test pages
  still render the same three slots, with the same classes, the same inline hiding and the
  same margins.
* **The stylesheet and the QA reveal script are printed once per page.** They used to sit
  inside the card, so each of the five test pages carried three copies of the stylesheet
  link and three copies of the script. `sections/main-product.liquid` now asks for them a
  single time, near the top of the product section, and only when that product really has
  a card to show.
* **The QA reveal now follows the address bar.** It read `#f03` only once, while the page
  was loading, so a reviewer who opened a page first and typed the hash afterwards saw
  nothing at all and would fairly conclude the build was broken. It now also listens for
  hash changes: `#f03` shows variant 1, `#f03v2` shows variant 2, any other hash shows
  neither. The gate around it is untouched, so it still cannot run on the live theme.

One consequence worth knowing. On a preview or QA theme, moving to some other hash now
also clears a reveal class that Intelligems set itself, because the reveal simply follows
whatever the address bar says. On the live theme the whole script is switched off, so a
running test cannot be affected by this.

Theme Check before and after the round: 953 errors and 522 warnings both times, and no new
warning or error on any of the files touched.
