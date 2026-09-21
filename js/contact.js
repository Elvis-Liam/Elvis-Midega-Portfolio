(function () {
  'use strict';

  function initConnectDropdown() {
    var wrapper = document.getElementById('connectDropdown');
    var trigger = document.getElementById('connectTrigger');
    var menu = document.getElementById('connectMenu');
    if (!wrapper || !trigger || !menu) return;

    var items = Array.prototype.slice.call(menu.querySelectorAll('.dropdown-item'));

    function isOpen() {
      return trigger.getAttribute('aria-expanded') === 'true';
    }

    /* Keeps the menu inside the viewport on narrow screens: it
       always tries to hang left-aligned under the trigger, and
       only shifts left of that if it would otherwise overflow
       the right edge. */
    function positionMenu() {
      menu.style.left = '0px';
      var rect = menu.getBoundingClientRect();
      var overflow = rect.right - window.innerWidth + 20;
      if (overflow > 0) {
        menu.style.left = -overflow + 'px';
      }
    }

    function onOutsideClick(e) {
      if (!wrapper.contains(e.target)) close(false);
    }

    function onKeydown(e) {
      var currentIndex = items.indexOf(document.activeElement);
      if (e.key === 'Escape') {
        e.preventDefault();
        close(true);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[(currentIndex + 1 + items.length) % items.length].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[(currentIndex - 1 + items.length) % items.length].focus();
      }
    }

    function open() {
      menu.hidden = false;
      positionMenu();
      /* force layout so the opacity/transform transition runs
         from its starting values instead of jumping straight in */
      void menu.offsetHeight;
      menu.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      document.addEventListener('click', onOutsideClick);
      document.addEventListener('keydown', onKeydown);
    }

    function close(focusTrigger) {
      menu.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', onOutsideClick);
      document.removeEventListener('keydown', onKeydown);
      window.setTimeout(function () {
        menu.hidden = true;
      }, 200);
      if (focusTrigger) trigger.focus();
    }

    trigger.addEventListener('click', function () {
      if (isOpen()) {
        close(false);
      } else {
        open();
      }
    });

    items.forEach(function (item) {
      item.addEventListener('click', function () {
        close(false);
      });
    });

    window.addEventListener('resize', function () {
      if (isOpen()) positionMenu();
    });
  }

  function init() {
    initConnectDropdown();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
