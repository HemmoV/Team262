const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Drie formaten, zodat de browser nooit een grote sprong in verkleining hoeft
// te maken (dat kan er korrelig/blokkerig uit gaan zien):
// - "card": voor de autokaarten, die tot zo'n 400px breed getoond worden.
// - "small": voor de kleinere weergaves (foto-strip op de detailpagina,
//   beheerdersoverzicht, foto-voorbeelden bij bewerken), die rond de 150px
//   getoond worden.
// - "hero": voor de grote uitgelichte foto bovenaan de homepage, die tot
//   zo'n 1150px breed en 560px hoog getoond wordt. Zonder dit formaat werd
//   daar de originele foto (soms 5000+ pixels breed, meerdere MB's) direct
//   getoond — de browser moet die dan zelf sterk verkleinen, wat er
//   afhankelijk van toestel/beeldscherm blokkerig/korrelig uit kan zien.
// Alle drie zijn 16:10 / een vergelijkbare verhouding, met marge voor
// schermen met hoge pixeldichtheid (retina).
const CARD_WIDTH = 800;
const CARD_HEIGHT = 500;
const SMALL_WIDTH = 320;
const SMALL_HEIGHT = 220;
const HERO_WIDTH = 2400;
const HERO_HEIGHT = 1160;

function thumbFilename(filename) {
  const base = filename.replace(/\.[^.]+$/, '');
  return `thumb-${base}.jpg`;
}

function smallThumbFilename(filename) {
  const base = filename.replace(/\.[^.]+$/, '');
  return `thumb-sm-${base}.jpg`;
}

function heroThumbFilename(filename) {
  const base = filename.replace(/\.[^.]+$/, '');
  return `thumb-hero-${base}.jpg`;
}

async function resizeTo(inputPath, outputPath, width, height) {
  await sharp(inputPath)
    .rotate() // corrigeert orientatie o.b.v. EXIF-data (bv. foto's vanaf telefoon)
    .resize(width, height, { fit: 'cover' })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(outputPath);
}

// Genereert alle drie thumbnail-formaten van een geüploade foto.
async function generateThumbnail(uploadsDir, filename) {
  const inputPath = path.join(uploadsDir, filename);
  await Promise.all([
    resizeTo(inputPath, path.join(uploadsDir, thumbFilename(filename)), CARD_WIDTH, CARD_HEIGHT),
    resizeTo(inputPath, path.join(uploadsDir, smallThumbFilename(filename)), SMALL_WIDTH, SMALL_HEIGHT),
    resizeTo(inputPath, path.join(uploadsDir, heroThumbFilename(filename)), HERO_WIDTH, HERO_HEIGHT),
  ]);
}

function removeThumbnail(uploadsDir, filename) {
  fs.unlink(path.join(uploadsDir, thumbFilename(filename)), () => {});
  fs.unlink(path.join(uploadsDir, smallThumbFilename(filename)), () => {});
  fs.unlink(path.join(uploadsDir, heroThumbFilename(filename)), () => {});
}

module.exports = {
  thumbFilename,
  smallThumbFilename,
  heroThumbFilename,
  generateThumbnail,
  removeThumbnail,
};
