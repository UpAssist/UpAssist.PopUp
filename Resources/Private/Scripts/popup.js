 function initializePopup() {
  // Setup
  const popup = document.querySelector('[data-popup]');
  let popupsArray = getCookie('u_popups') ? JSON.parse(getCookie('u_popups')) : [];

  // If no popup is stored or loaded...
  if (!popup && popupsArray.length === 0) return;

  // Popups loaded in the page (used to register and to show popups with the delaytype `seconds`)
  if (popup) {
    const popupUri = popup.dataset.popup;
    const popupDelay = popup.dataset.popupDelay;
    const popupDelayType = popup.dataset.popupDelaytype;

    registerPopup(popupUri, popupDelay, popupDelayType);

    switch (popupDelayType) {
      case 'clicks': // Skip rendering until clicks have resolved
        break;
      case 'seconds':
      default:
        renderPopupContainer();
        listenForCloseHandlers();
        renderPopup(popupUri);
        setTimeout(() => showPopup(popupUri), popupDelay * 1000);
        break;
    }
  }

  // Popups loaded from cookies
  if (popupsArray.filter(object => object.delayType === 'clicks' && object.shown === false).length > 0) {
    const clickPopups = popupsArray.filter(object => object.delayType === 'clicks');
    if (clickPopups.length > 0) {
      renderPopupContainer();
      listenForCloseHandlers();
      clickPopups.forEach(clickPopup => {
        if (clickPopup.clicks > clickPopup.delay) {
          renderPopup(clickPopup.url);
          setTimeout(() => showPopup(clickPopup.url), 1000);
        }
      })
    }
  }

  function renderPopupContainer() {
    const popModalHTML = document.querySelector('.popup-modal__outer') ? document.querySelector('.popup-modal__outer') : document.createElement('div');
    popModalHTML.innerHTML = '<button class="popup-modal__close-button">&times;</button><div class="popup-modal__inner"></div>';
    popModalHTML.className = 'popup-modal__outer';
    document.querySelector('body').insertAdjacentElement('beforeend', popModalHTML);
  }

  function registerPopup(popupUri, popupDelay, popupDelayType) {
    if (popupsArray.find(object => object.url === popupUri) === undefined) {
      popupsArray.push({
        url: popupUri,
        delay: parseInt(popupDelay),
        delayType: popupDelayType,
        clicks: popupDelayType === 'clicks' ? 1 : null,
        shown: false
      });
      setCookie('u_popups', JSON.stringify(popupsArray), 365);
      console.info(`Popup ${popupUri} registered`);
    }
  }

  function registerClickIncrementForPopups() {
    const popups = JSON.parse(getCookie('u_popups'));
    const clickPopups = popups.filter(object => object.delayType === 'clicks');
    let updatedPopups = popups.map(object => {
      if (clickPopups.find(clickPopup => clickPopup.url === object.url)) {
        object.clicks++;
      }
      return object;
    });
    setCookie('u_popups', JSON.stringify(updatedPopups), 365);
  }

  function popupHasShown(popupUri) {
    const popups = JSON.parse(getCookie('u_popups'));
    const result = popups.map(object => (object.url === popupUri && object.shown === true));
    return Array.isArray(result) && result[0] === true;
  }

  function markPopupAsShown(popupUri) {
    const popups = JSON.parse(getCookie('u_popups'));
    const updatedPopups = popups.map(object => object.url === popupUri ? {...object, shown: true} : object);
    setCookie('u_popups', JSON.stringify(updatedPopups), 365);
  }

  function renderPopup(popupUri) {
    fetch(popupUri)
      .then(function (res) {
        return res.text()
      })
      .then(function (result) {
        const parser = new DOMParser();
        const html = parser.parseFromString(result, "text/html");
        const container = document.querySelector('.popup-modal__inner');

        container.insertAdjacentElement('beforeend', html.querySelector('body > div'));
        window.dispatchEvent(new CustomEvent('popupContentLoaded'));
      });
  }

  function showPopup(popupUri) {
    const popupOuterContainer = document.querySelector('.popup-modal__outer');
    if (popupHasShown(popupUri) === false) {
      popupOuterContainer.classList.add('is-active');
    }
  }

  function closePopup() {
    const popupOuterContainer = document.querySelector('.popup-modal__outer');
    const currentPopup = popupOuterContainer.querySelector('[data-popup]');
    popupOuterContainer.classList.remove('is-active');
    markPopupAsShown(currentPopup.dataset.popupUrl);
  }

  function listenForCloseHandlers() {
    const popupOuterContainer = document.querySelector('.popup-modal__outer');
    popupOuterContainer.addEventListener('click', function (e) {
      const isOutside = !e.target.closest('.popup-modal__inner');
      if (isOutside) {
        closePopup()
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
  const anchors = document.querySelectorAll('a');
  anchors.forEach(anchor => anchor.addEventListener('click', e => {
    registerClickIncrementForPopups();
  }));
  window.addEventListener('beforeunload', () => {
    registerClickIncrementForPopups();
  });

  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
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
