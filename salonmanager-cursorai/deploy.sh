#!/bin/bash

# SalonManager Deployment Script
# This script automates the deployment process for the SalonManager application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="salonmanager"
APP_ENV="${APP_ENV:-production}"
APP_DEBUG="${APP_DEBUG:-false}"
APP_URL="${APP_URL:-https://salonmanager.app}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_DATABASE="${DB_DATABASE:-salonmanager}"
DB_USERNAME="${DB_USERNAME:-salonmanager}"
DB_PASSWORD="${DB_PASSWORD:-}"
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_PASSWORD="${REDIS_PASSWORD:-}"
QUEUE_CONNECTION="${QUEUE_CONNECTION:-redis}"
CACHE_DRIVER="${CACHE_DRIVER:-redis}"
SESSION_DRIVER="${SESSION_DRIVER:-redis}"
MAIL_MAILER="${MAIL_MAILER:-smtp}"
MAIL_HOST="${MAIL_HOST:-smtp.mailtrap.io}"
MAIL_PORT="${MAIL_PORT:-2525}"
MAIL_USERNAME="${MAIL_USERNAME:-}"
MAIL_PASSWORD="${MAIL_PASSWORD:-}"
MAIL_ENCRYPTION="${MAIL_ENCRYPTION:-tls}"
MAIL_FROM_ADDRESS="${MAIL_FROM_ADDRESS:-noreply@salonmanager.app}"
MAIL_FROM_NAME="${MAIL_FROM_NAME:-SalonManager}"
PUSHER_APP_ID="${PUSHER_APP_ID:-}"
PUSHER_APP_KEY="${PUSHER_APP_KEY:-}"
PUSHER_APP_SECRET="${PUSHER_APP_SECRET:-}"
PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER:-mt1}"
STRIPE_KEY="${STRIPE_KEY:-}"
STRIPE_SECRET="${STRIPE_SECRET:-}"
STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET:-}"
PAYPAL_CLIENT_ID="${PAYPAL_CLIENT_ID:-}"
PAYPAL_CLIENT_SECRET="${PAYPAL_CLIENT_SECRET:-}"
PAYPAL_MODE="${PAYPAL_MODE:-sandbox}"
OPENAI_API_KEY="${OPENAI_API_KEY:-}"
GOOGLE_MAPS_API_KEY="${GOOGLE_MAPS_API_KEY:-}"
TWILIO_ACCOUNT_SID="${TWILIO_ACCOUNT_SID:-}"
TWILIO_AUTH_TOKEN="${TWILIO_AUTH_TOKEN:-}"
TWILIO_PHONE_NUMBER="${TWILIO_PHONE_NUMBER:-}"
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-}"
AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"
AWS_BUCKET="${AWS_BUCKET:-}"
AWS_URL="${AWS_URL:-}"
AWS_ENDPOINT="${AWS_ENDPOINT:-}"
CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-}"
CLOUDFLARE_ZONE_ID="${CLOUDFLARE_ZONE_ID:-}"
FIREBASE_PROJECT_ID="${FIREBASE_PROJECT_ID:-}"
FIREBASE_PRIVATE_KEY_ID="${FIREBASE_PRIVATE_KEY_ID:-}"
FIREBASE_PRIVATE_KEY="${FIREBASE_PRIVATE_KEY:-}"
FIREBASE_CLIENT_EMAIL="${FIREBASE_CLIENT_EMAIL:-}"
FIREBASE_CLIENT_ID="${FIREBASE_CLIENT_ID:-}"
FIREBASE_AUTH_URI="${FIREBASE_AUTH_URI:-https://accounts.google.com/o/oauth2/auth}"
FIREBASE_TOKEN_URI="${FIREBASE_TOKEN_URI:-https://oauth2.googleapis.com/token}"
FIREBASE_AUTH_PROVIDER_X509_CERT_URL="${FIREBASE_AUTH_PROVIDER_X509_CERT_URL:-https://www.googleapis.com/oauth2/v1/certs}"
FIREBASE_CLIENT_X509_CERT_URL="${FIREBASE_CLIENT_X509_CERT_URL:-}"
ONESIGNAL_APP_ID="${ONESIGNAL_APP_ID:-}"
ONESIGNAL_REST_API_KEY="${ONESIGNAL_REST_API_KEY:-}"
ONESIGNAL_USER_AUTH_KEY="${ONESIGNAL_USER_AUTH_KEY:-}"
MAILCHIMP_API_KEY="${MAILCHIMP_API_KEY:-}"
MAILCHIMP_LIST_ID="${MAILCHIMP_LIST_ID:-}"
SENDGRID_API_KEY="${SENDGRID_API_KEY:-}"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
SLACK_TOKEN="${SLACK_TOKEN:-}"
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"
WHATSAPP_API_KEY="${WHATSAPP_API_KEY:-}"
WHATSAPP_PHONE_NUMBER_ID="${WHATSAPP_PHONE_NUMBER_ID:-}"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking system requirements..."
    
    # Check PHP version
    if ! command -v php &> /dev/null; then
        log_error "PHP is not installed"
        exit 1
    fi
    
    PHP_VERSION=$(php -r "echo PHP_VERSION;")
    log_info "PHP version: $PHP_VERSION"
    
    # Check Composer
    if ! command -v composer &> /dev/null; then
        log_error "Composer is not installed"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check MySQL
    if ! command -v mysql &> /dev/null; then
        log_warning "MySQL client is not installed"
    fi
    
    # Check Redis
    if ! command -v redis-cli &> /dev/null; then
        log_warning "Redis client is not installed"
    fi
    
    log_success "System requirements check completed"
}

