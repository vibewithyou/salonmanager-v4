<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Notification;
use App\Mail\AppointmentReminder;
use App\Mail\AppointmentConfirmation;
use App\Mail\AppointmentCancellation;
use Carbon\Carbon;

class NotificationController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('notifications.index', compact('notifications'));
    }

    public function markAsRead(Request $request)
    {
        $request->validate([
            'notification_id' => 'required|exists:notifications,id',
        ]);

        $user = Auth::user();
        $notification = Notification::where('id', $request->notification_id)
            ->where('user_id', $user->id)
            ->first();

        if ($notification) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json(['success' => true]);
    }

    public function markAllAsRead()
    {
        $user = Auth::user();
        
        Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    public function getUnreadCount()
    {
        $user = Auth::user();
        
        $unreadCount = Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return response()->json(['unread_count' => $unreadCount]);
    }

    public function sendAppointmentReminder(Appointment $appointment)
    {
        $customer = $appointment->customer;
        $stylist = $appointment->stylist;
        $salon = $appointment->salon;

        // Send email reminder
        Mail::to($customer->email)->send(new AppointmentReminder($appointment));

        // Send push notification
        $this->sendPushNotification($customer, [
            'title' => 'Termin-Erinnerung',
            'body' => "Ihr Termin bei {$stylist->name} ist morgen um {$appointment->start_time->format('H:i')} Uhr.",
            'data' => [
                'type' => 'appointment_reminder',
                'appointment_id' => $appointment->id,
                'salon_id' => $salon->id,
            ],
        ]);

        // Create notification record
        Notification::create([
            'user_id' => $customer->id,
            'type' => 'appointment_reminder',
            'title' => 'Termin-Erinnerung',
            'message' => "Ihr Termin bei {$stylist->name} ist morgen um {$appointment->start_time->format('H:i')} Uhr.",
            'data' => [
                'appointment_id' => $appointment->id,
                'stylist_name' => $stylist->name,
                'appointment_time' => $appointment->start_time->format('H:i'),
            ],
        ]);

        // Update appointment reminder status
        $appointment->update(['reminder_sent' => true]);

        return response()->json(['success' => true]);
    }

    public function sendAppointmentConfirmation(Appointment $appointment)
    {
        $customer = $appointment->customer;
        $stylist = $appointment->stylist;
        $salon = $appointment->salon;

        // Send email confirmation
        Mail::to($customer->email)->send(new AppointmentConfirmation($appointment));

        // Send push notification
        $this->sendPushNotification($customer, [
            'title' => 'Termin bestätigt',
            'body' => "Ihr Termin bei {$stylist->name} wurde bestätigt.",
            'data' => [
                'type' => 'appointment_confirmation',
                'appointment_id' => $appointment->id,
                'salon_id' => $salon->id,
            ],
        ]);

        // Create notification record
        Notification::create([
            'user_id' => $customer->id,
            'type' => 'appointment_confirmation',
            'title' => 'Termin bestätigt',
            'message' => "Ihr Termin bei {$stylist->name} wurde bestätigt.",
            'data' => [
                'appointment_id' => $appointment->id,
                'stylist_name' => $stylist->name,
            ],
        ]);

        return response()->json(['success' => true]);
    }

    public function sendAppointmentCancellation(Appointment $appointment)
    {
        $customer = $appointment->customer;
        $stylist = $appointment->stylist;
        $salon = $appointment->salon;

        // Send email cancellation
        Mail::to($customer->email)->send(new AppointmentCancellation($appointment));

        // Send push notification
        $this->sendPushNotification($customer, [
            'title' => 'Termin storniert',
            'body' => "Ihr Termin bei {$stylist->name} wurde storniert.",
            'data' => [
                'type' => 'appointment_cancellation',
                'appointment_id' => $appointment->id,
                'salon_id' => $salon->id,
            ],
        ]);

        // Create notification record
        Notification::create([
            'user_id' => $customer->id,
            'type' => 'appointment_cancellation',
            'title' => 'Termin storniert',
            'message' => "Ihr Termin bei {$stylist->name} wurde storniert.",
            'data' => [
                'appointment_id' => $appointment->id,
                'stylist_name' => $stylist->name,
            ],
        ]);

        return response()->json(['success' => true]);
    }

    public function sendBulkNotification(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
            'type' => 'required|string|in:general,promotion,update',
        ]);

        $users = User::whereIn('id', $request->user_ids)->get();

        foreach ($users as $user) {
            // Send push notification
            $this->sendPushNotification($user, [
                'title' => $request->title,
                'body' => $request->message,
                'data' => [
                    'type' => $request->type,
                    'salon_id' => $user->salon_id,
                ],
            ]);

            // Create notification record
            Notification::create([
                'user_id' => $user->id,
                'type' => $request->type,
                'title' => $request->title,
                'message' => $request->message,
                'data' => [
                    'bulk_notification' => true,
                ],
            ]);
        }

        return response()->json(['success' => true, 'sent_to' => count($users)]);
    }

    public function sendPromotionalNotification(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
            'promotion_type' => 'required|string|in:discount,special_offer,new_service',
            'discount_percentage' => 'nullable|integer|min:1|max:100',
            'valid_until' => 'nullable|date|after:today',
        ]);

        $user = Auth::user();
        $salon = $user->salon;

        // Get all customers of the salon
        $customers = User::where('salon_id', $salon->id)
            ->where('role', 'customer')
            ->where('is_active', true)
            ->get();

        $notificationData = [
            'promotion_type' => $request->promotion_type,
            'discount_percentage' => $request->discount_percentage,
            'valid_until' => $request->valid_until,
        ];

        foreach ($customers as $customer) {
            // Send push notification
            $this->sendPushNotification($customer, [
                'title' => $request->title,
                'body' => $request->message,
                'data' => [
                    'type' => 'promotion',
                    'salon_id' => $salon->id,
                    'promotion_data' => $notificationData,
                ],
            ]);

            // Create notification record
            Notification::create([
                'user_id' => $customer->id,
                'type' => 'promotion',
                'title' => $request->title,
                'message' => $request->message,
                'data' => $notificationData,
            ]);
        }

        return response()->json(['success' => true, 'sent_to' => count($customers)]);
    }

    private function sendPushNotification($user, $notification)
    {
        // This would integrate with a push notification service like Firebase
        // For now, we'll just log the notification
        \Log::info('Push notification sent', [
            'user_id' => $user->id,
            'notification' => $notification,
        ]);

        // In a real implementation, you would:
        // 1. Get the user's push token
        // 2. Send to Firebase/OneSignal/etc.
        // 3. Handle delivery status
    }

    public function getNotificationSettings()
    {
        $user = Auth::user();
        
        return response()->json([
            'settings' => [
                'email_notifications' => $user->preferences['email_notifications'] ?? true,
                'push_notifications' => $user->preferences['push_notifications'] ?? true,
                'appointment_reminders' => $user->preferences['appointment_reminders'] ?? true,
                'promotional_notifications' => $user->preferences['promotional_notifications'] ?? true,
                'reminder_hours_before' => $user->preferences['reminder_hours_before'] ?? 24,
            ],
        ]);
    }

    public function updateNotificationSettings(Request $request)
    {
        $request->validate([
            'email_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'appointment_reminders' => 'boolean',
            'promotional_notifications' => 'boolean',
            'reminder_hours_before' => 'integer|min:1|max:168',
        ]);

        $user = Auth::user();
        $preferences = $user->preferences ?? [];
        
        $preferences = array_merge($preferences, $request->only([
            'email_notifications',
            'push_notifications',
            'appointment_reminders',
            'promotional_notifications',
            'reminder_hours_before',
        ]));

        $user->update(['preferences' => $preferences]);

        return response()->json(['success' => true]);
    }

    public function deleteNotification(Request $request)
    {
        $request->validate([
            'notification_id' => 'required|exists:notifications,id',
        ]);

        $user = Auth::user();
        $notification = Notification::where('id', $request->notification_id)
            ->where('user_id', $user->id)
            ->first();

        if ($notification) {
            $notification->delete();
        }

        return response()->json(['success' => true]);
    }

    public function clearAllNotifications()
    {
        $user = Auth::user();
        
        Notification::where('user_id', $user->id)->delete();

        return response()->json(['success' => true]);
    }
} 