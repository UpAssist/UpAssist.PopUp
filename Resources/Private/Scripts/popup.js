function initializePopup() {
  const popup = document.querySelector('[data-popup]')
  const rawPopups = getCookie('u_popups')
  let popupsArray = rawPopups ? JSON.parse(rawPopups) : []

  // Filter based on language if popup exists
  if (popup) {
    const currentLang = popup.dataset.popupLanguage
    popupsArray = popupsArray.filter(p => p?.language === currentLang)
  }

  if (!popup && popupsArray.length === 0) return

  // Register newly loaded popup
  if (popup?.dataset.popup) {
    const { popup: popupUri, popupDelay, popupDelaytype: popupDelayType, popupLanguage } = popup.dataset
    registerPopup(popupUri, popupDelay, popupDelayType, popupLanguage)
  }

  const clickPopups = popupsArray.filter(p => p.delayType === 'clicks' && !p.shown && p.clicks > p.delay)
  const timedPopups = popupsArray.filter(p => p.delayType === 'seconds' && !p.shown)

  if (clickPopups.length > 0 || timedPopups.length > 0) {
    renderPopupContainer()
    listenForCloseHandlers()
  }

  clickPopups.forEach(p => {
    renderPopup(p.url)
    setTimeout(() => showPopup(p.url), 1000)
  })

  timedPopups.forEach(p => {
    renderPopup(p.url)
    setTimeout(() => showPopup(p.url), p.delay * 1000)
  })

  // Track clicks to trigger "clicks" delayed popups
  document.querySelectorAll('a').forEach(anchor =>
    anchor.addEventListener('click', registerClickIncrementForPopups)
  )
  window.addEventListener('beforeunload', registerClickIncrementForPopups)

  function registerPopup(popupUri, popupDelay, popupDelayType, popupLanguage) {
    const delay = parseInt(popupDelay)
    const existingIndex = popupsArray.findIndex(p =>
      p.url === popupUri &&
      p.delayType === popupDelayType &&
      p.delay === delay
    )

    // If popup with identical config already exists, do nothing
    if (existingIndex !== -1) return

    // Remove outdated popup with same URL
    popupsArray = popupsArray.filter(p => p.url !== popupUri)

    // Register new popup
    popupsArray.push({
      url: popupUri,
      delay,
      delayType: popupDelayType,
      clicks: popupDelayType === 'clicks' ? 1 : null,
      shown: false,
      language: popupLanguage
    })
    setCookie('u_popups', JSON.stringify(popupsArray), 365)
    console.info(`Popup ${popupUri} registered`)
  }

  function renderPopupContainer() {
    let container = document.querySelector('.popup-modal__outer') || document.createElement('div')
    container.innerHTML = '<button class="popup-modal__close-button">&times;</button><div class="popup-modal__inner"></div>'
    container.className = 'popup-modal__outer'
    document.body.insertAdjacentElement('beforeend', container)
  }

  function renderPopup(popupUri) {
    fetch(popupUri)
      .then(res => res.text())
      .then(htmlText => {
        const html = new DOMParser().parseFromString(htmlText, "text/html")
        document.querySelector('.popup-modal__inner')
          .insertAdjacentElement('beforeend', html.querySelector('body > div'))
        window.dispatchEvent(new CustomEvent('popupContentLoaded'))
      })
  }

  function showPopup(popupUri) {
    if (!popupHasShown(popupUri)) {
      document.querySelector('.popup-modal__outer').classList.add('is-active')
      markPopupAsShown(popupUri)
    }
  }

  function closePopup() {
    const container = document.querySelector('.popup-modal__outer')
    const currentPopup = container.querySelector('[data-popup]')
    container.classList.remove('is-active')
    if (currentPopup?.dataset.popupUrl) markPopupAsShown(currentPopup.dataset.popupUrl)
  }

  function listenForCloseHandlers() {
    document.querySelector('.popup-modal__outer').addEventListener('click', e => {
      if (!e.target.closest('.popup-modal__inner')) closePopup()
    })
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') closePopup()
    })
  }

  function registerClickIncrementForPopups() {
    const popups = JSON.parse(getCookie('u_popups') || '[]')
    const updated = popups.map(p =>
      p.delayType === 'clicks' ? { ...p, clicks: (p.clicks || 0) + 1 } : p
    )
    setCookie('u_popups', JSON.stringify(updated), 365)
  }

  function popupHasShown(popupUri) {
    const popups = JSON.parse(getCookie('u_popups') || '[]')
    return popups.some(p => p.url === popupUri && p.shown)
  }

  function markPopupAsShown(popupUri) {
    const popups = JSON.parse(getCookie('u_popups') || '[]')
    const updated = popups.map(p => p.url === popupUri ? { ...p, shown: true } : p)
    setCookie('u_popups', JSON.stringify(updated), 365)
  }

  function setCookie(name, value, days) {
    const d = new Date()
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000))
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`
  }

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? match[2] : ''
  }
}

function initializeIfReady() {
  if (!document.querySelector('.neos-backend')) initializePopup()
}

document.readyState === 'loading'
  ? window.addEventListener('DOMContentLoaded', initializeIfReady)
  : initializeIfReady()
