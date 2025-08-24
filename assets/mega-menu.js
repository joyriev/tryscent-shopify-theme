document.addEventListener('DOMContentLoaded', function() {
  // Initialize Brands Slider
  const initBrandsSlider = () => {
    if (document.querySelector('.brands-slider')) {
      return new Swiper('.brands-slider', {
        slidesPerView: 5,
        spaceBetween: 16,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        breakpoints: {
          320: {
            slidesPerView: 2,
            spaceBetween: 10
          },
          640: {
            slidesPerView: 3,
            spaceBetween: 12
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 16
          },
          1280: {
            slidesPerView: 5,
            spaceBetween: 20
          }
        }
      });
    }
  };

  // Initialize when mega menu is opened
  const initSliderOnMenuOpen = () => {
    const menuTriggers = document.querySelectorAll('[aria-controls^="MegaMenu-Content"]');
    
    menuTriggers.forEach(trigger => {
      trigger.addEventListener('click', function() {
        // Wait for the menu to be fully opened
        setTimeout(() => {
          initBrandsSlider();
          // Update Swiper after it's visible
          const swiper = document.querySelector('.brands-slider')?.swiper;
          if (swiper) {
            swiper.update();
          }
        }, 100);
      });
    });
  };

  // Initialize on page load if menu is already open
  initBrandsSlider();
  // Initialize for when menu is opened
  initSliderOnMenuOpen();
});
