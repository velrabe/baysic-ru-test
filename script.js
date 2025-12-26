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

    // Обрабатываем все элементы с data-parallax
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    parallaxElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      
      // Параллакс применяется когда элемент виден в viewport
      const isVisible = rect.bottom > 0 && rect.top < viewportHeight;
      
      if (isVisible) {
        // Параллакс начинается только когда элемент полностью вошел в viewport
        // (верх элемента выше или на уровне верха viewport)
        if (rect.top <= 0) {
          // Вычисляем смещение относительно центра viewport
          const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2;
          // Применяем параллакс: элемент движется в 2 раза медленнее (коэффициент 0.5)
          const parallaxOffset = -centerOffset * 0.5;
          element.style.transform = `translateY(${parallaxOffset}px)`;
        } else {
          // До полного входа в viewport - без параллакса
          element.style.transform = '';
        }
      } else {
        // Элемент не виден - сбрасываем transform
        element.style.transform = '';
      }
    });
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
      link.addEventListener('click', (e) => {
        // Закрываем мобильное меню если открыто
        if (headerNav.classList.contains('is-open')) {
          headerNav.classList.remove('is-open');
          headerMenuToggle.setAttribute('aria-label', 'Открыть меню');
        }
        
        // Обрабатываем якорные ссылки
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            e.preventDefault();
            const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
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

  const setupAboutDecCloudsMotion = () => {
    const container = document.querySelector('.about-dec-clouds');
    if (!container) return;

    const clouds = Array.from(container.querySelectorAll('.about-dec-cloud'));
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
  setupAboutDecCloudsMotion();


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
      // Отключаем параллакс на мобильной версии
      if (window.innerWidth < 768) {
        iphone.style.transform = 'translateX(-50%) translateY(0px)';
        return;
      }

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
      
      // Ограничиваем движение от 0px до 20px (вместо -20px до 20px)
      const parallaxOffset = Math.max(0, Math.min(20, offset));
      
      iphone.style.transform = `translateX(-50%) translateY(${-parallaxOffset}px)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
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

  // Эффект разворачивания для about-problem-article
  const setupAboutProblemUnfold = () => {
    const article = document.querySelector('.about-problem-article');
    const cta = document.querySelector('.about-problem-cta-inner');
    const articleBody = document.querySelector('.about-problem-article-body');
    
    if (!article || !cta || !articleBody) return;

    // Вычисляем высоты
    const ctaHeight = cta.offsetHeight;
    
    // Получаем реальные паддинги статьи
    const computedStyle = window.getComputedStyle(article);
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
    const articlePadding = paddingTop + paddingBottom;
    
    // Начальная высота без паддингов
    const minHeight = ctaHeight;
    
    // Получаем полную высоту контента
    const articleHeader = article.querySelector('.about-problem-article-header');
    const headerHeight = articleHeader ? articleHeader.offsetHeight : 0;
    const bodyHeight = articleBody.offsetHeight;
    // Максимальная высота включает паддинги сверху и снизу
    const fullContentHeight = headerHeight + bodyHeight + ctaHeight + articlePadding;
    
    // Устанавливаем начальную высоту
    article.style.minHeight = `${minHeight}px`;
    article.style.height = `${minHeight}px`;
    
    const handleScroll = () => {
      const rect = article.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const viewportCenter = viewportHeight / 1.5;
      
      // Когда верх статьи достигает середины viewport
      if (rect.top <= viewportCenter) {
        // Вычисляем прогресс разворачивания (0 когда верх на середине, 1 когда полностью развернуто)
        const scrollProgress = Math.min(1, Math.max(0, (viewportCenter - rect.top) / (fullContentHeight - minHeight)));
        
        // Вычисляем текущую высоту
        const currentHeight = minHeight + (fullContentHeight - minHeight) * scrollProgress;
        article.style.height = `${currentHeight}px`;
      } else {
        // До начала разворачивания - минимальная высота
        article.style.height = `${minHeight}px`;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Вызываем сразу для начального состояния
  };

  setupAboutProblemUnfold();

  // Анимация семейной доски
  const setupFamilyBoardAnimation = () => {
    const vanyaScoreEl = document.querySelector('.family-member-score--vanya');
    const vanyaMemberEl = document.querySelector('.family-member--vanya');
    const mashaMemberEl = document.querySelector('.family-member--masha');
    
    if (!vanyaScoreEl || !vanyaMemberEl || !mashaMemberEl) return;

    // Вычисляем высоту карточки один раз в начале
    const cardHeight = mashaMemberEl.getBoundingClientRect().height;
    const gap = 10; // gap между элементами
    const offset = cardHeight + gap; // фиксированное смещение

    const animateScore = (from, to, duration, callback) => {
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.round(from + (to - from) * progress);
        vanyaScoreEl.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          if (callback) callback();
        }
      };

      requestAnimationFrame(animate);
    };

    const moveCards = (vanyaToTop, callback) => {
      if (vanyaToTop) {
        // Устанавливаем z-index чтобы Ваня был сверху
        vanyaMemberEl.style.zIndex = '100';
        mashaMemberEl.style.zIndex = '99';
        
        // Ваня вверх, Маша вниз
        vanyaMemberEl.style.transform = `translateY(-${offset}px)`;
        mashaMemberEl.style.transform = `translateY(${offset}px)`;
      } else {
        // Обратный процесс
        mashaMemberEl.style.zIndex = '100';
        vanyaMemberEl.style.zIndex = '99';
        
        // Ваня вниз, Маша вверх
        vanyaMemberEl.style.transform = `translateY(0px)`;
        mashaMemberEl.style.transform = `translateY(0px)`;
      }
      
      // После завершения анимации сбрасываем z-index
      setTimeout(() => {
        vanyaMemberEl.style.zIndex = '';
        mashaMemberEl.style.zIndex = '';
        
        if (callback) callback();
      }, 500);
    };

    const cycle = () => {
      // Шаг 1: Увеличиваем счетчик с 95 до 145
      animateScore(95, 145, 2000, () => {
        // Шаг 2: Перемещаем карточки (Ваня наверх)
        moveCards(true, () => {
          // Ждем немного наверху
          setTimeout(() => {
            // Шаг 3: Уменьшаем счетчик с 145 до 95
            animateScore(145, 95, 2000, () => {
              // Шаг 4: Возвращаем карточки обратно
              moveCards(false, () => {
                // Повторяем цикл через 1 секунду
                setTimeout(cycle, 1000);
              });
            });
          }, 2000);
        });
      });
    };

    // Запускаем цикл через 1 секунду после загрузки
    setTimeout(cycle, 1000);
  };

  setupFamilyBoardAnimation();

  // Reviews Slider
  const setupReviewsSlider = () => {
    const slider = document.querySelector('.reviews-slider');
    const track = document.querySelector('.reviews-slider-track');
    const prevButton = document.querySelector('.reviews-nav-button--prev');
    const nextButton = document.querySelector('.reviews-nav-button--next');
    const paginationDots = document.querySelectorAll('.reviews-pagination-dot');
    const cards = document.querySelectorAll('.review-card');

    if (!slider || !track || !prevButton || !nextButton || cards.length === 0) return;

    let currentScroll = 0;

    // Вычисляем ширину прокрутки (ширина одной карточки + gap между карточками)
    const getScrollWidth = () => {
      if (cards.length === 0) return 0;
      
      const isMobile = window.innerWidth < 768;
      
      if (isMobile) {
        // На мобильной версии показывается 1 карточка, прокручиваем на ширину одной карточки + gap
        if (cards.length >= 1) {
          const firstCardRect = cards[0].getBoundingClientRect();
          const sliderRect = slider.getBoundingClientRect();
          // Ширина карточки + gap (16px на мобильной версии)
          return firstCardRect.width + 16;
        }
        return cards[0].offsetWidth + 16;
      } else {
        // На десктопе показывается 2 карточки, используем расстояние между первой и второй
        if (cards.length >= 2) {
          const firstCardRect = cards[0].getBoundingClientRect();
          const secondCardRect = cards[1].getBoundingClientRect();
          // Реальное расстояние между карточками (включая gap)
          return secondCardRect.left - firstCardRect.left;
        }
        // Если карточка только одна, используем её ширину
        return cards[0].offsetWidth;
      }
    };

    // Вычисляем количество страниц (по 2 карточки на страницу)
    const getTotalPages = () => {
      return Math.ceil(cards.length / 2);
    };

    // Проверяем, видна ли последняя карточка (или предпоследняя на десктопе)
    const isLastCardVisible = () => {
      const isDesktop = window.innerWidth >= 768;
      
      // На десктопе (>= 768px) показывается 2 карточки одновременно
      // Блокируем кнопку когда видны карточки 3-4 (предпоследняя и последняя)
      if (isDesktop && cards.length >= 4) {
        const sliderRect = slider.getBoundingClientRect();
        // Проверяем видимость предпоследней карточки (индекс 3)
        const secondToLastCard = cards[3];
        if (secondToLastCard) {
          const cardRect = secondToLastCard.getBoundingClientRect();
          // Если предпоследняя карточка видна, значит показываются карточки 3-4
          return cardRect.right <= sliderRect.right + 20;
        }
      }
      
      // На мобиле показывается 1 карточка
      // Проверяем по позиции прокрутки: если прокрутили на (количество карточек - 1) * scrollWidth,
      // то последняя карточка видна
      const scrollWidth = getScrollWidth();
      const maxScroll = -(cards.length - 1) * scrollWidth;
      
      // Если текущая позиция прокрутки меньше или равна максимальной, значит последняя карточка видна
      return currentScroll <= maxScroll + 5; // +5 для небольшой погрешности
    };

    // Обновляем состояние кнопок
    const updateButtons = () => {
      // Блокируем кнопку влево в начальной позиции
      if (Math.abs(currentScroll) < 1) {
        prevButton.disabled = true;
      } else {
        prevButton.disabled = false;
      }

      // Блокируем кнопку вправо когда последняя карточка видна
      if (isLastCardVisible()) {
        nextButton.disabled = true;
      } else {
        nextButton.disabled = false;
      }
    };

    // Обновляем индикаторы на основе текущей позиции (карточки, а не страницы)
    const updatePagination = () => {
      const scrollWidth = getScrollWidth();
      const isMobile = window.innerWidth < 768;
      
      // Вычисляем индекс видимой карточки
      // На десктопе: currentScroll = 0 -> показываются карточки 0-1, активна карточка 0
      // На мобиле: currentScroll = 0 -> показывается карточка 0, активна карточка 0
      const cardsScrolled = Math.round(Math.abs(currentScroll) / scrollWidth);
      const activeCardIndex = Math.min(cardsScrolled, cards.length - 1);
      
      paginationDots.forEach((dot, i) => {
        if (i === activeCardIndex) {
          dot.classList.add('reviews-pagination-dot--active');
        } else {
          dot.classList.remove('reviews-pagination-dot--active');
        }
      });
    };

    // Прокрутка влево
    prevButton.addEventListener('click', () => {
      if (prevButton.disabled) return;
      
      const scrollWidth = getScrollWidth();
      currentScroll = currentScroll + scrollWidth;
      
      // Обновляем кнопки сразу, до начала анимации
      updateButtons();
      
      track.style.transform = `translateX(${currentScroll}px)`;
      
      updatePagination();
    });

    // Прокрутка вправо
    nextButton.addEventListener('click', () => {
      if (nextButton.disabled) return;
      
      const scrollWidth = getScrollWidth();
      currentScroll = currentScroll - scrollWidth;
      
      // Обновляем кнопки сразу, до начала анимации
      updateButtons();
      
      track.style.transform = `translateX(${currentScroll}px)`;
      
      updatePagination();
    });

    // Обработка изменения размера окна
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Сбрасываем позицию при изменении размера
        currentScroll = 0;
        track.style.transform = `translateX(0px)`;
        updateButtons();
        updatePagination();
      }, 250);
    });

    // Инициализация с небольшой задержкой для правильного вычисления размеров
    setTimeout(() => {
      updateButtons();
      updatePagination();
    }, 100);
  };

  setupReviewsSlider();

  // Modal
  const setupDownloadModal = () => {
    const modal = document.getElementById('download-modal');
    const closeButton = modal.querySelector('.modal-close');
    const modalForm = modal.querySelector('.modal-form');

    if (!modal) return;

    // Функция открытия модалки
    const openModal = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };

    // Функция закрытия модалки
    const closeModal = () => {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    // Закрытие по клику на overlay
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Закрытие по кнопке
    closeButton.addEventListener('click', closeModal);

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });

    // Обработка формы
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = modalForm.querySelector('.modal-input').value;
      // Здесь можно добавить отправку на сервер
      console.log('Email submitted:', email);
      // Закрываем модалку после отправки
      closeModal();
    });

    // Привязка к кнопкам
    const triggerButtons = [
      '.cta-button', // Попробовать бесплатно в hero
      '.header-nav-cta', // Скачать приложение в хедере
      '.control-feature-button', // Попробовать в control-intro
      '.reviews-cta-button', // Присоединиться в секции отзывов
      '.about-dec-button', // Кнопки сторов в about-dec
      '.download-banner-button', // Кнопки сторов в download-banner
      '.footer-store-link' // Кнопки сторов в футере
    ];

    triggerButtons.forEach(selector => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(button => {
        button.addEventListener('click', openModal);
      });
    });
  };

  setupDownloadModal();

  // Smooth scroll for footer links
  const footerLinks = document.querySelectorAll('.footer-link');
  footerLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          e.preventDefault();
          const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Footer subscribe form
  const footerSubscribeForm = document.querySelector('.footer-subscribe-form');
  if (footerSubscribeForm) {
    footerSubscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = footerSubscribeForm.querySelector('.footer-subscribe-input').value;
      // Здесь можно добавить отправку на сервер
      console.log('Footer subscription:', email);
      footerSubscribeForm.querySelector('.footer-subscribe-input').value = '';
    });
  }
});
