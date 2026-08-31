(() => {
  if (window.fuel05UgcReady) return;
  window.fuel05UgcReady = true;

  // QA and preview reveal. On any theme that is not the live one, adding #f05 to
  // the address turns the variant on so the test can be checked without running
  // Intelligems. Shopify.theme.role is 'main' on the live theme, so this can
  // never fire there. The hash is read again on every hashchange, because typing
  // #f05 into the bar of a page that is already open never reloads it.
  if (window.Shopify && Shopify.theme && Shopify.theme.role !== 'main') {
    const applyHashReveal = () => {
      document.documentElement.classList.toggle(
        'ab-f05-ugc',
        window.location.hash === '#f05'
      );
    };

    applyHashReveal();
    window.addEventListener('hashchange', applyHashReveal);

    // Intelligems' removeViewQueryParam() drops ?view= from the address bar at
    // startup, so the history entry for the collection page points at the
    // default collection template, which carries none of this markup. Back and
    // reload then show a page with no tiles. Preview themes only, QA hash only.
    const keepView = () => {
      if (window.location.hash !== '#f05') return;
      if (!document.querySelector('.fuel05-ugc--grid')) return;
      if (/[?&]view=/.test(window.location.search)) return;
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'collection-lander-v1');
      history.replaceState(history.state, '', url.toString());
    };
    window.addEventListener('load', keepView);
    window.addEventListener('pagehide', keepView);
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  // One clip runs at a time, page wide. Every play goes through here, so the
  // rule holds whether the clip was tapped or scrolled into view, and so does
  // the sound rule: the second argument is set on the clip right before it
  // starts, and scrolling always passes false. A clip can only ever come up
  // with sound from a tap, which is what browsers allow.
  const playOnly = (video, withSound) => {
    document.querySelectorAll('video.fuel05-ugc__video').forEach((other) => {
      if (other !== video) other.pause();
    });
    // A real start outranks the warm-up below: without this line the warm-up's
    // first-frame handler would pause the clip the shopper just asked for.
    delete video.dataset.fuel05Warming;
    video.muted = !withSound;
    video.play().catch(() => {});
  };

  // A tap turns the sound on. The clips are people talking, so a silent one is
  // pointless, and a tap is the gesture the browser wants before it lets audio
  // through. First tap on a silent clip, running or not, unmutes it and keeps
  // it running. After that it is a plain play and pause, sound still on.
  const toggleTile = (tile) => {
    const video = tile.querySelector('video.fuel05-ugc__video');
    if (!video) return;
    if (video.muted || video.paused) {
      playOnly(video, true);
    } else if (video.readyState >= 2 || video.currentTime > 0) {
      video.pause();
    }
    // A clip that is "playing" but has produced no frame yet is still
    // fetching, and paused reads false the moment play() is called. Without
    // the guard above, the natural second tap of somebody waiting on a slow
    // connection cancelled the start they had just asked for, which read as
    // "tap twice to play". While it loads, a tap does nothing.
  };

  const tileFromEvent = (event) => {
    const target = event.target;
    if (!target || typeof target.closest !== 'function') return null;
    const tile = target.closest('.fuel05-ugc__tile');
    if (!tile || target.closest('a')) return null;
    return tile;
  };

  document.addEventListener('click', (event) => {
    const tile = tileFromEvent(event);
    if (tile) toggleTile(tile);
  });

  // Keyboard parity with the click handler. The tile carries tabindex="0", so
  // Enter and Space play and pause it the same way a tap does.
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
    const tile = tileFromEvent(event);
    if (!tile) return;
    event.preventDefault();
    toggleTile(tile);
  });

  // The store's Klaviyo "10% RABATT" form leaves its container in the page
  // after a shopper closes it, and on Roi's devices the leftover kept sitting
  // over everything with pointer-events on: a tap on an arrow or a card hit a
  // kl div instead of ours, and the body kept Klaviyo's scroll lock. The form
  // is not ours to configure, so the row defends itself and stops the dead
  // leftover taking hits. Variant only, and the class is read when the event
  // fires because this file loads in both arms.
  const KL_SELECTOR = '[class*="kl-private-reset-css"]';

  const klaviyoShowsForm = (root) =>
    [...root.querySelectorAll('form.klaviyo-form')].some((form) => form.getClientRects().length > 0);

  const klaviyoCoversViewport = (el) => {
    const rect = el.getBoundingClientRect();
    return rect.width >= window.innerWidth * 0.9 && rect.height >= window.innerHeight * 0.9;
  };

  // The container, and anything left inside it still covering the viewport.
  // Both, not just the container: pointer-events inherits only until something
  // declares its own, and the node sitting over the page declares auto.
  const klaviyoResidue = () => {
    const dead = new Set();
    document.querySelectorAll(KL_SELECTOR).forEach((root) => {
      // Outermost container per form only.
      if (root.parentElement && root.parentElement.closest(KL_SELECTOR)) return;
      // A form still on screen wants its own clicks, embedded ones included.
      if (klaviyoShowsForm(root)) return;
      // And only where something big enough to swallow a tap is left. A teaser
      // tab or an inline signup box is small and stays live.
      const blockers = [root, ...root.querySelectorAll('*')].filter(klaviyoCoversViewport);
      if (!blockers.length) return;
      dead.add(root);
      blockers.forEach((el) => dead.add(el));
    });
    return dead;
  };

  const muteKlaviyoResidue = () => {
    if (!document.documentElement.classList.contains('ab-f05-ugc')) return;
    klaviyoResidue().forEach((el) => {
      el.dataset.fuel05KlMuted = 'true';
      el.style.pointerEvents = 'none';
    });
    // Klaviyo holds the page still with this class while a form is open, and
    // it has been seen to leave it on. Nothing is on screen here, so it goes.
    if (!klaviyoShowsForm(document)) {
      document.body.classList.remove('klaviyo-prevent-body-scrolling');
    }
  };

  const unmuteKlaviyo = () => {
    document.querySelectorAll('[data-fuel05-kl-muted]').forEach((el) => {
      delete el.dataset.fuel05KlMuted;
      el.style.pointerEvents = '';
    });
  };

  window.addEventListener('klaviyoForms', (event) => {
    const type = (event.detail && event.detail.type) || '';
    if (type === 'close' || type === 'embedClose' || type === 'submit') {
      muteKlaviyoResidue();
      // Klaviyo fades the form out, so the first pass can still see it on
      // screen and skip the container. One deferred retry, not a poll.
      setTimeout(muteKlaviyoResidue, 500);
    } else {
      unmuteKlaviyo();
    }
  });

  // The clip a shopper tapped for sound keeps the playhead. Ratios are written
  // by the row observers below, so a clip in a row that has not armed yet
  // reads as not visible, exactly as it did before this existed.
  const visibleRatio = new WeakMap();

  const engagedVideo = () =>
    [...document.querySelectorAll('video.fuel05-ugc__video')].find(
      (video) => !video.muted && !video.paused && (visibleRatio.get(video) || 0) >= 0.5
    ) || null;

  // The poster overlay comes off exactly when the clip has really put a frame
  // on screen, and never goes back on. iOS Safari throws the poster attribute
  // away as soon as play() is called, and with preload="none" there is nothing
  // decoded to replace it, so the card fell back to its own grey for the fetch
  // and decode: the flash, then the blank, then the video. Holding a plain
  // image over the video instead keeps that frame painted for the whole gap.
  const holdPoster = (video) => {
    if (video.dataset.fuel05Poster === 'true') return;
    video.dataset.fuel05Poster = 'true';

    const tile = video.closest('.fuel05-ugc__tile');
    const overlay = tile && tile.querySelector('.fuel05-ugc__poster');
    // A clip with no poster to hold renders no overlay and asks for metadata
    // instead, so the browser paints its own first frame and there is no gap.
    if (!overlay) return;

    const started = () => tile.classList.add('fuel05-ugc__tile--started');

    // The frame callback is the only thing that reports a frame presented to
    // the screen rather than a state the element has reached, and Safari, the
    // browser this was reported on, has it. It fires once, which is all we
    // want, so nothing has to be taken off again.
    if (typeof video.requestVideoFrameCallback === 'function') {
      video.requestVideoFrameCallback(started);
      return;
    }

    // Without it: playing and timeupdate both say playback is running, and
    // readyState says whether the position being played has data behind it,
    // which is as close to "a frame exists" as the events get. Either event
    // can be the first to arrive with data, so both are listened for and the
    // pair comes off together.
    const onFrame = () => {
      if (video.readyState < 2) return;
      video.removeEventListener('playing', onFrame);
      video.removeEventListener('timeupdate', onFrame);
      started();
    };
    video.addEventListener('playing', onFrame);
    video.addEventListener('timeupdate', onFrame);
  };

  const initRow = (root) => {
    if (root.dataset.fuel05Init === 'true') return;
    root.dataset.fuel05Init = 'true';

    const slider = root.querySelector('.fuel05-ugc__slider');
    if (slider && window.Swiper) {
      const gapMobile = Number(root.dataset.gapMobile ?? 10);
      const gapDesktop = Number(root.dataset.gapDesktop ?? 32);
      new Swiper(slider, {
        slidesPerView: 'auto',
        spaceBetween: gapMobile,
        watchOverflow: true,
        // The a11y module jumps the row to any slide whose focus it cannot
        // prove is already on screen, and it can only prove it when visible
        // slides are tracked. Without this, a tap that focuses a card (the
        // tiles are buttons) snapped the row one card over and the observer
        // then started the newly revealed clip muted: tap the second card,
        // watch the third slide in and play. Guarded only by a frame-timing
        // race on Safari, so real fingers hit it and clean automated taps do
        // not. Tracking visibility makes the guard deterministic, and focus
        // from the keyboard still brings a genuinely off-screen card into
        // view, which is the part worth keeping.
        watchSlidesProgress: true,
        navigation: {
          prevEl: root.querySelector('.fuel05-ugc__arrow--prev'),
          nextEl: root.querySelector('.fuel05-ugc__arrow--next'),
        },
        breakpoints: {
          750: { spaceBetween: gapDesktop },
        },
      });
    }

    const videos = root.querySelectorAll('video.fuel05-ugc__video');

    // Above the return below, deliberately. Nothing starts on its own for a
    // shopper who asked for less motion, but a tap still starts a clip, and
    // that tap needs the poster held exactly as much as any other. This is
    // also the one place every clip passes through, cards the collection grid
    // writes after first paint included, because the row is stamped and
    // re-scanned rather than walked from the top.
    videos.forEach(holdPoster);

    // Buffering starts when a card is half on screen, not when it is tapped.
    // The postered clips deliberately load nothing up front, so the first tap
    // used to pay for the whole fetch before a frame could show, which read
    // as a dead or slow tap on both phone and desktop. preload is bumped for
    // every clip and load() is only called on one that has fetched nothing,
    // because load() resets an element that has. Also above the reduced
    // motion return: warming the buffer moves no pixels, and those shoppers
    // tap cold clips too.
    if ('IntersectionObserver' in window && videos.length) {
      const warm = (video) => {
        if (video.dataset.fuel05Warm === 'true') return;
        video.dataset.fuel05Warm = 'true';
        video.preload = 'auto';
        if (video.readyState >= 2 || !video.paused) return;

        // iOS Safari ignores preload and load() for video, so the hint above
        // buys nothing exactly where the slow taps were reported. The one
        // request it honours is playback itself: run the clip muted and stop
        // it on the first frame. That frame is the poster image, so nothing
        // moves on screen, and the shopper who asked for less motion keeps
        // the plain hint because this path really is a playback.
        if (prefersReduced.matches) {
          video.load();
          return;
        }
        const stop = () => {
          video.removeEventListener('loadeddata', stop);
          if (video.dataset.fuel05Warming !== 'true') return;
          delete video.dataset.fuel05Warming;
          video.pause();
          try {
            video.currentTime = 0;
          } catch (error) {
            // A clip that cannot seek just stays on its first frame.
          }
        };
        video.dataset.fuel05Warming = 'true';
        video.addEventListener('loadeddata', stop);
        video.muted = true;
        const attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(() => {
            delete video.dataset.fuel05Warming;
            video.removeEventListener('loadeddata', stop);
            video.load();
          });
        }
      };
      const warmObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.intersectionRatio >= 0.5) {
              warm(entry.target);
              warmObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: [0.5] }
      );
      videos.forEach((video) => warmObserver.observe(video));
    }

    if (prefersReduced.matches || !('IntersectionObserver' in window)) return;
    if (!videos.length) return;
    const playObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => visibleRatio.set(entry.target, entry.intersectionRatio));

        // A clip playing with sound was tapped, and scrolling a little must
        // not take it away again: this callback used to hand playback to
        // whichever card came first in the batch, which paused and muted the
        // one the shopper had just asked to hear. Read before the loop, so the
        // pauses below cannot change the answer half way through.
        const engaged = engagedVideo();

        // Pause what left, then start at most one.
        entries.forEach((entry) => {
          if (entry.intersectionRatio < 0.5) {
            // Muted again on the way out, so a clip somebody had tapped for
            // sound is silent again the next time scrolling brings it back.
            // The engaged clip is at half visibility or better by definition,
            // so it never reaches this branch until it really leaves.
            entry.target.pause();
            entry.target.muted = true;
          }
        });

        // The card left running is the leftmost one at least half on screen,
        // read from the tracked ratios, not from this batch. The batch only
        // holds cards whose visibility CHANGED, so picking from it handed
        // playback to the card a swipe had just revealed on the right while
        // the settled card beside it stayed dark: swipe one notch and the
        // third clip started instead of the second. DOM order is row order.
        let starting = null;
        for (const video of videos) {
          if ((visibleRatio.get(video) || 0) >= 0.5) {
            starting = video;
            break;
          }
        }
        if (starting && !engaged) playOnly(starting, false);
      },
      { threshold: [0, 0.5] }
    );
    videos.forEach((video) => playObserver.observe(video));
  };

  const arm = (root) => {
    if (root.dataset.fuel05Armed === 'true') return;
    root.dataset.fuel05Armed = 'true';
    const visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          initRow(root);
          visibilityObserver.disconnect();
        }
      });
    });
    visibilityObserver.observe(root);
  };

  // Safe to call as often as we like: arm() and initRow() both stamp the root
  // and return early on a second pass, so re-scanning never doubles an observer
  // or a Swiper. Roots that arrive with fresh markup carry no stamp and arm.
  const armAll = () => document.querySelectorAll('.fuel05-ugc[data-fuel05-row]').forEach(arm);

  let armQueued = false;
  const armSoon = () => {
    if (armQueued) return;
    armQueued = true;
    requestAnimationFrame(() => {
      armQueued = false;
      armAll();
    });
  };

  // The collection grid changes after first paint in two ways, and neither one
  // runs any of our code: the theme's infinite scroll appends grid cells to
  // #product-grid, and facets.js replaces the whole of
  // #ProductGridContainer.innerHTML on every filter and sort. The container
  // element itself survives both, so one observer on it covers both paths.
  const watchGrid = () => {
    const container = document.getElementById('ProductGridContainer');
    if (!container || container.dataset.fuel05Watched === 'true') return;
    container.dataset.fuel05Watched = 'true';
    new MutationObserver(armSoon).observe(container, { childList: true, subtree: true });
  };

  const start = () => {
    armAll();
    watchGrid();
    // A page can load with a leftover already in it, from a form the shopper
    // closed before this script ran.
    muteKlaviyoResidue();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
  document.addEventListener('shopify:section:load', start);
})();
