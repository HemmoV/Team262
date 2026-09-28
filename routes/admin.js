const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const sanitizeHtml = require('sanitize-html');
const cars = require('../db/cars');
const settings = require('../db/settings');
const { generateThumbnail, removeThumbnail } = require('../lib/thumbnails');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/admin/login');
  next();
}

router.use(requireAuth);

const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'cars');
fs.mkdirSync(uploadsDir, { recursive: true });

// Maximaal aantal foto's dat je in één keer bij een auto kunt uploaden.
const MAX_FOTOS = 30;
// Maximale bestandsgrootte per foto. Moderne telefoon-/camerafoto's kunnen al
// gauw 8-15MB zijn, dus deze ruim boven dat gemiddelde houden.
const MAX_FOTO_MB = 20;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FOTO_MB * 1024 * 1024, files: MAX_FOTOS },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Alleen JPG, PNG of WEBP afbeeldingen zijn toegestaan.'));
    }
    cb(null, true);
  },
});

function setFlash(req, type, message) {
  req.session.flash = { type, message };
}

// Genereert voor elk geüploade bestand een verkleinde, scherpe thumbnail.
// Lukt dit voor een foto onverhoopt niet, dan wordt dat gelogd maar gaat het
// opslaan van de auto gewoon door (de pagina valt dan terug op de originele foto).
async function generateThumbnails(files) {
  await Promise.all(
    (files || []).map((file) =>
      generateThumbnail(uploadsDir, file.filename).catch((err) => {
        console.error(`Kon geen thumbnail maken voor ${file.filename}:`, err.message);
      })
    )
  );
}

function parseCarForm(body) {
  return {
    merk: (body.merk || '').trim(),
    model: (body.model || '').trim(),
    bouwjaar: body.bouwjaar ? parseInt(body.bouwjaar, 10) : null,
    km_stand: body.km_stand ? parseInt(body.km_stand, 10) : null,
    vermogen_pk: body.vermogen_pk ? parseInt(body.vermogen_pk, 10) : null,
    prijs: body.prijs ? parseInt(body.prijs, 10) : null,
    brandstof: (body.brandstof || '').trim(),
    transmissie: (body.transmissie || '').trim(),
    kleur: (body.kleur || '').trim(),
    btw: (body.btw || '').trim(),
    beschrijving: sanitizeDescription(body.beschrijving),
    status: body.status,
    uitgelicht: body.uitgelicht === 'on',
  };
}

function sanitizeDescription(html) {
  const clean = sanitizeHtml(html || '', {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 's', 'ol', 'ul', 'li', 'blockquote'],
    // Quill geeft zowel opsommingstekens als genummerde lijsten terug als
    // <ol><li data-list="bullet|ordered">...</li></ol> (er is geen <ul> in
    // de output). Zonder dit attribuut te bewaren is er na het opslaan geen
    // onderscheid meer te zien en toont de browser alles als genummerd.
    allowedAttributes: { li: ['data-list'] },
  });
  const textOnly = clean.replace(/<[^>]*>/g, '').trim();
  return textOnly ? clean : '';
}

function parseSettingsForm(body) {
  const dagenArr = [].concat(body.dagen || []);
  const tijdenArr = [].concat(body.tijden || []);
  const openingstijden = dagenArr
    .map((dagen, i) => ({ dagen: (dagen || '').trim(), tijden: (tijdenArr[i] || '').trim() }))
    .filter((o) => o.dagen || o.tijden);

  return {
    naam: (body.naam || '').trim(),
    slogan: (body.slogan || '').trim(),
    telefoon: (body.telefoon || '').trim(),
    telefoonHref: (body.telefoonHref || '').trim(),
    email: (body.email || '').trim(),
    adres: (body.adres || '').trim(),
    plaats: (body.plaats || '').trim(),
    openingstijden,
    instagram: (body.instagram || '').trim(),
    facebook: (body.facebook || '').trim(),
    linkedin: (body.linkedin || '').trim(),
    kvk: (body.kvk || '').trim(),
  };
}

function validateSettingsForm(data) {
  const errors = [];
  if (!data.naam) errors.push('Bedrijfsnaam is verplicht.');
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('E-mailadres lijkt niet geldig.');
  }
  return errors;
}

function validateCarForm(data) {
  const errors = [];
  if (!data.merk) errors.push('Merk is verplicht.');
  if (!data.model) errors.push('Model is verplicht.');
  if (data.bouwjaar && (data.bouwjaar < 1900 || data.bouwjaar > new Date().getFullYear() + 1)) {
    errors.push('Bouwjaar lijkt niet te kloppen.');
  }
  if (data.prijs && data.prijs < 0) errors.push('Prijs kan niet negatief zijn.');
  if (data.km_stand && data.km_stand < 0) errors.push('Kilometerstand kan niet negatief zijn.');
  if (!cars.STATUSES.includes(data.status)) errors.push('Ongeldige status.');
  if (data.btw && !cars.BTW_OPTIONS.includes(data.btw)) errors.push('Ongeldige BTW-status.');
  return errors;
}

// Dashboard: overzicht van alle auto's
router.get('/', (req, res) => {
  const alleAutos = cars.listCars({});
  res.render('admin/dashboard', { title: 'Beheerpaneel', autos: alleAutos });
});

// Nieuwe auto - formulier
router.get('/auto/nieuw', (req, res) => {
  res.render('admin/form', {
    title: 'Auto toevoegen',
    auto: null,
    errors: [],
    statuses: cars.STATUSES,
    maxFotos: MAX_FOTOS,
    maxFotoMb: MAX_FOTO_MB,
  });
});

