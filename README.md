# Team262 — website

Website voor team262.nl: een showroom voor exclusieve en sportieve auto's, met
een beveiligd beheerpaneel om auto's toe te voegen, te bewerken en te
verwijderen.

## Wat zit erin

- **Publieke site**: homepage met uitgelichte auto's, volledig aanbod met
  filters (brandstof, transmissie, prijs, sortering), autodetailpagina met
  fotogalerij, "Over ons" en een contactpagina met formulier.
- **Beheerpaneel** (`/admin`): login met gebruikersnaam/wachtwoord, overzicht
  van alle auto's, en formulieren om auto's toe te voegen, te bewerken
  en te verwijderen, met:
  - een **rijke tekst-editor** voor de autobeschrijving (vet, cursief,
    opsommingen, citaten);
  - **foto's slepen om te herordenen** (de eerste foto is de hoofdfoto);
  - een **instellingenpagina** (`/admin/instellingen`) om bedrijfsgegevens
    — telefoon, adres, openingstijden, social media — zelf aan te passen,
    zonder in de code te hoeven wijzigen.
- **Contactformulier**: verstuurt binnenkomende berichten als e-mail (via
  SMTP) zodra dat is ingesteld, met hCaptcha-spambescherming en een limiet
  op het aantal berichten per IP-adres per uur.
- **Techniek**: Node.js + Express, met SQLite als database (één bestand,
  geen aparte databaseserver nodig) — prima geschikt om op een VPS te
  draaien.

## 1. Lokaal uitproberen

