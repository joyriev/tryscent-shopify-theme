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

## Fix round 2, 2026-08-27

Third pass over the branch, covering the audit's audience setting gap, the simultaneous
playback bug, the unnamed video card, and the invalid home template that was blocking the
whole branch from uploading.

**The preview could not be used this round.** The `shopify theme dev` server on
127.0.0.1:9292 is still listening, but its access token has expired: every storefront page
answers 401 ("The access token provided is expired, revoked, malformed, or invalid for
other reasons") and `/collections/best-sellers` answers 502. Only `/cdn/shop/t/1/assets/`
still serves. Nothing in this round was seen rendered in a browser. Everything below was
checked by parsing the files, by Theme Check, and by driving the JavaScript against a stub
of the observer, and each item says which. The two checks the audit called vacuous are
answered honestly at the end rather than repeated.

### What changed

* **The home template ships unchanged again, and the branch tip uploads (commit
  `b1209939`).** `templates/index.json` is back to the version on `boring`. The row itself
  is untouched in `sections/fuel05-ugc-row.liquid` and keeps its preset, it is simply not
  referenced by the home template, so it can be wired in later with one small edit: the
  section entry plus one line in the `order` array.
  *Verified:* both versions parsed as JSON and their `order` and `sections` counted. The
  committed tip carried 26 of each, one over Shopify's hard limit of 25; the new commit
  carries 25 of each. The new file is byte identical to `origin/boring`'s copy (`diff`
  reports no difference).

* **A clip on the product page can be limited to products carrying a tag.** Each
  `fuel05_ugc_video` block gained one optional text setting,
  `sections/main-product.liquid:1450-1455`: label "Show only when product is tagged", info
  "Leave empty to show everywhere. Example: Herr". The filter itself is
  `snippets/fuel05-ugc-pdp.liquid:41-54`, and it downcases both sides, so a merchant who
  types `herr` still matches the `Herr` tag instead of silently getting nothing. Both
  render sites now pass the page product in rather than leaning on the global:
  `sections/main-product.liquid:243` and `snippets/product-media-gallery.liquid:253`.
  Empty is the default and all four shipped clips leave it empty, so the rendered page is
  byte for byte what it was.
  *Verified:* the section's `{% schema %}` was extracted and parsed as JSON, and the block
  now reads `['video', 'video_url', 'video_poster', 'product', 'audience_tag']`. Theme
  Check over the whole theme reports exactly the same 953 errors and 523 warnings as before
  the change, with no new offense on any touched file. The filter was **not** exercised
  against real product tags, because the preview is down.

* **An all filtered row renders nothing at all, heading included.** The old snippet had the
  same rule written twice, a scan loop that set `has_video` and a render loop that printed
  the tiles, and the filter would have let the two drift apart. There is now one loop: the
  tiles are built into a capture at `snippets/fuel05-ugc-pdp.liquid:38-66` and the row is
  printed only if something came out of it, `:68`. A product that matches none of the clips
  gets no heading and no empty slider, structurally, not by a second rule agreeing with the
  first.
  *Verified:* by reading the control flow and by Theme Check parsing the file clean. Not
  seen rendered.

* **Only one clip plays at a time now, on scroll as well as on tap.** The observer called
  `play()` on every video that crossed the 50 per cent line, and a row coming into view
  crosses all of its cards in the same callback, so up to four ran together. Play now goes
  through one helper, `playOnly`, at `assets/fuel05-ugc.js:20-27`, which pauses every other
  fuel05 video first, the same rule the tap path has always had. The observer,
  `:87-105`, pauses the cards that are leaving and then starts at most one of the cards
  that are arriving, the first of the batch, so the card nearest the start of the row is
  the one left running.
  *Verified:* `node --check` on the file, then the file was run inside a stub of the DOM and
  the observer and driven through four scenarios. Against the previous file (`dfcabea2`):
  a row scrolling in with four entries left `[video1, video2, video3, video4]` playing; one
  card leaving while another arrived left three playing. Against the new file, the same two
  scenarios left `[video1]` and `[video2]`, one in each case. The whole row scrolling out
  left nothing playing in both.

