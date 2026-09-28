# Team262 Shop — shop.team262.nl

Webshop voor producten rond het stallen van auto's: autohoezen, acculaders, bandenwiegen,
ontvochtigers, onderhoud en garage-inrichting. De shop gebruikt dezelfde huisstijl als
team262.nl (logo, lettertypes, kleuren en componenten uit `public/css/style.css`), maar is
een aparte applicatie met een eigen database, zodat de autosite ongemoeid blijft.

**Techniek:** Next.js 14 · TypeScript · Prisma · PostgreSQL

## Wat zit erin

| Onderdeel | Pad |
|---|---|
| Homepage met categorieën en uitgelichte producten | `/` |
| Productoverzicht met categorieën, zoeken en sorteren | `/producten` |
| Productpagina met "in winkelwagen" | `/producten/[slug]` |
| Winkelwagen (bewaard in de browser) | `/winkelwagen` |
| Afrekenen: klantgegevens → bestelling, voorraad wordt direct afgeboekt | `/afrekenen` |
| Bevestigingspagina | `/bestelling/[id]` |
| Contact & service | `/contact` |
| Beheer: dashboard, bestellingen (status wijzigen; bij annuleren gaat de voorraad terug), producten met foto-upload, categorieën | `/admin` |

Prijzen zijn inclusief 21% btw. Verzendkosten € 6,95, gratis vanaf € 75 (instelbaar in `.env`).

> **Nog niet gekoppeld:** online betalen (bijv. Mollie/iDEAL) en bevestigingsmails.
> Bestellingen komen binnen met status *nieuw* en de klant ziet dat de betaalinstructies volgen.

### Huisstijl

`app/team262.css` is een kopie van `../public/css/style.css` van de hoofdsite. Pas je daar
iets aan (kleuren, knoppen, lettertypes), kopieer het bestand dan opnieuw naar de shop.
Shop-specifieke opmaak (winkelwagen, beheer) staat in `app/shop.css`.

---

## 1. Lokaal testen

### Optie A — alles in Docker (het makkelijkst)

Vereist: [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
cd shop
docker compose up --build
```

- Shop: <http://localhost:3001>
- Beheer: <http://localhost:3001/admin>, wachtwoord `admin`
- Database: PostgreSQL op `localhost:5433`

De `shop-seed`-container laadt eenmalig 6 categorieën en 12 demoproducten. Bestaande data
wordt niet overschreven. Opnieuw beginnen met een lege database: `docker compose down -v`.

### Optie B — Node lokaal, alleen de database in Docker (handig tijdens ontwikkelen)

```bash
cd shop
cp .env.example .env          # ADMIN_PASSWORD en SESSION_SECRET invullen
npm install
docker compose up shop-db -d  # PostgreSQL op poort 5433
npx prisma migrate deploy
npm run db:seed
npm run dev                   # http://localhost:3001
```

Na een wijziging in `prisma/schema.prisma`: `npm run db:migrate`.

---

## 2. Live zetten op dezelfde VPS als team262.nl

De shop kan prima op dezelfde VPS. Hij draait op poort **3001**, naast team262.nl op 3000.
Nginx stuurt verkeer op basis van de domeinnaam naar de juiste app:

```
                      ┌─ team262.nl       → 127.0.0.1:3000  (autosite, PM2)
internet → nginx ─────┤
  (80/443)            └─ shop.team262.nl  → 127.0.0.1:3001  (shop)
```

### 2.1 DNS bij TransIP

TransIP control panel → **Domeinen** → `team262.nl` → **DNS** → voeg toe:

| Naam | Type | Waarde |
|---|---|---|
| `shop` | A | IP-adres van de VPS |

### 2.2 PostgreSQL installeren (eenmalig)

```bash
sudo apt-get install -y postgresql
sudo -u postgres psql -c "CREATE USER team262shop WITH PASSWORD 'kies-een-sterk-wachtwoord';"
sudo -u postgres psql -c "CREATE DATABASE team262shop OWNER team262shop;"
```

### 2.3 Shop installeren en starten met PM2

De code staat al op de server als je team262.nl met git hebt uitgerold; anders eerst
`git clone https://github.com/HemmoV/Team262.git /var/www/team262`.

```bash
cd /var/www/team262/shop
cp .env.example .env
nano .env
```

Vul in `.env` in:
- `DATABASE_URL=postgresql://team262shop:<wachtwoord>@localhost:5432/team262shop`
- `ADMIN_PASSWORD`: wachtwoord voor `/admin`
- `SESSION_SECRET`: lange willekeurige waarde (`openssl rand -hex 32`)
- eventueel `NEXT_PUBLIC_CONTACT_PHONE` en de verzendkosten

```bash
npm ci
npx prisma migrate deploy
npm run db:seed               # optioneel: demoproducten
npm run build
pm2 start npm --name team262-shop -- start
pm2 save
```

### 2.4 Nginx en HTTPS

```bash
sudo cp deploy/nginx-shop.team262.nl.conf /etc/nginx/sites-available/shop.team262.nl
sudo ln -s /etc/nginx/sites-available/shop.team262.nl /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d shop.team262.nl
```

### 2.5 Updaten

```bash
cd /var/www/team262 && git pull
cd shop && npm ci && npx prisma migrate deploy && npm run build
pm2 restart team262-shop
```

### Liever Docker op de VPS?

`deploy/docker-compose.prod.yml` start de shop en een eigen PostgreSQL in Docker, alleen
bereikbaar op `127.0.0.1:3001`. Nginx en certbot blijven hetzelfde als in 2.4.

```bash
cd /var/www/team262/shop/deploy
cp ../.env.example .env       # POSTGRES_PASSWORD, ADMIN_PASSWORD en SESSION_SECRET invullen
docker compose -f docker-compose.prod.yml up -d --build
```

### Back-ups

- De database: `sudo -u postgres pg_dump team262shop > shop-$(date +%F).sql`
- Productfoto's: `shop/public/uploads/products/` (bij Docker: het volume `shop-uploads`)

### Checklist

- [ ] `https://shop.team262.nl` werkt met een geldig certificaat
- [ ] `ADMIN_PASSWORD` is sterk en `SESSION_SECRET` is willekeurig
- [ ] Testbestelling geplaatst en zichtbaar in `/admin/bestellingen`
- [ ] Productfoto uploaden werkt en de foto blijft staan na `pm2 restart`
- [ ] Back-up van database en foto's ingepland

---

## Environment variabelen

Zie `.env.example`. `NEXT_PUBLIC_*`-waarden worden tijdens de build in de site gezet; na een
wijziging opnieuw `npm run build` (of de Docker-image opnieuw bouwen).
