(function () {
  'use strict';

  /* Kept here as data, matching the six quotes already rendered
     statically in index.html (all stacked in the same grid cell
     so the tallest one reserves the height). This array exists so
     future edits only need to happen in one place; it is not used
     to build the DOM. */
  var QUOTES = [
    { text: "Any code of your own that you haven't looked at for six or more months might as well have been written by someone else.", author: "Eagleson's Law" },
    { text: "Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live.", author: 'John Woods' },
    { text: 'There are only two hard things in Computer Science: cache invalidation and naming things.', author: 'Phil Karlton' },
    { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' },
    { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay' },
    { text: 'Programs must be written for people to read, and only incidentally for machines to execute.', author: 'Harold Abelson' }
  ];

  function init() {
    var items = document.querySelectorAll('.quote-item');
    var btn = document.getElementById('newQuoteBtn');
    if (!items.length || !btn) return;

    var current = 0;
    items.forEach(function (item, i) {
      if (item.classList.contains('is-active')) current = i;
    });

    function show(index) {
      items.forEach(function (item, i) {
        var active = i === index;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      current = index;
    }

    btn.addEventListener('click', function () {
      if (items.length < 2) return;
      var next;
      do {
        next = Math.floor(Math.random() * items.length);
      } while (next === current);
      show(next);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.PORTFOLIO_QUOTES = QUOTES;
})();