backup_database() {
    log_info "Creating database backup..."
    
    if [ -n "$DB_PASSWORD" ]; then
        mysqldump -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" > "backup_$(date +%Y%m%d_%H%M%S).sql"
    else
        mysqldump -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USERNAME" "$DB_DATABASE" > "backup_$(date +%Y%m%d_%H%M%S).sql"
    fi
    
    log_success "Database backup created"
}

install_dependencies() {
    log_info "Installing PHP dependencies..."
    composer install --no-dev --optimize-autoloader
    
    log_info "Installing Node.js dependencies..."
    npm ci --production
    
    log_success "Dependencies installed"
}

setup_environment() {
    log_info "Setting up environment..."
    
    # Copy environment file
    if [ ! -f .env ]; then
        cp .env.example .env
    fi
    
    # Generate application key
    php artisan key:generate
    
    # Set environment variables
    sed -i "s/APP_ENV=.*/APP_ENV=$APP_ENV/" .env
    sed -i "s/APP_DEBUG=.*/APP_DEBUG=$APP_DEBUG/" .env
    sed -i "s|APP_URL=.*|APP_URL=$APP_URL|" .env
    
    # Database configuration
    sed -i "s/DB_HOST=.*/DB_HOST=$DB_HOST/" .env
    sed -i "s/DB_PORT=.*/DB_PORT=$DB_PORT/" .env
    sed -i "s/DB_DATABASE=.*/DB_DATABASE=$DB_DATABASE/" .env
    sed -i "s/DB_USERNAME=.*/DB_USERNAME=$DB_USERNAME/" .env
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
    
    # Redis configuration
    sed -i "s/REDIS_HOST=.*/REDIS_HOST=$REDIS_HOST/" .env
    sed -i "s/REDIS_PORT=.*/REDIS_PORT=$REDIS_PORT/" .env
    sed -i "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASSWORD/" .env
    
    # Queue and cache configuration
    sed -i "s/QUEUE_CONNECTION=.*/QUEUE_CONNECTION=$QUEUE_CONNECTION/" .env
    sed -i "s/CACHE_DRIVER=.*/CACHE_DRIVER=$CACHE_DRIVER/" .env
    sed -i "s/SESSION_DRIVER=.*/SESSION_DRIVER=$SESSION_DRIVER/" .env
    
    # Mail configuration
    sed -i "s/MAIL_MAILER=.*/MAIL_MAILER=$MAIL_MAILER/" .env
    sed -i "s/MAIL_HOST=.*/MAIL_HOST=$MAIL_HOST/" .env
    sed -i "s/MAIL_PORT=.*/MAIL_PORT=$MAIL_PORT/" .env
    sed -i "s/MAIL_USERNAME=.*/MAIL_USERNAME=$MAIL_USERNAME/" .env
    sed -i "s/MAIL_PASSWORD=.*/MAIL_PASSWORD=$MAIL_PASSWORD/" .env
    sed -i "s/MAIL_ENCRYPTION=.*/MAIL_ENCRYPTION=$MAIL_ENCRYPTION/" .env
    sed -i "s/MAIL_FROM_ADDRESS=.*/MAIL_FROM_ADDRESS=$MAIL_FROM_ADDRESS/" .env
    sed -i "s/MAIL_FROM_NAME=.*/MAIL_FROM_NAME=$MAIL_FROM_NAME/" .env
    
    # Pusher configuration
    sed -i "s/PUSHER_APP_ID=.*/PUSHER_APP_ID=$PUSHER_APP_ID/" .env
    sed -i "s/PUSHER_APP_KEY=.*/PUSHER_APP_KEY=$PUSHER_APP_KEY/" .env
    sed -i "s/PUSHER_APP_SECRET=.*/PUSHER_APP_SECRET=$PUSHER_APP_SECRET/" .env
    sed -i "s/PUSHER_APP_CLUSTER=.*/PUSHER_APP_CLUSTER=$PUSHER_APP_CLUSTER/" .env
    
    # Stripe configuration
    sed -i "s/STRIPE_KEY=.*/STRIPE_KEY=$STRIPE_KEY/" .env
    sed -i "s/STRIPE_SECRET=.*/STRIPE_SECRET=$STRIPE_SECRET/" .env
    sed -i "s/STRIPE_WEBHOOK_SECRET=.*/STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET/" .env
    
    # PayPal configuration
    sed -i "s/PAYPAL_CLIENT_ID=.*/PAYPAL_CLIENT_ID=$PAYPAL_CLIENT_ID/" .env
    sed -i "s/PAYPAL_CLIENT_SECRET=.*/PAYPAL_CLIENT_SECRET=$PAYPAL_CLIENT_SECRET/" .env
    sed -i "s/PAYPAL_MODE=.*/PAYPAL_MODE=$PAYPAL_MODE/" .env
    
    # OpenAI configuration
    sed -i "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$OPENAI_API_KEY/" .env
    
    # Google Maps configuration
    sed -i "s/GOOGLE_MAPS_API_KEY=.*/GOOGLE_MAPS_API_KEY=$GOOGLE_MAPS_API_KEY/" .env
    
    # Twilio configuration
    sed -i "s/TWILIO_ACCOUNT_SID=.*/TWILIO_ACCOUNT_SID=$TWILIO_ACCOUNT_SID/" .env
    sed -i "s/TWILIO_AUTH_TOKEN=.*/TWILIO_AUTH_TOKEN=$TWILIO_AUTH_TOKEN/" .env
    sed -i "s/TWILIO_PHONE_NUMBER=.*/TWILIO_PHONE_NUMBER=$TWILIO_PHONE_NUMBER/" .env
    
    # AWS configuration
    sed -i "s/AWS_ACCESS_KEY_ID=.*/AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID/" .env
    sed -i "s/AWS_SECRET_ACCESS_KEY=.*/AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY/" .env
    sed -i "s/AWS_DEFAULT_REGION=.*/AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION/" .env
    sed -i "s/AWS_BUCKET=.*/AWS_BUCKET=$AWS_BUCKET/" .env
    sed -i "s|AWS_URL=.*|AWS_URL=$AWS_URL|" .env
    sed -i "s|AWS_ENDPOINT=.*|AWS_ENDPOINT=$AWS_ENDPOINT|" .env
    
    # Cloudflare configuration
    sed -i "s/CLOUDFLARE_API_TOKEN=.*/CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN/" .env
    sed -i "s/CLOUDFLARE_ZONE_ID=.*/CLOUDFLARE_ZONE_ID=$CLOUDFLARE_ZONE_ID/" .env
    
    # Firebase configuration
    sed -i "s/FIREBASE_PROJECT_ID=.*/FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID/" .env
    sed -i "s/FIREBASE_PRIVATE_KEY_ID=.*/FIREBASE_PRIVATE_KEY_ID=$FIREBASE_PRIVATE_KEY_ID/" .env
    sed -i "s/FIREBASE_PRIVATE_KEY=.*/FIREBASE_PRIVATE_KEY=$FIREBASE_PRIVATE_KEY/" .env
    sed -i "s/FIREBASE_CLIENT_EMAIL=.*/FIREBASE_CLIENT_EMAIL=$FIREBASE_CLIENT_EMAIL/" .env
    sed -i "s/FIREBASE_CLIENT_ID=.*/FIREBASE_CLIENT_ID=$FIREBASE_CLIENT_ID/" .env
    sed -i "s|FIREBASE_AUTH_URI=.*|FIREBASE_AUTH_URI=$FIREBASE_AUTH_URI|" .env
    sed -i "s|FIREBASE_TOKEN_URI=.*|FIREBASE_TOKEN_URI=$FIREBASE_TOKEN_URI|" .env
    sed -i "s|FIREBASE_AUTH_PROVIDER_X509_CERT_URL=.*|FIREBASE_AUTH_PROVIDER_X509_CERT_URL=$FIREBASE_AUTH_PROVIDER_X509_CERT_URL|" .env
    sed -i "s|FIREBASE_CLIENT_X509_CERT_URL=.*|FIREBASE_CLIENT_X509_CERT_URL=$FIREBASE_CLIENT_X509_CERT_URL|" .env
    
    # OneSignal configuration
    sed -i "s/ONESIGNAL_APP_ID=.*/ONESIGNAL_APP_ID=$ONESIGNAL_APP_ID/" .env
    sed -i "s/ONESIGNAL_REST_API_KEY=.*/ONESIGNAL_REST_API_KEY=$ONESIGNAL_REST_API_KEY/" .env
    sed -i "s/ONESIGNAL_USER_AUTH_KEY=.*/ONESIGNAL_USER_AUTH_KEY=$ONESIGNAL_USER_AUTH_KEY/" .env
    
    # Mailchimp configuration
    sed -i "s/MAILCHIMP_API_KEY=.*/MAILCHIMP_API_KEY=$MAILCHIMP_API_KEY/" .env
    sed -i "s/MAILCHIMP_LIST_ID=.*/MAILCHIMP_LIST_ID=$MAILCHIMP_LIST_ID/" .env
    
    # SendGrid configuration
    sed -i "s/SENDGRID_API_KEY=.*/SENDGRID_API_KEY=$SENDGRID_API_KEY/" .env
    
    # Slack configuration
    sed -i "s|SLACK_WEBHOOK_URL=.*|SLACK_WEBHOOK_URL=$SLACK_WEBHOOK_URL|" .env
    sed -i "s/SLACK_TOKEN=.*/SLACK_TOKEN=$SLACK_TOKEN/" .env
    
    # Telegram configuration
    sed -i "s/TELEGRAM_BOT_TOKEN=.*/TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN/" .env
    sed -i "s/TELEGRAM_CHAT_ID=.*/TELEGRAM_CHAT_ID=$TELEGRAM_CHAT_ID/" .env
    
    # WhatsApp configuration
    sed -i "s/WHATSAPP_API_KEY=.*/WHATSAPP_API_KEY=$WHATSAPP_API_KEY/" .env
    sed -i "s/WHATSAPP_PHONE_NUMBER_ID=.*/WHATSAPP_PHONE_NUMBER_ID=$WHATSAPP_PHONE_NUMBER_ID/" .env
    
    log_success "Environment configured"
}

