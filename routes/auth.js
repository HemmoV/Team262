const express = require('express');
const rateLimitStore = new Map();

const users = require('../db/users');

const router = express.Router();

function tooManyAttempts(ip) {
  const entry = rateLimitStore.get(ip);
  if (!entry) return false;
  const windowMs = 15 * 60 * 1000;
  if (Date.now() - entry.first > windowMs) {
    rateLimitStore.delete(ip);
    return false;
  }
  return entry.count >= 10;
}

function registerAttempt(ip) {
  const entry = rateLimitStore.get(ip);
  if (!entry) {
    rateLimitStore.set(ip, { count: 1, first: Date.now() });
  } else {
    entry.count += 1;
  }
}

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/admin');
  res.render('admin/login', { title: 'Inloggen', error: null });
});

router.post('/login', (req, res) => {
  const ip = req.ip;
  if (tooManyAttempts(ip)) {
    return res.status(429).render('admin/login', {
      title: 'Inloggen',
      error: 'Te veel inlogpogingen. Probeer het over enkele minuten opnieuw.',
    });
  }

  const { username, password } = req.body;
  const user = username ? users.findByUsername(username.trim()) : null;

  if (!user || !users.verifyPassword(user, password || '')) {
    registerAttempt(ip);
    return res.status(401).render('admin/login', {
      title: 'Inloggen',
      error: 'Onjuiste gebruikersnaam of wachtwoord.',
    });
  }

  req.session.regenerate((err) => {
    if (err) return res.status(500).render('admin/login', { title: 'Inloggen', error: 'Er ging iets mis, probeer opnieuw.' });
    req.session.user = { id: user.id, username: user.username };
    res.redirect('/admin');
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

module.exports = router;
