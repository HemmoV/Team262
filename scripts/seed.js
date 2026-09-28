// Vult de website met een paar voorbeeldauto's, zodat je meteen kunt zien hoe
// alles eruitziet. Draai met: npm run seed
// Je kunt deze voorbeeldauto's later gewoon verwijderen via het beheerpaneel.
const fs = require('fs');
const path = require('path');
const cars = require('../db/cars');

const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'cars');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

function makePlaceholder(filename, label, gradientFrom, gradientTo) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${gradientFrom}"/>
      <stop offset="100%" stop-color="${gradientTo}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#g)"/>
  <text x="600" y="420" font-family="Georgia, serif" font-size="64" fill="rgba(255,255,255,0.85)" text-anchor="middle">${label}</text>
  <text x="600" y="470" font-family="Arial, sans-serif" font-size="22" letter-spacing="4" fill="rgba(201,169,97,0.9)" text-anchor="middle">TEAM262 — VOORBEELDFOTO</text>
</svg>`;
  fs.writeFileSync(path.join(uploadsDir, filename), svg);
}

const samples = [
  {
    merk: 'Porsche', model: '911 Carrera S', bouwjaar: 2022, km_stand: 18500,
    vermogen_pk: 450, prijs: 154950, brandstof: 'Benzine', transmissie: 'Automaat',
    kleur: "GT-zilver metallic",
    beschrijving: 'Prachtige, vrijwel nieuwe 911 Carrera S met uitgebreide fabrieksopties, waaronder sportuitlaat, achteras-besturing en het Bose Surround Sound-systeem. Volledig onderhouden bij het officiële dealernetwerk.',
    status: 'beschikbaar', uitgelicht: 1,
    image: 'seed-porsche.svg', from: '#1b1f24', to: '#3a3f47',
  },
  {
    merk: 'Mercedes-AMG', model: 'GT 63 S', bouwjaar: 2021, km_stand: 27200,
    vermogen_pk: 639, prijs: 139500, brandstof: 'Benzine', transmissie: 'Automaat',
    kleur: 'Obsidiaanzwart metallic',
    beschrijving: 'Indrukwekkende AMG GT 63 S 4-deurs coupé met AMG Performance-stoelen, carbon-pakket en Burmester High-End 3D-Surround Sound. Een van de weinige exemplaren met volledige optielijst.',
    status: 'beschikbaar', uitgelicht: 1,
    image: 'seed-amg.svg', from: '#101010', to: '#2c2c2c',
  },
  {
    merk: 'Audi', model: 'RS6 Avant', bouwjaar: 2023, km_stand: 9200,
    vermogen_pk: 600, prijs: 164900, brandstof: 'Benzine', transmissie: 'Automaat',
    kleur: 'Nardogrijs',
    beschrijving: 'Zo goed als nieuwe RS6 Avant met RS Dynamic-pakket plus (305 km/u), keramische remmen en panoramadak. De ultieme combinatie van dagelijkse bruikbaarheid en topprestaties.',
    status: 'gereserveerd', uitgelicht: 1,
    image: 'seed-audi.svg', from: '#232830', to: '#4a5568',
  },
  {
    merk: 'BMW', model: 'M4 Competition', bouwjaar: 2020, km_stand: 41000,
    vermogen_pk: 510, prijs: 84950, brandstof: 'Benzine', transmissie: 'Automaat',
    kleur: 'Isle of Man Green metallic',
    beschrijving: 'Opvallende M4 Competition in de zeldzame kleur Isle of Man Green, voorzien van M Carbon-pakket en schaalstoelen. Onderhoudshistorie volledig bekend en gedocumenteerd.',
    status: 'beschikbaar', uitgelicht: 0,
    image: 'seed-bmw.svg', from: '#0f1f18', to: '#1e4030',
  },
];

for (const s of samples) {
  makePlaceholder(s.image, `${s.merk} ${s.model}`, s.from, s.to);
  const id = cars.createCar(s);
  cars.addImage(id, s.image, 0);
  console.log(`Aangemaakt: ${s.merk} ${s.model} (id ${id})`);
}

console.log('Klaar. Voorbeeldauto\'s zijn toegevoegd — verwijder ze via het beheerpaneel wanneer je eigen aanbod klaar staat.');
