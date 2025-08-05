<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Appointment;
use App\Http\Controllers\NotificationController;
use Carbon\Carbon;

class SendAppointmentReminders extends Command
{
    protected $signature = 'appointments:send-reminders';
    protected $description = 'Send appointment reminders to customers';

    public function handle()
    {
        $this->info('Sending appointment reminders...');

        $tomorrow = Carbon::tomorrow();
        $appointments = Appointment::where('start_time', '>=', $tomorrow->startOfDay())
            ->where('start_time', '<=', $tomorrow->endOfDay())
            ->where('status', 'confirmed')
            ->where('reminder_sent', false)
            ->with(['customer', 'stylist', 'service', 'salon'])
            ->get();

        $count = 0;
        foreach ($appointments as $appointment) {
            try {
                $notificationController = new NotificationController();
                $notificationController->sendAppointmentReminder($appointment);
                $count++;
                $this->line("Reminder sent for appointment #{$appointment->id}");
            } catch (\Exception $e) {
                $this->error("Failed to send reminder for appointment #{$appointment->id}: " . $e->getMessage());
            }
        }

        $this->info("Successfully sent {$count} reminders.");
    }
} 