* **The video card has a role and a name.** It carried `tabindex="0"` and nothing else, so
  a screen reader landed on a focusable element it could not announce. It is now
  `role="button"` with an `aria-label` built at `snippets/fuel05-ugc-tile.liquid:22-33`:
  "Spela video", plus the linked product's name on the two cards that carry the pill, so
  those read as "Spela video, Doftar som... Uomo Born in Roma - No. 360". The `<video>` is
  `aria-hidden="true"` on both branches, `:37` and `:52`; it has no name of its own, it is
  not focusable, and leaving it in the tree only meant an unlabelled media node inside the
  named card.
  *Verified:* Theme Check clean on the file, and the label string traced by reading. **Not**
  checked with a real screen reader or in a browser. One thing to know: the pill is an `<a>`
  inside the card, so a link now sits inside an element with `role="button"`. That nesting
  predates this change (a `tabindex` div wrapped the link already) and the role makes it
  explicit rather than creating it. Worth a look whenever the pill's plus button decision
  (Q19) is settled.

### The two checks the audit called vacuous

* **prefers-reduced-motion, product page.** Not reproduced in a browser this round; the
  preview is down. What was done instead: the file was run in the stub with
  `matchMedia().matches` returning true, and no play observer is created at all, so no video
  is ever asked to play. The guard is `assets/fuel05-ugc.js:84`, and it returns before the
  observer is built. The tap path still works under reduced motion, which is deliberate and
  unchanged. This is a code level result, not a rendered one, and it should be redone on a
  live preview before launch.
* **`.shopify-design-mode`, editor reveal.** Not reproducible from outside the Shopify
  admin. The reveal is CSS only, `assets/fuel05-ugc.css:6`, and the class is put on `<body>`
  by Shopify itself only when the storefront is loaded inside the theme editor frame. There
  is no way to make Shopify emit it from a local page or a curl, and forcing the class by
  hand would prove the CSS rule, not the reveal. Recording it as untested rather than
  claiming it: someone needs to open the theme editor on the QA theme (152119279686) and
  look.

### Correction to the fix round above

The earlier round recorded "all four videos play once the row is scrolled into view"
(line 183 of this file) as a passing result. It was the bug, not the behaviour: the tap
path had a one at a time rule, the scroll path did not, and the report described the two as
if they matched. The measurement above is the correction, and the fix is in this round.

### Pre launch items, both for Korana

* **FUEL_03 and FUEL_05 collide in three files, at the same anchors.** A git conflict on
  merge is certain, and if both experiments run at once a session bucketed into both gets
  FUEL_03's pair card and FUEL_05's UGC row stacked in the same slot.

  | File | FUEL_03 | FUEL_05 |
  |---|---|---|
  | `sections/main-product.liquid` | new `when` cases after line 232 | new `when` cases after line 232 |
  | `snippets/product-media-gallery.liquid` | wrapper inserted after line 244 | wrapper inserted after line 244 |
  | `templates/product.tsr-bundle.json` | `fuel03_pair_v2` right after `tsr_block_CWYfba` | `fuel05_ugc_slot` plus four video blocks right after `tsr_block_CWYfba` |

  Both tests also want the same mobile slot, after the bundle card, which the FUEL_05 brief
  flagged in its section 5. Korana decides whether the two are sequenced or their slots are
  separated; whoever merges second resolves three conflicts by hand either way.

* **Two clips carry copy nobody has approved for these pages.** Placeholder videos are
  allowed, so this is not a rule breach, but neither can go live unnamed. One of the four
  placeholders has English marketing copy burned into the picture, "From 0 to 100 in
  self-esteem with 2 sprays", playing on a Swedish product page. And one of the client's own
  clips carries a burned in "Le Male / ALTERNATIV" comparative claim, which the PDP's
  "ANSVARSFRISKRIVNING FÖR JÄMFÖRANDE REKLAM" accordion does not cover, on a client the
  brief describes as legally sensitive about designer brand comparisons. Both need to be in
  front of Korana before launch, with the second one probably needing the disclaimer copy
  extended or the clip swapped.

### Not examined this round

* Anything rendered. No browser ran at all: no reveal check, no scroll check, no console
  check, no horizontal scroll check, at any width, on any page. The whole of the previous
  round's rendered evidence still stands as the last time these pages were seen, but it
  predates all four changes above.
* The audience filter against real product tags, including whether the store's men's
  products actually carry a `Herr` tag or something else. The setting matches whatever the
  merchant types; nobody has confirmed what that string should be.
* The theme editor, real phones, the live theme, and a real test order.
* The three older open items are unchanged: the `collection-lander-v2` mobile redirect, the
  home section limit decision, and Q17's audience rule, which now has a mechanism but still
  has no recorded decision about which clips get which tag.

## Fix round 3, 2026-08-27

