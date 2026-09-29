const express = require('express');
const cars = require('../db/cars');
const { sendContactEmail } = require('../lib/mailer');
const { verifyCaptcha } = require('../lib/hcaptcha');
const { createRateLimiter } = require('../lib/rate-limit');

const router = express.Router();
const contactLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 8 });

router.get('/', (req, res) => {
  const uitgelicht = cars.listFeatured(3);
  const heroCar = uitgelicht.find((auto) => auto.images && auto.images.length) || null;
  res.render('index', {
    title: 'Team262 — Exclusieve en sportieve auto\'s te koop',
    description: `${res.locals.site.naam} verkoopt exclusieve en sportieve auto's voor echte petrolheads. Bekijk ons actuele aanbod van zorgvuldig geselecteerde auto's.`,
    ogImage: heroCar && heroCar.images && heroCar.images.length ? res.locals.heroUrl(heroCar.images[0].filename) : undefined,
    uitgelicht,
    heroCar,
  });
});

router.get('/aanbod', (req, res) => {
  const { brandstof, transmissie, minprijs, maxprijs, sort } = req.query;
  const autos = cars.listCars({
    onlyPublic: true,
    brandstof: brandstof || undefined,
    transmissie: transmissie || undefined,
    minPrijs: minprijs ? parseInt(minprijs, 10) : undefined,
    maxPrijs: maxprijs ? parseInt(maxprijs, 10) : undefined,
    sort: sort || undefined,
  });

  res.render('aanbod', {
    title: 'Ons aanbod — Team262',
    description: 'Bekijk het actuele aanbod van exclusieve en sportieve auto\'s bij Team262, zorgvuldig geselecteerd voor liefhebbers die kwaliteit en historie belangrijk vinden.',
    autos,
    filters: { brandstof, transmissie, minprijs, maxprijs, sort },
    brandstofOpties: cars.distinctValues('brandstof'),
    transmissieOpties: cars.distinctValues('transmissie'),
  });
});

router.get('/aanbod/:slug', (req, res) => {
  const auto = cars.getBySlug(req.params.slug);
  if (!auto) {
    return res.status(404).render('404', {
      title: 'Auto niet gevonden — Team262',
      description: 'Deze auto is niet (meer) beschikbaar. Bekijk ons actuele aanbod voor de auto\'s die nu bij Team262 te koop staan.',
      noindex: true,
    });
  }

  const specDelen = [];
  if (auto.bouwjaar) specDelen.push(`bouwjaar ${auto.bouwjaar}`);
  if (auto.km_stand) specDelen.push(`${Number(auto.km_stand).toLocaleString('nl-NL')} km`);
  if (auto.vermogen_pk) specDelen.push(`${auto.vermogen_pk} pk`);
  if (auto.brandstof) specDelen.push(auto.brandstof);
  if (auto.transmissie) specDelen.push(auto.transmissie);
  const prijsTekst = auto.prijs ? `€ ${Number(auto.prijs).toLocaleString('nl-NL')}` : 'prijs op aanvraag';
  const description = `${auto.merk} ${auto.model}${specDelen.length ? ' — ' + specDelen.join(', ') : ''}. ${prijsTekst}. Bekijk deze auto bij Team262.`;

  res.render('auto-detail', {
    title: `${auto.merk} ${auto.model}${auto.bouwjaar ? ' (' + auto.bouwjaar + ')' : ''} — Team262`,
    description,
    ogImage: auto.images && auto.images.length ? `/uploads/cars/${auto.images[0].filename}` : undefined,
    auto,
  });
});

router.get('/over-ons', (req, res) => {
  res.render('over-ons', {
    title: 'Over ons & contact — Team262',
    description: 'Team262 is specialist in exclusieve en sportieve auto\'s voor echte petrolheads. Lees meer over onze aanpak of neem contact met ons op.',
    ogImage: '/img/over-ons-hero.jpg',
    verzonden: false,
    error: null,
    hcaptchaSiteKey: process.env.HCAPTCHA_SITE_KEY || '',
    formData: {},
  });
});

// Oude /contact-links (bladwijzers, zoekmachines) blijven werken via een verwijzing
// naar de samengevoegde over-ons-pagina.
router.get('/contact', (req, res) => {
  res.redirect(301, '/over-ons');
});

router.post('/over-ons', async (req, res) => {
  const ip = req.ip;
  const { naam, email, telefoon, bericht } = req.body;
  const hcaptchaSiteKey = process.env.HCAPTCHA_SITE_KEY || '';

  const renderError = (message, status = 400) =>
    res.status(status).render('over-ons', {
      title: 'Over ons & contact — Team262',
      description: 'Team262 is specialist in exclusieve en sportieve auto\'s voor echte petrolheads. Lees meer over onze aanpak of neem contact met ons op.',
      noindex: true,
      verzonden: false,
      error: message,
      hcaptchaSiteKey,
      formData: { naam, email, telefoon, bericht },
    });

  if (contactLimiter.isLimited(ip)) {
    return renderError('Er zijn zojuist al meerdere berichten vanaf dit adres verstuurd. Probeer het over een uur opnieuw, of bel ons direct.', 429);
  }

  if (!naam || !email || !bericht) {
    return renderError('Vul in ieder geval uw naam, e-mailadres en bericht in.');
  }

  contactLimiter.registerAttempt(ip);

  const captchaOk = await verifyCaptcha(req.body['h-captcha-response'], ip);
  if (!captchaOk) {
    return renderError('De spamcontrole is niet gelukt. Probeer het opnieuw.');
  }

  try {
    await sendContactEmail({ naam, email, telefoon, bericht });
  } catch (err) {
    console.error('Versturen van contactformulier is mislukt:', err);
    return renderError('Er ging iets mis bij het versturen van uw bericht. Probeer het later opnieuw, of bel ons direct.', 500);
  }

  res.render('over-ons', {
    title: 'Over ons & contact — Team262',
    description: 'Team262 is specialist in exclusieve en sportieve auto\'s voor echte petrolheads. Lees meer over onze aanpak of neem contact met ons op.',
    noindex: true,
    verzonden: true,
    error: null,
    hcaptchaSiteKey,
    formData: {},
  });
});

module.exports = router;
