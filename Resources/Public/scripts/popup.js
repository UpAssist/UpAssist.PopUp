"use strict";function ownKeys(a,b){var c=Object.keys(a);if(Object.getOwnPropertySymbols){var d=Object.getOwnPropertySymbols(a);b&&(d=d.filter(function(b){return Object.getOwnPropertyDescriptor(a,b).enumerable})),c.push.apply(c,d)}return c}function _objectSpread(a){for(var b,c=1;c<arguments.length;c++)b=null==arguments[c]?{}:arguments[c],c%2?ownKeys(Object(b),!0).forEach(function(c){_defineProperty(a,c,b[c])}):Object.getOwnPropertyDescriptors?Object.defineProperties(a,Object.getOwnPropertyDescriptors(b)):ownKeys(Object(b)).forEach(function(c){Object.defineProperty(a,c,Object.getOwnPropertyDescriptor(b,c))});return a}function _defineProperty(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}function initializePopup(){function a(){var a=document.querySelector(".popup-modal__outer")?document.querySelector(".popup-modal__outer"):document.createElement("div");a.innerHTML="<button class=\"popup-modal__close-button\">&times</button><div class=\"popup-modal__inner\"></div>",a.className="popup-modal__outer",document.querySelector("body").insertAdjacentElement("beforeend",a)}function b(a,b,c,d){void 0===m.find(function(b){return b.url===a})&&(m.push({url:a,delay:parseInt(b),delayType:c,clicks:"clicks"===c?1:null,shown:!1,language:d}),j("u_popups",JSON.stringify(m),365),console.info("Popup ".concat(a," registered")))}function c(){var a=JSON.parse(k("u_popups")),b=a.filter(function(a){return"clicks"===a.delayType}),c=a.map(function(a){return b.find(function(b){return b.url===a.url})&&a.clicks++,a});j("u_popups",JSON.stringify(c),365)}function d(a){var b=JSON.parse(k("u_popups")),c=b.map(function(b){return b.url===a&&!0===b.shown});return Array.isArray(c)&&!0===c[0]}function e(a){var b=JSON.parse(k("u_popups")),c=b.map(function(b){return b.url===a?_objectSpread(_objectSpread({},b),{},{shown:!0}):b});j("u_popups",JSON.stringify(c),365)}function f(a){fetch(a).then(function(a){return a.text()}).then(function(a){var b=new DOMParser,c=b.parseFromString(a,"text/html"),d=document.querySelector(".popup-modal__inner");d.insertAdjacentElement("beforeend",c.querySelector("body > div")),window.dispatchEvent(new CustomEvent("popupContentLoaded"))})}function g(a){var b=document.querySelector(".popup-modal__outer");!1===d(a)&&b.classList.add("is-active")}function h(){var a=document.querySelector(".popup-modal__outer"),b=a.querySelector("[data-popup]");a.classList.remove("is-active"),e(b.dataset.popupUrl)}function i(){var a=document.querySelector(".popup-modal__outer");a.addEventListener("click",function(a){var b=!a.target.closest(".popup-modal__inner");b&&h()}),window.addEventListener("keydown",function(a){"Escape"===a.key&&h()})}// Setup listening for clicks so we can track them for clickPopups
// We pass in the cookie values directly to get live updated values i.o. previous
// stored array.
function j(a,b,c){var e=new Date;e.setTime(e.getTime()+1e3*(60*(60*(24*c))));var d="expires="+e.toUTCString();document.cookie=a+"="+b+";"+d+";path=/"}function k(a){for(var b,d=a+"=",e=document.cookie.split(";"),f=0;f<e.length;f++){for(b=e[f];" "===b.charAt(0);)b=b.substring(1);if(0===b.indexOf(d))return b.substring(d.length,b.length)}return""}// Setup
var l=document.querySelector("[data-popup]"),m=k("u_popups")?JSON.parse(k("u_popups")):[];// Filter to only show the current language
// If no popup is stored or loaded...
if(m=m.filter(function(a){return a.language===l.dataset.popupLanguage}),l||0!==m.length){// Popups loaded in the page (used to register and to show popups with the delaytype `seconds`)
if(l&&l.dataset.popup){var n=l.dataset.popup,o=l.dataset.popupDelay,p=l.dataset.popupDelaytype,q=l.dataset.popupLanguage;b(n,o,p,q)}// Popups loaded from cookies
if(0<m.filter(function(a){return"clicks"===a.delayType&&!1===a.shown}).length){var s=m.filter(function(a){return"clicks"===a.delayType&&!1===a.shown});0<s.length&&(a(),i(),s.forEach(function(a){a.clicks>a.delay&&(f(a.url),setTimeout(function(){return g(a.url)},1e3))}))}if(0<m.filter(function(a){return"seconds"===a.delayType&&!1===a.shown}).length){var t=m.filter(function(a){return"seconds"===a.delayType&&!1===a.shown});0<t.length&&(a(),i(),t.forEach(function(a){f(a.url),setTimeout(function(){return g(a.url)},1e3*a.delay)}))}var r=document.querySelectorAll("a");r.forEach(function(a){return a.addEventListener("click",function(a){c()})}),window.addEventListener("beforeunload",function(){c()})}}window.addEventListener("DOMContentLoaded",function(){var a=document.querySelector(".neos-backend");a||initializePopup()});