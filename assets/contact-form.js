/**
 * Quick photo — formulaire « Proposer une date ».
 * - Met le message de confirmation ou d'erreur en évidence (focus + défilement)
 * - Regroupe les cases « Type de séance » en un seul champ lisible dans l'e-mail reçu
 * - Affiche un état « Envoi en cours… » sur le bouton
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  function init(scope) {
    var status = (scope || document).querySelector('[data-form-status]');
    if (status && !status.dataset.ready) {
      status.dataset.ready = 'true';
      status.scrollIntoView({ block: 'center', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      status.focus({ preventScroll: true });
    }

    var forms = (scope || document).querySelectorAll('.contact-form');
    Array.prototype.forEach.call(forms, function (form) {
      if (form.dataset.ready) return;
      form.dataset.ready = 'true';

      form.addEventListener('submit', function () {
        var groups = form.querySelectorAll('[data-choices]');
        Array.prototype.forEach.call(groups, function (group) {
          var values = [];
          var inputs = group.querySelectorAll('input[type="checkbox"]');
          Array.prototype.forEach.call(inputs, function (input) {
            if (input.checked) values.push(input.getAttribute('data-choice-value'));
            input.removeAttribute('name');
          });
          var hidden = group.querySelector('input[data-choices-output]');
          if (!hidden) {
            hidden = document.createElement('input');
            hidden.type = 'hidden';
            hidden.setAttribute('data-choices-output', '');
            group.appendChild(hidden);
          }
          hidden.name = group.getAttribute('data-choices-name');
          hidden.value = values.length ? values.join(', ') : '—';
        });

        var button = form.querySelector('[data-submit]');
        if (button) {
          var label = button.querySelector('[data-submit-label]');
          button.setAttribute('aria-disabled', 'true');
          if (label && button.dataset.sending) {
            button.dataset.label = label.textContent;
            label.textContent = button.dataset.sending;
          }
        }
      });
    });
  }

  // Réactive le bouton si le visiteur revient en arrière (cache du navigateur)
  window.addEventListener('pageshow', function (event) {
    if (!event.persisted) return;
    var buttons = document.querySelectorAll('[data-submit][aria-disabled="true"]');
    Array.prototype.forEach.call(buttons, function (button) {
      button.removeAttribute('aria-disabled');
      var label = button.querySelector('[data-submit-label]');
      if (label && button.dataset.label) label.textContent = button.dataset.label;
    });
  });

  if (document.readyState !== 'loading') init(document);
  else document.addEventListener('DOMContentLoaded', function () { init(document); });

  document.addEventListener('shopify:section:load', function (event) {
    init(event.target);
  });
})();
