<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AppointmentController,
    SalonController,
    ServiceController,
    UserController,
    ShopController,
    OrderController,
    GiftCardController,
    AnalyticsController,
    BackupController,
    DsgvoController,
    TeamController,
    CustomerController,
    PaymentController,
    ChatController,
    NotificationController,
    AiController,
    ChatbotController,
    ExportController,
    InvoiceController,
    SubscriptionController
};

// Public routes
Route::get('/', function () {
    return view('welcome');
})->name('welcome');

Route::get('/salons', [SalonController::class, 'index'])->name('salons.index');
Route::get('/salons/{salon}', [SalonController::class, 'show'])->name('salons.show');

// Authentication routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [UserController::class, 'showLogin'])->name('login');
    Route::post('/login', [UserController::class, 'login']);
    Route::get('/register', [UserController::class, 'showRegister'])->name('register');
    Route::post('/register', [UserController::class, 'register']);
});

Route::middleware('auth')->group(function () {
    // Logout
    Route::post('/logout', [UserController::class, 'logout'])->name('logout');
    
    // Dashboard
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');
    
    // Salon selection
    Route::get('/salon/select', [SalonController::class, 'select'])->name('salon.select');
    Route::post('/salon/select', [SalonController::class, 'storeSelection'])->name('salon.store-selection');
    
    // Appointments
    Route::resource('appointments', AppointmentController::class);
    Route::post('/appointments/{appointment}/confirm', [AppointmentController::class, 'confirm'])->name('appointments.confirm');
    Route::post('/appointments/{appointment}/complete', [AppointmentController::class, 'complete'])->name('appointments.complete');
    Route::get('/appointments/slots/{salon}', [AppointmentController::class, 'getAvailableSlots'])->name('appointments.slots');
    
    // Services
    Route::resource('services', ServiceController::class);
    
    // Team management (admin only)
    Route::middleware('role:admin')->group(function () {
        Route::resource('team', TeamController::class);
        Route::post('/team/invite', [TeamController::class, 'invite'])->name('team.invite');
        Route::post('/team/{user}/role', [TeamController::class, 'updateRole'])->name('team.update-role');
    });
    
    // Customers
    Route::resource('customers', CustomerController::class);
    Route::get('/customers/{customer}/appointments', [CustomerController::class, 'appointments'])->name('customers.appointments');
    Route::get('/customers/{customer}/reviews', [CustomerController::class, 'reviews'])->name('customers.reviews');
    
    // Shop
    Route::resource('shop', ShopController::class);
    Route::resource('orders', OrderController::class);
    Route::resource('gift-cards', GiftCardController::class);
    Route::post('/gift-cards/{giftCard}/redeem', [GiftCardController::class, 'redeem'])->name('gift-cards.redeem');
    
    // Payments
    Route::post('/payments/stripe', [PaymentController::class, 'stripe'])->name('payments.stripe');
    Route::post('/payments/paypal', [PaymentController::class, 'paypal'])->name('payments.paypal');
    Route::get('/payments/success', [PaymentController::class, 'success'])->name('payments.success');
    Route::get('/payments/cancel', [PaymentController::class, 'cancel'])->name('payments.cancel');
    
    // Chat
    Route::resource('chat', ChatController::class);
    Route::post('/chat/{chat}/messages', [ChatController::class, 'storeMessage'])->name('chat.messages.store');
    Route::get('/chat/{chat}/messages', [ChatController::class, 'getMessages'])->name('chat.messages.index');
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    
    // AI Features
    Route::get('/ai/suggestions', [AiController::class, 'suggestions'])->name('ai.suggestions');
    Route::post('/ai/analyze', [AiController::class, 'analyze'])->name('ai.analyze');
    Route::get('/chatbot', [ChatbotController::class, 'index'])->name('chatbot.index');
    Route::post('/chatbot/message', [ChatbotController::class, 'message'])->name('chatbot.message');
    
    // Analytics (admin only)
    Route::middleware('role:admin')->group(function () {
        Route::get('/analytics/dashboard', [AnalyticsController::class, 'dashboard'])->name('analytics.dashboard');
        Route::get('/analytics/reports', [AnalyticsController::class, 'reports'])->name('analytics.reports');
        Route::get('/analytics/export', [AnalyticsController::class, 'export'])->name('analytics.export');
        Route::post('/analytics/export', [ExportController::class, 'export'])->name('export.generate');
    });
    
    // Backups (admin only)
    Route::middleware('role:admin')->group(function () {
        Route::resource('backups', BackupController::class);
        Route::post('/backups/create', [BackupController::class, 'create'])->name('backups.create');
        Route::get('/backups/{backup}/download', [BackupController::class, 'download'])->name('backups.download');
    });
    
    // DSGVO (admin only)
    Route::middleware('role:admin')->group(function () {
        Route::get('/dsgvo', [DsgvoController::class, 'index'])->name('dsgvo.index');
        Route::post('/dsgvo/download', [DsgvoController::class, 'download'])->name('dsgvo.download');
        Route::post('/dsgvo/delete', [DsgvoController::class, 'delete'])->name('dsgvo.delete');
    });
    
    // Invoices
    Route::resource('invoices', InvoiceController::class);
    Route::get('/invoices/{invoice}/pdf', [InvoiceController::class, 'pdf'])->name('invoices.pdf');
    
    // Subscriptions
    Route::resource('subscriptions', SubscriptionController::class);
    Route::post('/subscriptions/{subscription}/cancel', [SubscriptionController::class, 'cancel'])->name('subscriptions.cancel');
    Route::post('/subscriptions/{subscription}/reactivate', [SubscriptionController::class, 'reactivate'])->name('subscriptions.reactivate');
    
    // Profile
    Route::get('/profile', [UserController::class, 'profile'])->name('profile.show');
    Route::put('/profile', [UserController::class, 'updateProfile'])->name('profile.update');
    Route::put('/profile/password', [UserController::class, 'updatePassword'])->name('profile.password');
    
    // Salon settings
    Route::get('/salon/settings', [SalonController::class, 'settings'])->name('salon.settings');
    Route::put('/salon/settings', [SalonController::class, 'updateSettings'])->name('salon.settings.update');
    
    // Settings
    Route::get('/settings', function () {
        return view('settings.index');
    })->name('settings.index');
});

