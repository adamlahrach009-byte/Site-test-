/**
 * Quick photo — visionneuse photo accessible.
 * Chargée à la demande (premier survol ou clic sur une photo) par theme.js.
 * Clavier : ← → pour naviguer, Début/Fin, Échap pour fermer. Mobile : swipe.
 */
(function () {
  'use strict';

  if (window.QuickPhotoLightbox) return;

  var root = document.documentElement;
  var reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var dialog, media, caption, counter, prevBtn, nextBtn, counterTemplate;
  var items = [];
  var index = 0;
  var trigger = null;
  var touchStartX = null;
  var touchStartY = null;

  function setup() {
    if (dialog) return true;
    dialog = document.querySelector('[data-lightbox]');
    if (!dialog || typeof dialog.showModal !== 'function') {
      dialog = null;
      return false;
    }
    media = dialog.querySelector('[data-lightbox-media]');
    caption = dialog.querySelector('[data-lightbox-caption]');
    counter = dialog.querySelector('[data-lightbox-counter]');
    prevBtn = dialog.querySelector('[data-lightbox-prev]');
    nextBtn = dialog.querySelector('[data-lightbox-next]');
    counterTemplate = dialog.dataset.counter || '[current] / [total]';

    dialog.addEventListener('click', function (event) {
      if (event.target.closest('[data-lightbox-close]')) return close();
      if (event.target.closest('[data-lightbox-prev]')) return go(-1);
      if (event.target.closest('[data-lightbox-next]')) return go(1);
      if (event.target === dialog || event.target.hasAttribute('data-lightbox-stage') || event.target.classList.contains('lightbox__figure')) close();
    });

    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        go(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        go(1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        show(0, -1);
      } else if (event.key === 'End') {
        event.preventDefault();
        show(items.length - 1, 1);
      }
    });

    dialog.addEventListener('close', onClose);

    dialog.addEventListener(
      'touchstart',
      function (event) {
        if (event.touches.length !== 1) {
          touchStartX = null;
          return;
        }
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      },
      { passive: true }
    );

    dialog.addEventListener(
      'touchend',
      function (event) {
        if (touchStartX === null) return;
        var dx = event.changedTouches[0].clientX - touchStartX;
        var dy = event.changedTouches[0].clientY - touchStartY;
        touchStartX = null;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
          go(dx < 0 ? 1 : -1);
        } else if (dy > 110 && Math.abs(dy) > Math.abs(dx) * 1.5) {
          close();
        }
      },
      { passive: true }
    );

    return true;
  }

  function preload(i) {
    var item = items[(i + items.length) % items.length];
    if (!item || item.dataset.preloaded) return;
    var img = new Image();
    img.sizes = '(min-width: 750px) 80vw, 100vw';
    if (item.dataset.srcset) img.srcset = item.dataset.srcset;
    img.src = item.dataset.src || item.href;
    item.dataset.preloaded = 'true';
  }

  function show(i, direction) {
    index = (i + items.length) % items.length;
    var item = items[index];
    var img = document.createElement('img');
    img.className = 'lightbox__img';
    img.decoding = 'async';
    img.sizes = '(min-width: 750px) 80vw, 100vw';
    if (item.dataset.srcset) img.srcset = item.dataset.srcset;
    img.src = item.dataset.src || item.href;
    img.alt = item.dataset.alt || '';
    if (item.dataset.width && item.dataset.height) {
      img.width = parseInt(item.dataset.width, 10);
      img.height = parseInt(item.dataset.height, 10);
    }
    img.draggable = false;
    media.innerHTML = '';
    media.appendChild(img);

    var text = item.dataset.caption || '';
    caption.textContent = text;
    caption.hidden = !text;

    var single = items.length < 2;
    prevBtn.hidden = single;
    nextBtn.hidden = single;
    counter.hidden = single;
    counter.textContent = counterTemplate.replace('[current]', index + 1).replace('[total]', items.length);

    if (!reduceMotion.matches && img.animate) {
      var offset = (direction || 0) * 28;
      img.animate(
        [
          { opacity: 0, transform: 'translateX(' + offset + 'px) scale(0.985)' },
          { opacity: 1, transform: 'none' }
        ],
        { duration: 340, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
      );
    }

    if (!single) {
      preload(index + 1);
      preload(index - 1);
    }
  }

  function go(step) {
    if (items.length < 2) return;
    show(index + step, step);
  }

  function open(link) {
    if (!setup()) return false;
    var group = link.getAttribute('data-lightbox-group');
    var selector = '[data-lightbox-item]' + (group ? '[data-lightbox-group="' + group + '"]' : '');
    items = Array.prototype.slice.call(document.querySelectorAll(selector));
    trigger = link;
    show(Math.max(items.indexOf(link), 0), 0);
    dialog.showModal();
    root.classList.add('lightbox-open');
    return true;
  }

  function close() {
    if (dialog && dialog.open) dialog.close();
  }

  function onClose() {
    root.classList.remove('lightbox-open');
    if (media) media.innerHTML = '';
    if (trigger && document.contains(trigger)) trigger.focus({ preventScroll: true });
  }

  window.QuickPhotoLightbox = { open: open, close: close };
  document.dispatchEvent(new CustomEvent('quickphoto:lightbox-ready'));
})();
