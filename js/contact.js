/* ============================================================
   DELIVERY CONFIG
   Fill in your own keys below, then set "provider" to whichever
   service you're using. Both Web3Forms and EmailJS are public,
   client-side keys: they are visible in this file's source in
   the browser by design, that is how these services work. The
   safety net is on the service's own dashboard, not secrecy:
   go there and restrict the key to your real domain(s) so it
   cannot be used to send mail from anywhere else.
   ============================================================ */
var FORM_CONFIG = {
  provider: 'web3forms', // 'web3forms' or 'emailjs'

  web3forms: {
    accessKey: 'YOUR_WEB3FORMS_ACCESS_KEY', // from https://web3forms.com
    endpoint: 'https://api.web3forms.com/submit'
  },

  emailjs: {
    publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
    serviceId: 'YOUR_EMAILJS_SERVICE_ID',
    templateId: 'YOUR_EMAILJS_TEMPLATE_ID'
  }
};

(function () {
  'use strict';

  /* ---------------------------------------------------------
     Let's Connect dropdown
     --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     Work With Me contact form
     --------------------------------------------------------- */
  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var confirmation = document.getElementById('formConfirmation');
    var status = document.getElementById('formStatus');
    var submitBtn = document.getElementById('submitBtn');
    var honeypot = document.getElementById('website');
    var messageInput = document.getElementById('message');
    var counter = document.getElementById('message-counter');
    var MESSAGE_MAX = 1500;
    var MIN_SUBMIT_MS = 3000;
    var loadedAt = Date.now();

    var fields = {
      name: { el: document.getElementById('name'), min: 2, max: 80, required: true },
      email: { el: document.getElementById('email'), required: true, isEmail: true },
      company: { el: document.getElementById('company'), min: 0, max: 120, required: false },
      need: { el: document.getElementById('need'), min: 3, max: 120, required: true },
      message: { el: messageInput, min: 1, max: MESSAGE_MAX, required: true }
    };

    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function errorElFor(key) {
      return document.getElementById(key + '-error');
    }

    function setFieldError(key, message) {
      var field = fields[key];
      var errorEl = errorElFor(key);
      if (message) {
        field.el.setAttribute('aria-invalid', 'true');
        if (errorEl) {
          errorEl.textContent = message; // never innerHTML
          errorEl.hidden = false;
        }
      } else {
        field.el.setAttribute('aria-invalid', 'false');
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.hidden = true;
        }
      }
    }

    function validateField(key) {
      var field = fields[key];
      var value = field.el.value.trim();

      if (field.required && value.length === 0) {
        var label = key === 'need' ? 'Let me know what you need.' : 'This field is required.';
        setFieldError(key, label);
        return false;
      }
      if (field.isEmail && value.length > 0 && !EMAIL_RE.test(value)) {
        setFieldError(key, 'Enter a valid email address.');
        return false;
      }
      if (typeof field.min === 'number' && value.length > 0 && value.length < field.min) {
        setFieldError(key, 'Please use at least ' + field.min + ' characters.');
        return false;
      }
      if (typeof field.max === 'number' && value.length > field.max) {
        setFieldError(key, 'Please keep this under ' + field.max + ' characters.');
        return false;
      }
      setFieldError(key, null);
      return true;
    }

    function validateAll() {
      var order = ['name', 'email', 'company', 'need', 'message'];
      var firstInvalid = null;
      var allValid = true;
      order.forEach(function (key) {
        var valid = validateField(key);
        if (!valid) {
          allValid = false;
          if (!firstInvalid) firstInvalid = fields[key].el;
        }
      });
      if (firstInvalid) {
        // Deferred: a submit triggered by clicking the button can
        // otherwise have the browser refocus the button itself
        // right after this runs, silently undoing the focus move.
        window.setTimeout(function () {
          firstInvalid.focus();
        }, 0);
      }
      return allValid;
    }

    function updateCounter() {
      var len = messageInput.value.length;
      counter.textContent = len + ' / ' + MESSAGE_MAX; // never innerHTML
      counter.classList.toggle('is-near-limit', len > MESSAGE_MAX - 100);
    }

    if (messageInput && counter) {
      messageInput.addEventListener('input', updateCounter);
      updateCounter();
    }

    Object.keys(fields).forEach(function (key) {
      var el = fields[key].el;
      if (!el) return;
      el.addEventListener('blur', function () {
        validateField(key);
      });
    });

    function setStatus(message, isError) {
      status.textContent = message; // never innerHTML
      status.classList.toggle('is-error', !!isError);
    }

    function setSubmitting(isSubmitting) {
      submitBtn.disabled = isSubmitting;
      submitBtn.setAttribute('aria-busy', isSubmitting ? 'true' : 'false');
    }

    function showConfirmation() {
      form.hidden = true;
      confirmation.hidden = false;
    }

    function loadScriptOnce(src) {
      return new Promise(function (resolve, reject) {
        if (document.querySelector('script[src="' + src + '"]')) return resolve();
        var script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    }

    function submitToWeb3Forms(payload) {
      return fetch(FORM_CONFIG.web3forms.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.assign({ access_key: FORM_CONFIG.web3forms.accessKey }, payload))
      }).then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok || !data.success) throw new Error('web3forms request failed');
        });
      });
    }

    function submitToEmailJs(payload) {
      return loadScriptOnce('https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js')
        .then(function () {
          window.emailjs.init({ publicKey: FORM_CONFIG.emailjs.publicKey });
          return window.emailjs.send(FORM_CONFIG.emailjs.serviceId, FORM_CONFIG.emailjs.templateId, payload);
        });
    }

    function submitPayload(payload) {
      if (FORM_CONFIG.provider === 'emailjs') return submitToEmailJs(payload);
      return submitToWeb3Forms(payload);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Honeypot: a real visitor can never fill this in, it isn't
         visible or reachable by keyboard. If it has a value, drop
         the submission without any visible change. */
      if (honeypot && honeypot.value.trim() !== '') {
        return;
      }

      /* Minimum time-to-submit: a very fast submission is more
         likely a bot than someone who actually read the form. */
      if (Date.now() - loadedAt < MIN_SUBMIT_MS) {
        setStatus('Please take a moment to review the form, then send again.', true);
        return;
      }

      if (!validateAll()) {
        setStatus('Please fix the highlighted fields.', true);
        return;
      }

      var payload = {
        name: fields.name.el.value.trim(),
        email: fields.email.el.value.trim(),
        company: fields.company.el.value.trim(),
        need: fields.need.el.value.trim(),
        message: fields.message.el.value.trim(),
        subject: 'New message from portfolio: ' + fields.name.el.value.trim()
      };

      setSubmitting(true);
      setStatus('Sending...', false);

      submitPayload(payload)
        .then(function () {
          setSubmitting(false);
          showConfirmation();
        })
        .catch(function () {
          setSubmitting(false);
          setStatus('Something went wrong sending your message. Please try again, your entries are still here.', true);
        });
    });
  }

  function init() {
    initConnectDropdown();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
