// Maakt (of update) het admin-account op basis van ADMIN_USERNAME / ADMIN_PASSWORD
// in het .env bestand, of vraagt er interactief naar. Draai met: npm run create-admin
require('dotenv').config();
const readline = require('readline');
const users = require('../db/users');

const interactive = process.stdin.isTTY;

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  let username = process.env.ADMIN_USERNAME || '';
  let password = process.env.ADMIN_PASSWORD || '';

  if (!username && interactive) {
    username = (await ask('Gebruikersnaam voor het admin-account [admin]: ')).trim();
  }
  if (!username) username = 'admin';

  const passwordIsPlaceholder = !password || password === 'verander-dit-wachtwoord';
  if (passwordIsPlaceholder) {
    if (interactive) {
      password = await ask('Wachtwoord voor het admin-account (min. 8 tekens): ');
    } else {
      console.error(
        'Geen (echt) ADMIN_PASSWORD gevonden in .env en dit is geen interactieve terminal.\n' +
        'Zet ADMIN_PASSWORD in .env op een echt wachtwoord en draai dit script opnieuw,\n' +
        'of draai "npm run create-admin" in een gewone terminal om interactief een wachtwoord in te voeren.'
      );
      process.exit(1);
    }
  }

  if (!password || password.length < 8) {
    console.error('Wachtwoord moet minimaal 8 tekens lang zijn. Stop.');
    process.exit(1);
  }

  const existing = users.findByUsername(username);
  if (existing) {
    users.updatePassword(existing.id, password);
    console.log(`Wachtwoord van bestaand account "${username}" is bijgewerkt.`);
  } else {
    users.createUser(username, password);
    console.log(`Admin-account "${username}" is aangemaakt.`);
  }
  process.exit(0);
}

main();
