// Screen animation controller
class ScreenAnimator {
    constructor() {
        this.screens = document.querySelectorAll('.app-screen');
        this.currentScreenIndex = 0;
        this.screenOrder = ['locked', 'home', 'reward'];
        this.animationDuration = 3000; // 3 seconds per screen
        this.transitionDuration = 600; // 600ms transition
        this.init();
    }

    init() {
        // Set initial screen - only show locked screen
        this.showScreen(0);
        
        // Disable automatic rotation for now to match the reference
        // this.startRotation();
    }

    showScreen(index) {
        // Remove active class from all screens
        this.screens.forEach((screen, i) => {
            screen.classList.remove('active', 'prev');
            
            if (i === index) {
                screen.classList.add('active');
            } else if (i < index) {
                screen.classList.add('prev');
            }
        });
        
        this.currentScreenIndex = index;
    }

    nextScreen() {
        const nextIndex = (this.currentScreenIndex + 1) % this.screens.length;
        this.showScreen(nextIndex);
    }

    startRotation() {
        setInterval(() => {
            this.nextScreen();
        }, this.animationDuration);
    }
}

// Progress circle animation
class ProgressAnimation {
    constructor() {
        this.progressCircle = document.querySelector('.progress-ring-circle');
        if (this.progressCircle) {
            this.animateProgress();
        }
    }

    animateProgress() {
        const radius = 50;
        const circumference = 2 * Math.PI * radius;
        const progress = 75; // 75%
        const offset = circumference - (progress / 100) * circumference;
        
        this.progressCircle.style.strokeDasharray = circumference;
        this.progressCircle.style.strokeDashoffset = offset;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ScreenAnimator();
    new ProgressAnimation();
    
    // Add smooth entrance animations
    const heroLeft = document.querySelector('.hero-left');
    const heroRight = document.querySelector('.hero-right');
    
    if (heroLeft && heroRight) {
        heroLeft.style.opacity = '0';
        heroLeft.style.transform = 'translateX(-30px)';
        heroRight.style.opacity = '0';
        heroRight.style.transform = 'translateX(30px)';
        
        setTimeout(() => {
            heroLeft.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            heroRight.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            heroLeft.style.opacity = '1';
            heroLeft.style.transform = 'translateX(0)';
            heroRight.style.opacity = '1';
            heroRight.style.transform = 'translateX(0)';
        }, 100);
    }
});

// Button click handlers
document.addEventListener('DOMContentLoaded', () => {
    const btnPrimary = document.querySelectorAll('.btn-primary');
    const btnSecondary = document.querySelectorAll('.btn-secondary');
    
    // Download button handlers
    btnPrimary.forEach(btn => {
        btn.addEventListener('click', () => {
            // Add your download logic here
            console.log('Download app clicked');
            // You can add actual download link or app store redirect
        });
    });
    
    // View features button handlers - scroll to features section
    btnSecondary.forEach(btn => {
        btn.addEventListener('click', () => {
            const featuresSection = document.querySelector('.features-section');
            if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // Smooth scroll for anchor links with header offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                const headerHeight = 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const mobileMenu = document.querySelector('.mobile-menu');
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    toggleMobileMenu();
                }
            }
        });
    });
    
    // Header scroll effect
    const header = document.querySelector('.main-header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
});

// Mobile menu functionality
function toggleMobileMenu() {
    const nav = document.querySelector('.main-nav');
    const actions = document.querySelector('.header-actions');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    if (!nav || !actions) return;
    
    nav.classList.toggle('mobile-active');
    actions.classList.toggle('mobile-active');
    toggle.classList.toggle('active');
    
    // Animate hamburger icon
    const spans = toggle.querySelectorAll('span');
    if (toggle.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Animate elements on scroll
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.feature-card, .step-item, .family-feature, .character-emotion, .reward-feature, .content-item, .parent-feature, .security-item, .benefit-card, .gamification-card');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Tasks scroll effect with stacking
    initTasksScrollEffect();
});

// Tasks scroll stacking effect
function initTasksScrollEffect() {
    const tasksSection = document.querySelector('.tasks-section');
    const taskCards = document.querySelectorAll('.task-example-card');
    
    if (!tasksSection || taskCards.length === 0) return;
    
    let ticking = false;
    
    function updateCards() {
        const sectionRect = tasksSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const isVisible = sectionRect.bottom > 0 && sectionRect.top < windowHeight;

        // Match CSS: .task-example-card { top: 180px; }
        const stickyTop = 180;
        const peekOffset = 18; // "чуть вниз" для эффекта колоды (и зона плавного сдвига)

        // If section isn't visible, reset transforms to avoid odd states
        if (!isVisible) {
            taskCards.forEach((card) => {
                card.style.transform = '';
                card.style.opacity = '';
                card.style.zIndex = '';
            });
            ticking = false;
            return;
        }

        // Active card = последняя карточка, которая уже "упёрлась" в sticky потолок
        let activeIndex = -1;
        taskCards.forEach((card) => {
            const idx = Number(card.dataset.index ?? 0);
            const rect = card.getBoundingClientRect();
            if (rect.top <= stickyTop + 1) activeIndex = Math.max(activeIndex, idx);
        });

        // Плавный "перекрёстный" сдвиг в последние peekOffset px до прилипания следующей карточки:
        // когда следующая карточка (activeIndex+1) подходит к потолку, предыдущие плавно уезжают вниз на 18px.
        let preShift = 0;
        const nextIndex = activeIndex + 1;
        const nextCard = [...taskCards].find((c) => Number(c.dataset.index ?? 0) === nextIndex);
        if (nextCard) {
            const nextTop = nextCard.getBoundingClientRect().top;
            // nextTop: stickyTop + peekOffset  ->  stickyTop
            // progress: 0 -> 1
            const t = (stickyTop + peekOffset - nextTop) / peekOffset;
            preShift = Math.max(0, Math.min(1, t)) * peekOffset;
        }

        taskCards.forEach((card) => {
            const idx = Number(card.dataset.index ?? 0);
            const isStuck = activeIndex >= 0 && idx <= activeIndex;

            // Все предыдущие карточки сдвигаем вниз, чтобы проглядывали снизу (колода)
            // + preShift даёт плавный сдвиг в момент, когда следующая карточка "доприлипает"
            const baseOffset = isStuck && idx < activeIndex ? (activeIndex - idx) * peekOffset : 0;
            const offset = isStuck && idx < activeIndex ? baseOffset + preShift : 0;

            // Стабильный z-index: чем дальше карточка — тем выше всегда.
            // Так она не "выпрыгивает" при смене состояния/transform.
            const zIndex = 1000 + idx;

            card.style.transform = offset ? `translateY(${offset}px)` : '';
            card.style.opacity = ''; // без fading
            card.style.zIndex = String(zIndex);
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateCards);
            ticking = true;
        }
    }
    
    // Initialize cards with starting positions
    // Start with a consistent state
    updateCards();
    
    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick);
    
    // Initial call - call multiple times to ensure it works
    setTimeout(updateCards, 50);
    setTimeout(updateCards, 200);
}