Vereist: [Node.js](https://nodejs.org) versie 18 of hoger.

```bash
npm install
cp .env.example .env
```

Open `.env` en vul in ieder geval een eigen `SESSION_SECRET` en een echt
`ADMIN_PASSWORD` in (zie de toelichting in het bestand zelf).

```bash
npm run create-admin   # maakt het admin-account op basis van .env
npm run seed            # optioneel: vult de site met 4 voorbeeldauto's
npm start
```

De site draait nu op http://localhost:3000, het beheerpaneel op
http://localhost:3000/admin.

## 2. Bedrijfsgegevens invullen

Log in op `/admin` en ga naar **Instellingen** (rechtsboven). Daar vul je de
echte gegevens van Team262 in: telefoonnummer, e-mailadres, showroomadres,
openingstijden, social media en KvK-nummer. Deze gegevens worden automatisch
op de hele site getoond (footer, contactpagina, etc.) en direct na opslaan
bijgewerkt — geen herstart nodig.

`config/site.js` bevat alleen nog de standaardwaarden waarmee de
instellingenpagina de allereerste keer wordt gevuld (bij een lege database).

De logo's staan al klaar in `public/img/` (zwarte en witte variant).

## 3. Live zetten op je VPS

Deze stappen gaan ervan uit dat je een Ubuntu/Debian-VPS hebt met SSH-toegang
en dat `team262.nl` (en eventueel `www.team262.nl`) al met een A-record naar
het IP-adres van je VPS wijst.

### 3.1 Node.js installeren

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs
node -v   # controleer dat dit v18 of hoger is
```

### 3.2 Project naar de server kopiëren

Upload deze projectmap naar de server, bijvoorbeeld met `scp` of `rsync`
vanaf je eigen computer:

```bash
rsync -avz --exclude node_modules --exclude data ./team262/ gebruiker@jouw-server:/var/www/team262/
```

(Of gebruik git als je de code in een repository zet.)

### 3.3 Installeren en configureren

```bash
cd /var/www/team262
npm install --omit=dev
cp .env.example .env
nano .env
```

Vul in `.env` in ieder geval in:
- `SESSION_SECRET`: een lange, willekeurige waarde (bv. gegenereerd met
  `openssl rand -hex 32`)
- `COOKIE_SECURE=true` (zodra HTTPS actief is, zie stap 3.6)
- `ADMIN_USERNAME` en `ADMIN_PASSWORD`: jouw gekozen inloggegevens

Maak daarna het admin-account aan:

```bash
npm run create-admin
```

### 3.4 De site altijd laten draaien met PM2

PM2 zorgt dat de website blijft draaien, ook na een herstart van de server.

```bash
sudo npm install -g pm2
pm2 start server.js --name team262
pm2 save
pm2 startup   # volg de instructie die dit commando toont
```

Nuttige commando's: `pm2 logs team262`, `pm2 restart team262`.

### 3.5 Nginx als reverse proxy

Installeer Nginx en zorg dat inkomend verkeer op poort 80/443 wordt
doorgestuurd naar de Node-app op poort 3000 (die alleen lokaal bereikbaar
hoeft te zijn):

```bash
sudo apt-get install -y nginx
```

Maak `/etc/nginx/sites-available/team262.nl` aan met:

```nginx
server {
    listen 80;
    server_name team262.nl www.team262.nl;

    client_max_body_size 700m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activeer de configuratie:

```bash
sudo ln -s /etc/nginx/sites-available/team262.nl /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3.6 HTTPS met Let's Encrypt

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d team262.nl -d www.team262.nl
```

Certbot past de Nginx-configuratie automatisch aan voor HTTPS. Zet daarna in
`.env` op de server `COOKIE_SECURE=true` (indien nog niet gedaan) en herstart
de app: `pm2 restart team262`.

### 3.7 Firewall

Zorg dat alleen SSH, HTTP en HTTPS van buitenaf bereikbaar zijn (poort 3000
hoeft niet publiek open te staan, want Nginx verbindt via `127.0.0.1`):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 4. Dagelijks gebruik

- **Auto's beheren**: ga naar `https://team262.nl/admin`, log in, en gebruik
  "Auto toevoegen", "Bewerken" of "Verwijderen" per auto.
- **Status**: elke auto heeft een status — *beschikbaar*, *gereserveerd* of
  *verkocht*. Verkochte auto's verdwijnen automatisch uit het openbare
  aanbod (maar de link naar de detailpagina blijft nog werken, mocht die
  ergens gedeeld zijn).
- **Uitlichten**: vink "Uitlichten op homepage" aan om een auto op de
  homepage te tonen (maximaal 3 tegelijk zichtbaar).
- **Foto-volgorde**: sleep de foto's in het bewerkformulier naar de
  gewenste volgorde; de eerste foto is steeds de hoofdfoto op de
  detailpagina en in het overzicht.
- **Wachtwoord wijzigen**: pas `ADMIN_PASSWORD` aan in `.env` op de server en
  draai opnieuw `npm run create-admin`.

## 5. Back-ups

De volgende twee locaties bevatten alle belangrijke data en verdienen
een regelmatige back-up (bijvoorbeeld met een dagelijkse cronjob):

- `data/team262.sqlite` — alle autogegevens en het admin-account
- `public/uploads/cars/` — alle geüploade foto's

Voorbeeld back-up commando:

```bash
tar -czf team262-backup-$(date +%F).tar.gz data public/uploads
```

## 6. Contactformulier: e-mail en spambescherming instellen

Het contactformulier op `/contact` verstuurt binnenkomende berichten als
e-mail zodra er SMTP-gegevens in `.env` staan (`SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `CONTACT_TO`) — bijvoorbeeld de
gegevens van je hostingpartij of een dienst zoals Postmark/Resend. Zolang
deze niet zijn ingevuld, worden berichten alleen naar de serverlogs
geschreven (`pm2 logs team262`), zodat het formulier niet stukloopt.

Voor bescherming tegen spam-bots kun je een gratis
[hCaptcha](https://www.hcaptcha.com/)-account aanmaken en `HCAPTCHA_SITE_KEY`
+ `HCAPTCHA_SECRET_KEY` invullen in `.env`. Zonder deze sleutels wordt de
spamcontrole overgeslagen (het formulier blijft dan gewoon werken, alleen
zonder bot-bescherming) — er geldt wel altijd een limiet van 8 berichten per
uur per IP-adres.

Herstart de app na het aanpassen van `.env`: `pm2 restart team262`.

## Projectstructuur

```
config/site.js        Standaardwaarden voor de instellingenpagina
db/                    Database-verbinding en modellen (cars, users, settings)
lib/                   Contactformulier-logica: e-mail, hCaptcha, rate-limiting
routes/                Express-routes (publiek, login, beheerpaneel)
views/                 EJS-templates
public/                CSS, JS, logo's en geüploade autofoto's
scripts/               Hulpscripts: create-admin, seed
data/                  SQLite-database (wordt automatisch aangemaakt)
```

## Webshop (shop.team262.nl)

In de map [`shop/`](shop/README.md) staat de webshop voor producten rond het stallen van
auto's. Het is een aparte applicatie (Next.js + PostgreSQL) in dezelfde huisstijl, die op
dezelfde VPS draait op poort 3001 naast deze site. Installatie, lokaal testen en publiceren
staan in [`shop/README.md`](shop/README.md).
