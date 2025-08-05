<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Gate;
use App\Models\User;
use App\Models\Salon;
use App\Models\Appointment;
use App\Models\Service;
use App\Services\AppointmentService;
use App\Services\PaymentService;
use App\Services\NotificationService;
use App\Services\AnalyticsService;
use App\Services\BackupService;
use App\Services\ChatService;
use App\Services\AiService;
use App\Services\ExportService;
use App\Services\InvoiceService;
use App\Services\LoyaltyService;
use App\Services\CalendarService;
use App\Services\PwaService;
use App\Services\SecurityService;
use App\Services\MonitoringService;
use App\Services\ReportingService;
use App\Services\TrackingService;
use App\Services\ProfilingService;
use App\Services\DebuggingService;
use App\Services\TestingService;
use App\Services\DevelopmentService;
use App\Services\StagingService;
use App\Services\ProductionService;
use App\Observers\UserObserver;
use App\Observers\SalonObserver;
use App\Observers\AppointmentObserver;
use App\Observers\ServiceObserver;
use App\Events\AppointmentCreated;
use App\Events\AppointmentUpdated;
use App\Events\AppointmentCancelled;
use App\Events\PaymentReceived;
use App\Events\UserRegistered;
use App\Events\SalonCreated;
use App\Events\ServiceCreated;
use App\Listeners\SendAppointmentConfirmation;
use App\Listeners\SendAppointmentReminder;
use App\Listeners\SendPaymentConfirmation;
use App\Listeners\SendWelcomeEmail;
use App\Listeners\SendSalonWelcome;
use App\Listeners\SendServiceNotification;
use App\Listeners\UpdateAnalytics;
use App\Listeners\UpdateBackup;
use App\Listeners\UpdateMonitoring;
use App\Listeners\UpdateReporting;
use App\Listeners\UpdateTracking;
use App\Listeners\UpdateProfiling;
use App\Listeners\UpdateDebugging;
use App\Listeners\UpdateTesting;
use App\Listeners\UpdateDevelopment;
use App\Listeners\UpdateStaging;
use App\Listeners\UpdateProduction;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind services
        $this->app->singleton(AppointmentService::class);
        $this->app->singleton(PaymentService::class);
        $this->app->singleton(NotificationService::class);
        $this->app->singleton(AnalyticsService::class);
        $this->app->singleton(BackupService::class);
        $this->app->singleton(ChatService::class);
        $this->app->singleton(AiService::class);
        $this->app->singleton(ExportService::class);
        $this->app->singleton(InvoiceService::class);
        $this->app->singleton(LoyaltyService::class);
        $this->app->singleton(CalendarService::class);
        $this->app->singleton(PwaService::class);
        $this->app->singleton(SecurityService::class);
        $this->app->singleton(MonitoringService::class);
        $this->app->singleton(ReportingService::class);
        $this->app->singleton(TrackingService::class);
        $this->app->singleton(ProfilingService::class);
        $this->app->singleton(DebuggingService::class);
        $this->app->singleton(TestingService::class);
        $this->app->singleton(DevelopmentService::class);
        $this->app->singleton(StagingService::class);
        $this->app->singleton(ProductionService::class);

        // Register event listeners
        $this->app['events']->listen(AppointmentCreated::class, SendAppointmentConfirmation::class);
        $this->app['events']->listen(AppointmentUpdated::class, SendAppointmentReminder::class);
        $this->app['events']->listen(AppointmentCancelled::class, SendAppointmentReminder::class);
        $this->app['events']->listen(PaymentReceived::class, SendPaymentConfirmation::class);
        $this->app['events']->listen(UserRegistered::class, SendWelcomeEmail::class);
        $this->app['events']->listen(SalonCreated::class, SendSalonWelcome::class);
        $this->app['events']->listen(ServiceCreated::class, SendServiceNotification::class);

        // Register analytics listeners
        $this->app['events']->listen('*', UpdateAnalytics::class);
        $this->app['events']->listen('*', UpdateBackup::class);
        $this->app['events']->listen('*', UpdateMonitoring::class);
        $this->app['events']->listen('*', UpdateReporting::class);
        $this->app['events']->listen('*', UpdateTracking::class);
        $this->app['events']->listen('*', UpdateProfiling::class);
        $this->app['events']->listen('*', UpdateDebugging::class);
        $this->app['events']->listen('*', UpdateTesting::class);
        $this->app['events']->listen('*', UpdateDevelopment::class);
        $this->app['events']->listen('*', UpdateStaging::class);
        $this->app['events']->listen('*', UpdateProduction::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Set default string length for MySQL
        Schema::defaultStringLength(191);

        // Register observers
        User::observe(UserObserver::class);
        Salon::observe(SalonObserver::class);
        Appointment::observe(AppointmentObserver::class);
        Service::observe(ServiceObserver::class);

        // Register Blade components
        Blade::component('appointment-card', \App\View\Components\AppointmentCard::class);
        Blade::component('service-card', \App\View\Components\ServiceCard::class);
        Blade::component('user-card', \App\View\Components\UserCard::class);
        Blade::component('salon-card', \App\View\Components\SalonCard::class);
        Blade::component('notification-item', \App\View\Components\NotificationItem::class);
        Blade::component('chat-message', \App\View\Components\ChatMessage::class);
        Blade::component('payment-form', \App\View\Components\PaymentForm::class);
        Blade::component('analytics-chart', \App\View\Components\AnalyticsChart::class);
        Blade::component('backup-status', \App\View\Components\BackupStatus::class);
        Blade::component('ai-suggestion', \App\View\Components\AiSuggestion::class);
        Blade::component('export-form', \App\View\Components\ExportForm::class);
        Blade::component('invoice-preview', \App\View\Components\InvoicePreview::class);
        Blade::component('loyalty-points', \App\View\Components\LoyaltyPoints::class);
        Blade::component('calendar-widget', \App\View\Components\CalendarWidget::class);
        Blade::component('pwa-install', \App\View\Components\PwaInstall::class);
        Blade::component('security-status', \App\View\Components\SecurityStatus::class);
        Blade::component('monitoring-dashboard', \App\View\Components\MonitoringDashboard::class);
        Blade::component('reporting-widget', \App\View\Components\ReportingWidget::class);
        Blade::component('tracking-pixel', \App\View\Components\TrackingPixel::class);
        Blade::component('profiling-toolbar', \App\View\Components\ProfilingToolbar::class);
        Blade::component('debugging-panel', \App\View\Components\DebuggingPanel::class);
        Blade::component('testing-suite', \App\View\Components\TestingSuite::class);
        Blade::component('development-tools', \App\View\Components\DevelopmentTools::class);
        Blade::component('staging-environment', \App\View\Components\StagingEnvironment::class);
        Blade::component('production-monitor', \App\View\Components\ProductionMonitor::class);

        // Register Blade directives
        Blade::directive('role', function ($expression) {
            return "<?php if(auth()->check() && auth()->user()->hasRole({$expression})): ?>";
        });

        Blade::directive('endrole', function () {
            return "<?php endif; ?>";
        });

        Blade::directive('permission', function ($expression) {
            return "<?php if(auth()->check() && auth()->user()->hasPermissionTo({$expression})): ?>";
        });

        Blade::directive('endpermission', function () {
            return "<?php endif; ?>";
        });

        Blade::directive('salon', function ($expression) {
            return "<?php if(auth()->check() && auth()->user()->salon_id == {$expression}): ?>";
        });

        Blade::directive('endsalon', function () {
            return "<?php endif; ?>";
        });

        Blade::directive('admin', function () {
            return "<?php if(auth()->check() && auth()->user()->isAdmin()): ?>";
        });

        Blade::directive('endadmin', function () {
            return "<?php endif; ?>";
        });

        Blade::directive('stylist', function () {
            return "<?php if(auth()->check() && auth()->user()->isStylist()): ?>";
        });

        Blade::directive('endstylist', function () {
            return "<?php endif; ?>";
        });

        Blade::directive('customer', function () {
            return "<?php if(auth()->check() && auth()->user()->isCustomer()): ?>";
        });

        Blade::directive('endcustomer', function () {
            return "<?php endif; ?>";
        });

        // Register view composers
        View::composer('*', function ($view) {
            $view->with('currentUser', auth()->user());
            $view->with('currentSalon', auth()->user() ? auth()->user()->salon : null);
            $view->with('appName', config('app.name'));
            $view->with('appVersion', config('app.version', '1.0.0'));
            $view->with('appEnvironment', config('app.env'));
            $view->with('appDebug', config('app.debug'));
            $view->with('appUrl', config('app.url'));
            $view->with('appLocale', config('app.locale'));
            $view->with('appTimezone', config('app.timezone'));
            $view->with('appCurrency', config('app.currency', 'EUR'));
            $view->with('appDateFormat', config('app.date_format', 'd.m.Y'));
            $view->with('appTimeFormat', config('app.time_format', 'H:i'));
            $view->with('appDateTimeFormat', config('app.datetime_format', 'd.m.Y H:i'));
            $view->with('appDecimalSeparator', config('app.decimal_separator', ','));
            $view->with('appThousandsSeparator', config('app.thousands_separator', '.'));
            $view->with('appDecimalPlaces', config('app.decimal_places', 2));
            $view->with('appMaxFileSize', config('app.max_file_size', 10240));
            $view->with('appAllowedFileTypes', config('app.allowed_file_types', ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']));
            $view->with('appMaxUploads', config('app.max_uploads', 10));
            $view->with('appSessionLifetime', config('session.lifetime', 120));
            $view->with('appRememberLifetime', config('auth.remember_lifetime', 43200));
            $view->with('appPasswordTimeout', config('auth.password_timeout', 10800));
            $view->with('appLockoutThreshold', config('auth.lockout_threshold', 5));
            $view->with('appLockoutTime', config('auth.lockout_time', 300));
            $view->with('appThrottleRequests', config('auth.throttle_requests', 60));
            $view->with('appThrottleDecay', config('auth.throttle_decay', 60));
            $view->with('appMaintenanceMode', app()->isDownForMaintenance());
            $view->with('appMaintenanceSecret', config('app.maintenance_secret'));
            $view->with('appMaintenanceRedirect', config('app.maintenance_redirect'));
            $view->with('appMaintenanceStatus', config('app.maintenance_status'));
            $view->with('appMaintenanceMessage', config('app.maintenance_message'));
            $view->with('appMaintenanceRetry', config('app.maintenance_retry'));
            $view->with('appMaintenanceRefresh', config('app.maintenance_refresh'));
            $view->with('appMaintenanceTemplate', config('app.maintenance_template'));
            $view->with('appMaintenanceData', config('app.maintenance_data'));
            $view->with('appMaintenanceCallback', config('app.maintenance_callback'));
            $view->with('appMaintenanceMiddleware', config('app.maintenance_middleware'));
            $view->with('appMaintenanceResponse', config('app.maintenance_response'));
            $view->with('appMaintenanceHeaders', config('app.maintenance_headers'));
            $view->with('appMaintenanceCookies', config('app.maintenance_cookies'));
            $view->with('appMaintenanceSession', config('app.maintenance_session'));
            $view->with('appMaintenanceCache', config('app.maintenance_cache'));
            $view->with('appMaintenanceQueue', config('app.maintenance_queue'));
            $view->with('appMaintenanceSchedule', config('app.maintenance_schedule'));
            $view->with('appMaintenanceNotification', config('app.maintenance_notification'));
            $view->with('appMaintenanceLog', config('app.maintenance_log'));
            $view->with('appMaintenanceBackup', config('app.maintenance_backup'));
            $view->with('appMaintenanceRestore', config('app.maintenance_restore'));
            $view->with('appMaintenanceRollback', config('app.maintenance_rollback'));
            $view->with('appMaintenanceUpdate', config('app.maintenance_update'));
            $view->with('appMaintenanceDeploy', config('app.maintenance_deploy'));
            $view->with('appMaintenanceHealth', config('app.maintenance_health'));
            $view->with('appMaintenanceMetrics', config('app.maintenance_metrics'));
            $view->with('appMaintenanceAlerts', config('app.maintenance_alerts'));
            $view->with('appMaintenanceReports', config('app.maintenance_reports'));
            $view->with('appMaintenanceAnalytics', config('app.maintenance_analytics'));
            $view->with('appMaintenanceTracking', config('app.maintenance_tracking'));
            $view->with('appMaintenanceProfiling', config('app.maintenance_profiling'));
            $view->with('appMaintenanceDebugging', config('app.maintenance_debugging'));
            $view->with('appMaintenanceTesting', config('app.maintenance_testing'));
            $view->with('appMaintenanceDevelopment', config('app.maintenance_development'));
            $view->with('appMaintenanceStaging', config('app.maintenance_staging'));
            $view->with('appMaintenanceProduction', config('app.maintenance_production'));
        });

        // Register gates
        Gate::define('manage-appointments', function (User $user) {
            return $user->isAdmin() || $user->isStylist();
        });

        Gate::define('manage-services', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-users', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-salon', function (User $user, Salon $salon) {
            return $user->isAdmin() || $user->salon_id === $salon->id;
        });

        Gate::define('view-analytics', function (User $user) {
            return $user->isAdmin() || $user->isStylist();
        });

        Gate::define('manage-payments', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-backups', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-ai', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-exports', function (User $user) {
            return $user->isAdmin() || $user->isStylist();
        });

        Gate::define('manage-invoices', function (User $user) {
            return $user->isAdmin() || $user->isStylist();
        });

        Gate::define('manage-loyalty', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-calendar', function (User $user) {
            return $user->isAdmin() || $user->isStylist();
        });

        Gate::define('manage-pwa', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-security', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-monitoring', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-reporting', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-tracking', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-profiling', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-debugging', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-testing', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-development', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-staging', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-production', function (User $user) {
            return $user->isAdmin();
        });
    }
} 