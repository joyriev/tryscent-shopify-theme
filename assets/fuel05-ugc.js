(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const armed = new WeakSet();

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

    const videos = [...root.querySelectorAll('video.fuel05-ugc__video')];
    if (!videos.length) return;

    const pauseOthers = (current) => {
      videos.forEach((video) => {
        if (video !== current) video.pause();
      });
    };

    videos.forEach((video) => {
      video.muted = true;
      const tile = video.closest('.fuel05-ugc__tile');
      tile?.addEventListener('click', (event) => {
        if (event.target.closest('a')) return;
        if (video.paused) {
          pauseOthers(video);
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    });

    if (!prefersReduced.matches && 'IntersectionObserver' in window) {
      const playObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.intersectionRatio >= 0.5) {
              entry.target.play().catch(() => {});
            } else {
              entry.target.pause();
            }
          });
        },
        { threshold: [0, 0.5] }
      );
      videos.forEach((video) => playObserver.observe(video));
    }
  };

  const arm = (root) => {
    if (armed.has(root)) return;
    armed.add(root);
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

  const armAll = () => document.querySelectorAll('.fuel05-ugc[data-fuel05-row]').forEach(arm);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', armAll);
  } else {
    armAll();
  }
  document.addEventListener('shopify:section:load', armAll);
})();
