// Cookiebanner: laadt Google Analytics pas nadat de bezoeker op "Accepteren"
// heeft geklikt. De keuze (accepteren/weigeren) wordt onthouden in
// localStorage, zodat de banner bij een volgend bezoek niet opnieuw
// verschijnt. Zonder expliciete toestemming wordt er nooit contact gelegd
// met Google.
(function () {
  var STORAGE_KEY = 'team262-cookie-consent';
  var banner = document.getElementById('cookie-banner');
  var gaLoaded = false;

  function getConsent() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      // localStorage niet beschikbaar (bv. privénavigatie) - de banner komt
      // dan gewoon opnieuw terug bij een volgend bezoek.
    }
  }

  function loadAnalytics() {
    if (gaLoaded || !window.GA_MEASUREMENT_ID) return;
    gaLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', window.GA_MEASUREMENT_ID);

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + window.GA_MEASUREMENT_ID;
    document.head.appendChild(script);
  }

  function hideBanner() {
    if (banner) banner.classList.remove('is-visible');
  }

  var consent = getConsent();
  if (consent === 'accepted') {
    loadAnalytics();
  } else if (consent !== 'declined' && banner) {
    banner.classList.add('is-visible');
  }

  if (banner) {
    var acceptBtn = banner.querySelector('[data-cookie-accept]');
    var declineBtn = banner.querySelector('[data-cookie-decline]');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        setConsent('accepted');
        hideBanner();
        loadAnalytics();
      });
    }
    if (declineBtn) {
      declineBtn.addEventListener('click', function () {
        setConsent('declined');
        hideBanner();
      });
    }
  }
})();
