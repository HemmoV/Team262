// Gegevens die op meerdere plekken in de shop getoond worden.
// Aan te passen via environment variabelen (zie .env.example).
export const site = {
  naam: 'Team262',
  hoofdsite: process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? 'https://team262.nl',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'info@team262.nl',
  telefoon: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '',
};
