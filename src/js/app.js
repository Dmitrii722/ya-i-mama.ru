/**
 * Я и МАМА — Main application
 */
(function () {
  'use strict';

  /* ---- Custom cursor ---- */
  function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
    });

    function animateRing() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll('a, button, .studio-portal, .cert-thumb, input, select, textarea').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
  }

  /* ---- Animated counters ---- */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || '';
          const duration = 2000;
          const start = performance.now();

          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(target * eased) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          observer.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((c) => observer.observe(c));
  }

  /* ---- Fog scroll & section reveal ---- */
  function initScrollEffects() {
    const fog = document.querySelector('.fog-layer');
    const screens = document.querySelectorAll('.screen');

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
    );

    screens.forEach((s) => revealObserver.observe(s));

    let lastScroll = 0;
    let fogTimeout;

    window.addEventListener(
      'scroll',
      () => {
        const current = window.scrollY;
        const velocity = Math.abs(current - lastScroll);

        if (fog && velocity > 8) {
          fog.classList.add('active');
          clearTimeout(fogTimeout);
          fogTimeout = setTimeout(() => fog.classList.remove('active'), 400);
        }

        lastScroll = current;
      },
      { passive: true }
    );
  }

  /* ---- Page transitions ---- */
  function initPageTransitions() {
    document.querySelectorAll('[data-fog-link]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http')) return;

        e.preventDefault();
        const fog = document.querySelector('.fog-layer');
        if (fog) {
          fog.classList.add('page-transition');
          setTimeout(() => { window.location.href = href; }, 600);
        } else {
          window.location.href = href;
        }
      });
    });
  }

  /* ---- Mobile navigation ---- */
  function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.main-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });

    nav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('open');
      });
    });
  }

  /* ---- Reviews carousel with swipe ---- */
  function initCarousel() {
    const carousel = document.querySelector('.reviews-carousel');
    if (!carousel) return;

    const track = carousel.querySelector('.reviews-track');
    const slides = track.querySelectorAll('.review-card');
    const prevBtn = carousel.querySelector('[data-carousel-prev]');
    const nextBtn = carousel.querySelector('[data-carousel-next]');
    let index = 0;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    function goTo(i) {
      index = ((i % slides.length) + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + index * 100 + '%)';
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1));

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', () => {
      if (!isDragging) return;
      const diff = startX - currentX;
      if (Math.abs(diff) > 50) goTo(diff > 0 ? index + 1 : index - 1);
      isDragging = false;
    });
  }

  /* ---- FAQ accordion ---- */
  function initFAQ() {
    document.querySelectorAll('.faq-question').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach((i) => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
        btn.setAttribute('aria-expanded', String(!wasOpen));
      });
    });
  }

  /* ---- Certificate modal ---- */
  function initModal() {
    const overlay = document.querySelector('.modal-overlay');
    if (!overlay) return;

    const img = overlay.querySelector('.modal-content img');
    const closeBtn = overlay.querySelector('.modal-close');
    let scale = 1;

    document.querySelectorAll('.cert-thumb').forEach((btn) => {
      btn.addEventListener('click', () => {
        const src = btn.dataset.full || btn.querySelector('img').src;
        const alt = btn.querySelector('img').alt;
        img.src = src;
        img.alt = alt;
        scale = 1;
        img.style.transform = 'scale(1)';
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeModal() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });

    img.addEventListener('click', () => {
      scale = scale === 1 ? 2 : 1;
      img.style.transform = 'scale(' + scale + ')';
      img.style.transition = 'transform 0.3s';
      img.style.cursor = scale > 1 ? 'zoom-out' : 'zoom-in';
    });
  }

  /* ---- Tour tabs ---- */
  function initTourTabs() {
    document.querySelectorAll('.tour-tabs').forEach((tabBar) => {
      const tabs = tabBar.querySelectorAll('.tour-tab');
      const panels = tabBar.parentElement.querySelectorAll('.tour-panel');

      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          const target = tab.dataset.tab;
          tabs.forEach((t) => t.classList.remove('active'));
          panels.forEach((p) => p.classList.remove('active'));
          tab.classList.add('active');
          document.getElementById(target)?.classList.add('active');
        });
      });
    });
  }

  /* ---- Cookie banner ---- */
  function initCookieBanner() {
    const banner = document.querySelector('.cookie-banner');
    if (!banner) return;

    const key = 'yaimama_cookie_consent';
    if (localStorage.getItem(key)) return;

    setTimeout(() => banner.classList.add('visible'), 1200);

    banner.querySelector('.cookie-accept')?.addEventListener('click', () => {
      localStorage.setItem(key, 'accepted');
      banner.classList.remove('visible');
    });

    banner.querySelector('.cookie-decline')?.addEventListener('click', () => {
      localStorage.setItem(key, 'declined');
      banner.classList.remove('visible');
    });
  }

  /* ---- Lazy loading heavy blocks ---- */
  function initLazyBlocks() {
    const lazyBlocks = document.querySelectorAll('[data-lazy-block]');
    if (!lazyBlocks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const block = entry.target;
          block.querySelectorAll('iframe[data-src]').forEach((iframe) => {
            iframe.src = iframe.dataset.src;
          });
          block.classList.add('loaded');
          observer.unobserve(block);
        });
      },
      { rootMargin: '200px' }
    );

    lazyBlocks.forEach((b) => observer.observe(b));
  }

  /* ---- Back to top ---- */
  function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---- Contact form ---- */
  function initForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = form.querySelector('.form-status') || document.createElement('p');
      status.className = 'form-status';
      status.textContent = 'Спасибо! Мы свяжемся с вами в ближайшее время.';
      status.style.color = 'var(--bronze)';
      status.style.marginTop = '1rem';
      if (!form.querySelector('.form-status')) form.appendChild(status);
      form.reset();
    });
  }

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initCounters();
    initScrollEffects();
    initPageTransitions();
    initNav();
    initCarousel();
    initFAQ();
    initModal();
    initTourTabs();
    initCookieBanner();
    initLazyBlocks();
    initBackToTop();
    initForm();

    document.querySelectorAll('.screen').forEach((s, i) => {
      if (i === 0) s.classList.add('visible');
    });
  });
})();
