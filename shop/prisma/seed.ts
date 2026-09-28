import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { slug: 'autohoezen', name: 'Autohoezen', description: 'Ademende binnen- en buitenhoezen die lak en interieur beschermen tijdens de stalling.', sortOrder: 1 },
  { slug: 'acculaders', name: 'Acculaders & druppelladers', description: 'Houd de accu in topconditie, ook als de auto maanden stilstaat.', sortOrder: 2 },
  { slug: 'banden-wielen', name: 'Banden & wielen', description: 'Bandenwiegen, bandenhoezen en compressoren tegen standplekken.', sortOrder: 3 },
  { slug: 'vocht-klimaat', name: 'Vocht & klimaat', description: 'Ontvochtigers en klimaatbeheersing voor een droge stallingsruimte.', sortOrder: 4 },
  { slug: 'onderhoud', name: 'Onderhoud & verzorging', description: 'Conserveermiddelen, brandstofstabilisatoren en verzorgingsproducten.', sortOrder: 5 },
  { slug: 'garage', name: 'Garage & inrichting', description: 'Vloermatten, parkeerhulpen en inrichting voor de garage.', sortOrder: 6 },
];

const products: {
  slug: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  featured?: boolean;
  shortDescription: string;
  description: string;
}[] = [
  {
    slug: 'indoor-autohoes-stretch-zwart',
    name: 'Indoor autohoes Stretch — zwart',
    sku: 'T262-HOES-IN-01',
    category: 'autohoezen',
    price: 189,
    stock: 12,
    featured: true,
    shortDescription: 'Zachte, rekbare binnenhoes die als een tweede huid om de auto valt.',
    description:
      '<p>De Stretch indoor autohoes is gemaakt van een elastisch, ademend materiaal met een zachte fleece binnenkant. De hoes sluit perfect aan op de contouren van de auto en voorkomt stof en krassen tijdens de stalling.</p><ul><li>Ademend: geen condensvorming</li><li>Zachte binnenvoering, veilig voor de lak</li><li>Inclusief opbergtas</li></ul>',
  },
  {
    slug: 'outdoor-autohoes-allweather',
    name: 'Outdoor autohoes All-Weather',
    sku: 'T262-HOES-OUT-01',
    category: 'autohoezen',
    price: 249,
    compareAtPrice: 279,
    stock: 6,
    shortDescription: 'Waterafstotende, ademende hoes voor tijdelijke buitenstalling.',
    description:
      '<p>Meerlaagse buitenhoes die beschermt tegen regen, UV-straling en vuil, terwijl vocht van binnenuit kan ontsnappen.</p><ul><li>4-laags opbouw</li><li>Elastische zoom en spanbanden</li><li>Reflecterende strips</li></ul>',
  },
  {
    slug: 'druppellader-5a-smart',
    name: 'Druppellader 5A Smart',
    sku: 'T262-ACCU-05',
    category: 'acculaders',
    price: 99,
    stock: 20,
    featured: true,
    shortDescription: 'Intelligente onderhoudslader voor 12V accu’s, veilig om maanden aan te laten staan.',
    description:
      '<p>Deze slimme lader bewaakt continu de spanning van de accu en laadt alleen bij wanneer dat nodig is. Ideaal voor klassiekers en sportwagens in winterstalling.</p><ul><li>Geschikt voor lood-zuur, AGM en lithium</li><li>Temperatuurcompensatie</li><li>Inclusief oogkabels en krokodillenklemmen</li></ul>',
  },
  {
    slug: 'accu-verlengkabel-3m',
    name: 'Snelkoppeling verlengkabel 3 m',
    sku: 'T262-ACCU-KAB3',
    category: 'acculaders',
    price: 24.95,
    stock: 40,
    shortDescription: 'Leg de lader op afstand en houd de motorruimte dicht.',
    description: '<p>Verlengkabel met snelkoppeling, compatibel met onze druppelladers.</p>',
  },
  {
    slug: 'bandenwiegen-set-4',
    name: 'Bandenwiegen set van 4',
    sku: 'T262-BAND-WIEG4',
    category: 'banden-wielen',
    price: 169,
    stock: 8,
    featured: true,
    shortDescription: 'Voorkom standplekken in de banden tijdens langdurige stalling.',
    description:
      '<p>De gebogen vorm verdeelt het gewicht van de auto over een groter oppervlak van de band, zodat er geen vlakke plekken ontstaan.</p><ul><li>Geschikt voor banden tot 335 mm breed</li><li>Antislip onderkant</li><li>Draagvermogen 1.000 kg per stuk</li></ul>',
  },
  {
    slug: 'digitale-bandenpomp',
    name: 'Digitale bandenpomp 12V',
    sku: 'T262-BAND-POMP',
    category: 'banden-wielen',
    price: 79,
    stock: 15,
    shortDescription: 'Zet de banden op stallingsdruk met automatische uitschakeling.',
    description: '<p>Compacte compressor met digitaal display en instelbare doeldruk.</p>',
  },
  {
    slug: 'luchtontvochtiger-garage-20l',
    name: 'Luchtontvochtiger garage 20 L/dag',
    sku: 'T262-KLIM-20',
    category: 'vocht-klimaat',
    price: 279,
    stock: 5,
    featured: true,
    shortDescription: 'Houdt de luchtvochtigheid in de stalling onder 50% tegen roest en schimmel.',
    description:
      '<p>Krachtige compressor-ontvochtiger met hygrostaat en continue afvoer. Geschikt voor ruimtes tot 100 m².</p>',
  },
  {
    slug: 'vochtvreter-interieur-3pack',
    name: 'Vochtvreter interieur (3 stuks)',
    sku: 'T262-KLIM-VV3',
    category: 'vocht-klimaat',
    price: 19.95,
    stock: 50,
    shortDescription: 'Herbruikbare vochtabsorbeerders voor in het interieur.',
    description: '<p>Leg ze in het interieur en de kofferbak. Oplaadbaar in de magnetron.</p>',
  },
  {
    slug: 'brandstofstabilisator-250ml',
    name: 'Brandstofstabilisator 250 ml',
    sku: 'T262-OND-STAB',
    category: 'onderhoud',
    price: 17.5,
    stock: 60,
    shortDescription: 'Voorkomt veroudering van brandstof tijdens de winterstalling.',
    description: '<p>Voeg toe aan een volle tank voordat de auto de stalling in gaat. Genoeg voor 250 liter brandstof.</p>',
  },
  {
    slug: 'lakconserveer-set',
    name: 'Lakconserveer set Premium',
    sku: 'T262-OND-LAK',
    category: 'onderhoud',
    price: 89,
    stock: 10,
    shortDescription: 'Complete set om de lak te reinigen en te beschermen voor de stalling.',
    description: '<p>Bevat shampoo, klei, polish en een hardwax sealant plus microvezeldoeken.</p>',
  },
  {
    slug: 'parkeerhulp-laser',
    name: 'Laser parkeerhulp',
    sku: 'T262-GAR-LASER',
    category: 'garage',
    price: 34.95,
    stock: 25,
    shortDescription: 'Parkeer elke keer precies op de juiste plek in de garage.',
    description: '<p>Plafondmontage, bewegingssensor en automatische uitschakeling.</p>',
  },
  {
    slug: 'garagevloermat-oliebestendig',
    name: 'Garagevloermat oliebestendig 5 × 2,5 m',
    sku: 'T262-GAR-MAT',
    category: 'garage',
    price: 229,
    stock: 4,
    shortDescription: 'Beschermt de vloer en vangt vocht en olie op.',
    description: '<p>Absorberende bovenlaag met waterdichte onderlaag. Op maat te knippen.</p>',
  },
];

async function main() {
  // Alleen aanmaken wat nog niet bestaat: wijzigingen via de admin blijven behouden
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  const cats = await prisma.category.findMany();
  const bySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  for (const { category, ...p } of products) {
    const data = { ...p, categoryId: bySlug[category] };
    await prisma.product.upsert({ where: { slug: p.slug }, update: {}, create: data });
  }
  console.log(`Seed klaar: ${categories.length} categorieën, ${products.length} producten`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
