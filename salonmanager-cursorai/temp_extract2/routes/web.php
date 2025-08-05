<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SalonController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\GiftCardController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\DsgvoController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AiController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\InventoryController;

// Public routes
Route::get('/', function () {
    return view('welcome');
})->name('welcome');

Route::get('/salon/select', [SalonController::class, 'select'])->name('salon.select');
Route::post('/salon/select', [SalonController::class, 'setSalon'])->name('salon.set');

// Authentication routes
Auth::routes();

// Protected routes
Route::middleware(['auth'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [AnalyticsController::class, 'dashboard'])->name('dashboard');
    
    // Salon management
    Route::resource('salon', SalonController::class);
    Route::get('salon/{salon}/settings', [SalonController::class, 'settings'])->name('salon.settings');
    Route::post('salon/{salon}/settings', [SalonController::class, 'updateSettings'])->name('salon.update-settings');
    
    // Appointments
    Route::resource('appointments', AppointmentController::class);
    Route::post('appointments/{appointment}/confirm', [AppointmentController::class, 'confirm'])->name('appointments.confirm');
    Route::post('appointments/{appointment}/complete', [AppointmentController::class, 'complete'])->name('appointments.complete');
    Route::get('appointments/available-slots', [AppointmentController::class, 'getAvailableSlots'])->name('appointments.available-slots');
    
    // Services
    Route::resource('services', ServiceController::class);
    
    // Team management
    Route::resource('team', TeamController::class);
    Route::post('team/invite', [TeamController::class, 'invite'])->name('team.invite');
    Route::post('team/{user}/update-role', [TeamController::class, 'updateRole'])->name('team.update-role');
    
    // Customers
    Route::resource('customers', CustomerController::class);
    
    // Shop
    Route::resource('shop', ShopController::class);
    Route::resource('orders', OrderController::class);
    Route::post('orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    Route::post('orders/{order}/reactivate', [OrderController::class, 'reactivate'])->name('orders.reactivate');
    
    // Gift cards
    Route::resource('gift-cards', GiftCardController::class);
    Route::post('gift-cards/{giftCard}/redeem', [GiftCardController::class, 'redeem'])->name('gift-cards.redeem');
    
    // Analytics
    Route::get('analytics', [AnalyticsController::class, 'dashboard'])->name('analytics.dashboard');
    Route::get('analytics/reports', [AnalyticsController::class, 'reports'])->name('analytics.reports');
    Route::get('analytics/export', [AnalyticsController::class, 'export'])->name('analytics.export');
    
    // Backups
    Route::resource('backups', BackupController::class);
    Route::get('backups/{backup}/download', [BackupController::class, 'download'])->name('backups.download');
    Route::delete('backups/{backup}', [BackupController::class, 'destroy'])->name('backups.destroy');
    
    // DSGVO
    Route::resource('dsgvo', DsgvoController::class);
    Route::get('dsgvo/{dsgvo}/pdf', [DsgvoController::class, 'pdf'])->name('dsgvo.pdf');
    
    // Payments
    Route::prefix('payments')->group(function () {
        Route::post('create-intent', [PaymentController::class, 'createPaymentIntent'])->name('payments.create-intent');
        Route::post('confirm', [PaymentController::class, 'confirmPayment'])->name('payments.confirm');
        Route::post('paypal/create-order', [PaymentController::class, 'createPayPalOrder'])->name('payments.paypal.create-order');
        Route::post('sepa/create-mandate', [PaymentController::class, 'createSEPAMandate'])->name('payments.sepa.create-mandate');
        Route::post('webhook', [PaymentController::class, 'webhook'])->name('payments.webhook');
        Route::get('methods', [PaymentController::class, 'getPaymentMethods'])->name('payments.methods');
    });
    
    // Chat
    Route::resource('chat', ChatController::class);
    Route::post('chat/send-message', [ChatController::class, 'sendMessage'])->name('chat.send-message');
    Route::post('chat/mark-read', [ChatController::class, 'markAsRead'])->name('chat.mark-read');
    Route::get('chat/unread-count', [ChatController::class, 'getUnreadCount'])->name('chat.unread-count');
    Route::post('chat/start-conversation', [ChatController::class, 'startConversation'])->name('chat.start-conversation');
    Route::post('chat/upload-file', [ChatController::class, 'uploadFile'])->name('chat.upload-file');
    Route::get('chat/online-users', [ChatController::class, 'getOnlineUsers'])->name('chat.online-users');
    Route::post('chat/update-activity', [ChatController::class, 'updateActivity'])->name('chat.update-activity');
    
    // Notifications
    Route::resource('notifications', NotificationController::class);
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::get('notifications/unread-count', [NotificationController::class, 'getUnreadCount'])->name('notifications.unread-count');
    Route::post('notifications/appointment-reminder/{appointment}', [NotificationController::class, 'sendAppointmentReminder'])->name('notifications.appointment-reminder');
    Route::post('notifications/appointment-confirmation/{appointment}', [NotificationController::class, 'sendAppointmentConfirmation'])->name('notifications.appointment-confirmation');
    Route::post('notifications/appointment-cancellation/{appointment}', [NotificationController::class, 'sendAppointmentCancellation'])->name('notifications.appointment-cancellation');
    Route::post('notifications/bulk', [NotificationController::class, 'sendBulkNotification'])->name('notifications.bulk');
    Route::post('notifications/promotional', [NotificationController::class, 'sendPromotionalNotification'])->name('notifications.promotional');
    Route::get('notifications/settings', [NotificationController::class, 'getNotificationSettings'])->name('notifications.settings');
    Route::post('notifications/settings', [NotificationController::class, 'updateNotificationSettings'])->name('notifications.update-settings');
    Route::delete('notifications/{notification}', [NotificationController::class, 'deleteNotification'])->name('notifications.delete');
    Route::delete('notifications', [NotificationController::class, 'clearAllNotifications'])->name('notifications.clear-all');
    
    // AI features
    Route::prefix('ai')->group(function () {
        Route::post('hairstyle-suggestions', [AiController::class, 'getHairstyleSuggestions'])->name('ai.hairstyle-suggestions');
        Route::post('analyze-reviews', [AiController::class, 'analyzeReviews'])->name('ai.analyze-reviews');
        Route::post('appointment-suggestions', [AiController::class, 'getAppointmentSuggestions'])->name('ai.appointment-suggestions');
        Route::post('chat', [AiController::class, 'chatWithAi'])->name('ai.chat');
    });
    
    // Chatbot
    Route::resource('chatbot', ChatbotController::class);
    
    // Exports
    Route::prefix('exports')->group(function () {
        Route::get('appointments', [ExportController::class, 'appointments'])->name('exports.appointments');
        Route::get('customers', [ExportController::class, 'customers'])->name('exports.customers');
        Route::get('revenue', [ExportController::class, 'revenue'])->name('exports.revenue');
        Route::get('services', [ExportController::class, 'services'])->name('exports.services');
    });
    
    // Invoices
    Route::resource('invoices', InvoiceController::class);
    Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'pdf'])->name('invoices.pdf');
    
    // Subscriptions
    Route::resource('subscriptions', SubscriptionController::class);
    Route::post('subscriptions/{subscription}/cancel', [SubscriptionController::class, 'cancel'])->name('subscriptions.cancel');
    Route::post('subscriptions/{subscription}/reactivate', [SubscriptionController::class, 'reactivate'])->name('subscriptions.reactivate');
    
    // Inventory
    Route::resource('inventory', InventoryController::class);
    Route::post('inventory/scan-qr', [InventoryController::class, 'scanQR'])->name('inventory.scan-qr');
    Route::post('inventory/{inventoryItem}/generate-qr', [InventoryController::class, 'generateQR'])->name('inventory.generate-qr');
    Route::get('inventory/export', [InventoryController::class, 'export'])->name('inventory.export');
    Route::get('inventory/low-stock', [InventoryController::class, 'lowStock'])->name('inventory.low-stock');
    Route::get('inventory/expiry-alerts', [InventoryController::class, 'expiryAlerts'])->name('inventory.expiry-alerts');
    Route::get('inventory/{inventoryItem}/transactions', [InventoryController::class, 'transactions'])->name('inventory.transactions');
    Route::post('inventory/bulk-update', [InventoryController::class, 'bulkUpdate'])->name('inventory.bulk-update');
    
    // User profile
    Route::get('profile', [UserController::class, 'profile'])->name('profile');
    Route::post('profile', [UserController::class, 'updateProfile'])->name('profile.update');
    Route::get('profile/security', [UserController::class, 'security'])->name('profile.security');
    Route::post('profile/security', [UserController::class, 'updateSecurity'])->name('profile.security.update');
});