run_migrations() {
    log_info "Running database migrations..."
    php artisan migrate --force
    
    log_success "Database migrations completed"
}

seed_database() {
    log_info "Seeding database..."
    php artisan db:seed --force
    
    log_success "Database seeding completed"
}

build_assets() {
    log_info "Building frontend assets..."
    npm run build
    
    log_success "Frontend assets built"
}

optimize_application() {
    log_info "Optimizing application..."
    
    # Clear all caches
    php artisan cache:clear
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
    
    # Cache configuration and routes
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    
    # Optimize autoloader
    composer dump-autoload --optimize
    
    log_success "Application optimized"
}

setup_storage() {
    log_info "Setting up storage..."
    
    # Create storage link
    php artisan storage:link
    
    # Set permissions
    chmod -R 775 storage
    chmod -R 775 bootstrap/cache
    
    log_success "Storage setup completed"
}

setup_queue() {
    log_info "Setting up queue..."
    
    # Create queue table if using database driver
    if [ "$QUEUE_CONNECTION" = "database" ]; then
        php artisan queue:table
        php artisan migrate --force
    fi
    
    log_success "Queue setup completed"
}

setup_cron() {
    log_info "Setting up cron jobs..."
    
    # Add Laravel scheduler to crontab
    (crontab -l 2>/dev/null; echo "* * * * * cd $(pwd) && php artisan schedule:run >> /dev/null 2>&1") | crontab -
    
    log_success "Cron jobs setup completed"
}

