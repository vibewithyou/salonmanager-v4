#!/bin/bash

# SalonManager Installation Script
# This script will install and configure SalonManager

set -e

echo "🚀 Starting SalonManager Installation..."
echo "========================================"

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
PHP_VERSION=$(php -v | head -n1 | cut -d' ' -f2 | cut -d'.' -f1,2)
if [[ $(echo "$PHP_VERSION >= 8.2" | bc -l) -eq 0 ]]; then
    print_error "PHP 8.2 or higher is required. Current version: $PHP_VERSION"
    exit 1
fi
print_success "PHP version: $PHP_VERSION"

# Check Composer
if ! command -v composer &> /dev/null; then
    print_error "Composer is not installed. Please install Composer first."
    exit 1
fi
print_success "Composer is installed"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2)
print_success "Node.js version: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi
print_success "npm is installed"

# Check MySQL
if ! command -v mysql &> /dev/null; then
    print_warning "MySQL is not installed. You'll need to install it manually."
else
    print_success "MySQL is installed"
fi

# Check Redis
if ! command -v redis-server &> /dev/null; then
    print_warning "Redis is not installed. You'll need to install it manually."
else
    print_success "Redis is installed"
fi

echo ""
print_status "System requirements check completed!"
echo ""

# Install PHP dependencies
print_status "Installing PHP dependencies..."
composer install --no-interaction --optimize-autoloader
print_success "PHP dependencies installed"

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install
print_success "Node.js dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file..."
    cp env.example .env
    print_success ".env file created"
else
    print_warning ".env file already exists"
fi

# Generate application key
print_status "Generating application key..."
php artisan key:generate --force
print_success "Application key generated"

# Create storage link
print_status "Creating storage link..."
php artisan storage:link
print_success "Storage link created"

# Run database migrations
print_status "Running database migrations..."
php artisan migrate --force
print_success "Database migrations completed"

# Run seeders if database is empty
print_status "Checking if database needs seeding..."
if php artisan tinker --execute="echo App\Models\User::count();" | grep -q "0"; then
    print_status "Running database seeders..."
    php artisan db:seed --force
    print_success "Database seeded with sample data"
else
    print_warning "Database already contains data, skipping seeders"
fi

# Build frontend assets
print_status "Building frontend assets..."
npm run build
print_success "Frontend assets built"

# Set proper permissions
print_status "Setting proper permissions..."
chmod -R 775 storage bootstrap/cache
print_success "Permissions set"

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p storage/app/public/uploads
mkdir -p storage/app/public/avatars
mkdir -p storage/app/public/logos
mkdir -p storage/app/public/banners
mkdir -p storage/app/public/gallery
print_success "Directories created"

# Install additional tools
print_status "Installing additional tools..."

# Install Laravel Telescope (for development)
if [ "$APP_ENV" = "local" ]; then
    composer require laravel/telescope --dev
    php artisan telescope:install
    php artisan migrate
    print_success "Laravel Telescope installed"
fi

# Install Laravel Debugbar (for development)
if [ "$APP_ENV" = "local" ]; then
    composer require barryvdh/laravel-debugbar --dev
    print_success "Laravel Debugbar installed"
fi

print_success "Additional tools installed"

# Create cron job for scheduler
print_status "Setting up cron job for Laravel scheduler..."
(crontab -l 2>/dev/null; echo "* * * * * cd $(pwd) && php artisan schedule:run >> /dev/null 2>&1") | crontab -
print_success "Cron job for scheduler created"

# Create systemd service for queue worker (if systemd is available)
if command -v systemctl &> /dev/null; then
    print_status "Creating systemd service for queue worker..."
    
    SERVICE_FILE="/etc/systemd/system/salonmanager-queue.service"
    sudo tee $SERVICE_FILE > /dev/null <<EOF
[Unit]
Description=SalonManager Queue Worker
After=network.target

[Service]
Type=simple
User=$USER
Group=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/php artisan queue:work --sleep=3 --tries=3
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable salonmanager-queue
    sudo systemctl start salonmanager-queue
    print_success "Queue worker service created and started"
fi

# Final configuration
print_status "Performing final configuration..."

# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Optimize for production
if [ "$APP_ENV" = "production" ]; then
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    print_success "Application optimized for production"
fi

print_success "Final configuration completed"

echo ""
echo "🎉 SalonManager Installation Completed!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Configure your web server (Apache/Nginx)"
echo "2. Set up your database credentials in .env"
echo "3. Configure your mail settings in .env"
echo "4. Set up your payment providers (Stripe/PayPal)"
echo "5. Configure your Pusher credentials for real-time features"
echo ""
echo "Default admin credentials:"
echo "Email: admin@salonmanager.com"
echo "Password: password"
echo ""
echo "To start the development server:"
echo "php artisan serve"
echo ""
echo "To start the queue worker:"
echo "php artisan queue:work"
echo ""
echo "Documentation: https://github.com/your-username/salonmanager"
echo ""

print_success "Installation completed successfully! 🚀" 