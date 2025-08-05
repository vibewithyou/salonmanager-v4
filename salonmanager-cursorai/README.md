# SalonManager - Complete Salon Management System

Ein vollständiges Salon-Management-System mit moderner Web-Technologie, PWA-Funktionalität und KI-Integration.

## 🚀 Features

### 📅 Terminverwaltung
- **Flexible Terminbuchung** mit Stylist-Auswahl
- **Wiederkehrende Termine** / Abo-System
- **Drag & Drop Kalender** mit visueller Terminplanung
- **Automatische Konfliktprüfung** und Verfügbarkeitsanzeige
- **Termin-Erinnerungen** per E-Mail/SMS
- **Termin-Chat** mit Archivierung

### 🧑‍🎨 Stylist & Team-Funktionen
- **Teamverwaltung** (Chef & Mitarbeitende)
- **Stylisten-PWA** (mobile App-Version)
- **PDF-Export** eigener Termine
- **Push-Benachrichtigungen** (Buchung, Bewertung, Aktionen)
- **Rollenbasierte Berechtigungen** (Admin, Stylist, Kunde)

### 💳 Shop & Zahlungssystem
- **Produktverkauf** je Salon (Shop)
- **Gutscheine kaufen & einlösen**
- **Rechnungserstellung als PDF**
- **Online-Zahlung** (Stripe, PayPal, SEPA)
- **Versandbenachrichtigung**

### 📢 Kommunikation & UX
- **News-/Aktionsbereich** je Salon
- **Kunden-Galerie** / Inspiration
- **Designwahl pro Kunde** (Hell/Dunkel)
- **Push & PWA für Kunden**
- **Mehrsprachigkeit**: DE, EN, TR, AR, RU, FR, IT

### 🧠 KI & Automatisierung
- **KI-Terminvorschläge** (freie Zeiten + Wunschstylist)
- **KI-Frisuren-Vorschläge** (Bildanalyse)
- **Chatbot für Buchung & Support**
- **KI-Auswertung von Bewertungen** (Stimmung/Trends)

### ⚙️ Admin & Sicherheit
- **Statistiken & Dashboard**
- **CSV-/Excel-Export** (Termine, Kunden, Bewertungen)
- **DSGVO-Download & Datenlöschung**
- **Automatisierte Backups**
- **2-Faktor-Login** (Stylisten/Admin)
- **Login-Logs / IP-Kontrolle**

### 📍 Standort & Kartensuche
- **Interaktive Karte** mit Filter (nach Preis, Bewertung, Entfernung)
- **Live-Verfügbarkeit** auf Karte

## 🛠️ Technologie-Stack

### Backend
- **Laravel 12** - PHP Framework
- **MySQL/PostgreSQL** - Datenbank
- **Redis** - Caching & Sessions
- **Pusher** - Real-time Features
- **Stripe/PayPal** - Zahlungsabwicklung

### Frontend
- **Vue.js 3** - Progressive Web App
- **Tailwind CSS** - Styling
- **Alpine.js** - Interaktivität
- **Chart.js** - Analytics
- **Leaflet** - Kartenintegration

### DevOps
- **Docker** - Containerisierung
- **Laravel Forge** - Deployment
- **AWS S3** - File Storage
- **CloudFlare** - CDN

## 📋 Systemanforderungen

- **PHP**: 8.2 oder höher
- **Composer**: 2.0 oder höher
- **Node.js**: 18.0 oder höher
- **MySQL**: 8.0 oder höher
- **Redis**: 6.0 oder höher
- **Webserver**: Apache/Nginx

## 🚀 Installation

### 1. Repository klonen
```bash
git clone https://github.com/your-username/salonmanager.git
cd salonmanager
```

### 2. Dependencies installieren
```bash
# PHP Dependencies
composer install

# Node.js Dependencies
npm install
```

### 3. Umgebung konfigurieren
```bash
# .env Datei erstellen
cp .env.example .env

# Application Key generieren
php artisan key:generate
```