setup_supervisor() {
    log_info "Setting up Supervisor..."
    
    # Create supervisor configuration
    cat > /etc/supervisor/conf.d/salonmanager.conf << EOF
[program:salonmanager-worker]
process_name=%(program_name)s_%(process_num)02d
command=php $(pwd)/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=8
redirect_stderr=true
stdout_logfile=$(pwd)/storage/logs/worker.log
stopwaitsecs=3600
EOF
    
    # Reload supervisor
    supervisorctl reread
    supervisorctl update
    supervisorctl start salonmanager-worker:*
    
    log_success "Supervisor setup completed"
}

setup_nginx() {
    log_info "Setting up Nginx..."
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/salonmanager << EOF
server {
    listen 80;
    server_name salonmanager.app www.salonmanager.app;
    root $(pwd)/public;
    
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    
    index index.php index.html index.htm;
    
    charset utf-8;
    
    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }
    
    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }
    
    error_page 404 /index.php;
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
    }
    
    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF
    
    # Enable site
    ln -sf /etc/nginx/sites-available/salonmanager /etc/nginx/sites-enabled/
    
    # Test configuration
    nginx -t
    
    # Reload Nginx
    systemctl reload nginx
    
    log_success "Nginx setup completed"
}

setup_ssl() {
    log_info "Setting up SSL certificate..."
    
    # Install Certbot
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
    
    # Obtain SSL certificate
    certbot --nginx -d salonmanager.app -d www.salonmanager.app --non-interactive --agree-tos --email admin@salonmanager.app
    
    log_success "SSL certificate setup completed"
}

setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Install monitoring tools
    apt-get update
    apt-get install -y htop iotop nethogs
    
    log_success "Monitoring setup completed"
}

setup_backup() {
    log_info "Setting up backup system..."
    
    # Create backup script
    cat > /usr/local/bin/salonmanager-backup << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/salonmanager"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" > $BACKUP_DIR/database_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/application_$DATE.tar.gz --exclude=node_modules --exclude=vendor .

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF
    
    chmod +x /usr/local/bin/salonmanager-backup
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/salonmanager-backup") | crontab -
    
    log_success "Backup system setup completed"
}

test_application() {
    log_info "Testing application..."
    
    # Test database connection
    php artisan tinker --execute="echo 'Database connection: ' . (DB::connection()->getPdo() ? 'OK' : 'FAILED') . PHP_EOL;"
    
    # Test queue
    php artisan queue:work --once
    
    # Test cache
    php artisan cache:test
    
    log_success "Application tests completed"
}

# Main deployment function
deploy() {
    log_info "Starting SalonManager deployment..."
    
    check_requirements
    backup_database
    install_dependencies
    setup_environment
    run_migrations
    seed_database
    build_assets
    optimize_application
    setup_storage
    setup_queue
    setup_cron
    setup_supervisor
    setup_nginx
    setup_ssl
    setup_monitoring
    setup_backup
    test_application
    
    log_success "SalonManager deployment completed successfully!"
}

# Run deployment
deploy 