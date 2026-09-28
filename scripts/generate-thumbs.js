// Genereert (of vernieuwt) scherpe, verkleinde thumbnails voor foto's die al
// eerder zijn geüpload, vóórdat automatische thumbnails bestonden.
// Nodig na het bijwerken van de site — daarna gebeurt dit vanzelf bij elke
// nieuwe upload. Draai met: npm run generate-thumbs
const fs = require('fs');
const path = require('path');
const { generateThumbnail } = require('../lib/thumbnails');

const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'cars');

async function main() {
  if (!fs.existsSync(uploadsDir)) {
    console.log('Geen uploads-map gevonden, niets te doen.');
    return;
  }

  const files = fs.readdirSync(uploadsDir).filter((f) => !f.startsWith('thumb-'));
  let done = 0;
  for (const file of files) {
    try {
      await generateThumbnail(uploadsDir, file);
      done++;
    } catch (err) {
      console.error(`Kon geen thumbnail maken voor ${file}:`, err.message);
    }
  }
  console.log(`Klaar: ${done} van ${files.length} foto's verwerkt.`);
}

main();
