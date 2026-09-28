const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Twee formaten, zodat de browser nooit een grote sprong in verkleining hoeft
// te maken (dat kan er korrelig uit gaan zien):
// - "card": voor de autokaarten, die tot zo'n 400px breed getoond worden.
// - "small": voor de kleinere weergaves (foto-strip op de detailpagina,
//   beheerdersoverzicht, foto-voorbeelden bij bewerken), die rond de 150px
//   getoond worden. Beide zijn 16:10 / een vergelijkbare verhouding, met
//   marge voor schermen met hoge pixeldichtheid (retina).
const CARD_WIDTH = 800;
const CARD_HEIGHT = 500;
const SMALL_WIDTH = 320;
const SMALL_HEIGHT = 220;

function thumbFilename(filename) {
  const base = filename.replace(/\.[^.]+$/, '');
  return `thumb-${base}.jpg`;
}

function smallThumbFilename(filename) {
  const base = filename.replace(/\.[^.]+$/, '');
  return `thumb-sm-${base}.jpg`;
}

async function resizeTo(inputPath, outputPath, width, height) {
  await sharp(inputPath)
    .rotate() // corrigeert orientatie o.b.v. EXIF-data (bv. foto's vanaf telefoon)
    .resize(width, height, { fit: 'cover' })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(outputPath);
}

// Genereert beide thumbnail-formaten van een geüploade foto.
async function generateThumbnail(uploadsDir, filename) {
  const inputPath = path.join(uploadsDir, filename);
  await Promise.all([
    resizeTo(inputPath, path.join(uploadsDir, thumbFilename(filename)), CARD_WIDTH, CARD_HEIGHT),
    resizeTo(inputPath, path.join(uploadsDir, smallThumbFilename(filename)), SMALL_WIDTH, SMALL_HEIGHT),
  ]);
}

function removeThumbnail(uploadsDir, filename) {
  fs.unlink(path.join(uploadsDir, thumbFilename(filename)), () => {});
  fs.unlink(path.join(uploadsDir, smallThumbFilename(filename)), () => {});
}

module.exports = { thumbFilename, smallThumbFilename, generateThumbnail, removeThumbnail };