// API Routes for AJAX requests
Route::middleware('auth:sanctum')->prefix('api')->group(function () {
    Route::get('/appointments/calendar', [AppointmentController::class, 'calendar'])->name('api.appointments.calendar');
    Route::get('/appointments/available-slots', [AppointmentController::class, 'getAvailableSlots'])->name('api.appointments.slots');
    Route::post('/appointments/check-conflicts', [AppointmentController::class, 'checkConflicts'])->name('api.appointments.conflicts');
    
    Route::get('/salons/nearby', [SalonController::class, 'nearby'])->name('api.salons.nearby');
    Route::get('/salons/search', [SalonController::class, 'search'])->name('api.salons.search');
    
    Route::get('/services/by-category', [ServiceController::class, 'byCategory'])->name('api.services.by-category');
    
    Route::get('/analytics/chart-data', [AnalyticsController::class, 'chartData'])->name('api.analytics.chart-data');
    Route::get('/analytics/revenue', [AnalyticsController::class, 'revenue'])->name('api.analytics.revenue');
    
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('api.notifications.mark-all-read');
    
    Route::post('/chat/send-message', [ChatController::class, 'sendMessage'])->name('api.chat.send');
    Route::get('/chat/unread-count', [ChatController::class, 'unreadCount'])->name('api.chat.unread-count');
});

// PWA Routes
Route::get('/manifest.json', function () {
    return response()->json([
        'name' => 'SalonManager',
        'short_name' => 'SalonManager',
        'description' => 'Salon Management System',
        'start_url' => '/',
        'display' => 'standalone',
        'background_color' => '#ffffff',
        'theme_color' => '#7C3AED',
        'icons' => [
            [
                'src' => asset('images/icons/icon-192x192.png'),
                'sizes' => '192x192',
                'type' => 'image/png'
            ],
            [
                'src' => asset('images/icons/icon-512x512.png'),
                'sizes' => '512x512',
                'type' => 'image/png'
            ]
        ]
    ]);
})->name('manifest');

Route::get('/service-worker.js', function () {
    return response()->view('service-worker')->header('Content-Type', 'application/javascript');
})->name('service-worker');

// Fallback route for SPA
Route::fallback(function () {
    return view('app');
}); 