(function () {
  'use strict';

  /* This file was missing from the uploaded top bar files (only the
     pre-paint script in <head> was present). Rebuilt here to match
     that script's pattern: same storage key, same attributes. */

  var STORAGE_KEY = 'elvis-theme';
  var buttons = document.querySelectorAll('.theme-btn');
  var mql = window.matchMedia('(prefers-color-scheme: light)');

  function resolve(pref) {
    return pref === 'system' ? (mql.matches ? 'light' : 'dark') : pref;
  }

  function currentPref() {
    return document.documentElement.getAttribute('data-theme-pref') || 'system';
  }

  function updatePressedStates(pref) {
    buttons.forEach(function (btn) {
      var isActive = btn.getAttribute('data-theme-choice') === pref;
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function setTheme(pref) {
    document.documentElement.setAttribute('data-theme', resolve(pref));
    document.documentElement.setAttribute('data-theme-pref', pref);
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch (e) {
      /* storage unavailable, e.g. private mode: theme still applies
         for this page view, just does not persist */
    }
    updatePressedStates(pref);
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTheme(btn.getAttribute('data-theme-choice'));
    });
  });

  /* Keep a "system" preference live if the OS theme changes
     while the page is open */
  mql.addEventListener('change', function () {
    if (currentPref() === 'system') {
      document.documentElement.setAttribute('data-theme', resolve('system'));
    }
  });

  updatePressedStates(currentPref());
})();
