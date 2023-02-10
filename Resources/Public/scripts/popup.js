"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function initializePopup() {
  // Setup
  var popup = document.querySelector('[data-popup]');
  var popupsArray = getCookie('u_popups') ? JSON.parse(getCookie('u_popups')) : [];

  // If no popup is stored or loaded...
  if (!popup && popupsArray.length === 0) return;

  // Popups loaded in the page (used to register and to show popups with the delaytype `seconds`)
  if (popup) {
    var popupUri = popup.dataset.popup;
    var popupDelay = popup.dataset.popupDelay;
    var popupDelayType = popup.dataset.popupDelaytype;
    registerPopup(popupUri, popupDelay, popupDelayType);
  }

  // Popups loaded from cookies
  if (popupsArray.filter(function (object) {
    return object.delayType === 'clicks' && object.shown === false;
  }).length > 0) {
    var clickPopups = popupsArray.filter(function (object) {
      return object.delayType === 'clicks' && object.shown === false;
    });
    if (clickPopups.length > 0) {
      renderPopupContainer();
      listenForCloseHandlers();
      clickPopups.forEach(function (clickPopup) {
        if (clickPopup.clicks > clickPopup.delay) {
          renderPopup(clickPopup.url);
          setTimeout(function () {
            return showPopup(clickPopup.url);
          }, 1000);
        }
      });
    }
  }
  if (popupsArray.filter(function (object) {
    return object.delayType === 'seconds' && object.shown === false;
  }).length > 0) {
    var popups = popupsArray.filter(function (object) {
      return object.delayType === 'seconds' && object.shown === false;
    });
    if (popups.length > 0) {
      renderPopupContainer();
      listenForCloseHandlers();
      popups.forEach(function (popup) {
        renderPopup(popup.url);
        setTimeout(function () {
          return showPopup(popup.url);
        }, popup.delay * 1000);
      });
    }
  }
  function renderPopupContainer() {
    var popModalHTML = document.querySelector('.popup-modal__outer') ? document.querySelector('.popup-modal__outer') : document.createElement('div');
    popModalHTML.innerHTML = '<button class="popup-modal__close-button">&times;</button><div class="popup-modal__inner"></div>';
    popModalHTML.className = 'popup-modal__outer';
    document.querySelector('body').insertAdjacentElement('beforeend', popModalHTML);
  }
  function registerPopup(popupUri, popupDelay, popupDelayType) {
    if (popupsArray.find(function (object) {
      return object.url === popupUri;
    }) === undefined) {
      popupsArray.push({
        url: popupUri,
        delay: parseInt(popupDelay),
        delayType: popupDelayType,
        clicks: popupDelayType === 'clicks' ? 1 : null,
        shown: false
      });
      setCookie('u_popups', JSON.stringify(popupsArray), 365);
      console.info("Popup ".concat(popupUri, " registered"));
    }
  }
  function registerClickIncrementForPopups() {
    var popups = JSON.parse(getCookie('u_popups'));
    var clickPopups = popups.filter(function (object) {
      return object.delayType === 'clicks';
    });
    var updatedPopups = popups.map(function (object) {
      if (clickPopups.find(function (clickPopup) {
        return clickPopup.url === object.url;
      })) {
        object.clicks++;
      }
      return object;
    });
    setCookie('u_popups', JSON.stringify(updatedPopups), 365);
  }
  function popupHasShown(popupUri) {
    var popups = JSON.parse(getCookie('u_popups'));
    var result = popups.map(function (object) {
      return object.url === popupUri && object.shown === true;
    });
    return Array.isArray(result) && result[0] === true;
  }
  function markPopupAsShown(popupUri) {
    var popups = JSON.parse(getCookie('u_popups'));
    var updatedPopups = popups.map(function (object) {
      return object.url === popupUri ? _objectSpread(_objectSpread({}, object), {}, {
        shown: true
      }) : object;
    });
    setCookie('u_popups', JSON.stringify(updatedPopups), 365);
  }
  function renderPopup(popupUri) {
    fetch(popupUri).then(function (res) {
      return res.text();
    }).then(function (result) {
      var parser = new DOMParser();
      var html = parser.parseFromString(result, "text/html");
      var container = document.querySelector('.popup-modal__inner');
      container.insertAdjacentElement('beforeend', html.querySelector('body > div'));
      window.dispatchEvent(new CustomEvent('popupContentLoaded'));
    });
  }
  function showPopup(popupUri) {
    var popupOuterContainer = document.querySelector('.popup-modal__outer');
    if (popupHasShown(popupUri) === false) {
      popupOuterContainer.classList.add('is-active');
    }
  }
  function closePopup() {
    var popupOuterContainer = document.querySelector('.popup-modal__outer');
    var currentPopup = popupOuterContainer.querySelector('[data-popup]');
    popupOuterContainer.classList.remove('is-active');
    markPopupAsShown(currentPopup.dataset.popupUrl);
  }
  function listenForCloseHandlers() {
    var popupOuterContainer = document.querySelector('.popup-modal__outer');
    popupOuterContainer.addEventListener('click', function (e) {
      var isOutside = !e.target.closest('.popup-modal__inner');
      if (isOutside) {
        closePopup();
      }
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closePopup();
      }
    });
  }

  // Setup listening for clicks so we can track them for clickPopups
  // We pass in the cookie values directly to get live updated values i.o. previous
  // stored array.
  var anchors = document.querySelectorAll('a');
  anchors.forEach(function (anchor) {
    return anchor.addEventListener('click', function (e) {
      registerClickIncrementForPopups();
    });
  });
  window.addEventListener('beforeunload', function () {
    registerClickIncrementForPopups();
  });
  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }
}
initializePopup();