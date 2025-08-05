#!/bin/bash

# SalonManager Deployment Script
# This script sets up a complete SalonManager application with all features

set -e

echo "🚀 Starting SalonManager Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check system requirements
print_status "Checking system requirements..."

# Check PHP version
PHP_VERSION=$(php -v | head -n 1 | cut -d " " -f 2 | cut -d "." -f 1,2)
if [[ $(echo "$PHP_VERSION >= 8.1" | bc -l) -eq 1 ]]; then
    print_success "PHP version $PHP_VERSION is compatible"
else
    print_error "PHP version $PHP_VERSION is not compatible. Required: 8.1+"
    exit 1
fi

# Check Composer
if command -v composer &> /dev/null; then
    print_success "Composer is installed"
else
    print_error "Composer is not installed"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d "v" -f 2)
    print_success "Node.js version $NODE_VERSION is installed"
else
    print_error "Node.js is not installed"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    print_success "npm is installed"
else
    print_error "npm is not installed"
    exit 1
fi

# Check MySQL
if command -v mysql &> /dev/null; then
    print_success "MySQL is installed"
else
    print_warning "MySQL is not installed. Please install it manually."
fi

# Check Redis
if command -v redis-server &> /dev/null; then
    print_success "Redis is installed"
else
    print_warning "Redis is not installed. Please install it manually."
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p storage/app/public/qr_codes
mkdir -p storage/app/public/exports
mkdir -p storage/app/public/images/icons
mkdir -p storage/app/public/images/screenshots
mkdir -p storage/logs
mkdir -p storage/framework/cache
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views

# Set proper permissions
print_status "Setting permissions..."
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# Install PHP dependencies
print_status "Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install

# Build frontend assets
print_status "Building frontend assets..."
npm run build

# Copy environment file
if [ ! -f .env ]; then
    print_status "Creating .env file..."
    cp .env.example .env
    print_warning "Please configure your .env file with your database and API credentials"
else
    print_success ".env file already exists"
fi

# Generate application key
print_status "Generating application key..."
php artisan key:generate

# Create storage link
print_status "Creating storage link..."
php artisan storage:link

# Run database migrations
print_status "Running database migrations..."
php artisan migrate --force

# Run database seeders
print_status "Running database seeders..."
php artisan db:seed --force

# Clear and cache configuration
print_status "Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Install additional packages if needed
print_status "Installing additional packages..."

# QR Code package
composer require simplesoftwareio/simple-qrcode

# Image processing
composer require intervention/image

# PDF generation
composer require barryvdh/laravel-dompdf

# Permissions
composer require spatie/laravel-permission

# Activity logging
composer require spatie/laravel-activitylog

# Backup
composer require spatie/laravel-backup

# Sanctum for API
composer require laravel/sanctum

# Pusher for real-time
composer require pusher/pusher-php-server

# Publish vendor files
print_status "Publishing vendor files..."
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider"
php artisan vendor:publish --provider="Spatie\Backup\BackupServiceProvider"

# Run additional migrations
print_status "Running additional migrations..."
php artisan migrate --force

# Create default icons for PWA
print_status "Creating PWA icons..."
mkdir -p public/images/icons

# Create a simple default icon (you should replace this with your actual icon)
cat > public/images/icons/icon-192x192.png << 'EOF'
iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3Njape.org5vuPBoAAA==
EOF

# Copy the same icon for all sizes
cp public/images/icons/icon-192x192.png public/images/icons/icon-72x72.png
cp public/images/icons/icon-192x192.png public/images/icons/icon-96x96.png
cp public/images/icons/icon-192x192.png public/images/icons/icon-128x128.png
cp public/images/icons/icon-192x192.png public/images/icons/icon-144x144.png
cp public/images/icons/icon-192x192.png public/images/icons/icon-152x152.png
cp public/images/icons/icon-192x192.png public/images/icons/icon-384x384.png
cp public/images/icons/icon-192x192.png public/images/icons/icon-512x512.png

# Create shortcut icons
cp public/images/icons/icon-192x192.png public/images/icons/calendar-96x96.png
cp public/images/icons/icon-192x192.png public/images/icons/dashboard-96x96.png
cp public/images/icons/icon-192x192.png public/images/icons/users-96x96.png

# Create screenshots directory
mkdir -p public/images/screenshots

# Set up cron job for scheduler
print_status "Setting up cron job..."
(crontab -l 2>/dev/null; echo "* * * * * cd $(pwd) && php artisan schedule:run >> /dev/null 2>&1") | crontab -

# Create systemd service for queue worker
print_status "Creating systemd service for queue worker..."
sudo tee /etc/systemd/system/salonmanager-queue.service > /dev/null <<EOF
[Unit]
Description=SalonManager Queue Worker
After=network.target

[Service]
Type=simple
User=$(whoami)
Group=$(whoami)
Restart=always
ExecStart=/usr/bin/php $(pwd)/artisan queue:work --sleep=3 --tries=3 --max-time=3600
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl enable salonmanager-queue.service
sudo systemctl start salonmanager-queue.service

# Create supervisor configuration for queue workers
print_status "Creating supervisor configuration..."
sudo tee /etc/supervisor/conf.d/salonmanager.conf > /dev/null <<EOF
[program:salonmanager-worker]
process_name=%(program_name)s_%(process_num)02d
command=php $(pwd)/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
user=$(whoami)
numprocs=2
redirect_stderr=true
stdout_logfile=$(pwd)/storage/logs/worker.log
EOF

