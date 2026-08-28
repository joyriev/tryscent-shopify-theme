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
    } else {
      video.pause();
    }
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
        navigation: {
          prevEl: root.querySelector('.fuel05-ugc__arrow--prev'),
          nextEl: root.querySelector('.fuel05-ugc__arrow--next'),
        },
        breakpoints: {
          750: { spaceBetween: gapDesktop },
        },
      });
    }

    if (prefersReduced.matches || !('IntersectionObserver' in window)) return;
    const videos = root.querySelectorAll('video.fuel05-ugc__video');
    if (!videos.length) return;
    const playObserver = new IntersectionObserver(
      (entries) => {
        // Pause first, then start at most one. A row scrolling into view puts
        // several cards over the line in the same callback, and this handler
        // used to call play() on every one of them, so up to four ran at once.
        // The first card of the batch is the one left running, which is the
        // one nearest the start of the row.
        let starting = null;
        entries.forEach((entry) => {
          if (entry.intersectionRatio >= 0.5) {
            if (!starting) starting = entry.target;
          } else {
            // Muted again on the way out, so a clip somebody had tapped for
            // sound is silent again the next time scrolling brings it back.
            entry.target.pause();
            entry.target.muted = true;
          }
        });
        if (starting) playOnly(starting, false);
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
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
  document.addEventListener('shopify:section:load', start);
})();