One change, in `assets/fuel05-ugc.js` only: a tap on a clip turns the sound on. No markup,
no CSS, no new control on the page.

### What changed

* **A tap plays the clip with sound, the next tap pauses it.** The clips are creators
  talking to camera, so clips that stayed silent whatever you did with them were pointless.
  Scrolling still starts them silent, because the only thing a browser blocks is a clip
  that starts itself with sound already on. A tap is a user gesture, and after a gesture
  the browser lets the sound through, so nothing had to be added to the page for this: no
  button, no speaker icon, no second state to design. The tap rule now reads: a silent
  clip, running or not, unmutes and keeps running; a clip that already has sound pauses on
  the next tap, and the tap after that starts it again with the sound still on
  (`assets/fuel05-ugc.js:37-45`). A clip that scrolls out of view is paused and muted again
  (`:106-111`), so scrolling back to it is silent, the same as the first time. Reduced
  motion is untouched: nothing autoplays there, and a tap plays with sound the same way.
  Both places that show clips reach this, because they render the same card and the tap is
  read once on the document: the collection grid at
  `sections/main-collection-product-grid.liquid:201`, and both product page slots through
  `snippets/fuel05-ugc-pdp.liquid:56`.

* **The safety property: sound can only ever start from a tap.** Every play goes through
  the one helper, `playOnly` (`:25-31`), and the helper sets the clip's mute flag from its
  own argument in the line before it calls `play()`. Scrolling passes false, so anything
  the observer starts is muted first, every single time, including a clip somebody had
  tapped for sound a moment earlier. The tap handler is the only caller that passes true.
  There is no path that starts a clip and leaves whatever sound state it happened to be in.

### Checked

* `node --check assets/fuel05-ugc.js` passes.
* The file was run inside the same stub of the DOM as last round, extended with the tap
  path and a mute flag on each stubbed video, and driven through both the old file
  (`3ad49872`) and the new one. Old file, every scenario: nothing is ever unmuted, and a
  tap on the clip the scroll had started paused it instead. New file: scrolled into view
  leaves one clip playing and none with sound; a tap on a second card leaves that one card
  playing, with sound, and the first paused; a tap on the card that was already running
  silently gives it sound and keeps it running; a second tap pauses it and it stays
  unmuted; a third tap plays it with sound again; a tapped card scrolled out comes back
  paused and muted, and scrolling it back in plays it silent. Reduced motion: no play
  observer is built and nothing autoplays, and a tap plays with sound. Two rows on one page
  (collection plus product page): a tap in either row reaches the handler and pauses the
  other row's clip, so one clip at a time still holds across the two surfaces.
* Theme Check, whole theme, before and after on the same tree: 953 errors and 523 warnings
  both times, which is this theme's known baseline, no per file difference anywhere, and no
  offence at all on `assets/fuel05-ugc.js`.
* The `shopify theme dev` server on 127.0.0.1:9292 is answering again this round, and the
  file it serves for `assets/fuel05-ugc.js` is byte identical to the one in the branch, so
  the change is what a page on the preview would load.

### Not examined this round

* Playback itself. No browser ran, nothing was tapped by hand, and no sound came out of a
  speaker. The behaviour above is a code level result plus the stub, exactly like round 2.
  Somebody should open the preview on a phone and a desktop, tap a clip on the collection
  page and on the product page, and confirm the audio actually plays and that only one clip
  is ever audible.
* Whether the client's clips carry usable audio at all, and at what level. The two copy
  problems flagged last round are unchanged and still need Korana.

## Fix round 4, 2026-08-27

The clips on the product page were showing as empty boxes. Not one of the clips configured
so far has a thumbnail image set, and `snippets/fuel05-ugc-tile.liquid` told the browser to
fetch nothing up front, so a tile had no poster to show and no frame of the video file
either, and it sat blank until it played. Since round 2 only one clip plays at a time, so
every other tile in the row was one of those blank boxes: on the pink mirage product page
all four visible tiles were blank. The snippet now decides per clip. A clip that has a
thumbnail keeps `preload="none"` and its poster exactly as before, and a clip with no
thumbnail asks for `preload="metadata"` instead, which is enough of the file for the browser
to paint the first frame into the tile. That narrows the F2 note above, which said no video
preloads any more: the ones with a thumbnail still do not. Nothing else in the tile
moved, same classes, same aria, same play and pause, same pill. When the client's real
thumbnails come through the pipeline and land in the block setting, those clips go back to
fetching nothing until they play, automatically, with no further code change.
