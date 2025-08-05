<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Global middleware
        $middleware->web([
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        $middleware->api([
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);

        // Route middleware
        $middleware->alias([
            'auth' => \App\Http\Middleware\Authenticate::class,
            'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
            'auth.session' => \Illuminate\Session\Middleware\AuthenticateSession::class,
            'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
            'can' => \Illuminate\Auth\Middleware\Authorize::class,
            'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
            'password.confirm' => \Illuminate\Auth\Middleware\RequirePassword::class,
            'precognitive' => \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
            'signed' => \App\Http\Middleware\ValidateSignature::class,
            'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
            'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'salon.access' => \App\Http\Middleware\CheckSalonAccess::class,
            '2fa' => \App\Http\Middleware\RequireTwoFactor::class,
            'maintenance' => \App\Http\Middleware\MaintenanceMode::class,
            'localization' => \App\Http\Middleware\SetLocale::class,
            'api.version' => \App\Http\Middleware\ApiVersion::class,
            'cors' => \App\Http\Middleware\Cors::class,
            'rate.limit' => \App\Http\Middleware\RateLimit::class,
            'secure.headers' => \App\Http\Middleware\SecureHeaders::class,
            'cache.response' => \App\Http\Middleware\CacheResponse::class,
            'log.requests' => \App\Http\Middleware\LogRequests::class,
            'check.subscription' => \App\Http\Middleware\CheckSubscription::class,
            'check.payment' => \App\Http\Middleware\CheckPaymentStatus::class,
            'check.quota' => \App\Http\Middleware\CheckQuota::class,
            'check.maintenance' => \App\Http\Middleware\CheckMaintenance::class,
            'check.feature' => \App\Http\Middleware\CheckFeature::class,
            'check.geolocation' => \App\Http\Middleware\CheckGeolocation::class,
            'check.timezone' => \App\Http\Middleware\CheckTimezone::class,
            'check.browser' => \App\Http\Middleware\CheckBrowser::class,
            'check.device' => \App\Http\Middleware\CheckDevice::class,
            'check.resolution' => \App\Http\Middleware\CheckResolution::class,
            'check.connection' => \App\Http\Middleware\CheckConnection::class,
            'check.bandwidth' => \App\Http\Middleware\CheckBandwidth::class,
            'check.storage' => \App\Http\Middleware\CheckStorage::class,
            'check.memory' => \App\Http\Middleware\CheckMemory::class,
            'check.cpu' => \App\Http\Middleware\CheckCpu::class,
            'check.disk' => \App\Http\Middleware\CheckDisk::class,
            'check.network' => \App\Http\Middleware\CheckNetwork::class,
            'check.security' => \App\Http\Middleware\CheckSecurity::class,
            'check.compliance' => \App\Http\Middleware\CheckCompliance::class,
            'check.audit' => \App\Http\Middleware\CheckAudit::class,
            'check.backup' => \App\Http\Middleware\CheckBackup::class,
            'check.monitoring' => \App\Http\Middleware\CheckMonitoring::class,
            'check.alerting' => \App\Http\Middleware\CheckAlerting::class,
            'check.reporting' => \App\Http\Middleware\CheckReporting::class,
            'check.analytics' => \App\Http\Middleware\CheckAnalytics::class,
            'check.tracking' => \App\Http\Middleware\CheckTracking::class,
            'check.profiling' => \App\Http\Middleware\CheckProfiling::class,
            'check.debugging' => \App\Http\Middleware\CheckDebugging::class,
            'check.testing' => \App\Http\Middleware\CheckTesting::class,
            'check.development' => \App\Http\Middleware\CheckDevelopment::class,
            'check.staging' => \App\Http\Middleware\CheckStaging::class,
            'check.production' => \App\Http\Middleware\CheckProduction::class,
        ]);

        // Middleware groups
        $middleware->group('admin', [
            'auth',
            'role:admin',
            '2fa',
            'secure.headers',
            'log.requests',
        ]);

        $middleware->group('stylist', [
            'auth',
            'role:stylist',
            'salon.access',
            'check.subscription',
            'log.requests',
        ]);

        $middleware->group('customer', [
            'auth',
            'role:customer',
            'salon.access',
            'log.requests',
        ]);

        $middleware->group('api.v1', [
            'api',
            'api.version:v1',
            'cors',
            'rate.limit',
            'log.requests',
        ]);

        $middleware->group('api.v2', [
            'api',
            'api.version:v2',
            'cors',
            'rate.limit',
            'log.requests',
        ]);

        $middleware->group('web.secure', [
            'web',
            'secure.headers',
            'cache.response',
            'log.requests',
        ]);

        $middleware->group('web.public', [
            'web',
            'cache.response',
            'log.requests',
        ]);

        $middleware->group('web.maintenance', [
            'web',
            'maintenance',
            'log.requests',
        ]);

        $middleware->group('web.localization', [
            'web',
            'localization',
            'log.requests',
        ]);

        $middleware->group('web.geolocation', [
            'web',
            'check.geolocation',
            'check.timezone',
            'log.requests',
        ]);

        $middleware->group('web.device', [
            'web',
            'check.browser',
            'check.device',
            'check.resolution',
            'log.requests',
        ]);

        $middleware->group('web.performance', [
            'web',
            'check.connection',
            'check.bandwidth',
            'check.storage',
            'log.requests',
        ]);

        $middleware->group('web.system', [
            'web',
            'check.memory',
            'check.cpu',
            'check.disk',
            'check.network',
            'log.requests',
        ]);

        $middleware->group('web.security', [
            'web',
            'check.security',
            'check.compliance',
            'check.audit',
            'log.requests',
        ]);

        $middleware->group('web.backup', [
            'web',
            'check.backup',
            'check.monitoring',
            'check.alerting',
            'log.requests',
        ]);

        $middleware->group('web.reporting', [
            'web',
            'check.reporting',
            'check.analytics',
            'check.tracking',
            'log.requests',
        ]);

        $middleware->group('web.profiling', [
            'web',
            'check.profiling',
            'check.debugging',
            'check.testing',
            'log.requests',
        ]);

        $middleware->group('web.environment', [
            'web',
            'check.development',
            'check.staging',
            'check.production',
            'log.requests',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Exception handling
        $exceptions->report(function (\Throwable $e) {
            // Log all exceptions
            \Log::error('Exception: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
        });

        $exceptions->render(function (\Throwable $e, $request) {
            // Custom exception rendering
            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                return response()->json(['error' => 'Resource not found'], 404);
            }

            if ($e instanceof \Illuminate\Validation\ValidationException) {
                return response()->json(['error' => 'Validation failed', 'details' => $e->errors()], 422);
            }

            if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            if ($e instanceof \Illuminate\Auth\Access\AuthorizationException) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            if ($e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
                return response()->json(['error' => 'Route not found'], 404);
            }

            if ($e instanceof \Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException) {
                return response()->json(['error' => 'Method not allowed'], 405);
            }

            if ($e instanceof \Illuminate\Http\Exceptions\ThrottleRequestsException) {
                return response()->json(['error' => 'Too many requests'], 429);
            }

            // Handle maintenance mode
            if (app()->isDownForMaintenance()) {
                return response()->view('errors.maintenance', [], 503);
            }

            // Handle 500 errors
            if ($e instanceof \Error || $e instanceof \Exception) {
                if (config('app.debug')) {
                    return response()->json(['error' => $e->getMessage()], 500);
                } else {
                    return response()->json(['error' => 'Internal server error'], 500);
                }
            }
        });
    })->create(); 