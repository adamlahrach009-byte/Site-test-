/**
 * Quick photo — scripts communs (vanilla JS, sans dépendance).
 * En-tête, menu mobile, apparition au défilement, bouton flottant,
 * chargement à la demande de la visionneuse photo.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var each = function (list, fn) {
    Array.prototype.forEach.call(list, fn);
  };

  /* Défilement (un seul écouteur, throttlé) */
  var ticking = false;
  var scrollHandlers = [];
  function onScroll(fn) {
    scrollHandlers.push(fn);
    fn();
  }
  window.addEventListener(
    'scroll',
    function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        scrollHandlers.forEach(function (fn) {
          fn();
        });
        ticking = false;
      });
    },
    { passive: true }
  );

  onScroll(function () {
    var header = document.querySelector('[data-header]');
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  });

  /* Menu mobile */
  function setInert(value) {
    each(document.querySelectorAll('#MainContent, .shopify-section-group-footer-group, [data-floating-cta], .section-announcement'), function (el) {
      if (value) el.setAttribute('inert', '');
      else el.removeAttribute('inert');
    });
  }

  function initMenu(scope) {
    each((scope || document).querySelectorAll('[data-menu-toggle]'), function (toggle) {
      if (toggle.dataset.ready) return;
      toggle.dataset.ready = 'true';
      var menu = document.getElementById(toggle.getAttribute('aria-controls'));
      var header = toggle.closest('[data-header]');
      var label = toggle.querySelector('[data-menu-toggle-label]');
      if (!menu || !header) return;

      function size() {
        menu.style.height = Math.max(window.innerHeight - header.getBoundingClientRect().bottom, 240) + 'px';
      }

      function onKeydown(event) {
        if (event.key === 'Escape') {
          event.preventDefault();
          close(true);
        } else if (event.key === 'Tab') {
          var items = [toggle].concat(Array.prototype.slice.call(menu.querySelectorAll('a[href], button:not([disabled])')));
          var first = items[0];
          var last = items[items.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }

      function open() {
        toggle.setAttribute('aria-expanded', 'true');
        if (label) label.textContent = toggle.dataset.labelClose;
        size();
        menu.hidden = false;
        root.classList.add('menu-open');
        setInert(true);
        window.requestAnimationFrame(function () {
          menu.classList.add('is-open');
        });
        document.addEventListener('keydown', onKeydown);
        window.addEventListener('resize', size);
      }

      function close(returnFocus) {
        if (toggle.getAttribute('aria-expanded') !== 'true') return;
        toggle.setAttribute('aria-expanded', 'false');
        if (label) label.textContent = toggle.dataset.labelOpen;
        menu.classList.remove('is-open');
        root.classList.remove('menu-open');
        setInert(false);
        document.removeEventListener('keydown', onKeydown);
        window.removeEventListener('resize', size);
        window.setTimeout(function () {
          if (toggle.getAttribute('aria-expanded') === 'false') menu.hidden = true;
        }, reduceMotion.matches ? 0 : 320);
        if (returnFocus) toggle.focus();
      }

      toggle.addEventListener('click', function () {
        if (toggle.getAttribute('aria-expanded') === 'true') close(false);
        else open();
      });
      menu.addEventListener('click', function (event) {
        if (event.target.closest('a')) close(false);
      });
      var desktop = window.matchMedia && window.matchMedia('(min-width: 990px)');
      if (desktop && desktop.addEventListener) {
        desktop.addEventListener('change', function (event) {
          if (event.matches) close(false);
        });
      }
    });
  }

  /* Apparition au défilement */
  var observer = null;
  function initReveal(scope) {
    var items = (scope || document).querySelectorAll('[data-reveal]:not(.is-revealed)');
    if (!root.classList.contains('js-reveal') || !('IntersectionObserver' in window)) {
      each(items, function (el) {
        el.classList.add('is-revealed');
      });
      return;
    }
    root.classList.add('reveal-ready');
    if (!observer) {
      observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0 }
      );
    }
    each(items, function (el) {
      observer.observe(el);
    });
  }

  /* Bouton flottant (mobile) : masqué près des autres appels à l'action */
  function initFloatingCta() {
    var cta = document.querySelector('[data-floating-cta]');
    if (!cta || cta.dataset.ready) return;
    cta.dataset.ready = 'true';
    var hiddenBy = new Set();
    function update() {
      var visible = window.scrollY > 420 && hiddenBy.size === 0 && !root.classList.contains('menu-open');
      cta.classList.toggle('is-visible', visible);
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) hiddenBy.add(entry.target);
          else hiddenBy.delete(entry.target);
        });
        update();
      });
      each(document.querySelectorAll('.site-footer, [data-cta-banner], .hero__actions'), function (el) {
        io.observe(el);
      });
    }
    onScroll(update);
  }

  /* Visionneuse : script chargé au premier survol, focus ou clic d'une photo */
  var lightboxLoading = null;
  function loadLightbox() {
    if (window.QuickPhotoLightbox) return Promise.resolve(window.QuickPhotoLightbox);
    if (lightboxLoading) return lightboxLoading;
    var dialog = document.querySelector('[data-lightbox]');
    if (!dialog || !dialog.dataset.script || typeof dialog.showModal !== 'function') return Promise.reject();
    lightboxLoading = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = dialog.dataset.script;
      script.async = true;
      script.onload = function () {
        if (window.QuickPhotoLightbox) resolve(window.QuickPhotoLightbox);
        else reject();
      };
      script.onerror = function () {
        lightboxLoading = null;
        reject();
      };
      document.head.appendChild(script);
    });
    return lightboxLoading;
  }

  function warmLightbox(event) {
    if (event.target.closest && event.target.closest('[data-lightbox-item]')) loadLightbox().catch(function () {});
  }
  document.addEventListener('pointerover', warmLightbox, { passive: true });
  document.addEventListener('focusin', warmLightbox);
  document.addEventListener('touchstart', warmLightbox, { passive: true });

  document.addEventListener('click', function (event) {
    var link = event.target.closest('[data-lightbox-item]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.button > 0) return;
    if (!document.querySelector('[data-lightbox]') || typeof HTMLDialogElement !== 'function') return;
    event.preventDefault();
    loadLightbox()
      .then(function (lightbox) {
        lightbox.open(link);
      })
      .catch(function () {
        window.location.href = link.href;
      });
  });

  /* Initialisation & éditeur de thème */
  function init(scope) {
    initMenu(scope);
    initReveal(scope);
    initFloatingCta();
  }

  if (document.readyState !== 'loading') init(document);
  else document.addEventListener('DOMContentLoaded', function () {
    init(document);
  });

  document.addEventListener('shopify:section:load', function (event) {
    init(event.target);
    each(event.target.querySelectorAll('[data-reveal]'), function (el) {
      el.classList.add('is-revealed');
    });
  });

  document.addEventListener('shopify:section:unload', function () {
    root.classList.remove('menu-open');
    setInert(false);
    if (window.QuickPhotoLightbox) window.QuickPhotoLightbox.close();
  });

  document.addEventListener('shopify:block:select', function (event) {
    var reveal = event.target.closest('[data-reveal]') || event.target.querySelector('[data-reveal]');
    if (reveal) reveal.classList.add('is-revealed');
    var details = event.target.closest('details');
    if (details) details.open = true;
  });
})();
