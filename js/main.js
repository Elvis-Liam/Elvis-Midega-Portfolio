(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Entrance sequence
     --------------------------------------------------------- */
  function runEntrance() {
    var entrance = document.getElementById('entrance');
    if (!entrance) return;

    if (reduceMotion) {
      entrance.remove();
      return;
    }

    document.body.style.overflow = 'hidden';

    window.setTimeout(function () {
      entrance.classList.add('is-hidden');
      document.body.style.overflow = '';
      entrance.addEventListener('transitionend', function handler() {
        entrance.remove();
        entrance.removeEventListener('transitionend', handler);
      });
    }, 1200);
  }

  /* ---------------------------------------------------------
     Live clock, Africa/Nairobi
     --------------------------------------------------------- */
  function startClock() {
    var el = document.getElementById('clockTime');
    if (!el) return;

    var formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Nairobi',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    function tick() {
      el.textContent = formatter.format(new Date());
    }

    tick();
    window.setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------
     Mobile menu
     --------------------------------------------------------- */
  function initMobileMenu() {
    var toggle = document.getElementById('menuToggle');
    var panel = document.getElementById('mobileNav');
    if (!toggle || !panel) return;

    function closeMenu() {
      toggle.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
      document.body.style.overflow = '';
    }

    function openMenu() {
      toggle.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
      document.body.style.overflow = 'hidden';
    }

    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    panel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 960) {
        closeMenu();
      }
    });
  }

  /* ---------------------------------------------------------
     Scroll-spy: highlight the active nav item
     --------------------------------------------------------- */
  function initScrollSpy() {
    var sections = document.querySelectorAll('.section[data-section]');
    var navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    if (!sections.length || !navLinks.length) return;

    function setActive(id) {
      navLinks.forEach(function (link) {
        var match = link.getAttribute('data-section') === id;
        link.classList.toggle('active', match);
      });
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActive(entry.target.getAttribute('data-section'));
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ---------------------------------------------------------
     Portrait / image fallback frames
     --------------------------------------------------------- */
  function initImageFallbacks() {
    document.querySelectorAll('.portrait-img, .project-frame img').forEach(function (img) {
      img.addEventListener('error', function () {
        var frame = img.closest('.hero-visual, .portrait-frame, .project-frame');
        if (frame) frame.classList.add('is-missing');
      });
    });
  }

  /* ---------------------------------------------------------
     Scroll reveals
     --------------------------------------------------------- */
  function initScrollReveals() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (reduceMotion) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    );

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------
     Footer year: no footer exists yet (that lands in a later
     phase), this just wires up #year as soon as it does.
     --------------------------------------------------------- */
  function setYear() {
    var el = document.getElementById('year');
    if (!el) return;
    el.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------
     Vanta background, hero only
     Pinned: three.js r134 + vanta 0.5.24. Loaded from cdnjs,
     deferred until after first paint. Skipped entirely on
     reduced motion and on save-data connections. Destroyed
     when the hero leaves the viewport, recreated when it
     returns. Any load or WebGL failure is caught and left as a
     silent, solid-color fallback.
     --------------------------------------------------------- */
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  function initVantaBackground() {
    var mount = document.getElementById('vantaBg');
    var heroSection = document.getElementById('home');
    if (!mount || reduceMotion) return;
    if (navigator.connection && navigator.connection.saveData) return;

    var effect = null;
    var scriptsReady = false;

    function vantaColors() {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      var isMobile = window.innerWidth < 680;
      return isLight
        ? { backgroundColor: 0xF4F1EA, color: 0xB9B3A6, points: isMobile ? 5.0 : 8.0 }
        : { backgroundColor: 0x0A0A0A, color: 0x3A3A3A, points: isMobile ? 5.0 : 8.0 };
    }

    function create() {
      if (effect || !window.VANTA || !window.VANTA.NET) return;
      try {
        var colors = vantaColors();
        effect = window.VANTA.NET({
          el: mount,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          backgroundColor: colors.backgroundColor,
          color: colors.color,
          points: colors.points,
          maxDistance: 22.00,
          spacing: 18.00,
          showDots: false
        });
      } catch (e) {
        /* WebGL or Vanta failure: mount stays empty, solid section
           background from the theme tokens shows through instead */
        effect = null;
      }
    }

    function destroy() {
      if (effect && typeof effect.destroy === 'function') {
        effect.destroy();
      }
      effect = null;
    }

    new MutationObserver(function () {
      if (effect && typeof effect.setOptions === 'function') {
        effect.setOptions(vantaColors());
      }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    if (heroSection && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (scriptsReady) create();
          } else {
            destroy();
          }
        });
      }, { threshold: 0 }).observe(heroSection);
    }

    window.addEventListener('load', function () {
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js')
        .then(function () {
          return loadScript('https://cdnjs.cloudflare.com/ajax/libs/vanta/0.5.24/vanta.net.min.js');
        })
        .then(function () {
          scriptsReady = true;
          var stillOnScreen = !heroSection || heroSection.getBoundingClientRect().top < window.innerHeight;
          if (stillOnScreen) create();
        })
        .catch(function () {
          /* script failed to load, e.g. offline: silent fallback */
        });
    });
  }

  /* ---------------------------------------------------------
     Init
     --------------------------------------------------------- */
  function init() {
    runEntrance();
    startClock();
    initMobileMenu();
    initScrollSpy();
    initImageFallbacks();
    initScrollReveals();
    setYear();
    initVantaBackground();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
