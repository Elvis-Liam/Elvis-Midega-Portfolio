(function () {
  'use strict';

  /* The list in index.html is the real, server-rendered markup,
     this data is not used to build it. It mirrors that markup so
     later phases (e.g. a filterable or searchable view) have a
     single source of truth instead of re-reading the DOM. */
  var PROJECTS = [
    {
      id: 'chatapp',
      name: 'ChatApp',
      status: 'live',
      url: 'https://chat-app-smoky-chi-76.vercel.app/',
      tech: ['C#', '.NET', 'ASP.NET', 'Cryptography', 'JWT', 'SignalR', 'Web APIs']
    },
    {
      id: 'attachify',
      name: 'Attachify',
      status: 'development',
      url: null,
      tech: ['Python', 'Web Scraping', 'Automation', 'Data Processing', 'M-Pesa', 'Web Development']
    },
    {
      id: 'algorithmic-mind',
      name: 'Algorithmic Mind',
      status: 'development',
      url: null,
      tech: ['Python', 'Web Scraping', 'Automation', 'Databases', 'Editorial Systems', 'Software', 'Artificial Intelligence']
    },
    {
      id: 'chama-manager',
      name: 'Chama Management System',
      status: 'live',
      url: 'https://chamamanager.netlify.app/',
      tech: ['JavaScript', 'Web Development', 'Database Design', 'User Management']
    },
    {
      id: 'salon-management',
      name: 'Salon Management System',
      status: 'live',
      url: 'https://elvis-salon.iceiy.com/?i=1',
      tech: ['Role-Based Access Control', 'M-Pesa STK Push', 'Authentication', 'Authorization', 'Database Design']
    }
  ];

  /* Touch devices have no hover state, so the 1.03 image scale on
     .project-frame never triggers on tap. This toggles the same
     CSS hook (.is-touched) on tap for touch-capable devices only,
     it does not change mouse or keyboard behaviour. */
  function initTouchPreview() {
    if (!('ontouchstart' in window)) return;

    document.querySelectorAll('.project-frame').forEach(function (frame) {
      frame.addEventListener('touchstart', function () {
        document.querySelectorAll('.project-frame.is-touched').forEach(function (other) {
          if (other !== frame) other.classList.remove('is-touched');
        });
        frame.classList.toggle('is-touched');
      }, { passive: true });
    });
  }

  function init() {
    initTouchPreview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Exposed for later phases without re-declaring the data */
  window.PORTFOLIO_PROJECTS = PROJECTS;
})();
