"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function initializePopup() {
  var popup = document.querySelector('[data-popup]');
  var rawPopups = getCookie('u_popups');
  var popupsArray = rawPopups ? JSON.parse(rawPopups) : [];

  // Filter based on language if popup exists
  if (popup) {
    var currentLang = popup.dataset.popupLanguage;
    popupsArray = popupsArray.filter(function (p) {
      return (p === null || p === void 0 ? void 0 : p.language) === currentLang;
    });
  }
  if (!popup && popupsArray.length === 0) return;

  // Register newly loaded popup
  if (popup !== null && popup !== void 0 && popup.dataset.popup) {
    var _popup$dataset = popup.dataset,
      popupUri = _popup$dataset.popup,
      popupDelay = _popup$dataset.popupDelay,
      popupDelayType = _popup$dataset.popupDelaytype,
      popupLanguage = _popup$dataset.popupLanguage;
    registerPopup(popupUri, popupDelay, popupDelayType, popupLanguage);
  }
  var clickPopups = popupsArray.filter(function (p) {
    return p.delayType === 'clicks' && !p.shown && p.clicks > p.delay;
  });
  var timedPopups = popupsArray.filter(function (p) {
    return p.delayType === 'seconds' && !p.shown;
  });
  if (clickPopups.length > 0 || timedPopups.length > 0) {
    renderPopupContainer();
    listenForCloseHandlers();
  }
  clickPopups.forEach(function (p) {
    renderPopup(p.url);
    setTimeout(function () {
      return showPopup(p.url);
    }, 1000);
  });
  timedPopups.forEach(function (p) {
    renderPopup(p.url);
    setTimeout(function () {
      return showPopup(p.url);
    }, p.delay * 1000);
  });

  // Track clicks to trigger "clicks" delayed popups
  document.querySelectorAll('a').forEach(function (anchor) {
    return anchor.addEventListener('click', registerClickIncrementForPopups);
  });
  window.addEventListener('beforeunload', registerClickIncrementForPopups);
  function registerPopup(popupUri, popupDelay, popupDelayType, popupLanguage) {
    var delay = parseInt(popupDelay);
    var existingIndex = popupsArray.findIndex(function (p) {
      return p.url === popupUri && p.delayType === popupDelayType && p.delay === delay;
    });

    // If popup with identical config already exists, do nothing
    if (existingIndex !== -1) return;

    // Remove outdated popup with same URL
    popupsArray = popupsArray.filter(function (p) {
      return p.url !== popupUri;
    });

    // Register new popup
    popupsArray.push({
      url: popupUri,
      delay: delay,
      delayType: popupDelayType,
      clicks: popupDelayType === 'clicks' ? 1 : null,
      shown: false,
      language: popupLanguage
    });
    setCookie('u_popups', JSON.stringify(popupsArray), 365);
    console.info("Popup ".concat(popupUri, " registered"));
  }
  function renderPopupContainer() {
    var container = document.querySelector('.popup-modal__outer') || document.createElement('div');
    container.innerHTML = '<button class="popup-modal__close-button">&times;</button><div class="popup-modal__inner"></div>';
    container.className = 'popup-modal__outer';
    document.body.insertAdjacentElement('beforeend', container);
  }
  function renderPopup(popupUri) {
    fetch(popupUri).then(function (res) {
      return res.text();
    }).then(function (htmlText) {
      var html = new DOMParser().parseFromString(htmlText, "text/html");
      document.querySelector('.popup-modal__inner').insertAdjacentElement('beforeend', html.querySelector('body > div'));
      window.dispatchEvent(new CustomEvent('popupContentLoaded'));
    });
  }
  function showPopup(popupUri) {
    if (!popupHasShown(popupUri)) {
      document.querySelector('.popup-modal__outer').classList.add('is-active');
      markPopupAsShown(popupUri);
    }
  }
  function closePopup() {
    var container = document.querySelector('.popup-modal__outer');
    var currentPopup = container.querySelector('[data-popup]');
    container.classList.remove('is-active');
    if (currentPopup !== null && currentPopup !== void 0 && currentPopup.dataset.popupUrl) markPopupAsShown(currentPopup.dataset.popupUrl);
  }
  function listenForCloseHandlers() {
    document.querySelector('.popup-modal__outer').addEventListener('click', function (e) {
      if (!e.target.closest('.popup-modal__inner')) closePopup();
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePopup();
    });
  }
  function registerClickIncrementForPopups() {
    var popups = JSON.parse(getCookie('u_popups') || '[]');
    var updated = popups.map(function (p) {
      return p.delayType === 'clicks' ? _objectSpread(_objectSpread({}, p), {}, {
        clicks: (p.clicks || 0) + 1
      }) : p;
    });
    setCookie('u_popups', JSON.stringify(updated), 365);
  }
  function popupHasShown(popupUri) {
    var popups = JSON.parse(getCookie('u_popups') || '[]');
    return popups.some(function (p) {
      return p.url === popupUri && p.shown;
    });
  }
  function markPopupAsShown(popupUri) {
    var popups = JSON.parse(getCookie('u_popups') || '[]');
    var updated = popups.map(function (p) {
      return p.url === popupUri ? _objectSpread(_objectSpread({}, p), {}, {
        shown: true
      }) : p;
    });
    setCookie('u_popups', JSON.stringify(updated), 365);
  }
  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = "".concat(name, "=").concat(value, ";expires=").concat(d.toUTCString(), ";path=/");
  }
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : '';
  }
}
function initializeIfReady() {
  if (!document.querySelector('.neos-backend')) initializePopup();
}
document.readyState === 'loading' ? window.addEventListener('DOMContentLoaded', initializeIfReady) : initializeIfReady();