// API routes
Route::prefix('api')->middleware(['auth:sanctum'])->group(function () {
    Route::get('appointments', [AppointmentController::class, 'apiIndex']);
    Route::post('appointments', [AppointmentController::class, 'apiStore']);
    Route::get('appointments/{appointment}', [AppointmentController::class, 'apiShow']);
    Route::put('appointments/{appointment}', [AppointmentController::class, 'apiUpdate']);
    Route::delete('appointments/{appointment}', [AppointmentController::class, 'apiDestroy']);
    
    Route::get('services', [ServiceController::class, 'apiIndex']);
    Route::get('customers', [CustomerController::class, 'apiIndex']);
    Route::get('analytics', [AnalyticsController::class, 'apiDashboard']);
});

// PWA routes
Route::get('/manifest.json', function () {
    return response()->json([
        'name' => 'SalonManager',
        'short_name' => 'SalonManager',
        'description' => 'Professionelles Salon-Management-System',
        'start_url' => '/',
        'display' => 'standalone',
        'background_color' => '#ffffff',
        'theme_color' => '#3b82f6',
        'orientation' => 'portrait-primary',
        'scope' => '/',
        'lang' => 'de',
        'categories' => ['business', 'productivity'],
        'icons' => [
            [
                'src' => '/images/icons/icon-72x72.png',
                'sizes' => '72x72',
                'type' => 'image/png',
                'purpose' => 'maskable any'
            ],
            [
                'src' => '/images/icons/icon-96x96.png',
                'sizes' => '96x96',
                'type' => 'image/png',
                'purpose' => 'maskable any'
            ],
            [
                'src' => '/images/icons/icon-128x128.png',
                'sizes' => '128x128',
                'type' => 'image/png',
                'purpose' => 'maskable any'
            ],
            [
                'src' => '/images/icons/icon-144x144.png',
                'sizes' => '144x144',
                'type' => 'image/png',
                'purpose' => 'maskable any'
            ],
            [
                'src' => '/images/icons/icon-152x152.png',
                'sizes' => '152x152',
                'type' => 'image/png',
                'purpose' => 'maskable any'
            ],
            [
                'src' => '/images/icons/icon-192x192.png',
                'sizes' => '192x192',
                'type' => 'image/png',
                'purpose' => 'maskable any'
            ],
            [
                'src' => '/images/icons/icon-384x384.png',
                'sizes' => '384x384',
                'type' => 'image/png',
                'purpose' => 'maskable any'
            ],
            [
                'src' => '/images/icons/icon-512x512.png',
                'sizes' => '512x512',
                'type' => 'image/png',
                'purpose' => 'maskable any'
            ]
        ],
        'shortcuts' => [
            [
                'name' => 'Neuer Termin',
                'short_name' => 'Termin',
                'description' => 'Einen neuen Termin erstellen',
                'url' => '/appointments/create',
                'icons' => [
                    [
                        'src' => '/images/icons/calendar-96x96.png',
                        'sizes' => '96x96'
                    ]
                ]
            ],
            [
                'name' => 'Dashboard',
                'short_name' => 'Dashboard',
                'description' => 'Salon-Dashboard öffnen',
                'url' => '/dashboard',
                'icons' => [
                    [
                        'src' => '/images/icons/dashboard-96x96.png',
                        'sizes' => '96x96'
                    ]
                ]
            ],
            [
                'name' => 'Kunden',
                'short_name' => 'Kunden',
                'description' => 'Kundenliste anzeigen',
                'url' => '/customers',
                'icons' => [
                    [
                        'src' => '/images/icons/users-96x96.png',
                        'sizes' => '96x96'
                    ]
                ]
            ]
        ],
        'screenshots' => [
            [
                'src' => '/images/screenshots/desktop-1.png',
                'sizes' => '1280x720',
                'type' => 'image/png',
                'form_factor' => 'wide'
            ],
            [
                'src' => '/images/screenshots/mobile-1.png',
                'sizes' => '390x844',
                'type' => 'image/png',
                'form_factor' => 'narrow'
            ]
        ],
        'related_applications' => [],
        'prefer_related_applications' => false
    ]);
})->name('manifest.json');

Route::get('/service-worker.js', function () {
    return response('', 200, ['Content-Type' => 'application/javascript']);
})->name('service-worker.js');

// Fallback route for SPA
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