// Nieuwe auto - opslaan
router.post('/auto/nieuw', upload.array('fotos', MAX_FOTOS), async (req, res) => {
  const data = parseCarForm(req.body);
  const errors = validateCarForm(data);

  if (errors.length) {
    // opgeloade bestanden bij validatiefout weer opruimen
    (req.files || []).forEach((f) => fs.unlink(f.path, () => {}));
    return res.status(400).render('admin/form', {
      title: 'Auto toevoegen',
      auto: { ...data, images: [] },
      errors,
      statuses: cars.STATUSES,
      maxFotos: MAX_FOTOS,
      maxFotoMb: MAX_FOTO_MB,
    });
  }

  await generateThumbnails(req.files);

  const id = cars.createCar(data);
  (req.files || []).forEach((file, i) => cars.addImage(id, file.filename, i));

  setFlash(req, 'success', `${data.merk} ${data.model} is toegevoegd.`);
  res.redirect('/admin');
});

// Auto bewerken - formulier
router.get('/auto/:id/bewerken', (req, res) => {
  const auto = cars.getById(req.params.id);
  if (!auto) return res.status(404).render('404', { title: 'Niet gevonden' });
  res.render('admin/form', {
    title: 'Auto bewerken',
    auto,
    errors: [],
    statuses: cars.STATUSES,
    maxFotos: MAX_FOTOS,
    maxFotoMb: MAX_FOTO_MB,
  });
});

// Auto bewerken - opslaan
router.post('/auto/:id/bewerken', upload.array('fotos', MAX_FOTOS), async (req, res) => {
  const existing = cars.getById(req.params.id);
  if (!existing) return res.status(404).render('404', { title: 'Niet gevonden' });

  const data = parseCarForm(req.body);
  const errors = validateCarForm(data);

  if (errors.length) {
    (req.files || []).forEach((f) => fs.unlink(f.path, () => {}));
    return res.status(400).render('admin/form', {
      title: 'Auto bewerken',
      auto: { ...existing, ...data, id: existing.id },
      errors,
      statuses: cars.STATUSES,
      maxFotos: MAX_FOTOS,
      maxFotoMb: MAX_FOTO_MB,
    });
  }

  await generateThumbnails(req.files);

  cars.updateCar(existing.id, data);
  const startOrder = existing.images.length;
  (req.files || []).forEach((file, i) => cars.addImage(existing.id, file.filename, startOrder + i));

  if (req.body.foto_volgorde) {
    const orderedIds = req.body.foto_volgorde
      .split(',')
      .map((v) => parseInt(v, 10))
      .filter((v) => !Number.isNaN(v));
    if (orderedIds.length) cars.reorderImages(existing.id, orderedIds);
  }

  setFlash(req, 'success', `${data.merk} ${data.model} is bijgewerkt.`);
  res.redirect('/admin');
});

// Auto verwijderen
router.post('/auto/:id/verwijderen', (req, res) => {
  const auto = cars.getById(req.params.id);
  if (auto) {
    auto.images.forEach((img) => {
      fs.unlink(path.join(uploadsDir, img.filename), () => {});
      removeThumbnail(uploadsDir, img.filename);
    });
    cars.deleteCar(auto.id);
    setFlash(req, 'success', `${auto.merk} ${auto.model} is verwijderd.`);
  }
  res.redirect('/admin');
});

// Eén foto verwijderen (bv. tijdens bewerken)
router.post('/auto/:id/foto/:fotoId/verwijderen', (req, res) => {
  const image = cars.getImage(req.params.fotoId);
  if (image && String(image.car_id) === req.params.id) {
    fs.unlink(path.join(uploadsDir, image.filename), () => {});
    removeThumbnail(uploadsDir, image.filename);
    cars.deleteImage(image.id);
  }
  res.redirect(`/admin/auto/${req.params.id}/bewerken`);
});

// Instellingen: bedrijfsgegevens die op de site getoond worden
router.get('/instellingen', (req, res) => {
  res.render('admin/settings', {
    title: 'Instellingen',
    values: settings.getSettings(),
    errors: [],
  });
});

router.post('/instellingen', (req, res) => {
  const data = parseSettingsForm(req.body);
  const errors = validateSettingsForm(data);

  if (errors.length) {
    return res.status(400).render('admin/settings', {
      title: 'Instellingen',
      values: data,
      errors,
    });
  }

  settings.updateSettings(data);
  setFlash(req, 'success', 'Instellingen zijn opgeslagen.');
  res.redirect('/admin/instellingen');
});

// Fout-afhandeling specifiek voor upload-fouten (bv. verkeerd bestandstype, te groot, te veel foto's)
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes('afbeeldingen zijn toegestaan')) {
    let message = err.message || 'Uploaden van foto is mislukt.';
    if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
      message = `Je kunt maximaal ${MAX_FOTOS} foto's in één keer uploaden. Selecteer een kleiner aantal en probeer het opnieuw.`;
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      message = `Eén of meer foto's zijn groter dan ${MAX_FOTO_MB}MB. Verklein de foto('s) en probeer het opnieuw.`;
    }
    setFlash(req, 'error', message);
    // Let op: hier NIET res.redirect('back') gebruiken. Helmet zet standaard de
    // header "Referrer-Policy: no-referrer", waardoor de browser geen Referer
    // meestuurt en Express bij 'back' dan terugvalt op '/' (de homepage) — de
    // auto-wijzigingen lijken dan spoorloos verdwenen. req.originalUrl bevat
    // altijd het juiste formulier-adres (nieuw of bewerken), ook al is
    // req.params op dit punt (in een gedeelde error-handler) niet meer
    // betrouwbaar gevuld.
    return res.redirect(req.originalUrl);
  }
  next(err);
});

module.exports = router;
