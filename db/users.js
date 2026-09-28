const bcrypt = require('bcryptjs');
const db = require('./database');

function findByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

function findById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function createUser(username, plainPassword) {
  const hash = bcrypt.hashSync(plainPassword, 12);
  const info = db
    .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
    .run(username, hash);
  return info.lastInsertRowid;
}

function updatePassword(id, plainPassword) {
  const hash = bcrypt.hashSync(plainPassword, 12);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, id);
}

function verifyPassword(user, plainPassword) {
  return bcrypt.compareSync(plainPassword, user.password_hash);
}

function countUsers() {
  return db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
}

module.exports = {
  findByUsername,
  findById,
  createUser,
  updatePassword,
  verifyPassword,
  countUsers,
};