# Reload supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start salonmanager-worker:*

# Set up Nginx configuration
print_status "Setting up Nginx configuration..."
sudo tee /etc/nginx/sites-available/salonmanager > /dev/null <<EOF
server {
    listen 80;
    server_name salonmanager.local;
    root $(pwd)/public;
    index index.php index.html index.htm;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # PWA support
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Service worker
    location = /service-worker.js {
        add_header Cache-Control "no-cache";
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/salonmanager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Set up SSL with Let's Encrypt (optional)
read -p "Do you want to set up SSL with Let's Encrypt? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Setting up SSL with Let's Encrypt..."
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
    
    read -p "Enter your domain name: " DOMAIN_NAME
    sudo certbot --nginx -d $DOMAIN_NAME
fi

# Create backup script
print_status "Creating backup script..."
tee scripts/backup.sh > /dev/null <<EOF
#!/bin/bash
# Backup script for SalonManager

BACKUP_DIR="/var/backups/salonmanager"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# Database backup
mysqldump -u root -p salonmanager > \$BACKUP_DIR/database_\$DATE.sql

# Files backup
tar -czf \$BACKUP_DIR/files_\$DATE.tar.gz --exclude=node_modules --exclude=vendor .

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: \$DATE"
EOF

chmod +x scripts/backup.sh

# Create monitoring script
print_status "Creating monitoring script..."
tee scripts/monitor.sh > /dev/null <<EOF
#!/bin/bash
# Monitoring script for SalonManager

echo "=== SalonManager System Status ==="
echo "Date: \$(date)"
echo "Uptime: \$(uptime)"
echo "Disk Usage: \$(df -h / | tail -1)"
echo "Memory Usage: \$(free -h | grep Mem)"
echo "CPU Load: \$(cat /proc/loadavg)"

echo ""
echo "=== Application Status ==="
echo "Queue Jobs: \$(php artisan queue:work --once 2>/dev/null | wc -l)"
echo "Failed Jobs: \$(php artisan queue:failed 2>/dev/null | wc -l)"
echo "Storage Usage: \$(du -sh storage/ | cut -f1)"

echo ""
echo "=== Service Status ==="
systemctl is-active nginx
systemctl is-active mysql
systemctl is-active redis-server
systemctl is-active salonmanager-queue
EOF

chmod +x scripts/monitor.sh

# Create update script
print_status "Creating update script..."
tee scripts/update.sh > /dev/null <<EOF
#!/bin/bash
# Update script for SalonManager

echo "Updating SalonManager..."

# Backup before update
./scripts/backup.sh

# Pull latest changes
git pull origin main

# Install dependencies
composer install --no-dev --optimize-autoloader
npm install
npm run build

# Run migrations
php artisan migrate --force

# Clear caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart services
sudo systemctl restart salonmanager-queue
sudo supervisorctl restart salonmanager-worker:*

echo "Update completed!"
EOF

chmod +x scripts/update.sh

# Create health check endpoint
print_status "Creating health check endpoint..."
tee routes/health.php > /dev/null <<EOF
<?php

Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now(),
        'version' => '1.0.0',
        'services' => [
            'database' => DB::connection()->getPdo() ? 'connected' : 'disconnected',
            'redis' => Redis::connection()->ping() ? 'connected' : 'disconnected',
            'queue' => 'running'
        ]
    ]);
});
EOF

# Final setup
print_status "Performing final setup..."

# Create default admin user
php artisan tinker --execute="
    \$user = new App\Models\User();
    \$user->name = 'Admin';
    \$user->email = 'admin@salonmanager.com';
    \$user->password = Hash::make('admin123');
    \$user->role = 'admin';
    \$user->is_active = true;
    \$user->save();
    echo 'Default admin user created: admin@salonmanager.com / admin123';
"

# Create default salon
php artisan tinker --execute="
    \$salon = new App\Models\Salon();
    \$salon->name = 'Mein Salon';
    \$salon->description = 'Ein professioneller Salon';
    \$salon->address = 'Musterstraße 123, 12345 Musterstadt';
    \$salon->phone = '+49 123 456789';
    \$salon->email = 'info@meinsalon.de';
    \$salon->is_active = true;
    \$salon->save();
    echo 'Default salon created: Mein Salon';
"

print_success "🎉 SalonManager deployment completed successfully!"

echo ""
echo "=== Next Steps ==="
echo "1. Configure your .env file with database credentials and API keys"
echo "2. Set up your domain name and SSL certificate"
echo "3. Configure email settings for notifications"
echo "4. Set up payment gateway credentials (Stripe, PayPal)"
echo "5. Configure AI API keys (OpenAI)"
echo "6. Set up push notification services"
echo ""
echo "=== Default Credentials ==="
echo "Admin Email: admin@salonmanager.com"
echo "Admin Password: admin123"
echo ""
echo "=== Useful Commands ==="
echo "Monitor system: ./scripts/monitor.sh"
echo "Create backup: ./scripts/backup.sh"
echo "Update system: ./scripts/update.sh"
echo "Health check: curl http://localhost/health"
echo ""
echo "=== Services ==="
echo "Web server: http://localhost"
echo "Queue worker: systemctl status salonmanager-queue"
echo "Supervisor: supervisorctl status"
echo ""

print_success "SalonManager is now ready for use!" 