### 4. Datenbank einrichten
```bash
# Datenbank-Migrationen ausführen
php artisan migrate

# Seeders ausführen (Beispieldaten)
php artisan db:seed
```

### 5. Storage-Links erstellen
```bash
php artisan storage:link
```

### 6. Frontend bauen
```bash
# Development
npm run dev

# Production
npm run build
```

### 7. Queue Worker starten
```bash
php artisan queue:work
```

### 8. Server starten
```bash
php artisan serve
```

## 🔧 Konfiguration

### Umgebungsvariablen (.env)

```env
# App
APP_NAME=SalonManager
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=salonmanager
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@your-domain.com"
MAIL_FROM_NAME="${APP_NAME}"

# Pusher (Real-time)
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

# Stripe
STRIPE_KEY=your_stripe_key
STRIPE_SECRET=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your_bucket_name
```

### Cron Jobs einrichten

Fügen Sie folgende Cron Jobs hinzu:

```bash
# Laravel Scheduler
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1

# Queue Worker (falls nicht als Service)
* * * * * cd /path-to-your-project && php artisan queue:work --sleep=3 --tries=3 >> /dev/null 2>&1
```

## 📱 PWA Setup

### Service Worker registrieren
Der Service Worker wird automatisch registriert. Stellen Sie sicher, dass HTTPS aktiviert ist.

### Manifest anpassen
Bearbeiten Sie die `manifest.json` Route in `routes/web.php` für Ihre Bedürfnisse.

## 🔐 Sicherheit

### SSL/HTTPS
- SSL-Zertifikat installieren
- HTTPS erzwingen in `.env`: `APP_URL=https://your-domain.com`

### Firewall
```bash
# UFW Firewall aktivieren
sudo ufw enable
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
```

### Backup-Strategie
```bash
# Automatische Backups
php artisan backup:run

# Backup zu S3
php artisan backup:run --only-db
```

## 📊 Monitoring

### Logs
```bash
# Laravel Logs
tail -f storage/logs/laravel.log

# Queue Logs
tail -f storage/logs/queue.log
```

### Performance
```bash
# Cache leeren
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimieren
php artisan optimize
php artisan config:cache
php artisan route:cache
```

## 🚀 Deployment

### Mit Laravel Forge
1. Server in Forge erstellen
2. Repository verbinden
3. Deployment Script anpassen
4. SSL-Zertifikat installieren
5. Queue Worker als Service einrichten

### Mit Docker
```bash
# Docker Compose
docker-compose up -d

# Production Build
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Skalierung

### Horizontal Scaling
- **Load Balancer** einrichten
- **Redis Cluster** für Sessions
- **Database Replication** konfigurieren
- **CDN** für statische Assets

### Vertical Scaling
- **Server-Ressourcen** erhöhen
- **Database-Optimierung** durchführen
- **Caching-Strategien** implementieren

## 🐛 Troubleshooting

### Häufige Probleme

#### 1. Queue Worker startet nicht
```bash
# Queue Worker Status prüfen
php artisan queue:work --verbose

# Failed Jobs anzeigen
php artisan queue:failed
```

#### 2. Storage-Links funktionieren nicht
```bash
# Storage-Links neu erstellen
php artisan storage:link --force
```

#### 3. Permissions-Probleme
```bash
# Verzeichnis-Berechtigungen setzen
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

#### 4. Composer-Autoload Probleme
```bash
# Composer Cache leeren
composer dump-autoload
composer clear-cache
```

## 🤝 Beitragen

1. Fork das Repository
2. Feature Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add some AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request erstellen

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe [LICENSE](LICENSE) Datei für Details.

## 📞 Support

- **E-Mail**: support@salonmanager.com
- **Dokumentation**: https://docs.salonmanager.com
- **Issues**: https://github.com/your-username/salonmanager/issues

## 🙏 Danksagungen

- **Laravel Team** für das fantastische Framework
- **Tailwind CSS** für das CSS-Framework
- **Vue.js Team** für das Frontend-Framework
- **Alle Contributors** für ihre Beiträge

---

**SalonManager** - Modernes Salon-Management für die digitale Zukunft 💈✨ 