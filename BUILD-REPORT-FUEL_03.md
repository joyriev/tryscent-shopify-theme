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
