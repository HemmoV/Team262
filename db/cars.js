const db = require('./database');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // verwijder accenten
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function uniqueSlug(base) {
  let slug = slugify(base) || 'auto';
  let candidate = slug;
  let i = 2;
  const exists = db.prepare('SELECT id FROM cars WHERE slug = ?');
  while (exists.get(candidate)) {
    candidate = `${slug}-${i}`;
    i += 1;
  }
  return candidate;
}

const STATUSES = ['beschikbaar', 'gereserveerd', 'verkocht'];
const BTW_OPTIONS = ['marge', 'btw'];
const BTW_LABELS = { marge: 'Marge auto', btw: 'BTW auto' };

function withImages(car) {
  if (!car) return car;
  const images = db
    .prepare('SELECT * FROM car_images WHERE car_id = ? ORDER BY sort_order ASC, id ASC')
    .all(car.id);
  return { ...car, images };
}

function listCars({ onlyPublic = false, brandstof, transmissie, minPrijs, maxPrijs, sort } = {}) {
  let query = 'SELECT * FROM cars WHERE 1=1';
  const params = [];

  if (onlyPublic) {
    query += " AND status != 'verkocht'";
  }
  if (brandstof) {
    query += ' AND brandstof = ?';
    params.push(brandstof);
  }
  if (transmissie) {
    query += ' AND transmissie = ?';
    params.push(transmissie);
  }
  if (minPrijs) {
    query += ' AND prijs >= ?';
    params.push(minPrijs);
  }
  if (maxPrijs) {
    query += ' AND prijs <= ?';
    params.push(maxPrijs);
  }

  const sortMap = {
    prijs_asc: 'prijs ASC',
    prijs_desc: 'prijs DESC',
    bouwjaar_desc: 'bouwjaar DESC',
    bouwjaar_asc: 'bouwjaar ASC',
    nieuwste: 'created_at DESC',
  };
  query += ` ORDER BY ${sortMap[sort] || 'created_at DESC'}`;

  const cars = db.prepare(query).all(...params);
  return cars.map(withImages);
}

function listFeatured(limit = 3) {
  const cars = db
    .prepare(
      "SELECT * FROM cars WHERE uitgelicht = 1 AND status != 'verkocht' ORDER BY created_at DESC LIMIT ?"
    )
    .all(limit);
  if (cars.length < limit) {
    const existingIds = cars.map((c) => c.id);
    const placeholders = existingIds.length ? existingIds.map(() => '?').join(',') : '0';
    const extra = db
      .prepare(
        `SELECT * FROM cars WHERE status != 'verkocht' AND id NOT IN (${placeholders}) ORDER BY created_at DESC LIMIT ?`
      )
      .all(...existingIds, limit - cars.length);
    cars.push(...extra);
  }
  return cars.map(withImages);
}

function getBySlug(slug) {
  const car = db.prepare('SELECT * FROM cars WHERE slug = ?').get(slug);
  return withImages(car);
}

function getById(id) {
  const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(id);
  return withImages(car);
}

function createCar(data) {
  const slug = uniqueSlug(`${data.merk}-${data.model}-${data.bouwjaar || ''}`);
  const stmt = db.prepare(`
    INSERT INTO cars (slug, merk, model, bouwjaar, km_stand, vermogen_pk, prijs, brandstof, transmissie, kleur, btw, beschrijving, status, uitgelicht)
    VALUES (@slug, @merk, @model, @bouwjaar, @km_stand, @vermogen_pk, @prijs, @brandstof, @transmissie, @kleur, @btw, @beschrijving, @status, @uitgelicht)
  `);
  const info = stmt.run({
    slug,
    merk: data.merk,
    model: data.model,
    bouwjaar: data.bouwjaar || null,
    km_stand: data.km_stand || null,
    vermogen_pk: data.vermogen_pk || null,
    prijs: data.prijs || null,
    brandstof: data.brandstof || null,
    transmissie: data.transmissie || null,
    kleur: data.kleur || null,
    btw: BTW_OPTIONS.includes(data.btw) ? data.btw : null,
    beschrijving: data.beschrijving || null,
    status: STATUSES.includes(data.status) ? data.status : 'beschikbaar',
    uitgelicht: data.uitgelicht ? 1 : 0,
  });
  return info.lastInsertRowid;
}

function updateCar(id, data) {
  const stmt = db.prepare(`
    UPDATE cars SET
      merk = @merk,
      model = @model,
      bouwjaar = @bouwjaar,
      km_stand = @km_stand,
      vermogen_pk = @vermogen_pk,
      prijs = @prijs,
      brandstof = @brandstof,
      transmissie = @transmissie,
      kleur = @kleur,
      btw = @btw,
      beschrijving = @beschrijving,
      status = @status,
      uitgelicht = @uitgelicht,
      updated_at = datetime('now')
    WHERE id = @id
  `);
  stmt.run({
    id,
    merk: data.merk,
    model: data.model,
    bouwjaar: data.bouwjaar || null,
    km_stand: data.km_stand || null,
    vermogen_pk: data.vermogen_pk || null,
    prijs: data.prijs || null,
    brandstof: data.brandstof || null,
    transmissie: data.transmissie || null,
    kleur: data.kleur || null,
    btw: BTW_OPTIONS.includes(data.btw) ? data.btw : null,
    beschrijving: data.beschrijving || null,
    status: STATUSES.includes(data.status) ? data.status : 'beschikbaar',
    uitgelicht: data.uitgelicht ? 1 : 0,
  });
}

function deleteCar(id) {
  db.prepare('DELETE FROM cars WHERE id = ?').run(id);
}

function addImage(carId, filename, sortOrder = 0) {
  db.prepare('INSERT INTO car_images (car_id, filename, sort_order) VALUES (?, ?, ?)').run(
    carId,
    filename,
    sortOrder
  );
}

function deleteImage(imageId) {
  db.prepare('DELETE FROM car_images WHERE id = ?').run(imageId);
}

function reorderImages(carId, orderedImageIds) {
  const update = db.prepare('UPDATE car_images SET sort_order = ? WHERE id = ? AND car_id = ?');
  const applyOrder = db.transaction((ids) => {
    ids.forEach((imageId, index) => update.run(index, imageId, carId));
  });
  applyOrder(orderedImageIds);
}

function getImage(imageId) {
  return db.prepare('SELECT * FROM car_images WHERE id = ?').get(imageId);
}

function distinctValues(column) {
  const allowed = ['brandstof', 'transmissie'];
  if (!allowed.includes(column)) return [];
  return db
    .prepare(`SELECT DISTINCT ${column} AS v FROM cars WHERE ${column} IS NOT NULL AND ${column} != '' ORDER BY ${column} ASC`)
    .all()
    .map((r) => r.v);
}

module.exports = {
  STATUSES,
  BTW_OPTIONS,
  BTW_LABELS,
  listCars,
  listFeatured,
  getBySlug,
  getById,
  createCar,
  updateCar,
  deleteCar,
  addImage,
  deleteImage,
  reorderImages,
  getImage,
  distinctValues,
};
