document.addEventListener('DOMContentLoaded', () => {
  const floatingToTop = document.querySelector('.floating-to-top');
  const floatingToTopIcon = document.querySelector('.floating-to-top-icon');
  const blogNavLink = document.querySelector('.header-nav-blog');
  const headerNav = document.querySelector('.header-nav');
  const headerMenuToggle = document.querySelector('.header-menu-toggle');

  const toggleFloatingButton = () => {
    if (!floatingToTop) return;
    if (window.scrollY > 200) {
      floatingToTop.classList.add('floating-to-top--visible');
    } else {
      floatingToTop.classList.remove('floating-to-top--visible');
    }
  };

  const handleScroll = () => {
    toggleFloatingButton();

    const heroImage = document.querySelector('.hero-image[data-parallax]');
    if (heroImage) {
      const rect = heroImage.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2;
      const parallaxOffset = -centerOffset * 0.5; // 50% скорости скролла
      heroImage.style.transform = `translateY(${parallaxOffset}px)`;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (floatingToTop) {
    floatingToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const loadAndRecolorSvg = async (url, fillColor) => {
    if (!url) return null;
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const svgText = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, 'image/svg+xml');

      doc.querySelectorAll('[fill]').forEach((el) => {
        el.setAttribute('fill', fillColor);
      });

      const serializer = new XMLSerializer();
      const updatedSvg = serializer.serializeToString(doc.documentElement);
      const encoded = window.btoa(unescape(encodeURIComponent(updatedSvg)));
      return `data:image/svg+xml;base64,${encoded}`;
    } catch (e) {
      console.error('Failed to recolor svg', e);
      return null;
    }
  };

  const recolorFloatingIcon = async () => {
    if (!floatingToTopIcon || !floatingToTopIcon.src) return;
    const recolored = await loadAndRecolorSvg(floatingToTopIcon.src, '#9279E8');
    if (recolored) {
      floatingToTopIcon.src = recolored;
    }
  };

  const setupBlogIconHover = async () => {
    if (!blogNavLink) return;
    const img = blogNavLink.querySelector('.header-nav-blog-icon');
    if (!img || !img.src) return;

    const [defaultSrc, hoverSrc] = await Promise.all([
      loadAndRecolorSvg(img.src, '#1f2933'),
      loadAndRecolorSvg(img.src, '#C2B0FE'),
    ]);

    if (!defaultSrc || !hoverSrc) return;

    img.src = defaultSrc;
    img.style.transition = 'opacity 0.2s ease';

    blogNavLink.addEventListener('mouseenter', () => {
      img.src = hoverSrc;
    });

    blogNavLink.addEventListener('mouseleave', () => {
      img.src = defaultSrc;
    });
  };

  const setupMobileMenu = () => {
    if (!headerNav || !headerMenuToggle) return;

    headerMenuToggle.addEventListener('click', () => {
      const isOpen = headerNav.classList.toggle('is-open');
      headerMenuToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    });
    
    headerNav.querySelectorAll('.header-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        if (headerNav.classList.contains('is-open')) {
          headerNav.classList.remove('is-open');
          headerMenuToggle.setAttribute('aria-label', 'Открыть меню');
            }
        });
    });
  };

  const setupCloudsMotion = () => {
    const container = document.querySelector('.hero-clouds');
    if (!container) return;

    const clouds = Array.from(container.querySelectorAll('.hero-cloud'));
    if (!clouds.length) return;
            
    const states = clouds.map((el, index) => ({
      el,
      x: 0,
      y: 0,
      direction: Math.random() < 0.5 ? 1 : -1,
      speed: 10 + Math.random() * 20,
      index,
    }));

    const initCloud = (state, spread = false) => {
      const containerWidth = container.offsetWidth || 1;
      const containerHeight = container.offsetHeight || 1;
      const el = state.el;

      const cloudHeight = el.offsetHeight || containerHeight * 0.2;
      const maxTop = Math.max(0, containerHeight * 0.5 - cloudHeight);
      const top = Math.random() * maxTop;
      state.y = top;
      el.style.top = `${top}px`;

      const cloudWidth = el.offsetWidth || cloudHeight * 2;

      if (spread) {
        // случайная стартовая позиция по всей ширине, чуть заходя за края
        state.x = (Math.random() * 1.4 - 0.2) * containerWidth - cloudWidth / 2;
        // направление зависит от стороны: если слева — вправо, если справа — влево
        const center = containerWidth / 2;
        state.direction = state.x + cloudWidth / 2 < center ? 1 : -1;
        state.speed = 10 + Math.random() * 20;
      } else {
        // перезапуск строго с краёв, в случайном направлении
        state.direction = Math.random() < 0.5 ? 1 : -1;
        state.speed = 10 + Math.random() * 20;
        if (state.direction > 0) {
          state.x = -cloudWidth - Math.random() * (containerWidth * 0.3);
        } else {
          state.x = containerWidth + Math.random() * (containerWidth * 0.3);
                }
            }

      el.style.transform = `translate3d(${state.x}px, 0, 0)`;
    };
    
    // начальная расстановка — равномерно по ширине
    requestAnimationFrame(() => {
      states.forEach((s) => initCloud(s, true));
    });

    let lastTime = performance.now();

    const loop = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const containerWidth = container.offsetWidth || 1;

      states.forEach((state) => {
        const el = state.el;
        const cloudWidth = el.offsetWidth || 0;

        state.x += state.direction * state.speed * dt;
        
        if (state.direction > 0 && state.x > containerWidth + cloudWidth) {
          initCloud(state, false);
        } else if (state.direction < 0 && state.x < -cloudWidth) {
          initCloud(state, false);
        } else {
          el.style.transform = `translate3d(${state.x}px, 0, 0)`;
        }
      });

      requestAnimationFrame(loop);
    };

    requestAnimationFrame((t) => {
      lastTime = t;
      requestAnimationFrame(loop);
    });
  };

  recolorFloatingIcon();
  setupBlogIconHover();
  setupMobileMenu();
  setupCloudsMotion();

  const setupAboutCarousel = () => {
    const viewport = document.querySelector('.about-cards-viewport');
    const track = document.querySelector('.about-cards-track');
    if (!viewport || !track) return;

    const baseCards = Array.from(track.children);
    if (!baseCards.length) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    const measureTotalWidth = () =>
      Array.from(track.children).reduce((sum, el) => sum + el.offsetWidth, 0);

    const fits = () => measureTotalWidth() <= viewport.clientWidth + 1;

    if (fits()) {
      track.style.justifyContent = 'center';
      track.style.transform = '';
      return;
    }

    // если не влезают — выравниваем влево
    track.style.justifyContent = 'flex-start';

    // для мобильных даём возможность ручного скролла со снаппингом
    if (isMobile) {
      const baseWidth = measureTotalWidth();
      // продублируем карточки один раз для бесшовной прокрутки
      baseCards.forEach((card) => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
      });

      let auto = true;
      let lastTime = performance.now();
      const speed = 40; // px / sec

      const loopWidth = baseWidth;

      const step = (now) => {
        const dt = (now - lastTime) / 1000;
        lastTime = now;

        if (auto) {
          viewport.scrollLeft += speed * dt;
          if (viewport.scrollLeft >= loopWidth) {
            viewport.scrollLeft -= loopWidth;
          }
        }

        requestAnimationFrame(step);
      };

      const pauseAuto = () => {
        auto = false;
        if (pauseAuto._timer) clearTimeout(pauseAuto._timer);
        pauseAuto._timer = setTimeout(() => {
          auto = true;
        }, 3000);
      };

      viewport.addEventListener('wheel', pauseAuto, { passive: true });
      viewport.addEventListener('touchstart', pauseAuto, { passive: true });
      viewport.addEventListener('pointerdown', pauseAuto, { passive: true });

      requestAnimationFrame((t) => {
        lastTime = t;
        requestAnimationFrame(step);
      });

      return;
    }

    // десктоп: бесконечная лента по transform
    while (measureTotalWidth() < viewport.clientWidth * 2) {
      baseCards.forEach((card) => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
});
    }

    let items = Array.from(track.children).map((el) => ({
      el,
      width: el.offsetWidth,
    }));

    const gap = (() => {
      const style = window.getComputedStyle(track);
      const gapVal = style.columnGap || style.gap || '0';
      const n = parseFloat(gapVal);
      return Number.isNaN(n) ? 0 : n;
    })();

    items = items.map((item) => ({
      ...item,
      fullWidth: item.width + gap,
    }));

    let offset = 0;
    const speed = 40; // px / sec
    let lastTime = performance.now();

    const step = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      offset -= speed * dt;

      // recycle items that left the viewport on the left
      while (items.length && -offset > items[0].fullWidth) {
        const first = items.shift();
        offset += first.fullWidth;
        track.appendChild(first.el);
        items.push(first);
      }

      track.style.transform = `translate3d(${offset}px, 0, 0)`;

      requestAnimationFrame(step);
    };

    requestAnimationFrame((t) => {
      lastTime = t;
      requestAnimationFrame(step);
    });
  };

  setupAboutCarousel();

  const setupAboutDecorReveal = () => {
    const bg = document.querySelector('.about-dec-bg');
    if (!bg) return;

    const cards = bg.querySelectorAll('.about-dec-card');
    if (!cards.length) return;

    const showCards = () => {
      cards.forEach((card) => card.classList.add('about-dec-card--visible'));
    };

    if (!('IntersectionObserver' in window)) {
      showCards();
            return;
        }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 1) {
            showCards();
            observer.disconnect();
          }
        });
      },
      { threshold: 1 }
    );

    observer.observe(bg);
  };

  setupAboutDecorReveal();

  // Parallax effect for iPhone in download banner
  const setupDownloadBannerIphoneParallax = () => {
    const downloadBanner = document.querySelector('.download-banner');
    const iphone = document.querySelector('.download-banner-iphone');
    
    if (!downloadBanner || !iphone) return;

    const handleScroll = () => {
      const bannerRect = downloadBanner.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      
      // Проверяем, видна ли секция баннера
      if (bannerRect.bottom < 0 || bannerRect.top > viewportHeight) {
        return;
      }

      // Вычисляем позицию относительно центра viewport
      const bannerCenter = bannerRect.top + bannerRect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const offset = (viewportCenter - bannerCenter) * 0.1; // Небольшая акселерация
      
      // Ограничиваем движение до ±20px
      const parallaxOffset = Math.max(-20, Math.min(20, offset));
      
      iphone.style.transform = `translateX(-50%) translateY(${-parallaxOffset}px)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  };

  const setupControlIntroStickerReveal = () => {
    const sections = document.querySelectorAll('.control-intro');
    if (!sections.length) return;

    const setupForSection = (section) => {
      const sticker = section.querySelector('.control-intro-sticker');
      const tooltip = section.querySelector('.control-intro-tooltip');
      if (!sticker && !tooltip) return;

      const reveal = () => {
        if (sticker) {
          sticker.classList.add('control-intro-sticker--visible');
        }
        if (tooltip) {
          tooltip.classList.add('control-intro-tooltip--visible');
        }
      };

      if (!('IntersectionObserver' in window)) {
        reveal();
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Появляем, когда хотя бы ~40% блока в вьюпорте
            if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
              reveal();
              observer.disconnect();
            }
          });
        },
        { threshold: 0.4 }
      );

      observer.observe(section);
    };

    sections.forEach(setupForSection);
  };

  setupDownloadBannerIphoneParallax();
  setupControlIntroStickerReveal();
});
