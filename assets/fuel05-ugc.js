(() => {
  if (window.fuel05UgcReady) return;
  window.fuel05UgcReady = true;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.addEventListener('click', (event) => {
    const tile = event.target.closest('.fuel05-ugc__tile');
    if (!tile || event.target.closest('a')) return;
    const video = tile.querySelector('video.fuel05-ugc__video');
    if (!video) return;
    if (video.paused) {
      document.querySelectorAll('video.fuel05-ugc__video').forEach((other) => {
        if (other !== video) other.pause();
      });
      video.play().catch(() => {});
    } else {
      video.pause();
    }
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

  const armAll = () => document.querySelectorAll('.fuel05-ugc[data-fuel05-row]').forEach(arm);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', armAll);
  } else {
    armAll();
  }
  document.addEventListener('shopify:section:load', armAll);
})();
