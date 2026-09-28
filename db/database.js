const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'team262.sqlite');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cars (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  merk TEXT NOT NULL,
  model TEXT NOT NULL,
  bouwjaar INTEGER,
  km_stand INTEGER,
  vermogen_pk INTEGER,
  prijs INTEGER,
  brandstof TEXT,
  transmissie TEXT,
  kleur TEXT,
  beschrijving TEXT,
  status TEXT NOT NULL DEFAULT 'beschikbaar',
  uitgelicht INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS car_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  naam TEXT NOT NULL,
  slogan TEXT NOT NULL DEFAULT '',
  telefoon TEXT NOT NULL DEFAULT '',
  telefoon_href TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  adres TEXT NOT NULL DEFAULT '',
  plaats TEXT NOT NULL DEFAULT '',
  openingstijden TEXT NOT NULL DEFAULT '[]',
  instagram TEXT NOT NULL DEFAULT '',
  facebook TEXT NOT NULL DEFAULT '',
  linkedin TEXT NOT NULL DEFAULT '',
  kvk TEXT NOT NULL DEFAULT ''
);
`);

// Kleine, idempotente migraties voor kolommen die na de eerste release zijn
// toegevoegd — CREATE TABLE IF NOT EXISTS raakt bestaande databases niet.
function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = columns.some((c) => c.name === column);
  if (!exists) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

ensureColumn('cars', 'btw', 'TEXT');

module.exports = db;
