const db = require('./database');
const defaults = require('../config/site.js');

function ensureSeeded() {
  const existing = db.prepare('SELECT id FROM settings WHERE id = 1').get();
  if (existing) return;

  db.prepare(`
    INSERT INTO settings (id, naam, slogan, telefoon, telefoon_href, email, adres, plaats, openingstijden, instagram, facebook, linkedin, kvk)
    VALUES (1, @naam, @slogan, @telefoon, @telefoon_href, @email, @adres, @plaats, @openingstijden, @instagram, @facebook, @linkedin, @kvk)
  `).run({
    naam: defaults.naam,
    slogan: defaults.slogan,
    telefoon: defaults.telefoon,
    telefoon_href: defaults.telefoonHref,
    email: defaults.email,
    adres: defaults.adres,
    plaats: defaults.plaats,
    openingstijden: JSON.stringify(defaults.openingstijden || []),
    instagram: defaults.social?.instagram || '',
    facebook: defaults.social?.facebook || '',
    linkedin: defaults.social?.linkedin || '',
    kvk: defaults.kvk,
  });
}

ensureSeeded();

function rowToSite(row) {
  let openingstijden = [];
  try {
    openingstijden = JSON.parse(row.openingstijden || '[]');
  } catch (e) {
    openingstijden = [];
  }
  return {
    naam: row.naam,
    slogan: row.slogan,
    telefoon: row.telefoon,
    telefoonHref: row.telefoon_href,
    email: row.email,
    adres: row.adres,
    plaats: row.plaats,
    openingstijden,
    social: {
      instagram: row.instagram,
      facebook: row.facebook,
      linkedin: row.linkedin,
    },
    kvk: row.kvk,
  };
}

function getSettings() {
  const row = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  if (!row) {
    // Zou niet moeten gebeuren (ensureSeeded draait bij het laden van deze module),
    // maar val voor de zekerheid terug op de code-defaults.
    return defaults;
  }
  return rowToSite(row);
}

function updateSettings(data) {
  const openingstijden = Array.isArray(data.openingstijden) ? data.openingstijden : [];
  db.prepare(`
    UPDATE settings SET
      naam = @naam,
      slogan = @slogan,
      telefoon = @telefoon,
      telefoon_href = @telefoon_href,
      email = @email,
      adres = @adres,
      plaats = @plaats,
      openingstijden = @openingstijden,
      instagram = @instagram,
      facebook = @facebook,
      linkedin = @linkedin,
      kvk = @kvk
    WHERE id = 1
  `).run({
    naam: data.naam,
    slogan: data.slogan,
    telefoon: data.telefoon,
    telefoon_href: data.telefoonHref,
    email: data.email,
    adres: data.adres,
    plaats: data.plaats,
    openingstijden: JSON.stringify(openingstijden),
    instagram: data.instagram || '',
    facebook: data.facebook || '',
    linkedin: data.linkedin || '',
    kvk: data.kvk,
  });
  return getSettings();
}

module.exports = { getSettings, updateSettings };
