require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const helmet = require('helmet');
const { thumbFilename, smallThumbFilename, heroThumbFilename } = require('./lib/thumbnails');

require('./db/database'); // zorgt dat de database + tabellen bestaan

const publicRoutes = require('./routes/public');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

const settings = require('./db/settings');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1); // nodig als de site achter een reverse proxy (bv. Nginx) draait

app.use(
  helmet({
    contentSecurityPolicy: false, // eenvoudig gehouden; zet aan/verfijn dit als je externe scripts toevoegt
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.sqlite', dir: path.join(__dirname, 'data') }),
    secret: process.env.SESSION_SECRET || 'dev-secret-verander-mij',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.COOKIE_SECURE === 'true',
      maxAge: 1000 * 60 * 60 * 12, // 12 uur
    },
  })
);

const carUploadsDir = path.join(__dirname, 'public', 'uploads', 'cars');

// Maak ingelogde gebruiker, bedrijfsgegevens + flash-berichten beschikbaar in alle templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  res.locals.path = req.path;
  res.locals.site = settings.getSettings();
  // Voor de canonical-link en og:url/twitter-tags in <head> — werkt automatisch
  // op elk domein/IP waarop de site draait, zonder handmatige configuratie.
  res.locals.canonicalUrl = `${req.protocol}://${req.get('host')}${req.path}`;
  // Geeft in templates de URL van de verkleinde, scherpe thumbnail terug —
  // en valt terug op de originele foto als er (nog) geen thumbnail bestaat.
  res.locals.thumbUrl = (filename) => {
    const thumb = thumbFilename(filename);
    return fs.existsSync(path.join(carUploadsDir, thumb))
      ? `/uploads/cars/${thumb}`
      : `/uploads/cars/${filename}`;
  };
  // Kleinere variant voor de foto-strip, het beheerdersoverzicht en de
  // foto-voorbeelden bij bewerken — dichter bij de daadwerkelijke
  // weergavegrootte, zodat de browser minder hoeft bij te schalen.
  res.locals.smallThumbUrl = (filename) => {
    const thumb = smallThumbFilename(filename);
    return fs.existsSync(path.join(carUploadsDir, thumb))
      ? `/uploads/cars/${thumb}`
      : res.locals.thumbUrl(filename);
  };
  // Grote, scherpe variant voor de uitgelichte foto bovenaan de homepage —
  // voorkomt dat de (vaak zeer grote) originele foto rechtstreeks getoond
  // wordt, wat er blokkerig/korrelig uit kan zien.
  res.locals.heroUrl = (filename) => {
    const thumb = heroThumbFilename(filename);
    return fs.existsSync(path.join(carUploadsDir, thumb))
      ? `/uploads/cars/${thumb}`
      : res.locals.thumbUrl(filename);
  };
  delete req.session.flash;
  next();
});

app.use('/', publicRoutes);
app.use('/admin', authRoutes);
app.use('/admin', adminRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Pagina niet gevonden — Team262',
    description: 'De pagina die u zoekt bestaat niet (meer). Ga terug naar de homepage of bekijk ons actuele aanbod.',
    noindex: true,
  });
});

// Algemene foutafhandeling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('500', {
    title: 'Er ging iets mis — Team262',
    description: 'Er is een onverwachte fout opgetreden. Probeer het later opnieuw.',
    noindex: true,
  });
});

app.listen(PORT, () => {
  console.log(`Team262-website draait op http://localhost:${PORT}`);
});
